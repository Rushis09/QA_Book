import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CheckIcon from "@mui/icons-material/Check";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import ProjectDialog from "../../components/projects/ProjectDialog";
import ProjectTable from "../../components/projects/ProjectTable";
import BRDDocumentDialog from "../../components/projects/BRDDocumentDialog";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import {
  projectService,
  type ProjectDeleteImpact,
} from "../../services/projectService";

import { documentService } from "../../services/documentService";

import { testRunService } from "../../services/testRunService";
import { testExecutionService } from "../../services/testExecutionService";
import automationService from "../../automation/services/automationService";

import type { Project } from "../../types/project";

interface ProjectMetrics {
  qaProgress: number | null;
  automationConnected: boolean;
  mappedCount: number;
}

type StatusFilter = "All" | string;

type SortOption =
  | "updated"
  | "name"
  | "status";

async function loadProjectMetrics(
  project: Project,
): Promise<ProjectMetrics> {
  let automationConnected = false;
  let mappedCount = 0;

  try {
    const automationProject =
      await automationService.getAutomationProjectByProjectId(
        project.id,
      );

    automationConnected =
      Boolean(
        automationProject.repository_url,
      );

    try {
      const mappings =
        await automationService.getAutomationTestMappings(
          automationProject.id,
        );

      mappedCount = mappings.length;
    } catch {
      mappedCount = 0;
    }
  } catch {
    automationConnected = false;
    mappedCount = 0;
  }

  try {
    const runs =
      await testRunService.getTestRuns(
        project.id,
      );

    if (runs.length === 0) {
      return {
        qaProgress: null,
        automationConnected,
        mappedCount,
      };
    }

    const executionGroups =
      await Promise.all(
        runs.map((run) =>
          testExecutionService
            .getRunExecutions(run.id)
            .catch(() => []),
        ),
      );

    const executions =
      executionGroups.flat();

    const executed =
      executions.filter(
        (execution) =>
          execution.status === "Passed" ||
          execution.status === "Failed" ||
          execution.status === "Blocked",
      );

    if (executed.length === 0) {
      return {
        qaProgress: null,
        automationConnected,
        mappedCount,
      };
    }

    const passed =
      executed.filter(
        (execution) =>
          execution.status === "Passed",
      ).length;

    return {
      qaProgress: Math.round(
        (passed / executed.length) * 100,
      ),
      automationConnected,
      mappedCount,
    };
  } catch {
    return {
      qaProgress: null,
      automationConnected,
      mappedCount,
    };
  }
}

