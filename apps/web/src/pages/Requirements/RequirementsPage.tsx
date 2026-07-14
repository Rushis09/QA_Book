import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import RequirementDialog from "../../components/requirements/RequirementDialog";
import RequirementTable from "../../components/requirements/RequirementTable";
import { useNotification } from "../../contexts/NotificationContext";
import { projectService } from "../../services/projectService";
import { requirementService } from "../../services/requirementService";
import type { Project } from "../../types/project";
import type { RequirementFormData } from "../../types/requirementForm";
import type { Requirement } from "../../types/requirement";

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] =
    useState<Requirement | null>(null);

  const { showNotification } = useNotification();

  async function loadData() {
    try {
      setLoading(true);

      const [requirementsData, projectsData] =
        await Promise.all([
          requirementService.getRequirements(),
          projectService.getProjects(),
        ]);

      setRequirements(requirementsData);
      setProjects(projectsData);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load requirements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(requirement: Requirement) {
    setSelectedRequirement(requirement);
    setOpenDialog(true);
  }

  function handleDelete(requirement: Requirement) {
    setRequirementToDelete(requirement);
    setConfirmOpen(true);
  }

  async function handleSaveRequirement(
    data: RequirementFormData,
  ) {
    if (selectedRequirement) {
      await requirementService.updateRequirement(
        selectedRequirement.id,
        data,
      );

      showNotification(
        "Requirement updated successfully.",
        "success",
      );
    } else {
      await requirementService.createRequirement(
        data,
      );

      showNotification(
        "Requirement created successfully.",
        "success",
      );
    }

    await loadData();

    setSelectedRequirement(null);
    setOpenDialog(false);
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
        title="Requirements"
        actionLabel="New Requirement"
        onAction={() => setOpenDialog(true)}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Requirements: {requirements.length}
        </Typography>

        <RequirementTable
          requirements={requirements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </PageHeader>

      <RequirementDialog
        title={
          selectedRequirement
            ? "Edit Requirement"
            : "New Requirement"
        }
        open={openDialog}
        projects={projects}
        requirement={
          selectedRequirement ?? undefined
        }
        onClose={() => {
          setSelectedRequirement(null);
          setOpenDialog(false);
        }}
        onSave={handleSaveRequirement}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Requirement"
        message={
          requirementToDelete
            ? `Are you sure you want to delete "${requirementToDelete.requirement_code}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!requirementToDelete) {
            return;
          }

          try {
            await requirementService.deleteRequirement(
              requirementToDelete.id,
            );

            await loadData();

            showNotification(
              "Requirement deleted successfully.",
              "success",
            );

            setConfirmOpen(false);
            setRequirementToDelete(null);
          } catch (error) {
            console.error(error);

            showNotification(
              "Failed to delete requirement.",
              "error",
            );

            setConfirmOpen(false);
            setRequirementToDelete(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setRequirementToDelete(null);
        }}
      />
    </>
  );
}