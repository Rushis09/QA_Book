import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Checkbox, Divider, FormControl, FormControlLabel, InputLabel, MenuItem,
  Select, Stack, TextField, Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { ExecutionMethod, StudioScenario, StudioStep, TestingType } from "../../types/testingStudio";

export interface StudioFormValue {
  scenario_id: number;
  module: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  preconditions: string;
  test_data: string;
  expected_result: string;
  execution_method: ExecutionMethod;
  attributes: Record<string, any>;
}

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "9px", backgroundColor: "#fff", fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.76rem" } };

export function defaultStudioValue(scenario?: StudioScenario, type: TestingType = "FUNCTIONAL"): StudioFormValue {
  return {
    scenario_id: scenario?.id ?? 0,
    module: scenario?.module ?? "",
    priority: "Medium",
    status: "Draft",
    title: "",
    description: "",
    preconditions: "",
    test_data: "",
    expected_result: "",
    execution_method: type === "AUTOMATION" || type === "PERFORMANCE" ? "EXTERNAL" : "MANUAL",
    attributes: typeDefaults(type),
  };
}

export function typeDefaults(type: TestingType): Record<string, any> {
  switch (type) {
    case "FUNCTIONAL": return { environment: "UAT", browser_os: [], steps: [{ step_no: 1, action: "", test_data: "", expected_result: "" }] };
    case "API": return { endpoint_url: "", http_method: "GET", headers: {}, request_body: {}, expected_status_code: 200, expected_response: {} };
    case "DATABASE": return { target_database: "", table_name: "", precondition_ui_action: "", verification_sql: "", expected_columns: [{ column: "", expected_value: "" }] };
    case "AUTOMATION": return { framework: "Playwright", script_identifier: "", git_repository: "", result_source: "UPLOAD", result_format: "JUnit XML", webhook_enabled: false };
    case "PERFORMANCE": return { tool: "k6", virtual_users: 10, ramp_up_seconds: 30, duration_seconds: 300, sla_benchmarks: { max_response_time_ms: 1000, max_error_rate_percent: 1, throughput: "" } };
    case "SECURITY": return { vulnerability_category: "A01 Broken Access Control", target_vector: "", attack_payload: "", expected_defensive_behavior: "", severity: "Medium", cwe_cve: "" };
    case "ACCESSIBILITY": return { wcag_clause: "WCAG 2.2 - 1.1.1 Non-text Content", assistive_technology: "Keyboard-only", audit_flags: { alt_text: false, contrast_ratio: false, tab_order: false, keyboard_access: false, labels: false } };
  }
}

