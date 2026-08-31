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
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";

import { aiService } from "../../services/aiService";
import { requirementService } from "../../services/requirementService";
import { documentService } from "../../services/documentService";
import { useNotification } from "../../contexts/NotificationContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";

interface GenerateRequirementDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateRequirementDialog({
  open,
  onClose,
  onGenerated,
}: GenerateRequirementDialogProps) {
  const { showNotification } =
    useNotification();

  const { selectedProject } =
    useWorkspace();

  const projectId =
    selectedProject?.id ?? 0;

  const [source, setSource] = useState<
    "project" | "manual" | "brd"
  >("project");

  const [manualPrompt, setManualPrompt] =
    useState("");

  const [count, setCount] =
    useState(5);

  const [loading, setLoading] =
    useState(false);

  const [documents, setDocuments] =
    useState<
      {
        id: number;
        document_code: string;
        title: string;
        file_name: string;
        file_type: string;
      }[]
    >([]);

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<number | "">("");

  const [documentsLoading, setDocumentsLoading] =
    useState(false);

  useEffect(() => {
    if (
      !open ||
      !selectedProject ||
      source !== "brd"
    ) {
      return;
    }

    async function loadDocuments() {
      try {
        setDocumentsLoading(true);

        const data =
          await documentService.getProjectDocuments(
            selectedProject!.id,
          );

        const brdDocuments =
          data.filter(
            (document) =>
              document.file_type.toLowerCase() ===
                "docx" ||
              document.file_type.toLowerCase() ===
                "pdf",
          );

        setDocuments(brdDocuments);

        if (brdDocuments.length === 1) {
          setSelectedDocumentId(
            brdDocuments[0].id,
          );
        } else {
          setSelectedDocumentId("");
        }
      } catch (error) {
        console.error(error);

        setDocuments([]);

        setSelectedDocumentId("");

        showNotification(
          "Failed to load project documents.",
          "error",
        );
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDocuments();
  }, [
    open,
    selectedProject,
    source,
    showNotification,
  ]);

  function handleSourceChange(
    value: "project" | "manual" | "brd",
  ) {
    setSource(value);

    if (value !== "brd") {
      setSelectedDocumentId("");
    }
  }

  async function handleGenerate() {
    if (!selectedProject) {
      showNotification(
        "Please select a project first.",
        "error",
      );

      return;
    }

    if (
      source === "manual" &&
      !manualPrompt.trim()
    ) {
      showNotification(
        "Please enter a requirement description.",
        "error",
      );

      return;
    }

    if (
      source === "brd" &&
      selectedDocumentId === ""
    ) {
      showNotification(
        "Please select a BRD document.",
        "error",
      );

      return;
    }

    try {
      setLoading(true);

      const requirements =
        source === "brd"
          ? await aiService.generateRequirementsFromBRD(
              {
                project_id: projectId,
                document_id:
                  selectedDocumentId as number,
                number_of_requirements:
                  count,
              },
            )
          : await aiService.generateRequirements(
              {
                project_id: projectId,
                manual_description:
                  source === "manual"
                    ? manualPrompt
                    : "",
                number_of_requirements:
                  count,
              },
            );

      for (const requirement of requirements) {
        await requirementService.createRequirement(
          {
            project_id: projectId,
            module: requirement.module,
            priority: requirement.priority,
            status: "Draft",
            description:
              requirement.description,
          },
        );
      }

      showNotification(
        `${requirements.length} requirements generated successfully.`,
        "success",
      );

      onGenerated();
      onClose();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate requirements.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const noBrdAvailable =
    source === "brd" &&
    !documentsLoading &&
    documents.length === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        ✨ Generate Requirements with AI
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <TextField
            label="Project"
            value={
              selectedProject
                ? `${selectedProject.project_code} - ${selectedProject.name}`
                : ""
            }
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <FormControl>
            <RadioGroup
              value={source}
              onChange={(event) =>
                handleSourceChange(
                  event.target.value as
                    | "project"
                    | "manual"
                    | "brd",
                )
              }
            >
              <FormControlLabel
                value="project"
                control={<Radio />}
                label="Use Project Description"
              />

              <FormControlLabel
                value="manual"
                control={<Radio />}
                label="Describe Requirement Manually"
              />

              <FormControlLabel
                value="brd"
                control={<Radio />}
                label="Use Uploaded BRD"
              />
            </RadioGroup>
          </FormControl>

          {source === "manual" && (
            <TextField
              label="Requirement Description"
              multiline
              minRows={6}
              fullWidth
              value={manualPrompt}
              onChange={(event) =>
                setManualPrompt(
                  event.target.value,
                )
              }
              placeholder="Example:
Build an e-commerce website with login, cart, payment gateway, order tracking and admin dashboard."
            />
          )}

          {source === "brd" && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                BRD Document
              </Typography>

              {documentsLoading ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Loading BRD documents...
                </Typography>
              ) : noBrdAvailable ? (
                <Typography
                  variant="body2"
                  color="error"
                >
                  No BRD documents uploaded for this project.
                </Typography>
              ) : (
                <TextField
                  select
                  fullWidth
                  value={selectedDocumentId}
                  onChange={(event) =>
                    setSelectedDocumentId(
                      Number(event.target.value),
                    )
                  }
                  label="Select BRD"
                >
                  {documents.map(
                    (document) => (
                      <MenuItem
                        key={document.id}
                        value={document.id}
                      >
                        {document.document_code} -{" "}
                        {document.title}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              )}
            </Box>
          )}

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              Number of Requirements
            </Typography>

            <TextField
              select
              value={count}
              onChange={(event) =>
                setCount(
                  Number(event.target.value),
                )
              }
              sx={{ width: 180 }}
            >
              {[5, 10, 15, 20].map(
                (value) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {value}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={
            loading ||
            (source === "brd" &&
              (documentsLoading ||
                noBrdAvailable ||
                selectedDocumentId === ""))
          }
        >
          {loading
            ? "Generating..."
            : "✨ Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}