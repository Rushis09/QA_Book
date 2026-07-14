
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

import { testRunService } from "../../services/testRunService";
import { testSuiteService } from "../../services/testSuiteService";

import type { TestRun } from "../../types/testRun";
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
  
  const navigate = useNavigate();

  async function loadData() {
    try {
      setLoading(true);

      const [
        runData,
        suiteData,
      ] = await Promise.all([
        testRunService.getTestRuns(),
        testSuiteService.getTestSuites(),
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
  }, []);

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

  function handleExecute(
    testRun: TestRun,
  ) {
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
    console.log("Submitting Test Run:", data);
    
    if (selectedTestRun) {
      await testRunService.updateTestRun(
        selectedTestRun.id,
        data,
      );

      showNotification(
        "Test run updated successfully.",
        "success",
      );
    } else {
      await testRunService.createTestRun(
        data,
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
          onViewDetails={handleViewDetails}
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