function parseJson(value: string, fallback: any = {}) { try { return JSON.parse(value); } catch { return fallback; } }
function JsonField({ label, value, onChange }: { label: string; value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(JSON.stringify(value ?? {}, null, 2));
  useEffect(() => setText(JSON.stringify(value ?? {}, null, 2)), [value]);
  return <TextField label={label} fullWidth multiline minRows={5} value={text} onChange={e => { setText(e.target.value); const parsed = parseJson(e.target.value, null); if (parsed !== null) onChange(parsed); }} sx={fieldSx} helperText="Valid JSON is saved as structured data." />;
}

export default function TestingStudioForm({ value, scenarios, type, onChange, onTypeChange, evidenceFiles, onEvidence }: { value: StudioFormValue; scenarios: StudioScenario[]; type: TestingType; onChange: (v: StudioFormValue) => void; onTypeChange: (type: TestingType) => void; evidenceFiles: File[]; onEvidence: (files: File[]) => void }) {
  const selectedScenario = scenarios.find(s => s.id === value.scenario_id);
  const attrs = value.attributes;
  const setAttrs = (patch: Record<string, any>) => onChange({ ...value, attributes: { ...attrs, ...patch } });
  const steps: StudioStep[] = attrs.steps ?? [];

  const typeLabel = useMemo(() => ({ FUNCTIONAL: "Manual Functional & UI/UX", API: "API Integration", DATABASE: "Database", AUTOMATION: "Automation", PERFORMANCE: "Performance & Load", SECURITY: "Security", ACCESSIBILITY: "Accessibility" }[type]), [type]);

  return <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: "0.88rem", fontWeight: 750, color: "#172033" }}>{typeLabel} Test Case</Typography>
      <FormControl size="small" sx={{ minWidth: 230, ...fieldSx }}><InputLabel>Testing Type</InputLabel><Select value={type} label="Testing Type" onChange={e => onTypeChange(e.target.value as TestingType)}>{["FUNCTIONAL","API","DATABASE","AUTOMATION","PERFORMANCE","SECURITY","ACCESSIBILITY"].map(x => <MenuItem key={x} value={x}>{x.replaceAll("_", " ")}</MenuItem>)}</Select></FormControl>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
      <TextField label="Test Scenario" value={selectedScenario ? `${selectedScenario.scenario_code} - ${selectedScenario.title}` : ""} fullWidth sx={{ ...fieldSx, gridColumn: { xs: "auto", md: "1 / -1" } }} slotProps={{ input: { readOnly: true } }} />
      <TextField label="Module" value={value.module} fullWidth sx={fieldSx} slotProps={{ input: { readOnly: true } }} />
      <FormControl fullWidth sx={fieldSx}><InputLabel>Priority</InputLabel><Select value={value.priority} label="Priority" onChange={e => onChange({ ...value, priority: e.target.value })}><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></Select></FormControl>
      <TextField label="Title" required value={value.title} onChange={e => onChange({ ...value, title: e.target.value })} fullWidth sx={{ ...fieldSx, gridColumn: { xs: "auto", md: "1 / -1" } }} />
      <FormControl fullWidth sx={fieldSx}><InputLabel>Status</InputLabel><Select value={value.status} label="Status" onChange={e => onChange({ ...value, status: e.target.value })}><MenuItem value="Draft">Draft</MenuItem><MenuItem value="Ready">Ready</MenuItem><MenuItem value="Approved">Approved</MenuItem></Select></FormControl>
      <FormControl fullWidth sx={fieldSx}><InputLabel>Execution Method</InputLabel><Select value={value.execution_method} label="Execution Method" onChange={e => onChange({ ...value, execution_method: e.target.value as ExecutionMethod })}><MenuItem value="MANUAL">Manual</MenuItem><MenuItem value="AUTOMATED">Automated</MenuItem><MenuItem value="EXTERNAL">External Tool</MenuItem><MenuItem value="IMPORTED">Imported Result</MenuItem></Select></FormControl>
    </Box>
    <TextField label="Description" multiline minRows={2} fullWidth value={value.description} onChange={e => onChange({ ...value, description: e.target.value })} sx={{ ...fieldSx, mt: 1.5 }} />
    <Divider sx={{ my: 2 }} />

    {type === "FUNCTIONAL" && <Stack spacing={1.5}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        <FormControl fullWidth sx={fieldSx}><InputLabel>Environment</InputLabel><Select value={attrs.environment ?? ""} label="Environment" onChange={e => setAttrs({ environment: e.target.value })}><MenuItem value="Staging">Staging</MenuItem><MenuItem value="UAT">UAT</MenuItem><MenuItem value="Production">Production</MenuItem></Select></FormControl>
        <TextField label="Browser / OS" placeholder="Chrome / Windows, Safari / macOS" value={(attrs.browser_os ?? []).join(", ")} onChange={e => setAttrs({ browser_os: e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean) })} sx={fieldSx} />
      </Box>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 750 }}>Step Matrix</Typography>
      {steps.map((step, index) => <Box key={index} sx={{ display: "grid", gridTemplateColumns: "55px 1.3fr 1fr 1.3fr 40px", gap: 1, alignItems: "start" }}>
        <TextField size="small" label="#" value={step.step_no} onChange={e => { const next = [...steps]; next[index] = { ...step, step_no: Number(e.target.value) || index + 1 }; setAttrs({ steps: next }); }} sx={fieldSx} />
        <TextField size="small" label="Action" value={step.action} onChange={e => { const next = [...steps]; next[index] = { ...step, action: e.target.value }; setAttrs({ steps: next }); }} sx={fieldSx} />
        <TextField size="small" label="Test Data" value={step.test_data} onChange={e => { const next = [...steps]; next[index] = { ...step, test_data: e.target.value }; setAttrs({ steps: next }); }} sx={fieldSx} />
        <TextField size="small" label="Expected Result" value={step.expected_result} onChange={e => { const next = [...steps]; next[index] = { ...step, expected_result: e.target.value }; setAttrs({ steps: next }); }} sx={fieldSx} />
        <Button color="error" onClick={() => setAttrs({ steps: steps.filter((_: StudioStep, i: number) => i !== index) })}><DeleteOutlineOutlinedIcon fontSize="small" /></Button>
      </Box>)}
      <Button startIcon={<AddOutlinedIcon />} onClick={() => setAttrs({ steps: [...steps, { step_no: steps.length + 1, action: "", test_data: "", expected_result: "" }] })} sx={{ alignSelf: "flex-start", textTransform: "none" }}>Add Step</Button>
      <TextField label="Preconditions" multiline minRows={2} value={value.preconditions} onChange={e => onChange({ ...value, preconditions: e.target.value })} sx={fieldSx} />
      <Box onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onEvidence([...evidenceFiles, ...Array.from(e.dataTransfer.files)]); }} sx={{ border: "1px dashed #98a2b3", borderRadius: "10px", p: 2, background: "#fff", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("testing-evidence-input")?.click()}><Typography sx={{ fontSize: "0.76rem", fontWeight: 700 }}>Bug / Execution Evidence</Typography><Typography sx={{ mt: .4, fontSize: "0.68rem", color: "#667085" }}>Drag and drop screenshots or evidence files here, or click to browse.</Typography>{evidenceFiles.length > 0 && <Typography sx={{ mt: .8, fontSize: "0.68rem", color: "#344054" }}>{evidenceFiles.map(f => f.name).join(", ")}</Typography>}<input id="testing-evidence-input" hidden type="file" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.log" onChange={e => onEvidence([...evidenceFiles, ...Array.from(e.target.files ?? [])])} /></Box>
    </Stack>}

    {type === "API" && <Stack spacing={1.5}><TextField label="Endpoint URL" value={attrs.endpoint_url} onChange={e => setAttrs({ endpoint_url: e.target.value })} sx={fieldSx} /><FormControl sx={fieldSx}><InputLabel>HTTP Method</InputLabel><Select value={attrs.http_method} label="HTTP Method" onChange={e => setAttrs({ http_method: e.target.value })}>{["GET","POST","PUT","DELETE","PATCH"].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl><JsonField label="Headers" value={attrs.headers} onChange={v => setAttrs({ headers: v })} /><JsonField label="Request Body" value={attrs.request_body} onChange={v => setAttrs({ request_body: v })} /><TextField label="Expected Status Code" type="number" value={attrs.expected_status_code} onChange={e => setAttrs({ expected_status_code: Number(e.target.value) })} sx={fieldSx} /><JsonField label="Expected Response Validation" value={attrs.expected_response} onChange={v => setAttrs({ expected_response: v })} /></Stack>}

    {type === "DATABASE" && <Stack spacing={1.5}><TextField label="Target Database" value={attrs.target_database} onChange={e => setAttrs({ target_database: e.target.value })} sx={fieldSx} /><TextField label="Table Name" value={attrs.table_name} onChange={e => setAttrs({ table_name: e.target.value })} sx={fieldSx} /><TextField label="Pre-requisite UI Action" multiline minRows={2} value={attrs.precondition_ui_action} onChange={e => setAttrs({ precondition_ui_action: e.target.value })} sx={fieldSx} /><TextField label="Verification SQL Query" multiline minRows={5} value={attrs.verification_sql} onChange={e => setAttrs({ verification_sql: e.target.value })} sx={fieldSx} /><Typography sx={{ fontSize: "0.78rem", fontWeight: 750 }}>Expected Column / Value Mapping</Typography>{(attrs.expected_columns ?? []).map((item: any, i: number) => <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", gap: 1 }}><TextField label="Column" value={item.column} onChange={e => { const a = [...attrs.expected_columns]; a[i] = { ...item, column: e.target.value }; setAttrs({ expected_columns: a }); }} sx={fieldSx} /><TextField label="Expected Value" value={item.expected_value} onChange={e => { const a = [...attrs.expected_columns]; a[i] = { ...item, expected_value: e.target.value }; setAttrs({ expected_columns: a }); }} sx={fieldSx} /><Button color="error" onClick={() => setAttrs({ expected_columns: attrs.expected_columns.filter((_: any, x: number) => x !== i) })}><DeleteOutlineOutlinedIcon fontSize="small" /></Button></Box>)}<Button startIcon={<AddOutlinedIcon />} onClick={() => setAttrs({ expected_columns: [...(attrs.expected_columns ?? []), { column: "", expected_value: "" }] })} sx={{ alignSelf: "flex-start", textTransform: "none" }}>Add Mapping</Button></Stack>}

    {type === "AUTOMATION" && <Stack spacing={1.5}><FormControl sx={fieldSx}><InputLabel>Framework</InputLabel><Select value={attrs.framework} label="Framework" onChange={e => setAttrs({ framework: e.target.value })}>{["Playwright","Cypress","Selenium"].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl><TextField label="Script Identifier" value={attrs.script_identifier} onChange={e => setAttrs({ script_identifier: e.target.value })} sx={fieldSx} /><TextField label="Git Repository" value={attrs.git_repository} onChange={e => setAttrs({ git_repository: e.target.value })} sx={fieldSx} /><FormControl sx={fieldSx}><InputLabel>Result Source</InputLabel><Select value={attrs.result_source} label="Result Source" onChange={e => setAttrs({ result_source: e.target.value })}><MenuItem value="UPLOAD">Upload Report</MenuItem><MenuItem value="WEBHOOK">API Webhook</MenuItem></Select></FormControl><FormControl sx={fieldSx}><InputLabel>Report Format</InputLabel><Select value={attrs.result_format} label="Report Format" onChange={e => setAttrs({ result_format: e.target.value })}><MenuItem value="JUnit XML">JUnit XML</MenuItem><MenuItem value="Cucumber JSON">Cucumber JSON</MenuItem></Select></FormControl><FormControlLabel control={<Checkbox checked={Boolean(attrs.webhook_enabled)} onChange={e => setAttrs({ webhook_enabled: e.target.checked })} />} label="Webhook ingestion enabled" /></Stack>}

    {type === "PERFORMANCE" && <Stack spacing={1.5}><FormControl sx={fieldSx}><InputLabel>Tool</InputLabel><Select value={attrs.tool} label="Tool" onChange={e => setAttrs({ tool: e.target.value })}><MenuItem value="k6">k6</MenuItem><MenuItem value="JMeter">JMeter</MenuItem></Select></FormControl><Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}><TextField label="Virtual Users / Threads" type="number" value={attrs.virtual_users} onChange={e => setAttrs({ virtual_users: Number(e.target.value) })} sx={fieldSx} /><TextField label="Ramp-up Seconds" type="number" value={attrs.ramp_up_seconds} onChange={e => setAttrs({ ramp_up_seconds: Number(e.target.value) })} sx={fieldSx} /><TextField label="Duration Seconds" type="number" value={attrs.duration_seconds} onChange={e => setAttrs({ duration_seconds: Number(e.target.value) })} sx={fieldSx} /></Box><Typography sx={{ fontSize: "0.78rem", fontWeight: 750 }}>Expected SLA Benchmarks</Typography><Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}><TextField label="Max Response Time (ms)" type="number" value={attrs.sla_benchmarks.max_response_time_ms} onChange={e => setAttrs({ sla_benchmarks: { ...attrs.sla_benchmarks, max_response_time_ms: Number(e.target.value) } })} sx={fieldSx} /><TextField label="Max Error Rate (%)" type="number" value={attrs.sla_benchmarks.max_error_rate_percent} onChange={e => setAttrs({ sla_benchmarks: { ...attrs.sla_benchmarks, max_error_rate_percent: Number(e.target.value) } })} sx={fieldSx} /><TextField label="Throughput" value={attrs.sla_benchmarks.throughput} onChange={e => setAttrs({ sla_benchmarks: { ...attrs.sla_benchmarks, throughput: e.target.value } })} sx={fieldSx} /></Box></Stack>}

    {type === "SECURITY" && <Stack spacing={1.5}><FormControl sx={fieldSx}><InputLabel>Vulnerability Category</InputLabel><Select value={attrs.vulnerability_category} label="Vulnerability Category" onChange={e => setAttrs({ vulnerability_category: e.target.value })}>{["A01 Broken Access Control","A02 Cryptographic Failures","A03 Injection","A05 Security Misconfiguration","A07 Authentication Failures","A10 SSRF"].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl><TextField label="Target Vector / Input Component" value={attrs.target_vector} onChange={e => setAttrs({ target_vector: e.target.value })} sx={fieldSx} /><TextField label="Attack Payload" multiline minRows={3} value={attrs.attack_payload} onChange={e => setAttrs({ attack_payload: e.target.value })} sx={fieldSx} /><TextField label="Expected Defensive / Sanitization Behavior" multiline minRows={3} value={attrs.expected_defensive_behavior} onChange={e => setAttrs({ expected_defensive_behavior: e.target.value })} sx={fieldSx} /><Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}><TextField label="Severity" value={attrs.severity} onChange={e => setAttrs({ severity: e.target.value })} sx={fieldSx} /><TextField label="CWE / CVE" value={attrs.cwe_cve} onChange={e => setAttrs({ cwe_cve: e.target.value })} sx={fieldSx} /></Box></Stack>}

    {type === "ACCESSIBILITY" && <Stack spacing={1.5}><TextField label="WCAG Guideline Clause" value={attrs.wcag_clause} onChange={e => setAttrs({ wcag_clause: e.target.value })} sx={fieldSx} /><FormControl sx={fieldSx}><InputLabel>Assistive Technology</InputLabel><Select value={attrs.assistive_technology} label="Assistive Technology" onChange={e => setAttrs({ assistive_technology: e.target.value })}>{["NVDA","VoiceOver","Keyboard-only"].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl><Typography sx={{ fontSize: "0.78rem", fontWeight: 750 }}>Audit Checklist</Typography><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>{Object.entries(attrs.audit_flags ?? {}).map(([key, checked]) => <FormControlLabel key={key} control={<Checkbox checked={Boolean(checked)} onChange={e => setAttrs({ audit_flags: { ...attrs.audit_flags, [key]: e.target.checked } })} />} label={key.replaceAll("_", " ").replace(/^./, x => x.toUpperCase())} />)}</Box></Stack>}
  </Box>;
}
