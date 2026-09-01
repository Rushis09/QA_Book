import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

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

import { useNavigate } from "react-router-dom";

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

  const { showNotification } =
    useNotification();

  const { selectedProject } =
    useWorkspace();

  const navigate = useNavigate();

  async function loadData() {
    if (!selectedProject) {
      setTestRuns([]);
      setTestSuites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [
        runData,
        suiteData,
      ] = await Promise.all([
        testRunService.getTestRuns(
          selectedProject.id,
        ),
        testSuiteService.getTestSuites(
          selectedProject.id,
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
  }, [selectedProject]);

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

  function canExecuteTestRun(
    testRun: TestRun,
  ) {
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
    if (!canExecuteTestRun(testRun)) {
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

  return (
    <>
      <PageHeader
        title="Test Runs"
        actionLabel="New Test Run"
        onAction={() =>
          setOpenDialog(true)
        }
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Test Runs:{" "}
          {testRuns.length}
        </Typography>

        <TestRunTable
          testRuns={testRuns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExecute={handleExecute}
          onViewDetails={
            handleViewDetails
          }
          canExecute={
            canExecuteTestRun
          }
        />
      </PageHeader>

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