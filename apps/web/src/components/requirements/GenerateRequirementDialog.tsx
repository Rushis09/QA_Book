import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

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

interface ReviewRequirement {
  id: string;
  module: string;
  priority: string;
  status: string;
  description: string;
  accepted: boolean;
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

const reviewCardSx = {
  border: "1px solid #e4e7ec",
  borderRadius: "10px",
  backgroundColor: "#fff",
  p: 1.5,
};

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

  const [reviewMode, setReviewMode] = useState(false);

  const [reviewRequirements, setReviewRequirements] =
    useState<ReviewRequirement[]>([]);

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
          (document) => {
            const fileType =
              document.file_type.toLowerCase();

            return (
              fileType === "docx" ||
              fileType === "pdf"
            );
          },
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

  useEffect(() => {
    if (!open) {
      setReviewMode(false);
      setReviewRequirements([]);
      setLoading(false);
    }
  }, [open]);

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

      if (
        !requirements ||
        requirements.length === 0
      ) {
        showNotification(
          "AI did not return any requirements.",
          "warning",
        );
        return;
      }

      const reviewItems: ReviewRequirement[] =
        requirements.map(
          (requirement, index) => ({
            id: `${Date.now()}-${index}`,
            module: requirement.module ?? "",
            priority:
              requirement.priority ?? "Medium",
            status: "Draft",
            description:
              requirement.description ?? "",
            accepted: true,
          }),
        );

      setReviewRequirements(reviewItems);
      setReviewMode(true);
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

  function updateRequirement(
    id: string,
    field:
      | "module"
      | "priority"
      | "description",
    value: string,
  ) {
    setReviewRequirements((current) =>
      current.map((requirement) =>
        requirement.id === id
          ? {
              ...requirement,
              [field]: value,
            }
          : requirement,
      ),
    );
  }

  function toggleAccepted(id: string) {
    setReviewRequirements((current) =>
      current.map((requirement) =>
        requirement.id === id
          ? {
              ...requirement,
              accepted: !requirement.accepted,
            }
          : requirement,
      ),
    );
  }

  function acceptAll() {
    setReviewRequirements((current) =>
      current.map((requirement) => ({
        ...requirement,
        accepted: true,
      })),
    );
  }

  function rejectAll() {
    setReviewRequirements((current) =>
      current.map((requirement) => ({
        ...requirement,
        accepted: false,
      })),
    );
  }

  function removeRequirement(id: string) {
    setReviewRequirements((current) =>
      current.filter(
        (requirement) =>
          requirement.id !== id,
      ),
    );
  }

  function handleBackToGeneration() {
    setReviewMode(false);
  }

