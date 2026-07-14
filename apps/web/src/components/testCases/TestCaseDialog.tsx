import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import TestCaseForm from "./TestCaseForm";
import { useNotification } from "../../contexts/NotificationContext";

import type { TestScenario } from "../../types/testScenario";
import type { TestCase } from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";

interface TestCaseDialogProps {
  title: string;
  open: boolean;
  scenarios: TestScenario[];
  testCase?: TestCase;
  onClose: () => void;
  onSave: (
    data: TestCaseFormData,
  ) => Promise<void>;
}

const createDefaultFormData = (
  scenarioId: number,
): TestCaseFormData => ({
  scenario_id: scenarioId,
  component: "",
  priority: "Medium",
  title: "",
  description: "",
  preconditions: "",
  test_data: "",
  steps: "",
  expected_result: "",
});

export default function TestCaseDialog({
  title,
  open,
  scenarios,
  testCase,
  onClose,
  onSave,
}: TestCaseDialogProps) {
  const [formData, setFormData] =
    useState<TestCaseFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] =
    useState(false);

  const [titleError, setTitleError] =
    useState(false);

  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (testCase) {
      setFormData({
        scenario_id: testCase.scenario_id,
        component: testCase.component,
        priority: testCase.priority,
        title: testCase.title,
        description:
          testCase.description ?? "",
        preconditions:
          testCase.preconditions ?? "",
        test_data:
          testCase.test_data ?? "",
        steps: testCase.steps ?? "",
        expected_result:
          testCase.expected_result ?? "",
      });
    } else {
      setFormData(
        createDefaultFormData(
          scenarios.length > 0
            ? scenarios[0].id
            : 0,
        ),
      );
    }

    setTitleError(false);
  }, [testCase, scenarios]);

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
        "Failed to save test case.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        scenarios.length > 0
          ? scenarios[0].id
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
      maxWidth="md"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <TestCaseForm
          value={formData}
          scenarios={scenarios}
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