import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { TestCase } from "../../types/testCase";
import type {
  AutomationTestMapping,
} from "../types/automation";

interface AutomationMappingDialogProps {
  open: boolean;
  testCase: TestCase | null;
  mapping?: AutomationTestMapping;
  onClose: () => void;
  onSave: (data: {
    test_name: string;
    test_file_path: string;
  }) => Promise<void>;
}

export default function AutomationMappingDialog({
  open,
  testCase,
  mapping,
  onClose,
  onSave,
}: AutomationMappingDialogProps) {
  const [testName, setTestName] =
    useState("");

  const [testFilePath, setTestFilePath] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mapping) {
      setTestName(mapping.test_name);
      setTestFilePath(mapping.test_file_path);
      return;
    }

    if (testCase) {
      setTestName(
        `test_${testCase.test_case_code.toLowerCase()}`,
      );

      setTestFilePath(
        `tests/${testCase.test_case_code.toLowerCase()}.py`,
      );
    }
  }, [open, mapping, testCase]);

  async function handleSave() {
    if (!testName.trim() || !testFilePath.trim()) {
      return;
    }

    try {
      setSaving(true);

      await onSave({
        test_name: testName.trim(),
        test_file_path: testFilePath.trim(),
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {mapping
          ? "Edit Automation Mapping"
          : "Map Test Case"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {testCase && (
            <>
              <Typography variant="body2">
                <strong>Test Case:</strong>{" "}
                {testCase.test_case_code}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {testCase.title}
              </Typography>
            </>
          )}

          <TextField
            label="Test Name"
            value={testName}
            onChange={(event) =>
              setTestName(event.target.value)
            }
            fullWidth
            required
          />

          <TextField
            label="Test File Path"
            value={testFilePath}
            onChange={(event) =>
              setTestFilePath(event.target.value)
            }
            fullWidth
            required
            placeholder="tests/test_tc001.py"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            !testName.trim() ||
            !testFilePath.trim()
          }
        >
          {saving
            ? "Saving..."
            : mapping
              ? "Update Mapping"
              : "Create Mapping"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}