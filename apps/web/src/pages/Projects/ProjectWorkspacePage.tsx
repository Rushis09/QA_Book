import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";

import PageHeader from "../../components/common/PageHeader";

import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";

import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";
import { testCaseService } from "../../services/testCaseService";
import { testRunService } from "../../services/testRunService";
import { testExecutionService } from "../../services/testExecutionService";
import { bugService } from "../../services/bugService";
import { documentService } from "../../services/documentService";
import { exportService } from "../../services/exportService";

import automationService, {
  type GitHubConnectionResponse,
} from "../../automation/services/automationService";

import type { Requirement } from "../../types/requirement";
import type { TestExecution } from "../../types/testExecution";
import type { Bug } from "../../types/bug";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

interface WorkspaceTab {
  value: string;
  label: string;
  icon: React.ReactElement;
}

const workspaceTabs: WorkspaceTab[] = [
  {
    value: "overview",
    label: "Overview",
    icon: <FolderOutlinedIcon />,
  },
  {
    value: "requirements",
    label: "Requirements",
    icon: <DescriptionOutlinedIcon />,
  },
  {
    value: "test-scenarios",
    label: "Test Scenarios",
    icon: <ChecklistOutlinedIcon />,
  },
  {
    value: "test-cases",
    label: "Test Cases",
    icon: <RuleOutlinedIcon />,
  },
  {
    value: "test-runs",
    label: "Test Runs",
    icon: <PlayArrowOutlinedIcon />,
  },
  {
    value: "bugs",
    label: "Bugs",
    icon: <BugReportOutlinedIcon />,
  },
  {
    value: "automation",
    label: "Automation",
    icon: <AutoAwesomeOutlinedIcon />,
  },
  {
    value: "documents",
    label: "Documents",
    icon: <DescriptionOutlinedIcon />,
  },
  {
    value: "export",
    label: "Export",
    icon: <FileDownloadOutlinedIcon />,
  },
  {
    value: "settings",
    label: "Settings",
    icon: <SettingsOutlinedIcon />,
  },
];

interface ExportOption {
  type:
    | "project"
    | "requirements"
    | "scenarios"
    | "test-cases"
    | "test-suites"
    | "test-runs"
    | "bugs";
  title: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    type: "project",
    title: "Project Summary",
    description:
      "Export the project overview and core project information.",
  },
  {
    type: "requirements",
    title: "Requirements",
    description:
      "Export all requirements belonging to this project.",
  },
  {
    type: "scenarios",
    title: "Test Scenarios",
    description:
      "Export all test scenarios associated with this project.",
  },
  {
    type: "test-cases",
    title: "Test Cases",
    description:
      "Export the project's test cases.",
  },
  {
    type: "test-suites",
    title: "Test Suites",
    description:
      "Export the project's test suites.",
  },
  {
    type: "test-runs",
    title: "Test Runs",
    description:
      "Export the project's test run history.",
  },
  {
    type: "bugs",
    title: "Bug Report",
    description:
      "Export the project's defect report.",
  },
];

type WorkspaceRecord = Record<string, unknown>;

interface DeleteImpactCounts {
  requirements: number;
  test_scenarios: number;
  test_cases: number;
  test_suites: number;
  test_runs: number;
  test_executions: number;
  bugs: number;
  documents: number;
}

interface WorkspaceData {
  requirements: Requirement[];
  scenarios: WorkspaceRecord[];
  testCases: WorkspaceRecord[];
  testRuns: WorkspaceRecord[];
  scenarioCount: number;
  testCaseCount: number;
  testRunCount: number;
  executions: TestExecution[];
  bugs: Bug[];
  suiteCount: number;
  documentCount: number;
  automationMappedCount: number;
  automationConnected: boolean;
  github: GitHubConnectionResponse | null;
  deleteImpactCounts: DeleteImpactCounts;
}

const emptyDeleteImpactCounts: DeleteImpactCounts = {
  requirements: 0,
  test_scenarios: 0,
  test_cases: 0,
  test_suites: 0,
  test_runs: 0,
  test_executions: 0,
  bugs: 0,
  documents: 0,
};

const emptyWorkspaceData: WorkspaceData = {
  requirements: [],
  scenarios: [],
  testCases: [],
  testRuns: [],
  executions: [],
  bugs: [],
  scenarioCount: 0,
  testCaseCount: 0,
  testRunCount: 0,
  suiteCount: 0,
  documentCount: 0,
  automationMappedCount: 0,
  automationConnected: false,
  github: null,
  deleteImpactCounts: {
    requirements: 0,
    test_scenarios: 0,
    test_cases: 0,
    test_suites: 0,
    test_runs: 0,
    test_executions: 0,
    bugs: 0,
    documents: 0,
    
  },
};

