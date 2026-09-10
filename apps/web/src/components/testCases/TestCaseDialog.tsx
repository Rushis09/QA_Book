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
import type { Requirement } from "../../types/requirement";
import type { TestCase } from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";

interface TestCaseDialogProps {
  title: string;
  open: boolean;
  requirements: Requirement[];
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
  testing_type: "FUNCTIONAL",
  execution_method: "MANUAL",
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
  meta_attributes: {
    environment: "",
    browser_os: [],
    steps: [],
  },
});

function toFormData(testCase: TestCase): TestCaseFormData {
  const profile = testCase.profile;

  return {
    scenario_id: testCase.scenario_id,
    module: testCase.module,
    testing_type: profile?.testing_type ?? "FUNCTIONAL",
    execution_method: profile?.execution_method ?? "MANUAL",
    priority: testCase.priority,
    status: testCase.status,
    automation_eligibility: testCase.automation_eligibility,
    automation_status: testCase.automation_status,
    title: testCase.title,
    description: testCase.description ?? "",
    preconditions: testCase.preconditions ?? "",
    test_data: testCase.test_data ?? "",
    steps: testCase.steps ?? "",
    expected_result: testCase.expected_result ?? "",
    meta_attributes: profile?.meta_attributes ?? {
      environment: "",
      browser_os: [],
      steps: [],
    },
  };
}

function parseJsonValue(value: unknown, fallback: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(
      "One or more JSON test-definition fields contain invalid JSON.",
    );
  }
}

function normalizeMetaAttributes(formData: TestCaseFormData) {
  const attrs = { ...formData.meta_attributes };

  if (formData.testing_type === "FUNCTIONAL") {
    attrs.steps = formData.steps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((action, index) => ({
        step_no: index + 1,
        action,
        test_data: "",
        expected_result: "",
      }));
  }

  if (formData.testing_type === "API") {
    attrs.headers = parseJsonValue(attrs.headers, {});
    attrs.path_parameters = parseJsonValue(
      attrs.path_parameters,
      {},
    );
    attrs.query_parameters = parseJsonValue(
      attrs.query_parameters,
      {},
    );
    attrs.request_body = parseJsonValue(
      attrs.request_body,
      null,
    );
    attrs.expected_response = parseJsonValue(
      attrs.expected_response,
      null,
    );

    if (
      attrs.expected_status_code !== undefined &&
      attrs.expected_status_code !== ""
    ) {
      attrs.expected_status_code = Number(
        attrs.expected_status_code,
      );
    } else {
      attrs.expected_status_code = null;
    }
  }

  if (formData.testing_type === "DATABASE") {
    const rawColumns = attrs.expected_columns;

    if (typeof rawColumns === "string") {
      attrs.expected_columns = rawColumns
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separator = line.indexOf("=");

          if (separator === -1) {
            return {
              column: line,
              expected_value: "",
            };
          }

          return {
            column: line.slice(0, separator).trim(),
            expected_value: line
              .slice(separator + 1)
              .trim(),
          };
        });
    }
  }

  if (formData.testing_type === "PERFORMANCE") {
    attrs.virtual_users = Number(
      attrs.virtual_users || 0,
    );
    attrs.ramp_up_seconds = Number(
      attrs.ramp_up_seconds || 0,
    );
    attrs.duration_seconds = Number(
      attrs.duration_seconds || 0,
    );
    attrs.sla_benchmarks = parseJsonValue(
      attrs.sla_benchmarks,
      {},
    );
  }

  if (formData.testing_type === "ACCESSIBILITY") {
    attrs.audit_flags = {
      alt_text: false,
      contrast_ratio: false,
      tab_order: false,
      keyboard_access: false,
      labels: false,
      ...(attrs.audit_flags as
        | Record<string, unknown>
        | undefined),
    };
  }

  return attrs;
}

export default function TestCaseDialog({
  title,
  open,
  requirements,
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
  const [scenarioError, setScenarioError] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (testCase) {
      setFormData(toFormData(testCase));
    } else {
      const selectedScenario = scenarios.find(
        (scenario) => scenario.id === selectedScenarioId,
      );

      setFormData(
        createDefaultFormData(selectedScenario),
      );
    }

    setTitleError(false);
    setScenarioError(false);
  }, [
    testCase,
    selectedScenarioId,
    scenarios,
  ]);

  async function handleSave() {
    let hasError = false;

    if (!formData.title.trim()) {
      setTitleError(true);
      hasError = true;
    }

    if (!formData.scenario_id) {
      setScenarioError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setSaving(true);

      const normalized = {
        ...formData,
        meta_attributes:
          normalizeMetaAttributes(formData),
      };

      await onSave(normalized);
      handleCancel();
    } catch (error) {
      console.error(error);

      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to save test case.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    const selectedScenario = scenarios.find(
      (scenario) => scenario.id === selectedScenarioId,
    );

    setFormData(
      createDefaultFormData(selectedScenario),
    );

    setTitleError(false);
    setScenarioError(false);

    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="lg"
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
          requirements={requirements}
          scenarios={scenarios}
          error={titleError || scenarioError}
          onChange={(value) => {
            setFormData(value);

            if (value.title.trim()) {
              setTitleError(false);
            }

            if (value.scenario_id) {
              setScenarioError(false);
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
          {saving
            ? "Saving..."
            : "Save Test Case"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}