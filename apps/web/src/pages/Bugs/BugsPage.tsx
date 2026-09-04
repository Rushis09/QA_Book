import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";

import BugDialog from "../../components/bugs/BugDialog";
import BugRetestDialog from "../../components/bugs/BugRetestDialog";
import BugTable from "../../components/bugs/BugTable";

import { useNotification } from "../../contexts/NotificationContext";

import { bugService } from "../../services/bugService";
import { testExecutionService } from "../../services/testExecutionService";

import type { Bug } from "../../types/bug";
import type { BugFormData } from "../../types/bugForm";
import type { TestExecution } from "../../types/testExecution";

export default function BugsPage() {
  const [bugs, setBugs] =
    useState<Bug[]>([]);

  const [executions, setExecutions] =
    useState<TestExecution[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);

  const [selectedBug, setSelectedBug] =
    useState<Bug | null>(null);

  const [selectedBugIds, setSelectedBugIds] =
    useState<number[]>([]);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [bugToDelete, setBugToDelete] =
    useState<Bug | null>(null);

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] =
    useState(false);

  const [retestDialogOpen, setRetestDialogOpen] =
    useState(false);

  const [bugToRetest, setBugToRetest] =
    useState<Bug | null>(null);

  const [retestSaving, setRetestSaving] =
    useState(false);

  const { showNotification } =
    useNotification();

  async function loadData() {
    try {
      setLoading(true);

      const [
        bugData,
        executionData,
      ] = await Promise.all([
        bugService.getBugs(),
        testExecutionService.getExecutions(),
      ]);

      setBugs(bugData);
      setExecutions(executionData);

      setSelectedBugIds([]);

      setError("");
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load bugs.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleEdit(
    bug: Bug,
  ) {
    setSelectedBug(bug);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setSelectedBug(null);
    setOpenDialog(false);
  }

  function handleDelete(
    bug: Bug,
  ) {
    setBugToDelete(bug);
    setConfirmOpen(true);
  }

  function handleCancelDelete() {
    setConfirmOpen(false);
    setBugToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!bugToDelete) {
      return;
    }

    try {
      await bugService.deleteBug(
        bugToDelete.id,
      );

      await loadData();

      showNotification(
        "Bug deleted successfully.",
        "success",
      );

      handleCancelDelete();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete bug.",
        "error",
      );

      handleCancelDelete();
    }
  }

  function handleBulkDelete() {
    if (selectedBugIds.length === 0) {
      return;
    }

    setBulkDeleteConfirmOpen(true);
  }

  function handleCancelBulkDelete() {
    setBulkDeleteConfirmOpen(false);
  }

  async function handleConfirmBulkDelete() {
    if (selectedBugIds.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selectedBugIds.map((bugId) =>
          bugService.deleteBug(
            bugId,
          ),
        ),
      );

      await loadData();

      showNotification(
        `${selectedBugIds.length} bugs deleted successfully.`,
        "success",
      );

      handleCancelBulkDelete();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete selected bugs.",
        "error",
      );

      handleCancelBulkDelete();
    }
  }

  function handleRetest(
    bug: Bug,
  ) {
    setBugToRetest(bug);
    setRetestDialogOpen(true);
  }

  function handleCloseRetestDialog() {
    if (retestSaving) {
      return;
    }

    setRetestDialogOpen(false);
    setBugToRetest(null);
  }

  async function handleConfirmRetest(
    executionType:
      | "Manual"
      | "Automated",
  ) {
    if (!bugToRetest) {
      return;
    }

    try {
      setRetestSaving(true);

      const retest =
        await bugService.createRetest(
          bugToRetest.id,
          {
            execution_type:
              executionType,
          },
        );

      await loadData();

      setRetestDialogOpen(false);
      setBugToRetest(null);

      showNotification(
        `Retest ${retest.execution.test_run.run_code} created successfully.`,
        "success",
      );
    } catch (error) {
      console.error(error);

      const message =
        (
          error as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response?.data?.detail ||
        "Failed to create bug retest.";
      
      showNotification(
        message,
        "error",
      );
    } finally {
      setRetestSaving(false);
    }
  }

  async function handleSave(
    data: BugFormData,
  ) {
    try {
      if (selectedBug) {
        await bugService.updateBug(
          selectedBug.id,
          data,
        );

        showNotification(
          "Bug updated successfully.",
          "success",
        );
      } else {
        await bugService.createBug(
          data,
        );

        showNotification(
          "Bug created successfully.",
          "success",
        );
      }

      await loadData();

      handleCloseDialog();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save bug.",
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
        title="Bug Reports"
        actionLabel="New Bug"
        onAction={() =>
          setOpenDialog(true)
        }
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          Total Bugs: {bugs.length}
        </Typography>

        {selectedBugIds.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {selectedBugIds.length} selected

            <button
              type="button"
              onClick={handleBulkDelete}
              style={{
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Delete selected
            </button>
          </Typography>
        )}

        <BugTable
          bugs={bugs}
          selectedBugIds={selectedBugIds}
          onSelectionChange={
            setSelectedBugIds
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRetest={handleRetest}
        />
      </PageHeader>

      <BugDialog
        title={
          selectedBug
            ? "Edit Bug"
            : "New Bug"
        }
        open={openDialog}
        executions={executions}
        bug={
          selectedBug ??
          undefined
        }
        onClose={handleCloseDialog}
        onSave={handleSave}
      />

      <BugRetestDialog
        open={retestDialogOpen}
        bug={
          bugToRetest ??
          undefined
        }
        saving={retestSaving}
        onClose={
          handleCloseRetestDialog
        }
        onConfirm={
          handleConfirmRetest
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Bug"
        message={
          bugToDelete
            ? `Are you sure you want to delete "${bugToDelete.bug_code}"?`
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

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="Delete Selected Bugs"
        message={`Are you sure you want to delete ${selectedBugIds.length} selected bugs? This action cannot be undone.`}
        confirmText={`Delete ${selectedBugIds.length} Bugs`}
        cancelText="Cancel"
        onConfirm={
          handleConfirmBulkDelete
        }
        onCancel={
          handleCancelBulkDelete
        }
      />
    </>
  );
}