function SectionHeading({
      title,
      subtitle,
      action,
    }: {
      title: string;
      subtitle?: string;
      action?: React.ReactNode;
    }) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 750,
                color: "#172033",
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Typography>
          
            {subtitle && (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: "0.78rem",
                  color: "#667085",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        
          {action}
        </Box>
      );
    }

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { showNotification } =
    useNotification();

  const {
    setSelectedProject,
  } = useWorkspace();

  const [project, setProject] =
    useState<Project | null>(null);

  const [workspaceData, setWorkspaceData] =
    useState<WorkspaceData>(
      emptyWorkspaceData,
    );

  const [loading, setLoading] =
    useState(true);

  const [dataLoading, setDataLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("overview");

  const [exporting, setExporting] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDataLoading(true);

        const projectData =
          await projectService.getProject(
            Number(id),
          );

        if (cancelled) {
          return;
        }

        setProject(projectData);

        const [
          requirementsResult,
          scenariosResult,
          testCasesResult,
          testRunsResult,
          documentsResult,
          deleteImpactResult,
          automationResult,
        ] = await Promise.all([
          requirementService
            .getRequirements(projectData.id)
            .catch(() => []),

          testScenarioService
            .getTestScenarios(projectData.id)
            .catch(() => []),

          testCaseService
            .getTestCases(projectData.id)
            .catch(() => []),

          testRunService
            .getTestRuns(projectData.id)
            .catch(() => []),

          documentService
            .getProjectDocuments(projectData.id)
            .catch(() => []),

          projectService
            .getDeleteImpact(projectData.id)
            .catch(() => null),

          automationService
            .getAutomationProjectByProjectId(
              projectData.id,
            )
            .catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        const executionGroups =
          await Promise.all(
            testRunsResult.map((run) =>
              testExecutionService
                .getRunExecutions(run.id)
                .catch(() => []),
            ),
          );

        if (cancelled) {
          return;
        }

        const executions =
          executionGroups.flat();

        const executionIds =
          new Set(
            executions.map(
              (execution) =>
                execution.id,
            ),
          );

        let bugs: Bug[] = [];

        if (executionIds.size > 0) {
          const allBugs =
            await bugService
              .getBugs()
              .catch(() => []);

          bugs = allBugs.filter(
            (bug) =>
              executionIds.has(
                bug.execution_id,
              ),
          );
        }

        if (cancelled) {
          return;
        }

        let automationMappedCount =
          0;

        let github: GitHubConnectionResponse | null =
          null;

        let automationConnected =
          false;

        if (automationResult) {
          const mappings =
            await automationService
              .getAutomationTestMappings(
                automationResult.id,
              )
              .catch(() => []);

          automationMappedCount =
            mappings.length;

          automationConnected =
            Boolean(
              automationResult.repository_url,
            );

          github =
            await automationService
              .getGitHubConnection(
                automationResult.id,
              )
              .catch(() => null);
        }

        const impactCounts = getDeleteImpactCounts(
          deleteImpactResult,
        );

        const suiteCount =
          impactCounts.test_suites;

        const documentCount =
          documentsResult.length > 0
            ? documentsResult.length
            : impactCounts.documents;

        setWorkspaceData({
          requirements: requirementsResult,
          scenarios:
            scenariosResult as unknown as WorkspaceRecord[],
          testCases:
            testCasesResult as unknown as WorkspaceRecord[],
          testRuns:
            testRunsResult as unknown as WorkspaceRecord[],
          scenarioCount:
            scenariosResult.length,
          testCaseCount:
            testCasesResult.length,
          testRunCount:
            testRunsResult.length,
          executions,
          bugs,
          suiteCount,
          documentCount,
          automationMappedCount,
          automationConnected,
          github,
          deleteImpactCounts: impactCounts,
        });
      } catch (error) {
        console.error(
          "Failed to load project workspace:",
          error,
        );

        if (!cancelled) {
          showNotification(
            "Failed to load project workspace.",
            "error",
          );

          navigate("/projects", {
            replace: true,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setDataLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleExport(
    option: ExportOption,
  ) {
    if (!project || exporting) {
      return;
    }

    setExporting(option.type);

    try {
      switch (option.type) {
        case "project":
          await exportService.exportProject(
            project.id,
            project.project_code,
          );
          break;

        case "requirements":
          await exportService.exportRequirements(
            project.id,
            project.project_code,
          );
          break;

        case "scenarios":
          await exportService.exportScenarios(
            project.id,
            project.project_code,
          );
          break;

        case "test-cases":
          await exportService.exportTestCases(
            project.id,
            project.project_code,
          );
          break;

        case "test-suites":
          await exportService.exportTestSuites(
            project.id,
            project.project_code,
          );
          break;

        case "test-runs":
          await exportService.exportTestRuns(
            project.id,
            project.project_code,
          );
          break;

        case "bugs":
          await exportService.exportBugs(
            project.id,
            project.project_code,
          );
          break;
      }

      showNotification(
        `${option.title} exported successfully.`,
        "success",
      );
    } catch (error) {
      console.error(
        `Failed to export ${option.title}:`,
        error,
      );

      showNotification(
        `Failed to export ${option.title}.`,
        "error",
      );
    } finally {
      setExporting(null);
    }
  }

  function handleOpenModule(
    path: string,
  ) {
    if (project) {
      setSelectedProject(project);
    }

    navigate(path);
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!project) {
    return null;
  }

  

  return (
    <Box>
      <PageHeader
        title={project.name}
        actionLabel="Back to Projects"
        onAction={() =>
          navigate("/projects")
        }
      >
        <ProjectMeta project={project} />

        <Paper
          elevation={0}
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor:
              "#ffffff",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              px: 1,

              "& .MuiTabs-indicator": {
                height: 2,
                borderRadius: 2,
              },

              "& .MuiTab-root": {
                minHeight: 48,
                minWidth: "auto",
                px: 1.45,
                textTransform: "none",
                fontSize: "0.73rem",
                fontWeight: 650,
                color: "#667085",
              },

              "& .Mui-selected": {
                color: "#356dff",
              },
            }}
          >
            {workspaceTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Divider />

          <Box
            sx={{
              p: {
                xs: 1.5,
                md: 2,
              },
            }}
          >
            {dataLoading ? (
              <WorkspaceLoading />
            ) : (
              <>
                {activeTab ===
                  "overview" && (
                  <WorkspaceOverview
                    project={project}
                    data={workspaceData}
                  />
                )}

                {activeTab ===
                  "requirements" && (
                  <RequirementsReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/requirements",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "test-scenarios" && (
                  <ScenarioReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/test-scenarios",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "test-cases" && (
                  <TestCaseReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/test-cases",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "test-runs" && (
                  <TestRunReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/test-runs",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "bugs" && (
                  <BugReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/bugs",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "automation" && (
                  <AutomationReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule(
                        "/automation",
                      )
                    }
                  />
                )}

                {activeTab ===
                  "documents" && (
                  <DocumentsReport
                    project={project}
                    data={workspaceData}
                    onOpen={() =>
                      handleOpenModule("/projects")
                    }
                  />
                )}

                {activeTab ===
                  "export" && (
                  <WorkspaceExport
                    options={exportOptions}
                    exporting={exporting}
                    onExport={handleExport}
                  />
                )}

                {activeTab ===
                  "settings" && (
                  <SettingsReport
                    project={project}
                    data={workspaceData}
                    onOpenProjects={() =>
                      navigate("/projects")
                    }
                  />
                )}
              </>
            )}
          </Box>
        </Paper>
      </PageHeader>
    </Box>
  );
}

function ProjectMeta({
  project,
}: {
  project: Project;
}) {
  return (
    <Box
      sx={{
        mt: -0.75,
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.76rem",
          color: "#667085",
        }}
      >
        {project.project_code}
      </Typography>

      <Typography
        sx={{
          color: "#98a2b3",
          fontSize: "0.72rem",
        }}
      >
        •
      </Typography>

      <Typography
        sx={{
          fontSize: "0.76rem",
          color: "#667085",
        }}
      >
        {project.version
          ? `Version ${project.version}`
          : "No version"}
      </Typography>

      <Typography
        sx={{
          color: "#98a2b3",
          fontSize: "0.72rem",
        }}
      >
        •
      </Typography>

      <Typography
        sx={{
          fontSize: "0.76rem",
          color:
            project.status === "Active"
              ? "#027a48"
              : "#667085",
          fontWeight: 650,
        }}
      >
        {project.status}
      </Typography>
    </Box>
  );
}

function WorkspaceLoading() {
  return (
    <Box
      sx={{
        minHeight: 420,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

function WorkspaceOverview({
  project,
  data,
}: {
  project: Project;
  data: WorkspaceData;
}) {
  const executionStats =
    getExecutionStats(
      data.executions,
    );

  const bugStats =
    getBugStats(data.bugs);

  const requirementStats =
    getRequirementStats(
      data.requirements,
    );

  const totalLifecycle =
    data.requirements.length +
    data.scenarioCount +
    data.testCaseCount +
    data.suiteCount +
    data.testRunCount;

  const qualityScore =
    executionStats.executed > 0
      ? Math.round(
          (executionStats.passed /
            executionStats.executed) *
            100,
        )
      : null;

  return (
    <Box>
      <SectionHeading
        title="Project Overview"
        subtitle={`Project-level quality reporting for ${project.project_code}.`}
        />

      <Box
        sx={{
          mt: 1.5,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 1,
        }}
      >
        <MetricCard
          icon={<AssignmentOutlinedIcon />}
          label="Requirements"
          value={
            data.requirements.length
          }
        />

        <MetricCard
          icon={<ScienceOutlinedIcon />}
          label="Scenarios"
          value={
            data.scenarioCount
          }
        />

        <MetricCard
          icon={<RuleOutlinedIcon />}
          label="Test Cases"
          value={
            data.testCaseCount
          }
        />

        <MetricCard
          icon={<FolderCopyOutlinedIcon />}
          label="Test Suites"
          value={
            data.suiteCount
          }
        />

        <MetricCard
          icon={<PlayArrowOutlinedIcon />}
          label="Test Runs"
          value={
            data.testRunCount
          }
        />

        <MetricCard
          icon={<BugReportOutlinedIcon />}
          label="Bugs"
          value={
            data.bugs.length
          }
        />
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.45fr 0.9fr",
          },
          gap: 1,
        }}
      >
        <ReportCard
          title="QA Lifecycle"
          subtitle="Volume across the project's delivery chain."
        >
          <LifecycleBars
            data={[
              {
                label: "Requirements",
                value:
                  data.requirements
                    .length,
              },
              {
                label: "Scenarios",
                value:
                  data.scenarioCount,
              },
              {
                label: "Test Cases",
                value:
                  data.testCaseCount,
              },
              {
                label: "Test Suites",
                value:
                  data.suiteCount,
              },
              {
                label: "Test Runs",
                value:
                  data.testRunCount,
              },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Execution Quality"
          subtitle="Current execution outcome."
        >
          <QualityDonut
            value={
              qualityScore ?? 0
            }
            centerLabel={
              qualityScore !==
              null
                ? `${qualityScore}%`
                : "—"
            }
            caption={
              qualityScore !==
              null
                ? "Pass rate"
                : "Not executed"
            }
          />

          <Box
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: 0.75,
            }}
          >
            <MiniStat
              label="Passed"
              value={
                executionStats.passed
              }
              icon={
                <CheckCircleOutlinedIcon />
              }
            />

            <MiniStat
              label="Failed"
              value={
                executionStats.failed
              }
              icon={
                <ErrorOutlineOutlinedIcon />
              }
            />

            <MiniStat
              label="Blocked"
              value={
                executionStats.blocked
              }
              icon={
                <WarningAmberOutlinedIcon />
              }
            />
          </Box>
        </ReportCard>
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 1,
        }}
      >
        <ReportCard
          title="Requirement Health"
          subtitle="Current requirement lifecycle."
        >
          <StatusBars
            items={[
              {
                label: "Draft",
                value:
                  requirementStats.draft,
                total:
                  data.requirements
                    .length,
              },
              {
                label: "Approved",
                value:
                  requirementStats.approved,
                total:
                  data.requirements
                    .length,
              },
              {
                label: "Implemented",
                value:
                  requirementStats.implemented,
                total:
                  data.requirements
                    .length,
              },
              {
                label: "Other",
                value:
                  requirementStats.other,
                total:
                  data.requirements
                    .length,
              },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Automation Coverage"
          subtitle="Automation mapped against project test cases."
        >
          <CoverageMetric
            label="Mapped test cases"
            value={
              data.automationMappedCount
            }
            total={
              data.testCaseCount
            }
          />

          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 0.75,
            }}
          >
            <MiniStatus
              label="Automation"
              value={
                data.automationConnected
                  ? "Connected"
                  : "Not connected"
              }
              positive={
                data.automationConnected
              }
            />

            <MiniStatus
              label="GitHub"
              value={
                data.github
                  ?.connected
                  ? "Connected"
                  : "Not connected"
              }
              positive={
                Boolean(
                  data.github
                    ?.connected,
                )
              }
            />
          </Box>
        </ReportCard>
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 1,
        }}
      >
        <InsightCard
          icon={<TrendingUpOutlinedIcon />}
          label="Quality Score"
          value={
            qualityScore !==
            null
              ? `${qualityScore}%`
              : "—"
          }
          detail="Executed test pass rate"
        />

        <InsightCard
          icon={<ScheduleOutlinedIcon />}
          label="Executed"
          value={
            executionStats.executed
          }
          detail={`of ${data.executions.length} executions`}
        />

        <InsightCard
          icon={<WarningAmberOutlinedIcon />}
          label="Open Defects"
          value={
            bugStats.open
          }
          detail={`${bugStats.reopened} reopened`}
        />

        <InsightCard
          icon={<DescriptionOutlinedIcon />}
          label="Documents"
          value={
            data.documentCount
          }
          detail="Project documents"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          mt: 1,
          p: 1.5,
          border:
            "1px solid #e4e7ec",
          borderRadius: "9px",
          backgroundColor:
            "#f8fafc",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.76rem",
                fontWeight: 750,
                color: "#344054",
              }}
            >
              Project Reporting Snapshot
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                fontSize: "0.68rem",
                color: "#667085",
              }}
            >
              {totalLifecycle} QA
              artifacts across the
              lifecycle, with{" "}
              {executionStats.executed}{" "}
              executions completed.
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#667085",
            }}
          >
            Updated{" "}
            {formatDate(
              project.updated_at,
            )}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

function RequirementsReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const stats = getRequirementStats(data.requirements);
  const priorityStats = getStringDistribution(
    data.requirements,
    (item) => item.priority,
    ["Critical", "High", "Medium", "Low"],
  );
  const moduleStats = getStringDistribution(
    data.requirements,
    (item) => item.module,
  );
  const implementation = percentage(
    stats.implemented,
    data.requirements.length,
  );

  return (
    <ReportTabShell
      title="Requirements Health"
      description={`Coverage, lifecycle, priority, and module reporting for ${project.project_code}.`}
      icon={<AssignmentOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard label="Total Requirements" value={data.requirements.length} />
        <MetricCard label="Implemented" value={stats.implemented} />
        <MetricCard label="Approved" value={stats.approved} />
        <MetricCard label="Implementation" value={`${implementation}%`} />
      </MetricGrid>

      <ReportGrid>
        <ReportCard
          title="Requirement Lifecycle"
          subtitle="Current requirement maturity."
        >
          <StatusBars
            items={[
              { label: "Draft", value: stats.draft, total: data.requirements.length },
              { label: "Approved", value: stats.approved, total: data.requirements.length },
              { label: "Implemented", value: stats.implemented, total: data.requirements.length },
              { label: "Other", value: stats.other, total: data.requirements.length },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Implementation Health"
          subtitle="Implemented requirements against the project baseline."
        >
          <QualityDonut
            value={implementation}
            centerLabel={`${implementation}%`}
            caption="Implemented"
          />
        </ReportCard>
      </ReportGrid>

      <ReportGrid>
        <DistributionCard
          title="Priority Distribution"
          subtitle="Requirement concentration by priority."
          items={priorityStats}
        />

        <DistributionCard
          title="Module Distribution"
          subtitle="Requirement concentration by functional module."
          items={moduleStats}
          emptyLabel="No module data"
        />
      </ReportGrid>

      <InsightStrip
        items={[
          {
            label: "Coverage Signal",
            value: data.requirements.length > 0 ? "Requirements loaded" : "No requirements",
            detail: `${data.requirements.length} project requirements`,
          },
          {
            label: "Approval Gap",
            value: `${Math.max(data.requirements.length - stats.approved, 0)}`,
            detail: "Not yet approved",
          },
          {
            label: "Implementation Gap",
            value: `${Math.max(data.requirements.length - stats.implemented, 0)}`,
            detail: "Not yet implemented",
          },
        ]}
      />
    </ReportTabShell>
  );
}

function ScenarioReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const scenarioPerRequirement =
    data.requirements.length > 0
      ? (data.scenarios.length / data.requirements.length).toFixed(1)
      : "0.0";

  const linkedRequirementCount = countUniqueLinkedValues(
    data.scenarios,
    ["requirement_id", "requirementId", "requirement_code", "requirementCode"],
  );

  const scenarioCoverage =
    data.requirements.length > 0
      ? percentage(linkedRequirementCount, data.requirements.length)
      : 0;

  const scenarioStatus = getStringDistribution(
    data.scenarios,
    (item) => item.status,
  );

  return (
    <ReportTabShell
      title="Test Scenario Health"
      description={`Requirement-to-scenario coverage and scenario distribution for ${project.project_code}.`}
      icon={<ScienceOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard label="Scenarios" value={data.scenarios.length} />
        <MetricCard label="Requirements" value={data.requirements.length} />
        <MetricCard label="Scenario / Requirement" value={scenarioPerRequirement} />
        <MetricCard label="Linked Requirement Coverage" value={`${scenarioCoverage}%`} />
      </MetricGrid>

      <ReportGrid>
        <ReportCard
          title="Requirement-to-Scenario Coverage"
          subtitle="Coverage is calculated from explicit requirement links returned by the API."
        >
          <CoverageMetric
            label="Requirements with scenario links"
            value={linkedRequirementCount}
            total={data.requirements.length}
          />
          <InsightText
            text={
              linkedRequirementCount > 0
                ? `${linkedRequirementCount} requirement${linkedRequirementCount === 1 ? "" : "s"} have explicit scenario linkage.`
                : "No explicit requirement-to-scenario links were returned."
            }
          />
        </ReportCard>

        <DistributionCard
          title="Scenario Status"
          subtitle="Scenario lifecycle distribution."
          items={scenarioStatus}
          emptyLabel="No scenario status data"
        />
      </ReportGrid>

      <ReportGrid>
        <ReportCard
          title="QA Flow"
          subtitle="Volume across the scenario design layer."
        >
          <LifecycleBars
            data={[
              { label: "Requirements", value: data.requirements.length },
              { label: "Test Scenarios", value: data.scenarios.length },
              { label: "Test Cases", value: data.testCases.length },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Scenario Readiness"
          subtitle="Project signal based on scenario availability."
        >
          <QualityDonut
            value={data.scenarios.length > 0 ? 100 : 0}
            centerLabel={data.scenarios.length > 0 ? "Ready" : "—"}
            caption="Scenario layer"
          />
        </ReportCard>
      </ReportGrid>
    </ReportTabShell>
  );
}

function TestCaseReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const automationCoverage = percentage(
    data.automationMappedCount,
    data.testCases.length,
  );

  const priorityStats = getStringDistribution(
    data.testCases,
    (item) => item.priority,
    ["Critical", "High", "Medium", "Low"],
  );

  const typeStats = getStringDistribution(
    data.testCases,
    (item) => item.type ?? item.test_type ?? item.testType,
  );

  const statusStats = getStringDistribution(
    data.testCases,
    (item) => item.status,
  );

  return (
    <ReportTabShell
      title="Test Case Health"
      description={`Coverage, priority, type, status, and automation reporting for ${project.project_code}.`}
      icon={<RuleOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard label="Test Cases" value={data.testCases.length} />
        <MetricCard label="Automation Mapped" value={data.automationMappedCount} />
        <MetricCard label="Automation Coverage" value={`${automationCoverage}%`} />
        <MetricCard label="Test Runs" value={data.testRuns.length} />
      </MetricGrid>

      <ReportGrid>
        <DistributionCard
          title="Priority Distribution"
          subtitle="Test case concentration by priority."
          items={priorityStats}
        />

        <DistributionCard
          title="Test Type Distribution"
          subtitle="Test case mix by type."
          items={typeStats}
          emptyLabel="No type data"
        />
      </ReportGrid>

      <ReportGrid>
        <DistributionCard
          title="Test Case Status"
          subtitle="Current test case lifecycle."
          items={statusStats}
          emptyLabel="No status data"
        />

        <ReportCard
          title="Automation Readiness"
          subtitle="Mapped automation against project test cases."
        >
          <CoverageMetric
            label="Automation mapped"
            value={data.automationMappedCount}
            total={data.testCases.length}
          />
          <InsightText
            text={
              data.testCases.length === 0
                ? "No test cases are available for automation coverage."
                : `${data.testCases.length - data.automationMappedCount} test case${data.testCases.length - data.automationMappedCount === 1 ? "" : "s"} remain unmapped.`
            }
          />
        </ReportCard>
      </ReportGrid>
    </ReportTabShell>
  );
}

function TestRunReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const stats = getExecutionStats(data.executions);
  const passRate = stats.executed > 0
    ? percentage(stats.passed, stats.executed)
    : 0;

  const runStatus = getStringDistribution(
    data.testRuns,
    (item) => item.status,
  );

  const recentRuns = [...data.testRuns]
    .sort((a, b) => getRecordDate(b) - getRecordDate(a))
    .slice(0, 5);

  return (
    <ReportTabShell
      title="Test Run Health"
      description={`Execution progress, outcomes, and recent run history for ${project.project_code}.`}
      icon={<PlayArrowOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard label="Test Runs" value={data.testRuns.length} />
        <MetricCard label="Executions" value={data.executions.length} />
        <MetricCard label="Executed" value={stats.executed} />
        <MetricCard label="Failed" value={stats.failed} />
        <MetricCard label="Pass Rate" value={`${passRate}%`} />
      </MetricGrid>

      <ReportGrid>
        <ReportCard
          title="Execution Outcome"
          subtitle="Passed, failed, blocked, and pending execution results."
        >
          <OutcomeBars stats={stats} />
        </ReportCard>

        <ReportCard
          title="Execution Completion"
          subtitle="Executed versus not yet executed."
        >
          <CoverageMetric
            label="Executed"
            value={stats.executed}
            total={stats.total}
          />
          <Box sx={{ mt: 1 }}>
            <MiniStatus
              label="Execution health"
              value={stats.failed > 0 ? "Attention required" : stats.executed > 0 ? "Healthy" : "Not started"}
              positive={stats.failed === 0 && stats.executed > 0}
            />
          </Box>
        </ReportCard>
      </ReportGrid>

      <ReportGrid>
        <DistributionCard
          title="Run Status"
          subtitle="Current lifecycle state of project runs."
          items={runStatus}
          emptyLabel="No run status data"
        />

        <ReportCard
          title="Recent Test Runs"
          subtitle="Latest project runs, newest first."
        >
          {recentRuns.length === 0 ? (
            <EmptyState text="No test runs available." />
          ) : (
            recentRuns.map((run, index) => (
              <TimelineRow
                key={`${getRecordText(run, ["id", "run_id", "run_code"]) || "run"}-${index}`}
                title={getRecordText(run, ["run_code", "code", "name", "id"]) || `Test Run ${index + 1}`}
                detail={getRecordText(run, ["status", "execution_type", "executionType"]) || "Status not available"}
                date={getRecordDateLabel(run)}
              />
            ))
          )}
        </ReportCard>
      </ReportGrid>
    </ReportTabShell>
  );
}

function BugReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const stats = getBugStats(data.bugs);

  const severityStats = getStringDistribution(
    data.bugs,
    (item) => item.severity,
    ["Critical", "High", "Medium", "Low"],
  );

  const priorityStats = getStringDistribution(
    data.bugs,
    (item) => item.priority,
    ["Critical", "High", "Medium", "Low"],
  );

  const retestCount = data.bugs.reduce(
    (sum, bug) => sum + getRetestCount(bug),
    0,
  );

  const bugsWithRetests = data.bugs.filter(
    (bug) => getRetestCount(bug) > 0,
  ).length;

  return (
    <ReportTabShell
      title="Defect Health"
      description={`Severity, priority, lifecycle, and retest reporting for ${project.project_code}.`}
      icon={<BugReportOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard label="Total Bugs" value={data.bugs.length} />
        <MetricCard label="Open" value={stats.open} />
        <MetricCard label="In Progress" value={stats.inProgress} />
        <MetricCard label="Reopened" value={stats.reopened} />
        <MetricCard label="Closed" value={stats.closed} />
      </MetricGrid>

      <ReportGrid>
        <DistributionCard
          title="Severity Distribution"
          subtitle="Defects grouped by severity."
          items={severityStats}
          emptyLabel="No severity data"
        />

        <DistributionCard
          title="Priority Distribution"
          subtitle="Defects grouped by priority."
          items={priorityStats}
          emptyLabel="No priority data"
        />
      </ReportGrid>

      <ReportGrid>
        <ReportCard
          title="Defect Lifecycle"
          subtitle="Current defect state distribution."
        >
          <StatusBars
            items={[
              { label: "Open", value: stats.open, total: data.bugs.length },
              { label: "In Progress", value: stats.inProgress, total: data.bugs.length },
              { label: "Fixed", value: stats.fixed, total: data.bugs.length },
              { label: "Closed", value: stats.closed, total: data.bugs.length },
              { label: "Reopened", value: stats.reopened, total: data.bugs.length },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Retest Health"
          subtitle="Retest activity visible from returned bug data."
        >
          <MetricGrid compact>
            <MetricCard label="Retests" value={retestCount} />
            <MetricCard label="Bugs Retested" value={bugsWithRetests} />
          </MetricGrid>
          <InsightText
            text={
              retestCount > 0
                ? `${bugsWithRetests} defect${bugsWithRetests === 1 ? "" : "s"} have retest activity.`
                : "No retest records are exposed in the current bug response."
            }
          />
        </ReportCard>
      </ReportGrid>
    </ReportTabShell>
  );
}

function AutomationReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const coverage = percentage(
    data.automationMappedCount,
    data.testCases.length,
  );

  return (
    <ReportTabShell
      title="Automation Health"
      description={`Automation coverage, mapping, GitHub, and CI readiness for ${project.project_code}.`}
      icon={<AutoAwesomeOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard
          icon={<AutoAwesomeOutlinedIcon />}
          label="Automation"
          value={data.automationConnected ? "Connected" : "Not Connected"}
        />
        <MetricCard
          icon={<RuleOutlinedIcon />}
          label="Mapped Cases"
          value={data.automationMappedCount}
        />
        <MetricCard
          icon={<GitHubIcon />}
          label="GitHub"
          value={data.github?.connected ? "Connected" : "Not Connected"}
        />
        <MetricCard
          icon={<TrendingUpOutlinedIcon />}
          label="Coverage"
          value={`${coverage}%`}
        />
      </MetricGrid>

      <ReportGrid>
        <ReportCard
          title="Automation Coverage"
          subtitle="Mapped automation against all project test cases."
        >
          <CoverageMetric
            label="Mapped test cases"
            value={data.automationMappedCount}
            total={data.testCases.length}
          />
          <InsightText
            text={
              data.testCases.length === 0
                ? "No test cases are available for automation mapping."
                : `${data.testCases.length - data.automationMappedCount} test case${data.testCases.length - data.automationMappedCount === 1 ? "" : "s"} remain unmapped.`
            }
          />
        </ReportCard>

        <ReportCard
          title="CI Connection"
          subtitle="Current GitHub automation connection."
        >
          <ConnectionRow
            icon={<GitHubIcon />}
            label="GitHub"
            value={data.github?.connected ? "Connected" : "Not connected"}
            positive={Boolean(data.github?.connected)}
          />
          <ConnectionRow
            icon={<CloudOutlinedIcon />}
            label="Automation Project"
            value={data.automationConnected ? "Configured" : "Not configured"}
            positive={data.automationConnected}
          />
          <ConnectionRow
            icon={<CheckCircleOutlinedIcon />}
            label="CI Readiness"
            value={
              data.github?.connected && data.automationConnected
                ? "Ready"
                : "Attention required"
            }
            positive={Boolean(data.github?.connected && data.automationConnected)}
          />

          {data.github?.repository_name && (
            <Typography
              sx={{
                mt: 1,
                fontSize: "0.69rem",
                color: "#667085",
              }}
            >
              Repository: {data.github.repository_name}
            </Typography>
          )}
        </ReportCard>
      </ReportGrid>

      <ReportCard
        title="Automation Readiness"
        subtitle="Recommended focus based on current coverage."
        sx={{ mt: 1 }}
      >
        <InsightStrip
          items={[
            {
              label: "Mapped",
              value: data.automationMappedCount,
              detail: "Automated test cases",
            },
            {
              label: "Unmapped",
              value: Math.max(data.testCases.length - data.automationMappedCount, 0),
              detail: "Candidates for automation",
            },
            {
              label: "CI",
              value: data.github?.connected ? "Ready" : "Pending",
              detail: "GitHub connection",
            },
          ]}
        />
      </ReportCard>
    </ReportTabShell>
  );
}

function DocumentsReport({
  project,
  data,
  onOpen,
}: {
  project: Project;
  data: WorkspaceData;
  onOpen: () => void;
}) {
  const hasDocuments = data.documentCount > 0;
  const documentCoverage = hasDocuments ? 100 : 0;

  return (
    <ReportTabShell
      title="Document Health"
      description={`Project documentation inventory and readiness for ${project.project_code}.`}
      icon={<DescriptionOutlinedIcon />}
      actionLabel="Open Full Module"
      onAction={onOpen}
    >
      <MetricGrid>
        <MetricCard icon={<DescriptionOutlinedIcon />} label="Documents" value={data.documentCount} />
        <MetricCard icon={<CheckCircleOutlinedIcon />} label="Documentation" value={hasDocuments ? "Available" : "Missing"} />
        <MetricCard icon={<FolderCopyOutlinedIcon />} label="Project" value={project.project_code} />
        <MetricCard icon={<TrendingUpOutlinedIcon />} label="Last Updated" value={formatDate(project.updated_at)} />
      </MetricGrid>

      <ReportGrid>
        <ReportCard
          title="Documentation Readiness"
          subtitle="Project documentation availability."
        >
          <CoverageMetric
            label="Document availability"
            value={hasDocuments ? 1 : 0}
            total={1}
            valueLabel={hasDocuments ? "Available" : "Missing"}
          />
          <InsightText
            text={
              hasDocuments
                ? `${data.documentCount} document${data.documentCount === 1 ? "" : "s"} are available for this project.`
                : "No project documents are currently available."
            }
          />
        </ReportCard>

        <ReportCard
          title="Document Inventory"
          subtitle="Current documentation signal."
        >
          <QualityDonut
            value={documentCoverage}
            centerLabel={`${documentCoverage}%`}
            caption="Available"
          />
        </ReportCard>
      </ReportGrid>

      <InsightStrip
        items={[
          {
            label: "Inventory",
            value: data.documentCount,
            detail: "Project documents",
          },
          {
            label: "Status",
            value: hasDocuments ? "Available" : "Missing",
            detail: "Documentation readiness",
          },
          {
            label: "Storage",
            value: "Managed",
            detail: "Project document storage",
          },
        ]}
      />
    </ReportTabShell>
  );
}

function WorkspaceExport({
  options,
  exporting,
  onExport,
}: {
  options: ExportOption[];
  exporting: string | null;
  onExport: (option: ExportOption) => Promise<void>;
}) {
  return (
    <ReportTabShell
      title="Project Exports"
      description="Professional project-level QA reporting exports."
      icon={<FileDownloadOutlinedIcon />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 1,
        }}
      >
        {options.map((option) => (
          <Paper
            key={option.type}
            elevation={0}
            sx={{
              p: 1.5,
              border: "1px solid #e4e7ec",
              borderRadius: "9px",
              backgroundColor: "#ffffff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 750,
                    color: "#344054",
                  }}
                >
                  {option.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: "0.67rem",
                    lineHeight: 1.5,
                    color: "#98a2b3",
                  }}
                >
                  {option.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#eef4ff",
                  color: "#356dff",
                  flexShrink: 0,
                }}
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
              </Box>
            </Box>

            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onExport(option)}
              disabled={exporting !== null}
              sx={{
                mt: 1.25,
                height: 32,
                borderRadius: "8px",
                fontSize: "0.68rem",
                fontWeight: 650,
                textTransform: "none",
              }}
            >
              {exporting === option.type ? "Exporting..." : "Export Excel"}
            </Button>
          </Paper>
        ))}
      </Box>

      <ReportCard
        title="Export Scope"
        subtitle="All exports are scoped to the project currently open in Workspace."
        sx={{ mt: 1 }}
      >
        <InsightStrip
          items={[
            { label: "Scope", value: "Project", detail: "Current workspace project" },
            { label: "Format", value: "Excel", detail: "XLSX downloads" },
            { label: "Reports", value: options.length, detail: "Available export types" },
          ]}
        />
      </ReportCard>
    </ReportTabShell>
  );
}

function SettingsReport({
  project,
  data,
  onOpenProjects,
}: {
  project: Project;
  data: WorkspaceData;
  onOpenProjects: () => void;
}) {
  const counts = data.deleteImpactCounts;
  const totalImpact =
    counts.requirements +
    counts.test_scenarios +
    counts.test_cases +
    counts.test_suites +
    counts.test_runs +
    counts.test_executions +
    counts.bugs +
    counts.documents;

  return (
    <ReportTabShell
      title="Project Settings"
      description="Project configuration, impact visibility, and safe administration controls."
      icon={<SettingsOutlinedIcon />}
    >
      <ReportGrid>
        <ReportCard
          title="Project Configuration"
          subtitle="Current project identity and lifecycle."
        >
          <SettingRow label="Project Code" value={project.project_code} />
          <SettingRow label="Project Name" value={project.name} />
          <SettingRow label="Status" value={project.status} />
          <SettingRow label="Version" value={project.version ?? "Not specified"} />
          <SettingRow label="Start Date" value={project.start_date ?? "Not specified"} />
          <SettingRow label="End Date" value={project.end_date ?? "Not specified"} last />
        </ReportCard>

        <ReportCard
          title="Deletion Impact"
          subtitle="Preview of QABook data affected by project deletion."
        >
          <MetricGrid compact>
            <MetricCard label="Requirements" value={counts.requirements} />
            <MetricCard label="Scenarios" value={counts.test_scenarios} />
            <MetricCard label="Test Cases" value={counts.test_cases} />
            <MetricCard label="Test Runs" value={counts.test_runs} />
          </MetricGrid>

          <Box
            sx={{
              mt: 1,
              p: 1.25,
              border: "1px solid #fed7aa",
              borderRadius: "8px",
              backgroundColor: "#fffaf5",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 750,
                color: "#9a3412",
              }}
            >
              Safe deletion policy
            </Typography>
            <Typography
              sx={{
                mt: 0.35,
                fontSize: "0.66rem",
                lineHeight: 1.5,
                color: "#7c2d12",
              }}
            >
              QABook project data is removed through the Projects module. The connected
              GitHub repository is not deleted.
            </Typography>
          </Box>

          <Typography
            sx={{
              mt: 0.9,
              fontSize: "0.65rem",
              color: "#98a2b3",
            }}
          >
            {totalImpact} QABook records are currently included in the impact preview.
          </Typography>
        </ReportCard>
      </ReportGrid>

      <ReportCard
        title="Project Administration"
        subtitle="Use the Projects module for controlled project-level actions."
        sx={{ mt: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              Manage project safely
            </Typography>
            <Typography
              sx={{
                mt: 0.3,
                fontSize: "0.67rem",
                color: "#667085",
              }}
            >
              Edit details, manage documents, review deletion impact, and perform project actions.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={onOpenProjects}
            sx={{
              height: 32,
              borderRadius: "8px",
              fontSize: "0.69rem",
              fontWeight: 650,
              textTransform: "none",
            }}
          >
            Open Projects
          </Button>
        </Box>
      </ReportCard>
    </ReportTabShell>
  );
}

function MetricGrid({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          sm: compact ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          lg: compact ? "repeat(4, 1fr)" : "repeat(4, 1fr)",
        },
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

function ReportGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        mt: 1,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "1fr 1fr",
        },
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

function DistributionCard({
  title,
  subtitle,
  items,
  emptyLabel = "No data available",
}: {
  title: string;
  subtitle: string;
  items: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  return (
    <ReportCard title={title} subtitle={subtitle}>
      {items.length === 0 ? (
        <EmptyState text={emptyLabel} />
      ) : (
        <StatusBars
          items={items.map((item) => ({
            ...item,
            total: items.reduce((sum, current) => sum + current.value, 0),
          }))}
        />
      )}
    </ReportCard>
  );
}

function InsightStrip({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    detail: string;
  }[];
}) {
  return (
    <Box
      sx={{
        mt: 1,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: `repeat(${Math.min(items.length, 3)}, 1fr)`,
        },
        gap: 1,
      }}
    >
      {items.map((item) => (
        <InsightCard
          key={item.label}
          icon={<TrendingUpOutlinedIcon />}
          label={item.label}
          value={item.value}
          detail={item.detail}
        />
      ))}
    </Box>
  );
}

function InsightText({ text }: { text: string }) {
  return (
    <Box
      sx={{
        mt: 1,
        p: 1,
        borderRadius: "7px",
        backgroundColor: "#f8fafc",
        border: "1px solid #eef0f3",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.66rem",
          lineHeight: 1.5,
          color: "#667085",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Box
      sx={{
        minHeight: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed #d0d5dd",
        borderRadius: "8px",
        backgroundColor: "#fcfcfd",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "#98a2b3",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function TimelineRow({
  title,
  detail,
  date,
}: {
  title: string;
  detail: string;
  date: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.75,
        borderBottom: "1px solid #f2f4f7",
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#356dff",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "#344054",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            mt: 0.15,
            fontSize: "0.61rem",
            color: "#98a2b3",
          }}
        >
          {detail}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: "0.6rem",
          color: "#98a2b3",
          flexShrink: 0,
        }}
      >
        {date}
      </Typography>
    </Box>
  );
}

function ReportTabShell({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "#eef4ff",
              color: "#356dff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.96rem",
                fontWeight: 750,
                color: "#101828",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.7rem",
                color: "#667085",
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>

        {actionLabel &&
          onAction && (
            <Button
              variant="outlined"
              startIcon={
                <OpenInNewOutlinedIcon
                  sx={{
                    fontSize: 16,
                  }}
                />
              }
              onClick={onAction}
              sx={{
                height: 32,
                borderRadius: "8px",
                fontSize: "0.69rem",
                fontWeight: 650,
                textTransform: "none",
              }}
            >
              {actionLabel}
            </Button>
          )}
      </Box>

      <Box sx={{ mt: 1.25 }}>
        {children}
      </Box>
    </Box>
  );
}

function ReportCard({
  title,
  subtitle,
  children,
  sx,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        border:
          "1px solid #e4e7ec",
        borderRadius: "9px",
        backgroundColor:
          "#ffffff",
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.76rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          mb: 1.25,
          fontSize: "0.67rem",
          color: "#98a2b3",
        }}
      >
        {subtitle}
      </Typography>

      {children}
    </Paper>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 70,
        p: 1.25,
        border:
          "1px solid #e4e7ec",
        borderRadius: "8px",
        backgroundColor:
          "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 27,
              height: 27,
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "#eef4ff",
              color: "#356dff",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          sx={{
            fontSize: "0.63rem",
            fontWeight: 700,
            color: "#667085",
            textTransform:
              "uppercase",
            letterSpacing:
              "0.035em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.7,
          fontSize: "0.98rem",
          lineHeight: 1.05,
          fontWeight: 750,
          color: "#101828",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function InsightCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.35,
        border:
          "1px solid #e4e7ec",
        borderRadius: "8px",
        backgroundColor:
          "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.7,
        }}
      >
        <Box
          sx={{
            color: "#356dff",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#667085",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.7,
          fontSize: "1rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: "0.64rem",
          color: "#98a2b3",
        }}
      >
        {detail}
      </Typography>
    </Paper>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 0.8,
        border:
          "1px solid #eef0f3",
        borderRadius: "7px",
        backgroundColor:
          "#fbfcfe",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.4,
          color: "#667085",
        }}
      >
        {icon}

        <Typography
          sx={{
            fontSize: "0.61rem",
            fontWeight: 650,
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: "0.85rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function MiniStatus({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1,
        border:
          "1px solid #eef0f3",
        borderRadius: "7px",
        backgroundColor:
          "#fbfcfe",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.61rem",
          color: "#98a2b3",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: "0.7rem",
          fontWeight: 700,
          color: positive
            ? "#027a48"
            : "#667085",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function LifecycleBars({
  data,
}: {
  data: {
    label: string;
    value: number;
  }[];
}) {
  const max =
    Math.max(
      ...data.map(
        (item) => item.value,
      ),
      1,
    );

  return (
    <Box>
      {data.map((item) => (
        <Box
          key={item.label}
          sx={{
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 1,
              mb: 0.45,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#475467",
              }}
            >
              {item.label}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              {item.value}
            </Typography>
          </Box>

          <Box
            sx={{
              height: 7,
              borderRadius: 999,
              backgroundColor:
                "#eef2f6",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.max(
                  4,
                  (item.value /
                    max) *
                    100,
                )}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #356dff, #6d8fff)",
                transition:
                  "width 300ms ease",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function StatusBars({
  items,
}: {
  items: {
    label: string;
    value: number;
    total: number;
  }[];
}) {
  return (
    <Box>
      {items.map((item) => {
        const value =
          item.total > 0
            ? Math.round(
                (item.value /
                  item.total) *
                  100,
              )
            : 0;

        return (
          <Box
            key={item.label}
            sx={{
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                mb: 0.4,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "#475467",
                }}
              >
                {item.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                {item.value}{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#98a2b3",
                    fontWeight: 500,
                  }}
                >
                  ({value}%)
                </Box>
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 6,
                borderRadius: 999,
                backgroundColor:
                  "#eef2f6",

                "& .MuiLinearProgress-bar":
                  {
                    borderRadius: 999,
                  },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function OutcomeBars({
  stats,
}: {
  stats: ExecutionStats;
}) {
  const total =
    stats.executed;

  return (
    <StatusBars
      items={[
        {
          label: "Passed",
          value: stats.passed,
          total,
        },
        {
          label: "Failed",
          value: stats.failed,
          total,
        },
        {
          label: "Blocked",
          value: stats.blocked,
          total,
        },
        {
          label: "Not Executed",
          value:
            stats.notExecuted,
          total:
            stats.total,
        },
      ]}
    />
  );
}

function CoverageMetric({
  label,
  value,
  total,
  valueLabel,
}: {
  label: string;
  value: number;
  total: number;
  valueLabel?: string;
}) {
  const percentageValue =
    total > 0
      ? Math.round(
          (value / total) * 100,
        )
      : 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "baseline",
          gap: 1,
          mb: 0.6,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.69rem",
            color: "#475467",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 750,
            color: "#101828",
          }}
        >
          {valueLabel ??
            `${value} / ${total}`}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentageValue}
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor:
            "#eef2f6",

          "& .MuiLinearProgress-bar":
            {
              borderRadius: 999,
            },
        }}
      />

      <Typography
        sx={{
          mt: 0.45,
          fontSize: "0.64rem",
          color: "#98a2b3",
        }}
      >
        {percentageValue}% coverage
      </Typography>
    </Box>
  );
}

function QualityDonut({
  value,
  centerLabel,
  caption,
}: {
  value: number;
  centerLabel: string;
  caption: string;
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(100, value),
    );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 128,
          height: 128,
          borderRadius: "50%",
          background: `conic-gradient(#356dff ${safeValue}%, #edf1f5 0)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 94,
            height: 94,
            borderRadius: "50%",
            backgroundColor:
              "#ffffff",
            display: "flex",
            flexDirection:
              "column",
            alignItems: "center",
            justifyContent:
              "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#101828",
              lineHeight: 1,
            }}
          >
            {centerLabel}
          </Typography>

          <Typography
            sx={{
              mt: 0.45,
              fontSize: "0.62rem",
              color: "#98a2b3",
            }}
          >
            {caption}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ConnectionRow({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: 1,
        py: 0.85,
        borderBottom:
          "1px solid #f2f4f7",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.7,
        }}
      >
        <Box
          sx={{
            color: "#667085",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "#475467",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: positive
            ? "#027a48"
            : "#667085",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function SettingRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: 1.5,
        py: 0.8,
        borderBottom: last
          ? "none"
          : "1px solid #f2f4f7",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "#667085",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 650,
          color: "#344054",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}


function getStringDistribution<T>(
  records: T[],
  getter: (record: T) => unknown,
  preferredOrder: string[] = [],
): { label: string; value: number }[] {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const raw = getter(record);
    const value =
      typeof raw === "string" && raw.trim()
        ? raw.trim()
        : "Other";

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  const ordered = preferredOrder
    .filter((label) => counts.has(label))
    .map((label) => ({
      label,
      value: counts.get(label) ?? 0,
    }));

  const preferredSet = new Set(preferredOrder);
  const remainder = Array.from(counts.entries())
    .filter(([label]) => !preferredSet.has(label))
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  return [...ordered, ...remainder];
}

function getRecordText(
  record: WorkspaceRecord,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number"
    ) {
      return String(value);
    }
  }

  return "";
}

function getRecordDate(
  record: WorkspaceRecord,
): number {
  const keys = [
    "updated_at",
    "updatedAt",
    "created_at",
    "createdAt",
    "started_at",
    "startedAt",
    "executed_at",
    "executedAt",
  ];

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      const time = new Date(value).getTime();

      if (!Number.isNaN(time)) {
        return time;
      }
    }
  }

  return 0;
}

function getRecordDateLabel(
  record: WorkspaceRecord,
): string {
  const time = getRecordDate(record);

  return time > 0
    ? formatDate(new Date(time).toISOString())
    : "—";
}

function countUniqueLinkedValues(
  records: WorkspaceRecord[],
  keys: string[],
): number {
  const linked = new Set<string>();

  records.forEach((record) => {
    for (const key of keys) {
      const value = record[key];

      if (
        typeof value === "number" ||
        (typeof value === "string" && value.trim())
      ) {
        linked.add(String(value).trim());
        break;
      }
    }
  });

  return linked.size;
}

function getRetestCount(
  bug: Bug,
): number {
  const record =
    bug as unknown as WorkspaceRecord;

  const candidates = [
    record.retests,
    record.bug_retests,
    record.bugRetests,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.length;
    }
  }

  return 0;
}

function getDeleteImpactCounts(
  value: unknown,
): DeleteImpactCounts {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return { ...emptyDeleteImpactCounts };
  }

  const root =
    value as WorkspaceRecord;

  const rawCounts =
    root.counts;

  if (
    !rawCounts ||
    typeof rawCounts !== "object"
  ) {
    return { ...emptyDeleteImpactCounts };
  }

  const counts =
    rawCounts as WorkspaceRecord;

  return {
    requirements: getNumber(counts.requirements),
    test_scenarios: getNumber(counts.test_scenarios),
    test_cases: getNumber(counts.test_cases),
    test_suites: getNumber(counts.test_suites),
    test_runs: getNumber(counts.test_runs),
    test_executions: getNumber(counts.test_executions),
    bugs: getNumber(counts.bugs),
    documents: getNumber(counts.documents),
  };
}

function getNumber(
  value: unknown,
): number {
  return typeof value === "number"
    ? value
    : 0;
}

interface ExecutionStats {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notExecuted: number;
  executed: number;
}

function getExecutionStats(
  executions: TestExecution[],
): ExecutionStats {
  const passed =
    executions.filter(
      (execution) =>
        execution.status ===
        "Passed",
    ).length;

  const failed =
    executions.filter(
      (execution) =>
        execution.status ===
        "Failed",
    ).length;

  const blocked =
    executions.filter(
      (execution) =>
        execution.status ===
        "Blocked",
    ).length;

  const executed =
    passed +
    failed +
    blocked;

  return {
    total: executions.length,
    passed,
    failed,
    blocked,
    executed,
    notExecuted:
      executions.length -
      executed,
  };
}

function getRequirementStats(
  requirements: Requirement[],
) {
  let draft = 0;
  let approved = 0;
  let implemented = 0;
  let other = 0;

  requirements.forEach(
    (requirement) => {
      switch (
        requirement.status
      ) {
        case "Draft":
          draft += 1;
          break;

        case "Approved":
          approved += 1;
          break;

        case "Implemented":
          implemented += 1;
          break;

        default:
          other += 1;
      }
    },
  );

  return {
    draft,
    approved,
    implemented,
    other,
  };
}

function getBugStats(
  bugs: Bug[],
) {
  let open = 0;
  let inProgress = 0;
  let fixed = 0;
  let closed = 0;
  let reopened = 0;

  bugs.forEach((bug) => {
    switch (bug.status) {
      case "Open":
        open += 1;
        break;

      case "In Progress":
        inProgress += 1;
        break;

      case "Fixed":
        fixed += 1;
        break;

      case "Closed":
        closed += 1;
        break;

      case "Reopened":
        reopened += 1;
        break;

      default:
        open += 1;
    }
  });

  return {
    open,
    inProgress,
    fixed,
    closed,
    reopened,
  };
}

function percentage(
  value: number,
  total: number,
): number {
  if (!total) {
    return 0;
  }

  return Math.round(
    (value / total) * 100,
  );
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}