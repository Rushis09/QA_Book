import {
  useEffect,
  useMemo,
  useState,
} from "react";

import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";

import BugDialog from "../../components/bugs/BugDialog";
import BugRetestDialog from "../../components/bugs/BugRetestDialog";
import BugTable from "../../components/bugs/BugTable";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { bugService } from "../../services/bugService";
import { testExecutionService } from "../../services/testExecutionService";

import type { Bug } from "../../types/bug";
import type { BugFormData } from "../../types/bugForm";
import type { TestExecution } from "../../types/testExecution";

type SortOption =
  | "updated"
  | "created"
  | "code"
  | "severity"
  | "priority"
  | "status";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 38,
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "0.72rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.72rem",
  },
  "& .MuiSelect-select": {
    py: 0.9,
    fontSize: "0.72rem",
  },
};

function KpiCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        flex: 1,
        height: 78,
        px: 1.35,
        py: 1.05,
        borderRadius: "10px",
        border: "1px solid #e4e7ec",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 800,
            color: "#667085",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: "1.25rem",
            lineHeight: 1.15,
            fontWeight: 800,
            color: "#101828",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: "0.62rem",
            color: "#98a2b3",
            whiteSpace: "nowrap",
          }}
        >
          {caption}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f2f4f7",
          color: "#475467",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

