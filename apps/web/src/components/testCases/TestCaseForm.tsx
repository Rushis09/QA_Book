import { useMemo } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { TestScenario } from "../../types/testScenario";
import type { Requirement } from "../../types/requirement";
import type {
  ExecutionMethod,
  TestingType,
} from "../../types/testCase";
import type { TestCaseFormData } from "../../types/testCaseForm";

interface TestCaseFormProps {
  value: TestCaseFormData;
  requirements: Requirement[];
  scenarios: TestScenario[];
  error: boolean;
  onChange: (value: TestCaseFormData) => void;
}

const TESTING_TYPES: Array<{
  value: TestingType;
  label: string;
}> = [
  { value: "FUNCTIONAL", label: "Functional" },
  { value: "API", label: "API" },
  { value: "DATABASE", label: "Database" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "SECURITY", label: "Security" },
  { value: "ACCESSIBILITY", label: "Accessibility" },
];

const EXECUTION_METHODS: Array<{
  value: ExecutionMethod;
  label: string;
}> = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATED", label: "Automated" },
  { value: "EXTERNAL", label: "External" },
  { value: "IMPORTED", label: "Imported" },
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
  "& .MuiFormHelperText-root": {
    fontSize: "0.7rem",
    marginLeft: 0,
  },
};

const readOnlyFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    backgroundColor: "#f8fafc",
  },
};

const sectionSx = {
  p: 1.75,
  border: "1px solid #e4e7ec",
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
};

function labelForType(type: TestingType) {
  return TESTING_TYPES.find((item) => item.value === type)?.label ?? type;
}

function readString(
  attrs: Record<string, unknown>,
  key: string,
  fallback = "",
) {
  const current = attrs[key];

  return current === undefined || current === null
    ? fallback
    : String(current);
}

function readBoolean(attrs: Record<string, unknown>, key: string) {
  return attrs[key] === true;
}

