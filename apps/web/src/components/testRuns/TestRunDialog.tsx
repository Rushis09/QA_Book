import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import TestRunForm from "./TestRunForm";
import { useNotification } from "../../contexts/NotificationContext";

import type { TestSuite } from "../../types/testSuite";
import type { TestRun } from "../../types/testRun";
import type { TestRunFormData } from "../../types/testRunForm";

interface TestRunDialogProps {
  title: string;
  open: boolean;
  testSuites: TestSuite[];
  testRun?: TestRun;
  onClose: () => void;
  onSave: (
    data: TestRunFormData,
  ) => Promise<void>;
}

const createDefaultFormData = (
  suiteId: number,
): TestRunFormData => ({
  suite_id: suiteId,
  name: "",
  build_version: "",
  environment: "",
  tester: "",
  start_date: "",
  end_date: "",
  status: "Not Started",
});

export default function TestRunDialog({
  title,
  open,
  testSuites,
  testRun,
  onClose,
  onSave,
}: TestRunDialogProps) {
  const [formData, setFormData] =
    useState<TestRunFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] =
    useState(false);

  const [nameError, setNameError] =
    useState(false);

  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (testRun) {
      setFormData({
        suite_id: testRun.suite_id,
        name: testRun.name,
        build_version:
          testRun.build_version ?? "",
        environment:
          testRun.environment ?? "",
        tester: testRun.tester ?? "",
        start_date:
          testRun.start_date ?? "",
        end_date:
          testRun.end_date ?? "",
        status: testRun.status,
      });
    } else {
      setFormData(
        createDefaultFormData(
          testSuites.length > 0
            ? testSuites[0].id
            : 0,
        ),
      );
    }

    setNameError(false);
  }, [testRun, testSuites]);

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
        "Failed to save test run.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        testSuites.length > 0
          ? testSuites[0].id
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
      maxWidth="md"
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <TestRunForm
          value={formData}
          testSuites={testSuites}
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