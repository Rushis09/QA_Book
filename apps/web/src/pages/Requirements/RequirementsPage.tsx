import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import DataGridLayout from "../../components/common/DataGridLayout";

import RequirementDialog from "../../components/requirements/RequirementDialog";
import RequirementTable from "../../components/requirements/RequirementTable";
import { useNotification } from "../../contexts/NotificationContext";
import { requirementService } from "../../services/requirementService";

import type { RequirementFormData } from "../../types/requirementForm";
import type { Requirement } from "../../types/requirement";
import GenerateRequirementDialog from "../../components/requirements/GenerateRequirementDialog";
import { useWorkspace } from "../../contexts/WorkspaceContext";


export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] =
  useState(false);
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] =
    useState<Requirement | null>(null);

  const [
    bulkDeleteRequirements,
    setBulkDeleteRequirements,
  ] = useState<Requirement[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
  useState<number[]>([]);

  const { showNotification } = useNotification();

  const { selectedProject } = useWorkspace();

  async function loadData() {

    if (!selectedProject) {
      setRequirements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const requirementsData =
        await requirementService.getRequirements(
          selectedProject?.id
        );
      
      setRequirements(requirementsData);

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
  }, [selectedProject]);

  function handleEdit(requirement: Requirement) {
    setSelectedRequirement(requirement);
    setOpenDialog(true);
  }

  function handleDelete(requirement: Requirement) {
    setRequirementToDelete(requirement);
    setConfirmOpen(true);
  }

  function handleBulkDelete() {
    const selectedRequirements =
      requirements.filter((requirement) =>
        selectedRequirementIds.includes(
          requirement.id,
        ),
      );

    setBulkDeleteRequirements(
      selectedRequirements,
    );

    setConfirmOpen(true);
  }

  function clearSelection() {
    setSelectedRequirementIds([]);
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
        secondaryActionLabel="✨ Generate with AI"
        onSecondaryAction={() =>
          setOpenGenerateDialog(true)
        }

        selectionCount={selectedRequirementIds.length}

        selectionActions={
          selectedRequirementIds.length === 1
            ? [
                {
                  label: "Edit",
                  onClick: () => {
                    const requirement = requirements.find(
                      (r) =>
                        r.id ===
                        selectedRequirementIds[0],
                    );
                  
                    if (requirement) {
                      handleEdit(requirement);
                    }
                  },
                },
                {
                  label: "Delete",
                  color: "error",
                  onClick: () => {
                    const requirement = requirements.find(
                      (r) =>
                        r.id ===
                        selectedRequirementIds[0],
                    );
                  
                    if (requirement) {
                      handleDelete(requirement);
                    }
                  },
                },
                {
                  label: "Clear Selection",
                  variant: "outlined",
                  onClick: clearSelection,
                },
              ]
            : selectedRequirementIds.length > 1
              ? [
                  {
                    label: "Delete Selected",
                    color: "error",
                    onClick: handleBulkDelete,
                  },
                  {
                    label: "Clear Selection",
                    variant: "outlined",
                    onClick: clearSelection,
                  },
                ]
              : undefined
        }
        
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Requirements: {requirements.length}
        </Typography>
      <DataGridLayout>
        <RequirementTable
          requirements={requirements}
          selectedIds={selectedRequirementIds}
          onSelectionChange={setSelectedRequirementIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DataGridLayout>
      </PageHeader>
      <RequirementDialog
        title={
          selectedRequirement
            ? "Edit Requirement"
            : "New Requirement"
        }
        open={openDialog}
        requirement={
          selectedRequirement ?? undefined
        }
        onClose={() => {
          setSelectedRequirement(null);
          setOpenDialog(false);
        }}
        onSave={handleSaveRequirement}
      />

      <GenerateRequirementDialog
        open={openGenerateDialog}
        onClose={() =>
          setOpenGenerateDialog(false)
        }
         onGenerated={loadData}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={
          bulkDeleteRequirements.length > 0
            ? "Delete Requirements"
            : "Delete Requirement"
        }
        message={
          bulkDeleteRequirements.length > 0
            ? `Are you sure you want to delete ${bulkDeleteRequirements.length} requirements?`
            : requirementToDelete
              ? `Are you sure you want to delete "${requirementToDelete.requirement_code}"?`
              : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setRequirementToDelete(null);
          setBulkDeleteRequirements([]);
        }}
        onConfirm={async () => {
          try {
            if (bulkDeleteRequirements.length > 0) {
              await Promise.all(
                bulkDeleteRequirements.map(
                  (requirement) =>
                    requirementService.deleteRequirement(
                      requirement.id,
                    ),
                ),
              );
            
              showNotification(
                "Requirements deleted successfully.",
                "success",
              );
            
              clearSelection();
              setBulkDeleteRequirements([]);
            } else if (requirementToDelete) {
              await requirementService.deleteRequirement(
                requirementToDelete.id,
              );
            
              showNotification(
                "Requirement deleted successfully.",
                "success",
              );
            
              setRequirementToDelete(null);
            }
          
            await loadData();
          } catch (error) {
            console.error(error);
          
            showNotification(
              bulkDeleteRequirements.length > 0
                ? "Failed to delete requirements."
                : "Failed to delete requirement.",
              "error",
            );
          } finally {
            setConfirmOpen(false);
            setRequirementToDelete(null);
            setBulkDeleteRequirements([]);
          }
        }}
      />
    </>
  );
}