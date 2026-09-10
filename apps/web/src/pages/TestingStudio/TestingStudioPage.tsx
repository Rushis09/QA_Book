import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, List, ListItemButton, ListItemText,
  Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import type { Project } from "../../types/project";
import type { ExecutionMethod, StudioScenario, StudioTestCase, TestingType } from "../../types/testingStudio";
import { projectService } from "../../services/projectService";
import { testingStudioService } from "../../services/testingStudioService";
import TestingStudioForm, { defaultStudioValue, type StudioFormValue, typeDefaults } from "../../components/testingStudio/TestingStudioForm";
import { useNotification } from "../../contexts/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";

const TYPES: { value: TestingType; label: string; description: string }[] = [
  { value: "FUNCTIONAL", label: "Manual Functional & UI/UX", description: "Structured manual steps, environment and evidence." },
  { value: "API", label: "API Integration", description: "Endpoints, payloads, headers and response assertions." },
  { value: "DATABASE", label: "Database", description: "SQL verification and expected column mappings." },
  { value: "AUTOMATION", label: "Automation", description: "Framework, script, repository and result ingestion metadata." },
  { value: "PERFORMANCE", label: "Performance & Load", description: "Load profile and measurable SLA benchmarks." },
  { value: "SECURITY", label: "Security", description: "OWASP category, vector, payload and defensive expectation." },
  { value: "ACCESSIBILITY", label: "Accessibility (A11y)", description: "WCAG clause, assistive technology and audit checks." },
];

