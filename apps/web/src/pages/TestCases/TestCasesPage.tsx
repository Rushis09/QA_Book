import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestCaseDialog from "../../components/testCases/TestCaseDialog";
import TestCaseTable from "../../components/testCases/TestCaseTable";
import GenerateTestCaseDialog from "../../components/testCases/GenerateTestCaseDialog";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { requirementService } from "../../services/requirementService";
import { testCaseService } from "../../services/testCaseService";
import { testScenarioService } from "../../services/testScenarioService";

import type { Project } from "../../types/project";
import type { Requirement } from "../../types/requirement";
import type { TestCase, TestingType } from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";
import type { TestScenario } from "../../types/testScenario";

interface MetricCardProps {
  icon: ReactNode;
  value: number;
  label: string;
}

function MetricCard({
  icon,
  value,
  label,
}: MetricCardProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: 72,
        px: 1.6,
        py: 1.25,
        border: "1px solid #e4e7ec",
        borderRadius: "10px",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          backgroundColor: "#edf5ff",
          color: "#1677ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
            lineHeight: 1.15,
            color: "#101828",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: "0.7rem",
            lineHeight: 1.2,
            color: "#667085",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
    useState<number[]>([]);

  const [selectedScenarioIds, setSelectedScenarioIds] =
    useState<number[]>([]);

  const [selectedAutomationEligibility, setSelectedAutomationEligibility] =
    useState("");

  const [selectedAutomationStatus, setSelectedAutomationStatus] =
    useState("");

  const [selectedTestingType, setSelectedTestingType] =
    useState<TestingType | "">("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Code");

  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);

  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCase | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [testCaseToDelete, setTestCaseToDelete] =
    useState<TestCase | null>(null);

  const [bulkDeleteTestCases, setBulkDeleteTestCases] =
    useState<TestCase[]>([]);

  const [selectedTestCaseIds, setSelectedTestCaseIds] =
    useState<number[]>([]);

  const { showNotification } = useNotification();

  const {
    selectedProject,
    isAllProjects,
    projects: workspaceProjects,
  } = useWorkspace();

  async function loadData() {
    if (!selectedProject && !isAllProjects) {
      setTestCases([]);
      setScenarios([]);
      setRequirements([]);
      setProjects([]);
      setSelectedRequirementIds([]);
      setSelectedScenarioIds([]);
      setSelectedAutomationEligibility("");
      setSelectedAutomationStatus("");
      setSelectedTestingType("");
      setSelectedTestCaseIds([]);
      setError("");
      setCasesLoading(false);
      setLoading(false);
      return;
    }

    const projectId = selectedProject?.id;

    // Do not block the page while data loads.
    // Keep a dedicated loading state for the Test Cases section so the
    // page never flashes "No test cases" while the API is still loading.
    setLoading(false);
    setCasesLoading(true);
    setError("");

    try {
      const [
        testCaseData,
        scenarioData,
        requirementData,
      ] = await Promise.all([
        testCaseService.getTestCases(projectId),
        testScenarioService.getTestScenarios(projectId),
        requirementService.getRequirements(projectId),
      ]);

      setTestCases(testCaseData);
      setScenarios(scenarioData);
      setRequirements(requirementData);
    } catch (error) {
      console.error(error);
      setError("Failed to load test cases.");
    } finally {
      setCasesLoading(false);
    }
  }

  useEffect(() => {
    setProjects(workspaceProjects);

    setSelectedRequirementIds([]);
    setSelectedScenarioIds([]);
    setSelectedAutomationEligibility("");
    setSelectedAutomationStatus("");
    setSelectedTestingType("");
    setSelectedTestCaseIds([]);

    void loadData();
  }, [
    selectedProject?.id,
    isAllProjects,
  ]);

  const filteredScenarios = useMemo(() => {
    if (selectedRequirementIds.length === 0) {
      return scenarios;
    }

    return scenarios.filter((scenario) =>
      selectedRequirementIds.includes(
        scenario.requirement_id,
      ),
    );
  }, [selectedRequirementIds, scenarios]);

  useEffect(() => {
    setSelectedScenarioIds((previous) => {
      const next = previous.filter((id) =>
        filteredScenarios.some(
          (scenario) => scenario.id === id,
        ),
      );

      if (next.length === previous.length) {
        return previous;
      }

      return next;
    });
  }, [filteredScenarios]);

  const filteredTestCases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = testCases.filter((testCase) => {
      const scenario = scenarios.find(
        (item) => item.id === testCase.scenario_id,
      );

      if (!scenario) {
        return false;
      }

      const matchesRequirement =
        selectedRequirementIds.length === 0 ||
        selectedRequirementIds.includes(
          scenario.requirement_id,
        );

      const matchesScenario =
        selectedScenarioIds.length === 0 ||
        selectedScenarioIds.includes(
          scenario.id,
        );

      const matchesAutomationEligibility =
        selectedAutomationEligibility === "" ||
        testCase.automation_eligibility ===
          selectedAutomationEligibility;

      const matchesAutomationStatus =
        selectedAutomationStatus === "" ||
        testCase.automation_status ===
          selectedAutomationStatus;

      const caseTestingType =
        testCase.profile?.testing_type ?? "FUNCTIONAL";

      const matchesTestingType =
        selectedTestingType === "" ||
        caseTestingType === selectedTestingType;

      const matchesSearch =
        normalizedSearch === "" ||
        [
          testCase.test_case_code,
          testCase.title,
          testCase.description,
          scenario.scenario_code,
          scenario.title,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedSearch),
          );

      return (
        matchesRequirement &&
        matchesScenario &&
        matchesAutomationEligibility &&
        matchesAutomationStatus &&
        matchesTestingType &&
        matchesSearch
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "Title") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "Testing Type") {
        return (
          a.profile?.testing_type ?? "FUNCTIONAL"
        ).localeCompare(
          b.profile?.testing_type ?? "FUNCTIONAL",
        );
      }

      if (sortBy === "Execution Method") {
        return (
          a.profile?.execution_method ?? "MANUAL"
        ).localeCompare(
          b.profile?.execution_method ?? "MANUAL",
        );
      }

      if (sortBy === "Automation Status") {
        return (
          (a.automation_status || "").localeCompare(
            b.automation_status || "",
          )
        );
      }

      if (sortBy === "Eligibility") {
        return (
          (a.automation_eligibility || "").localeCompare(
            b.automation_eligibility || "",
          )
        );
      }

      return a.test_case_code.localeCompare(
        b.test_case_code,
      );
    });
  }, [
    testCases,
    scenarios,
    selectedRequirementIds,
    selectedScenarioIds,
    selectedAutomationEligibility,
    selectedAutomationStatus,
    selectedTestingType,
    search,
    sortBy,
  ]);

  const totalTestCases = testCases.length;

  const automatedCount = testCases.filter(
    (testCase) =>
      testCase.automation_status === "Automated",
  ).length;

  const eligibleCount = testCases.filter(
    (testCase) =>
      testCase.automation_eligibility === "Eligible",
  ).length;

  const notSuitableCount = testCases.filter(
    (testCase) =>
      testCase.automation_eligibility === "Not Suitable",
  ).length;

  function handleEdit(testCase: TestCase) {
    setSelectedTestCase(testCase);
    setOpenDialog(true);
  }

  function handleDelete(testCase: TestCase) {
    setTestCaseToDelete(testCase);
    setConfirmOpen(true);
  }

  function handleBulkDelete() {
    const selectedCases = testCases.filter((testCase) =>
      selectedTestCaseIds.includes(testCase.id),
    );

    if (selectedCases.length === 0) {
      return;
    }

    setTestCaseToDelete(null);
    setBulkDeleteTestCases(selectedCases);
    setConfirmOpen(true);
  }

  async function handleSave(data: TestCaseFormData) {
    const payload = {
      scenario_id: data.scenario_id,
      module: data.module,
      priority: data.priority,
      status: data.status,
      automation_eligibility: data.automation_eligibility,
      automation_status: data.automation_status,
      title: data.title,
      description: data.description || null,
      preconditions: data.preconditions || null,
      test_data: data.test_data || null,
      steps: data.steps || null,
      expected_result: data.expected_result || null,
      profile: {
        testing_type: data.testing_type,
        execution_method: data.execution_method,
        meta_attributes: data.meta_attributes,
      },
    };

    if (selectedTestCase) {
      await testCaseService.updateTestCase(
        selectedTestCase.id,
        payload,
      );

      showNotification(
        "Test case updated successfully.",
        "success",
      );
    } else {
      await testCaseService.createTestCase(payload);

      showNotification(
        "Test case created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestCase(null);
    setOpenDialog(false);
  }

  const handleRequirementChange = (
    event: SelectChangeEvent<number[]>,
  ) => {
    const value = event.target.value as number[];

    if (value.includes(-1)) {
      setSelectedRequirementIds([]);
      return;
    }

    setSelectedRequirementIds(
      value.filter((id) => id !== -1),
    );
  };

  const handleScenarioChange = (
    event: SelectChangeEvent<number[]>,
  ) => {
    const value = event.target.value as number[];

    if (value.includes(-1)) {
      setSelectedScenarioIds([]);
      return;
    }

    setSelectedScenarioIds(
      value.filter((id) => id !== -1),
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Test Cases"
        actionLabel="New Test Case"
        onAction={() => {
          /*
           * A Test Case can now be opened without a
           * pre-selected Scenario.
           *
           * If exactly one Scenario is selected on the
           * page, it is still passed into the dialog and
           * pre-populated.
           */
          setSelectedTestCase(null);
          setOpenDialog(true);
        }}
        secondaryActionLabel="✨ Generate with AI"
        onSecondaryAction={() => {
          if (selectedScenarioIds.length === 0) {
            showNotification(
              "Please select at least one scenario to generate test cases.",
              "warning",
            );
            return;
          }

          setOpenGenerateDialog(true);
        }}
        selectionCount={selectedTestCaseIds.length}
        selectionActions={
          selectedTestCaseIds.length === 1
            ? [
                {
                  label: "Edit",
                  onClick: () => {
                    const testCase = testCases.find(
                      (tc) =>
                        tc.id === selectedTestCaseIds[0],
                    );

                    if (testCase) {
                      handleEdit(testCase);
                    }
                  },
                },
                {
                  label: "Delete",
                  color: "error",
                  onClick: () => {
                    const testCase = testCases.find(
                      (tc) =>
                        tc.id === selectedTestCaseIds[0],
                    );

                    if (testCase) {
                      handleDelete(testCase);
                    }
                  },
                },
                {
                  label: "Clear Selection",
                  variant: "outlined",
                  onClick: () => {
                    setSelectedTestCaseIds([]);
                  },
                },
              ]
            : selectedTestCaseIds.length > 1
              ? [
                  {
                    label: "Delete Selected",
                    color: "error",
                    onClick: handleBulkDelete,
                  },
                  {
                    label: "Clear Selection",
                    variant: "outlined",
                    onClick: () => {
                      setSelectedTestCaseIds([]);
                    },
                  },
                ]
              : undefined
        }
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            mb: 1.5,
            width: "100%",
          }}
        >
          <MetricCard
            icon={
              <AssignmentOutlinedIcon
                sx={{ fontSize: 20 }}
              />
            }
            value={totalTestCases}
            label="Total Test Cases"
          />

          <MetricCard
            icon={
              <AutoAwesomeOutlinedIcon
                sx={{ fontSize: 20 }}
              />
            }
            value={automatedCount}
            label="Automated"
          />

          <MetricCard
            icon={
              <CheckCircleOutlineOutlinedIcon
                sx={{ fontSize: 20 }}
              />
            }
            value={eligibleCount}
            label="Automation Eligible"
          />

          <MetricCard
            icon={
              <TuneOutlinedIcon
                sx={{ fontSize: 20 }}
              />
            }
            value={notSuitableCount}
            label="Not Suitable"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.25,
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search test cases..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            sx={{
              width: 262,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
              "& input": {
                py: 0.75,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlinedIcon
                    sx={{
                      fontSize: 18,
                      color: "#98a2b3",
                      mr: 0.75,
                    }}
                  />
                ),
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              width: 200,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel shrink>
              Requirements
            </InputLabel>

            <Select
              multiple
              displayEmpty
              value={selectedRequirementIds}
              onChange={handleRequirementChange}
              input={
                <OutlinedInput label="Requirements" />
              }
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return "All Requirements";
                }

                const selectedRequirements =
                  requirements.filter((requirement) =>
                    selected.includes(requirement.id),
                  );

                if (selectedRequirements.length === 1) {
                  return selectedRequirements[0]
                    .requirement_code;
                }

                return `${selectedRequirements.length} Requirements`;
              }}
            >
              <MenuItem value={-1}>
                <Checkbox
                  checked={
                    selectedRequirementIds.length === 0
                  }
                  size="small"
                />
                <ListItemText primary="All Requirements" />
              </MenuItem>

              {requirements.map((requirement) => (
                <MenuItem
                  key={requirement.id}
                  value={requirement.id}
                >
                  <Checkbox
                    checked={selectedRequirementIds.includes(
                      requirement.id,
                    )}
                    size="small"
                  />
                  <ListItemText
                    primary={`${requirement.requirement_code} - ${requirement.module}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: 200,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel shrink>
              Scenarios
            </InputLabel>

            <Select
              multiple
              displayEmpty
              value={selectedScenarioIds}
              onChange={handleScenarioChange}
              input={
                <OutlinedInput label="Scenarios" />
              }
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return "All Scenarios";
                }

                const selectedScenarios =
                  filteredScenarios.filter((scenario) =>
                    selected.includes(scenario.id),
                  );

                if (selectedScenarios.length === 1) {
                  return selectedScenarios[0]
                    .scenario_code;
                }

                return `${selectedScenarios.length} Scenarios`;
              }}
            >
              <MenuItem value={-1}>
                <Checkbox
                  checked={
                    selectedScenarioIds.length === 0
                  }
                  size="small"
                />
                <ListItemText primary="All Scenarios" />
              </MenuItem>

              {filteredScenarios.map((scenario) => (
                <MenuItem
                  key={scenario.id}
                  value={scenario.id}
                >
                  <Checkbox
                    checked={selectedScenarioIds.includes(
                      scenario.id,
                    )}
                    size="small"
                  />
                  <ListItemText
                    primary={`${scenario.scenario_code} - ${scenario.title}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: 160,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel id="testing-type-label">
              Testing Type
            </InputLabel>

            <Select
              labelId="testing-type-label"
              value={selectedTestingType}
              onChange={(event) =>
                setSelectedTestingType(
                  event.target.value as TestingType | "",
                )
              }
              input={
                <OutlinedInput label="Testing Type" />
              }
            >
              <MenuItem value="">
                All Types
              </MenuItem>
              <MenuItem value="FUNCTIONAL">
                Functional
              </MenuItem>
              <MenuItem value="API">
                API
              </MenuItem>
              <MenuItem value="DATABASE">
                Database
              </MenuItem>
              <MenuItem value="PERFORMANCE">
                Performance
              </MenuItem>
              <MenuItem value="SECURITY">
                Security
              </MenuItem>
              <MenuItem value="ACCESSIBILITY">
                Accessibility
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel id="automation-status-label">
              Automation Status
            </InputLabel>

            <Select
              labelId="automation-status-label"
              value={selectedAutomationStatus}
              onChange={(event) =>
                setSelectedAutomationStatus(
                  event.target.value,
                )
              }
              input={
                <OutlinedInput label="Automation Status" />
              }
            >
              <MenuItem value="">
                All Status
              </MenuItem>
              <MenuItem value="Not Automated">
                Not Automated
              </MenuItem>
              <MenuItem value="Automated">
                Automated
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: 175,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel id="automation-eligibility-label">
              Automation Eligibility
            </InputLabel>

            <Select
              labelId="automation-eligibility-label"
              value={selectedAutomationEligibility}
              onChange={(event) =>
                setSelectedAutomationEligibility(
                  event.target.value,
                )
              }
              input={
                <OutlinedInput label="Automation Eligibility" />
              }
            >
              <MenuItem value="">
                All Eligibility
              </MenuItem>
              <MenuItem value="Eligible">
                Eligible
              </MenuItem>
              <MenuItem value="Not Suitable">
                Not Suitable
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              width: 155,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel id="sort-label">
              Sort by
            </InputLabel>

            <Select
              labelId="sort-label"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              input={
                <OutlinedInput label="Sort by" />
              }
            >
              <MenuItem value="Code">
                Sort by: Code
              </MenuItem>
              <MenuItem value="Title">
                Sort by: Title
              </MenuItem>
              <MenuItem value="Testing Type">
                Sort by: Testing Type
              </MenuItem>
              <MenuItem value="Execution Method">
                Sort by: Execution Method
              </MenuItem>
              <MenuItem value="Automation Status">
                Sort by: Automation Status
              </MenuItem>
              <MenuItem value="Eligibility">
                Sort by: Eligibility
              </MenuItem>
            </Select>
          </FormControl>

          <Typography
            sx={{
              ml: "auto",
              fontSize: "0.7rem",
              color: "#667085",
              whiteSpace: "nowrap",
            }}
          >
            {filteredTestCases.length} of{" "}
            {testCases.length} test cases
          </Typography>
        </Box>

        {casesLoading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.25,
              border: "1px solid #e4e7ec",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <CircularProgress size={28} />
            <Typography
              sx={{
                fontSize: "0.76rem",
                fontWeight: 650,
                color: "#667085",
              }}
            >
              Loading test cases...
            </Typography>
          </Box>
        ) : (
          <TestCaseTable
            testCases={filteredTestCases}
            selectedIds={selectedTestCaseIds}
            onSelectionChange={setSelectedTestCaseIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </PageHeader>

      <GenerateTestCaseDialog
        open={openGenerateDialog}
        projects={projects}
        requirements={requirements}
        scenarios={scenarios}
        selectedScenarioIds={selectedScenarioIds}
        onClose={() =>
          setOpenGenerateDialog(false)
        }
        onGenerated={loadData}
      />

      <TestCaseDialog
        title={
          selectedTestCase
            ? "Edit Test Case"
            : "New Test Case"
        }
        open={openDialog}
        requirements={requirements}
        scenarios={scenarios}
        selectedScenarioId={
          selectedScenarioIds[0] ?? 0
        }
        testCase={
          selectedTestCase ?? undefined
        }
        onClose={() => {
          setSelectedTestCase(null);
          setOpenDialog(false);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          bulkDeleteTestCases.length > 0
            ? "Delete Test Cases"
            : "Delete Test Case"
        }
        message={
          bulkDeleteTestCases.length > 0
            ? `Are you sure you want to delete ${bulkDeleteTestCases.length} test cases?`
            : testCaseToDelete
              ? `Are you sure you want to delete "${testCaseToDelete.test_case_code}"?`
              : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          try {
            if (bulkDeleteTestCases.length > 0) {
              await Promise.all(
                bulkDeleteTestCases.map((testCase) =>
                  testCaseService.deleteTestCase(
                    testCase.id,
                  ),
                ),
              );

              await loadData();

              showNotification(
                "Test cases deleted successfully.",
                "success",
              );

              setSelectedTestCaseIds([]);
              setBulkDeleteTestCases([]);
            } else if (testCaseToDelete) {
              await testCaseService.deleteTestCase(
                testCaseToDelete.id,
              );

              await loadData();

              showNotification(
                "Test case deleted successfully.",
                "success",
              );

              setSelectedTestCaseIds([]);
              setTestCaseToDelete(null);
            }

            setConfirmOpen(false);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test case(s).",
              "error",
            );

            setConfirmOpen(false);
            setTestCaseToDelete(null);
            setBulkDeleteTestCases([]);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestCaseToDelete(null);
          setBulkDeleteTestCases([]);
        }}
      />
    </>
  );
}