import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestCaseDialog from "../../components/testCases/TestCaseDialog";
import TestCaseTable from "../../components/testCases/TestCaseTable";

import { useNotification } from "../../contexts/NotificationContext";

import { testCaseService } from "../../services/testCaseService";
import { testScenarioService } from "../../services/testScenarioService";

import type { TestCase } from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";
import type { TestScenario } from "../../types/testScenario";

export default function TestCasesPage() {
  const [testCases, setTestCases] =
    useState<TestCase[]>([]);

  const [scenarios, setScenarios] =
    useState<TestScenario[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCase | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testCaseToDelete, setTestCaseToDelete] =
    useState<TestCase | null>(null);

  const { showNotification } =
    useNotification();

  async function loadData() {
    try {
      setLoading(true);

      const [
        testCaseData,
        scenarioData,
      ] = await Promise.all([
        testCaseService.getTestCases(),
        testScenarioService.getTestScenarios(),
      ]);

      setTestCases(testCaseData);
      setScenarios(scenarioData);

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load test cases.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(
    testCase: TestCase,
  ) {
    setSelectedTestCase(testCase);
    setOpenDialog(true);
  }

  function handleDelete(
    testCase: TestCase,
  ) {
    setTestCaseToDelete(testCase);
    setConfirmOpen(true);
  }

  async function handleSave(
    data: TestCaseFormData,
  ) {
    if (selectedTestCase) {
      await testCaseService.updateTestCase(
        selectedTestCase.id,
        data,
      );

      showNotification(
        "Test case updated successfully.",
        "success",
      );
    } else {
      await testCaseService.createTestCase(
        data,
      );

      showNotification(
        "Test case created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestCase(null);
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
        title="Test Cases"
        actionLabel="New Test Case"
        onAction={() =>
          setOpenDialog(true)
        }
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Test Cases:{" "}
          {testCases.length}
        </Typography>

        <TestCaseTable
          testCases={testCases}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PageHeader>

      <TestCaseDialog
        title={
          selectedTestCase
            ? "Edit Test Case"
            : "New Test Case"
        }
        open={openDialog}
        scenarios={scenarios}
        testCase={
          selectedTestCase ??
          undefined
        }
        onClose={() => {
          setSelectedTestCase(null);
          setOpenDialog(false);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Test Case"
        message={
          testCaseToDelete
            ? `Are you sure you want to delete "${testCaseToDelete.test_case_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!testCaseToDelete) {
            return;
          }

          try {
            await testCaseService.deleteTestCase(
              testCaseToDelete.id,
            );

            await loadData();

            showNotification(
              "Test case deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setTestCaseToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test case.",
              "error",
            );

            setConfirmOpen(false);
            setTestCaseToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestCaseToDelete(null);
        }}
      />
    </>
  );
}