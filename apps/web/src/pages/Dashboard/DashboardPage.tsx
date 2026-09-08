import {
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import { dashboardService } from "../../services/dashboardService";
import type { DashboardSummary } from "../../types/dashboard";

interface SnapshotCardProps {
  label: string;
  value: string;
  supporting: string;
  icon: ReactNode;
  accent: "blue" | "purple" | "cyan";
}

function SnapshotCard({
  label,
  value,
  supporting,
  icon,
  accent,
}: SnapshotCardProps) {
  const accentMap = {
    blue: {
      background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 100%)",
      iconBackground: "#e5f0ff",
      iconColor: "#1677ff",
    },
    purple: {
      background: "linear-gradient(135deg, #f5f0ff 0%, #ffffff 100%)",
      iconBackground: "#eee7ff",
      iconColor: "#7c3aed",
    },
    cyan: {
      background: "linear-gradient(135deg, #ecfbff 0%, #ffffff 100%)",
      iconBackground: "#ddf7ff",
      iconColor: "#0891b2",
    },
  };

  const colors = accentMap[accent];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.1,
        minHeight: 88,
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        background: colors.background,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.iconBackground,
            color: colors.iconColor,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: "0.55rem",
            fontWeight: 700,
            color: "#8a94a6",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          QA metric
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.65,
          fontSize: "1.35rem",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.045em",
          color: "#101828",
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: "0.68rem",
          fontWeight: 650,
          color: "#475467",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: "0.57rem",
          color: "#98a2b3",
        }}
      >
        {supporting}
      </Typography>
    </Paper>
  );
}

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <Box sx={{ mb: 0.85 }}>
      <Typography
        sx={{
          fontSize: "0.55rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#1677ff",
        }}
      >
        {eyebrow}
      </Typography>

      <Typography
        component="h2"
        sx={{
          mt: 0.2,
          fontSize: "0.9rem",
          fontWeight: 750,
          letterSpacing: "-0.025em",
          color: "#101828",
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            mt: 0.15,
            fontSize: "0.6rem",
            color: "#7a8597",
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

interface LifecycleStepProps {
  label: string;
  value: number;
  path: string;
  active?: boolean;
  icon: ReactNode;
}

function LifecycleStep({
  label,
  value,
  path,
  active = false,
  icon,
}: LifecycleStepProps) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(path)}
      sx={{
        flex: "1 1 105px",
        minWidth: 88,
        p: 0.75,
        borderRadius: "8px",
        border: active
          ? "1px solid #cfe0f7"
          : "1px solid #e8edf3",
        backgroundColor: active ? "#f5f9ff" : "#ffffff",
        cursor: "pointer",
        transition:
          "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: "#c8d8eb",
          boxShadow: "0 4px 12px rgba(16,24,40,0.06)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 23,
            height: 23,
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: active ? "#e5f0ff" : "#f3f6fa",
            color: active ? "#1677ff" : "#667085",
          }}
        >
          {icon}
        </Box>

        <ArrowForwardRoundedIcon
          sx={{
            fontSize: 12,
            color: "#b1bac8",
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 0.45,
          fontSize: "0.57rem",
          fontWeight: 650,
          color: "#667085",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.02,
          fontSize: "0.92rem",
          fontWeight: 800,
          lineHeight: 1,
          color: "#101828",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function HealthBar({
  passed,
  failed,
  blocked,
  notExecuted,
  total,
}: {
  passed: number;
  failed: number;
  blocked: number;
  notExecuted: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <Box
        sx={{
          height: 6,
          borderRadius: 20,
          backgroundColor: "#edf1f6",
        }}
      />
    );
  }

  const getWidth = (value: number) =>
    `${(value / total) * 100}%`;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: 6,
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: "#edf1f6",
      }}
    >
      {passed > 0 && (
        <Box
          sx={{
            width: getWidth(passed),
            backgroundColor: "#22c55e",
          }}
        />
      )}

      {failed > 0 && (
        <Box
          sx={{
            width: getWidth(failed),
            backgroundColor: "#ef4444",
          }}
        />
      )}

      {blocked > 0 && (
        <Box
          sx={{
            width: getWidth(blocked),
            backgroundColor: "#f59e0b",
          }}
        />
      )}

      {notExecuted > 0 && (
        <Box
          sx={{
            width: getWidth(notExecuted),
            backgroundColor: "#dce3ec",
          }}
        />
      )}
    </Box>
  );
}

