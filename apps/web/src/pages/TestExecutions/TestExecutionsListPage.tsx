import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

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
      <CircularProgress />
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Typography
        variant="h4"
        sx={{ mb: 2 }}
      >
        Test Executions
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
      >
        Total Test Executions:{" "}
        {executions.length}
      </Typography>

      <TestExecutionTable
        executions={executions}
        onViewRun={handleViewRun}
        onCreateBug={handleCreateBug}
      />

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
    </>
  );
}