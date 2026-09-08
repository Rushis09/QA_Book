import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";

import ProjectForm from "./ProjectForm";
import type { Project } from "../../types/project";
import { useNotification } from "../../contexts/NotificationContext";

interface ProjectDialogProps {
  title: string;
  open: boolean;
  project?: Project;
  existingBrdFileName?: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    status: string;
    version: string | null;
    start_date: string | null;
    end_date: string | null;
    brdFile: File | null;
  }) => Promise<void>;
}

export default function ProjectDialog({
  title,
  open,
  project,
  existingBrdFileName,
  onClose,
  onSave,
}: ProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [version, setVersion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [brdFile, setBrdFile] =
    useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setStatus(project.status);
      setVersion(project.version ?? "");
      setStartDate(project.start_date ?? "");
      setEndDate(project.end_date ?? "");
      setBrdFile(null);
    } else {
      setName("");
      setDescription("");
      setStatus("Active");
      setVersion("");
      setStartDate("");
      setEndDate("");
      setBrdFile(null);
    }

    setNameError(false);
  }, [project, open]);

  async function handleSave() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    try {
      setSaving(true);

      await onSave({
        name: name.trim(),
        description: description.trim(),
        status,
        version: version.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        brdFile,
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
    setBrdFile(null);
    setNameError(false);

    onClose();
  }

  const isEditMode = Boolean(project);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow:
              "0 24px 70px rgba(15, 23, 42, 0.18)",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.25rem",
            lineHeight: 1.25,
            fontWeight: 750,
            letterSpacing: "-0.025em",
            color: "#172033",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.55,
            fontSize: "0.82rem",
            lineHeight: 1.5,
            color: "#667085",
          }}
        >
          {isEditMode
            ? "Update the project details and QA configuration."
            : "Create a project to organize requirements, testing, documents, and automation."}
        </Typography>
      </DialogTitle>

      <Divider />

      {/* Form */}
      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
          backgroundColor: "#ffffff",
        }}
      >
        <ProjectForm
          name={name}
          description={description}
          status={status}
          version={version}
          startDate={startDate}
          endDate={endDate}
          brdFile={brdFile}
          existingBrdFileName={
            existingBrdFileName
          }
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
          onBrdFileChange={setBrdFile}
        />
      </DialogContent>

      <Divider />

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.75,
          gap: 1,
          justifyContent: "flex-end",
          backgroundColor: "#fbfcfe",
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={saving}
          sx={{
            minWidth: 82,
            height: 36,
            px: 1.75,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "0.8rem",
            fontWeight: 650,
            color: "#475467",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            saving ||
            !name.trim()
          }
          sx={{
            minWidth: 110,
            height: 36,
            px: 2,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            boxShadow:
              "0 3px 8px rgba(25, 103, 210, 0.18)",
          }}
        >
          {saving
            ? "Saving..."
            : isEditMode
              ? "Save Changes"
              : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}