import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import BugForm from "./BugForm";

import type { Bug } from "../../types/bug";
import type { BugFormData } from "../../types/bugForm";
import type { TestExecution } from "../../types/testExecution";

interface BugDialogProps {
  title: string;
  open: boolean;
  executions: TestExecution[];
  bug?: Bug;
  initialExecutionId?: number;
  onClose: () => void;
  onSave: (
    data: BugFormData,
  ) => Promise<void>;
}

const createDefaultFormData = (
  executionId: number,
  actualResult = "",
  stepsToReproduce = "",
): BugFormData => ({
  execution_id: executionId,

  title: "",
  description: "",

  severity: "Medium",
  priority: "Medium",
  status: "Open",
  resolution: null,

  assigned_to: "",
  reported_by: "",
  environment: "",

  steps_to_reproduce: stepsToReproduce,
  actual_result: actualResult,
});

export default function BugDialog({
  title,
  open,
  executions,
  bug,
  initialExecutionId,
  onClose,
  onSave,
}: BugDialogProps) {
  const [formData, setFormData] =
    useState<BugFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] =
    useState({
      execution: false,
      title: false,
    });

  const executionLocked =
    !bug &&
    initialExecutionId !== undefined;

  useEffect(() => {
    if (bug) {
      setFormData({
        execution_id: bug.execution_id,

        title: bug.title,
        description:
          bug.description ?? "",

        severity: bug.severity,
        priority: bug.priority,
        status: bug.status,
        resolution: bug.resolution,

        assigned_to:
          bug.assigned_to ?? "",

        reported_by:
          bug.reported_by ?? "",

        environment:
          bug.environment ?? "",

        steps_to_reproduce:
          bug.steps_to_reproduce ?? "",

        actual_result:
          bug.actual_result ?? "",
      });
    } else {
      const executionId =
        initialExecutionId ??
        (executions.length > 0
          ? executions[0].id
          : 0);

      const selectedExecution =
        executions.find(
          (execution) =>
            execution.id === executionId,
        );

      setFormData(
        createDefaultFormData(
          executionId,
          selectedExecution?.actual_result ??
            "",
          selectedExecution?.test_case.steps ??
            "",
        ),
      );
    }

    setErrors({
      execution: false,
      title: false,
    });
  }, [
    bug,
    executions,
    initialExecutionId,
  ]);

  async function handleSave() {
    const executionError =
      formData.execution_id === 0;

    const titleError =
      !formData.title.trim();

    if (
      executionError ||
      titleError
    ) {
      setErrors({
        execution: executionError,
        title: titleError,
      });

      return;
    }

    try {
      setSaving(true);

      await onSave(formData);

      handleCancel();
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        executions.length > 0
          ? executions[0].id
          : 0,
      ),
    );

    setErrors({
      execution: false,
      title: false,
    });

    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {title}
      </DialogTitle>

      <DialogContent>
        <BugForm
          value={formData}
          executions={executions}
          error={errors}
          executionLocked={
            executionLocked
          }
          onChange={(value) => {
            setFormData(value);

            setErrors({
              execution:
                value.execution_id ===
                0,
              title:
                !value.title.trim(),
            });
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleCancel}
        >
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
          {saving
            ? "Saving..."
            : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}