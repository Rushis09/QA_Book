import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import ProjectDialog from "../../components/projects/ProjectDialog";
import ProjectTable from "../../components/projects/ProjectTable";
import BRDDocumentDialog from "../../components/projects/BRDDocumentDialog";

import { useNotification } from "../../contexts/NotificationContext";

import { projectService } from "../../services/projectService";
import { documentService } from "../../services/documentService";
import { exportService } from "../../services/exportService";

import type { Project } from "../../types/project";

export default function ProjectsPage() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [existingBrdFileName, setExistingBrdFileName] =
    useState<string | undefined>(undefined);

  const [openBrdDialog, setOpenBrdDialog] =
    useState(false);

  const [brdProject, setBrdProject] =
    useState<Project | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const { showNotification } =
    useNotification();

  async function loadProjects() {
    try {
      setLoading(true);

      const data =
        await projectService.getProjects();

      setProjects(data);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load projects.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleEdit(
    project: Project,
  ) {
    setSelectedProject(project);
    setExistingBrdFileName(undefined);
    setOpenDialog(true);

    try {
      const documents =
        await documentService.getProjectDocuments(
          project.id,
        );

      if (documents.length > 0) {
        setExistingBrdFileName(
          documents[0].file_name,
        );
      }
    } catch (error) {
      console.error(
        "Failed to load project documents:",
        error,
      );
    }
  }

  function handleDocuments(
    project: Project,
  ) {
    setBrdProject(project);
    setOpenBrdDialog(true);
  }

  function handleCloseBrdDialog() {
    setOpenBrdDialog(false);
    setBrdProject(null);
  }

  function handleCloseDialog() {
    setSelectedProject(null);
    setExistingBrdFileName(undefined);
    setOpenDialog(false);
  }

  function handleDelete(
    project: Project,
  ) {
    setProjectToDelete(project);
    setConfirmOpen(true);
  }

  async function handleExport(
    project: Project,
    exportType: string,
  ) {
    try {
      switch (exportType) {
        case "project":
          await exportService.exportProject(
            project.id,
            project.project_code,
          );

          showNotification(
            "Project Summary exported successfully.",
            "success",
          );
          break;

        case "requirements":
          await exportService.exportRequirements(
            project.id,
            project.project_code,
          );

          showNotification(
            "Requirements exported successfully.",
            "success",
          );
          break;

        case "scenarios":
          await exportService.exportScenarios(
            project.id,
            project.project_code,
          );

          showNotification(
            "Test Scenarios exported successfully.",
            "success",
          );
          break;

        case "test-cases":
          await exportService.exportTestCases(
            project.id,
            project.project_code,
          );

          showNotification(
            "Test Cases exported successfully.",
            "success",
          );
          break;

        case "test-suites":
          await exportService.exportTestSuites(
            project.id,
            project.project_code,
          );

          showNotification(
            "Test Suites exported successfully.",
            "success",
          );
          break;

        case "test-runs":
          await exportService.exportTestRuns(
            project.id,
            project.project_code,
          );

          showNotification(
            "Test Runs exported successfully.",
            "success",
          );
          break;

        case "bugs":
          await exportService.exportBugs(
            project.id,
            project.project_code,
          );

          showNotification(
            "Bug Report exported successfully.",
            "success",
          );
          break;

        default:
          return;
      }
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to export.",
        "error",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) {
      return;
    }

    try {
      await projectService.deleteProject(
        projectToDelete.id,
      );

      await loadProjects();

      showNotification(
        "Project deleted successfully.",
        "success",
      );

      setConfirmOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete project.",
        "error",
      );

      setConfirmOpen(false);
      setProjectToDelete(null);
    }
  }

  function handleCancelDelete() {
    setConfirmOpen(false);
    setProjectToDelete(null);
  }

  async function handleSaveProject(data: {
    name: string;
    description: string;
    status: string;
    version: string | null;
    start_date: string | null;
    end_date: string | null;
    brdFile: File | null;
  }) {
    try {
      let savedProject: Project;

      if (selectedProject) {
        savedProject =
          await projectService.updateProject(
            selectedProject.id,
            {
              name: data.name,
              description: data.description,
              status: data.status,
              version: data.version,
              start_date: data.start_date,
              end_date: data.end_date,
            },
          );

        showNotification(
          "Project updated successfully.",
          "success",
        );
      } else {
        savedProject =
          await projectService.createProject({
            name: data.name,
            description: data.description,
            status: data.status,
            version: data.version,
            start_date: data.start_date,
            end_date: data.end_date,
          });

        showNotification(
          "Project created successfully.",
          "success",
        );
      }

      if (data.brdFile) {
        await documentService.uploadDocument(
          savedProject.id,
          data.brdFile.name,
          data.brdFile,
        );

        showNotification(
          "BRD document uploaded successfully.",
          "success",
        );
      }

      await loadProjects();

      setSelectedProject(null);
      setExistingBrdFileName(undefined);
      setOpenDialog(false);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save project.",
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
        title="Projects"
        actionLabel="New Project"
        onAction={() => {
          setSelectedProject(null);
          setExistingBrdFileName(undefined);
          setOpenDialog(true);
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Projects: {projects.length}
        </Typography>

        <ProjectTable
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
          onDocuments={handleDocuments}
        />
      </PageHeader>

      <ProjectDialog
        title={
          selectedProject
            ? "Edit Project"
            : "New Project"
        }
        open={openDialog}
        project={
          selectedProject ?? undefined
        }
        existingBrdFileName={
          existingBrdFileName
        }
        onClose={handleCloseDialog}
        onSave={handleSaveProject}
      />

      <BRDDocumentDialog
        open={openBrdDialog}
        project={brdProject}
        onClose={handleCloseBrdDialog}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Project"
        message={
          projectToDelete
            ? `Are you sure want to delete "${projectToDelete.name}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={
          handleConfirmDelete
        }
        onCancel={
          handleCancelDelete
        }
      />
    </>
  );
}