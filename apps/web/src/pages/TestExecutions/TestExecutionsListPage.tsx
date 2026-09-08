import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import SearchIcon from "@mui/icons-material/Search";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { useNavigate } from "react-router-dom";

import BugDialog from "../../components/bugs/BugDialog";
import TestExecutionTable from "../../components/testExecutions/TestExecutionTable";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { bugService } from "../../services/bugService";
import { testExecutionService } from "../../services/testExecutionService";
import { testRunService } from "../../services/testRunService";

import type { BugFormData } from "../../types/bugForm";
import type { TestExecution } from "../../types/testExecution";

interface TestExecutionListItem
  extends TestExecution {
  execution_type: string;
}

interface MetricCardProps {
  label: string;
  value: number;
  helper: string;
  tone?: "default" | "success" | "error" | "warning";
  icon: React.ReactNode;
}

function MetricCard({
  label,
  value,
  helper,
  tone = "default",
  icon,
}: MetricCardProps) {
  const styles = {
    default: {
      background: "#ffffff",
      iconBackground: "#f2f4f7",
      iconColor: "#475467",
    },
    success: {
      background: "#f8fffb",
      iconBackground: "#ecfdf3",
      iconColor: "#067647",
    },
    error: {
      background: "#fffafa",
      iconBackground: "#fef3f2",
      iconColor: "#b42318",
    },
    warning: {
      background: "#fffdf7",
      iconBackground: "#fffaeb",
      iconColor: "#b54708",
    },
  }[tone];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "11px",
        borderColor: "#e4e7ec",
        background: styles.background,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          p: 1.4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.67rem",
              fontWeight: 800,
              color: "#667085",
              textTransform: "uppercase",
              letterSpacing: "0.045em",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: "1.3rem",
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#101828",
              letterSpacing: "-0.025em",
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: "0.67rem",
              color: "#98a2b3",
            }}
          >
            {helper}
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
            flexShrink: 0,
            backgroundColor:
              styles.iconBackground,
            color: styles.iconColor,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

