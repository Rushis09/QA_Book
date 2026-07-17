import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import RequirementForm from "./RequirementForm";
import { useNotification } from "../../contexts/NotificationContext";

import type { RequirementFormData } from "../../types/requirementForm";
import type { Requirement } from "../../types/requirement";
import { useWorkspace } from "../../contexts/WorkspaceContext";

interface RequirementDialogProps {
  title: string;
  open: boolean;
  requirement?: Requirement;
  onClose: () => void;
  onSave: (data: RequirementFormData) => Promise<void>;
}

const createDefaultFormData = (
  projectId: number,
): RequirementFormData => ({
  project_id: projectId,
  module: "",
  priority: "Medium",
  status: "Draft",
  description: "",
});

export default function RequirementDialog({
  title,
  open,
  requirement,
  onClose,
  onSave,
}: RequirementDialogProps) {
  const [formData, setFormData] =
    useState<RequirementFormData>(
      createDefaultFormData(0),
    );

  const [saving, setSaving] = useState(false);
  const [moduleError, setModuleError] = useState(false);

  const { showNotification } = useNotification();
  const { selectedProject } = useWorkspace();

  useEffect(() => {
    if (requirement) {
      setFormData({
        project_id: requirement.project_id,
        module: requirement.module,
        priority: requirement.priority,
        status: requirement.status,
        description: requirement.description ?? "",
      });
    } else {
      setFormData(
        createDefaultFormData(
          selectedProject?.id ?? 0,
        ),
      );
    }

    setModuleError(false);
  }, [requirement, selectedProject]);

  async function handleSave() {
    if (!formData.module.trim()) {
      setModuleError(true);
      return;
    }

    try {
      setSaving(true);

      await onSave(formData);

      handleCancel();
    } catch (error) {
      console.error(error);
      showNotification(
        "Failed to save requirement.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setFormData(
      createDefaultFormData(
        selectedProject?.id ?? 0,
      )
    );

    setModuleError(false);
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
        <RequirementForm
          value={formData}
          error={moduleError}
          onChange={(value) => {
            setFormData(value);

            if (value.module.trim()) {
              setModuleError(false);
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
          disabled={saving || !formData.module.trim()}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}