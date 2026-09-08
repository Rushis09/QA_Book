import { useEffect, useState } from "react";

import {
  BugReportOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
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

  steps_to_reproduce:
    stepsToReproduce,

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
    initialExecutionId !==
      undefined;

  useEffect(() => {
    if (bug) {
      setFormData({
        execution_id:
          bug.execution_id,

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
          bug.steps_to_reproduce ??
          "",

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
            execution.id ===
            executionId,
        );

      setFormData(
        createDefaultFormData(
          executionId,
          selectedExecution?.actual_result ??
            "",
          selectedExecution
            ?.test_case.steps ??
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
      formData.execution_id ===
      0;

    const titleError =
      !formData.title.trim();

    if (
      executionError ||
      titleError
    ) {
      setErrors({
        execution:
          executionError,
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

  const isEdit = Boolean(bug);

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : handleCancel
      }
      fullWidth
      maxWidth="lg"
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            maxHeight:
              "calc(100vh - 48px)",
            boxShadow:
              "0 20px 50px rgba(16, 24, 40, 0.18)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.2,
          py: 1.35,
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "9px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                backgroundColor:
                  "#eff8ff",
                color: "#1570ef",
                flexShrink: 0,
              }}
            >
              <BugReportOutlined
                sx={{
                  fontSize: 19,
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize:
                    "0.95rem",
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: "#101828",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize:
                    "0.66rem",
                  color: "#667085",
                }}
              >
                {isEdit
                  ? "Update defect details and workflow state."
                  : "Capture a defect from a failed or unexpected test result."}
              </Typography>
            </Box>
          </Box>

          {bug && (
            <Typography
              sx={{
                flexShrink: 0,
                fontSize:
                  "0.68rem",
                fontWeight: 800,
                color: "#175cd3",
                backgroundColor:
                  "#eff8ff",
                border:
                  "1px solid #b2ddff",
                borderRadius:
                  "7px",
                px: 1,
                py: 0.55,
              }}
            >
              {bug.bug_code}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent
        dividers
        sx={{
          px: {
            xs: 1.5,
            sm: 2.2,
          },
          py: 1.8,
          backgroundColor:
            "#f8fafc",
          "&.MuiDialogContent-dividers":
            {
              borderColor:
                "#eaecf0",
            },
        }}
      >
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

      <DialogActions
        sx={{
          px: 2.2,
          py: 1.15,
          backgroundColor: "#fff",
          borderTop:
            "1px solid #eaecf0",
          gap: 0.7,
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={saving}
          sx={{
            minHeight: 34,
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.72rem",
            fontWeight: 750,
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
            px: 1.7,
            borderRadius: "8px",
            fontSize: "0.72rem",
            fontWeight: 750,
            textTransform: "none",
            boxShadow:
              "0 1px 2px rgba(16,24,40,0.12)",
          }}
        >
          {saving
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Bug"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}