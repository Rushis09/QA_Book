import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import DataGridLayout from "../../components/common/DataGridLayout";

import RequirementDialog from "../../components/requirements/RequirementDialog";
import RequirementTable from "../../components/requirements/RequirementTable";
import GenerateRequirementDialog from "../../components/requirements/GenerateRequirementDialog";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { requirementService } from "../../services/requirementService";

import type { RequirementFormData } from "../../types/requirementForm";
import type { Requirement } from "../../types/requirement";

type StatusFilter = "All" | string;
type PriorityFilter = "All" | string;
type SortOption = "updated" | "code" | "priority" | "status";

export default function RequirementsPage() {
  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [openGenerateDialog, setOpenGenerateDialog] =
    useState(false);

  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [requirementToDelete, setRequirementToDelete] =
    useState<Requirement | null>(null);

  const [bulkDeleteRequirements, setBulkDeleteRequirements] =
    useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
    useState<number[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("updated");

  const { showNotification } =
    useNotification();

  const {
    selectedProject,
    isAllProjects,
  } = useWorkspace();

  async function loadData() {
    if (!selectedProject && !isAllProjects) {
      setRequirements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const projectId =
        selectedProject?.id;

      const requirementsData =
        await requirementService.getRequirements(
          projectId,
        );

      setRequirements(
        requirementsData,
      );

      setError("");
      setSelectedRequirementIds([]);
    } catch (error) {
      console.error(error);
      setError(
        "Failed to load requirements.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [
    selectedProject,
    isAllProjects,
  ]);

  const availableStatuses =
    useMemo(
      () =>
        Array.from(
          new Set(
            requirements.map(
              (requirement) =>
                requirement.status,
            ),
          ),
        ),
      [requirements],
    );

  const availablePriorities =
    useMemo(
      () =>
        Array.from(
          new Set(
            requirements.map(
              (requirement) =>
                requirement.priority,
            ),
          ),
        ),
      [requirements],
    );

  const filteredRequirements =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const result =
        requirements.filter(
          (requirement) => {
            const matchesSearch =
              !normalizedSearch ||
              requirement.requirement_code
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              requirement.module
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              requirement.project
                .project_code
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              requirement.project.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              (
                requirement.description ??
                ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const matchesStatus =
              statusFilter === "All" ||
              requirement.status ===
                statusFilter;

            const matchesPriority =
              priorityFilter === "All" ||
              requirement.priority ===
                priorityFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPriority
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          if (
            sortOption === "code"
          ) {
            return a.requirement_code.localeCompare(
              b.requirement_code,
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

          return (
            new Date(
              b.updated_at,
            ).getTime() -
            new Date(
              a.updated_at,
            ).getTime()
          );
        },
      );
    }, [
      requirements,
      search,
      statusFilter,
      priorityFilter,
      sortOption,
    ]);

  const totalRequirements =
    requirements.length;

  const approvedRequirements =
    requirements.filter(
      (requirement) =>
        requirement.status ===
        "Approved",
    ).length;

  const implementedRequirements =
    requirements.filter(
      (requirement) =>
        requirement.status ===
        "Implemented",
    ).length;

  const pendingRequirements =
    requirements.filter(
      (requirement) =>
        requirement.status !==
          "Approved" &&
        requirement.status !==
          "Implemented",
    ).length;

  function handleEdit(
    requirement: Requirement,
  ) {
    setSelectedRequirement(
      requirement,
    );
    setOpenDialog(true);
  }

  function handleDelete(
    requirement: Requirement,
  ) {
    setRequirementToDelete(
      requirement,
    );
    setBulkDeleteRequirements([]);
    setConfirmOpen(true);
  }

  function handleBulkDelete() {
    const selectedRequirements =
      requirements.filter(
        (requirement) =>
          selectedRequirementIds.includes(
            requirement.id,
          ),
      );

    setBulkDeleteRequirements(
      selectedRequirements,
    );

    setRequirementToDelete(null);
    setConfirmOpen(true);
  }

  function clearSelection() {
    setSelectedRequirementIds([]);
  }

  async function handleSaveRequirement(
    data: RequirementFormData,
  ) {
    if (selectedRequirement) {
      await requirementService.updateRequirement(
        selectedRequirement.id,
        data,
      );

      showNotification(
        "Requirement updated successfully.",
        "success",
      );
    } else {
      await requirementService.createRequirement(
        data,
      );

      showNotification(
        "Requirement created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedRequirement(null);
    setOpenDialog(false);
  }

  async function handleDeleteConfirmed() {
    try {
      if (
        bulkDeleteRequirements.length >
        0
      ) {
        await Promise.all(
          bulkDeleteRequirements.map(
            (requirement) =>
              requirementService.deleteRequirement(
                requirement.id,
              ),
          ),
        );

        showNotification(
          "Requirements deleted successfully.",
          "success",
        );
      } else if (
        requirementToDelete
      ) {
        await requirementService.deleteRequirement(
          requirementToDelete.id,
        );

        showNotification(
          "Requirement deleted successfully.",
          "success",
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      showNotification(
        bulkDeleteRequirements.length >
          0
          ? "Failed to delete requirements."
          : "Failed to delete requirement.",
        "error",
      );
    } finally {
      setConfirmOpen(false);
      setRequirementToDelete(null);
      setBulkDeleteRequirements([]);
      setSelectedRequirementIds([]);
    }
  }

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
        title="Requirements"
        actionLabel="New Requirement"
        onAction={() => {
          setSelectedRequirement(
            null,
          );
          setOpenDialog(true);
        }}
        secondaryActionLabel="✨ Generate with AI"
        onSecondaryAction={() =>
          setOpenGenerateDialog(true)
        }
        selectionCount={
          selectedRequirementIds.length
        }
        selectionActions={
          selectedRequirementIds.length ===
          1
            ? [
                {
                  label: "Edit",
                  onClick: () => {
                    const requirement =
                      requirements.find(
                        (item) =>
                          item.id ===
                          selectedRequirementIds[0],
                      );

                    if (requirement) {
                      handleEdit(
                        requirement,
                      );
                    }
                  },
                },
                {
                  label: "Delete",
                  color: "error",
                  onClick: () => {
                    const requirement =
                      requirements.find(
                        (item) =>
                          item.id ===
                          selectedRequirementIds[0],
                      );

                    if (requirement) {
                      handleDelete(
                        requirement,
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
            : selectedRequirementIds.length >
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
          Define, manage and track
          project requirements throughout
          the QA lifecycle.
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
            value={totalRequirements}
            label="Total Requirements"
          />

          <MetricCard
            icon={
              <CheckOutlinedIcon />
            }
            value={approvedRequirements}
            label="Approved"
          />

          <MetricCard
            icon={
              <CheckOutlinedIcon />
            }
            value={implementedRequirements}
            label="Implemented"
          />

          <MetricCard
            icon={
              <PendingActionsOutlinedIcon />
            }
            value={pendingRequirements}
            label="Pending"
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
            placeholder="Search requirements..."
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
              minWidth: 150,
              height: 34,
              borderRadius: "8px",
              backgroundColor:
                "#ffffff",
              fontSize: "0.76rem",
            }}
          >
            <MenuItem value="updated">
              Sort by: Updated
            </MenuItem>

            <MenuItem value="code">
              Sort by: Code
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
            {filteredRequirements.length}{" "}
            of {requirements.length}{" "}
            requirements
          </Typography>
        </Box>

        <DataGridLayout>
          <RequirementTable
            requirements={
              filteredRequirements
            }
            selectedIds={
              selectedRequirementIds
            }
            onSelectionChange={
              setSelectedRequirementIds
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </DataGridLayout>
      </PageHeader>

      <RequirementDialog
        title={
          selectedRequirement
            ? "Edit Requirement"
            : "New Requirement"
        }
        open={openDialog}
        requirement={
          selectedRequirement ??
          undefined
        }
        onClose={() => {
          setSelectedRequirement(
            null,
          );
          setOpenDialog(false);
        }}
        onSave={
          handleSaveRequirement
        }
      />

      <GenerateRequirementDialog
        open={openGenerateDialog}
        onClose={() =>
          setOpenGenerateDialog(
            false,
          )
        }
        onGenerated={loadData}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          bulkDeleteRequirements.length >
          0
            ? "Delete Requirements"
            : "Delete Requirement"
        }
        message={
          bulkDeleteRequirements.length >
          0
            ? `Are you sure you want to delete ${bulkDeleteRequirements.length} requirements?`
            : requirementToDelete
              ? `Are you sure you want to delete "${requirementToDelete.requirement_code}"?`
              : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setRequirementToDelete(
            null,
          );
          setBulkDeleteRequirements(
            [],
          );
        }}
        onConfirm={
          handleDeleteConfirmed
        }
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