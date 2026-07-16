import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import TestScenarioDialog from "../../components/testScenarios/TestScenarioDialog";
import TestScenarioTable from "../../components/testScenarios/TestScenarioTable";
import { useNotification } from "../../contexts/NotificationContext";
import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";

import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";
import type { TestScenarioFormData } from "../../types/testScenarioForm";
import GenerateScenarioDialog from "../../components/testScenarios/GenerateScenarioDialog";
import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";


export default function TestScenariosPage() {
  const [testScenarios, setTestScenarios] =
    useState<TestScenario[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [openGenerateDialog, setOpenGenerateDialog] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedTestScenario, setSelectedTestScenario] =
    useState<TestScenario | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [testScenarioToDelete, setTestScenarioToDelete] =
    useState<TestScenario | null>(null);

  const { showNotification } =
    useNotification();

  async function loadData() {
    try {
      setLoading(true);

     const [
        testScenarioData,
        requirementData,
        projectData,
      ] = await Promise.all([
        testScenarioService.getTestScenarios(),
        requirementService.getRequirements(),
        projectService.getProjects(),
      ]);

      setTestScenarios(testScenarioData);
      setRequirements(requirementData);
      setProjects(projectData);

      setError("");
    } catch (error) {
      console.error(error);
      setError(
        "Failed to load test scenarios.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(
    testScenario: TestScenario,
  ) {
    setSelectedTestScenario(testScenario);
    setOpenDialog(true);
  }

  function handleDelete(
    testScenario: TestScenario,
  ) {
    setTestScenarioToDelete(testScenario);
    setConfirmOpen(true);
  }

  async function handleSave(
    data: TestScenarioFormData,
  ) {
    if (selectedTestScenario) {
      await testScenarioService.updateTestScenario(
        selectedTestScenario.id,
        data,
      );

      showNotification(
        "Test scenario updated successfully.",
        "success",
      );
    } else {
      await testScenarioService.createTestScenario(
        data,
      );

      showNotification(
        "Test scenario created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedTestScenario(null);
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
          title="Test Scenarios"
          actionLabel="New Test Scenario"
          onAction={() =>
            setOpenDialog(true)
          }
          secondaryActionLabel="✨ Generate with AI"
          onSecondaryAction={() =>
            setOpenGenerateDialog(true)
          }
        >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Test Scenarios:{" "}
          {testScenarios.length}
        </Typography>

        <TestScenarioTable
          testScenarios={testScenarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PageHeader>

      <TestScenarioDialog
        title={
          selectedTestScenario
            ? "Edit Test Scenario"
            : "New Test Scenario"
        }
        open={openDialog}
        requirements={requirements}
        testScenario={
          selectedTestScenario ??
          undefined
        }
        onClose={() => {
          setSelectedTestScenario(null);
          setOpenDialog(false);
        }}
        onSave={handleSave}
      />

      <GenerateScenarioDialog
        open={openGenerateDialog}
        projects={projects}
        requirements={requirements}
        onClose={() =>
          setOpenGenerateDialog(false)
        }
        onGenerated={loadData}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Test Scenario"
        message={
          testScenarioToDelete
            ? `Are you sure you want to delete "${testScenarioToDelete.title}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!testScenarioToDelete) {
            return;
          }

          try {
            await testScenarioService.deleteTestScenario(
              testScenarioToDelete.id,
            );

            await loadData();

            showNotification(
              "Test scenario deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setTestScenarioToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete test scenario.",
              "error",
            );

            setConfirmOpen(false);
            setTestScenarioToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTestScenarioToDelete(null);
        }}
      />
    </>
  );
}