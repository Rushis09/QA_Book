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
        
        return (
          matchesRequirement &&
          matchesScenario
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
        >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
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
            sx={{ maxWidth: 420 }}
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
                
                if (
                  selectedRequirements.length === 1
                ) {
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
            sx={{ maxWidth: 420 }}
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

        </Box>
            
        <TestCaseTable
          testCases={filteredTestCases}
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
        title="Delete Test Case"
        message={
          testCaseToDelete
            ? `Are you sure you want to delete "${testCaseToDelete.test_case_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!testCaseToDelete) {
            return;
          }

          try {
            await testCaseService.deleteTestCase(
              testCaseToDelete.id,
            );

            await loadData();

            showNotification(
              "Test case deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setTestCaseToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test case.",
              "error",
            );

            setConfirmOpen(false);
            setTestCaseToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestCaseToDelete(null);
        }}
      />
    </>
  );
}