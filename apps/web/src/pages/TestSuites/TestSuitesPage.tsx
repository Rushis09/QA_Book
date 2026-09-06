import { useEffect, useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestSuiteDialog from "../../components/testSuites/TestSuiteDialog";
import TestSuiteTable from "../../components/testSuites/TestSuiteTable";
import { useNavigate } from "react-router-dom";

import { useNotification } from "../../contexts/NotificationContext";

import { testSuiteService } from "../../services/testSuiteService";

import type { Project } from "../../types/project";
import type { TestSuite } from "../../types/testSuite";
import type { TestSuiteFormData } from "../../types/testSuiteForm";

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
        title="Test Suites"
        actionLabel="New Test Suite"
        onAction={() =>
          setOpenDialog(true)
        }
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Test Suites:{" "}
          {testSuites.length}
        </Typography>

        <TestSuiteTable
          testSuites={testSuites}
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
          selectedTestSuite ??
          undefined
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