  async function handleSaveAccepted() {
    if (!selectedProject) {
      showNotification(
        "Please select a project first.",
        "error",
      );
      return;
    }

    const acceptedRequirements =
      reviewRequirements.filter(
        (requirement) =>
          requirement.accepted,
      );

    if (acceptedRequirements.length === 0) {
      showNotification(
        "Please accept at least one requirement to save.",
        "warning",
      );
      return;
    }

    const invalidRequirement =
      acceptedRequirements.find(
        (requirement) =>
          !requirement.module.trim() ||
          !requirement.description.trim(),
      );

    if (invalidRequirement) {
      showNotification(
        "Module and description are required for every accepted requirement.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);

      for (const requirement of acceptedRequirements) {
        await requirementService.createRequirement({
          project_id: projectId,
          module: requirement.module.trim(),
          priority: requirement.priority,
          status: "Draft",
          description:
            requirement.description.trim(),
        });
      }

      showNotification(
        `${acceptedRequirements.length} requirements saved successfully.`,
        "success",
      );

      onGenerated();
      handleReset();
      onClose();
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.detail ||
        "Failed to save requirements.";

      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setReviewMode(false);
    setReviewRequirements([]);
    setManualPrompt("");
    setSelectedDocumentId("");
  }

  function handleDialogClose() {
    if (loading) {
      return;
    }

    handleReset();
    onClose();
  }

  const acceptedCount = useMemo(
    () =>
      reviewRequirements.filter(
        (requirement) =>
          requirement.accepted,
      ).length,
    [reviewRequirements],
  );

  const rejectedCount =
    reviewRequirements.length -
    acceptedCount;

  const noBrdAvailable =
    source === "brd" &&
    !documentsLoading &&
    documents.length === 0;

  if (reviewMode) {
    return (
      <Dialog
        open={open}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              overflow: "hidden",
              maxHeight: "90vh",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.2,
            pb: 1.2,
            borderBottom: "1px solid #eef2f7",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.05rem",
                  fontWeight: 750,
                  letterSpacing: "-0.02em",
                }}
              >
                ✨ Review Generated Requirements
              </Typography>

              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: "0.76rem",
                  color: "#64748b",
                }}
              >
                Review, edit and select the requirements
                you want to save.
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleDialogClose}
              disabled={loading}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            py: 2,
            backgroundColor: "#f8fafc",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              mb: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                {reviewRequirements.length} generated
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#16a34a",
                  fontWeight: 650,
                }}
              >
                {acceptedCount} selected
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#98a2b3",
                }}
              >
                {rejectedCount} rejected
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 0.75,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={acceptAll}
                disabled={
                  loading ||
                  reviewRequirements.length === 0
                }
                startIcon={
                  <CheckOutlinedIcon
                    sx={{ fontSize: 16 }}
                  />
                }
                sx={{
                  minHeight: 32,
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  textTransform: "none",
                  fontWeight: 650,
                }}
              >
                Accept All
              </Button>

              <Button
                size="small"
                variant="outlined"
                onClick={rejectAll}
                disabled={
                  loading ||
                  reviewRequirements.length === 0
                }
                sx={{
                  minHeight: 32,
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  textTransform: "none",
                  fontWeight: 650,
                }}
              >
                Reject All
              </Button>
            </Box>
          </Box>

          {reviewRequirements.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed #cbd5e1",
                borderRadius: "10px",
                backgroundColor: "#fff",
                py: 5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                No generated requirements remain.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {reviewRequirements.map(
                (requirement, index) => (
                  <Box
                    key={requirement.id}
                    sx={{
                      ...reviewCardSx,
                      opacity:
                        requirement.accepted
                          ? 1
                          : 0.62,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={
                          requirement.accepted
                        }
                        onChange={() =>
                          toggleAccepted(
                            requirement.id,
                          )
                        }
                        disabled={loading}
                        size="small"
                        sx={{
                          p: 0.35,
                          mt: 0.15,
                        }}
                      />

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.74rem",
                              fontWeight: 750,
                              color: "#475467",
                            }}
                          >
                            Requirement {index + 1}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() =>
                              removeRequirement(
                                requirement.id,
                              )
                            }
                            disabled={loading}
                            sx={{
                              width: 28,
                              height: 28,
                            }}
                          >
                            <DeleteOutlineOutlinedIcon
                              sx={{
                                fontSize: 17,
                                color: "#98a2b3",
                              }}
                            />
                          </IconButton>
                        </Box>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(0, 1fr) 150px",
                            gap: 1,
                            mb: 1,
                            "@media (max-width: 700px)":
                              {
                                gridTemplateColumns:
                                  "1fr",
                              },
                          }}
                        >
                          <TextField
                            label="Module"
                            value={
                              requirement.module
                            }
                            onChange={(event) =>
                              updateRequirement(
                                requirement.id,
                                "module",
                                event.target.value,
                              )
                            }
                            disabled={loading}
                            size="small"
                            fullWidth
                            sx={fieldSx}
                          />

                          <TextField
                            select
                            label="Priority"
                            value={
                              requirement.priority
                            }
                            onChange={(event) =>
                              updateRequirement(
                                requirement.id,
                                "priority",
                                event.target.value,
                              )
                            }
                            disabled={loading}
                            size="small"
                            fullWidth
                            sx={fieldSx}
                          >
                            {[
                              "High",
                              "Medium",
                              "Low",
                            ].map((priority) => (
                              <MenuItem
                                key={priority}
                                value={priority}
                                sx={{
                                  fontSize:
                                    "0.8rem",
                                }}
                              >
                                {priority}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        <TextField
                          label="Description"
                          value={
                            requirement.description
                          }
                          onChange={(event) =>
                            updateRequirement(
                              requirement.id,
                              "description",
                              event.target.value,
                            )
                          }
                          disabled={loading}
                          multiline
                          minRows={3}
                          fullWidth
                          sx={{
                            ...fieldSx,
                            "& .MuiOutlinedInput-root":
                              {
                                ...fieldSx[
                                  "& .MuiOutlinedInput-root"
                                ],
                                alignItems:
                                  "flex-start",
                                paddingTop: "9px",
                              },
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            mt: 0.8,
                          }}
                        >
                          <EditOutlinedIcon
                            sx={{
                              fontSize: 14,
                              color: "#98a2b3",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "0.66rem",
                              color: "#98a2b3",
                            }}
                          >
                            Edit before saving if
                            needed
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ),
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.7,
            borderTop: "1px solid #eef2f7",
            gap: 1,
          }}
        >
          <Button
            onClick={handleBackToGeneration}
            disabled={loading}
            sx={{
              minHeight: 34,
              px: 1.5,
              borderRadius: "8px",
              fontSize: "0.76rem",
              fontWeight: 650,
              textTransform: "none",
            }}
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={handleDialogClose}
            disabled={loading}
            sx={{
              minHeight: 34,
              px: 1.5,
              borderRadius: "8px",
              fontSize: "0.76rem",
              fontWeight: 650,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveAccepted}
            disabled={
              loading ||
              acceptedCount === 0
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
              ? "Saving..."
              : `Save ${acceptedCount} Requirements`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
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
          <Box
            component="span"
            sx={{ fontSize: "1rem" }}
          >
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
          Generate structured QA requirements from
          your project context, description, or BRD.
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
                  ...fieldSx[
                    "& .MuiOutlinedInput-root"
                  ],
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
                  flexWrap: {
                    xs: "wrap",
                    sm: "nowrap",
                  },
                }}
              >
                <Box
                  sx={sourceCardSx(
                    source === "project",
                  )}
                >
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

                <Box
                  sx={sourceCardSx(
                    source === "manual",
                  )}
                >
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

                <Box
                  sx={sourceCardSx(
                    source === "brd",
                  )}
                >
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
                  setManualPrompt(
                    event.target.value,
                  )
                }
                placeholder="Example: Build an e-commerce website with login, cart, payment gateway, order tracking and admin dashboard."
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx[
                      "& .MuiOutlinedInput-root"
                    ],
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
                    border:
                      "1px dashed #f1b6b6",
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
                    No BRD documents uploaded for
                    this project.
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
                      sx={{
                        fontSize: "0.82rem",
                      }}
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
              width: {
                xs: "100%",
                sm: 180,
              },
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
                setCount(
                  Number(event.target.value),
                )
              }
              fullWidth
              sx={fieldSx}
            >
              {[5, 10, 15, 20].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{
                    fontSize: "0.82rem",
                  }}
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
          onClick={handleDialogClose}
          disabled={loading}
          sx={{
            minHeight: 34,
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 650,
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={
            loading ||
            !selectedProject ||
            (source === "manual" &&
              !manualPrompt.trim()) ||
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