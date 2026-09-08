import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    backgroundColor: "#fff",
    fontSize: "0.82rem",
    minHeight: 42,
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.78rem",
  },
};

const sourceCardSx = (selected: boolean) => ({
  flex: 1,
  minWidth: 0,
  border: "1px solid",
  borderColor: selected ? "#1976d2" : "#e2e8f0",
  borderRadius: "10px",
  backgroundColor: selected ? "#f3f8ff" : "#fff",
  px: 1.4,
  py: 1,
  transition: "all 0.15s ease",
  "&:hover": {
    borderColor: "#90caf9",
    backgroundColor: "#f8fbff",
  },
});

export default function GenerateRequirementDialog({
  open,
  onClose,
  onGenerated,
}: GenerateRequirementDialogProps) {
  const { showNotification } = useNotification();
  const { selectedProject } = useWorkspace();

  const projectId = selectedProject?.id ?? 0;

  const [source, setSource] = useState<
    "project" | "manual" | "brd"
  >("project");

  const [manualPrompt, setManualPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const [documents, setDocuments] = useState<
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
    if (!open || !selectedProject || source !== "brd") {
      return;
    }

    async function loadDocuments() {
      try {
        setDocumentsLoading(true);

        const data =
          await documentService.getProjectDocuments(
            selectedProject!.id,
          );

        const brdDocuments = data.filter(
          (document) =>
            document.file_type.toLowerCase() === "docx" ||
            document.file_type.toLowerCase() === "pdf",
        );

        setDocuments(brdDocuments);

        if (brdDocuments.length === 1) {
          setSelectedDocumentId(brdDocuments[0].id);
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
          ? await aiService.generateRequirementsFromBRD({
              project_id: projectId,
              document_id:
                selectedDocumentId as number,
              number_of_requirements: count,
            })
          : await aiService.generateRequirements({
              project_id: projectId,
              manual_description:
                source === "manual"
                  ? manualPrompt
                  : "",
              number_of_requirements: count,
            });

      for (const requirement of requirements) {
        await requirementService.createRequirement({
          project_id: projectId,
          module: requirement.module,
          priority: requirement.priority,
          status: "Draft",
          description: requirement.description,
        });
      }

      showNotification(
        `${requirements.length} requirements generated successfully.`,
        "success",
      );

      onGenerated();
      onClose();
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.detail ||
        "Failed to generate requirements.";

      showNotification(message, "error");
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
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.4,
          pb: 1.2,
          fontSize: "1.05rem",
          fontWeight: 750,
          letterSpacing: "-0.02em",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <Box component="span" sx={{ fontSize: "1rem" }}>
            ✨
          </Box>
          Generate Requirements with AI
        </Box>

        <Typography
          sx={{
            mt: 0.45,
            fontSize: "0.76rem",
            fontWeight: 400,
            color: "#64748b",
          }}
        >
          Generate structured QA requirements from your
          project context, description, or BRD.
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 1.2,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 750,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.055em",
                mb: 0.9,
              }}
            >
              Project
            </Typography>

            <TextField
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
              sx={{
                ...fieldSx,
                "& .MuiOutlinedInput-root": {
                  ...fieldSx["& .MuiOutlinedInput-root"],
                  backgroundColor: "#f8fafc",
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 750,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.055em",
                mb: 0.9,
              }}
            >
              Generation Source
            </Typography>

            <FormControl fullWidth>
              <RadioGroup
                row
                value={source}
                onChange={(event) =>
                  handleSourceChange(
                    event.target.value as
                      | "project"
                      | "manual"
                      | "brd",
                  )
                }
                sx={{
                  gap: 1,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <Box sx={sourceCardSx(source === "project")}>
                  <FormControlLabel
                    value="project"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: 650,
                          }}
                        >
                          Project Description
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            color: "#64748b",
                            mt: 0.15,
                          }}
                        >
                          Use project context
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: "100%",
                      alignItems: "flex-start",
                    }}
                  />
                </Box>

                <Box sx={sourceCardSx(source === "manual")}>
                  <FormControlLabel
                    value="manual"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: 650,
                          }}
                        >
                          Manual Description
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            color: "#64748b",
                            mt: 0.15,
                          }}
                        >
                          Describe requirements
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: "100%",
                      alignItems: "flex-start",
                    }}
                  />
                </Box>

                <Box sx={sourceCardSx(source === "brd")}>
                  <FormControlLabel
                    value="brd"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: 650,
                          }}
                        >
                          Uploaded BRD
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.68rem",
                            color: "#64748b",
                            mt: 0.15,
                          }}
                        >
                          Generate from document
                        </Typography>
                      </Box>
                    }
                    sx={{
                      margin: 0,
                      width: "100%",
                      alignItems: "flex-start",
                    }}
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>

          {source === "manual" && (
            <Box>
              <TextField
                label="Requirement Description"
                multiline
                minRows={5}
                fullWidth
                value={manualPrompt}
                onChange={(event) =>
                  setManualPrompt(event.target.value)
                }
                placeholder="Example: Build an e-commerce website with login, cart, payment gateway, order tracking and admin dashboard."
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx["& .MuiOutlinedInput-root"],
                    alignItems: "flex-start",
                    paddingTop: "9px",
                  },
                }}
              />
            </Box>
          )}

          {source === "brd" && (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 750,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.055em",
                  mb: 0.9,
                }}
              >
                BRD Document
              </Typography>

              {documentsLoading ? (
                <Typography
                  sx={{
                    fontSize: "0.76rem",
                    color: "#64748b",
                  }}
                >
                  Loading BRD documents...
                </Typography>
              ) : noBrdAvailable ? (
                <Box
                  sx={{
                    border: "1px dashed #f1b6b6",
                    borderRadius: "9px",
                    backgroundColor: "#fff8f8",
                    px: 1.5,
                    py: 1.2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                      color: "#c62828",
                    }}
                  >
                    No BRD documents uploaded for this
                    project.
                  </Typography>
                </Box>
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
                  sx={fieldSx}
                >
                  {documents.map((document) => (
                    <MenuItem
                      key={document.id}
                      value={document.id}
                      sx={{ fontSize: "0.82rem" }}
                    >
                      {document.document_code} -{" "}
                      {document.title}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>
          )}

          <Box
            sx={{
              width: { xs: "100%", sm: 180 },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 750,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.055em",
                mb: 0.9,
              }}
            >
              Number of Requirements
            </Typography>

            <TextField
              select
              value={count}
              onChange={(event) =>
                setCount(Number(event.target.value))
              }
              fullWidth
              sx={fieldSx}
            >
              {[5, 10, 15, 20].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{ fontSize: "0.82rem" }}
                >
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.8,
          borderTop: "1px solid #eef2f7",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            minHeight: 34,
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 650,
          }}
        >
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
          sx={{
            minHeight: 34,
            px: 1.7,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          {loading
            ? "Generating..."
            : "✨ Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}