const emptyCore = { scenario_id: 0, module: "", priority: "Medium", status: "Draft", title: "", description: "", preconditions: "", test_data: "", expected_result: "", execution_method: "MANUAL" as ExecutionMethod };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export default function TestingStudioPage() {
  const { id } = useParams(); const projectId = Number(id); const navigate = useNavigate(); const { showNotification } = useNotification();
  const [project, setProject] = useState<Project | null>(null); const [scenarios, setScenarios] = useState<StudioScenario[]>([]); const [cases, setCases] = useState<StudioTestCase[]>([]);
  const [type, setType] = useState<TestingType>("FUNCTIONAL"); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<StudioTestCase | null>(null); const [dialogType, setDialogType] = useState<TestingType>("FUNCTIONAL"); const [form, setForm] = useState<StudioFormValue>({ ...emptyCore, attributes: typeDefaults("FUNCTIONAL") }); const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  async function load() {
    try { setLoading(true); setError(""); const [p, s, c] = await Promise.all([projectService.getProject(projectId), testingStudioService.getScenarios(projectId), testingStudioService.getTestCases(projectId, type)]); setProject(p); setScenarios(s); setCases(c); } catch (e) { console.error(e); setError("Failed to load Testing Studio."); } finally { setLoading(false); }
  }
  useEffect(() => { if (projectId) load(); }, [projectId, type]);

  const typeMeta = TYPES.find(x => x.value === type)!;
  const filteredCases = cases;

  function openCreate() { const scenario = scenarios[0]; setEditing(null); setDialogType(type); setEvidenceFiles([]); setForm({ ...defaultStudioValue(scenario, type), attributes: typeDefaults(type) }); setOpen(true); }
  function openEdit(item: StudioTestCase) { const scenario = scenarios.find(s => s.id === item.scenario_id); setEditing(item); setDialogType(item.profile.testing_type); setEvidenceFiles([]); setForm({ scenario_id: item.scenario_id, module: item.module, priority: item.priority, status: item.status, title: item.title, description: item.description ?? "", preconditions: item.preconditions ?? "", test_data: item.test_data ?? "", expected_result: item.expected_result ?? "", execution_method: item.profile.execution_method, attributes: item.profile.meta_attributes }); if (!scenario) setForm(v => ({ ...v, module: item.module })); setOpen(true); }
  function changeDialogType(nextType: TestingType) { setDialogType(nextType); setForm(v => ({ ...v, execution_method: nextType === "AUTOMATION" || nextType === "PERFORMANCE" ? "EXTERNAL" : "MANUAL", attributes: typeDefaults(nextType) })); setEvidenceFiles([]); }

  async function save() {
    if (!form.title.trim()) { showNotification("Title is required.", "error"); return; }
    if (!form.scenario_id) { showNotification("Select a test scenario.", "error"); return; }
    try {
      setSaving(true);
      const request = { scenario_id: form.scenario_id, module: form.module, priority: form.priority, status: form.status, automation_eligibility: "Eligible", automation_status: "Not Automated", title: form.title.trim(), description: form.description || null, preconditions: form.preconditions || null, test_data: form.test_data || null, steps: null, expected_result: form.expected_result || null, profile: { testing_type: dialogType, execution_method: form.execution_method, meta_attributes: form.attributes } };
      const saved = editing ? await testingStudioService.updateTestCase(projectId, editing.id, request) : await testingStudioService.createTestCase(projectId, request);
      if (evidenceFiles.length) { await Promise.all(evidenceFiles.map(file => testingStudioService.uploadEvidence(saved.id, file))); }
      showNotification(editing ? "Testing Studio test case updated." : "Testing Studio test case created.", "success"); setOpen(false); await load();
    } catch (e: any) { console.error(e); showNotification(e?.response?.data?.detail || "Failed to save test case.", "error"); } finally { setSaving(false); }
  }
  async function remove(item: StudioTestCase) { if (!window.confirm(`Delete ${item.test_case_code}?`)) return; try { await testingStudioService.deleteTestCase(projectId, item.id); await load(); showNotification("Test case deleted.", "success"); } catch (e) { console.error(e); showNotification("Failed to delete test case.", "error"); } }
  async function exportCurrent() { try { const blob = await testingStudioService.exportTestCases(projectId, type); downloadBlob(blob, `${project?.project_code ?? "QABook"}_${type.toLowerCase()}_TestCases.xlsx`); } catch (e) { console.error(e); showNotification("Export failed.", "error"); } }
  async function exportAll() { try { const blob = await testingStudioService.exportTestCases(projectId); downloadBlob(blob, `${project?.project_code ?? "QABook"}_all-testing_TestCases.xlsx`); } catch (e) { console.error(e); showNotification("Export failed.", "error"); } }

  if (loading) return <Box sx={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress size={28} /></Box>;
  if (error || !project) return <Alert severity="error">{error || "Project not found."}</Alert>;

  return <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
      <Box><Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate(`/projects/${projectId}`)} sx={{ textTransform: "none", mb: .4 }}>Back to Project</Button><Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#101828" }}>{project.name} · Testing Studio</Typography><Typography sx={{ fontSize: ".76rem", color: "#667085", mt: .3 }}>One STLC workspace for multiple testing disciplines. QABook remains the source of truth; Excel is generated output.</Typography></Box>
      <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={exportCurrent} sx={{ textTransform: "none" }}>Export {typeMeta.label}</Button><Button variant="outlined" onClick={exportAll} sx={{ textTransform: "none" }}>Export All Types</Button><Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate} sx={{ textTransform: "none" }}>New Test Case</Button></Stack>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "230px 1fr" }, gap: 1.5, alignItems: "start" }}>
      <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: "10px", overflow: "hidden" }}><Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: .8 }}><ScienceOutlinedIcon sx={{ fontSize: 19, color: "#1677ff" }} /><Typography sx={{ fontWeight: 750, fontSize: ".8rem" }}>Testing Types</Typography></Box><Divider /><List disablePadding>{TYPES.map(item => <ListItemButton key={item.value} selected={type === item.value} onClick={() => setType(item.value)} sx={{ py: 1, px: 1.5 }}><ListItemText primary={item.label} secondary={item.description} slotProps={{ primary: { sx: { fontSize: ".72rem", fontWeight: 700 } }, secondary: { sx: { fontSize: ".61rem", lineHeight: 1.3, mt: .2 } } }} /></ListItemButton>)}</List></Paper>
      <Paper elevation={0} sx={{ border: "1px solid #e4e7ec", borderRadius: "10px", overflow: "hidden" }}><Box sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}><Box><Typography sx={{ fontSize: ".92rem", fontWeight: 800 }}>{typeMeta.label}</Typography><Typography sx={{ fontSize: ".68rem", color: "#667085", mt: .25 }}>{typeMeta.description}</Typography></Box><Chip size="small" label={`${filteredCases.length} test cases`} /></Box><Divider />{filteredCases.length === 0 ? <Box sx={{ p: 5, textAlign: "center" }}><Typography sx={{ fontSize: ".82rem", fontWeight: 700 }}>No {typeMeta.label} test cases yet.</Typography><Button startIcon={<AddOutlinedIcon />} onClick={openCreate} sx={{ mt: 1, textTransform: "none" }}>Create the first one</Button></Box> : <List>{filteredCases.map(item => <ListItemButton key={item.id} sx={{ px: 1.5, py: 1.15, borderBottom: "1px solid #f0f2f5" }}><ListItemText primary={<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}><Typography sx={{ fontSize: ".72rem", fontWeight: 800 }}>{item.test_case_code}</Typography><Chip size="small" label={item.priority} sx={{ height: 20, fontSize: ".58rem" }} /><Chip size="small" label={item.profile.execution_method} sx={{ height: 20, fontSize: ".58rem" }} /></Box>} secondary={item.title} slotProps={{ primary: { sx: { mb: .25 } }, secondary: { sx: { fontSize: ".72rem", color: "#344054" } } }} /><Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(item)}><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip></ListItemButton>)}</List> }</Paper>
    </Box>
    <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="lg"><DialogTitle sx={{ fontSize: "1rem", fontWeight: 800 }}>{editing ? `Edit ${editing.test_case_code}` : `New ${TYPES.find(x => x.value === dialogType)?.label ?? "Test Case"} Test Case`}</DialogTitle><Divider /><DialogContent sx={{ background: "#f8fafc" }}><TestingStudioForm value={form} scenarios={scenarios} type={dialogType} onTypeChange={changeDialogType} evidenceFiles={evidenceFiles} onEvidence={setEvidenceFiles} onChange={setForm} /></DialogContent><Divider /><DialogActions><Button onClick={() => setOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button><Button variant="contained" onClick={save} disabled={saving} sx={{ textTransform: "none" }}>{saving ? "Saving..." : "Save Test Case"}</Button></DialogActions></Dialog>
  </Box>;
}