export default function TestExecutionsListPage() {
  const [executions, setExecutions] =
    useState<TestExecutionListItem[]>([]);

  const [allExecutions, setAllExecutions] =
    useState<TestExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [bugDialogOpen, setBugDialogOpen] =
    useState(false);

  const [
    selectedExecutionId,
    setSelectedExecutionId,
  ] = useState<number | undefined>(
    undefined,
  );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [executionTypeFilter, setExecutionTypeFilter] =
    useState("All");

  const [runFilter, setRunFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("latest");

  const { selectedProject } =
    useWorkspace();

  const { showNotification } =
    useNotification();

  const navigate = useNavigate();

  async function loadData() {
    if (!selectedProject) {
      setExecutions([]);
      setAllExecutions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        executionData,
        runData,
      ] = await Promise.all([
        testExecutionService.getExecutions(),
        testRunService.getTestRuns(
          selectedProject.id,
        ),
      ]);

      const projectRunIds = new Set(
        runData.map(
          (testRun) => testRun.id,
        ),
      );

      const projectExecutions =
        executionData
          .filter((execution) =>
            projectRunIds.has(
              execution.run_id,
            ),
          )
          .map((execution) => {
            const testRun = runData.find(
              (run) =>
                run.id ===
                execution.run_id,
            );

            return {
              ...execution,
              execution_type:
                testRun?.execution_type ??
                "-",
            };
          });

      setAllExecutions(
        executionData,
      );

      setExecutions(
        projectExecutions,
      );

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load test executions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const statusCounts = useMemo(() => {
    return {
      all: executions.length,
      passed: executions.filter(
        (execution) =>
          execution.status === "Passed",
      ).length,
      failed: executions.filter(
        (execution) =>
          execution.status === "Failed",
      ).length,
      blocked: executions.filter(
        (execution) =>
          execution.status === "Blocked",
      ).length,
      notExecuted: executions.filter(
        (execution) =>
          execution.status ===
          "Not Executed",
      ).length,
    };
  }, [executions]);

  const executionTypes = useMemo(() => {
    return Array.from(
      new Set(
        executions
          .map(
            (execution) =>
              execution.execution_type,
          )
          .filter(
            (value) =>
              value && value !== "-",
          ),
      ),
    ).sort();
  }, [executions]);

  const runOptions = useMemo(() => {
    const uniqueRuns = new Map<
      number,
      string
    >();

    executions.forEach((execution) => {
      uniqueRuns.set(
        execution.run_id,
        `${execution.test_run.run_code} · ${execution.test_run.name}`,
      );
    });

    return Array.from(
      uniqueRuns.entries(),
    ).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [executions]);

  const filteredExecutions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      const result =
        executions.filter(
          (execution) => {
            const matchesSearch =
              !query ||
              execution.id
                .toString()
                .includes(query) ||
              execution.test_case.test_case_code
                .toLowerCase()
                .includes(query) ||
              execution.test_case.title
                .toLowerCase()
                .includes(query) ||
              execution.test_run.run_code
                .toLowerCase()
                .includes(query) ||
              execution.test_run.name
                .toLowerCase()
                .includes(query);

            const matchesStatus =
              statusFilter === "All" ||
              execution.status ===
                statusFilter;

            const matchesType =
              executionTypeFilter ===
                "All" ||
              execution.execution_type ===
                executionTypeFilter;

            const matchesRun =
              runFilter === "All" ||
              execution.run_id ===
                Number(runFilter);

            return (
              matchesSearch &&
              matchesStatus &&
              matchesType &&
              matchesRun
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          switch (sortBy) {
            case "oldest":
              return (
                new Date(
                  a.executed_at ??
                    a.created_at,
                ).getTime() -
                new Date(
                  b.executed_at ??
                    b.created_at,
                ).getTime()
              );

            case "execution":
              return a.id - b.id;

            case "testCase":
              return a.test_case.test_case_code.localeCompare(
                b.test_case.test_case_code,
              );

            case "status":
              return a.status.localeCompare(
                b.status,
              );

            case "latest":
            default:
              return (
                new Date(
                  b.executed_at ??
                    b.created_at,
                ).getTime() -
                new Date(
                  a.executed_at ??
                    a.created_at,
                ).getTime()
              );
          }
        },
      );
    }, [
      executions,
      search,
      statusFilter,
      executionTypeFilter,
      runFilter,
      sortBy,
    ]);

  function handleViewRun(
    execution: TestExecutionListItem,
  ) {
    navigate(
      `/test-runs/${execution.run_id}`,
    );
  }

  function handleCreateBug(
    execution: TestExecutionListItem,
  ) {
    setSelectedExecutionId(
      execution.id,
    );

    setBugDialogOpen(true);
  }

  function handleCloseBugDialog() {
    setBugDialogOpen(false);
    setSelectedExecutionId(
      undefined,
    );
  }

  async function handleSaveBug(
    data: BugFormData,
  ) {
    try {
      await bugService.createBug(
        data,
      );

      showNotification(
        "Bug created successfully.",
        "success",
      );

      handleCloseBugDialog();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to create bug.",
        "error",
      );

      throw error;
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "55vh",
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
      <Box sx={{ width: "100%" }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "11px",
            borderColor: "#fecdca",
            backgroundColor: "#fffafa",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#b42318",
            }}
          >
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 1.35,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.45rem",
              lineHeight: 1.2,
              fontWeight: 800,
              color: "#101828",
              letterSpacing: "-0.035em",
            }}
          >
            Test Executions
          </Typography>

          <Typography
            sx={{
              mt: 0.35,
              fontSize: "0.74rem",
              color: "#667085",
            }}
          >
            Monitor execution activity and
            investigate test results for the
            selected project.
          </Typography>
        </Box>

        <Chip
          label={`${filteredExecutions.length} of ${executions.length} executions`}
          size="small"
          sx={{
            height: 25,
            borderRadius: "7px",
            fontSize: "0.67rem",
            fontWeight: 700,
            color: "#475467",
            backgroundColor: "#f2f4f7",
            border:
              "1px solid #e4e7ec",
          }}
        />
      </Box>

      {/* KPI */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        <MetricCard
          label="Total"
          value={statusCounts.all}
          helper="All executions"
          icon={
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 800,
              }}
            >
              #
            </Typography>
          }
        />

        <MetricCard
          label="Passed"
          value={statusCounts.passed}
          helper="Successful"
          tone="success"
          icon={
            <CheckCircleIcon
              sx={{ fontSize: 18 }}
            />
          }
        />

        <MetricCard
          label="Failed"
          value={statusCounts.failed}
          helper="Needs attention"
          tone="error"
          icon={
            <ErrorIcon
              sx={{ fontSize: 18 }}
            />
          }
        />

        <MetricCard
          label="Blocked"
          value={statusCounts.blocked}
          helper="Blocked cases"
          tone="warning"
          icon={
            <BlockOutlinedIcon
              sx={{ fontSize: 18 }}
            />
          }
        />

        <MetricCard
          label="Not Executed"
          value={
            statusCounts.notExecuted
          }
          helper="Remaining"
          icon={
            <HourglassEmptyIcon
              sx={{ fontSize: 18 }}
            />
          }
        />
      </Box>

      {/* Filters */}
      <Paper
        variant="outlined"
        sx={{
          mt: 1.35,
          p: 1.25,
          borderRadius: "11px",
          borderColor: "#e4e7ec",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(220px, 1.8fr) repeat(2, minmax(140px, 1fr))",
              lg: "minmax(280px, 2fr) repeat(3, minmax(145px, 1fr)) minmax(145px, 0.9fr)",
            },
            gap: 0.85,
          }}
        >
          <TextField
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search executions, test cases or runs..."
            size="small"
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  height: 34,
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  backgroundColor:
                    "#ffffff",
                },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 0.8,
                      fontSize: 16,
                      color: "#98a2b3",
                    }}
                  />
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
            displayEmpty
            sx={{
              height: 34,
              borderRadius: "8px",
              fontSize: "0.72rem",
              backgroundColor:
                "#ffffff",
            }}
          >
            <MenuItem value="All">
              All Statuses
            </MenuItem>

            <MenuItem value="Passed">
              Passed
            </MenuItem>

            <MenuItem value="Failed">
              Failed
            </MenuItem>

            <MenuItem value="Blocked">
              Blocked
            </MenuItem>

            <MenuItem value="Not Executed">
              Not Executed
            </MenuItem>
          </Select>

          <Select
            value={executionTypeFilter}
            onChange={(event) =>
              setExecutionTypeFilter(
                event.target.value,
              )
            }
            size="small"
            displayEmpty
            sx={{
              height: 34,
              borderRadius: "8px",
              fontSize: "0.72rem",
              backgroundColor:
                "#ffffff",
            }}
          >
            <MenuItem value="All">
              All Types
            </MenuItem>

            {executionTypes.map(
              (type) => (
                <MenuItem
                  key={type}
                  value={type}
                >
                  {type}
                </MenuItem>
              ),
            )}
          </Select>

          <Select
            value={runFilter}
            onChange={(event) =>
              setRunFilter(
                event.target.value,
              )
            }
            size="small"
            displayEmpty
            sx={{
              height: 34,
              borderRadius: "8px",
              fontSize: "0.72rem",
              backgroundColor:
                "#ffffff",
            }}
          >
            <MenuItem value="All">
              All Test Runs
            </MenuItem>

            {runOptions.map(
              ([runId, label]) => (
                <MenuItem
                  key={runId}
                  value={String(runId)}
                >
                  {label}
                </MenuItem>
              ),
            )}
          </Select>

          <Select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value,
              )
            }
            size="small"
            sx={{
              height: 34,
              borderRadius: "8px",
              fontSize: "0.72rem",
              backgroundColor:
                "#ffffff",
            }}
          >
            <MenuItem value="latest">
              Latest Executed
            </MenuItem>

            <MenuItem value="oldest">
              Oldest Executed
            </MenuItem>

            <MenuItem value="execution">
              Execution ID
            </MenuItem>

            <MenuItem value="testCase">
              Test Case
            </MenuItem>

            <MenuItem value="status">
              Status
            </MenuItem>
          </Select>
        </Box>

        {/* Status shortcuts */}
        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.45,
            flexWrap: "wrap",
          }}
        >
          {(
          [
            ["All", statusCounts.all],
            ["Passed", statusCounts.passed],
            ["Failed", statusCounts.failed],
            ["Blocked", statusCounts.blocked],
            ["Not Executed", statusCounts.notExecuted],
          ] as [string, number][]
          ).map(([label, count]) => {
            const selected =
              statusFilter === label;

            return (
              <Button
                key={label}
                size="small"
                onClick={() =>
                  setStatusFilter(
                    label,
                  )
                }
                sx={{
                  minHeight: 27,
                  px: 0.9,
                  borderRadius: "7px",
                  textTransform:
                    "none",
                  fontSize: "0.68rem",
                  fontWeight: selected
                    ? 750
                    : 600,
                  color: selected
                    ? "#2447a8"
                    : "#667085",
                  backgroundColor:
                    selected
                      ? "#eef4ff"
                      : "transparent",
                  border:
                    "1px solid",
                  borderColor:
                    selected
                      ? "#c7d7fe"
                      : "transparent",
                  "&:hover": {
                    backgroundColor:
                      selected
                        ? "#eef4ff"
                        : "#f9fafb",
                  },
                }}
              >
                {label} {count}
              </Button>
            );
          })}
        </Box>
      </Paper>

      {/* Activity summary */}
      <Box
        sx={{
          mt: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.94rem",
              fontWeight: 750,
              color: "#101828",
            }}
          >
            Execution Activity
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: "0.7rem",
              color: "#667085",
            }}
          >
            Review individual execution
            outcomes and jump directly to
            their Test Runs.
          </Typography>
        </Box>

        {selectedProject && (
          <Chip
            icon={
              <PlayArrowOutlinedIcon
                sx={{
                  fontSize: 15,
                }}
              />
            }
            label="Selected project"
            size="small"
            sx={{
              height: 24,
              borderRadius: "7px",
              fontSize: "0.66rem",
              fontWeight: 700,
              color: "#475467",
              backgroundColor:
                "#f2f4f7",
              border:
                "1px solid #e4e7ec",
            }}
          />
        )}
      </Box>

      {/* Existing table */}
      <Box sx={{ mt: 0.8 }}>
        <TestExecutionTable
          executions={filteredExecutions}
          onViewRun={handleViewRun}
          onCreateBug={handleCreateBug}
        />
      </Box>

      {/* Bug dialog */}
      <BugDialog
        title="Create Bug"
        open={bugDialogOpen}
        executions={allExecutions}
        initialExecutionId={
          selectedExecutionId
        }
        onClose={
          handleCloseBugDialog
        }
        onSave={handleSaveBug}
      />
    </Box>
  );
}