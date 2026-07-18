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
import DataGridLayout from "../../components/common/DataGridLayout";
import TestScenarioDialog from "../../components/testScenarios/TestScenarioDialog";
import TestScenarioTable from "../../components/testScenarios/TestScenarioTable";
import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";

import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";
import type { TestScenarioFormData } from "../../types/testScenarioForm";
import GenerateScenarioDialog from "../../components/testScenarios/GenerateScenarioDialog";
import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";


export default function TestScenariosPage() {
  const [testScenarios, setTestScenarios] =
    useState<TestScenario[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
  useState<number[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [openGenerateDialog, setOpenGenerateDialog] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [
    selectedTestScenarioIds,
    setSelectedTestScenarioIds,
  ] = useState<number[]>([]);

  const [selectedTestScenario, setSelectedTestScenario] =
    useState<TestScenario | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testScenarioToDelete, setTestScenarioToDelete] =
    useState<TestScenario | null>(null);

  const [
    bulkDeleteScenarios,
    setBulkDeleteScenarios,
  ] = useState<TestScenario[]>([]);

  const { showNotification } =
    useNotification();

  const { selectedProject } =
    useWorkspace();

  async function loadData() {

    if (!selectedProject) {
      setTestScenarios([]);
      setRequirements([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

     const [
        testScenarioData,
        requirementData,
        projectData,
      ] = await Promise.all([
        testScenarioService.getTestScenarios(
          selectedProject.id,
        ),
        requirementService.getRequirements(
          selectedProject.id,
        ),
        projectService.getProjects(),
      ]);

      setTestScenarios(testScenarioData);
      setRequirements(requirementData);
      setProjects(projectData);

      setError("");
    } catch (error) {
      console.error(error);
      setError(
        "Failed to load test scenarios.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedProject]);
  
  const filteredTestScenarios =
  selectedRequirementIds.length === 0
    ? testScenarios
    : testScenarios.filter((scenario) =>
        selectedRequirementIds.includes(
          scenario.requirement_id,
        ),
      );

  function handleEdit(
    testScenario: TestScenario,
  ) {
    setSelectedTestScenario(testScenario);
    setOpenDialog(true);
  }

  function handleDelete(
    testScenario: TestScenario,
  ) {
    setBulkDeleteScenarios([]);
    setTestScenarioToDelete(testScenario);
    setConfirmOpen(true);
  }


  function clearSelection() {
    setSelectedTestScenarioIds([]);
  }

  function handleBulkDelete() {
    const selectedScenarios =
      testScenarios.filter((scenario) =>
        selectedTestScenarioIds.includes(
          scenario.id,
        ),
      );

    if (selectedScenarios.length === 0) {
      return;
    }

    setTestScenarioToDelete(null);

    setBulkDeleteScenarios(
      selectedScenarios,
    );

    setConfirmOpen(true);
  }

  async function handleSaveTestScenario(
    data: TestScenarioFormData,
  ) {
    if (selectedTestScenario) {
      await testScenarioService.updateTestScenario(
        selectedTestScenario.id,
        data,
      );

      showNotification(
        "Test scenario updated successfully.",
        "success",
      );
    } else {
      await testScenarioService.createTestScenario(
        data,
      );

      showNotification(
        "Test scenario created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestScenario(null);
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

  return (
    <>
      <PageHeader
          title="Test Scenarios"
          actionLabel="New Test Scenario"
          onAction={() => {
            if (selectedRequirementIds.length !== 1) {
              showNotification(
                "Please select exactly one requirement to create a test scenario.",
                "warning",
              );
              return;
            }
          
            setOpenDialog(true);
          }}
          secondaryActionLabel="✨ Generate with AI"
          onSecondaryAction={() => {
            if (selectedRequirementIds.length !== 1) {
              showNotification(
                "Please select exactly one requirement to generate scenarios.",
                "warning",
              );
              return;
            }
          
            setOpenGenerateDialog(true);
          }}

          selectionCount={
            selectedTestScenarioIds.length
          }

          selectionActions={
            selectedTestScenarioIds.length === 1
              ? [
                  {
                    label: "Edit",
                    onClick: () => {
                      const scenario =
                        testScenarios.find(
                          (s) =>
                            s.id ===
                            selectedTestScenarioIds[0],
                        );
                      
                      if (scenario) {
                        handleEdit(scenario);
                      }
                    },
                  },
                  {
                    label: "Delete",
                    color: "error",
                    onClick: () => {
                      const scenario =
                        testScenarios.find(
                          (s) =>
                            s.id ===
                            selectedTestScenarioIds[0],
                        );
                      
                      if (scenario) {
                        handleDelete(scenario);
                      }
                    },
                  },
                  {
                    label: "Clear Selection",
                    variant: "outlined",
                    onClick: clearSelection,
                  },
                ]
              : selectedTestScenarioIds.length > 1
                ? [
                    {
                      label: "Delete Selected",
                      color: "error",
                      onClick: handleBulkDelete,
                    },
                    {
                      label: "Clear Selection",
                      variant: "outlined",
                      onClick: clearSelection,
                    },
                  ]
                : undefined
          }

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
            Total Test Scenarios: {filteredTestScenarios.length}
          </Typography>
        
          <FormControl size="small" sx={{ maxWidth: 420 }}>
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
              
                const selectedRequirements = requirements.filter((r) =>
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
              
                <ListItemText
                  primary="All Requirements"
                />
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
                  />

                  <ListItemText
                    primary={`${requirement.requirement_code} - ${requirement.module}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <DataGridLayout>
          <TestScenarioTable
            testScenarios={filteredTestScenarios}
            selectedIds={selectedTestScenarioIds}
            onSelectionChange={
              setSelectedTestScenarioIds
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </DataGridLayout>
      </PageHeader>

      <TestScenarioDialog
        title={
          selectedTestScenario
            ? "Edit Test Scenario"
            : "New Test Scenario"
        }
        open={openDialog}
        requirements={requirements}
        selectedRequirementId={
          selectedRequirementIds[0] ?? 0
        }
        testScenario={
          selectedTestScenario ??
          undefined
        }
        onClose={() => {
          setSelectedTestScenario(null);
          setOpenDialog(false);
        }}
        onSave={handleSaveTestScenario}
      />

      <GenerateScenarioDialog
        open={openGenerateDialog}
        projects={projects}
        requirements={requirements}
        selectedRequirementId={
          selectedRequirementIds[0]
        }
        onClose={() =>
          setOpenGenerateDialog(false)
        }
        onGenerated={loadData}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          bulkDeleteScenarios.length > 0
            ? "Delete Test Scenarios"
            : "Delete Test Scenario"
        }
        message={
          bulkDeleteScenarios.length > 0
            ? `Are you sure you want to delete ${bulkDeleteScenarios.length} test scenarios?`
            : testScenarioToDelete
              ? `Are you sure you want to delete "${testScenarioToDelete.title}"?`
              : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setTestScenarioToDelete(null);
          setBulkDeleteScenarios([]);
        }}
        onConfirm={async () => {
          try {
            if (bulkDeleteScenarios.length > 0) {
              await Promise.all(
                bulkDeleteScenarios.map(
                  (scenario) =>
                    testScenarioService.deleteTestScenario(
                      scenario.id,
                    ),
                ),
              );
            
              showNotification(
                "Test scenarios deleted successfully.",
                "success",
              );
            
              clearSelection();
              setBulkDeleteScenarios([]);
            } else if (testScenarioToDelete) {
              await testScenarioService.deleteTestScenario(
                testScenarioToDelete.id,
              );
            
              showNotification(
                "Test scenario deleted successfully.",
                "success",
              );
            
              setTestScenarioToDelete(null);
            }
          
            await loadData();
          } catch (error) {
            console.error(error);
          
            showNotification(
              bulkDeleteScenarios.length > 0
                ? "Failed to delete test scenarios."
                : "Failed to delete test scenario.",
              "error",
            );
          } finally {
            setConfirmOpen(false);
            setTestScenarioToDelete(null);
            setBulkDeleteScenarios([]);
          }
        }}
      />
    </>
  );
}