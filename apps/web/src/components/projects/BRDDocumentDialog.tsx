import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
  documentService,
  type Document,
} from "../../services/documentService";

import type { Project } from "../../types/project";

import ConfirmDialog from "../common/ConfirmDialog";
import { useNotification } from "../../contexts/NotificationContext";

interface BRDDocumentDialogProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

export default function BRDDocumentDialog({
  open,
  project,
  onClose,
}: BRDDocumentDialogProps) {
  const [documents, setDocuments] =
    useState<Document[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [documentToDelete, setDocumentToDelete] =
    useState<Document | null>(null);

  const { showNotification } =
    useNotification();

  async function loadDocuments() {
    if (!project) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await documentService.getProjectDocuments(
          project.id,
        );

      setDocuments(data);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to load project documents.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && project) {
      setSelectedFile(null);
      setConfirmOpen(false);
      setDocumentToDelete(null);

      loadDocuments();
    }
  }, [open, project]);

  async function handleUpload() {
    if (!project || !selectedFile) {
      return;
    }

    try {
      setUploading(true);

      await documentService.uploadDocument(
        project.id,
        selectedFile.name,
        selectedFile,
      );

      showNotification(
        "BRD uploaded successfully.",
        "success",
      );

      setSelectedFile(null);

      await loadDocuments();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to upload BRD.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(
    document: Document,
  ) {
    try {
      const blob =
        await documentService.downloadDocument(
          document.id,
        );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;
      link.download = document.file_name;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to download document.",
        "error",
      );
    }
  }

  function handleDelete(
    document: Document,
  ) {
    setDocumentToDelete(document);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!documentToDelete) {
      return;
    }

    try {
      setDeletingId(documentToDelete.id);

      await documentService.deleteDocument(
        documentToDelete.id,
      );

      showNotification(
        "BRD deleted successfully.",
        "success",
      );

      setConfirmOpen(false);
      setDocumentToDelete(null);

      await loadDocuments();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to delete document.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleCancelDelete() {
    setConfirmOpen(false);
    setDocumentToDelete(null);
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Project BRD
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <Typography variant="h6">
              {project?.project_code} -{" "}
              {project?.name}
            </Typography>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1 }}
              >
                Upload BRD
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={
                    <UploadFileIcon />
                  }
                >
                  Choose BRD File

                  <input
                    type="file"
                    hidden
                    accept=".docx,.pdf"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0] ??
                        null;

                      setSelectedFile(file);

                      event.target.value = "";
                    }}
                  />
                </Button>

                {selectedFile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {selectedFile.name}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  disabled={
                    !selectedFile ||
                    uploading
                  }
                  onClick={handleUpload}
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload"}
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: "block",
                }}
              >
                Supported formats: DOCX, PDF
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1 }}
              >
                Project Documents
              </Typography>

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : documents.length === 0 ? (
                <Alert severity="info">
                  No BRD document uploaded
                  for this project.
                </Alert>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {documents.map(
                    (document) => (
                      <Box
                        key={document.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 1.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                            }}
                          >
                            {document.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {document.file_name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {document.document_code}
                            {" • "}
                            {document.file_type}
                          </Typography>
                        </Box>

                        <Box>
                          <IconButton
                            color="primary"
                            title="Download"
                            onClick={() =>
                              handleDownload(
                                document,
                              )
                            }
                          >
                            <DownloadIcon />
                          </IconButton>

                          <IconButton
                            color="error"
                            title="Delete"
                            disabled={
                              deletingId ===
                              document.id
                            }
                            onClick={() =>
                              handleDelete(
                                document,
                              )
                            }
                          >
                            {deletingId ===
                            document.id ? (
                              <CircularProgress
                                size={22}
                              />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Box>
                      </Box>
                    ),
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete BRD"
        message={
          documentToDelete
            ? `Are you sure you want to delete "${documentToDelete.file_name}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}