import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import type { TestingType } from "../../types/testCase";

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

interface ReviewTestCase extends BulkTestCaseCandidate {
  reviewId: string;
  accepted: boolean;
}

/*
 * Automation is intentionally excluded here.
 *
 * Testing Type answers:
 * "What are we testing?"
 *
 * Execution Method answers:
 * "How is it executed?"
 *
 * Automation therefore remains an execution method,
 * not a peer AI testing discipline.
 */
const TESTING_TYPES: Array<{
  value: TestingType;
  label: string;
}> = [
  {
    value: "FUNCTIONAL",
    label: "Functional",
  },
  {
    value: "API",
    label: "API",
  },
  {
    value: "DATABASE",
    label: "Database",
  },
  {
    value: "PERFORMANCE",
    label: "Performance",
  },
  {
    value: "SECURITY",
    label: "Security",
  },
  {
    value: "ACCESSIBILITY",
    label: "Accessibility",
  },
];

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

function typeLabel(value: TestingType) {
  return (
    TESTING_TYPES.find(
      (item) => item.value === value,
    )?.label ?? value
  );
}

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

  const [testingTypes, setTestingTypes] =
    useState<TestingType[]>(["FUNCTIONAL"]);

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

  /*
   * Reset the dialog every time it is opened
   * or the selected scenario set changes.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setReviewMode(false);
    setReviewTestCases([]);
    setManualDescription("");
    setTestingTypes(["FUNCTIONAL"]);
  }, [open, selectedScenarioIds]);

  function handleClose() {
    if (loading) {
      return;
    }

    setReviewMode(false);
    setReviewTestCases([]);
    setManualDescription("");
    setTestingTypes(["FUNCTIONAL"]);

    onClose();
  }

  function toggleTestingType(
    testingType: TestingType,
  ) {
    setTestingTypes((current) => {
      if (current.includes(testingType)) {
        return current.filter(
          (item) => item !== testingType,
        );
      }

      return [
        ...current,
        testingType,
      ];
    });
  }

  async function handleGenerate() {
    if (selectedScenarioIds.length === 0) {
      showNotification(
        "Please select at least one test scenario.",
        "warning",
      );

      return;
    }

    if (testingTypes.length === 0) {
      showNotification(
        "Please select at least one testing type.",
        "warning",
      );

      return;
    }

    try {
      setLoading(true);

      const now = Date.now();

      /*
       * Single scenario:
       * Preserve the existing single-generation endpoint.
       *
       * The only addition is testing_types.
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
            number_of_test_cases:
              count,
            testing_types:
              testingTypes,
          });

        const reviewItems: ReviewTestCase[] =
          generated.map(
            (testCase, index) => ({
              source_scenario_id:
                scenario.id,

              source_scenario_code:
                scenario.scenario_code,

              /*
               * Spread the complete new AI response.
               *
               * This preserves:
               * - testing_type
               * - execution_method
               * - description
               * - meta_attributes
               * - all existing fields
               */
              ...testCase,

              reviewId:
                `${scenario.id}-${testCase.testing_type}-${index}-${now}`,

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

          number_of_test_cases:
            count,

          testing_types:
            testingTypes,
        });

      const reviewItems: ReviewTestCase[] =
        response.results.flatMap(
          (result) =>
            result.test_cases.map(
              (testCase, index) => ({
                ...testCase,

                reviewId:
                  `${result.scenario_id}-${testCase.testing_type}-${index}-${now}`,

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
        error instanceof Error
          ? error.message
          : "Failed to generate test cases.",
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

  function updateMetaAttribute(
    reviewId: string,
    key: string,
    value: unknown,
  ) {
    setReviewTestCases((current) =>
      current.map((testCase) =>
        testCase.reviewId === reviewId
          ? {
              ...testCase,
              meta_attributes: {
                ...testCase.meta_attributes,
                [key]: value,
              },
            }
          : testCase,
      ),
    );
  }

  function readMetaString(
    metaAttributes: Record<string, unknown>,
    key: string,
    fallback = "",
  ) {
    const value = metaAttributes[key];

    if (value === undefined || value === null) {
      return fallback;
    }

    return String(value);
  }

  function readMetaJson(
    metaAttributes: Record<string, unknown>,
    key: string,
    fallback: unknown = {},
  ) {
    const value = metaAttributes[key];

    if (typeof value === "string") {
      return value;
    }

    return JSON.stringify(value ?? fallback, null, 2);
  }

  function renderTypeSpecificDefinition(
    testCase: ReviewTestCase,
  ) {
    const attrs = testCase.meta_attributes ?? {};

    const commonFieldSx = {
      ...fieldSx,
    };

    const setMeta = (key: string, value: unknown) => {
      updateMetaAttribute(testCase.reviewId, key, value);
    };

    switch (testCase.testing_type) {
      case "FUNCTIONAL":
        return (
          <>
            <TextField
              label="Environment"
              value={readMetaString(attrs, "environment")}
              onChange={(event) =>
                setMeta("environment", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Browser / OS"
              value={
                Array.isArray(attrs.browser_os)
                  ? attrs.browser_os.join(", ")
                  : readMetaString(attrs, "browser_os")
              }
              onChange={(event) =>
                setMeta(
                  "browser_os",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />
          </>
        );

      case "API":
        return (
          <>
            <TextField
              label="Endpoint URL"
              value={readMetaString(attrs, "endpoint_url")}
              onChange={(event) =>
                setMeta("endpoint_url", event.target.value)
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              select
              label="HTTP Method"
              value={readMetaString(attrs, "http_method", "GET")}
              onChange={(event) =>
                setMeta("http_method", event.target.value)
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            >
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map(
                (method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              label="Authentication"
              value={readMetaString(attrs, "authentication")}
              onChange={(event) =>
                setMeta("authentication", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Headers JSON"
              value={readMetaJson(attrs, "headers")}
              onChange={(event) =>
                setMeta("headers", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={commonFieldSx}
              helperText="JSON object"
            />

            <TextField
              label="Path Parameters JSON"
              value={readMetaJson(attrs, "path_parameters")}
              onChange={(event) =>
                setMeta("path_parameters", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Query Parameters JSON"
              value={readMetaJson(attrs, "query_parameters")}
              onChange={(event) =>
                setMeta("query_parameters", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Request Body JSON"
              value={readMetaJson(attrs, "request_body", null)}
              onChange={(event) =>
                setMeta("request_body", event.target.value)
              }
              fullWidth
              multiline
              minRows={4}
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Expected Status Code"
              type="number"
              value={readMetaString(
                attrs,
                "expected_status_code",
              )}
              onChange={(event) =>
                setMeta(
                  "expected_status_code",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Expected Response JSON"
              value={readMetaJson(
                attrs,
                "expected_response",
                null,
              )}
              onChange={(event) =>
                setMeta(
                  "expected_response",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={4}
              size="small"
              sx={{
                ...commonFieldSx,
                gridColumn: "1 / -1",
              }}
            />
          </>
        );

      case "DATABASE":
        return (
          <>
            <TextField
              label="Target Database"
              value={readMetaString(attrs, "target_database")}
              onChange={(event) =>
                setMeta("target_database", event.target.value)
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Schema Name"
              value={readMetaString(attrs, "schema_name")}
              onChange={(event) =>
                setMeta("schema_name", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Table Name"
              value={readMetaString(attrs, "table_name")}
              onChange={(event) =>
                setMeta("table_name", event.target.value)
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Prerequisite Action"
              value={readMetaString(
                attrs,
                "precondition_ui_action",
              )}
              onChange={(event) =>
                setMeta(
                  "precondition_ui_action",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Verification SQL"
              value={readMetaString(attrs, "verification_sql")}
              onChange={(event) =>
                setMeta("verification_sql", event.target.value)
              }
              fullWidth
              multiline
              minRows={5}
              size="small"
              required
              sx={{
                ...commonFieldSx,
                gridColumn: "1 / -1",
              }}
            />

            <TextField
              label="Expected Columns"
              value={
                Array.isArray(attrs.expected_columns)
                  ? attrs.expected_columns
                      .map((item) => {
                        const column =
                          item as Record<string, unknown>;

                        return `${String(
                          column.column ?? "",
                        )} = ${String(
                          column.expected_value ?? "",
                        )}`;
                      })
                      .join("\n")
                  : readMetaString(
                      attrs,
                      "expected_columns",
                    )
              }
              onChange={(event) =>
                setMeta(
                  "expected_columns",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={4}
              size="small"
              sx={{
                ...commonFieldSx,
                gridColumn: "1 / -1",
              }}
              helperText="One per line: column = expected value"
            />
          </>
        );

      case "PERFORMANCE":
        return (
          <>
            <TextField
              label="Performance Model"
              value={readMetaString(
                attrs,
                "performance_model",
              )}
              onChange={(event) =>
                setMeta(
                  "performance_model",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
              helperText="Load, Stress, Spike, Endurance/Soak, Volume or Scalability"
            />

            <TextField
              label="Tool"
              value={readMetaString(attrs, "tool")}
              onChange={(event) =>
                setMeta("tool", event.target.value)
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Virtual Users"
              type="number"
              value={readMetaString(
                attrs,
                "virtual_users",
                "0",
              )}
              onChange={(event) =>
                setMeta(
                  "virtual_users",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Arrival Rate"
              value={readMetaString(attrs, "arrival_rate")}
              onChange={(event) =>
                setMeta("arrival_rate", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Ramp-up (seconds)"
              type="number"
              value={readMetaString(
                attrs,
                "ramp_up_seconds",
                "0",
              )}
              onChange={(event) =>
                setMeta(
                  "ramp_up_seconds",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Duration (seconds)"
              type="number"
              value={readMetaString(
                attrs,
                "duration_seconds",
                "0",
              )}
              onChange={(event) =>
                setMeta(
                  "duration_seconds",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Target Endpoint / Operation"
              value={readMetaString(
                attrs,
                "target_endpoint",
              )}
              onChange={(event) =>
                setMeta(
                  "target_endpoint",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Workload Description"
              value={readMetaString(
                attrs,
                "workload_description",
              )}
              onChange={(event) =>
                setMeta(
                  "workload_description",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="SLA / Benchmark JSON"
              value={readMetaJson(attrs, "sla_benchmarks")}
              onChange={(event) =>
                setMeta(
                  "sla_benchmarks",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={{
                ...commonFieldSx,
                gridColumn: "1 / -1",
              }}
              helperText="Only enter thresholds supplied by the project/team."
            />
          </>
        );

      case "SECURITY":
        return (
          <>
            <TextField
              label="Vulnerability Category"
              value={readMetaString(
                attrs,
                "vulnerability_category",
              )}
              onChange={(event) =>
                setMeta(
                  "vulnerability_category",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Target Vector"
              value={readMetaString(
                attrs,
                "target_vector",
              )}
              onChange={(event) =>
                setMeta(
                  "target_vector",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Safe Representative Payload"
              value={readMetaString(
                attrs,
                "attack_payload",
              )}
              onChange={(event) =>
                setMeta(
                  "attack_payload",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Expected Defensive Behavior"
              value={readMetaString(
                attrs,
                "expected_defensive_behavior",
              )}
              onChange={(event) =>
                setMeta(
                  "expected_defensive_behavior",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Severity"
              value={readMetaString(attrs, "severity")}
              onChange={(event) =>
                setMeta("severity", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="CWE"
              value={readMetaString(attrs, "cwe")}
              onChange={(event) =>
                setMeta("cwe", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="CVE"
              value={readMetaString(attrs, "cve")}
              onChange={(event) =>
                setMeta("cve", event.target.value)
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />
          </>
        );

      case "ACCESSIBILITY": {
        const auditFlags =
          (attrs.audit_flags as Record<string, unknown>) ??
          {};

        const flags = [
          ["alt_text", "Alt text"],
          ["contrast_ratio", "Contrast"],
          ["tab_order", "Tab order"],
          ["keyboard_access", "Keyboard"],
          ["labels", "Labels"],
        ] as const;

        return (
          <>
            <TextField
              label="WCAG Clause"
              value={readMetaString(
                attrs,
                "wcag_clause",
              )}
              onChange={(event) =>
                setMeta(
                  "wcag_clause",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Assistive Technology"
              value={readMetaString(
                attrs,
                "assistive_technology",
              )}
              onChange={(event) =>
                setMeta(
                  "assistive_technology",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              required
              sx={commonFieldSx}
            />

            <TextField
              label="Page / Component"
              value={readMetaString(
                attrs,
                "page_component",
              )}
              onChange={(event) =>
                setMeta(
                  "page_component",
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              sx={commonFieldSx}
            />

            <TextField
              label="Expected Accessible Behavior"
              value={readMetaString(
                attrs,
                "expected_behavior",
              )}
              onChange={(event) =>
                setMeta(
                  "expected_behavior",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              size="small"
              sx={{
                ...commonFieldSx,
                gridColumn: "1 / -1",
              }}
            />

            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(5, 1fr)",
                },
                gap: 0.5,
                p: 1,
                border: "1px solid #e4e7ec",
                borderRadius: "9px",
                backgroundColor: "#fff",
              }}
            >
              {flags.map(([key, label]) => (
                <Box key={key}>
                  <Checkbox
                    size="small"
                    checked={auditFlags[key] === true}
                    onChange={(event) =>
                      setMeta("audit_flags", {
                        ...auditFlags,
                        [key]: event.target.checked,
                      })
                    }
                  />

                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.7rem",
                      color: "#344054",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        );
      }

      default:
        return null;
    }
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

        /*
         * Save the existing TestCase fields exactly
         * as before, plus the new Testing Studio profile.
         */
        await testCaseService.createTestCase({
          scenario_id:
            testCase.source_scenario_id,

          module:
            scenario.module,

          priority:
            testCase.priority,

          status: "Draft",

          automation_eligibility:
            "Eligible",

          automation_status:
            "Not Automated",

          title:
            testCase.title,

          description:
            testCase.description || null,

          preconditions:
            testCase.preconditions,

          test_data:
            testCase.test_data,

          steps:
            testCase.steps,

          expected_result:
            testCase.expected_result,

          /*
           * New Testing Studio profile.
           */
          profile: {
            testing_type:
              testCase.testing_type,

            execution_method:
              testCase.execution_method,

            meta_attributes:
              testCase.meta_attributes,
          },
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
        error instanceof Error
          ? error.message
          : "Failed to save generated test cases.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Group generated cases by source scenario.
   *
   * Testing type remains visible inside each case,
   * so one scenario can contain Functional + API +
   * Database etc. without losing traceability.
   */
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
                Generate structured,
                discipline-specific
                test cases while
                keeping the selected
                scenario as the
                authoritative scope.
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
                    color: "#344054",
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
                    color: "#667085",
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

            {/* ====================================================
                TESTING TYPES
                ==================================================== */}
            <Box
              sx={{
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
                  color: "#344054",
                }}
              >
                Testing Types
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                }}
              >
                {TESTING_TYPES.map(
                  (item) => {
                    const selected =
                      testingTypes.includes(
                        item.value,
                      );

                    return (
                      <Chip
                        key={
                          item.value
                        }
                        label={
                          item.label
                        }
                        variant={
                          selected
                            ? "filled"
                            : "outlined"
                        }
                        color={
                          selected
                            ? "primary"
                            : "default"
                        }
                        onClick={() =>
                          toggleTestingType(
                            item.value,
                          )
                        }
                        sx={{
                          fontSize:
                            "0.72rem",
                          fontWeight: 650,
                        }}
                      />
                    );
                  },
                )}
              </Box>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize:
                    "0.68rem",
                  color: "#667085",
                }}
              >
                Select one or more
                disciplines. Each
                selected discipline
                is generated independently
                to preserve test-design
                purity. Automation is
                an execution method,
                not a testing discipline.
              </Typography>
            </Box>

            {/* ====================================================
                ADDITIONAL INSTRUCTIONS
                ==================================================== */}
            <TextField
              label="Additional Instructions"
              value={
                manualDescription
              }
              onChange={(event) =>
                setManualDescription(
                  event.target.value,
                )
              }
              multiline
              minRows={3}
              fullWidth
              sx={fieldSx}
              placeholder="Optional guidance for the AI. The selected scenarios remain the authoritative scope."
            />

            {/* ====================================================
                GENERATION SETTINGS
                ==================================================== */}
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
                  color: "#344054",
                }}
              >
                Generation Settings
              </Typography>

              <TextField
                select
                label="Maximum Test Cases per Scenario and Type"
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
          /* ======================================================
             REVIEW MODE
             ====================================================== */
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
                    color: "#101828",
                  }}
                >
                  Review before saving
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize:
                      "0.72rem",
                    color: "#667085",
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
                              {/* --------------------------------
                                  TESTING TYPE + EXECUTION METHOD
                                  -------------------------------- */}
                              <Box
                                sx={{
                                  display:
                                    "flex",
                                  gap: 0.75,
                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                <Chip
                                  label={typeLabel(
                                    testCase.testing_type,
                                  )}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />

                                <Chip
                                  label={
                                    testCase.execution_method
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>

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
                                label="Description"
                                value={
                                  testCase.description ??
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateTestCase(
                                    testCase.reviewId,
                                    "description",
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

                              {/* --------------------------------
                                  TYPE-SPECIFIC DEFINITION
                                  -------------------------------- */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                  mt: 0.5,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                    color: "#475467",
                                  }}
                                >
                                  {typeLabel(testCase.testing_type)} Test Definition
                                </Typography>
                                
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                      xs: "1fr",
                                      sm: "1fr 1fr",
                                    },
                                    gap: 1.25,
                                    p: 1.25,
                                    border: "1px solid #e4e7ec",
                                    borderRadius: "9px",
                                    backgroundColor: "#f8fafc",
                                  }}
                                >
                                  {renderTypeSpecificDefinition(testCase)}
                                </Box>
                              </Box>
                            </Box>

                            {/* --------------------------------
                                EXISTING REMOVE UX PRESERVED
                                -------------------------------- */}
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
                  0 ||
                testingTypes.length ===
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