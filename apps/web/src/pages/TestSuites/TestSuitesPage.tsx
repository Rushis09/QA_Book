import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";

import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useNotification } from "../../contexts/NotificationContext";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestSuiteDialog from "../../components/testSuites/TestSuiteDialog";
import TestSuiteTable from "../../components/testSuites/TestSuiteTable";

import { testSuiteService } from "../../services/testSuiteService";

import type { Project } from "../../types/project";
import type { TestSuite } from "../../types/testSuite";
import type { TestSuiteFormData } from "../../types/testSuiteForm";

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Box
      sx={{
        flex: "1 1 220px",
        minWidth: 0,
        height: 70,
        px: 1.5,
        py: 1.1,
        border: "1px solid #e4e7ec",
        borderRadius: "10px",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 1.15,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "9px",
          backgroundColor: "#eff6ff",
          color: "#1570ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "1rem",
            lineHeight: 1.15,
            fontWeight: 750,
            color: "#101828",
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            fontSize: "0.66rem",
            lineHeight: 1.2,
            color: "#667085",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TestSuitesPage() {
  const [testSuites, setTestSuites] =
    useState<TestSuite[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedTestSuite, setSelectedTestSuite] =
    useState<TestSuite | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testSuiteToDelete, setTestSuiteToDelete] =
    useState<TestSuite | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [projectFilter, setProjectFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("updated");

  const { showNotification } =
    useNotification();

  const {
    selectedProject,
    isAllProjects,
    projects: workspaceProjects,
  } = useWorkspace();

  const navigate = useNavigate();

  async function loadData() {
    if (!selectedProject && !isAllProjects) {
      setTestSuites([]);
      setProjects(workspaceProjects);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const projectId =
        selectedProject?.id;

      const suiteData =
        await testSuiteService.getTestSuites(
          projectId,
        );

      setTestSuites(suiteData);
      setProjects(workspaceProjects);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load test suites.",
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
    workspaceProjects,
  ]);

  const availableProjects =
    useMemo(() => {
      const projectMap = new Map<
        number,
        Project
      >();

      testSuites.forEach((suite) => {
        if (suite.project) {
          projectMap.set(
            suite.project.id,
            {
              id: suite.project.id,
              project_code:
                suite.project.project_code,
              name: suite.project.name,
            } as Project,
          );
        }
      });

      return Array.from(
        projectMap.values(),
      ).sort((a, b) =>
        a.project_code.localeCompare(
          b.project_code,
        ),
      );
    }, [testSuites]);

  const filteredTestSuites =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      const result =
        testSuites.filter((suite) => {
          const matchesSearch =
            !searchText ||
            suite.suite_code
              .toLowerCase()
              .includes(searchText) ||
            suite.name
              .toLowerCase()
              .includes(searchText) ||
            (
              suite.description ?? ""
            )
              .toLowerCase()
              .includes(searchText) ||
            suite.project.project_code
              .toLowerCase()
              .includes(searchText) ||
            suite.project.name
              .toLowerCase()
              .includes(searchText);

          const matchesStatus =
            statusFilter === "all" ||
            suite.status === statusFilter;

          const matchesProject =
            projectFilter === "all" ||
            suite.project_id ===
              Number(projectFilter);

          return (
            matchesSearch &&
            matchesStatus &&
            matchesProject
          );
        });

      return [...result].sort(
        (a, b) => {
          switch (sortBy) {
            case "code":
              return a.suite_code.localeCompare(
                b.suite_code,
              );

            case "name":
              return a.name.localeCompare(
                b.name,
              );

            case "cases":
              return (
                b.test_cases.length -
                a.test_cases.length
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
      testSuites,
      search,
      statusFilter,
      projectFilter,
      sortBy,
    ]);

  const totalSuites =
    testSuites.length;

  const activeSuites =
    testSuites.filter(
      (suite) =>
        suite.status === "Active",
    ).length;

  const archivedSuites =
    testSuites.filter(
      (suite) =>
        suite.status === "Archived",
    ).length;

  const totalAssignedTestCases =
    testSuites.reduce(
      (total, suite) =>
        total + suite.test_cases.length,
      0,
    );

  function handleNewSuite() {
    setSelectedTestSuite(null);
    setOpenDialog(true);
  }

  function handleEdit(
    testSuite: TestSuite,
  ) {
    setSelectedTestSuite(testSuite);
    setOpenDialog(true);
  }

  function handleDelete(
    testSuite: TestSuite,
  ) {
    setTestSuiteToDelete(testSuite);
    setConfirmOpen(true);
  }

  function handleAssign(
    testSuite: TestSuite,
  ) {
    navigate(
      `/test-suites/${testSuite.id}/assign`,
    );
  }

  async function handleSave(
    data: TestSuiteFormData,
  ) {
    try {
      if (selectedTestSuite) {
        await testSuiteService.updateTestSuite(
          selectedTestSuite.id,
          data,
        );

        showNotification(
          "Test suite updated successfully.",
          "success",
        );
      } else {
        await testSuiteService.createTestSuite(
          data,
        );

        showNotification(
          "Test suite created successfully.",
          "success",
        );
      }

      await loadData();

      setSelectedTestSuite(null);
      setOpenDialog(false);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save test suite.",
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
        <CircularProgress size={26} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 2,
        }}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Test Suites"
        actionLabel="New Test Suite"
        onAction={handleNewSuite}
      >
        <Typography
          sx={{
            mb: 1.5,
            fontSize: "0.72rem",
            color: "#667085",
          }}
        >
          Organize reusable test cases into focused
          testing plans.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            flexWrap: "wrap",
            mb: 1.5,
          }}
        >
          <MetricCard
            icon={
              <LayersOutlinedIcon
                sx={{ fontSize: 19 }}
              />
            }
            value={totalSuites}
            label="Total Test Suites"
          />

          <MetricCard
            icon={
              <CheckCircleIcon
                sx={{ fontSize: 19 }}
              />
            }
            value={activeSuites}
            label="Active"
          />

          <MetricCard
            icon={
              <ArchiveOutlinedIcon
                sx={{ fontSize: 19 }}
              />
            }
            value={archivedSuites}
            label="Archived"
          />

          <MetricCard
            icon={
              <PlaylistAddCheckOutlinedIcon
                sx={{ fontSize: 19 }}
              />
            }
            value={totalAssignedTestCases}
            label="Test Cases in Suites"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
            mb: 1.25,
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search suites..."
            sx={{
              flex: "1 1 230px",
              maxWidth: 330,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.74rem",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        fontSize: 17,
                        color: "#98a2b3",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            sx={{
              width: 145,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.74rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.7rem",
              },
            }}
          >
            <MenuItem value="all">
              All Statuses
            </MenuItem>
            <MenuItem value="Active">
              Active
            </MenuItem>
            <MenuItem value="Archived">
              Archived
            </MenuItem>
          </TextField>

          {isAllProjects && (
            <TextField
              select
              size="small"
              label="Project"
              value={projectFilter}
              onChange={(event) =>
                setProjectFilter(
                  event.target.value,
                )
              }
              sx={{
                width: 180,
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  fontSize: "0.74rem",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.7rem",
                },
              }}
            >
              <MenuItem value="all">
                All Projects
              </MenuItem>

              {availableProjects.map(
                (project) => (
                  <MenuItem
                    key={project.id}
                    value={project.id}
                  >
                    {project.project_code} -{" "}
                    {project.name}
                  </MenuItem>
                ),
              )}
            </TextField>
          )}

          <TextField
            select
            size="small"
            label="Sort by"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
            sx={{
              width: 155,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: "8px",
                backgroundColor: "#fff",
                fontSize: "0.74rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.7rem",
              },
            }}
          >
            <MenuItem value="updated">
              Updated
            </MenuItem>
            <MenuItem value="code">
              Suite Code
            </MenuItem>
            <MenuItem value="name">
              Name
            </MenuItem>
            <MenuItem value="cases">
              Test Cases
            </MenuItem>
          </TextField>

          <Typography
            sx={{
              ml: "auto",
              fontSize: "0.68rem",
              color: "#667085",
              whiteSpace: "nowrap",
            }}
          >
            {filteredTestSuites.length} of{" "}
            {testSuites.length} suites
          </Typography>
        </Box>

        <TestSuiteTable
          testSuites={filteredTestSuites}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssign={handleAssign}
        />
      </PageHeader>

      <TestSuiteDialog
        title={
          selectedTestSuite
            ? "Edit Test Suite"
            : "New Test Suite"
        }
        open={openDialog}
        projects={projects}
        selectedProject={selectedProject}
        testSuite={
          selectedTestSuite ?? undefined
        }
        onClose={() => {
          setSelectedTestSuite(null);
          setOpenDialog(false);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Test Suite"
        message={
          testSuiteToDelete
            ? `Are you sure you want to delete "${testSuiteToDelete.suite_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!testSuiteToDelete) {
            return;
          }

          try {
            await testSuiteService.deleteTestSuite(
              testSuiteToDelete.id,
            );

            await loadData();

            showNotification(
              "Test suite deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setTestSuiteToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test suite.",
              "error",
            );

            setConfirmOpen(false);
            setTestSuiteToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestSuiteToDelete(null);
        }}
      />
    </>
  );
}