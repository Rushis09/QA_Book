import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { reportService } from "../../services/reportService";
import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";
import { testCaseService } from "../../services/testCaseService";
import { testSuiteService } from "../../services/testSuiteService";
import { testRunService } from "../../services/testRunService";
import { testExecutionService } from "../../services/testExecutionService";
import { bugService } from "../../services/bugService";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import type {
  ReportOverview,
  ExecutionAnalytics,
  CoverageAnalytics,
  DefectAnalytics,
  RiskAnalytics,
  TraceabilityAnalytics,
  DefectDistribution,
} from "../../types/report";

const borderColor = "#e4e7ec";
const muted = "#667085";
const text = "#101828";
const surface = "#ffffff";
const pageBackground = "#f8fbff";

const cardSx = {
  border: `1px solid ${borderColor}`,
  borderRadius: "12px",
  backgroundColor: surface,
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
};

const interactiveSx = {
  cursor: "pointer",
  transition: "all 0.15s ease",
  "&:hover": {
    borderColor: "#b8ccff",
    boxShadow: "0 4px 12px rgba(53, 109, 255, 0.10)",
    transform: "translateY(-1px)",
  },
};

const sectionTitleSx = {
  fontSize: "0.92rem",
  fontWeight: 750,
  color: text,
  letterSpacing: "-0.015em",
};

const labelSx = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: muted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.045em",
};

function percentage(value: number | undefined | null) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function statusTone(status: string) {
  switch (status.toLowerCase()) {
    case "passed":
      return { backgroundColor: "#ecfdf3", color: "#027a48" };
    case "failed":
      return { backgroundColor: "#fef3f2", color: "#b42318" };
    case "blocked":
      return { backgroundColor: "#fffaeb", color: "#b54708" };
    case "not executed":
      return { backgroundColor: "#f2f4f7", color: "#475467" };
    default:
      return { backgroundColor: "#f2f4f7", color: "#475467" };
  }
}

function riskTone(level: string) {
  switch (level.toUpperCase()) {
    case "HIGH":
      return { backgroundColor: "#fef3f2", color: "#b42318" };
    case "MEDIUM":
      return { backgroundColor: "#fffaeb", color: "#b54708" };
    default:
      return { backgroundColor: "#ecfdf3", color: "#027a48" };
  }
}

function severityTone(name: string) {
  switch (name.toLowerCase()) {
    case "critical":
      return { backgroundColor: "#fef3f2", color: "#b42318" };
    case "high":
      return { backgroundColor: "#fff4ed", color: "#c4320a" };
    case "medium":
      return { backgroundColor: "#fffaeb", color: "#b54708" };
    default:
      return { backgroundColor: "#f2f4f7", color: "#475467" };
  }
}

interface DrilldownDetail {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}

interface DrilldownState {
  title: string;
  subtitle: string;
  details: DrilldownDetail[];
}

type ReportEntityType =
  | "project"
  | "requirement"
  | "scenario"
  | "test-case"
  | "suite"
  | "run"
  | "execution"
  | "bug"
  | "retest";

interface ReportEntity {
  type: ReportEntityType;
  id: number;
  code: string;
  name: string;
  subtitle: string;
  meta: string[];
  route: string;
}

interface EntityListState {
  title: string;
  subtitle: string;
  entities: ReportEntity[];
}

function detailTone(tone: DrilldownDetail["tone"]) {
  switch (tone) {
    case "success":
      return { color: "#027a48", backgroundColor: "#ecfdf3" };
    case "warning":
      return { color: "#b54708", backgroundColor: "#fffaeb" };
    case "danger":
      return { color: "#b42318", backgroundColor: "#fef3f2" };
    default:
      return { color: text, backgroundColor: "#f2f4f7" };
  }
}