export default function TestCaseForm({
  value,
  requirements,
  scenarios,
  error,
  onChange,
}: TestCaseFormProps) {
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === value.scenario_id,
  );

  const selectedRequirementId =
    selectedScenario?.requirement_id ??
    (value.scenario_id
      ? scenarios.find((scenario) => scenario.id === value.scenario_id)
          ?.requirement_id
      : undefined);

  const filteredScenarios = useMemo(() => {
    if (!selectedRequirementId) {
      return scenarios;
    }

    return scenarios.filter(
      (scenario) => scenario.requirement_id === selectedRequirementId,
    );
  }, [scenarios, selectedRequirementId]);

  const selectedRequirement = requirements.find(
    (requirement) => requirement.id === selectedRequirementId,
  );

  const attrs = value.meta_attributes;

  const jsonText = useMemo(
    () => (key: string, fallback: unknown = {}) => {
      const current = attrs[key];

      if (typeof current === "string") {
        return current;
      }

      return JSON.stringify(current ?? fallback, null, 2);
    },
    [attrs],
  );

  function setField<K extends keyof TestCaseFormData>(
    key: K,
    fieldValue: TestCaseFormData[K],
  ) {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  }

  function setMeta(key: string, metaValue: unknown) {
    onChange({
      ...value,
      meta_attributes: {
        ...value.meta_attributes,
        [key]: metaValue,
      },
    });
  }

  function handleRequirementChange(requirementId: number) {
    if (!requirementId) {
      onChange({
        ...value,
        scenario_id: 0,
        module: "",
      });
      return;
    }

    const requirementScenarios = scenarios.filter(
      (scenario) => scenario.requirement_id === requirementId,
    );

    const currentScenarioStillValid = requirementScenarios.some(
      (scenario) => scenario.id === value.scenario_id,
    );

    if (currentScenarioStillValid) {
      const currentScenario = requirementScenarios.find(
        (scenario) => scenario.id === value.scenario_id,
      );

      onChange({
        ...value,
        scenario_id: currentScenario?.id ?? value.scenario_id,
        module: currentScenario?.module ?? value.module,
      });

      return;
    }

    onChange({
      ...value,
      scenario_id: 0,
      module: "",
    });
  }

  function handleScenarioChange(scenarioId: number) {
    if (!scenarioId) {
      onChange({
        ...value,
        scenario_id: 0,
        module: "",
      });
      return;
    }

    const scenario = scenarios.find(
      (item) => item.id === scenarioId,
    );

    if (!scenario) {
      onChange({
        ...value,
        scenario_id: scenarioId,
      });
      return;
    }

    onChange({
      ...value,
      scenario_id: scenario.id,
      module: scenario.module,
    });
  }

  function renderTypeSpecificFields() {
    switch (value.testing_type) {
      case "FUNCTIONAL":
        return (
          <>
            <TextField
              label="Environment"
              value={readString(attrs, "environment")}
              onChange={(event) =>
                setMeta("environment", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Browser / OS"
              value={
                Array.isArray(attrs.browser_os)
                  ? attrs.browser_os.join(", ")
                  : readString(attrs, "browser_os")
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
              sx={fieldSx}
            />

            <Box
              sx={{
                gridColumn: "1 / -1",
                p: 1.5,
                border: "1px solid #e4e7ec",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <Typography
                sx={{
                  mb: 0.75,
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                Steps
              </Typography>

              <TextField
                value={value.steps}
                onChange={(event) =>
                  setField("steps", event.target.value)
                }
                fullWidth
                multiline
                minRows={6}
                placeholder={
                  "1. Enter username\n2. Enter password\n3. Click Login\n4. Verify dashboard"
                }
                sx={fieldSx}
                helperText="One executable action per line."
              />
            </Box>
          </>
        );

      case "API":
        return (
          <>
            <TextField
              label="Endpoint URL"
              value={readString(attrs, "endpoint_url")}
              onChange={(event) =>
                setMeta("endpoint_url", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              select
              label="HTTP Method"
              value={readString(attrs, "http_method", "GET")}
              onChange={(event) =>
                setMeta("http_method", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
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
              value={readString(attrs, "authentication")}
              onChange={(event) =>
                setMeta("authentication", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Headers JSON"
              value={jsonText("headers")}
              onChange={(event) =>
                setMeta("headers", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              sx={fieldSx}
              helperText='Enter a JSON object. Example: {"Content-Type": "application/json"}'
            />

            <TextField
              label="Path Parameters JSON"
              value={jsonText("path_parameters")}
              onChange={(event) =>
                setMeta("path_parameters", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <TextField
              label="Query Parameters JSON"
              value={jsonText("query_parameters")}
              onChange={(event) =>
                setMeta("query_parameters", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <TextField
              label="Request Body JSON"
              value={jsonText("request_body", null)}
              onChange={(event) =>
                setMeta("request_body", event.target.value)
              }
              fullWidth
              multiline
              minRows={4}
              sx={fieldSx}
            />

            <TextField
              label="Expected Status Code"
              type="number"
              value={readString(attrs, "expected_status_code")}
              onChange={(event) =>
                setMeta("expected_status_code", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Expected Response JSON"
              value={jsonText("expected_response", null)}
              onChange={(event) =>
                setMeta("expected_response", event.target.value)
              }
              fullWidth
              multiline
              minRows={4}
              sx={{ ...fieldSx, gridColumn: "1 / -1" }}
            />
          </>
        );

      case "DATABASE":
        return (
          <>
            <TextField
              label="Target Database"
              value={readString(attrs, "target_database")}
              onChange={(event) =>
                setMeta("target_database", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Schema Name"
              value={readString(attrs, "schema_name")}
              onChange={(event) =>
                setMeta("schema_name", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Table Name"
              value={readString(attrs, "table_name")}
              onChange={(event) =>
                setMeta("table_name", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Prerequisite Action"
              value={readString(attrs, "precondition_ui_action")}
              onChange={(event) =>
                setMeta(
                  "precondition_ui_action",
                  event.target.value,
                )
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Verification SQL"
              value={readString(attrs, "verification_sql")}
              onChange={(event) =>
                setMeta("verification_sql", event.target.value)
              }
              fullWidth
              required
              multiline
              minRows={5}
              sx={{
                ...fieldSx,
                gridColumn: "1 / -1",
              }}
            />

            <TextField
              label="Expected Columns"
              value={
                Array.isArray(attrs.expected_columns)
                  ? attrs.expected_columns
                      .map(
                        (item) =>
                          `${String(
                            (item as Record<string, unknown>)
                              .column ?? "",
                          )} = ${String(
                            (item as Record<string, unknown>)
                              .expected_value ?? "",
                          )}`,
                      )
                      .join("\n")
                  : readString(attrs, "expected_columns")
              }
              onChange={(event) =>
                setMeta("expected_columns", event.target.value)
              }
              fullWidth
              multiline
              minRows={4}
              sx={{
                ...fieldSx,
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
              value={readString(attrs, "performance_model")}
              onChange={(event) =>
                setMeta("performance_model", event.target.value)
              }
              fullWidth
              sx={fieldSx}
              helperText="Load, Stress, Spike, Endurance/Soak, Volume or Scalability"
            />

            <TextField
              label="Tool"
              value={readString(attrs, "tool")}
              onChange={(event) =>
                setMeta("tool", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Virtual Users"
              type="number"
              value={readString(attrs, "virtual_users", "0")}
              onChange={(event) =>
                setMeta("virtual_users", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Arrival Rate"
              value={readString(attrs, "arrival_rate")}
              onChange={(event) =>
                setMeta("arrival_rate", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Ramp-up (seconds)"
              type="number"
              value={readString(attrs, "ramp_up_seconds", "0")}
              onChange={(event) =>
                setMeta("ramp_up_seconds", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Duration (seconds)"
              type="number"
              value={readString(attrs, "duration_seconds", "0")}
              onChange={(event) =>
                setMeta("duration_seconds", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Target Endpoint / Operation"
              value={readString(attrs, "target_endpoint")}
              onChange={(event) =>
                setMeta("target_endpoint", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Workload Description"
              value={readString(attrs, "workload_description")}
              onChange={(event) =>
                setMeta(
                  "workload_description",
                  event.target.value,
                )
              }
              fullWidth
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <TextField
              label="SLA / Benchmark JSON"
              value={jsonText("sla_benchmarks")}
              onChange={(event) =>
                setMeta("sla_benchmarks", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              sx={{
                ...fieldSx,
                gridColumn: "1 / -1",
              }}
              helperText="Only enter thresholds supplied by the project/team. Do not invent them."
            />
          </>
        );

      case "SECURITY":
        return (
          <>
            <TextField
              label="Vulnerability Category"
              value={readString(
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
              required
              sx={fieldSx}
            />

            <TextField
              label="Target Vector"
              value={readString(attrs, "target_vector")}
              onChange={(event) =>
                setMeta("target_vector", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Safe Representative Payload"
              value={readString(attrs, "attack_payload")}
              onChange={(event) =>
                setMeta("attack_payload", event.target.value)
              }
              fullWidth
              required
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <TextField
              label="Expected Defensive Behavior"
              value={readString(
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
              sx={fieldSx}
            />

            <TextField
              label="Severity"
              value={readString(attrs, "severity")}
              onChange={(event) =>
                setMeta("severity", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="CWE"
              value={readString(attrs, "cwe")}
              onChange={(event) =>
                setMeta("cwe", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="CVE"
              value={readString(attrs, "cve")}
              onChange={(event) =>
                setMeta("cve", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />
          </>
        );

      case "ACCESSIBILITY":
        return (
          <>
            <TextField
              label="WCAG Clause"
              value={readString(attrs, "wcag_clause")}
              onChange={(event) =>
                setMeta("wcag_clause", event.target.value)
              }
              fullWidth
              required
              sx={fieldSx}
            />

            <TextField
              label="Assistive Technology"
              value={readString(
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
              required
              sx={fieldSx}
            />

            <TextField
              label="Page / Component"
              value={readString(attrs, "page_component")}
              onChange={(event) =>
                setMeta("page_component", event.target.value)
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Expected Accessible Behavior"
              value={readString(attrs, "expected_behavior")}
              onChange={(event) =>
                setMeta("expected_behavior", event.target.value)
              }
              fullWidth
              multiline
              minRows={3}
              sx={{
                ...fieldSx,
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
              {[
                ["alt_text", "Alt text"],
                ["contrast_ratio", "Contrast"],
                ["tab_order", "Tab order"],
                ["keyboard_access", "Keyboard"],
                ["labels", "Labels"],
              ].map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      size="small"
                      checked={readBoolean(
                        (attrs.audit_flags as Record<
                          string,
                          unknown
                        >) || {},
                        key,
                      )}
                      onChange={(event) =>
                        setMeta("audit_flags", {
                          ...((attrs.audit_flags as Record<
                            string,
                            unknown
                          >) || {}),
                          [key]: event.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                      }}
                    >
                      {label}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </>
        );
    }
  }

  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography
        sx={{
          mb: 1.5,
          fontSize: "0.86rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        Test Case Details
      </Typography>

      {/* ------------------------------------------------------- */}
      {/* Requirement / Scenario Selection                        */}
      {/* ------------------------------------------------------- */}

      <Box sx={sectionSx}>
        <Typography
          sx={{
            mb: 1.25,
            fontSize: "0.78rem",
            fontWeight: 750,
            color: "#344054",
          }}
        >
          Traceability
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.5,
          }}
        >
          <TextField
            select
            label="Requirement"
            value={
              selectedRequirementId
                ? String(selectedRequirementId)
                : ""
            }
            onChange={(event) =>
              handleRequirementChange(
                Number(event.target.value),
              )
            }
            fullWidth
            required
            sx={fieldSx}
          >
            <MenuItem value="">
              Select Requirement
            </MenuItem>

            {requirements.map((requirement) => (
              <MenuItem
                key={requirement.id}
                value={String(requirement.id)}
              >
                {requirement.requirement_code} -{" "}
                {requirement.module ||
                  requirement.description ||
                  `Requirement ${requirement.id}`}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Test Scenario"
            value={
              value.scenario_id
                ? String(value.scenario_id)
                : ""
            }
            onChange={(event) =>
              handleScenarioChange(
                Number(event.target.value),
              )
            }
            fullWidth
            required
            sx={fieldSx}
          >
            <MenuItem value="">
              Select Test Scenario
            </MenuItem>

            {filteredScenarios.map((scenario) => (
              <MenuItem
                key={scenario.id}
                value={String(scenario.id)}
              >
                {scenario.scenario_code} -{" "}
                {scenario.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Module"
            value={
              selectedScenario?.module ??
              selectedRequirement?.module ??
              value.module
            }
            fullWidth
            sx={readOnlyFieldSx}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Box>
      </Box>

      {/* ------------------------------------------------------- */}
      {/* Core Test Case Information                              */}
      {/* ------------------------------------------------------- */}

      <Box sx={{ ...sectionSx, mt: 1.5 }}>
        <Typography
          sx={{
            mb: 1.25,
            fontSize: "0.78rem",
            fontWeight: 750,
            color: "#344054",
          }}
        >
          Test Case Information
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.5,
          }}
        >
          <TextField
            select
            label="Testing Type"
            value={value.testing_type}
            onChange={(event) => {
              const nextType =
                event.target.value as TestingType;

              onChange({
                ...value,
                testing_type: nextType,
                meta_attributes: {},
              });
            }}
            fullWidth
            required
            sx={fieldSx}
          >
            {TESTING_TYPES.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Execution Method"
            value={value.execution_method}
            onChange={(event) =>
              setField(
                "execution_method",
                event.target.value as ExecutionMethod,
              )
            }
            fullWidth
            required
            sx={fieldSx}
          >
            {EXECUTION_METHODS.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            value={value.priority}
            onChange={(event) =>
              setField("priority", event.target.value)
            }
            fullWidth
            required
            sx={fieldSx}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={value.status}
            onChange={(event) =>
              setField("status", event.target.value)
            }
            fullWidth
            required
            sx={fieldSx}
          >
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Ready">Ready</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
          </TextField>

          <TextField
            label="Title"
            value={value.title}
            onChange={(event) =>
              setField("title", event.target.value)
            }
            fullWidth
            required
            error={error}
            helperText={
              error ? "Title is required." : ""
            }
            sx={{
              ...fieldSx,
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
              },
            }}
          />

          <TextField
            select
            label="Automation Eligibility"
            value={value.automation_eligibility}
            onChange={(event) =>
              setField(
                "automation_eligibility",
                event.target.value,
              )
            }
            fullWidth
            required
            sx={fieldSx}
          >
            <MenuItem value="Eligible">
              Eligible
            </MenuItem>
            <MenuItem value="Not Suitable">
              Not Suitable
            </MenuItem>
          </TextField>

          <TextField
            label="Automation Status"
            value={value.automation_status}
            fullWidth
            sx={readOnlyFieldSx}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Box>
      </Box>

      {/* ------------------------------------------------------- */}
      {/* Test Definition                                        */}
      {/* ------------------------------------------------------- */}

      <Typography
        sx={{
          mt: 2.5,
          mb: 1.25,
          fontSize: "0.82rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        {labelForType(value.testing_type)} Definition
      </Typography>

      <Box sx={sectionSx}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.5,
          }}
        >
          <TextField
            label="Description"
            value={value.description}
            onChange={(event) =>
              setField("description", event.target.value)
            }
            fullWidth
            multiline
            minRows={3}
            sx={{
              ...fieldSx,
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
              },
            }}
          />

          <TextField
            label="Preconditions"
            value={value.preconditions}
            onChange={(event) =>
              setField(
                "preconditions",
                event.target.value,
              )
            }
            fullWidth
            multiline
            minRows={3}
            sx={fieldSx}
          />

          <TextField
            label="Test Data"
            value={value.test_data}
            onChange={(event) =>
              setField("test_data", event.target.value)
            }
            fullWidth
            multiline
            minRows={3}
            sx={fieldSx}
          />

          <Box
            sx={{
              gridColumn: "1 / -1",
              p: 1.5,
              border: "1px solid #e4e7ec",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              sx={{
                mb: 0.75,
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              Steps
            </Typography>

            <TextField
              value={value.steps}
              onChange={(event) =>
                setField("steps", event.target.value)
              }
              fullWidth
              multiline
              minRows={7}
              placeholder={
                "1. Open the application\n2. Enter test data\n3. Perform the action\n4. Verify the result"
              }
              sx={fieldSx}
              helperText={
                value.testing_type === "FUNCTIONAL"
                  ? "One executable action per line."
                  : "Legacy-compatible execution summary."
              }
            />
          </Box>

          <TextField
            label="Expected Result"
            value={value.expected_result}
            onChange={(event) =>
              setField(
                "expected_result",
                event.target.value,
              )
            }
            fullWidth
            multiline
            minRows={4}
            sx={{
              ...fieldSx,
              gridColumn: {
                xs: "auto",
                sm: "1 / -1",
              },
            }}
          />
        </Box>
      </Box>

      {/* ------------------------------------------------------- */}
      {/* Type Specific Definition                               */}
      {/* ------------------------------------------------------- */}

      <Box
        sx={{
          mt: 1.5,
          ...sectionSx,
        }}
      >
        <Typography
          sx={{
            mb: 1,
            fontSize: "0.74rem",
            fontWeight: 700,
            color: "#475467",
          }}
        >
          {labelForType(value.testing_type)} Test Definition
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.5,
          }}
        >
          {renderTypeSpecificFields()}
        </Box>
      </Box>
    </Box>
  );
}