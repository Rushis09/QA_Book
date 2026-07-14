import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import TestScenarioForm from "./TestScenarioForm";
import { useNotification } from "../../contexts/NotificationContext";

import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";
import type { TestScenarioFormData } from "../../types/testScenarioForm";

interface TestScenarioDialogProps {
  title: string;
  open: boolean;
  requirements: Requirement[];
  testScenario?: TestScenario;
  onClose: () => void;
  onSave: (
    data: TestScenarioFormData,
  ) => Promise<void>;
}

const createDefaultFormData = (
  requirementId: number,
): TestScenarioFormData => ({
  requirement_id: requirementId,
  title: "",
  description: "",
});

export default function TestScenarioDialog({
  title,
  open,
  requirements,
  testScenario,
  onClose,
  onSave,
}: TestScenarioDialogProps) {
  const [formData, setFormData] =
    useState<TestScenarioFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] =
    useState(false);

  const [titleError, setTitleError] =
    useState(false);

  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (testScenario) {
      setFormData({
        requirement_id:
          testScenario.requirement_id,
        title: testScenario.title,
        description:
          testScenario.description ?? "",
      });
    } else {
      setFormData(
        createDefaultFormData(
          requirements.length > 0
            ? requirements[0].id
            : 0,
        ),
      );
    }

    setTitleError(false);
  }, [testScenario, requirements]);

  async function handleSave() {
    if (!formData.title.trim()) {
      setTitleError(true);
      return;
    }

    try {
      setSaving(true);

      await onSave(formData);

      handleCancel();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save test scenario.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        requirements.length > 0
          ? requirements[0].id
          : 0,
      ),
    );

    setTitleError(false);
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
        <TestScenarioForm
          value={formData}
          requirements={requirements}
          error={titleError}
          onChange={(value) => {
            setFormData(value);

            if (value.title.trim()) {
              setTitleError(false);
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
            !formData.title.trim()
          }
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}