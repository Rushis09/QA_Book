import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useNotification } from "../../contexts/NotificationContext";
import ExecutionCard from "../../components/testExecutions/ExecutionCard";

import { testExecutionService } from "../../services/testExecutionService";
import { testRunService } from "../../services/testRunService";

import type { TestExecution } from "../../types/testExecution";
import type { TestRun } from "../../types/testRun";

export default function ExecutionPage() {
  const { runId } = useParams();
  const navigate = useNavigate();

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
    async function loadExecutions() {
      try {
        setLoading(true);

        const [
          executionData,
          runData,
        ] = await Promise.all([
          testExecutionService.getRunExecutions(
            Number(runId),
          ),
          testRunService.getTestRun(
            Number(runId),
          ),
        ]);

        setExecutions(executionData);
        setTestRun(runData);

        setCurrentIndex(0);
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

    if (runId) {
      loadExecutions();
    }
  }, [runId]);

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

      const updatedExecution =
        await testExecutionService.updateExecution(
          currentExecution.id,
          testExecutionService.buildUpdateRequest(
            currentExecution,
            status,
            actualResult,
            comments,
          ),
        );

      setExecutions((prev) =>
        prev.map((execution) =>
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
        (prev) => prev + 1,
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
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
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

const passPercentage =
  executions.length === 0
    ? 0
    : Math.round(
        (passedCount /
          executions.length) *
          100,
      );

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
      >
        Test Execution
      </Typography>

    {testRun && (
      <>
        <Typography variant="subtitle1">
          <strong>Run Code:</strong>{" "}
          {testRun.run_code}
        </Typography>

        <Typography
          variant="subtitle1"
          gutterBottom
        >
          <strong>Run Name:</strong>{" "}
          {testRun.name}
        </Typography>

        <Typography
          variant="subtitle1"
          gutterBottom
        >
          <strong>Progress:</strong>{" "}
          {currentIndex + 1 } / {executions.length}
        </Typography>
      </>
    )}
    
      <Typography
        variant="subtitle1"
        gutterBottom
      >
         <strong>Status:</strong>{" "}
          {status}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
      >
        Passed: {passedCount} | Failed: {failedCount} |
        Blocked: {blockedCount} | Not Executed:{" "}
        {notExecutedCount}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
      >
        Pass Percentage: {passPercentage}%
      </Typography>

      {currentExecution && (
        <ExecutionCard
          execution={currentExecution}
          status={status}
          actualResult={actualResult}
          comments={comments}
          onStatusChange={setStatus}
          onActualResultChange={
            setActualResult
          }
          onCommentsChange={
            setComments
          }
        />
      )}

      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent:
            "space-between",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          disabled={
            currentIndex === 0 ||
            isSaving
          }
          onClick={() =>
            setCurrentIndex(
              (prev) => prev - 1,
            )
          }
        >
          Previous
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save"}
        </Button>

        {isLastExecution ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleFinishRun}
            disabled={isSaving}
          >
            Finish Run
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={
              handleSaveAndNext
            }
            disabled={isSaving}
          >
            Save & Next
          </Button>
        )}
      </Box>
    </>
  );
}