function HealthLegend({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.4,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />

      <Typography
        sx={{
          fontSize: "0.57rem",
          color: "#667085",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.57rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function AttentionItem({
  icon,
  title,
  description,
  path,
  severity = "warning",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  path: string;
  severity?: "warning" | "info";
}) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(path)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.7,
        p: 0.6,
        borderRadius: "7px",
        cursor: "pointer",
        transition: "background-color 150ms ease",
        "&:hover": {
          backgroundColor: "#f7f9fc",
        },
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            severity === "warning" ? "#fff7ed" : "#eff6ff",
          color:
            severity === "warning" ? "#ea580c" : "#1677ff",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.63rem",
            fontWeight: 700,
            color: "#344054",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.08,
            fontSize: "0.55rem",
            lineHeight: 1.25,
            color: "#8a94a6",
          }}
        >
          {description}
        </Typography>
      </Box>

      <ArrowForwardRoundedIcon
        sx={{
          ml: "auto",
          flexShrink: 0,
          fontSize: 12,
          color: "#b1bac8",
        }}
      />
    </Box>
  );
}

function StatusRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.35,
        borderBottom: "1px solid #f0f2f5",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.6,
        }}
      >
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />

        <Typography
          sx={{
            fontSize: "0.6rem",
            color: "#667085",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: "0.64rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data =
          await dashboardService.getSummary();

        setSummary(data);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const execution = summary?.execution_health;

  const defects =
    summary?.defect_health ?? {
      total: 0,
      open: 0,
      in_progress: 0,
      fixed: 0,
      closed: 0,
      reopened: 0,
    };

  const requirements =
    summary?.requirement_health ?? {
      total: 0,
      covered: 0,
      coverage_percentage: 0,
    };

  const automation =
    summary?.automation_health ?? {
      automation_projects: 0,
      mapped_test_cases: 0,
      github_connections: 0,
    };

  const passRate =
    execution?.pass_percentage ?? 0;

  const executionProgress =
    execution?.execution_percentage ?? 0;

  const coverage =
    requirements.coverage_percentage ?? 0;

  const executed =
    execution?.executed ?? 0;

  const failed =
    execution?.failed ?? 0;

  const notExecuted =
    execution?.not_executed ?? 0;

  const uncoveredRequirements = Math.max(
    0,
    requirements.total -
      requirements.covered,
  );

  const healthLabel = useMemo(() => {
    if (executed === 0) {
      return "No executions yet";
    }

    if (passRate >= 80) {
      return "Healthy execution results";
    }

    if (passRate >= 50) {
      return "Testing needs attention";
    }

    return "Testing needs focus";
  }, [executed, passRate]);

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
        <CircularProgress
          size={26}
          thickness={4}
        />
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box
        sx={{
          width: "100%",
          py: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "10px",
            border: "1px solid #e4e9f0",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#101828",
            }}
          >
            Unable to load dashboard data.
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: "0.65rem",
              color: "#667085",
            }}
          >
            Please refresh the workspace and
            try again.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        mx: 0,
        pb: 1.5,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent: "space-between",
          gap: 1.1,
          mb: 1.5,
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.3rem",
                md: "1.45rem",
              },
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1.1,
              color: "#101828",
            }}
          >
            QA Command Center
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: "0.62rem",
              color: "#667085",
            }}
          >
            Monitor quality, execution progress,
            coverage, defects, and automation from
            one workspace.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.55,
            px: 0.85,
            py: 0.45,
            borderRadius: "7px",
            border: "1px solid #dce8f5",
            backgroundColor: "#f7fbff",
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow:
                "0 0 0 3px rgba(34,197,94,0.10)",
            }}
          />

          <Typography
            sx={{
              fontSize: "0.55rem",
              fontWeight: 700,
              color: "#475467",
            }}
          >
            Workspace connected
          </Typography>
        </Box>
      </Box>

      
      
      {/* QA Inventory */}
      <Paper
        elevation={0}
        sx={{
          mb: 1.1,
          px: 1,
          py: 0.7,
          borderRadius: "8px",
          border: "1px solid #e3e8ef",
          background:
            "linear-gradient(90deg, #f8fbff 0%, #ffffff 50%, #faf8ff 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.9,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.54rem",
              fontWeight: 750,
              color: "#667085",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mr: 0.15,
            }}
          >
            QA inventory
          </Typography>
          
          {[
            ["Projects", summary.projects],
            ["Requirements", summary.requirements],
            ["Scenarios", summary.test_scenarios],
            ["Cases", summary.test_cases],
            ["Suites", summary.test_suites],
            ["Runs", summary.test_runs],
            ["Executions", summary.test_executions],
            ["Bugs", summary.bugs],
          ].map(([label, value]) => (
            <Box
              key={String(label)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.35,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.53rem",
                  color: "#8a94a6",
                }}
              >
                {label}
              </Typography>
              
              <Typography
                sx={{
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  color: "#344054",
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
        
      {/* Quality snapshot */}
      <SectionTitle
        eyebrow="Quality snapshot"
        title="Current quality position"
        description="Separate execution progress from the pass rate of tests that have actually run."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 1,
          mb: 1.5,
        }}
      >
        <SnapshotCard
          label="Pass rate"
          value={`${passRate}%`}
          supporting={`${execution?.passed ?? 0} of ${executed} executed tests passed`}
          accent="blue"
          icon={
            <CheckCircleRoundedIcon
              sx={{ fontSize: 16 }}
            />
          }
        />

        <SnapshotCard
          label="Execution progress"
          value={`${executionProgress}%`}
          supporting={`${executed} of ${execution?.total ?? 0} executions completed`}
          accent="cyan"
          icon={
            <PlayCircleRoundedIcon
              sx={{ fontSize: 16 }}
            />
          }
        />

        <SnapshotCard
          label="Requirement coverage"
          value={`${coverage}%`}
          supporting={`${requirements.covered} of ${requirements.total} requirements covered`}
          accent="purple"
          icon={
            <ChecklistRoundedIcon
              sx={{ fontSize: 16 }}
            />
          }
        />
      </Box>

      {/* Execution + Attention */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.65fr) minmax(280px, 0.9fr)",
          },
          gap: 1,
          mb: 1.5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <SectionTitle
            eyebrow="Execution health"
            title="Test execution distribution"
            description="A breakdown of executed and pending test results."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(4, 1fr)",
              },
              gap: 0.7,
              mb: 1,
            }}
          >
            {[
              {
                label: "PASSED",
                value: execution?.passed ?? 0,
                bg: "#f0fdf4",
                labelColor: "#16a34a",
                valueColor: "#166534",
              },
              {
                label: "FAILED",
                value: execution?.failed ?? 0,
                bg: "#fef2f2",
                labelColor: "#dc2626",
                valueColor: "#991b1b",
              },
              {
                label: "BLOCKED",
                value: execution?.blocked ?? 0,
                bg: "#fffbeb",
                labelColor: "#d97706",
                valueColor: "#92400e",
              },
              {
                label: "NOT EXECUTED",
                value: notExecuted,
                bg: "#f3f4f6",
                labelColor: "#667085",
                valueColor: "#344054",
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 0.8,
                  borderRadius: "8px",
                  backgroundColor: item.bg,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.53rem",
                    color: item.labelColor,
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.1,
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: item.valueColor,
                    lineHeight: 1.1,
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <HealthBar
            passed={execution?.passed ?? 0}
            failed={execution?.failed ?? 0}
            blocked={execution?.blocked ?? 0}
            notExecuted={notExecuted}
            total={execution?.total ?? 0}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.15,
              flexWrap: "wrap",
              mt: 0.6,
            }}
          >
            <HealthLegend
              label="Passed"
              value={execution?.passed ?? 0}
              color="#22c55e"
            />

            <HealthLegend
              label="Failed"
              value={execution?.failed ?? 0}
              color="#ef4444"
            />

            <HealthLegend
              label="Blocked"
              value={execution?.blocked ?? 0}
              color="#f59e0b"
            />

            <HealthLegend
              label="Pending"
              value={notExecuted}
              color="#dce3ec"
            />
          </Box>

          <Box
            sx={{
              mt: 0.9,
              p: 0.8,
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              border: "1px solid #edf1f5",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              {healthLabel}
            </Typography>

            <Typography
              sx={{
                mt: 0.1,
                fontSize: "0.55rem",
                color: "#8a94a6",
              }}
            >
              {executed} tests have executed so far.
              The current pass rate is calculated only
              from those executed tests.
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <SectionTitle
            eyebrow="Needs attention"
            title="What needs review"
            description="Prioritize the areas that currently require QA attention."
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.02,
            }}
          >
            {failed > 0 && (
              <AttentionItem
                title={`${failed} failed execution${failed === 1 ? "" : "s"}`}
                description="Review failed test executions and determine whether defects require retesting."
                path="/test-executions"
                icon={
                  <WarningAmberRoundedIcon
                    sx={{ fontSize: 14 }}
                  />
                }
              />
            )}

            {notExecuted > 0 && (
              <AttentionItem
                title={`${notExecuted} test${notExecuted === 1 ? "" : "s"} not executed`}
                description="Continue execution to increase the workspace's testing coverage."
                path="/test-runs"
                icon={
                  <RadioButtonUncheckedRoundedIcon
                    sx={{ fontSize: 14 }}
                  />
                }
                severity="info"
              />
            )}

            {uncoveredRequirements > 0 && (
              <AttentionItem
                title={`${uncoveredRequirements} requirement${uncoveredRequirements === 1 ? "" : "s"} without coverage`}
                description="Review requirements that do not currently have test coverage."
                path="/requirements"
                icon={
                  <WarningAmberRoundedIcon
                    sx={{ fontSize: 14 }}
                  />
                }
              />
            )}

            {defects.total > 0 &&
              defects.open === 0 &&
              defects.reopened === 0 && (
                <AttentionItem
                  title="Defect backlog is currently controlled"
                  description={`${defects.total} reported defect${defects.total === 1 ? "" : "s"} recorded, with no open or reopened defects.`}
                  path="/bugs"
                  icon={
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 14 }}
                    />
                  }
                  severity="info"
                />
              )}

            {failed === 0 &&
              notExecuted === 0 &&
              uncoveredRequirements === 0 && (
                <AttentionItem
                  title="No immediate QA blockers"
                  description="Current execution, coverage, and defect indicators require no immediate action."
                  path="/reports"
                  icon={
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 14 }}
                    />
                  }
                  severity="info"
                />
              )}
          </Box>
        </Paper>
      </Box>

      {/* Lifecycle */}
      <Box sx={{ mb: 1.5 }}>
        <SectionTitle
          eyebrow="QA lifecycle"
          title="Testing workflow"
          description="Follow the work from requirement definition through execution and defect management."
        />

        <Paper
          elevation={0}
          sx={{
            p: 0.8,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              gap: 0.5,
              overflowX: "auto",
              pb: 0.1,
              "&::-webkit-scrollbar": {
                height: 3,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#dce2ea",
                borderRadius: 10,
              },
            }}
          >
            <LifecycleStep
              label="Requirements"
              value={summary.requirements}
              path="/requirements"
              active
              icon={
                <DescriptionRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Scenarios"
              value={summary.test_scenarios}
              path="/test-scenarios"
              icon={
                <AccountTreeRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Test Cases"
              value={summary.test_cases}
              path="/test-cases"
              icon={
                <ChecklistRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Test Suites"
              value={summary.test_suites}
              path="/test-suites"
              icon={
                <ViewListRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Test Runs"
              value={summary.test_runs}
              path="/test-runs"
              icon={
                <PlayCircleRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Executions"
              value={summary.test_executions}
              path="/test-executions"
              icon={
                <TaskAltRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />

            <LifecycleStep
              label="Bugs"
              value={summary.bugs}
              path="/bugs"
              icon={
                <BugReportRoundedIcon
                  sx={{ fontSize: 13 }}
                />
              }
            />
          </Box>
        </Paper>
      </Box>

      {/* Coverage + Defects + Automation */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 1,
        }}
      >
        {/* Coverage */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.65,
            }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#eee7ff",
                color: "#7c3aed",
              }}
            >
              <ChecklistRoundedIcon
                sx={{ fontSize: 14 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  color: "#101828",
                }}
              >
                Requirement coverage
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.54rem",
                  color: "#98a2b3",
                }}
              >
                Traceability health
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 0.45,
              mt: 0.95,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#101828",
              }}
            >
              {coverage}%
            </Typography>

            <Typography
              sx={{
                fontSize: "0.55rem",
                color: "#98a2b3",
              }}
            >
              covered
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 0.55,
              height: 6,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#eeeaf8",
            }}
          >
            <Box
              sx={{
                width: `${coverage}%`,
                height: "100%",
                borderRadius: 10,
                background:
                  "linear-gradient(90deg, #7c3aed, #a855f7)",
              }}
            />
          </Box>

          <Typography
            sx={{
              mt: 0.55,
              fontSize: "0.55rem",
              color: "#667085",
            }}
          >
            {requirements.covered} of{" "}
            {requirements.total} requirements have
            test coverage.
          </Typography>
        </Paper>

        {/* Defects */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.65,
            }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff1eb",
                color: "#ea580c",
              }}
            >
              <BugReportRoundedIcon
                sx={{ fontSize: 14 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  color: "#101828",
                }}
              >
                Defect health
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.54rem",
                  color: "#98a2b3",
                }}
              >
                Current bug lifecycle
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 0.6 }}>
            <StatusRow
              label="Open"
              value={defects.open}
              color="#ef4444"
            />

            <StatusRow
              label="In progress"
              value={defects.in_progress}
              color="#f59e0b"
            />

            <StatusRow
              label="Fixed"
              value={defects.fixed}
              color="#3b82f6"
            />

            <StatusRow
              label="Reopened"
              value={defects.reopened}
              color="#f97316"
            />

            <StatusRow
              label="Closed"
              value={defects.closed}
              color="#22c55e"
            />
          </Box>
        </Paper>

        {/* Automation */}
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: "10px",
            border: "1px solid #e3e8ef",
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.65,
            }}
          >
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0ebff",
                color: "#7c3aed",
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{ fontSize: 14 }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  color: "#101828",
                }}
              >
                Automation health
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.54rem",
                  color: "#98a2b3",
                }}
              >
                Automation ecosystem
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 0.6 }}>
            <StatusRow
              label="Automation projects"
              value={automation.automation_projects}
              color="#7c3aed"
            />

            <StatusRow
              label="Mapped test cases"
              value={automation.mapped_test_cases}
              color="#1677ff"
            />

            <StatusRow
              label="GitHub connections"
              value={automation.github_connections}
              color="#344054"
            />
          </Box>

          <Box
            sx={{
              mt: 0.6,
              display: "flex",
              alignItems: "center",
              gap: 0.45,
              color: "#667085",
            }}
          >
            <GitHubIcon sx={{ fontSize: 12 }} />

            <Typography
              sx={{
                fontSize: "0.54rem",
              }}
            >
              CI/CD integrations connected
            </Typography>
          </Box>
        </Paper>
      </Box>

      
    </Box>
  );
}