export default function BugsPage() {
  const [bugs, setBugs] =
    useState<Bug[]>([]);

  const [executions, setExecutions] =
    useState<TestExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedBug, setSelectedBug] =
    useState<Bug | null>(null);

  const [selectedBugIds, setSelectedBugIds] =
    useState<number[]>([]);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [bugToDelete, setBugToDelete] =
    useState<Bug | null>(null);

  const [
    bulkDeleteConfirmOpen,
    setBulkDeleteConfirmOpen,
  ] = useState(false);

  const [
    retestDialogOpen,
    setRetestDialogOpen,
  ] = useState(false);

  const [bugToRetest, setBugToRetest] =
    useState<Bug | null>(null);

  const [retestSaving, setRetestSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [severityFilter, setSeverityFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState<SortOption>("updated");

  const { showNotification } =
    useNotification();

  const {
    selectedProject,
    isAllProjects,
  } = useWorkspace();

  async function loadData() {
    try {
      setLoading(true);

      const [
        bugData,
        executionData,
      ] = await Promise.all([
        bugService.getBugs(),
        testExecutionService.getExecutions(),
      ]);

      setBugs(bugData);
      setExecutions(executionData);
      setSelectedBugIds([]);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load bugs.",
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

  const availableStatuses = useMemo(
    () =>
      Array.from(
        new Set(
          bugs
            .map((bug) => bug.status)
            .filter(Boolean),
        ),
      ).sort(),
    [bugs],
  );

  const availableSeverities = useMemo(
    () =>
      Array.from(
        new Set(
          bugs
            .map((bug) => bug.severity)
            .filter(Boolean),
        ),
      ).sort(),
    [bugs],
  );

  const availablePriorities = useMemo(
    () =>
      Array.from(
        new Set(
          bugs
            .map((bug) => bug.priority)
            .filter(Boolean),
        ),
      ).sort(),
    [bugs],
  );

  const statusCounts = useMemo(
    () => ({
      all: bugs.length,

      open: bugs.filter(
        (bug) =>
          bug.status === "Open",
      ).length,

      inProgress: bugs.filter(
        (bug) =>
          bug.status ===
          "In Progress",
      ).length,

      readyForQa: bugs.filter(
        (bug) =>
          bug.status ===
          "Ready for QA",
      ).length,

      fixed: bugs.filter(
        (bug) =>
          bug.status === "Fixed",
      ).length,

      closed: bugs.filter(
        (bug) =>
          bug.status === "Closed",
      ).length,
    }),
    [bugs],
  );

  const filteredBugs = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = bugs.filter((bug) => {
      const matchesSearch =
        !normalizedSearch ||
        bug.bug_code
          .toLowerCase()
          .includes(normalizedSearch) ||
        bug.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        bug.execution.test_case.test_case_code
          .toLowerCase()
          .includes(normalizedSearch) ||
        bug.execution.test_case.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        (bug.assigned_to ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        bug.status === statusFilter;

      const matchesSeverity =
        severityFilter === "All" ||
        bug.severity ===
          severityFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        bug.priority ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesPriority
      );
    });

    return [...result].sort(
      (a, b) => {
        switch (sortBy) {
          case "created":
            return (
              new Date(
                b.created_at,
              ).getTime() -
              new Date(
                a.created_at,
              ).getTime()
            );

          case "code":
            return a.bug_code.localeCompare(
              b.bug_code,
              undefined,
              {
                numeric: true,
              },
            );

          case "severity": {
            const order = {
              Critical: 0,
              High: 1,
              Medium: 2,
              Low: 3,
            };

            return (
              (order[
                a.severity as keyof typeof order
              ] ?? 99) -
              (order[
                b.severity as keyof typeof order
              ] ?? 99)
            );
          }

          case "priority":
            return a.priority.localeCompare(
              b.priority,
            );

          case "status":
            return a.status.localeCompare(
              b.status,
            );

          case "updated":
          default:
            return (
              new Date(
                b.updated_at,
              ).getTime() -
              new Date(
                a.updated_at,
              ).getTime()
            );
        }
      },
    );
  }, [
    bugs,
    search,
    statusFilter,
    severityFilter,
    priorityFilter,
    sortBy,
  ]);

  function handleQuickStatus(
    status: string,
  ) {
    setStatusFilter(status);
  }

  function handleEdit(bug: Bug) {
    setSelectedBug(bug);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setSelectedBug(null);
    setOpenDialog(false);
  }

  function handleDelete(bug: Bug) {
    setBugToDelete(bug);
    setConfirmOpen(true);
  }

  function handleCancelDelete() {
    setConfirmOpen(false);
    setBugToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!bugToDelete) {
      return;
    }

    try {
      await bugService.deleteBug(
        bugToDelete.id,
      );

      await loadData();

      showNotification(
        "Bug deleted successfully.",
        "success",
      );

      handleCancelDelete();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete bug.",
        "error",
      );

      handleCancelDelete();
    }
  }

  function handleBulkDelete() {
    if (
      selectedBugIds.length ===
      0
    ) {
      return;
    }

    setBulkDeleteConfirmOpen(
      true,
    );
  }

  function handleCancelBulkDelete() {
    setBulkDeleteConfirmOpen(
      false,
    );
  }

  async function handleConfirmBulkDelete() {
    if (
      selectedBugIds.length ===
      0
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedBugIds.map(
          (bugId) =>
            bugService.deleteBug(
              bugId,
            ),
        ),
      );

      await loadData();

      showNotification(
        `${selectedBugIds.length} bugs deleted successfully.`,
        "success",
      );

      handleCancelBulkDelete();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete selected bugs.",
        "error",
      );

      handleCancelBulkDelete();
    }
  }

  function handleRetest(bug: Bug) {
    setBugToRetest(bug);
    setRetestDialogOpen(true);
  }

  function handleCloseRetestDialog() {
    if (retestSaving) {
      return;
    }

    setRetestDialogOpen(false);
    setBugToRetest(null);
  }

  async function handleConfirmRetest(
    executionType:
      | "Manual"
      | "Automated",
  ) {
    if (!bugToRetest) {
      return;
    }

    try {
      setRetestSaving(true);

      const retest =
        await bugService.createRetest(
          bugToRetest.id,
          {
            execution_type:
              executionType,
          },
        );

      await loadData();

      setRetestDialogOpen(false);
      setBugToRetest(null);

      showNotification(
        `Retest ${retest.execution.test_run.run_code} created successfully.`,
        "success",
      );
    } catch (error) {
      console.error(error);

      const message =
        (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response?.data?.detail ||
        "Failed to create bug retest.";

      showNotification(
        message,
        "error",
      );
    } finally {
      setRetestSaving(false);
    }
  }

  async function handleSave(
    data: BugFormData,
  ) {
    try {
      if (selectedBug) {
        await bugService.updateBug(
          selectedBug.id,
          data,
        );

        showNotification(
          "Bug updated successfully.",
          "success",
        );
      } else {
        await bugService.createBug(
          data,
        );

        showNotification(
          "Bug created successfully.",
          "success",
        );
      }

      await loadData();

      handleCloseDialog();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save bug.",
        "error",
      );
    }
  }

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
      <Alert
        severity="error"
        sx={{
          borderRadius: "9px",
          fontSize: "0.75rem",
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <PageHeader
          title="Bug Reports"
          actionLabel="New Bug"
          onAction={() =>
            setOpenDialog(true)
          }
        />

        <Typography
          sx={{
            mt: -1.05,
            mb: 1.35,
            fontSize: "0.73rem",
            color: "#667085",
          }}
        >
          Track, investigate, retest, and
          resolve defects across your QA
          activity.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 0.9,
            mb: 1.25,
            width: "100%",
          }}
        >
          <KpiCard
            label="Total Bugs"
            value={statusCounts.all}
            caption="All defects"
            icon={
              <BugReportOutlinedIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <KpiCard
            label="Open"
            value={statusCounts.open}
            caption="Needs attention"
            icon={
              <WarningAmberIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <KpiCard
            label="In Progress"
            value={
              statusCounts.inProgress
            }
            caption="Being worked"
            icon={
              <HourglassEmptyIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <KpiCard
            label="Ready for QA"
            value={
              statusCounts.readyForQa
            }
            caption="Awaiting retest"
            icon={
              <PlayArrowIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <KpiCard
            label="Fixed"
            value={statusCounts.fixed}
            caption="Ready to verify"
            icon={
              <CheckCircleIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <KpiCard
            label="Closed"
            value={statusCounts.closed}
            caption="Resolved defects"
            icon={
              <CheckCircleIcon
                sx={{ fontSize: 18 }}
              />
            }
          />
        </Box>

        <Box
          sx={{
            p: 1,
            mb: 1.15,
            borderRadius: "10px",
            border: "1px solid #e4e7ec",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1.5fr) repeat(3, minmax(145px, 0.75fr)) minmax(150px, 0.8fr)",
              gap: 0.75,
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              placeholder="Search bugs, test cases, titles..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              sx={fieldSx}
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

            <FormControl
              size="small"
              sx={fieldSx}
            >
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                displayEmpty
              >
                <MenuItem value="All">
                  All Statuses
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
            </FormControl>

            <FormControl
              size="small"
              sx={fieldSx}
            >
              <Select
                value={severityFilter}
                onChange={(event) =>
                  setSeverityFilter(
                    event.target.value,
                  )
                }
                displayEmpty
              >
                <MenuItem value="All">
                  All Severities
                </MenuItem>

                {availableSeverities.map(
                  (severity) => (
                    <MenuItem
                      key={severity}
                      value={severity}
                    >
                      {severity}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={fieldSx}
            >
              <Select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value,
                  )
                }
                displayEmpty
              >
                <MenuItem value="All">
                  All Priorities
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
            </FormControl>

            <FormControl
              size="small"
              sx={fieldSx}
            >
              <Select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption,
                  )
                }
              >
                <MenuItem value="updated">
                  Latest Updated
                </MenuItem>

                <MenuItem value="created">
                  Latest Created
                </MenuItem>

                <MenuItem value="code">
                  Bug Code
                </MenuItem>

                <MenuItem value="severity">
                  Severity
                </MenuItem>

                <MenuItem value="priority">
                  Priority
                </MenuItem>

                <MenuItem value="status">
                  Status
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              mt: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 0.35,
              flexWrap: "wrap",
            }}
          >
            {(
              [
                ["All", statusCounts.all],
                ["Open", statusCounts.open],
                [
                  "In Progress",
                  statusCounts.inProgress,
                ],
                [
                  "Ready for QA",
                  statusCounts.readyForQa,
                ],
                ["Fixed", statusCounts.fixed],
                ["Closed", statusCounts.closed],
              ] as [string, number][]
            ).map(
              ([label, count]) => {
                const active =
                  statusFilter ===
                  label;

                return (
                  <Box
                    key={label}
                    component="button"
                    type="button"
                    onClick={() =>
                      handleQuickStatus(
                        label,
                      )
                    }
                    sx={{
                      border: "1px solid",
                      borderColor:
                        active
                          ? "#b2ddff"
                          : "transparent",
                      backgroundColor:
                        active
                          ? "#eff8ff"
                          : "transparent",
                      color: active
                        ? "#175cd3"
                        : "#667085",
                      borderRadius: "6px",
                      px: 1.1,
                      py: 0.55,
                      cursor: "pointer",
                      fontSize: "0.65rem",
                      fontWeight: 750,
                      fontFamily:
                        "inherit",
                    }}
                  >
                    {label} {count}
                  </Box>
                );
              },
            )}
          </Box>
        </Box>

        <Box
          sx={{
            mb: 0.8,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.92rem",
                fontWeight: 800,
                color: "#101828",
              }}
            >
              Defect Queue
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                fontSize: "0.67rem",
                color: "#667085",
              }}
            >
              Review defects, manage
              ownership, and trigger
              retesting.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
            }}
          >
            <Chip
              label={`${filteredBugs.length} of ${bugs.length} bugs`}
              size="small"
              sx={{
                height: 26,
                borderRadius: "7px",
                fontSize: "0.63rem",
                fontWeight: 750,
                color: "#475467",
                backgroundColor:
                  "#f2f4f7",
                border:
                  "1px solid #e4e7ec",
              }}
            />

            <Chip
              label={
                isAllProjects
                  ? "All projects"
                  : selectedProject
                    ? selectedProject.project_code
                    : "Selected project"
              }
              size="small"
              sx={{
                height: 26,
                borderRadius: "7px",
                fontSize: "0.63rem",
                fontWeight: 750,
                color: "#175cd3",
                backgroundColor:
                  "#eff8ff",
                border:
                  "1px solid #b2ddff",
              }}
            />
          </Box>
        </Box>

        {selectedBugIds.length > 0 && (
          <Box
            sx={{
              mb: 0.8,
              px: 1.1,
              py: 0.7,
              borderRadius: "8px",
              border:
                "1px solid #d0d5dd",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              {selectedBugIds.length} bugs
              selected
            </Typography>

            <Box
              component="button"
              type="button"
              onClick={handleBulkDelete}
              sx={{
                border: "none",
                background:
                  "transparent",
                color: "#b42318",
                cursor: "pointer",
                fontSize: "0.68rem",
                fontWeight: 750,
                fontFamily:
                  "inherit",
                p: 0,
              }}
            >
              Delete selected
            </Box>
          </Box>
        )}

        <BugTable
          bugs={filteredBugs}
          selectedBugIds={
            selectedBugIds
          }
          onSelectionChange={
            setSelectedBugIds
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRetest={handleRetest}
        />
      </Box>

      <BugDialog
        title={
          selectedBug
            ? "Edit Bug"
            : "New Bug"
        }
        open={openDialog}
        executions={executions}
        bug={
          selectedBug ??
          undefined
        }
        onClose={handleCloseDialog}
        onSave={handleSave}
      />

      <BugRetestDialog
        open={retestDialogOpen}
        bug={
          bugToRetest ??
          undefined
        }
        saving={retestSaving}
        onClose={
          handleCloseRetestDialog
        }
        onConfirm={
          handleConfirmRetest
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Bug"
        message={
          bugToDelete
            ? `Are you sure you want to delete "${bugToDelete.bug_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={
          handleCancelDelete
        }
      />

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="Delete Selected Bugs"
        message={`Are you sure you want to delete ${selectedBugIds.length} selected bugs? This action cannot be undone.`}
        confirmText={`Delete ${selectedBugIds.length} Bugs`}
        cancelText="Cancel"
        onConfirm={
          handleConfirmBulkDelete
        }
        onCancel={
          handleCancelBulkDelete
        }
      />
    </>
  );
}