import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestCaseDialog from "../../components/testCases/TestCaseDialog";
import TestCaseTable from "../../components/testCases/TestCaseTable";
import GenerateTestCaseDialog from "../../components/testCases/GenerateTestCaseDialog";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { projectService } from "../../services/projectService";
import { requirementService } from "../../services/requirementService";
import { testCaseService } from "../../services/testCaseService";
import { testScenarioService } from "../../services/testScenarioService";

import type { Project } from "../../types/project";
import type { Requirement } from "../../types/requirement";
import type { TestCase } from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";
import type { TestScenario } from "../../types/testScenario";

export default function TestCasesPage() {
  const [testCases, setTestCases] =
    useState<TestCase[]>([]);

  const [scenarios, setScenarios] =
    useState<TestScenario[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
    useState<number[]>([]);

  const [selectedScenarioIds, setSelectedScenarioIds] =
    useState<number[]>([]);

  const [selectedAutomationEligibility, setSelectedAutomationEligibility] =
    useState("");

  const [selectedAutomationStatus, setSelectedAutomationStatus] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [openGenerateDialog, setOpenGenerateDialog] =
    useState(false);

  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCase | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testCaseToDelete, setTestCaseToDelete] =
    useState<TestCase | null>(null);

  const [bulkDeleteTestCases, setBulkDeleteTestCases] =
    useState<TestCase[]>([]);

  const [selectedTestCaseIds, setSelectedTestCaseIds] =
    useState<number[]>([]);

  const { showNotification } =
    useNotification();

  const { selectedProject } =
    useWorkspace();

  async function loadData() {
    if (!selectedProject) {
      setTestCases([]);
      setScenarios([]);
      setRequirements([]);
      setProjects([]);
      setSelectedRequirementIds([]);
      setSelectedScenarioIds([]);
      setSelectedAutomationEligibility("");
      setSelectedAutomationStatus("");
      setSelectedTestCaseIds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        testCaseData,
        scenarioData,
        projectData,
        requirementData,
      ] = await Promise.all([
        testCaseService.getTestCases(
          selectedProject.id,
        ),
        testScenarioService.getTestScenarios(
          selectedProject.id,
        ),
        projectService.getProjects(),
        requirementService.getRequirements(
          selectedProject.id,
        ),
      ]);

      setTestCases(testCaseData);
      setScenarios(scenarioData);
      setProjects(projectData);
      setRequirements(requirementData);
      setSelectedRequirementIds([]);
      setSelectedScenarioIds([]);
      setSelectedAutomationEligibility("");
      setSelectedAutomationStatus("");
      setSelectedTestCaseIds([]);

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load test cases.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const filteredTestCases = testCases.filter(
    (testCase) => {
      const scenario = scenarios.find(
        (s) => s.id === testCase.scenario_id,
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

      return (
        matchesRequirement &&
        matchesScenario &&
        matchesAutomationEligibility &&
        matchesAutomationStatus
      );
    },
  );

  const filteredScenarios =
    selectedRequirementIds.length === 0
      ? scenarios
      : scenarios.filter((scenario) =>
          selectedRequirementIds.includes(
            scenario.requirement_id,
          ),
        );

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
  }, [selectedRequirementIds, scenarios]);

  function handleEdit(
    testCase: TestCase,
  ) {
    setSelectedTestCase(testCase);
    setOpenDialog(true);
  }

  function handleDelete(
    testCase: TestCase,
  ) {
    setTestCaseToDelete(testCase);
    setConfirmOpen(true);
  }

  function handleBulkDelete() {
    const selectedCases =
      testCases.filter((testCase) =>
        selectedTestCaseIds.includes(
          testCase.id,
        ),
      );

    if (selectedCases.length === 0) {
      return;
    }

    setTestCaseToDelete(null);
    setBulkDeleteTestCases(selectedCases);
    setConfirmOpen(true);
  }

  async function handleSave(
    data: TestCaseFormData,
  ) {
    if (selectedTestCase) {
      await testCaseService.updateTestCase(
        selectedTestCase.id,
        data,
      );

      showNotification(
        "Test case updated successfully.",
        "success",
      );
    } else {
      await testCaseService.createTestCase(
        data,
      );

      showNotification(
        "Test case created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestCase(null);
    setOpenDialog(false);
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
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

  return (
    <>
      <PageHeader
        title="Test Cases"
        actionLabel="New Test Case"
        onAction={() => {
          if (selectedScenarioIds.length !== 1) {
            showNotification(
              "Please select exactly one scenario to create a test case.",
              "warning",
            );
            return;
          }

          setOpenDialog(true);
        }}
        secondaryActionLabel="✨ Generate with AI"
        onSecondaryAction={() => {
          if (selectedScenarioIds.length !== 1) {
            showNotification(
              "Please select exactly one scenario to generate test cases.",
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
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gridTemplateAreas: {
              xs: `
                "requirements"
                "scenarios"
                "automationStatus"
                "automationEligibility"
              `,
              sm: `
                "requirements automationStatus"
                "scenarios automationEligibility"
              `,
            },
            gap: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total Test Cases: {filteredTestCases.length}
          </Typography>

          <FormControl
            size="small"
            sx={{
              maxWidth: 420,
              gridArea: "requirements",
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
                  requirements.filter((r) =>
                    selected.includes(r.id),
                  );
                
                if (selectedRequirements.length === 1) {
                  return `${selectedRequirements[0].requirement_code} - ${selectedRequirements[0].module}`;
                }
              
                return `${selectedRequirements.length} Requirements Selected`;
              }}
            >
              <MenuItem value={-1}>
                <Checkbox
                  checked={
                    selectedRequirementIds.length === 0
                  }
                />
                <ListItemText primary="All Requirements" />
              </MenuItem>
                
              {requirements.map(
                (requirement) => (
                  <MenuItem
                    key={requirement.id}
                    value={requirement.id}
                  >
                    <Checkbox
                      checked={selectedRequirementIds.includes(
                        requirement.id,
                      )}
                    />
                    <ListItemText
                      primary={`${requirement.requirement_code} - ${requirement.module}`}
                    />
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
            
          <FormControl
            size="small"
            sx={{
              maxWidth: 420,
              gridArea: "scenarios",
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
                  return `${selectedScenarios[0].scenario_code} - ${selectedScenarios[0].title}`;
                }
              
                return `${selectedScenarios.length} Scenarios Selected`;
              }}
            >
              <MenuItem value={-1}>
                <Checkbox
                  checked={
                    selectedScenarioIds.length === 0
                  }
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
              maxWidth: 420,
              gridArea: "automationStatus",
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
                All
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
              maxWidth: 420,
              gridArea: "automationEligibility",
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
                All
              </MenuItem>
            
              <MenuItem value="Eligible">
                Eligible
              </MenuItem>
            
              <MenuItem value="Not Suitable">
                Not Suitable
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TestCaseTable
          testCases={filteredTestCases}
          selectedIds={selectedTestCaseIds}
          onSelectionChange={setSelectedTestCaseIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PageHeader>

      <GenerateTestCaseDialog
        open={openGenerateDialog}
        projects={projects}
        requirements={requirements}
        scenarios={scenarios}
        selectedScenarioId={
          selectedScenarioIds[0] ?? 0
        }
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
        scenarios={scenarios}
        selectedScenarioId={
          selectedScenarioIds[0] ?? 0
        }
        testCase={
          selectedTestCase ??
          undefined
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
                bulkDeleteTestCases.map(
                  (testCase) =>
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