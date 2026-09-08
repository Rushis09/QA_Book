import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestRunDialog from "../../components/testRuns/TestRunDialog";
import TestRunTable from "../../components/testRuns/TestRunTable";

import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

import { testRunService } from "../../services/testRunService";
import { testSuiteService } from "../../services/testSuiteService";

import type {
  TestRun,
  TestRunRequest,
} from "../../types/testRun";
import type { TestRunFormData } from "../../types/testRunForm";
import type { TestSuite } from "../../types/testSuite";

export default function TestRunsPage() {
  const [testRuns, setTestRuns] =
    useState<TestRun[]>([]);

  const [testSuites, setTestSuites] =
    useState<TestSuite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedTestRun, setSelectedTestRun] =
    useState<TestRun | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testRunToDelete, setTestRunToDelete] =
    useState<TestRun | null>(null);

  const [search, setSearch] =
    useState("");

  const [suiteFilter, setSuiteFilter] =
    useState("");

  const [executionTypeFilter, setExecutionTypeFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

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
      setTestRuns([]);
      setTestSuites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const projectId =
        selectedProject?.id;

      const [
        runData,
        suiteData,
      ] = await Promise.all([
        testRunService.getTestRuns(
          projectId,
        ),
        testSuiteService.getTestSuites(
          projectId,
        ),
      ]);

      setTestRuns(runData);
      setTestSuites(suiteData);

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load test runs.",
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

  function handleEdit(
    testRun: TestRun,
  ) {
    setSelectedTestRun(testRun);
    setOpenDialog(true);
  }

  function handleDelete(
    testRun: TestRun,
  ) {
    setTestRunToDelete(testRun);
    setConfirmOpen(true);
  }

  /*
   * Manual execution is available only for
   * Manual Test Runs whose Test Suite contains
   * at least one Test Case.
   *
   * Automated Test Runs are executed through
   * the QABook automation/GitHub workflow and
   * must not open the manual execution workspace.
   */
  function canExecuteTestRun(
    testRun: TestRun,
  ) {
    if (
      testRun.execution_type
        .trim()
        .toLowerCase() !== "manual"
    ) {
      return false;
    }

    const suite = testSuites.find(
      (suite) =>
        suite.id === testRun.suite_id,
    );

    return (
      !!suite &&
      suite.test_cases.length > 0
    );
  }

  function handleExecute(
    testRun: TestRun,
  ) {
    if (
      testRun.execution_type
        .trim()
        .toLowerCase() !== "manual"
    ) {
      showNotification(
        "Automated Test Runs are executed through QABook automation.",
        "info",
      );

      return;
    }

    const suite = testSuites.find(
      (suite) =>
        suite.id === testRun.suite_id,
    );

    if (!suite || suite.test_cases.length === 0) {
      showNotification(
        "Cannot execute Test Run because the Test Suite has no test cases.",
        "warning",
      );

      return;
    }

    navigate(
      `/test-runs/${testRun.id}/execute`,
    );
  }

  function handleViewDetails(
    testRun: TestRun,
  ) {
    navigate(
      `/test-runs/${testRun.id}`,
    );
  }

  async function handleCopyToken(
    testRun: TestRun,
  ) {
    if (!testRun.automation_token) {
      showNotification(
        "Automation token is not available for this Test Run.",
        "warning",
      );

      return;
    }

    try {
      const command =
        `pytest --qabook-token "${testRun.automation_token}"`;

      await navigator.clipboard.writeText(
        command,
      );

      showNotification(
        `Automation command for ${testRun.run_code} copied successfully.`,
        "success",
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to copy automation command.",
        "error",
      );
    }
  }

  async function handleSave(
    data: TestRunFormData,
  ) {
    const requestData: TestRunRequest = {
      suite_id: data.suite_id,
      name: data.name,
      execution_type:
        data.execution_type,
      build_version:
        data.build_version,
      environment:
        data.environment,
      tester:
        data.tester,
      start_date:
        data.start_date || null,
      end_date:
        data.end_date || null,
      status: data.status,
    };

    console.log(
      "Submitting Test Run:",
      requestData,
    );

    if (selectedTestRun) {
      await testRunService.updateTestRun(
        selectedTestRun.id,
        requestData,
      );

      showNotification(
        "Test run updated successfully.",
        "success",
      );
    } else {
      await testRunService.createTestRun(
        requestData,
      );

      showNotification(
        "Test run created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestRun(null);
    setOpenDialog(false);
  }

  const executionTypes = useMemo(() => {
    return Array.from(
      new Set(
        testRuns
          .map(
            (testRun) =>
              testRun.execution_type,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [testRuns]);

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        testRuns
          .map(
            (testRun) =>
              testRun.status,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [testRuns]);

  const filteredTestRuns = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered =
      testRuns.filter((testRun) => {
        const matchesSearch =
          !normalizedSearch ||
          testRun.run_code
            .toLowerCase()
            .includes(normalizedSearch) ||
          testRun.name
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesSuite =
          !suiteFilter ||
          String(testRun.suite_id) ===
            suiteFilter;

        const matchesExecutionType =
          !executionTypeFilter ||
          testRun.execution_type ===
            executionTypeFilter;

        const matchesStatus =
          !statusFilter ||
          testRun.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesSuite &&
          matchesExecutionType &&
          matchesStatus
        );
      });

    return [...filtered].sort(
      (a, b) => {
        if (sortBy === "run_code") {
          return a.run_code.localeCompare(
            b.run_code,
          );
        }

        if (sortBy === "name") {
          return a.name.localeCompare(
            b.name,
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
    testRuns,
    search,
    suiteFilter,
    executionTypeFilter,
    statusFilter,
    sortBy,
  ]);

  const automatedCount = useMemo(
    () =>
      testRuns.filter(
        (testRun) =>
          testRun.execution_type
            .toLowerCase() ===
          "automated",
      ).length,
    [testRuns],
  );

  const manualCount =
    testRuns.length - automatedCount;

  const executableCount = useMemo(
    () =>
      testRuns.filter(
        canExecuteTestRun,
      ).length,
    [testRuns, testSuites],
  );

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
      <Box sx={{ p: 1 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Test Runs"
        actionLabel="New Test Run"
        onAction={() => {
          setSelectedTestRun(null);
          setOpenDialog(true);
        }}
      />

      {/* KPI CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <CardContent
            sx={{
              p: "14px !important",
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
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  backgroundColor:
                    "#eff6ff",
                  color: "#2563eb",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                {testRuns.length}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    color: "#667085",
                    fontWeight: 600,
                  }}
                >
                  Total Runs
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 750,
                    color: "#101828",
                  }}
                >
                  All test runs
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <CardContent
            sx={{
              p: "14px !important",
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
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  backgroundColor:
                    "#f4f3ff",
                  color: "#5925dc",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                AI
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    color: "#667085",
                    fontWeight: 600,
                  }}
                >
                  Automated
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 750,
                    color: "#101828",
                  }}
                >
                  {automatedCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <CardContent
            sx={{
              p: "14px !important",
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
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  backgroundColor:
                    "#f2f4f7",
                  color: "#475467",
                  fontSize: "1rem",
                  fontWeight: 800,
                }}
              >
                M
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    color: "#667085",
                    fontWeight: 600,
                  }}
                >
                  Manual
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 750,
                    color: "#101828",
                  }}
                >
                  {manualCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <CardContent
            sx={{
              p: "14px !important",
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
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  backgroundColor:
                    "#ecfdf3",
                  color: "#039855",
                  fontSize: "1rem",
                  fontWeight: 800,
                }}
              >
                ✓
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    color: "#667085",
                    fontWeight: 600,
                  }}
                >
                  Executable
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 750,
                    color: "#101828",
                  }}
                >
                  {executableCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* FILTER BAR */}
      <Box
        sx={{
          border:
            "1px solid #e4e7ec",
          borderRadius: "10px",
          backgroundColor: "#fff",
          p: 1.25,
          mb: 1.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search runs..."
            size="small"
            sx={{
              flex: "1 1 220px",
              minWidth: 180,
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: "8px",
                  height: 36,
                  fontSize:
                    "0.76rem",
                },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 155,
              flex: "0 1 155px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.75rem",
              }}
            >
              Suite
            </InputLabel>

            <Select
              value={suiteFilter}
              label="Suite"
              onChange={(event) =>
                setSuiteFilter(
                  event.target.value,
                )
              }
              sx={{
                height: 36,
                borderRadius: "8px",
                fontSize: "0.76rem",
              }}
            >
              <MenuItem
                value=""
                sx={{
                  fontSize: "0.76rem",
                }}
              >
                All Suites
              </MenuItem>

              {testSuites.map(
                (suite) => (
                  <MenuItem
                    key={suite.id}
                    value={String(
                      suite.id,
                    )}
                    sx={{
                      fontSize:
                        "0.76rem",
                    }}
                  >
                    {suite.suite_code} —{" "}
                    {suite.name}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 150,
              flex: "0 1 150px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.75rem",
              }}
            >
              Execution Type
            </InputLabel>

            <Select
              value={
                executionTypeFilter
              }
              label="Execution Type"
              onChange={(event) =>
                setExecutionTypeFilter(
                  event.target.value,
                )
              }
              sx={{
                height: 36,
                borderRadius: "8px",
                fontSize: "0.76rem",
              }}
            >
              <MenuItem
                value=""
                sx={{
                  fontSize:
                    "0.76rem",
                }}
              >
                All Types
              </MenuItem>

              {executionTypes.map(
                (type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{
                      fontSize:
                        "0.76rem",
                    }}
                  >
                    {type}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 135,
              flex: "0 1 135px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.75rem",
              }}
            >
              Status
            </InputLabel>

            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              sx={{
                height: 36,
                borderRadius: "8px",
                fontSize: "0.76rem",
              }}
            >
              <MenuItem
                value=""
                sx={{
                  fontSize:
                    "0.76rem",
                }}
              >
                All Statuses
              </MenuItem>

              {statuses.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                    sx={{
                      fontSize:
                        "0.76rem",
                    }}
                  >
                    {status}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 135,
              flex: "0 1 135px",
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.75rem",
              }}
            >
              Sort
            </InputLabel>

            <Select
              value={sortBy}
              label="Sort"
              onChange={(event) =>
                setSortBy(
                  event.target.value,
                )
              }
              sx={{
                height: 36,
                borderRadius: "8px",
                fontSize: "0.76rem",
              }}
            >
              <MenuItem
                value="updated"
                sx={{
                  fontSize:
                    "0.76rem",
                }}
              >
                Updated
              </MenuItem>

              <MenuItem
                value="run_code"
                sx={{
                  fontSize:
                    "0.76rem",
                }}
              >
                Run Code
              </MenuItem>

              <MenuItem
                value="name"
                sx={{
                  fontSize:
                    "0.76rem",
                }}
              >
                Name
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* RESULT SUMMARY */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          mb: 1,
          px: 0.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#344054",
            }}
          >
            Test Runs
          </Typography>

          <Chip
            label={`${filteredTestRuns.length} ${
              filteredTestRuns.length ===
              1
                ? "run"
                : "runs"
            }`}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.66rem",
              fontWeight: 700,
              backgroundColor:
                "#f2f4f7",
              color: "#475467",
            }}
          />
        </Box>

        {(search ||
          suiteFilter ||
          executionTypeFilter ||
          statusFilter) && (
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#667085",
            }}
          >
            Filters applied
          </Typography>
        )}
      </Box>

      {/* TABLE */}
      <TestRunTable
        testRuns={filteredTestRuns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExecute={handleExecute}
        onViewDetails={
          handleViewDetails
        }
        onCopyToken={
          handleCopyToken
        }
        canExecute={
          canExecuteTestRun
        }
      />

      {/* CREATE / EDIT DIALOG */}
      <TestRunDialog
        title={
          selectedTestRun
            ? "Edit Test Run"
            : "New Test Run"
        }
        open={openDialog}
        testSuites={testSuites}
        testRun={
          selectedTestRun ??
          undefined
        }
        onClose={() => {
          setSelectedTestRun(null);
          setOpenDialog(false);
        }}
        onSave={handleSave}
      />

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Test Run"
        message={
          testRunToDelete
            ? `Are you sure you want to delete "${testRunToDelete.run_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!testRunToDelete) {
            return;
          }

          try {
            await testRunService.deleteTestRun(
              testRunToDelete.id,
            );

            await loadData();

            showNotification(
              "Test run deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setTestRunToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test run.",
              "error",
            );

            setConfirmOpen(false);
            setTestRunToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestRunToDelete(null);
        }}
      />
    </>
 
);
}