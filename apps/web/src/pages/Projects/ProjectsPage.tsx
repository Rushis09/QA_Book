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
import { useNotification } from "../../contexts/NotificationContext";
import { projectService } from "../../services/projectService";
import type { Project } from "../../types/project";
import { exportService } from "../../services/exportService";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] =
    useState<Project | null>(null);

  const { showNotification } = useNotification();

  async function loadProjects() {
    try {
      setLoading(true);

      const data = await projectService.getProjects();

      setProjects(data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleEdit(project: Project) {
    setSelectedProject(project);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setSelectedProject(null);
    setOpenDialog(false);
  }

  function handleDelete(project: Project) {
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
  }) {
    try {
      if (selectedProject) {
        await projectService.updateProject(
          selectedProject.id,
          data,
        );
        showNotification(
          "Project updated successfully.",
          "success",
        );
      } else {
        await projectService.createProject(data);
        showNotification(
          "Project created successfully.",
          "success",
        );
      }

      await loadProjects();

      setSelectedProject(null);
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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <PageHeader
        title="Projects"
        actionLabel="New Project"
        onAction={() => setOpenDialog(true)}
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
        />
      </PageHeader>

      <ProjectDialog
        title={
          selectedProject
            ? "Edit Project"
            : "New Project"
        }
        open={openDialog}
        project={selectedProject ?? undefined}
        onClose={handleCloseDialog}
        onSave={handleSaveProject}
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
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
