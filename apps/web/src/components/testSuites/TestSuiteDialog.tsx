import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
          projects.length > 0
            ? projects[0].id
            : 0,
        ),
      );
    }

    setNameError(false);
  }, [testSuite, projects]);

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
        projects.length > 0
          ? projects[0].id
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
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
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

      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            !formData.name.trim()
          }
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}