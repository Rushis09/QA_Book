import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";

import ExecutionCard from "../../components/testExecutions/ExecutionCard";
import ExecutionHeader from "../../components/testExecutions/ExecutionHeader";

import { testExecutionService } from "../../services/testExecutionService";
import { testRunService } from "../../services/testRunService";

import type { TestExecution } from "../../types/testExecution";
import type { TestRun } from "../../types/testRun";

export default function ExecutionPage() {
  const { runId } = useParams();
  const navigate = useNavigate();

  const { username } = useAuth();
  const { showNotification } =
    useNotification();

  const [executions, setExecutions] =
    useState<TestExecution[]>([]);

  const [testRun, setTestRun] =
    useState<TestRun | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [status, setStatus] =
    useState("Not Executed");

  const [actualResult, setActualResult] =
    useState("");

  const [comments, setComments] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadExecutionWorkspace() {
      if (!runId) {
        setError("Invalid Test Run.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const runData =
          await testRunService.getTestRun(
            Number(runId),
          );

        if (cancelled) {
          return;
        }

        const isAutomated =
          runData.execution_type
            .trim()
            .toLowerCase() ===
          "automated";

        if (isAutomated) {
          showNotification(
            "Automated Test Runs are executed through QABook automation.",
            "info",
          );

          navigate(
            "/test-runs",
            { replace: true },
          );

          return;
        }

        setTestRun(runData);

        const executionData =
          await testExecutionService.getRunExecutions(
            Number(runId),
          );

        if (cancelled) {
          return;
        }

        setExecutions(executionData);
        setCurrentIndex(0);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError(
            "Failed to load test executions.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExecutionWorkspace();

    return () => {
      cancelled = true;
    };
  }, [
    runId,
    navigate,
    showNotification,
  ]);

  const currentExecution =
    executions[currentIndex];

  useEffect(() => {
    if (!currentExecution) {
      return;
    }

    setStatus(
      currentExecution.status ??
        "Not Executed",
    );

    setActualResult(
      currentExecution.actual_result ??
        "",
    );

    setComments(
      currentExecution.comments ??
        "",
    );
  }, [currentExecution]);

  async function handleSave(): Promise<boolean> {
    if (!currentExecution) {
      return false;
    }

    try {
      setIsSaving(true);

      const updateRequest =
        testExecutionService.buildUpdateRequest(
          currentExecution,
          status,
          actualResult,
          comments,
        );
      
      if (status !== "Not Executed") {
        updateRequest.executed_at =
          new Date().toISOString();
      }

      if (
        status !== "Not Executed" &&
        !updateRequest.executed_by
      ) {
        updateRequest.executed_by =
          username;
      }

      const updatedExecution =
        await testExecutionService.updateExecution(
          currentExecution.id,
          updateRequest,
        );

      setExecutions((previous) =>
        previous.map((execution) =>
          execution.id ===
          updatedExecution.id
            ? updatedExecution
            : execution,
        ),
      );

      showNotification(
        "Execution saved successfully.",
        "success",
      );

      return true;
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save execution.",
        "error",
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndNext() {
    const success =
      await handleSave();

    if (!success) {
      return;
    }

    if (
      currentIndex <
      executions.length - 1
    ) {
      setCurrentIndex(
        (previous) =>
          previous + 1,
      );
    }
  }

  async function handleFinishRun() {
    const success =
      await handleSave();

    if (!success) {
      return;
    }

    try {
      await testRunService.finishTestRun(
        Number(runId),
      );

      showNotification(
        "Test Run completed successfully.",
        "success",
      );

      navigate("/test-runs");
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to finish test run.",
        "error",
      );
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
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
      <Box
        sx={{
          width: "100%",
          pb: 2,
        }}
      >
        <Button
          startIcon={
            <ArrowBackIcon
              sx={{ fontSize: 17 }}
            />
          }
          onClick={() =>
            navigate("/test-runs")
          }
          sx={{
            mb: 1,
            ml: -0.5,
            height: 32,
            px: 0.75,
            borderRadius: "7px",
            fontSize: "0.72rem",
            fontWeight: 650,
            textTransform: "none",
            color: "#475467",
          }}
        >
          Back to Test Runs
        </Button>

        <Alert
          severity="error"
          sx={{
            width: "100%",
            borderRadius: "9px",
            fontSize: "0.74rem",
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (executions.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          pb: 2,
        }}
      >
        <Button
          startIcon={
            <ArrowBackIcon
              sx={{ fontSize: 17 }}
            />
          }
          onClick={() =>
            navigate("/test-runs")
          }
          sx={{
            mb: 1,
            ml: -0.5,
            height: 32,
            px: 0.75,
            borderRadius: "7px",
            fontSize: "0.72rem",
            fontWeight: 650,
            textTransform: "none",
            color: "#475467",
          }}
        >
          Back to Test Runs
        </Button>

        <Box
          sx={{
            width: "100%",
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 750,
              color: "#101828",
              mb: 0.4,
            }}
          >
            Test Execution
          </Typography>

          {testRun && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "#667085",
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Run Code
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#101828",
                  }}
                >
                  {testRun.run_code}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "#667085",
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Run Name
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#101828",
                  }}
                >
                  {testRun.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "#667085",
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Execution Type
                </Typography>

                <Chip
                  label={
                    testRun.execution_type
                  }
                  size="small"
                  sx={{
                    mt: 0.2,
                    height: 21,
                    borderRadius: "6px",
                    fontSize: "0.6rem",
                    fontWeight: 650,
                  }}
                />
              </Box>
            </Box>
          )}

          <Alert
            severity="warning"
            sx={{
              width: "100%",
              borderRadius: "8px",
              fontSize: "0.72rem",
              py: 0.15,
            }}
          >
            This Test Run cannot be executed
            because its Test Suite has no test
            cases.
          </Alert>
        </Box>
      </Box>
    );
  }

  const isLastExecution =
    currentIndex ===
    executions.length - 1;

  const passedCount =
    executions.filter(
      (execution) =>
        execution.status === "Passed",
    ).length;

  const failedCount =
    executions.filter(
      (execution) =>
        execution.status === "Failed",
    ).length;

  const blockedCount =
    executions.filter(
      (execution) =>
        execution.status === "Blocked",
    ).length;

  const notExecutedCount =
    executions.filter(
      (execution) =>
        execution.status ===
        "Not Executed",
    ).length;

  const completedCount =
    passedCount +
    failedCount +
    blockedCount;

  const progressPercentage =
    Math.round(
      (completedCount /
        executions.length) *
        100,
    );

  const passPercentage =
    Math.round(
      (passedCount /
        executions.length) *
        100,
    );

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: 2,
      }}
    >
      {/* TOP NAVIGATION */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        <Button
          startIcon={
            <ArrowBackIcon
              sx={{ fontSize: 17 }}
            />
          }
          onClick={() =>
            navigate("/test-runs")
          }
          disabled={isSaving}
          sx={{
            px: 0,
            minWidth: 0,
            height: 32,
            fontSize: "0.72rem",
            fontWeight: 650,
            textTransform: "none",
            color: "#475467",
            "&:hover": {
              backgroundColor:
                "transparent",
              color: "#101828",
            },
          }}
        >
          Back to Test Runs
        </Button>

        <Chip
          icon={
            <PlayArrowIcon
              sx={{
                fontSize:
                  "14px !important",
              }}
            />
          }
          label="Execution Workspace"
          size="small"
          sx={{
            height: 25,
            borderRadius: "7px",
            backgroundColor:
              "#eff6ff",
            color: "#175cd3",
            border:
              "1px solid #d1e9ff",
            fontSize: "0.62rem",
            fontWeight: 700,
            "& .MuiChip-icon": {
              color: "#175cd3",
            },
          }}
        />
      </Box>

      {/* PAGE TITLE */}
      <Box
        sx={{
          width: "100%",
          mb: 1.1,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.3rem",
            lineHeight: 1.2,
            fontWeight: 780,
            letterSpacing:
              "-0.035em",
            color: "#101828",
          }}
        >
          Test Execution
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            fontSize: "0.7rem",
            color: "#667085",
          }}
        >
          Execute test cases and record
          results for this test run.
        </Typography>
      </Box>

      {/* TEST RUN HEADER */}
      {testRun && (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            mb: 1.25,
          }}
        >
          <ExecutionHeader
            runCode={
              testRun.run_code
            }
            runName={testRun.name}
            suiteName={`${testRun.suite.suite_code} — ${testRun.suite.name}`}
            executionType={
              testRun.execution_type
            }
            tester={testRun.tester}
            environment={
              testRun.environment
            }
            buildVersion={
              testRun.build_version
            }
            status={testRun.status}
          />
        </Box>
      )}

      {/* EXECUTION PROGRESS */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          border:
            "1px solid #e4e7ec",
          borderRadius: "9px",
          backgroundColor: "#fff",
          px: 1.35,
          py: 1.05,
          mb: 1.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 1,
            mb: 0.65,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 750,
                color: "#344054",
              }}
            >
              Execution Progress
            </Typography>

            <Chip
              label={`${currentIndex + 1} / ${executions.length}`}
              size="small"
              sx={{
                height: 20,
                borderRadius: "6px",
                backgroundColor:
                  "#f2f4f7",
                color: "#475467",
                fontSize: "0.6rem",
                fontWeight: 700,
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: "0.65rem",
              color: "#667085",
              fontWeight: 650,
            }}
          >
            {progressPercentage}% completed
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            height: 5,
            borderRadius: "999px",
            backgroundColor:
              "#eaecf0",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${progressPercentage}%`,
              height: "100%",
              borderRadius: "999px",
              backgroundColor:
                "#2e90fa",
              transition:
                "width 180ms ease",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.15,
            mt: 0.75,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#667085",
            }}
          >
            Passed{" "}
            <strong>
              {passedCount}
            </strong>
          </Typography>

          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#667085",
            }}
          >
            Failed{" "}
            <strong>
              {failedCount}
            </strong>
          </Typography>

          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#667085",
            }}
          >
            Blocked{" "}
            <strong>
              {blockedCount}
            </strong>
          </Typography>

          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#667085",
            }}
          >
            Not Executed{" "}
            <strong>
              {notExecutedCount}
            </strong>
          </Typography>

          <Typography
            sx={{
              fontSize: "0.61rem",
              color: "#667085",
            }}
          >
            Pass Rate{" "}
            <strong>
              {passPercentage}%
            </strong>
          </Typography>
        </Box>
      </Box>

      {/* CURRENT TEST EXECUTION */}
      {currentExecution && (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            mb: 1.15,
          }}
        >
          <ExecutionCard
            execution={
              currentExecution
            }
            status={status}
            actualResult={
              actualResult
            }
            comments={comments}
            onStatusChange={
              setStatus
            }
            onActualResultChange={
              setActualResult
            }
            onCommentsChange={
              setComments
            }
          />
        </Box>
      )}

      {/* EXECUTION ACTION BAR */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          position: "sticky",
          bottom: 10,
          zIndex: 5,
          p: 0.8,
          border:
            "1px solid #e4e7ec",
          borderRadius: "9px",
          backgroundColor:
            "rgba(255,255,255,0.96)",
          boxShadow:
            "0 5px 18px rgba(16,24,40,0.09)",
          backdropFilter:
            "blur(8px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={
              currentIndex === 0 ||
              isSaving
            }
            onClick={() =>
              setCurrentIndex(
                (previous) =>
                  previous - 1,
              )
            }
            sx={{
              minWidth: 82,
              height: 32,
              borderRadius: "7px",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform:
                "none",
            }}
          >
            Previous
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.65,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <SaveOutlinedIcon
                  sx={{
                    fontSize:
                      "15px !important",
                  }}
                />
              }
              onClick={handleSave}
              disabled={isSaving}
              sx={{
                height: 32,
                px: 1.25,
                borderRadius: "7px",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform:
                  "none",
              }}
            >
              {isSaving
                ? "Saving..."
                : "Save"}
            </Button>

            {isLastExecution ? (
              <Button
                variant="contained"
                size="small"
                startIcon={
                  <CheckCircleIcon
                    sx={{
                      fontSize:
                        "15px !important",
                    }}
                  />
                }
                onClick={
                  handleFinishRun
                }
                disabled={isSaving}
                sx={{
                  height: 32,
                  px: 1.3,
                  borderRadius: "7px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform:
                    "none",
                  boxShadow: "none",
                }}
              >
                Finish Run
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                endIcon={
                  <NavigateNextIcon
                    sx={{
                      fontSize:
                        "16px !important",
                    }}
                  />
                }
                onClick={
                  handleSaveAndNext
                }
                disabled={isSaving}
                sx={{
                  height: 32,
                  px: 1.3,
                  borderRadius: "7px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform:
                    "none",
                  boxShadow: "none",
                }}
              >
                Save & Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}