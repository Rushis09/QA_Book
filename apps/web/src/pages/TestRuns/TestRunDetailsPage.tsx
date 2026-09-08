import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SearchIcon from "@mui/icons-material/Search";

import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

import { getTestRunStatusColor } from "../../utils/testRunStatus";

import { testRunService } from "../../services/testRunService";
import { testExecutionService } from "../../services/testExecutionService";

import type { TestRun } from "../../types/testRun";
import type {
  TestExecution,
  TestExecutionSummary,
} from "../../types/testExecution";

function formatDateOnly(value: string | null) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "-";
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const normalizedValue =
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      ? value
      : `${value}Z`;

  return new Date(
    normalizedValue,
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExecutionStatusColor(
  status: string,
) {
  switch (status) {
    case "Passed":
      return "success" as const;

    case "Failed":
      return "error" as const;

    case "Blocked":
      return "warning" as const;

    default:
      return "default" as const;
  }
}

function getExecutionStatusSx(status: string) {
  switch (status) {
    case "Passed":
      return {
        color: "#157347",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    case "Failed":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "Blocked":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#d0d5dd",
      };
  }
}

interface MetricCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "error" | "warning";
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: MetricCardProps) {
  const toneStyles = {
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
        height: "100%",
        borderRadius: "11px",
        borderColor: "#e4e7ec",
        background: toneStyles.background,
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          p: 1.45,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 700,
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
              fontSize: "1.28rem",
              lineHeight: 1.15,
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
              fontSize: "0.68rem",
              color: "#98a2b3",
              whiteSpace: "nowrap",
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
              toneStyles.iconBackground,
            color: toneStyles.iconColor,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: "0.67rem",
          fontWeight: 700,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: "0.79rem",
          fontWeight: 600,
          color: "#101828",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 1.45,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            sx={{
              fontSize: "0.64rem",
              fontWeight: 800,
              color: "#356dff",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              mb: 0.25,
            }}
          >
            {eyebrow}
          </Typography>
        )}

        <Typography
          sx={{
            fontSize: "0.96rem",
            lineHeight: 1.25,
            fontWeight: 750,
            color: "#101828",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            sx={{
              mt: 0.3,
              fontSize: "0.73rem",
              color: "#667085",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {action}
    </Box>
  );
}

export default function TestRunDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testRun, setTestRun] =
    useState<TestRun | null>(null);

  const [summary, setSummary] =
    useState<TestExecutionSummary | null>(
      null,
    );

  const [executions, setExecutions] =
    useState<TestExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [copied, setCopied] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [expandedExecutionId, setExpandedExecutionId] =
    useState<number | null>(null);

  useEffect(() => {
    async function loadTestRun() {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const runId = Number(id);

        const [
          runData,
          summaryData,
          executionData,
        ] = await Promise.all([
          testRunService.getTestRun(runId),
          testExecutionService.getExecutionSummary(
            runId,
          ),
          testExecutionService.getRunExecutions(
            runId,
          ),
        ]);

        setTestRun(runData);
        setSummary(summaryData);
        setExecutions(executionData);
      } catch {
        setError(
          "Unable to load Test Run details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTestRun();
  }, [id]);

  async function handleCopyAutomationCommand() {
    if (
      !testRun ||
      testRun.execution_type !== "Automated" ||
      !testRun.automation_token
    ) {
      return;
    }

    const command = `pytest --qabook-token "${testRun.automation_token}"`;

    await navigator.clipboard.writeText(command);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleExecute() {
    if (!testRun) {
      return;
    }

    navigate(
      `/test-runs/${testRun.id}/execute`,
    );
  }

  const statusOptions = useMemo(() => {
    const values = new Set(
      executions.map(
        (execution) => execution.status,
      ),
    );

    return [
      "All",
      ...Array.from(values).sort(),
    ];
  }, [executions]);

  const filteredExecutions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return executions.filter((execution) => {
      const matchesSearch =
        !query ||
        execution.test_case.test_case_code
          .toLowerCase()
          .includes(query) ||
        execution.test_case.title
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        execution.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    executions,
    search,
    statusFilter,
  ]);

  const hasFailures =
    (summary?.failed ?? 0) > 0;

  const executionPercentage =
    summary && summary.total > 0
      ? Math.round(
          ((summary.total -
            summary.not_executed) /
            summary.total) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !testRun) {
    return (
      <Box
        sx={{
          width: "100%",
          py: 4,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: "12px",
            borderColor: "#fecdca",
            backgroundColor: "#fffafa",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#b42318",
            }}
          >
            {error ?? "Test Run not found."}
          </Typography>

          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate("/test-runs")
            }
            sx={{
              mt: 1.5,
              textTransform: "none",
              fontSize: "0.76rem",
            }}
          >
            Back to Test Runs
          </Button>
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
      {/* Back */}
      <Button
        startIcon={
          <ArrowBackIcon sx={{ fontSize: 17 }} />
        }
        onClick={() =>
          navigate("/test-runs")
        }
        sx={{
          minHeight: 30,
          px: 0.65,
          mb: 1.25,
          textTransform: "none",
          fontSize: "0.75rem",
          fontWeight: 650,
          color: "#475467",
          "&:hover": {
            backgroundColor: "transparent",
            color: "#101828",
          },
        }}
      >
        Back to Test Runs
      </Button>

      {/* Hero */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: "13px",
          borderColor: "#d9e2f2",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            height: 3,
            background:
              "linear-gradient(90deg, #356dff, #7c9cff)",
          }}
        />

        <Box
          sx={{
            p: { xs: 1.7, md: 2.1 },
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#356dff",
                  letterSpacing: "0.055em",
                }}
              >
                {testRun.run_code}
              </Typography>

              <Chip
                label={testRun.execution_type}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  backgroundColor:
                    testRun.execution_type ===
                    "Automated"
                      ? "#eef4ff"
                      : "#f2f4f7",
                  color:
                    testRun.execution_type ===
                    "Automated"
                      ? "#3157b7"
                      : "#475467",
                  border:
                    "1px solid",
                  borderColor:
                    testRun.execution_type ===
                    "Automated"
                      ? "#c7d7fe"
                      : "#d0d5dd",
                }}
              />

              <Chip
                label={testRun.status}
                color={getTestRunStatusColor(
                  testRun.status,
                )}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Typography
              sx={{
                mt: 0.65,
                fontSize: "1.35rem",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#101828",
                letterSpacing: "-0.035em",
              }}
            >
              {testRun.name}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: "0.76rem",
                color: "#667085",
              }}
            >
              {testRun.suite.suite_code} ·{" "}
              {testRun.suite.name}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <PlayArrowOutlinedIcon
                  sx={{ fontSize: 17 }}
                />
              }
              onClick={handleExecute}
              sx={{
                height: 32,
                px: 1.2,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.73rem",
                fontWeight: 700,
                borderColor: "#d0d5dd",
                color: "#344054",
              }}
            >
              Execute
            </Button>

            {testRun.execution_type ===
              "Automated" &&
              testRun.automation_token && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    <ContentCopyIcon
                      sx={{ fontSize: 16 }}
                    />
                  }
                  onClick={
                    handleCopyAutomationCommand
                  }
                  sx={{
                    height: 32,
                    px: 1.2,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "0.73rem",
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  {copied
                    ? "Copied"
                    : "Copy Command"}
                </Button>
              )}
          </Box>
        </Box>
      </Paper>

      {/* Health */}
      <Box sx={{ mt: 1.35 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(6, minmax(0, 1fr))",
            },
            gap: 1,
          }}
        >
          <MetricCard
            label="Total"
            value={summary?.total ?? 0}
            helper="Test cases"
            icon={
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                }}
              >
                #
              </Typography>
            }
          />

          <MetricCard
            label="Passed"
            value={summary?.passed ?? 0}
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
            value={summary?.failed ?? 0}
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
            value={summary?.blocked ?? 0}
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
              summary?.not_executed ?? 0
            }
            helper="Remaining"
            icon={
              <HourglassEmptyIcon
                sx={{ fontSize: 18 }}
              />
            }
          />

          <MetricCard
            label="Pass Rate"
            value={`${summary?.pass_percentage ?? 0}%`}
            helper={`${executionPercentage}% executed`}
            tone={
              (summary?.pass_percentage ?? 0) >=
              80
                ? "success"
                : hasFailures
                  ? "error"
                  : "default"
            }
            icon={
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                }}
              >
                %
              </Typography>
            }
          />
        </Box>
      </Box>

      {/* Configuration */}
      <Paper
        variant="outlined"
        sx={{
          mt: 1.35,
          p: { xs: 1.6, md: 1.8 },
          borderRadius: "12px",
          borderColor: "#e4e7ec",
          boxShadow: "none",
        }}
      >
        <SectionHeader
          eyebrow="Run context"
          title="Run Configuration"
          description="Environment and execution context for this test run."
        />

        <Divider sx={{ mb: 1.55 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.65,
            rowGap: 1.45,
          }}
        >
          <InfoItem
            label="Test Suite"
            value={`${testRun.suite.suite_code} · ${testRun.suite.name}`}
          />

          <InfoItem
            label="Execution Type"
            value={testRun.execution_type}
          />

          <InfoItem
            label="Build Version"
            value={
              testRun.build_version ?? "-"
            }
          />

          <InfoItem
            label="Environment"
            value={testRun.environment ?? "-"}
          />

          <InfoItem
            label="Tester"
            value={testRun.tester ?? "-"}
          />

          <InfoItem
            label="Start Date"
            value={formatDateOnly(
              testRun.start_date,
            )}
          />

          <InfoItem
            label="End Date"
            value={formatDateOnly(
              testRun.end_date,
            )}
          />

          <InfoItem
            label="Run Status"
            value={testRun.status}
          />
        </Box>
      </Paper>

      {/* Automation */}
      {testRun.execution_type ===
        "Automated" &&
        testRun.automation_token && (
          <Paper
            variant="outlined"
            sx={{
              mt: 1.35,
              p: { xs: 1.6, md: 1.8 },
              borderRadius: "12px",
              borderColor: "#d9e2f2",
              background:
                "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
              boxShadow: "none",
            }}
          >
            <SectionHeader
              eyebrow="Automation"
              title="Automation Details"
              description="Execution is connected to the QABook automation pipeline."
              action={
                <Chip
                  label="Automated"
                  size="small"
                  sx={{
                    height: 23,
                    borderRadius: "6px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#3157b7",
                    backgroundColor: "#eef4ff",
                    border:
                      "1px solid #c7d7fe",
                  }}
                />
              }
            />

            <Divider sx={{ mb: 1.55 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 0.7fr) minmax(0, 1.3fr)",
                },
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: "9px",
                  border:
                    "1px solid #e4e7ec",
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Automation Token
                </Typography>

                <Box
                  sx={{
                    mt: 0.65,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily:
                        "monospace",
                      fontSize: "0.73rem",
                      color: "#344054",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {testRun.automation_token}
                  </Typography>

                  <Tooltip title="Copy token">
                    <IconButton
                      size="small"
                      onClick={async () => {
                        if (
                          testRun.automation_token
                        ) {
                          await navigator.clipboard.writeText(
                            testRun.automation_token,
                          );
                        }
                      }}
                      sx={{
                        width: 28,
                        height: 28,
                        border:
                          "1px solid #d0d5dd",
                        borderRadius: "7px",
                      }}
                    >
                      <ContentCopyIcon
                        sx={{
                          fontSize: 14,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  borderRadius: "9px",
                  border:
                    "1px solid #e4e7ec",
                  backgroundColor: "#101828",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#98a2b3",
                    textTransform:
                      "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Automation Command
                </Typography>

                <Box
                  sx={{
                    mt: 0.65,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily:
                        "monospace",
                      fontSize: "0.72rem",
                      color: "#f2f4f7",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    pytest --qabook-token
                    {" "}
                    {testRun.automation_token}
                  </Typography>

                  <Tooltip
                    title={
                      copied
                        ? "Copied"
                        : "Copy command"
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={
                        handleCopyAutomationCommand
                      }
                      sx={{
                        width: 28,
                        height: 28,
                        color: "#ffffff",
                        border:
                          "1px solid #475467",
                        borderRadius: "7px",
                      }}
                    >
                      <ContentCopyIcon
                        sx={{
                          fontSize: 14,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

      {/* Execution results */}
      <Paper
        variant="outlined"
        sx={{
          mt: 1.35,
          borderRadius: "12px",
          borderColor: "#e4e7ec",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            p: { xs: 1.6, md: 1.8 },
            pb: 1.25,
          }}
        >
          <SectionHeader
            eyebrow="Quality results"
            title="Execution Results"
            description="Review the outcome and details of every test case in this run."
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 0.45,
                flexWrap: "wrap",
              }}
            >
              {statusOptions.map(
                (status) => {
                  const count =
                    status === "All"
                      ? executions.length
                      : executions.filter(
                          (execution) =>
                            execution.status ===
                            status,
                        ).length;

                  const selected =
                    statusFilter === status;

                  return (
                    <Button
                      key={status}
                      onClick={() =>
                        setStatusFilter(
                          status,
                        )
                      }
                      size="small"
                      sx={{
                        minHeight: 27,
                        px: 0.85,
                        borderRadius: "7px",
                        textTransform: "none",
                        fontSize:
                          "0.69rem",
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
                      {status}
                      {" "}
                      {count}
                    </Button>
                  );
                },
              )}
            </Box>

            <TextField
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search test cases..."
              size="small"
              sx={{
                width: {
                  xs: "100%",
                  sm: 250,
                },
                "& .MuiOutlinedInput-root":
                  {
                    height: 32,
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    backgroundColor:
                      "#ffffff",
                  },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          fontSize: 16,
                          color:
                            "#98a2b3",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>

        <Divider />

        <Box
          sx={{
            px: { xs: 1.6, md: 1.8 },
            py: 0.85,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            backgroundColor: "#fcfcfd",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.69rem",
              color: "#667085",
            }}
          >
            Showing{" "}
            <strong>
              {filteredExecutions.length}
            </strong>{" "}
            of{" "}
            <strong>
              {executions.length}
            </strong>{" "}
            executions
          </Typography>

          <Select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            size="small"
            sx={{
              height: 29,
              minWidth: 125,
              borderRadius: "7px",
              fontSize: "0.7rem",
              backgroundColor:
                "#ffffff",
              "& .MuiSelect-select": {
                py: 0.35,
              },
            }}
          >
            {statusOptions.map(
              (status) => (
                <MenuItem
                  key={status}
                  value={status}
                  sx={{
                    fontSize: "0.72rem",
                  }}
                >
                  {status}
                </MenuItem>
              ),
            )}
          </Select>
        </Box>

        <TableContainer
          sx={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 760,
              "& .MuiTableCell-root": {
                borderColor: "#eef0f3",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    "#f9fafb",
                }}
              >
                <TableCell
                  sx={{
                    width: 42,
                    px: 1.2,
                  }}
                />

                <TableCell
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.045em",
                    py: 0.95,
                  }}
                >
                  Test Case
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.045em",
                  }}
                >
                  Priority
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.045em",
                  }}
                >
                  Result
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.045em",
                  }}
                >
                  Executed By
                </TableCell>

                <TableCell
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "#667085",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.045em",
                  }}
                >
                  Executed At
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredExecutions.length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      py: 5,
                      textAlign:
                        "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.78rem",
                        fontWeight: 700,
                        color:
                          "#475467",
                      }}
                    >
                      No executions
                      found
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize:
                          "0.7rem",
                        color:
                          "#98a2b3",
                      }}
                    >
                      Try changing the
                      search or status
                      filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {filteredExecutions.map(
                (execution) => {
                  const expanded =
                    expandedExecutionId ===
                    execution.id;

                  const statusSx =
                    getExecutionStatusSx(
                      execution.status,
                    );

                  return (
                    <>
                      <TableRow
                        key={
                          execution.id
                        }
                        hover
                        onClick={() =>
                          setExpandedExecutionId(
                            expanded
                              ? null
                              : execution.id,
                          )
                        }
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor:
                              "#fafbff",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            px: 1.2,
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              width: 26,
                              height: 26,
                              border:
                                "1px solid #e4e7ec",
                              borderRadius:
                                "7px",
                              transform:
                                expanded
                                  ? "rotate(180deg)"
                                  : "none",
                              transition:
                                "transform 160ms ease",
                            }}
                          >
                            <ExpandMoreIcon
                              sx={{
                                fontSize: 16,
                              }}
                            />
                          </IconButton>
                        </TableCell>

                        <TableCell
                          sx={{
                            py: 1,
                            maxWidth: 380,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize:
                                "0.73rem",
                              fontWeight: 750,
                              color:
                                "#101828",
                            }}
                          >
                            {
                              execution
                                .test_case
                                .test_case_code
                            }
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.15,
                              fontSize:
                                "0.69rem",
                              color:
                                "#667085",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              execution
                                .test_case
                                .title
                            }
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              execution
                                .test_case
                                .priority
                            }
                            size="small"
                            sx={{
                              height: 22,
                              borderRadius:
                                "6px",
                              fontSize:
                                "0.63rem",
                              fontWeight: 700,
                              color:
                                "#475467",
                              backgroundColor:
                                "#f2f4f7",
                              border:
                                "1px solid #e4e7ec",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              execution.status
                            }
                            size="small"
                            color={getExecutionStatusColor(
                              execution.status,
                            )}
                            sx={{
                              height: 22,
                              borderRadius:
                                "6px",
                              fontSize:
                                "0.63rem",
                              fontWeight: 700,
                              ...statusSx,
                              border:
                                "1px solid",
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize:
                              "0.7rem",
                            color:
                              "#475467",
                          }}
                        >
                          {
                            execution.executed_by ??
                            "-"
                          }
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize:
                              "0.69rem",
                            color:
                              "#667085",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDateTime(
                            execution.executed_at,
                          )}
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow
                          key={`${execution.id}-details`}
                        >
                          <TableCell
                            colSpan={6}
                            sx={{
                              p: 0,
                              backgroundColor:
                                "#f8fafc",
                            }}
                          >
                            <Box
                              sx={{
                                p: {
                                  xs: 1.5,
                                  md: 1.8,
                                },
                                borderTop:
                                  "1px solid #eef0f3",
                              }}
                            >
                              <Box
                                sx={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    {
                                      xs: "1fr",
                                      md: "repeat(2, minmax(0, 1fr))",
                                    },
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 1.2,
                                    borderRadius:
                                      "9px",
                                    backgroundColor:
                                      "#ffffff",
                                    border:
                                      "1px solid #e4e7ec",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        800,
                                      color:
                                        "#667085",
                                      textTransform:
                                        "uppercase",
                                      letterSpacing:
                                        "0.04em",
                                    }}
                                  >
                                    Preconditions
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize:
                                        "0.72rem",
                                      lineHeight:
                                        1.55,
                                      color:
                                        "#344054",
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {execution
                                      .test_case
                                      .preconditions ??
                                      "No preconditions provided."}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.2,
                                    borderRadius:
                                      "9px",
                                    backgroundColor:
                                      "#ffffff",
                                    border:
                                      "1px solid #e4e7ec",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        800,
                                      color:
                                        "#667085",
                                      textTransform:
                                        "uppercase",
                                      letterSpacing:
                                        "0.04em",
                                    }}
                                  >
                                    Test Steps
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize:
                                        "0.72rem",
                                      lineHeight:
                                        1.55,
                                      color:
                                        "#344054",
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {execution
                                      .test_case
                                      .steps ??
                                      "No test steps provided."}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.2,
                                    borderRadius:
                                      "9px",
                                    backgroundColor:
                                      "#ffffff",
                                    border:
                                      "1px solid #e4e7ec",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        800,
                                      color:
                                        "#667085",
                                      textTransform:
                                        "uppercase",
                                      letterSpacing:
                                        "0.04em",
                                    }}
                                  >
                                    Expected Result
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize:
                                        "0.72rem",
                                      lineHeight:
                                        1.55,
                                      color:
                                        "#344054",
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {execution
                                      .test_case
                                      .expected_result ??
                                      "No expected result provided."}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.2,
                                    borderRadius:
                                      "9px",
                                    backgroundColor:
                                      execution.status ===
                                      "Failed"
                                        ? "#fffafa"
                                        : "#ffffff",
                                    border:
                                      "1px solid",
                                    borderColor:
                                      execution.status ===
                                      "Failed"
                                        ? "#fecdca"
                                        : "#e4e7ec",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        800,
                                      color:
                                        execution.status ===
                                        "Failed"
                                          ? "#b42318"
                                          : "#667085",
                                      textTransform:
                                        "uppercase",
                                      letterSpacing:
                                        "0.04em",
                                    }}
                                  >
                                    Actual Result
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize:
                                        "0.72rem",
                                      lineHeight:
                                        1.55,
                                      color:
                                        "#344054",
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {execution
                                      .actual_result ??
                                      "No actual result recorded."}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    gridColumn:
                                      {
                                        xs: "auto",
                                        md: "1 / -1",
                                      },
                                    p: 1.2,
                                    borderRadius:
                                      "9px",
                                    backgroundColor:
                                      "#ffffff",
                                    border:
                                      "1px solid #e4e7ec",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize:
                                        "0.65rem",
                                      fontWeight:
                                        800,
                                      color:
                                        "#667085",
                                      textTransform:
                                        "uppercase",
                                      letterSpacing:
                                        "0.04em",
                                    }}
                                  >
                                    Execution Comments
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize:
                                        "0.72rem",
                                      lineHeight:
                                        1.55,
                                      color:
                                        "#344054",
                                      whiteSpace:
                                        "pre-wrap",
                                    }}
                                  >
                                    {execution
                                      .comments ??
                                      "No comments recorded."}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                },
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}