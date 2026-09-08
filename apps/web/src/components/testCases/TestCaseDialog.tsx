import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  selectedScenarioId: number;
  testCase?: TestCase;
  onClose: () => void;
  onSave: (data: TestCaseFormData) => Promise<void>;
}

const createDefaultFormData = (
  scenario: TestScenario | undefined,
): TestCaseFormData => ({
  scenario_id: scenario?.id ?? 0,
  module: scenario?.module ?? "",
  priority: "Medium",
  status: "Draft",
  automation_eligibility: "Eligible",
  automation_status: "Not Automated",
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
  selectedScenarioId,
  testCase,
  onClose,
  onSave,
}: TestCaseDialogProps) {
  const [formData, setFormData] =
    useState<TestCaseFormData>(
      createDefaultFormData(undefined),
    );

  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (testCase) {
      setFormData({
        scenario_id: testCase.scenario_id,
        module: testCase.module,
        priority: testCase.priority,
        status: testCase.status,
        automation_eligibility:
          testCase.automation_eligibility,
        automation_status:
          testCase.automation_status,
        title: testCase.title,
        description: testCase.description ?? "",
        preconditions:
          testCase.preconditions ?? "",
        test_data: testCase.test_data ?? "",
        steps: testCase.steps ?? "",
        expected_result:
          testCase.expected_result ?? "",
      });
    } else {
      const selectedScenario = scenarios.find(
        (scenario) =>
          scenario.id === selectedScenarioId,
      );

      setFormData(
        createDefaultFormData(selectedScenario),
      );
    }

    setTitleError(false);
  }, [
    testCase,
    selectedScenarioId,
    scenarios,
  ]);

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
        scenarios[0],
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
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.75,
          fontSize: "1rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        {title}
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 2.5,
          py: 2,
          backgroundColor: "#f8fafc",
        }}
      >
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

      <Divider />

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          gap: 0.75,
          backgroundColor: "#fff",
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={saving}
          sx={{
            minHeight: 34,
            px: 1.5,
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
            !formData.title.trim()
          }
          sx={{
            minHeight: 34,
            px: 1.75,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          {saving ? "Saving..." : "Save Test Case"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}