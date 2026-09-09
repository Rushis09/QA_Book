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
import type { TestScenario } from "../../types/testScenario";

import {
  aiService,
  type BulkTestCaseCandidate,
} from "../../services/aiService";
import { testCaseService } from "../../services/testCaseService";
import { useNotification } from "../../contexts/NotificationContext";

interface GenerateTestCaseDialogProps {
  open: boolean;
  projects: Project[];
  requirements: Requirement[];
  scenarios: TestScenario[];
  selectedScenarioIds: number[];
  onClose: () => void;
  onGenerated: () => void;
}

interface ReviewTestCase
  extends BulkTestCaseCandidate {
  reviewId: string;
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

const readOnlyFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    backgroundColor: "#f8fafc",
  },
};

export default function GenerateTestCaseDialog({
  open,
  projects,
  requirements,
  scenarios,
  selectedScenarioIds,
  onClose,
  onGenerated,
}: GenerateTestCaseDialogProps) {
  const [count, setCount] = useState(5);
  const [manualDescription, setManualDescription] =
    useState("");
  const [loading, setLoading] = useState(false);

  const [reviewMode, setReviewMode] =
    useState(false);

  const [reviewTestCases, setReviewTestCases] =
    useState<ReviewTestCase[]>([]);

  const { showNotification } =
    useNotification();

  const selectedScenarios = useMemo(
    () =>
      scenarios.filter((scenario) =>
        selectedScenarioIds.includes(
          scenario.id,
        ),
      ),
    [scenarios, selectedScenarioIds],
  );

  const isBulk =
    selectedScenarioIds.length > 1;

  const selectedScenario =
    selectedScenarios.length === 1
      ? selectedScenarios[0]
      : undefined;

  const selectedRequirement =
    selectedScenario
      ? requirements.find(
          (requirement) =>
            requirement.id ===
            selectedScenario.requirement_id,
        )
      : undefined;

  const selectedProject =
    selectedRequirement
      ? projects.find(
          (project) =>
            project.id ===
            selectedRequirement.project_id,
        )
      : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }

    setReviewMode(false);
    setReviewTestCases([]);
    setManualDescription("");
  }, [open, selectedScenarioIds]);

  function handleClose() {
    if (loading) {
      return;
    }

    setReviewMode(false);
    setReviewTestCases([]);
    setManualDescription("");
    onClose();
  }

  async function handleGenerate() {
    if (selectedScenarioIds.length === 0) {
      showNotification(
        "Please select at least one test scenario.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Single scenario:
       * Preserve the existing single-generation endpoint.
       */
      if (!isBulk) {
        const scenario =
          selectedScenario;

        if (!scenario) {
          throw new Error(
            "Test scenario not found.",
          );
        }

        const generated =
          await aiService.generateTestCases({
            scenario_id: scenario.id,
            manual_description:
              manualDescription,
            number_of_test_cases: count,
          });

        const reviewItems: ReviewTestCase[] =
          generated.map(
            (testCase, index) => ({
              source_scenario_id:
                scenario.id,
              source_scenario_code:
                scenario.scenario_code,
              title: testCase.title,
              priority:
                testCase.priority,
              preconditions:
                testCase.preconditions,
              test_data:
                testCase.test_data,
              steps: testCase.steps,
              expected_result:
                testCase.expected_result,
              reviewId: `${scenario.id}-${index}-${Date.now()}`,
              accepted: true,
            }),
          );

        setReviewTestCases(
          reviewItems,
        );

        setReviewMode(true);

        return;
      }

      /*
       * Multiple scenarios:
       * Use the bulk endpoint.
       */
      const response =
        await aiService.generateTestCasesBulk({
          scenario_ids:
            selectedScenarioIds,
          manual_description:
            manualDescription,
          number_of_test_cases: count,
        });

      const reviewItems: ReviewTestCase[] =
        response.results.flatMap(
          (result) =>
            result.test_cases.map(
              (testCase, index) => ({
                ...testCase,
                reviewId: `${result.scenario_id}-${index}-${Date.now()}`,
                accepted: true,
              }),
            ),
        );

      setReviewTestCases(
        reviewItems,
      );

      setReviewMode(true);

      if (response.errors.length > 0) {
        showNotification(
          `${response.errors.length} batch(es) had generation issues. Review the available results.`,
          "warning",
        );
      }

      if (reviewItems.length === 0) {
        showNotification(
          "No valid test cases were generated.",
          "warning",
        );
      }
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate test cases.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateTestCase(
    reviewId: string,
    field: keyof ReviewTestCase,
    value: string | boolean,
  ) {
    setReviewTestCases((current) =>
      current.map((testCase) =>
        testCase.reviewId === reviewId
          ? {
              ...testCase,
              [field]: value,
            }
          : testCase,
      ),
    );
  }

  function removeTestCase(
    reviewId: string,
  ) {
    setReviewTestCases((current) =>
      current.filter(
        (testCase) =>
          testCase.reviewId !==
          reviewId,
      ),
    );
  }

  function setAllAccepted(
    accepted: boolean,
  ) {
    setReviewTestCases((current) =>
      current.map((testCase) => ({
        ...testCase,
        accepted,
      })),
    );
  }

  async function handleSaveAccepted() {
    const acceptedTestCases =
      reviewTestCases.filter(
        (testCase) =>
          testCase.accepted,
      );

    if (
      acceptedTestCases.length === 0
    ) {
      showNotification(
        "Please accept at least one test case before saving.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);

      for (const testCase of acceptedTestCases) {
        const scenario =
          scenarios.find(
            (item) =>
              item.id ===
              testCase.source_scenario_id,
          );

        if (!scenario) {
          throw new Error(
            `Test scenario not found for ${testCase.source_scenario_code}.`,
          );
        }

        await testCaseService.createTestCase({
          scenario_id:
            testCase.source_scenario_id,
          module: scenario.module,
          priority: testCase.priority,
          status: "Draft",
          automation_eligibility:
            "Eligible",
          automation_status:
            "Not Automated",
          title: testCase.title,
          description: null,
          preconditions:
            testCase.preconditions,
          test_data:
            testCase.test_data,
          steps: testCase.steps,
          expected_result:
            testCase.expected_result,
        });
      }

      showNotification(
        `${acceptedTestCases.length} test case(s) saved successfully.`,
        "success",
      );

      onGenerated();
      handleClose();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save generated test cases.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const groupedReviewTestCases =
    useMemo(() => {
      const groups = new Map<
        number,
        ReviewTestCase[]
      >();

      for (const testCase of reviewTestCases) {
        const existing =
          groups.get(
            testCase.source_scenario_id,
          ) ?? [];

        existing.push(testCase);

        groups.set(
          testCase.source_scenario_id,
          existing,
        );
      }

      return selectedScenarios.map(
        (scenario) => ({
          scenario,
          requirement:
            requirements.find(
              (requirement) =>
                requirement.id ===
                scenario.requirement_id,
            ),
          testCases:
            groups.get(
              scenario.id,
            ) ?? [],
        }),
      );
    }, [
      reviewTestCases,
      selectedScenarios,
      requirements,
    ]);

  const acceptedCount =
    reviewTestCases.filter(
      (testCase) =>
        testCase.accepted,
    ).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.75,
          fontSize: "1rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        {reviewMode
          ? "✨ Review AI-Generated Test Cases"
          : "✨ Generate Test Cases with AI"}
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 2.5,
          py: 2,
          backgroundColor: "#f8fafc",
        }}
      >
        {!reviewMode ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                border:
                  "1px solid #dbe7ff",
                borderRadius: "10px",
                backgroundColor:
                  "#f5f8ff",
              }}
            >
              <Typography
                sx={{
                  fontSize:
                    "0.72rem",
                  fontWeight: 700,
                  color: "#175cd3",
                }}
              >
                AI Test Case Generation
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize:
                    "0.68rem",
                  lineHeight: 1.45,
                  color: "#667085",
                }}
              >
                Generate structured
                test cases from the
                selected test
                scenario
                {isBulk ? "s" : ""}.
              </Typography>
            </Box>

            {isBulk ? (
              <Box>
                <Typography
                  sx={{
                    mb: 0.75,
                    fontSize:
                      "0.76rem",
                    fontWeight: 700,
                    color:
                      "#344054",
                  }}
                >
                  Test Scenarios
                </Typography>

                <Box
                  sx={{
                    border:
                      "1px solid #e4e7ec",
                    borderRadius:
                      "8px",
                    p: 1.25,
                    maxHeight: 220,
                    overflowY:
                      "auto",
                    backgroundColor:
                      "#fff",
                  }}
                >
                  {selectedScenarios.map(
                    (scenario) => (
                      <Box
                        key={
                          scenario.id
                        }
                        sx={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 0.5,
                          minHeight: 34,
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
                              "0.74rem",
                            color:
                              "#344054",
                          }}
                        >
                          {
                            scenario.scenario_code
                          }{" "}
                          -{" "}
                          {
                            scenario.title
                          }
                        </Typography>
                      </Box>
                    ),
                  )}
                </Box>

                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize:
                      "0.7rem",
                    color:
                      "#667085",
                  }}
                >
                  {
                    selectedScenarios.length
                  }{" "}
                  scenarios selected
                </Typography>
              </Box>
            ) : (
              <>
                <TextField
                  label="Project"
                  value={
                    selectedProject
                      ? `${selectedProject.project_code} - ${selectedProject.name}`
                      : ""
                  }
                  fullWidth
                  sx={
                    readOnlyFieldSx
                  }
                  slotProps={{
                    input: {
                      readOnly:
                        true,
                    },
                  }}
                />

                <TextField
                  label="Requirement"
                  value={
                    selectedRequirement
                      ? `${selectedRequirement.requirement_code} - ${selectedRequirement.module}`
                      : ""
                  }
                  fullWidth
                  sx={
                    readOnlyFieldSx
                  }
                  slotProps={{
                    input: {
                      readOnly:
                        true,
                    },
                  }}
                />

                <TextField
                  label="Scenario"
                  value={
                    selectedScenario
                      ? `${selectedScenario.scenario_code} - ${selectedScenario.title}`
                      : ""
                  }
                  fullWidth
                  sx={
                    readOnlyFieldSx
                  }
                  slotProps={{
                    input: {
                      readOnly:
                        true,
                    },
                  }}
                />
              </>
            )}

            <TextField
              label="Additional Instructions"
              value={
                manualDescription
              }
              onChange={(event) =>
                setManualDescription(
                  event.target
                    .value,
                )
              }
              multiline
              minRows={3}
              fullWidth
              sx={fieldSx}
              placeholder="Optional guidance for the AI. The selected scenarios remain the authoritative scope."
            />

            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                border:
                  "1px solid #e4e7ec",
                borderRadius:
                  "10px",
                backgroundColor:
                  "#fff",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize:
                    "0.76rem",
                  fontWeight: 700,
                  color:
                    "#344054",
                }}
              >
                Generation Settings
              </Typography>

              <TextField
                select
                label="Number of Test Cases"
                value={count}
                onChange={(event) =>
                  setCount(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                fullWidth
                sx={fieldSx}
              >
                {[3, 5, 10, 15].map(
                  (value) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {value} Test Cases
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection:
                "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems:
                  "center",
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
                    reviewTestCases.length
                  }{" "}
                  selected for saving
                </Typography>
              </Box>

              <Box
                sx={{
                  display:
                    "flex",
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

            {groupedReviewTestCases.map(
              ({
                scenario,
                requirement,
                testCases,
              }) => (
                <Box
                  key={scenario.id}
                  sx={{
                    border:
                      "1px solid #e4e7ec",
                    borderRadius:
                      "10px",
                    overflow:
                      "hidden",
                    backgroundColor:
                      "#fff",
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
                        scenario.scenario_code
                      }{" "}
                      -{" "}
                      {scenario.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize:
                          "0.68rem",
                        color:
                          "#667085",
                      }}
                    >
                      {requirement
                        ? `${requirement.requirement_code} - ${requirement.module}`
                        : "Requirement unavailable"}
                      {" • "}
                      {
                        testCases.length
                      }{" "}
                      generated test case
                      {testCases.length !==
                      1
                        ? "s"
                        : ""}
                    </Typography>
                  </Box>

                  <Divider />

                  {testCases.length ===
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
                      No valid test
                      cases were
                      generated for
                      this scenario.
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        p: 1.25,
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap: 1.25,
                      }}
                    >
                      {testCases.map(
                        (testCase) => (
                          <Box
                            key={
                              testCase.reviewId
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
                                testCase.accepted
                                  ? "#fff"
                                  : "#f9fafb",
                              opacity:
                                testCase.accepted
                                  ? 1
                                  : 0.72,
                            }}
                          >
                            <Checkbox
                              checked={
                                testCase.accepted
                              }
                              onChange={(
                                event,
                              ) =>
                                updateTestCase(
                                  testCase.reviewId,
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
                                  testCase.title
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateTestCase(
                                    testCase.reviewId,
                                    "title",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                size="small"
                                fullWidth
                                sx={
                                  fieldSx
                                }
                              />

                              <Box
                                sx={{
                                  display:
                                    "grid",
                                  gridTemplateColumns:
                                    "160px 1fr",
                                  gap: 1,
                                }}
                              >
                                <TextField
                                  select
                                  label="Priority"
                                  value={
                                    testCase.priority
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateTestCase(
                                      testCase.reviewId,
                                      "priority",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  size="small"
                                  sx={
                                    fieldSx
                                  }
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
                                  label="Test Data"
                                  value={
                                    testCase.test_data
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateTestCase(
                                      testCase.reviewId,
                                      "test_data",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  size="small"
                                  fullWidth
                                  sx={
                                    fieldSx
                                  }
                                />
                              </Box>

                              <TextField
                                label="Preconditions"
                                value={
                                  testCase.preconditions
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateTestCase(
                                    testCase.reviewId,
                                    "preconditions",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                multiline
                                minRows={2}
                                size="small"
                                fullWidth
                                sx={
                                  fieldSx
                                }
                              />

                              <TextField
                                label="Steps"
                                value={
                                  testCase.steps
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateTestCase(
                                    testCase.reviewId,
                                    "steps",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                multiline
                                minRows={3}
                                size="small"
                                fullWidth
                                sx={
                                  fieldSx
                                }
                              />

                              <TextField
                                label="Expected Result"
                                value={
                                  testCase.expected_result
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateTestCase(
                                    testCase.reviewId,
                                    "expected_result",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                multiline
                                minRows={3}
                                size="small"
                                fullWidth
                                sx={
                                  fieldSx
                                }
                              />
                            </Box>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                removeTestCase(
                                  testCase.reviewId,
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

            {reviewTestCases.length ===
              0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign:
                    "center",
                  border:
                    "1px dashed #d0d5dd",
                  borderRadius:
                    "8px",
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
                  No generated test
                  cases remain for
                  review.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          gap: 0.75,
        }}
      >
        {reviewMode ? (
          <>
            <Button
              onClick={() =>
                setReviewMode(
                  false,
                )
              }
              disabled={loading}
              sx={{
                minHeight: 34,
                px: 1.5,
                borderRadius:
                  "8px",
                fontSize:
                  "0.76rem",
                fontWeight: 650,
                color:
                  "#475467",
                textTransform:
                  "none",
              }}
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
              sx={{
                minHeight: 34,
                px: 1.75,
                borderRadius:
                  "8px",
                fontSize:
                  "0.76rem",
                fontWeight: 700,
                textTransform:
                  "none",
                boxShadow: "none",
              }}
            >
              {loading
                ? "Saving..."
                : `Save ${acceptedCount} Test Case${
                    acceptedCount !==
                    1
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
              sx={{
                minHeight: 34,
                px: 1.5,
                borderRadius:
                  "8px",
                fontSize:
                  "0.76rem",
                fontWeight: 650,
                color:
                  "#475467",
                textTransform:
                  "none",
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={
                handleGenerate
              }
              disabled={
                loading ||
                selectedScenarioIds.length ===
                  0
              }
              sx={{
                minHeight: 34,
                px: 1.75,
                borderRadius:
                  "8px",
                fontSize:
                  "0.76rem",
                fontWeight: 700,
                textTransform:
                  "none",
                boxShadow: "none",
              }}
            >
              {loading
                ? "Generating..."
                : isBulk
                  ? `✨ Generate for ${selectedScenarioIds.length} Scenarios`
                  : "✨ Generate Test Cases"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}