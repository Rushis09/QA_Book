import {
  Box,
  Chip,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  BUG_PRIORITIES,
  BUG_RESOLUTIONS,
  BUG_SEVERITIES,
  BUG_STATUSES,
} from "../../constants/bugConstants";

import type { TestExecution } from "../../types/testExecution";
import type { BugFormData } from "../../types/bugForm";

interface BugFormProps {
  value: BugFormData;
  executions: TestExecution[];
  error: {
    execution: boolean;
    title: boolean;
  };
  executionLocked?: boolean;
  onChange: (
    value: BugFormData,
  ) => void;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "0.74rem",
  },

  "& .MuiInputLabel-root": {
    fontSize: "0.72rem",
  },

  "& .MuiFormHelperText-root": {
    fontSize: "0.65rem",
    marginLeft: 0,
    marginTop: "4px",
  },

  "& .MuiSelect-select": {
    fontSize: "0.74rem",
  },
};

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Box sx={{ mb: 0.85 }}>
      <Typography
        sx={{
          fontSize: "0.61rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.055em",
        }}
      >
        {eyebrow}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: "0.86rem",
          fontWeight: 800,
          color: "#101828",
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            mt: 0.2,
            fontSize: "0.66rem",
            color: "#667085",
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1.1,
        py: 0.9,
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border: "1px solid #eaecf0",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.58rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.69rem",
          lineHeight: 1.45,
          color: "#344054",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value || "Not specified"}
      </Typography>
    </Box>
  );
}

function ContextBlock({
  label,
  value,
  fullWidth = false,
  steps = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
  steps?: boolean;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth
          ? "1 / -1"
          : undefined,
        px: 1.15,
        py: 0.95,
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        border: "1px solid #eaecf0",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.59rem",
          fontWeight: 800,
          color: "#667085",
          textTransform: "uppercase",
          letterSpacing: "0.045em",
          mb: 0.45,
        }}
      >
        {label}
      </Typography>

      <Typography
        component="div"
        sx={{
          fontSize: "0.69rem",
          lineHeight: 1.55,
          color: "#344054",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...(steps && {
            "&::first-line": {
              fontWeight: 500,
            },
          }),
        }}
      >
        {value || "Not specified"}
      </Typography>
    </Box>
  );
}

function statusChipSx(status: string) {
  switch (status) {
    case "Failed":
      return {
        color: "#b42318",
        backgroundColor: "#fef3f2",
        borderColor: "#fecdca",
      };

    case "Passed":
      return {
        color: "#067647",
        backgroundColor: "#ecfdf3",
        borderColor: "#abefc6",
      };

    case "Blocked":
      return {
        color: "#b54708",
        backgroundColor: "#fffaeb",
        borderColor: "#fedf89",
      };

    default:
      return {
        color: "#475467",
        backgroundColor: "#f2f4f7",
        borderColor: "#e4e7ec",
      };
  }
}

