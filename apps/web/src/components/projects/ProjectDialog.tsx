import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import ProjectForm from "./ProjectForm";
import type { Project } from "../../types/project";
import { useNotification } from "../../contexts/NotificationContext";

interface ProjectDialogProps {
  title: string;
  open: boolean;
  project?: Project;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    status: string;
    version: string | null;
    start_date: string | null;
    end_date: string | null;
  }) => Promise<void>;
}

export default function ProjectDialog({
  title,
  open,
  project,
  onClose,
  onSave,
}: ProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [version, setVersion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    console.log("Editing project:", project);
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setStatus(project.status);
      setVersion(project.version ?? "");
      setStartDate(project.start_date ?? "");
      setEndDate(project.end_date ?? "");
    } else {
      setName("");
      setDescription("");
      setStatus("Active");
      setVersion("");
      setStartDate("");
      setEndDate("");
    }

    setNameError(false);
  }, [project]);

  async function handleSave() {
  
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    try {
      setSaving(true);

      console.log({
        name,
        description,
        status,
        version,
        start_date: startDate,
        end_date: endDate,
      });

      await onSave({
        name,
        description,
        status,
        version: version || null,
        start_date: startDate || null,
        end_date: endDate || null,
      });

      handleCancel();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save project.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName("");
    setDescription("");
    setStatus("Active");
    setVersion("");
    setStartDate("");
    setEndDate("");
    setNameError(false);

    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <ProjectForm
          name={name}
          description={description}
          status={status}
          version={version}
          startDate={startDate}
          endDate={endDate}
          error={nameError}
          onNameChange={(value) => {
            setName(value);

            if (value.trim()) {
              setNameError(false);
            }
          }}
          onDescriptionChange={setDescription}
          onStatusChange={setStatus}
          onVersionChange={setVersion}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}