export default function ProjectsPage() {
  const {
    projects,
    loading,
    refreshProjects,
    selectedProject: workspaceSelectedProject,
  } = useWorkspace();

  const navigate = useNavigate();

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [
    existingBrdFileName,
    setExistingBrdFileName,
  ] = useState<string | undefined>(
    undefined,
  );

  const [openBrdDialog, setOpenBrdDialog] =
    useState(false);

  const [brdProject, setBrdProject] =
    useState<Project | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const [deleteImpact, setDeleteImpact] =
    useState<ProjectDeleteImpact | null>(
      null,
    );

  const [
    deleteImpactLoading,
    setDeleteImpactLoading,
  ] = useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("updated");

  const [metrics, setMetrics] =
    useState<
      Record<number, ProjectMetrics>
    >({});

  const { showNotification } =
    useNotification();

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      if (projects.length === 0) {
        setMetrics({});
        return;
      }

      const entries =
        await Promise.all(
          projects.map(
            async (project) => {
              const result =
                await loadProjectMetrics(
                  project,
                );

              return [
                project.id,
                result,
              ] as const;
            },
          ),
        );

      if (!cancelled) {
        setMetrics(
          Object.fromEntries(entries),
        );
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [projects]);

  const availableStatuses =
    useMemo(() => {
      return Array.from(
        new Set(
          projects.map(
            (project) =>
              project.status,
          ),
        ),
      );
    }, [projects]);

  const filteredProjects =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const result =
        projects.filter(
          (project) => {
            const matchesSearch =
              !normalizedSearch ||
              project.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              project.project_code
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              (
                project.description ??
                ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const matchesStatus =
              statusFilter === "All" ||
              project.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          if (
            sortOption === "name"
          ) {
            return a.name.localeCompare(
              b.name,
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
      projects,
      search,
      statusFilter,
      sortOption,
    ]);

  const totalProjects =
    projects.length;

  const activeProjects =
    projects.filter(
      (project) =>
        project.status === "Active",
    ).length;

  const automationEnabled =
    Object.values(metrics).filter(
      (item) =>
        item.automationConnected,
    ).length;

  const projectsWithQa =
    Object.values(metrics).filter(
      (item) =>
        item.qaProgress !== null,
    );

  const overallQaHealth =
    projectsWithQa.length > 0
      ? Math.round(
          projectsWithQa.reduce(
            (sum, item) =>
              sum +
              (item.qaProgress ?? 0),
            0,
          ) /
            projectsWithQa.length,
        )
      : null;

  async function handleEdit(
    project: Project,
  ) {
    setSelectedProject(project);
    setExistingBrdFileName(
      undefined,
    );
    setOpenDialog(true);

    try {
      const documents =
        await documentService.getProjectDocuments(
          project.id,
        );

      if (documents.length > 0) {
        setExistingBrdFileName(
          documents[0].file_name,
        );
      }
    } catch (error) {
      console.error(
        "Failed to load project documents:",
        error,
      );
    }
  }

  function handleDocuments(
    project: Project,
  ) {
    setBrdProject(project);
    setOpenBrdDialog(true);
  }

  function handleCloseBrdDialog() {
    setOpenBrdDialog(false);
    setBrdProject(null);
  }

  function handleCloseDialog() {
    setSelectedProject(null);
    setExistingBrdFileName(
      undefined,
    );
    setOpenDialog(false);
  }

  async function handleDelete(
    project: Project,
  ) {
    setProjectToDelete(project);
    setDeleteImpact(null);
    setConfirmOpen(true);
    setDeleteImpactLoading(true);

    try {
      const impact =
        await projectService.getDeleteImpact(
          project.id,
        );

      setDeleteImpact(impact);
    } catch (error) {
      console.error(
        "Failed to load delete impact:",
        error,
      );

      showNotification(
        "Failed to load project deletion details.",
        "error",
      );

      setConfirmOpen(false);
      setProjectToDelete(null);
    } finally {
      setDeleteImpactLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (
      !projectToDelete ||
      deleteLoading
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      await projectService.deleteProject(
        projectToDelete.id,
      );

      await refreshProjects();

      showNotification(
        "Project deleted successfully.",
        "success",
      );

      setConfirmOpen(false);
      setProjectToDelete(null);
      setDeleteImpact(null);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete project.",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCancelDelete() {
    if (deleteLoading) {
      return;
    }

    setConfirmOpen(false);
    setProjectToDelete(null);
    setDeleteImpact(null);
  }

  async function handleSaveProject(
    data: {
      name: string;
      description: string;
      status: string;
      version: string | null;
      start_date: string | null;
      end_date: string | null;
      brdFile: File | null;
    },
  ) {
    try {
      let savedProject: Project;

      if (selectedProject) {
        savedProject =
          await projectService.updateProject(
            selectedProject.id,
            {
              name: data.name,
              description:
                data.description,
              status: data.status,
              version: data.version,
              start_date:
                data.start_date,
              end_date:
                data.end_date,
            },
          );

        showNotification(
          "Project updated successfully.",
          "success",
        );
      } else {
        savedProject =
          await projectService.createProject(
            {
              name: data.name,
              description:
                data.description,
              status: data.status,
              version: data.version,
              start_date:
                data.start_date,
              end_date:
                data.end_date,
            },
          );

        showNotification(
          "Project created successfully.",
          "success",
        );
      }

      if (data.brdFile) {
        await documentService.uploadDocument(
          savedProject.id,
          data.brdFile.name,
          data.brdFile,
        );

        showNotification(
          "BRD document uploaded successfully.",
          "success",
        );
      }

      await refreshProjects();

      setSelectedProject(null);
      setExistingBrdFileName(
        undefined,
      );
      setOpenDialog(false);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save project.",
        "error",
      );
    }
  }

  function handleOpenWorkspace() {
    if (!workspaceSelectedProject) {
      showNotification(
        "Please select a project to open its workspace.",
        "warning",
      );
      return;
    }

    navigate(
      `/projects/${workspaceSelectedProject.id}`,
    );
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

  return (
    <>
      <PageHeader
        title="Projects"
        actionLabel="Create Project"
        onAction={() => {
          setSelectedProject(null);
          setExistingBrdFileName(
            undefined,
          );
          setOpenDialog(true);
        }}
        secondaryActionLabel="Open Workspace"
        onSecondaryAction={
          handleOpenWorkspace
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
          Manage your QA projects and
          track quality at a glance.
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
            icon={<FolderOutlinedIcon />}
            value={totalProjects}
            label="Total Projects"
          />

          <MetricCard
            icon={<CheckIcon />}
            value={activeProjects}
            label="Active Projects"
          />

          <MetricCard
            icon={<LinkOutlinedIcon />}
            value={automationEnabled}
            label="Automation Enabled"
          />

          <MetricCard
            icon={<TrendingUpIcon />}
            value={
              overallQaHealth !==
              null
                ? `${overallQaHealth}%`
                : "—"
            }
            label="Overall QA Health"
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
            placeholder="Search projects..."
            size="small"
            sx={{
              width: 230,

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
              minWidth: 120,
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
            <MenuItem value="updated">
              Sort by: Updated
            </MenuItem>

            <MenuItem value="name">
              Sort by: Name
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
            {filteredProjects.length}{" "}
            of {projects.length} projects
          </Typography>
        </Box>

        <ProjectTable
          projects={filteredProjects}
          metrics={metrics}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDocuments={handleDocuments}
        />
      </PageHeader>

      <ProjectDialog
        title={
          selectedProject
            ? "Edit Project"
            : "New Project"
        }
        open={openDialog}
        project={
          selectedProject ??
          undefined
        }
        existingBrdFileName={
          existingBrdFileName
        }
        onClose={handleCloseDialog}
        onSave={handleSaveProject}
      />

      <BRDDocumentDialog
        open={openBrdDialog}
        project={brdProject}
        onClose={
          handleCloseBrdDialog
        }
      />

      <DeleteProjectDialog
        open={confirmOpen}
        project={projectToDelete}
        impact={deleteImpact}
        loading={
          deleteImpactLoading
        }
        deleting={deleteLoading}
        onCancel={
          handleCancelDelete
        }
        onConfirm={
          handleConfirmDelete
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
        backgroundColor:
          "#ffffff",
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
          backgroundColor:
            "#eef6ff",
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

function DeleteProjectDialog({
  open,
  project,
  impact,
  loading,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  project: Project | null;
  impact: ProjectDeleteImpact | null;
  loading: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const counts = impact?.counts;

  return (
    <Dialog
      open={open}
      onClose={
        deleting
          ? undefined
          : onCancel
      }
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1,
          fontSize: "1.05rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        Delete Project
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          py: 1.5,
        }}
      >
        {project && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border:
                "1px solid #e4e7ec",
              borderRadius: "9px",
              backgroundColor:
                "#f8fafc",
            }}
          >
            <Typography
              sx={{
                fontSize:
                  "0.88rem",
                fontWeight: 700,
                color:
                  "#101828",
              }}
            >
              {project.project_code}
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize:
                  "0.76rem",
                color:
                  "#667085",
              }}
            >
              {project.name}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            <CircularProgress
              size={28}
            />
          </Box>
        ) : impact ? (
          <>
            <Typography
              sx={{
                mb: 1.5,
                fontSize:
                  "0.78rem",
                lineHeight:
                  1.55,
                color:
                  "#475467",
              }}
            >
              This project and
              all associated QA
              data will be
              permanently
              removed from
              QABook.
            </Typography>

            <Typography
              sx={{
                mb: 0.8,
                fontSize:
                  "0.7rem",
                fontWeight: 750,
                letterSpacing:
                  "0.06em",
                color:
                  "#667085",
              }}
            >
              PROJECT DATA
            </Typography>

            <Box
              sx={{
                border:
                  "1px solid #e4e7ec",
                borderRadius:
                  "9px",
                overflow:
                  "hidden",
              }}
            >
              <DeleteImpactRow
                label="Requirements"
                value={
                  counts?.requirements ??
                  0
                }
              />

              <DeleteImpactRow
                label="Test Scenarios"
                value={
                  counts?.test_scenarios ??
                  0
                }
              />

              <DeleteImpactRow
                label="Test Cases"
                value={
                  counts?.test_cases ??
                  0
                }
              />

              <DeleteImpactRow
                label="Test Suites"
                value={
                  counts?.test_suites ??
                  0
                }
              />

              <DeleteImpactRow
                label="Test Runs"
                value={
                  counts?.test_runs ??
                  0
                }
              />

              <DeleteImpactRow
                label="Test Executions"
                value={
                  counts?.test_executions ??
                  0
                }
              />

              <DeleteImpactRow
                label="Bugs & Retests"
                value={
                  counts?.bugs ??
                  0
                }
              />

              <DeleteImpactRow
                label="Documents"
                value={
                  counts?.documents ??
                  0
                }
                last
              />
            </Box>

            {impact.automation_enabled && (
              <Box sx={{ mt: 1.75 }}>
                <Typography
                  sx={{
                    mb: 0.8,
                    fontSize:
                      "0.7rem",
                    fontWeight: 750,
                    letterSpacing:
                      "0.06em",
                    color:
                      "#667085",
                  }}
                >
                  AUTOMATION
                </Typography>

                <Box
                  sx={{
                    p: 1.5,
                    border:
                      "1px solid #f1d48a",
                    borderRadius:
                      "9px",
                    backgroundColor:
                      "#fffbeb",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize:
                        "0.78rem",
                      fontWeight: 700,
                      color:
                        "#92400e",
                    }}
                  >
                    Automation
                    configuration
                    will be removed
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      fontSize:
                        "0.72rem",
                      lineHeight:
                        1.5,
                      color:
                        "#78350f",
                    }}
                  >
                    {
                      impact
                        .automation
                        .mapped_test_cases
                    }{" "}
                    mapped test
                    case
                    {impact
                      .automation
                      .mapped_test_cases ===
                    1
                      ? ""
                      : "s"}
                    {impact
                      .automation
                      .github_connected
                      ? " and the GitHub connection"
                      : ""}{" "}
                    will be
                    removed from
                    QABook.
                  </Typography>

                  <Divider
                    sx={{
                      my: 1.25,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize:
                        "0.72rem",
                      fontWeight: 700,
                      color:
                        "#166534",
                    }}
                  >
                    GitHub
                    repository will
                    NOT be deleted.
                  </Typography>
                </Box>
              </Box>
            )}

            <Box
              sx={{
                mt: 1.75,
                p: 1.25,
                borderRadius: "8px",
                backgroundColor:
                  "#fef2f2",
              }}
            >
              <Typography
                sx={{
                  fontSize:
                    "0.73rem",
                  lineHeight:
                    1.5,
                  color:
                    "#991b1b",
                }}
              >
                This action
                cannot be undone.
                All QABook
                project data
                listed above will
                be permanently
                deleted.
              </Typography>
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
          borderTop:
            "1px solid #f2f4f7",
        }}
      >
        <Button
          onClick={onCancel}
          disabled={deleting}
          sx={{
            minWidth: 78,
            height: 34,
            borderRadius: "8px",
            fontSize:
              "0.76rem",
            fontWeight: 650,
            textTransform:
              "none",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={
            loading ||
            deleting ||
            !impact
          }
          sx={{
            minWidth: 125,
            height: 34,
            borderRadius: "8px",
            fontSize:
              "0.76rem",
            fontWeight: 650,
            textTransform:
              "none",
            backgroundColor:
              "#dc2626",

            "&:hover": {
              backgroundColor:
                "#b91c1c",
            },
          }}
        >
          {deleting
            ? "Deleting..."
            : "Delete Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteImpactRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: number;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        px: 1.5,
        py: 0.8,
        borderBottom: last
          ? "none"
          : "1px solid #f2f4f7",
      }}
    >
      <Typography
        sx={{
          fontSize:
            "0.73rem",
          color:
            "#475467",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize:
            "0.73rem",
          fontWeight: 700,
          color:
            value > 0
              ? "#101828"
              : "#98a2b3",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}