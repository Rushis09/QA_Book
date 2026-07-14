import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";

import BugDialog from "../../components/bugs/BugDialog";
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

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [bugToDelete, setBugToDelete] =
    useState<Bug | null>(null);

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

        <BugTable
          bugs={bugs}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
    </>
  );
}