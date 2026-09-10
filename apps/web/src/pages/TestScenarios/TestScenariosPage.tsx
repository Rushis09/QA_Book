import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import DataGridLayout from "../../components/common/DataGridLayout";
import TestScenarioDialog from "../../components/testScenarios/TestScenarioDialog";
import TestScenarioTable from "../../components/testScenarios/TestScenarioTable";
import GenerateScenarioDialog from "../../components/testScenarios/GenerateScenarioDialog";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";

import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";
import type { TestScenarioFormData } from "../../types/testScenarioForm";

type StatusFilter = "All" | string;
type PriorityFilter = "All" | string;
type SortOption = "code" | "title" | "priority" | "status";

export default function TestScenariosPage() {
  const [testScenarios, setTestScenarios] =
    useState<TestScenario[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
    useState<number[]>([]);

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

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("code");

  const { showNotification } =
    useNotification();

  const {
    selectedProject,
    isAllProjects,
    projects,
  } = useWorkspace();

  async function loadData() {
    if (!selectedProject && !isAllProjects) {
      setTestScenarios([]);
      setRequirements([]);
      setSelectedTestScenarioIds([]);
      setLoading(false);
      return;
    }

    const projectId = selectedProject?.id;

    setLoading(true);
    setError("");
    setTestScenarios([]);
    setRequirements([]);
    setSelectedTestScenarioIds([]);

    try {
      const testScenarioPromise =
        testScenarioService.getTestScenarios(projectId);
      const requirementPromise =
        requirementService.getRequirements(projectId);

      setLoading(false);

      const [testScenarioData, requirementData] =
        await Promise.all([
          testScenarioPromise,
          requirementPromise,
        ]);

      setTestScenarios(testScenarioData);
      setRequirements(requirementData);
    } catch (error) {
      console.error(error);
      setError("Failed to load test scenarios.");
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedProject, isAllProjects]);

  const availableStatuses =
    useMemo(
      () =>
        Array.from(
          new Set(
            testScenarios.map(
              (scenario) =>
                scenario.status,
            ),
          ),
        ),
      [testScenarios],
    );

  const availablePriorities =
    useMemo(
      () =>
        Array.from(
          new Set(
            testScenarios.map(
              (scenario) =>
                scenario.priority,
            ),
          ),
        ),
      [testScenarios],
    );

  const filteredTestScenarios =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const result =
        testScenarios.filter(
          (scenario) => {
            const requirementCode =
              scenario.requirement
                ?.requirement_code ?? "";

            const requirementModule =
              scenario.requirement
                ?.module ?? "";

            const matchesSearch =
              !normalizedSearch ||
              scenario.scenario_code
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              scenario.title
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              scenario.module
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              requirementCode
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              requirementModule
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              (
                scenario.description ??
                ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const matchesRequirement =
              selectedRequirementIds.length ===
                0 ||
              selectedRequirementIds.includes(
                scenario.requirement_id,
              );

            const matchesStatus =
              statusFilter === "All" ||
              scenario.status ===
                statusFilter;

            const matchesPriority =
              priorityFilter === "All" ||
              scenario.priority ===
                priorityFilter;

            return (
              matchesSearch &&
              matchesRequirement &&
              matchesStatus &&
              matchesPriority
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          if (
            sortOption === "title"
          ) {
            return a.title.localeCompare(
              b.title,
            );
          }

          if (
            sortOption === "priority"
          ) {
            return a.priority.localeCompare(
              b.priority,
            );
          }

          if (
            sortOption === "status"
          ) {
            return a.status.localeCompare(
              b.status,
            );
          }

          return a.scenario_code.localeCompare(
            b.scenario_code,
          );
        },
      );
    }, [
      testScenarios,
      search,
      selectedRequirementIds,
      statusFilter,
      priorityFilter,
      sortOption,
    ]);

  const totalScenarios =
    testScenarios.length;

  const draftScenarios =
    testScenarios.filter(
      (scenario) =>
        scenario.status === "Draft",
    ).length;

  const readyScenarios =
    testScenarios.filter(
      (scenario) =>
        scenario.status === "Ready",
    ).length;

  const approvedScenarios =
    testScenarios.filter(
      (scenario) =>
        scenario.status === "Approved",
    ).length;

  function handleEdit(
    testScenario: TestScenario,
  ) {
    setSelectedTestScenario(
      testScenario,
    );
    setOpenDialog(true);
  }

  function handleDelete(
    testScenario: TestScenario,
  ) {
    setBulkDeleteScenarios([]);
    setTestScenarioToDelete(
      testScenario,
    );
    setConfirmOpen(true);
  }

  function clearSelection() {
    setSelectedTestScenarioIds([]);
  }

  function handleBulkDelete() {
    const selectedScenarios =
      testScenarios.filter(
        (scenario) =>
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

  const handleRequirementChange = (
    event: SelectChangeEvent<number[]>,
  ) => {
    const value =
      event.target.value as number[];

    if (value.includes(-1)) {
      setSelectedRequirementIds([]);
      return;
    }

    setSelectedRequirementIds(
      value.filter((id) => id !== -1),
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
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
        <Typography
          sx={{
            color: "#b42318",
            fontSize: "0.8rem",
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Test Scenarios"
        actionLabel="New Test Scenario"
        onAction={() => {
          setSelectedTestScenario(null);
          setOpenDialog(true);
        }}
        secondaryActionLabel="✨ Generate with AI"
        onSecondaryAction={() => {
          if (
            selectedRequirementIds.length === 0
          ) {
            showNotification(
              "Please select at least one requirement to generate scenarios.",
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
          selectedTestScenarioIds.length ===
          1
            ? [
                {
                  label: "Edit",
                  onClick: () => {
                    const scenario =
                      testScenarios.find(
                        (item) =>
                          item.id ===
                          selectedTestScenarioIds[0],
                      );

                    if (scenario) {
                      handleEdit(
                        scenario,
                      );
                    }
                  },
                },
                {
                  label: "Delete",
                  color: "error",
                  onClick: () => {
                    const scenario =
                      testScenarios.find(
                        (item) =>
                          item.id ===
                          selectedTestScenarioIds[0],
                      );

                    if (scenario) {
                      handleDelete(
                        scenario,
                      );
                    }
                  },
                },
                {
                  label: "Clear Selection",
                  variant: "outlined",
                  onClick:
                    clearSelection,
                },
              ]
            : selectedTestScenarioIds.length >
                1
              ? [
                  {
                    label: "Delete Selected",
                    color: "error",
                    onClick:
                      handleBulkDelete,
                  },
                  {
                    label: "Clear Selection",
                    variant: "outlined",
                    onClick:
                      clearSelection,
                  },
                ]
              : undefined
        }
      >
        <Typography
          sx={{
            mt: -0.8,
            mb: 1.5,
            fontSize: "0.76rem",
            color: "#667085",
          }}
        >
          Define, manage and organize test
          scenarios against project
          requirements.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: 1.25,
            mb: 1.5,

            "@media (max-width: 1000px)":
              {
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
              },

            "@media (max-width: 600px)":
              {
                gridTemplateColumns: "1fr",
              },
          }}
        >
          <MetricCard
            icon={
              <AssignmentOutlinedIcon />
            }
            value={totalScenarios}
            label="Total Scenarios"
          />

          <MetricCard
            icon={
              <PendingActionsOutlinedIcon />
            }
            value={draftScenarios}
            label="Draft"
          />

          <MetricCard
            icon={
              <CheckOutlinedIcon />
            }
            value={readyScenarios}
            label="Ready"
          />

          <MetricCard
            icon={
              <CheckOutlinedIcon />
            }
            value={approvedScenarios}
            label="Approved"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.25,
            flexWrap: "wrap",
          }}
        >
          <TextField
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search scenarios..."
            size="small"
            sx={{
              width: 250,

              "& .MuiOutlinedInput-root":
                {
                  height: 34,
                  borderRadius: "8px",
                  backgroundColor:
                    "#ffffff",
                  fontSize:
                    "0.76rem",
                },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        fontSize: 17,
                        color:
                          "#98a2b3",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            multiple
            displayEmpty
            value={
              selectedRequirementIds
            }
            onChange={
              handleRequirementChange
            }
            size="small"
            renderValue={(selected) => {
              if (selected.length === 0) {
                return "All Requirements";
              }

              const selectedRequirements =
                requirements.filter(
                  (requirement) =>
                    selected.includes(
                      requirement.id,
                    ),
                );

              if (
                selectedRequirements.length ===
                1
              ) {
                return `${selectedRequirements[0].requirement_code} - ${selectedRequirements[0].module}`;
              }

              return `${selectedRequirements.length} Requirements`;
            }}
            sx={{
              minWidth: 190,
              maxWidth: 240,
              height: 34,
              borderRadius: "8px",
              backgroundColor:
                "#ffffff",
              fontSize: "0.76rem",
            }}
          >
            <MenuItem value={-1}>
              <Checkbox
                size="small"
                checked={
                  selectedRequirementIds.length ===
                  0
                }
              />
              <Typography
                sx={{
                  fontSize: "0.76rem",
                }}
              >
                All Requirements
              </Typography>
            </MenuItem>

            {requirements.map(
              (requirement) => (
                <MenuItem
                  key={requirement.id}
                  value={requirement.id}
                >
                  <Checkbox
                    size="small"
                    checked={selectedRequirementIds.includes(
                      requirement.id,
                    )}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                    }}
                  >
                    {requirement.requirement_code}{" "}
                    - {requirement.module}
                  </Typography>
                </MenuItem>
              ),
            )}
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            size="small"
            sx={{
              minWidth: 125,
              height: 34,
              borderRadius: "8px",
              backgroundColor:
                "#ffffff",
              fontSize: "0.76rem",
            }}
          >
            <MenuItem value="All">
              All Status
            </MenuItem>

            {availableStatuses.map(
              (status) => (
                <MenuItem
                  key={status}
                  value={status}
                >
                  {status}
                </MenuItem>
              ),
            )}
          </Select>

          <Select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value,
              )
            }
            size="small"
            sx={{
              minWidth: 125,
              height: 34,
              borderRadius: "8px",
              backgroundColor:
                "#ffffff",
              fontSize: "0.76rem",
            }}
          >
            <MenuItem value="All">
              All Priority
            </MenuItem>

            {availablePriorities.map(
              (priority) => (
                <MenuItem
                  key={priority}
                  value={priority}
                >
                  {priority}
                </MenuItem>
              ),
            )}
          </Select>

          <Select
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value as SortOption,
              )
            }
            size="small"
            sx={{
              minWidth: 145,
              height: 34,
              borderRadius: "8px",
              backgroundColor:
                "#ffffff",
              fontSize: "0.76rem",
            }}
          >
            <MenuItem value="code">
              Sort by: Code
            </MenuItem>

            <MenuItem value="title">
              Sort by: Title
            </MenuItem>

            <MenuItem value="priority">
              Sort by: Priority
            </MenuItem>

            <MenuItem value="status">
              Sort by: Status
            </MenuItem>
          </Select>

          <Typography
            sx={{
              ml: "auto",
              fontSize: "0.72rem",
              color: "#667085",
            }}
          >
            {filteredTestScenarios.length}{" "}
            of {testScenarios.length}{" "}
            scenarios
          </Typography>
        </Box>

        <DataGridLayout>
          <TestScenarioTable
            testScenarios={
              filteredTestScenarios
            }
            selectedIds={
              selectedTestScenarioIds
            }
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
        onSave={
          handleSaveTestScenario
        }
      />

      <GenerateScenarioDialog
        open={openGenerateDialog}
        projects={projects}
        requirements={requirements}
        selectedRequirementIds={
          selectedRequirementIds
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
            if (
              bulkDeleteScenarios.length >
              0
            ) {
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
            } else if (
              testScenarioToDelete
            ) {
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
              bulkDeleteScenarios.length >
                0
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

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 68,
        px: 1.5,
        py: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 1.1,
        border:
          "1px solid #e4e7ec",
        borderRadius: "9px",
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          backgroundColor: "#eef6ff",
          color: "#1677ff",

          "& svg": {
            fontSize: 19,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "1.02rem",
            lineHeight: 1.1,
            fontWeight: 750,
            color: "#101828",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            fontSize: "0.67rem",
            color: "#667085",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}