export default function BugForm({
  value,
  executions,
  error,
  executionLocked = false,
  onChange,
}: BugFormProps) {
  const selectedExecution =
    executions.find(
      (execution) =>
        execution.id === value.execution_id,
    ) ?? null;

  const executionStatusStyles =
    selectedExecution
      ? statusChipSx(selectedExecution.status)
      : statusChipSx("");

  return (
    <Box
      sx={{
        pt: 0.25,
        pb: 0.5,
      }}
    >
      {/* =====================================================
          EXECUTION CONTEXT
      ====================================================== */}
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          eyebrow="Traceability"
          title="Execution Context"
          description="Link this defect to the execution that exposed the issue."
        />

        {!selectedExecution ? (
          <TextField
            select
            label="Test Execution"
            value={value.execution_id}
            onChange={(event) =>
              onChange({
                ...value,
                execution_id: Number(
                  event.target.value,
                ),
              })
            }
            fullWidth
            required
            disabled={executionLocked}
            error={error.execution}
            helperText={
              error.execution
                ? "Test Execution is required."
                : ""
            }
            sx={fieldSx}
          >
            {executions.map((execution) => (
              <MenuItem
                key={execution.id}
                value={execution.id}
              >
                {`${execution.test_run.run_code} · ${execution.test_case.test_case_code} · ${execution.test_case.title}`}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              p: 1.15,
              borderRadius: "9px",
              borderColor: "#d0d5dd",
              backgroundColor: "#fcfdff",
              boxShadow:
                "0 1px 2px rgba(16,24,40,0.03)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#101828",
                    }}
                  >
                    {
                      selectedExecution
                        .test_case
                        .test_case_code
                    }
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "#98a2b3",
                    }}
                  >
                    /
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 650,
                      color: "#344054",
                    }}
                  >
                    {
                      selectedExecution
                        .test_case.title
                    }
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: "0.66rem",
                    color: "#667085",
                  }}
                >
                  {
                    selectedExecution
                      .test_run.run_code
                  }
                  {" · "}
                  {
                    selectedExecution
                      .test_run.name
                  }
                </Typography>
              </Box>

              <Chip
                label={selectedExecution.status}
                size="small"
                sx={{
                  height: 23,
                  borderRadius: "6px",
                  fontSize: "0.62rem",
                  fontWeight: 750,
                  color:
                    executionStatusStyles.color,
                  backgroundColor:
                    executionStatusStyles.backgroundColor,
                  border: `1px solid ${executionStatusStyles.borderColor}`,
                }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 0.7,
              }}
            >
              <DetailCard
                label="Execution"
                value={`#${selectedExecution.id}`}
              />

              <DetailCard
                label="Test Case Priority"
                value={
                  selectedExecution.test_case
                    .priority
                }
              />

              <DetailCard
                label="Execution Result"
                value={
                  selectedExecution.status
                }
              />
            </Box>
          </Paper>
        )}
      </Box>

      {/* =====================================================
          TEST CASE CONTEXT
      ====================================================== */}
      {selectedExecution && (
        <Box sx={{ mb: 2 }}>
          <SectionHeader
            eyebrow="Reference"
            title="Test Case Context"
            description="Review the source test case before documenting the defect."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) minmax(0, 1fr)",
              },
              gap: 0.8,
            }}
          >
            <ContextBlock
              label="Preconditions"
              value={
                selectedExecution.test_case
                  .preconditions || ""
              }
            />

            <ContextBlock
              label="Expected Result"
              value={
                selectedExecution.test_case
                  .expected_result || ""
              }
            />

            <ContextBlock
              label="Test Steps"
              value={
                selectedExecution.test_case.steps ||
                ""
              }
              fullWidth
              steps
            />
          </Box>
        </Box>
      )}

      <Divider
        sx={{
          mb: 2,
          borderColor: "#eaecf0",
        }}
      />

      {/* =====================================================
          BUG SUMMARY
      ====================================================== */}
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          eyebrow="Issue"
          title="Bug Summary"
          description="Describe the defect clearly enough for another team member to understand the problem."
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <TextField
            label="Bug Title"
            placeholder="Example: Login button remains disabled after valid credentials"
            value={value.title}
            onChange={(event) =>
              onChange({
                ...value,
                title: event.target.value,
              })
            }
            required
            error={error.title}
            helperText={
              error.title
                ? "Bug title is required."
                : "Use a short, specific description of the problem."
            }
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Description"
            placeholder="Describe the problem, impact, and any useful context."
            value={value.description ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                description: event.target.value,
              })
            }
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            sx={fieldSx}
          />
        </Box>
      </Box>

      {/* =====================================================
          DETAILS + OWNERSHIP
      ====================================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.5fr) minmax(260px, 0.85fr)",
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <SectionHeader
            eyebrow="Classification"
            title="Defect Details"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            <TextField
              select
              label="Severity"
              value={value.severity}
              onChange={(event) =>
                onChange({
                  ...value,
                  severity: event.target.value,
                })
              }
              fullWidth
              sx={fieldSx}
            >
              {BUG_SEVERITIES.map((severity) => (
                <MenuItem
                  key={severity}
                  value={severity}
                >
                  {severity}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              value={value.priority}
              onChange={(event) =>
                onChange({
                  ...value,
                  priority: event.target.value,
                })
              }
              fullWidth
              sx={fieldSx}
            >
              {BUG_PRIORITIES.map((priority) => (
                <MenuItem
                  key={priority}
                  value={priority}
                >
                  {priority}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={value.status}
              onChange={(event) => {
                const status =
                  event.target.value;

                onChange({
                  ...value,
                  status,
                  resolution:
                    status === "Closed"
                      ? value.resolution
                      : null,
                });
              }}
              fullWidth
              sx={fieldSx}
            >
              {BUG_STATUSES.map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                >
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Resolution"
              value={value.resolution ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  resolution:
                    event.target.value || null,
                })
              }
              disabled={value.status !== "Closed"}
              required={value.status === "Closed"}
              fullWidth
              sx={fieldSx}
            >
              <MenuItem value="">
                No Resolution
              </MenuItem>

              {BUG_RESOLUTIONS.map((resolution) => (
                <MenuItem
                  key={resolution}
                  value={resolution}
                >
                  {resolution}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Box>
          <SectionHeader
            eyebrow="Ownership"
            title="People"
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <TextField
              label="Assigned To"
              placeholder="Team member"
              value={value.assigned_to ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  assigned_to:
                    event.target.value,
                })
              }
              fullWidth
              sx={fieldSx}
            />

            <TextField
              label="Reported By"
              placeholder="Reporter"
              value={value.reported_by ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  reported_by:
                    event.target.value,
                })
              }
              fullWidth
              sx={fieldSx}
            />
          </Box>
        </Box>
      </Box>

      <Divider
        sx={{
          mb: 2,
          borderColor: "#eaecf0",
        }}
      />

      {/* =====================================================
          REPRODUCTION
      ====================================================== */}
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          eyebrow="Investigation"
          title="Reproduction"
          description="Provide enough information for the issue to be reproduced consistently."
        />

        <TextField
          label="Steps to Reproduce"
          placeholder={
            "1. Open the application\n2. Navigate to ...\n3. Enter ...\n4. Observe ..."
          }
          value={value.steps_to_reproduce ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              steps_to_reproduce:
                event.target.value,
            })
          }
          multiline
          minRows={4}
          maxRows={8}
          fullWidth
          sx={fieldSx}
        />
      </Box>

      {/* =====================================================
          RESULT
      ====================================================== */}
      <Box sx={{ mb: 2 }}>
        <SectionHeader
          eyebrow="Evidence"
          title="Actual Result"
          description="Capture what happened instead of the expected behavior."
        />

        <TextField
          placeholder="Describe the observed result, error, or unexpected behavior."
          value={value.actual_result ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              actual_result:
                event.target.value,
            })
          }
          multiline
          minRows={4}
          maxRows={8}
          fullWidth
          sx={{
            ...fieldSx,
            "& .MuiOutlinedInput-root": {
              ...fieldSx[
                "& .MuiOutlinedInput-root"
              ],
              backgroundColor: "#fffafa",
            },
          }}
        />
      </Box>

      {/* =====================================================
          ENVIRONMENT
      ====================================================== */}
      <Box>
        <SectionHeader
          eyebrow="Context"
          title="Environment"
          description="Identify where the defect was observed."
        />

        <TextField
          label="Environment"
          placeholder="Example: QA / Chrome 140 / Windows 11"
          value={value.environment ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              environment:
                event.target.value,
            })
          }
          fullWidth
          sx={fieldSx}
        />
      </Box>
    </Box>
  );
}