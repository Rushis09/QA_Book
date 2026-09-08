import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";

import TestSuiteForm from "./TestSuiteForm";
import { useNotification } from "../../contexts/NotificationContext";

import type { Project } from "../../types/project";
import type { TestSuite } from "../../types/testSuite";
import type { TestSuiteFormData } from "../../types/testSuiteForm";

interface TestSuiteDialogProps {
  title: string;
  open: boolean;
  projects: Project[];
  selectedProject: Project | null;
  testSuite?: TestSuite;
  onClose: () => void;
  onSave: (
    data: TestSuiteFormData,
  ) => Promise<void>;
}

const createDefaultFormData = (
  projectId: number,
): TestSuiteFormData => ({
  project_id: projectId,
  name: "",
  description: "",
  status: "Active",
});

export default function TestSuiteDialog({
  title,
  open,
  projects,
  selectedProject,
  testSuite,
  onClose,
  onSave,
}: TestSuiteDialogProps) {
  const [formData, setFormData] =
    useState<TestSuiteFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] =
    useState(false);

  const [nameError, setNameError] =
    useState(false);

  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (testSuite) {
      setFormData({
        project_id: testSuite.project_id,
        name: testSuite.name,
        description:
          testSuite.description ?? "",
        status: testSuite.status,
      });
    } else {
      setFormData(
        createDefaultFormData(
          selectedProject
            ? selectedProject.id
            : 0,
        ),
      );
    }

    setNameError(false);
  }, [testSuite, selectedProject]);

  async function handleSave() {
    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }

    try {
      setSaving(true);

      await onSave(formData);

      handleCancel();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save test suite.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        selectedProject
          ? selectedProject.id
          : 0,
      ),
    );

    setNameError(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 20px 45px rgba(16, 24, 40, 0.18)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.5,
          pt: 2.25,
          pb: 1.25,
          fontSize: "1.05rem",
          fontWeight: 750,
          color: "#101828",
          lineHeight: 1.3,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          px: 2.5,
          pt: 0.5,
          pb: 2,
        }}
      >
        <TestSuiteForm
          value={formData}
          projects={projects}
          error={nameError}
          onChange={(value) => {
            setFormData(value);

            if (value.name.trim()) {
              setNameError(false);
            }
          }}
        />
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          gap: 0.75,
          backgroundColor: "#fcfcfd",
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={saving}
          sx={{
            minWidth: 72,
            height: 34,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 650,
            color: "#475467",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            !formData.name.trim()
          }
          sx={{
            minWidth: 78,
            height: 34,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 650,
            textTransform: "none",
            boxShadow:
              "0 1px 2px rgba(16, 24, 40, 0.08)",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}