function DrilldownDialog({
  data,
  onClose,
}: {
  data: DrilldownState | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(data)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            border: `1px solid ${borderColor}`,
            boxShadow: "0 20px 50px rgba(16, 24, 40, 0.16)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2,
          py: 1.35,
          borderBottom: "1px solid #eef2f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 750,
              color: text,
            }}
          >
            {data?.title}
          </Typography>

          {data?.subtitle && (
            <Typography
              sx={{
                mt: 0.2,
                fontSize: "0.68rem",
                color: muted,
              }}
            >
              {data.subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ width: 30, height: 30, flexShrink: 0 }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          {data?.details.map((item, index) => {
            const tone = detailTone(item.tone);

            return (
              <Box
                key={`${item.label}-${index}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1,
                  border: "1px solid #eef2f6",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: muted,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Typography>

                <Chip
                  label={item.value}
                  size="small"
                  sx={{
                    height: 22,
                    maxWidth: "65%",
                    fontSize: "0.63rem",
                    fontWeight: 750,
                    ...tone,
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function EntityListDialog({
  data,
  onClose,
  onOpen,
}: {
  data: EntityListState | null;
  onClose: () => void;
  onOpen: (entity: ReportEntity) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const value = query.trim().toLowerCase();
    if (!value) return data.entities;
    return data.entities.filter((item) =>
      [item.code, item.name, item.subtitle, ...item.meta]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [data, query]);

  return (
    <Dialog
      open={Boolean(data)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            border: `1px solid ${borderColor}`,
            boxShadow: "0 20px 50px rgba(16, 24, 40, 0.16)",
            maxHeight: "78vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2,
          py: 1.35,
          borderBottom: "1px solid #eef2f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 750, color: text }}>
            {data?.title}
          </Typography>
          <Typography sx={{ mt: 0.2, fontSize: "0.68rem", color: muted }}>
            {data?.subtitle}
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ width: 30, height: 30 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ mb: 1.1 }}>
          <Box
            component="input"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder="Search records..."
            sx={{
              width: "100%",
              height: 36,
              px: 1.2,
              border: "1px solid #d0d5dd",
              borderRadius: "8px",
              outline: "none",
              fontSize: "0.73rem",
              color: text,
              backgroundColor: "#fff",
              "&:focus": { borderColor: "#8eb0ff" },
            }}
          />
        </Box>

        <Typography sx={{ mb: 0.8, fontSize: "0.67rem", color: muted }}>
          Showing {filtered.length} of {data?.entities.length ?? 0} records. Select a record to open it in its module.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.65 }}>
          {filtered.length ? (
            filtered.slice(0, 50).map((entity) => (
              <Box
                key={`${entity.type}-${entity.id}`}
                sx={{
                  p: 1,
                  border: "1px solid #eef2f6",
                  borderRadius: "9px",
                  ...interactiveSx,
                  "&:hover": {
                    borderColor: "#b8ccff",
                    backgroundColor: "#f8fbff",
                    boxShadow: "none",
                    transform: "none",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, flexWrap: "wrap" }}>
                      <Typography sx={{ fontSize: "0.74rem", fontWeight: 750, color: text }}>
                        {entity.code}
                      </Typography>
                      <Typography sx={{ fontSize: "0.74rem", fontWeight: 650, color: text }}>
                        {entity.name}
                      </Typography>
                    </Box>

                    <Typography sx={{ mt: 0.25, fontSize: "0.67rem", color: muted }}>
                      {entity.subtitle}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.55, flexWrap: "wrap", mt: 0.55 }}>
                      {entity.meta.slice(0, 5).map((meta) => (
                        <Chip
                          key={meta}
                          label={meta}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.6rem",
                            backgroundColor: "#f2f4f7",
                            color: "#475467",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onOpen(entity)}
                    sx={{
                      flexShrink: 0,
                      height: 30,
                      px: 1.1,
                      borderRadius: "7px",
                      textTransform: "none",
                      fontSize: "0.67rem",
                      fontWeight: 700,
                    }}
                  >
                    View {entity.type === "test-case" ? "Test Case" : entity.type === "suite" ? "Suite" : entity.type === "run" ? "Run" : entity.type === "execution" ? "Execution" : entity.type === "bug" ? "Bug" : entity.type === "requirement" ? "Requirement" : entity.type === "scenario" ? "Scenario" : "Project"}
                  </Button>
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.74rem", color: muted }}>
                No matching records found.
              </Typography>
            </Box>
          )}
        </Box>

        {filtered.length > 50 && (
          <Typography sx={{ mt: 1, fontSize: "0.66rem", color: muted, textAlign: "center" }}>
            Showing the first 50 matches. Use search to narrow the list.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  value,
  helper,
  progress,
  onClick,
}: {
  label: string;
  value: string | number;
  helper?: string;
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        ...cardSx,
        p: 1.65,
        height: "100%",
        ...(onClick ? interactiveSx : {}),
      }}
    >
      <Typography sx={labelSx}>{label}</Typography>

      <Typography
        sx={{
          mt: 0.55,
          fontSize: "1.48rem",
          lineHeight: 1.1,
          fontWeight: 780,
          color: text,
          letterSpacing: "-0.035em",
        }}
      >
        {value}
      </Typography>

      {helper && (
        <Typography
          sx={{
            mt: 0.55,
            fontSize: "0.7rem",
            color: muted,
          }}
        >
          {helper}
        </Typography>
      )}

      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, progress))}
          sx={{
            mt: 1.05,
            height: 5,
            borderRadius: 99,
            backgroundColor: "#eef2f6",
            "& .MuiLinearProgress-bar": { borderRadius: 99 },
          }}
        />
      )}
    </Paper>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ mb: 1.15 }}>
      <Typography sx={sectionTitleSx}>{title}</Typography>

      {subtitle && (
        <Typography sx={{ mt: 0.25, fontSize: "0.72rem", color: muted }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function DistributionBars({
  items,
  onItemClick,
}: {
  items: DefectDistribution[];
  onItemClick?: (item: DefectDistribution) => void;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  if (!items.length) {
    return (
      <Box sx={{ minHeight: 130, display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: muted }}>
          No data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {items.map((item) => (
        <Box
          key={item.name}
          onClick={() => onItemClick?.(item)}
          sx={{
            p: 0.45,
            mx: -0.45,
            borderRadius: "7px",
            ...(onItemClick ? interactiveSx : {}),
            "&:hover": onItemClick
              ? {
                  backgroundColor: "#f8fbff",
                  borderColor: "transparent",
                  boxShadow: "none",
                  transform: "none",
                }
              : undefined,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.4,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: text,
                fontWeight: 600,
              }}
            >
              {item.name}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.7rem",
                color: muted,
                fontWeight: 700,
              }}
            >
              {item.count}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={(item.count / max) * 100}
            sx={{
              height: 6,
              borderRadius: 99,
              backgroundColor: "#eef2f6",
              "& .MuiLinearProgress-bar": { borderRadius: 99 },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

function StatusDistribution({
  data,
  onItemClick,
}: {
  data: ExecutionAnalytics["status_distribution"];
  onItemClick?: (item: ExecutionAnalytics["status_distribution"][number]) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {data.map((item) => {
        const percent = total ? (item.count / total) * 100 : 0;

        return (
          <Box
            key={item.status}
            onClick={() => onItemClick?.(item)}
            sx={{
              p: 0.45,
              mx: -0.45,
              borderRadius: "7px",
              ...(onItemClick ? interactiveSx : {}),
              "&:hover": onItemClick
                ? {
                    backgroundColor: "#f8fbff",
                    borderColor: "transparent",
                    boxShadow: "none",
                    transform: "none",
                  }
                : undefined,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    ...statusTone(item.status),
                  }}
                />

                <Typography
                  sx={{ fontSize: "0.72rem", fontWeight: 600, color: text }}
                >
                  {item.status}
                </Typography>
              </Box>

              <Typography
                sx={{ fontSize: "0.7rem", color: muted, fontWeight: 700 }}
              >
                {item.count} · {percentage(percent)}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 6,
                borderRadius: 99,
                backgroundColor: "#eef2f6",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                  backgroundColor:
                    item.status.toLowerCase() === "passed"
                      ? "#12b76a"
                      : item.status.toLowerCase() === "failed"
                        ? "#f04438"
                        : undefined,
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function TrendChart({
  data,
  onClick,
}: {
  data: ExecutionAnalytics["trend"];
  onClick?: () => void;
}) {
  if (!data.length) {
    return (
      <Box sx={{ height: 210, display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: muted }}>
          No execution trend data available.
        </Typography>
      </Box>
    );
  }

  const width = 760;
  const height = 220;
  const paddingX = 34;
  const paddingY = 22;

  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(item.executed, item.passed, item.failed, item.blocked),
    ),
    1,
  );

  const xStep =
    data.length === 1
      ? 0
      : (width - paddingX * 2) / (data.length - 1);

  const point = (index: number, value: number) => {
    const x =
      data.length === 1 ? width / 2 : paddingX + index * xStep;

    const y =
      height -
      paddingY -
      (value / maxValue) * (height - paddingY * 2);

    return `${x},${y}`;
  };

  const line = (key: "executed" | "passed" | "failed") =>
    data.map((item, index) => point(index, item[key])).join(" ");

  return (
    <Box
      onClick={onClick}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: "8px",
        ...(onClick ? interactiveSx : {}),
        "&:hover": onClick
          ? {
              borderColor: "#b8ccff",
              backgroundColor: "#fbfdff",
              boxShadow: "none",
              transform: "none",
            }
          : undefined,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="220"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3].map((row) => {
          const y =
            paddingY + row * ((height - paddingY * 2) / 3);

          return (
            <line
              key={row}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="#eef2f6"
              strokeWidth="1"
            />
          );
        })}

        <polyline
          fill="none"
          stroke="#356dff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={line("executed")}
        />

        <polyline
          fill="none"
          stroke="#12b76a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={line("passed")}
        />

        <polyline
          fill="none"
          stroke="#f04438"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={line("failed")}
        />
      </svg>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 0.5,
          pb: 0.35,
          flexWrap: "wrap",
        }}
      >
        {[
          ["#356dff", "Executed"],
          ["#12b76a", "Passed"],
          ["#f04438", "Failed"],
        ].map(([color, label]) => (
          <Box
            key={label}
            sx={{ display: "flex", alignItems: "center", gap: 0.45 }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
            <Typography sx={{ fontSize: "0.68rem", color: muted }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CoverageBar({
  label,
  value,
  helper,
  onClick,
}: {
  label: string;
  value: number;
  helper: string;
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...(onClick ? interactiveSx : {}),
        p: onClick ? 0.5 : 0,
        mx: onClick ? -0.5 : 0,
        borderRadius: "7px",
        "&:hover": onClick
          ? {
              backgroundColor: "#f8fbff",
              borderColor: "transparent",
              boxShadow: "none",
              transform: "none",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: 0.55,
        }}
      >
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 650, color: text }}
        >
          {label}
        </Typography>

        <Typography
          sx={{ fontSize: "0.82rem", fontWeight: 750, color: text }}
        >
          {percentage(value)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, value))}
        sx={{
          height: 7,
          borderRadius: 99,
          backgroundColor: "#eef2f6",
          "& .MuiLinearProgress-bar": { borderRadius: 99 },
        }}
      />

      <Typography sx={{ mt: 0.4, fontSize: "0.67rem", color: muted }}>
        {helper}
      </Typography>
    </Box>
  );
}

export default function ReportsPage() {
  const { selectedProject, isAllProjects, projects: workspaceProjects } = useWorkspace();

  const [overview, setOverview] = useState<ReportOverview | null>(null);
  const [execution, setExecution] = useState<ExecutionAnalytics | null>(null);
  const [coverage, setCoverage] = useState<CoverageAnalytics | null>(null);
  const [defects, setDefects] = useState<DefectAnalytics | null>(null);
  const [risk, setRisk] = useState<RiskAnalytics | null>(null);
  const [traceability, setTraceability] =
    useState<TraceabilityAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [drilldown, setDrilldown] = useState<DrilldownState | null>(null);
  const [entityList, setEntityList] = useState<EntityListState | null>(null);

  const projectId = selectedProject?.id;

  const [entityData, setEntityData] = useState<{
    projects: ReportEntity[];
    requirements: ReportEntity[];
    scenarios: ReportEntity[];
    testCases: ReportEntity[];
    suites: ReportEntity[];
    runs: ReportEntity[];
    executions: ReportEntity[];
    bugs: ReportEntity[];
  }>({
    projects: [],
    requirements: [],
    scenarios: [],
    testCases: [],
    suites: [],
    runs: [],
    executions: [],
    bugs: [],
  });

  const loadEntityData = useCallback(async () => {
    if (!selectedProject && !isAllProjects) return;

    try {
      const [
        requirements,
        scenarios,
        testCases,
        suites,
        runs,
        executions,
        bugs,
      ] = await Promise.all([
        requirementService.getRequirements(projectId),
        testScenarioService.getTestScenarios(projectId),
        testCaseService.getTestCases(projectId),
        testSuiteService.getTestSuites(projectId),
        testRunService.getTestRuns(projectId),
        testExecutionService.getExecutions(),
        bugService.getBugs(),
      ]);

      const testCaseIds = new Set(testCases.map((item) => item.id));
      const scopedExecutions = selectedProject
        ? executions.filter((item) => testCaseIds.has(item.test_case_id))
        : executions;
      const scopedBugs = selectedProject
        ? bugs.filter((item) => testCaseIds.has(item.execution.test_case.id))
        : bugs;

      setEntityData({
        projects: (selectedProject ? [selectedProject] : workspaceProjects).map((item) => ({
          type: "project",
          id: item.id,
          code: item.project_code,
          name: item.name,
          subtitle: item.description || "Project",
          meta: [item.status, item.version ? `v${item.version}` : "No version"],
          route: `/projects?focus_type=project&focus_id=${item.id}`,
        })),
        requirements: requirements.map((item) => ({
          type: "requirement",
          id: item.id,
          code: item.requirement_code,
          name: item.description || "Requirement",
          subtitle: item.module,
          meta: [item.priority, item.status],
          route: `/requirements?focus_type=requirement&focus_id=${item.id}`,
        })),
        scenarios: scenarios.map((item) => ({
          type: "scenario",
          id: item.id,
          code: item.scenario_code,
          name: item.title,
          subtitle: item.module,
          meta: [item.priority, item.status, item.requirement.requirement_code],
          route: `/test-scenarios?focus_type=scenario&focus_id=${item.id}`,
        })),
        testCases: testCases.map((item) => ({
          type: "test-case",
          id: item.id,
          code: item.test_case_code,
          name: item.title,
          subtitle: item.module,
          meta: [item.priority, item.status, item.scenario.scenario_code],
          route: `/test-cases?focus_type=test-case&focus_id=${item.id}`,
        })),
        suites: suites.map((item) => ({
          type: "suite",
          id: item.id,
          code: item.suite_code,
          name: item.name,
          subtitle: `${item.test_cases.length} assigned test cases`,
          meta: [item.status],
          route: `/test-suites?focus_type=suite&focus_id=${item.id}`,
        })),
        runs: runs.map((item) => ({
          type: "run",
          id: item.id,
          code: item.run_code,
          name: item.name,
          subtitle: item.suite ? `${item.suite.suite_code} · ${item.suite.name}` : "Test Run",
          meta: [item.execution_type, item.status, item.environment || "No environment"],
          route: `/test-runs?focus_type=run&focus_id=${item.id}`,
        })),
        executions: scopedExecutions.map((item) => ({
          type: "execution",
          id: item.id,
          code: `EX-${item.id}`,
          name: item.test_case.test_case_code,
          subtitle: `${item.test_run.run_code} · ${item.test_run.name}`,
          meta: [
            item.status,
            item.test_case.title,
            item.executed_by || "Not executed",
            runs.find((run) => run.id === item.run_id)?.execution_type || "Unknown",
            runs.find((run) => run.id === item.run_id)?.environment || "Unspecified",
          ],
          route: `/test-executions?focus_type=execution&focus_id=${item.id}`,
        })),
        bugs: scopedBugs.map((item) => ({
          type: "bug",
          id: item.id,
          code: item.bug_code,
          name: item.title,
          subtitle: item.execution.test_case.test_case_code,
          meta: [item.severity, item.priority, item.status],
          route: `/bugs?focus_type=bug&focus_id=${item.id}`,
        })),
      });
    } catch (error) {
      console.error("Failed to load report detail records:", error);
    }
  }, [selectedProject, isAllProjects, projectId, workspaceProjects]);

  useEffect(() => {
    loadEntityData();
  }, [loadEntityData]);

  const loadReports = useCallback(
    async (isRefresh = false) => {
      if (!selectedProject && !isAllProjects) {
        setOverview(null);
        setExecution(null);
        setCoverage(null);
        setDefects(null);
        setRisk(null);
        setTraceability(null);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          overviewData,
          executionData,
          coverageData,
          defectsData,
          riskData,
          traceabilityData,
        ] = await Promise.all([
          reportService.getOverview(projectId),
          reportService.getExecutionAnalytics(projectId),
          reportService.getCoverageAnalytics(projectId),
          reportService.getDefectAnalytics(projectId),
          reportService.getQualityRisk(projectId),
          reportService.getTraceabilityAnalytics(projectId),
        ]);

        setOverview(overviewData);
        setExecution(executionData);
        setCoverage(coverageData);
        setDefects(defectsData);
        setRisk(riskData);
        setTraceability(traceabilityData);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load report analytics.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId, selectedProject, isAllProjects],
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const scopeLabel = useMemo(() => {
    if (selectedProject) {
      return `${selectedProject.project_code} · ${selectedProject.name}`;
    }

    if (isAllProjects) {
      return "All Projects";
    }

    return "No project selected";
  }, [selectedProject, isAllProjects]);

  const openDrilldown = useCallback(
    (
      title: string,
      subtitle: string,
      details: DrilldownDetail[],
    ) => {
      const normalized = title.toLowerCase();
      const findBy = (value: string) =>
        entityData.testCases.filter((item) =>
          [item.code, item.name, item.subtitle, ...item.meta]
            .join(" ")
            .toLowerCase()
            .includes(value.toLowerCase()),
        );

      let entities: ReportEntity[] | null = null;

      if (normalized.includes("pass rate")) {
        entities = entityData.executions.filter((item) =>
          ["Passed", "Failed", "Blocked"].some((status) =>
            item.meta.includes(status),
          ),
        );
      } else if (normalized.includes("execution progress")) {
        entities = entityData.executions;
      } else if (normalized.includes("requirement coverage")) {
        entities = entityData.requirements;
      } else if (normalized.includes("open defect")) {
        entities = entityData.bugs.filter((item) =>
          ["Open", "Triaged", "In Progress", "Ready for QA", "Retesting", "Reopened"].some(
            (status) => item.meta.includes(status),
          ),
        );
      } else if (normalized.includes("critical / high")) {
        entities = entityData.bugs.filter((item) =>
          (item.meta.includes("Critical") || item.meta.includes("High")) &&
          ["Open", "Triaged", "In Progress", "Ready for QA", "Retesting", "Reopened"].some(
            (status) => item.meta.includes(status),
          ),
        );
      } else if (normalized.includes("qa inventory")) {
        entities = [
          ...entityData.projects,
          ...entityData.requirements,
          ...entityData.scenarios,
          ...entityData.testCases,
          ...entityData.suites,
          ...entityData.runs,
          ...entityData.executions,
          ...entityData.bugs,
        ];
      } else if (normalized.includes("execution trend")) {
        entities = entityData.executions;
      } else if (normalized.includes("executions")) {
        const statusMatch = entityData.executions.find((item) =>
          normalized.includes(item.meta[0]?.toLowerCase() ?? "___"),
        );
        if (statusMatch) {
          entities = entityData.executions.filter(
            (item) => item.meta[0] === statusMatch.meta[0],
          );
        }
      } else if (normalized.includes("execution details")) {
        const type = entityData.executions.find((item) =>
          normalized.includes(item.meta[3]?.toLowerCase() ?? "___"),
        )?.meta[3];
        entities = type
          ? entityData.executions.filter((item) => item.meta[3] === type)
          : entityData.executions;
      } else if (normalized.includes("environment")) {
        const environment = entityData.executions.find((item) =>
          normalized.includes(item.meta[4]?.toLowerCase() ?? "___"),
        )?.meta[4];
        entities = environment
          ? entityData.executions.filter((item) => item.meta[4] === environment)
          : entityData.executions;
      } else if (normalized.includes("coverage") && normalized.includes("gap")) {
        const code = details.find((item) => item.label === "Requirement")?.value;
        entities = code
          ? entityData.requirements.filter((item) => item.code === String(code))
          : entityData.requirements;
      } else if (normalized.includes("coverage")) {
        const module = details.find((item) => item.label === "Module")?.value;
        entities = module ? findBy(String(module)) : entityData.testCases;
      } else if (
        details.some((item) =>
          ["Risk Level", "Category", "Reference"].includes(item.label),
        )
      ) {
        const reference = details.find((item) => item.label === "Reference")?.value;
        entities = reference
          ? [
              ...entityData.requirements,
              ...entityData.testCases,
              ...entityData.bugs,
            ].filter((item) => item.code === String(reference))
          : entityData.bugs;
      } else if (
        normalized.includes("defect") ||
        normalized.includes("severity") ||
        normalized.includes("priority")
      ) {
        const name = details.find((item) =>
          ["Severity", "Priority", "Status", "Module"].includes(item.label),
        )?.value;
        entities = name
          ? entityData.bugs.filter((item) =>
              [item.code, item.name, item.subtitle, ...item.meta]
                .join(" ")
                .toLowerCase()
                .includes(String(name).toLowerCase()),
            )
          : entityData.bugs;
      } else if (normalized.includes("risk")) {
        entities = [
          ...entityData.requirements,
          ...entityData.testCases,
          ...entityData.bugs,
        ];
      } else if (normalized.includes("traceability")) {
        const testCase = details.find((item) => item.label === "Test Case")?.value;
        entities = testCase
          ? entityData.testCases.filter((item) => item.code === String(testCase))
          : entityData.testCases;
      }

      if (entities) {
        setDrilldown(null);
        setEntityList({ title, subtitle, entities });
        return;
      }

      setDrilldown({ title, subtitle, details });
    },
    [entityData],
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "55vh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 1 }}>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => loadReports(true)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (
    !overview ||
    !execution ||
    !coverage ||
    !defects ||
    !risk ||
    !traceability
  ) {
    return (
      <Box
        sx={{
          minHeight: "55vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Paper sx={{ ...cardSx, p: 3, textAlign: "center", maxWidth: 440 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 750, color: text }}>
            Select a project to view reports
          </Typography>

          <Typography sx={{ mt: 0.6, fontSize: "0.75rem", color: muted }}>
            Choose a project or All Projects from the workspace selector.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const executionSummary = overview.execution_health;
  const defectSummary = overview.defect_health;
  const coverageSummary = overview.coverage_health;
  const inventory = overview.inventory;

  const highRisk = risk.risks.filter(
    (item) => item.level.toUpperCase() === "HIGH",
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: pageBackground,
        pb: 4,
      }}
    >
      <Paper
        sx={{
          ...cardSx,
          p: 1.8,
          mb: 1.7,
          position: "sticky",
          top: 0,
          zIndex: 20,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,250,255,0.98) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 4px 14px rgba(16, 24, 40, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1.45rem",
                lineHeight: 1.2,
                fontWeight: 780,
                letterSpacing: "-0.035em",
                color: text,
              }}
            >
              Reports
            </Typography>

            <Typography sx={{ mt: 0.35, fontSize: "0.76rem", color: muted }}>
              Quality intelligence across requirements, execution, coverage,
              defects and traceability.
            </Typography>

            <Chip
              label={scopeLabel}
              size="small"
              sx={{
                mt: 0.9,
                height: 25,
                borderRadius: "7px",
                backgroundColor: "#eef4ff",
                color: "#2457d6",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            />
          </Box>

          <Button
            variant="outlined"
            size="small"
            disabled={refreshing}
            onClick={() => loadReports(true)}
            sx={{
              minWidth: 92,
              height: 34,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "0.74rem",
              fontWeight: 700,
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>
      </Paper>

      <SectionHeader
        title="Executive Quality Overview"
        subtitle="Current quality posture for the selected reporting scope."
      />

      <Grid container spacing={1.15} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Pass Rate"
            value={percentage(executionSummary.pass_rate)}
            helper={`${executionSummary.passed} passed`}
            progress={executionSummary.pass_rate}
            onClick={() =>
              openDrilldown(
                "Pass Rate Details",
                "Actual executions behind the current pass-rate calculation.",
                [
                  {
                    label: "Pass Rate",
                    value: percentage(executionSummary.pass_rate),
                    tone:
                      executionSummary.pass_rate >= 80
                        ? "success"
                        : executionSummary.pass_rate >= 50
                          ? "warning"
                          : "danger",
                  },
                  { label: "Passed", value: executionSummary.passed, tone: "success" },
                  { label: "Failed", value: executionSummary.failed, tone: "danger" },
                  { label: "Blocked", value: executionSummary.blocked, tone: "warning" },
                  { label: "Not Executed", value: executionSummary.not_executed },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Execution Progress"
            value={percentage(executionSummary.execution_progress)}
            helper={`${executionSummary.executed} of ${executionSummary.total} executed`}
            progress={executionSummary.execution_progress}
            onClick={() =>
              openDrilldown(
                "Execution Progress Details",
                "How much of the available execution scope has been completed.",
                [
                  { label: "Progress", value: percentage(executionSummary.execution_progress) },
                  { label: "Total", value: executionSummary.total },
                  { label: "Executed", value: executionSummary.executed, tone: "success" },
                  { label: "Not Executed", value: executionSummary.not_executed, tone: "warning" },
                  { label: "Passed", value: executionSummary.passed, tone: "success" },
                  { label: "Failed", value: executionSummary.failed, tone: "danger" },
                  { label: "Blocked", value: executionSummary.blocked, tone: "warning" },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Requirement Coverage"
            value={percentage(coverageSummary.requirement_coverage)}
            helper="requirements with test cases"
            progress={coverageSummary.requirement_coverage}
            onClick={() =>
              openDrilldown(
                "Requirement Coverage Details",
                "Requirements with at least one associated test case.",
                [
                  {
                    label: "Coverage",
                    value: percentage(coverageSummary.requirement_coverage),
                    tone:
                      coverageSummary.requirement_coverage >= 80
                        ? "success"
                        : coverageSummary.requirement_coverage >= 50
                          ? "warning"
                          : "danger",
                  },
                  {
                    label: "Requirements",
                    value: coverage.summary.requirements,
                  },
                  {
                    label: "With Test Cases",
                    value: coverage.summary.requirements_with_test_cases,
                    tone: "success",
                  },
                  {
                    label: "Without Test Cases",
                    value: coverage.summary.requirements_without_test_cases,
                    tone:
                      coverage.summary.requirements_without_test_cases > 0
                        ? "danger"
                        : "success",
                  },
                  {
                    label: "Scenario Coverage",
                    value: percentage(coverageSummary.scenario_coverage),
                  },
                  {
                    label: "Execution Coverage",
                    value: percentage(coverageSummary.execution_coverage),
                  },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Open Defects"
            value={defectSummary.open}
            helper={`${defectSummary.total} total defects`}
            onClick={() =>
              openDrilldown(
                "Open Defect Details",
                "Current defect lifecycle distribution.",
                [
                  { label: "Open", value: defectSummary.open, tone: defectSummary.open ? "danger" : "success" },
                  { label: "In Progress", value: defectSummary.in_progress },
                  { label: "Fixed", value: defectSummary.fixed },
                  { label: "Ready for QA", value: defectSummary.ready_for_qa },
                  { label: "Retesting", value: defectSummary.retesting },
                  { label: "Closed", value: defectSummary.closed, tone: "success" },
                  { label: "Reopened", value: defectSummary.reopened, tone: defectSummary.reopened ? "danger" : "success" },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Critical / High"
            value={defectSummary.critical_open + defectSummary.high_open}
            helper="open critical/high defects"
            onClick={() =>
              openDrilldown(
                "Critical / High Defect Details",
                "Open defects that require the highest attention.",
                [
                  {
                    label: "Critical Open",
                    value: defectSummary.critical_open,
                    tone: defectSummary.critical_open ? "danger" : "success",
                  },
                  {
                    label: "High Open",
                    value: defectSummary.high_open,
                    tone: defectSummary.high_open ? "danger" : "success",
                  },
                  { label: "Total Open", value: defectSummary.open },
                  { label: "Total Defects", value: defectSummary.total },
                  { label: "Reopened", value: defectSummary.reopened },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
          <MetricCard
            label="Inventory"
            value={inventory.test_cases}
            helper={`${inventory.requirements} requirements · ${inventory.scenarios} scenarios`}
            onClick={() =>
              openDrilldown(
                "QA Inventory",
                "Current inventory across the selected reporting scope.",
                [
                  { label: "Requirements", value: inventory.requirements },
                  { label: "Scenarios", value: inventory.scenarios },
                  { label: "Test Cases", value: inventory.test_cases },
                  { label: "Test Suites", value: inventory.test_suites },
                  { label: "Test Runs", value: inventory.test_runs },
                  { label: "Executions", value: inventory.executions },
                  { label: "Bugs", value: inventory.bugs },
                ],
              )
            }
          />
        </Grid>
      </Grid>

      <SectionHeader
        title="Execution Analytics"
        subtitle="Execution volume, status distribution and recent performance."
      />

      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box>
                <Typography sx={sectionTitleSx}>Execution Trend</Typography>
                <Typography sx={{ mt: 0.25, fontSize: "0.7rem", color: muted }}>
                  Executed, passed and failed activity over time.
                </Typography>
              </Box>

              <Chip
                label={`${executionSummary.total} total`}
                size="small"
                sx={{
                  height: 23,
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  backgroundColor: "#f2f4f7",
                }}
              />
            </Box>

            <TrendChart
              data={execution.trend}
              onClick={() =>
                openDrilldown(
                  "Execution Trend Details",
                  "Daily execution activity available in the current reporting scope.",
                  execution.trend.slice(-12).map((item) => ({
                    label: item.date,
                    value: `${item.executed} executed · ${item.passed} passed · ${item.failed} failed · ${item.blocked} blocked`,
                    tone: item.failed > 0 ? "danger" : "success",
                  })),
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65, height: "100%" }}>
            <Typography sx={sectionTitleSx}>Status Distribution</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.35, fontSize: "0.7rem", color: muted }}>
              Current execution state mix. Click a status for details.
            </Typography>

            <StatusDistribution
              data={execution.status_distribution}
              onItemClick={(item) =>
                openDrilldown(
                  `${item.status} Executions`,
                  "Execution status breakdown.",
                  [
                    { label: "Status", value: item.status, tone: item.status === "Passed" ? "success" : item.status === "Failed" ? "danger" : "warning" },
                    { label: "Executions", value: item.count },
                    { label: "Share", value: percentage(
                      execution.status_distribution.reduce((sum, row) => sum + row.count, 0)
                        ? (item.count /
                            execution.status_distribution.reduce(
                              (sum, row) => sum + row.count,
                              0,
                            )) *
                            100
                        : 0,
                    ) },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Manual vs Automated</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click an execution type to inspect its performance.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
              {execution.execution_type.length ? (
                execution.execution_type.map((item) => (
                  <Box
                    key={item.execution_type}
                    onClick={() =>
                      openDrilldown(
                        `${item.execution_type} Execution Details`,
                        "Execution performance by execution type.",
                        [
                          { label: "Execution Type", value: item.execution_type },
                          { label: "Executions", value: item.executions },
                          { label: "Passed", value: item.passed, tone: "success" },
                          { label: "Failed", value: item.failed, tone: "danger" },
                          { label: "Blocked", value: item.blocked, tone: "warning" },
                          { label: "Pass Rate", value: percentage(item.pass_rate) },
                        ],
                      )
                    }
                    sx={{
                      p: 1,
                      border: "1px solid #eef2f6",
                      borderRadius: "8px",
                      ...interactiveSx,
                      "&:hover": {
                        borderColor: "#b8ccff",
                        backgroundColor: "#f8fbff",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: text }}>
                        {item.execution_type}
                      </Typography>

                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 750, color: text }}>
                        {percentage(item.pass_rate)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, mt: 0.65, flexWrap: "wrap" }}>
                      <Typography sx={{ fontSize: "0.67rem", color: muted }}>
                        {item.executions} executions
                      </Typography>
                      <Typography sx={{ fontSize: "0.67rem", color: "#027a48" }}>
                        {item.passed} passed
                      </Typography>
                      <Typography sx={{ fontSize: "0.67rem", color: "#b42318" }}>
                        {item.failed} failed
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ py: 2, fontSize: "0.72rem", color: muted }}>
                  No execution type data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Environment Performance</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click an environment to inspect its results.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {execution.environment_distribution.length ? (
                execution.environment_distribution.map((item) => (
                  <Box
                    key={item.environment}
                    onClick={() =>
                      openDrilldown(
                        `${item.environment} Environment`,
                        "Execution results grouped by environment.",
                        [
                          { label: "Environment", value: item.environment },
                          { label: "Executions", value: item.executions },
                          { label: "Passed", value: item.passed, tone: "success" },
                          { label: "Failed", value: item.failed, tone: "danger" },
                          { label: "Blocked", value: item.blocked, tone: "warning" },
                          { label: "Pass Rate", value: percentage(item.pass_rate) },
                        ],
                      )
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.65,
                      px: 0.5,
                      mx: -0.5,
                      borderRadius: "7px",
                      borderBottom: "1px solid #f2f4f7",
                      ...interactiveSx,
                      "&:hover": {
                        backgroundColor: "#f8fbff",
                        borderColor: "transparent",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 650, color: text }}>
                        {item.environment}
                      </Typography>
                      <Typography sx={{ mt: 0.15, fontSize: "0.65rem", color: muted }}>
                        {item.executions} executions · {item.failed} failed
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: "0.76rem", fontWeight: 750, color: text }}>
                      {percentage(item.pass_rate)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ py: 3, textAlign: "center", fontSize: "0.72rem", color: muted }}>
                  No environment data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SectionHeader
        title="Test Coverage Analytics"
        subtitle="Traceable coverage from requirements through executable test cases."
      />

      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <CoverageBar
              label="Requirement Coverage"
              value={coverageSummary.requirement_coverage}
              helper={`${coverage.summary.requirements_with_test_cases} of ${coverage.summary.requirements} requirements have test cases`}
              onClick={() =>
                openDrilldown(
                  "Requirement Coverage",
                  "Coverage from requirements to test cases.",
                  [
                    { label: "Coverage", value: percentage(coverageSummary.requirement_coverage) },
                    { label: "Requirements", value: coverage.summary.requirements },
                    { label: "With Test Cases", value: coverage.summary.requirements_with_test_cases, tone: "success" },
                    { label: "Without Test Cases", value: coverage.summary.requirements_without_test_cases, tone: coverage.summary.requirements_without_test_cases ? "danger" : "success" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <CoverageBar
              label="Scenario Coverage"
              value={coverageSummary.scenario_coverage}
              helper={`${coverage.summary.scenarios_with_test_cases} of ${coverage.summary.scenarios} scenarios have test cases`}
              onClick={() =>
                openDrilldown(
                  "Scenario Coverage",
                  "Coverage from scenarios to test cases.",
                  [
                    { label: "Coverage", value: percentage(coverageSummary.scenario_coverage) },
                    { label: "Scenarios", value: coverage.summary.scenarios },
                    { label: "With Test Cases", value: coverage.summary.scenarios_with_test_cases, tone: "success" },
                    { label: "Without Test Cases", value: coverage.summary.scenarios_without_test_cases, tone: coverage.summary.scenarios_without_test_cases ? "danger" : "success" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <CoverageBar
              label="Execution Coverage"
              value={coverageSummary.execution_coverage}
              helper={`${coverage.summary.test_cases_executed} of ${coverage.summary.test_cases} test cases have executions`}
              onClick={() =>
                openDrilldown(
                  "Execution Coverage",
                  "Test cases that have at least one execution.",
                  [
                    { label: "Coverage", value: percentage(coverageSummary.execution_coverage) },
                    { label: "Test Cases", value: coverage.summary.test_cases },
                    { label: "Executed", value: coverage.summary.test_cases_executed, tone: "success" },
                    { label: "Not Executed", value: coverage.summary.test_cases_not_executed, tone: coverage.summary.test_cases_not_executed ? "warning" : "success" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Coverage by Module</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.1, fontSize: "0.7rem", color: muted }}>
              Click a module to inspect its coverage profile.
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Module", "Requirements", "Scenarios", "Test Cases", "Executed", "Coverage"].map(
                      (heading) => (
                        <TableCell
                          key={heading}
                          sx={{
                            py: 0.65,
                            px: 0.7,
                            borderBottom: "1px solid #eef2f6",
                            fontSize: "0.63rem",
                            fontWeight: 750,
                            color: muted,
                            textTransform: "uppercase",
                          }}
                        >
                          {heading}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {coverage.module_distribution.map((item) => (
                    <TableRow
                      key={item.module}
                      hover
                      onClick={() =>
                        openDrilldown(
                          `${item.module} Coverage`,
                          "Module-level coverage profile.",
                          [
                            { label: "Module", value: item.module },
                            { label: "Requirements", value: item.requirements },
                            { label: "Scenarios", value: item.scenarios },
                            { label: "Test Cases", value: item.test_cases },
                            { label: "Executed Test Cases", value: item.executed_test_cases, tone: "success" },
                            { label: "Coverage", value: percentage(item.coverage) },
                          ],
                        )
                      }
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f8fbff" },
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.7rem", fontWeight: 650 }}>
                        {item.module}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.7rem" }}>{item.requirements}</TableCell>
                      <TableCell sx={{ fontSize: "0.7rem" }}>{item.scenarios}</TableCell>
                      <TableCell sx={{ fontSize: "0.7rem" }}>{item.test_cases}</TableCell>
                      <TableCell sx={{ fontSize: "0.7rem" }}>{item.executed_test_cases}</TableCell>
                      <TableCell>
                        <Chip
                          label={percentage(item.coverage)}
                          size="small"
                          sx={{
                            height: 21,
                            fontSize: "0.63rem",
                            fontWeight: 750,
                            backgroundColor:
                              item.coverage >= 80
                                ? "#ecfdf3"
                                : item.coverage >= 50
                                  ? "#fffaeb"
                                  : "#fef3f2",
                            color:
                              item.coverage >= 80
                                ? "#027a48"
                                : item.coverage >= 50
                                  ? "#b54708"
                                  : "#b42318",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Coverage Gaps</Typography>
            <Typography sx={{ mt: 0.25, mb: 1, fontSize: "0.7rem", color: muted }}>
              Click a gap to inspect the affected requirement.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.65 }}>
              {coverage.gaps.length ? (
                coverage.gaps.slice(0, 8).map((gap) => (
                  <Box
                    key={`${gap.requirement_code}-${gap.gap_type}`}
                    onClick={() =>
                      openDrilldown(
                        `${gap.requirement_code} Coverage Gap`,
                        "Coverage gap requiring attention.",
                        [
                          { label: "Requirement", value: gap.requirement_code },
                          { label: "Module", value: gap.module },
                          { label: "Priority", value: gap.priority, tone: gap.priority.toLowerCase() === "high" ? "danger" : "warning" },
                          { label: "Gap Type", value: gap.gap_type, tone: "danger" },
                        ],
                      )
                    }
                    sx={{
                      p: 0.9,
                      border: "1px solid #eef2f6",
                      borderRadius: "8px",
                      ...interactiveSx,
                      "&:hover": {
                        borderColor: "#b8ccff",
                        backgroundColor: "#f8fbff",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.71rem", fontWeight: 700, color: text }}>
                          {gap.requirement_code}
                        </Typography>
                        <Typography sx={{ mt: 0.15, fontSize: "0.66rem", color: muted }}>
                          {gap.module} · {gap.gap_type}
                        </Typography>
                      </Box>

                      <Chip
                        label={gap.priority}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          ...severityTone(gap.priority),
                        }}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ py: 3, textAlign: "center", fontSize: "0.72rem", color: "#027a48" }}>
                  No coverage gaps detected.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SectionHeader
        title="Defect Intelligence"
        subtitle="Defect volume, severity, priority and concentration across the quality landscape."
      />

      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Total Defects"
            value={defectSummary.total}
            helper={`${defectSummary.closed} closed`}
            onClick={() =>
              openDrilldown(
                "Total Defect Details",
                "Complete defect inventory.",
                [
                  { label: "Total", value: defectSummary.total },
                  { label: "Open", value: defectSummary.open },
                  { label: "In Progress", value: defectSummary.in_progress },
                  { label: "Fixed", value: defectSummary.fixed },
                  { label: "Closed", value: defectSummary.closed, tone: "success" },
                  { label: "Reopened", value: defectSummary.reopened },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Open"
            value={defectSummary.open}
            helper={`${defectSummary.in_progress} in progress`}
            onClick={() =>
              openDrilldown(
                "Open Defects",
                "Defects not currently closed.",
                [
                  { label: "Open", value: defectSummary.open, tone: defectSummary.open ? "danger" : "success" },
                  { label: "In Progress", value: defectSummary.in_progress },
                  { label: "Ready for QA", value: defectSummary.ready_for_qa },
                  { label: "Retesting", value: defectSummary.retesting },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Critical"
            value={defects.summary.critical}
            helper={`${defectSummary.critical_open} currently open`}
            onClick={() =>
              openDrilldown(
                "Critical Defects",
                "Defects with critical severity.",
                [
                  { label: "Critical Total", value: defects.summary.critical, tone: "danger" },
                  { label: "Critical Open", value: defectSummary.critical_open, tone: defectSummary.critical_open ? "danger" : "success" },
                  { label: "High Open", value: defectSummary.high_open, tone: defectSummary.high_open ? "danger" : "success" },
                  { label: "Total Open", value: defectSummary.open },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3 }}>
          <MetricCard
            label="Reopened"
            value={defectSummary.reopened}
            helper="defects requiring attention"
            onClick={() =>
              openDrilldown(
                "Reopened Defects",
                "Defects that have returned to an active state.",
                [
                  { label: "Reopened", value: defectSummary.reopened, tone: defectSummary.reopened ? "danger" : "success" },
                  { label: "Open", value: defectSummary.open },
                  { label: "Retesting", value: defectSummary.retesting },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Severity Distribution</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click a severity to inspect its concentration.
            </Typography>
            <DistributionBars
              items={defects.severity_distribution}
              onItemClick={(item) =>
                openDrilldown(
                  `${item.name} Severity`,
                  "Defect distribution by severity.",
                  [
                    { label: "Severity", value: item.name },
                    { label: "Defects", value: item.count, tone: item.name.toLowerCase() === "critical" ? "danger" : "default" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Priority Distribution</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click a priority to inspect its concentration.
            </Typography>
            <DistributionBars
              items={defects.priority_distribution}
              onItemClick={(item) =>
                openDrilldown(
                  `${item.name} Priority`,
                  "Defect distribution by priority.",
                  [
                    { label: "Priority", value: item.name },
                    { label: "Defects", value: item.count, tone: item.name.toLowerCase() === "high" ? "danger" : "default" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Status Distribution</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click a status to inspect its lifecycle count.
            </Typography>
            <DistributionBars
              items={defects.status_distribution}
              onItemClick={(item) =>
                openDrilldown(
                  `${item.name} Defects`,
                  "Current defect lifecycle state.",
                  [
                    { label: "Status", value: item.name },
                    { label: "Defects", value: item.count, tone: item.name.toLowerCase() === "closed" ? "success" : item.count ? "warning" : "default" },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Defects by Module</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click a module to inspect defect concentration.
            </Typography>
            <DistributionBars
              items={defects.module_distribution}
              onItemClick={(item) =>
                openDrilldown(
                  `${item.name} Defects`,
                  "Defect concentration by functional module.",
                  [
                    { label: "Module", value: item.name },
                    { label: "Defects", value: item.count },
                    { label: "Share of Module Distribution", value: percentage(
                      defects.module_distribution.reduce((sum, row) => sum + row.count, 0)
                        ? (item.count /
                            defects.module_distribution.reduce(
                              (sum, row) => sum + row.count,
                              0,
                            )) *
                            100
                        : 0,
                    ) },
                  ],
                )
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Typography sx={sectionTitleSx}>Defect Trend</Typography>
            <Typography sx={{ mt: 0.25, mb: 1.25, fontSize: "0.7rem", color: muted }}>
              Click a date to inspect opened and closed activity.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.45 }}>
              {defects.trend.length ? (
                defects.trend.slice(-8).map((item) => (
                  <Box
                    key={item.date}
                    onClick={() =>
                      openDrilldown(
                        `Defect Trend · ${item.date}`,
                        "Daily defect activity.",
                        [
                          { label: "Date", value: item.date },
                          { label: "Total", value: item.total },
                          { label: "Opened", value: item.opened, tone: item.opened ? "danger" : "default" },
                          { label: "Closed", value: item.closed, tone: "success" },
                        ],
                      )
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.55,
                      px: 0.45,
                      mx: -0.45,
                      borderBottom: "1px solid #f2f4f7",
                      borderRadius: "6px",
                      ...interactiveSx,
                      "&:hover": {
                        backgroundColor: "#f8fbff",
                        borderColor: "transparent",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "0.68rem", color: muted }}>
                      {item.date}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
                      <Typography sx={{ fontSize: "0.68rem", color: text, fontWeight: 650 }}>
                        {item.total} total
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#b42318" }}>
                        +{item.opened}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#027a48" }}>
                        -{item.closed}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ py: 3, textAlign: "center", fontSize: "0.72rem", color: muted }}>
                  No defect trend data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SectionHeader
        title="Quality Risk"
        subtitle="Deterministic risk signals derived from coverage, execution and defect data."
      />

      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        <Grid size={{ xs: 4 }}>
          <MetricCard
            label="High Risk"
            value={risk.summary.high}
            helper="requires attention"
            onClick={() =>
              openDrilldown(
                "High Risk",
                "Highest-priority deterministic quality signals.",
                [
                  { label: "High Risk Items", value: risk.summary.high, tone: risk.summary.high ? "danger" : "success" },
                  { label: "Medium Risk", value: risk.summary.medium },
                  { label: "Low Risk", value: risk.summary.low },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <MetricCard
            label="Medium Risk"
            value={risk.summary.medium}
            helper="monitor closely"
            onClick={() =>
              openDrilldown(
                "Medium Risk",
                "Medium-priority deterministic quality signals.",
                [
                  { label: "Medium Risk Items", value: risk.summary.medium, tone: risk.summary.medium ? "warning" : "success" },
                  { label: "High Risk", value: risk.summary.high },
                  { label: "Low Risk", value: risk.summary.low },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <MetricCard
            label="Low Risk"
            value={risk.summary.low}
            helper="lower priority"
            onClick={() =>
              openDrilldown(
                "Low Risk",
                "Lower-priority deterministic quality signals.",
                [
                  { label: "Low Risk Items", value: risk.summary.low, tone: "success" },
                  { label: "Medium Risk", value: risk.summary.medium },
                  { label: "High Risk", value: risk.summary.high },
                ],
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ ...cardSx, p: 1.65 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box>
                <Typography sx={sectionTitleSx}>Risk Register</Typography>
                <Typography sx={{ mt: 0.25, fontSize: "0.7rem", color: muted }}>
                  Click a risk signal to inspect its evidence.
                </Typography>
              </Box>

              {highRisk > 0 && (
                <Chip
                  label={`${highRisk} high risk`}
                  size="small"
                  sx={{
                    height: 23,
                    fontSize: "0.65rem",
                    fontWeight: 750,
                    backgroundColor: "#fef3f2",
                    color: "#b42318",
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
              {risk.risks.length ? (
                risk.risks.slice(0, 10).map((item, index) => (
                  <Box
                    key={`${item.category}-${item.reference_code}-${index}`}
                    onClick={() =>
                      openDrilldown(
                        item.title,
                        "Quality risk evidence from measurable QA data.",
                        [
                          { label: "Risk Level", value: item.level, tone: item.level.toUpperCase() === "HIGH" ? "danger" : item.level.toUpperCase() === "MEDIUM" ? "warning" : "success" },
                          { label: "Category", value: item.category },
                          { label: "Module", value: item.module || "-" },
                          { label: "Reference", value: item.reference_code || "-" },
                          { label: "Description", value: item.description },
                        ],
                      )
                    }
                    sx={{
                      p: 0.95,
                      border: "1px solid #eef2f6",
                      borderRadius: "9px",
                      ...interactiveSx,
                      "&:hover": {
                        borderColor: "#b8ccff",
                        backgroundColor: "#f8fbff",
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                        <Chip
                          label={item.level}
                          size="small"
                          sx={{
                            height: 21,
                            fontSize: "0.61rem",
                            fontWeight: 750,
                            ...riskTone(item.level),
                          }}
                        />

                        <Box>
                          <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: text }}>
                            {item.title}
                          </Typography>

                          <Typography sx={{ mt: 0.2, fontSize: "0.67rem", color: muted }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, flexWrap: "wrap" }}>
                        {item.module && (
                          <Chip
                            label={item.module}
                            size="small"
                            sx={{
                              height: 21,
                              fontSize: "0.61rem",
                              backgroundColor: "#f2f4f7",
                            }}
                          />
                        )}

                        {item.reference_code && (
                          <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, color: muted }}>
                            {item.reference_code}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#027a48" }}>
                    No quality risks detected.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <SectionHeader
        title="Traceability Intelligence"
        subtitle="Requirement → Scenario → Test Case → Latest Execution → Bug."
      />

      <Paper sx={{ ...cardSx, overflow: "hidden" }}>
        <Box sx={{ p: 1.65 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box>
              <Typography sx={sectionTitleSx}>Traceability Matrix</Typography>
              <Typography sx={{ mt: 0.25, fontSize: "0.7rem", color: muted }}>
                {traceability.summary.test_cases} test cases ·{" "}
                {traceability.summary.executed_test_cases} executed ·{" "}
                {traceability.summary.failed_test_cases} failed ·{" "}
                {traceability.summary.linked_bugs} linked bugs
              </Typography>
            </Box>

            <Chip
              label={`${traceability.summary.traceability_gaps} gaps`}
              size="small"
              sx={{
                height: 23,
                fontSize: "0.65rem",
                fontWeight: 700,
                backgroundColor:
                  traceability.summary.traceability_gaps > 0
                    ? "#fffaeb"
                    : "#ecfdf3",
                color:
                  traceability.summary.traceability_gaps > 0
                    ? "#b54708"
                    : "#027a48",
              }}
            />
          </Box>
        </Box>

        <Divider />

        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {[
                  "Requirement",
                  "Scenario",
                  "Test Case",
                  "Module",
                  "Priority",
                  "Execution",
                  "Run",
                  "Bug",
                  "Risk",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      py: 0.7,
                      px: 1,
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #eef2f6",
                      fontSize: "0.63rem",
                      fontWeight: 750,
                      color: muted,
                      textTransform: "uppercase",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {traceability.items.length ? (
                traceability.items.slice(0, 30).map((item, index) => (
                  <TableRow
                    key={`${item.test_case_code}-${index}`}
                    hover
                    onClick={() =>
                      openDrilldown(
                        `${item.test_case_code} Traceability`,
                        "Requirement-to-execution traceability record.",
                        [
                          { label: "Requirement", value: item.requirement_code },
                          { label: "Scenario", value: item.scenario_code },
                          { label: "Test Case", value: item.test_case_code },
                          { label: "Module", value: item.module },
                          { label: "Priority", value: item.priority },
                          {
                            label: "Execution Status",
                            value: item.execution_status ?? "Not Executed",
                            tone:
                              item.execution_status === "Passed"
                                ? "success"
                                : item.execution_status === "Failed"
                                  ? "danger"
                                  : "warning",
                          },
                          { label: "Execution ID", value: item.execution_id ?? "-" },
                          { label: "Run", value: item.run_code ?? "-" },
                          { label: "Bug", value: item.bug_code ?? "-" },
                          {
                            label: "Risk",
                            value: item.risk_level,
                            tone:
                              item.risk_level.toUpperCase() === "HIGH"
                                ? "danger"
                                : item.risk_level.toUpperCase() === "MEDIUM"
                                  ? "warning"
                                  : "success",
                          },
                        ],
                      )
                    }
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f8fbff" },
                    }}
                  >
                    <TableCell sx={{ fontSize: "0.69rem", fontWeight: 700 }}>
                      {item.requirement_code}
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.69rem" }}>
                      {item.scenario_code}
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.69rem", fontWeight: 650 }}>
                      {item.test_case_code}
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.69rem" }}>
                      {item.module}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.priority}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.61rem",
                          fontWeight: 700,
                          ...severityTone(item.priority),
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {item.execution_status ? (
                        <Chip
                          label={item.execution_status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.61rem",
                            fontWeight: 700,
                            ...statusTone(item.execution_status),
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: "0.67rem", color: muted }}>
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.67rem", fontWeight: 650 }}>
                      {item.run_code ?? "-"}
                    </TableCell>

                    <TableCell>
                      {item.bug_code ? (
                        <Chip
                          label={item.bug_code}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.61rem",
                            fontWeight: 700,
                            backgroundColor: "#fef3f2",
                            color: "#b42318",
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: "0.67rem", color: muted }}>
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.risk_level}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.61rem",
                          fontWeight: 750,
                          ...riskTone(item.risk_level),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.74rem", color: muted }}>
                      No traceability data available.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EntityListDialog
        data={entityList}
        onClose={() => setEntityList(null)}
        onOpen={(entity) => {
          window.location.href = entity.route;
        }}
      />

      <DrilldownDialog
        data={drilldown}
        onClose={() => setDrilldown(null)}
      />
    </Box>
  );
}
