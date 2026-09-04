import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

import type { Bug } from "../../types/bug";

interface BugRetestDialogProps {
  open: boolean;
  bug?: Bug;
  saving?: boolean;
  onClose: () => void;
  onConfirm: (
    executionType: "Manual" | "Automated",
  ) => Promise<void>;
}

export default function BugRetestDialog({
  open,
  bug,
  saving = false,
  onClose,
  onConfirm,
}: BugRetestDialogProps) {
  const [
    executionType,
    setExecutionType,
  ] = useState<"Manual" | "Automated">(
    "Manual",
  );

  useEffect(() => {
    if (open) {
      setExecutionType("Manual");
    }
  }, [open]);

  async function handleConfirm() {
    await onConfirm(executionType);
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Retest Bug
      </DialogTitle>

      <DialogContent>
        {bug && (
          <>
            <Typography
              variant="body1"
              sx={{ mb: 1 }}
            >
              <strong>
                {bug.bug_code}
              </strong>
              {" — "}
              {bug.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Test Case:{" "}
              {bug.execution.test_case.test_case_code}
              {" — "}
              {bug.execution.test_case.title}
            </Typography>
          </>
        )}

        <Typography
          variant="subtitle1"
          sx={{ mb: 1 }}
        >
          Execution Type
        </Typography>

        <FormControl>
          <RadioGroup
            value={executionType}
            onChange={(event) =>
              setExecutionType(
                event.target.value as
                  | "Manual"
                  | "Automated",
              )
            }
          >
            <FormControlLabel
              value="Manual"
              control={<Radio />}
              label="Manual"
            />

            <FormControlLabel
              value="Automated"
              control={<Radio />}
              label="Automated"
            />
          </RadioGroup>
        </FormControl>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          A new Test Run and Test Execution
          will be created for this bug retest.
        </Typography>
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
          onClick={handleConfirm}
          disabled={saving || !bug}
        >
          {saving
            ? "Creating..."
            : "Start Retest"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}