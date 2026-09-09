import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import type { Project } from "../../types/project";
import type { Requirement } from "../../types/requirement";
import {
  aiService,
  type BulkScenarioCandidate,
} from "../../services/aiService";
import { testScenarioService } from "../../services/testScenarioService";
import { useNotification } from "../../contexts/NotificationContext";

interface GenerateScenarioDialogProps {
  open: boolean;
  projects: Project[];
  requirements: Requirement[];
  selectedRequirementIds: number[];
  onClose: () => void;
  onGenerated: () => void;
}

interface ReviewScenario extends BulkScenarioCandidate {
  reviewId: string;
  accepted: boolean;
}

export default function GenerateScenarioDialog({
  open,
  projects,
  requirements,
  selectedRequirementIds,
  onClose,
  onGenerated,
}: GenerateScenarioDialogProps) {
  const [projectId, setProjectId] = useState(0);
  const [count, setCount] = useState(5);
  const [manualDescription, setManualDescription] =
    useState("");
  const [loading, setLoading] = useState(false);

  const [reviewMode, setReviewMode] =
    useState(false);

  const [reviewScenarios, setReviewScenarios] =
    useState<ReviewScenario[]>([]);

  const { showNotification } =
    useNotification();

  const selectedRequirements = useMemo(
    () =>
      requirements.filter((requirement) =>
        selectedRequirementIds.includes(
          requirement.id,
        ),
      ),
    [requirements, selectedRequirementIds],
  );

  const isBulk =
    selectedRequirementIds.length > 1;

  const selectedProject = projects.find(
    (project) => project.id === projectId,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedRequirements.length > 0) {
      setProjectId(
        selectedRequirements[0].project_id,
      );
    } else if (projects.length > 0) {
      setProjectId(projects[0].id);
    }

    setReviewMode(false);
    setReviewScenarios([]);
    setManualDescription("");
  }, [
    open,
    selectedRequirements,
    projects,
  ]);

  function handleClose() {
    if (loading) {
      return;
    }

    setReviewMode(false);
    setReviewScenarios([]);
    setManualDescription("");
    onClose();
  }

  async function handleGenerate() {
    if (selectedRequirementIds.length === 0) {
      showNotification(
        "Please select at least one requirement.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Single requirement:
       * Preserve the existing AI generation endpoint.
       */
      if (!isBulk) {
        const requirement =
          selectedRequirements[0];

        if (!requirement) {
          throw new Error(
            "Requirement not found.",
          );
        }

        const scenarios =
          await aiService.generateScenarios({
            project_id: projectId,
            requirement_id:
              requirement.id,
            generate_for_all: false,
            manual_description:
              manualDescription,
            number_of_scenarios: count,
          });

        const reviewItems: ReviewScenario[] =
          scenarios.map(
            (scenario, index) => ({
              source_requirement_id:
                requirement.id,
              source_requirement_code:
                requirement.requirement_code,
              title: scenario.title,
              priority: scenario.priority,
              status: scenario.status,
              description:
                scenario.description,
              reviewId: `${requirement.id}-${index}-${Date.now()}`,
              accepted: true,
            }),
          );

        setReviewScenarios(
          reviewItems,
        );

        setReviewMode(true);

        return;
      }

      /*
       * Multiple requirements:
       * Use the new bulk endpoint.
       */
      const response =
        await aiService.generateScenariosBulk({
          project_id: projectId,
          requirement_ids:
            selectedRequirementIds,
          manual_description:
            manualDescription,
          number_of_scenarios: count,
        });

      const reviewItems: ReviewScenario[] =
        response.results.flatMap(
          (result) =>
            result.scenarios.map(
              (scenario, index) => ({
                ...scenario,
                reviewId: `${result.requirement_id}-${index}-${Date.now()}`,
                accepted: true,
              }),
            ),
        );

      setReviewScenarios(
        reviewItems,
      );

      setReviewMode(true);

      if (
        response.errors.length > 0
      ) {
        showNotification(
          `${response.errors.length} batch(es) had generation issues. Review the available results.`,
          "warning",
        );
      }

      if (reviewItems.length === 0) {
        showNotification(
          "No valid test scenarios were generated.",
          "warning",
        );
      }
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate test scenarios.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateScenario(
    reviewId: string,
    field: keyof ReviewScenario,
    value: string | boolean,
  ) {
    setReviewScenarios((current) =>
      current.map((scenario) =>
        scenario.reviewId === reviewId
          ? {
              ...scenario,
              [field]: value,
            }
          : scenario,
      ),
    );
  }

  function removeScenario(
    reviewId: string,
  ) {
    setReviewScenarios((current) =>
      current.filter(
        (scenario) =>
          scenario.reviewId !==
          reviewId,
      ),
    );
  }

  function setAllAccepted(
    accepted: boolean,
  ) {
    setReviewScenarios((current) =>
      current.map((scenario) => ({
        ...scenario,
        accepted,
      })),
    );
  }

  async function handleSaveAccepted() {
    const acceptedScenarios =
      reviewScenarios.filter(
        (scenario) =>
          scenario.accepted,
      );

    if (
      acceptedScenarios.length === 0
    ) {
      showNotification(
        "Please accept at least one scenario before saving.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);

      for (const scenario of acceptedScenarios) {
        const requirement =
          requirements.find(
            (item) =>
              item.id ===
              scenario.source_requirement_id,
          );

        if (!requirement) {
          throw new Error(
            `Requirement not found for ${scenario.source_requirement_code}.`,
          );
        }

        await testScenarioService.createTestScenario(
          {
            requirement_id:
              scenario.source_requirement_id,
            module:
              requirement.module,
            title: scenario.title,
            priority: scenario.priority,
            status: scenario.status,
            description:
              scenario.description,
          },
        );
      }

      showNotification(
        `${acceptedScenarios.length} test scenario(s) saved successfully.`,
        "success",
      );

      onGenerated();
      handleClose();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save generated test scenarios.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const groupedReviewScenarios =
    useMemo(() => {
      const groups = new Map<
        number,
        ReviewScenario[]
      >();

      for (const scenario of reviewScenarios) {
        const existing =
          groups.get(
            scenario.source_requirement_id,
          ) ?? [];

        existing.push(scenario);

        groups.set(
          scenario.source_requirement_id,
          existing,
        );
      }

      return selectedRequirements.map(
        (requirement) => ({
          requirement,
          scenarios:
            groups.get(
              requirement.id,
            ) ?? [],
        }),
      );
    }, [
      reviewScenarios,
      selectedRequirements,
    ]);

  const acceptedCount =
    reviewScenarios.filter(
      (scenario) =>
        scenario.accepted,
    ).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        {reviewMode
          ? "✨ Review AI-Generated Test Scenarios"
          : "✨ Generate Test Scenarios with AI"}
      </DialogTitle>

      <DialogContent>
        {!reviewMode ? (
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

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                Requirements
              </Typography>

              <Box
                sx={{
                  border:
                    "1px solid #e4e7ec",
                  borderRadius: "8px",
                  p: 1.25,
                  maxHeight: 180,
                  overflowY: "auto",
                  backgroundColor:
                    "#f8fafc",
                }}
              >
                {selectedRequirements.map(
                  (requirement) => (
                    <Box
                      key={
                        requirement.id
                      }
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 0.5,
                        minHeight: 32,
                      }}
                    >
                      <Checkbox
                        checked
                        disabled
                        size="small"
                      />

                      <Typography
                        sx={{
                          fontSize:
                            "0.78rem",
                          color:
                            "#344054",
                        }}
                      >
                        {
                          requirement.requirement_code
                        }{" "}
                        -{" "}
                        {
                          requirement.module
                        }
                      </Typography>
                    </Box>
                  ),
                )}
              </Box>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: "0.7rem",
                  color: "#667085",
                }}
              >
                {selectedRequirements.length}{" "}
                requirement
                {selectedRequirements.length !==
                1
                  ? "s"
                  : ""}{" "}
                selected
              </Typography>
            </Box>

            <TextField
              label="Additional Instructions"
              value={manualDescription}
              onChange={(event) =>
                setManualDescription(
                  event.target.value,
                )
              }
              multiline
              minRows={3}
              fullWidth
              placeholder="Optional guidance for the AI. Requirements remain the authoritative scope."
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                Number of Scenarios
              </Typography>

              <TextField
                select
                value={count}
                onChange={(event) =>
                  setCount(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                sx={{ width: 220 }}
              >
                {[3, 5, 10, 15].map(
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
        ) : (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize:
                      "0.82rem",
                    fontWeight: 700,
                    color:
                      "#101828",
                  }}
                >
                  Review before saving
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize:
                      "0.72rem",
                    color:
                      "#667085",
                  }}
                >
                  {acceptedCount} of{" "}
                  {
                    reviewScenarios.length
                  }{" "}
                  selected for saving
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setAllAccepted(
                      true,
                    )
                  }
                >
                  Accept All
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setAllAccepted(
                      false,
                    )
                  }
                >
                  Reject All
                </Button>
              </Box>
            </Box>

            {groupedReviewScenarios.map(
              ({
                requirement,
                scenarios,
              }) => (
                <Box
                  key={requirement.id}
                  sx={{
                    border:
                      "1px solid #e4e7ec",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor:
                      "#ffffff",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.1,
                      backgroundColor:
                        "#f8fafc",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.78rem",
                        fontWeight: 700,
                        color:
                          "#344054",
                      }}
                    >
                      {
                        requirement.requirement_code
                      }{" "}
                      -{" "}
                      {requirement.module}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize:
                          "0.7rem",
                        color:
                          "#667085",
                      }}
                    >
                      {
                        scenarios.length
                      }{" "}
                      generated scenario
                      {scenarios.length !==
                      1
                        ? "s"
                        : ""}
                    </Typography>
                  </Box>

                  <Divider />

                  {scenarios.length ===
                  0 ? (
                    <Typography
                      sx={{
                        px: 1.5,
                        py: 1.5,
                        fontSize:
                          "0.74rem",
                        color:
                          "#b42318",
                      }}
                    >
                      No valid scenarios
                      were generated for
                      this requirement.
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        p: 1.25,
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: 1.25,
                      }}
                    >
                      {scenarios.map(
                        (scenario) => (
                          <Box
                            key={
                              scenario.reviewId
                            }
                            sx={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "auto 1fr auto",
                              gap: 1,
                              alignItems:
                                "start",
                              p: 1.25,
                              border:
                                "1px solid #eaecf0",
                              borderRadius:
                                "8px",
                              backgroundColor:
                                scenario.accepted
                                  ? "#ffffff"
                                  : "#f9fafb",
                              opacity:
                                scenario.accepted
                                  ? 1
                                  : 0.72,
                            }}
                          >
                            <Checkbox
                              checked={
                                scenario.accepted
                              }
                              onChange={(
                                event,
                              ) =>
                                updateScenario(
                                  scenario.reviewId,
                                  "accepted",
                                  event
                                    .target
                                    .checked,
                                )
                              }
                              size="small"
                            />

                            <Box
                              sx={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap: 1,
                              }}
                            >
                              <TextField
                                label="Title"
                                value={
                                  scenario.title
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateScenario(
                                    scenario.reviewId,
                                    "title",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                size="small"
                                fullWidth
                              />

                              <Box
                                sx={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "160px 160px",
                                  gap: 1,
                                }}
                              >
                                <TextField
                                  select
                                  label="Priority"
                                  value={
                                    scenario.priority
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateScenario(
                                      scenario.reviewId,
                                      "priority",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  size="small"
                                >
                                  {[
                                    "High",
                                    "Medium",
                                    "Low",
                                  ].map(
                                    (
                                      priority,
                                    ) => (
                                      <MenuItem
                                        key={
                                          priority
                                        }
                                        value={
                                          priority
                                        }
                                      >
                                        {
                                          priority
                                        }
                                      </MenuItem>
                                    ),
                                  )}
                                </TextField>

                                <TextField
                                  select
                                  label="Status"
                                  value={
                                    scenario.status
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateScenario(
                                      scenario.reviewId,
                                      "status",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  size="small"
                                >
                                  <MenuItem value="Draft">
                                    Draft
                                  </MenuItem>
                                </TextField>
                              </Box>

                              <TextField
                                label="Description"
                                value={
                                  scenario.description
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateScenario(
                                    scenario.reviewId,
                                    "description",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                multiline
                                minRows={3}
                                size="small"
                                fullWidth
                              />
                            </Box>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                removeScenario(
                                  scenario.reviewId,
                                )
                              }
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ),
                      )}
                    </Box>
                  )}
                </Box>
              ),
            )}

            {reviewScenarios.length ===
              0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  border:
                    "1px dashed #d0d5dd",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      "0.78rem",
                    color:
                      "#667085",
                  }}
                >
                  No generated scenarios
                  remain for review.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {reviewMode ? (
          <>
            <Button
              onClick={() =>
                setReviewMode(false)
              }
              disabled={loading}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={
                handleSaveAccepted
              }
              disabled={
                loading ||
                acceptedCount === 0
              }
            >
              {loading
                ? "Saving..."
                : `Save ${acceptedCount} Scenario${
                    acceptedCount !== 1
                      ? "s"
                      : ""
                  }`}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={
                loading ||
                selectedRequirementIds.length ===
                  0
              }
            >
              {loading
                ? "Generating..."
                : isBulk
                  ? `✨ Generate for ${selectedRequirementIds.length} Requirements`
                  : "✨ Generate"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}