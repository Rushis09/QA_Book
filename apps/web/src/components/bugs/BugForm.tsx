import {
  Box,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  BUG_PRIORITIES,
  BUG_RESOLUTIONS,
  BUG_SEVERITIES,
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

const BUG_STATUS_TRANSITIONS: Record<string, string[]> = {
  Open: ["Open", "Triaged"],
  Triaged: ["Triaged", "In Progress", "Closed"],
  "In Progress": ["In Progress", "Fixed"],
  Fixed: ["Fixed", "Ready for QA"],
  "Ready for QA": ["Ready for QA", "Retesting"],
  Retesting: ["Retesting", "Closed", "Reopened"],
  Reopened: ["Reopened", "In Progress"],
  Closed: ["Closed", "Reopened"],
};

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
    
  const availableStatuses =
    BUG_STATUS_TRANSITIONS[value.status] ??
    [value.status];

  return (
    <Stack spacing={3} sx={{ pt: 1 }}>
      {/* =====================================================
          EXECUTION / TRACEABILITY
      ====================================================== */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Execution Context
        </Typography>

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
            sx={{ mt: 1 }}
          >
            {executions.map((execution) => (
              <MenuItem
                key={execution.id}
                value={execution.id}
              >
                {`${execution.test_run.run_code} | ${execution.test_case.test_case_code} | ${execution.test_case.title}`}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor:
                "background.default",
            }}
          >
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {
                      selectedExecution.test_case
                        .test_case_code
                    }
                    {" — "}
                    {
                      selectedExecution.test_case
                        .title
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      selectedExecution.test_run
                        .run_code
                    }
                    {" — "}
                    {
                      selectedExecution.test_run
                        .name
                    }
                  </Typography>
                </Box>

                <Chip
                  label={
                    selectedExecution.status
                  }
                  color={
                    selectedExecution.status ===
                    "Failed"
                      ? "error"
                      : "default"
                  }
                  size="small"
                />
              </Box>

              <Divider />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={{
                  xs: 1,
                  sm: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Execution
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    #{selectedExecution.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Test Case Priority
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {
                      selectedExecution.test_case
                        .priority
                    }
                  </Typography>
                </Box>

                
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>

      {/* =====================================================
          TEST CASE REFERENCE
      ====================================================== */}
      {selectedExecution && (
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Test Case Reference
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Preconditions
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedExecution.test_case
                    .preconditions ||
                    "No preconditions specified."}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Test Case Steps
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedExecution.test_case
                    .steps ||
                    "No test case steps specified."}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Expected Result
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedExecution.test_case
                    .expected_result ||
                    "No expected result specified."}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* =====================================================
          BUG DETAILS
      ====================================================== */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Bug Details
        </Typography>

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Bug Title"
            placeholder="Describe the defect clearly"
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
          />

          <TextField
            label="Description"
            placeholder="Describe the problem, impact, or additional context"
            value={value.description ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                description:
                  event.target.value,
              })
            }
            multiline
            rows={3}
            fullWidth
          />

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
          >
            <TextField
              select
              label="Severity"
              value={value.severity}
              onChange={(event) =>
                onChange({
                  ...value,
                  severity:
                    event.target.value,
                })
              }
              fullWidth
            >
              {BUG_SEVERITIES.map(
                (severity) => (
                  <MenuItem
                    key={severity}
                    value={severity}
                  >
                    {severity}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              label="Priority"
              value={value.priority}
              onChange={(event) =>
                onChange({
                  ...value,
                  priority:
                    event.target.value,
                })
              }
              fullWidth
            >
              {BUG_PRIORITIES.map(
                (priority) => (
                  <MenuItem
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </MenuItem>
                ),
              )}
            </TextField>

           <TextField
              select
              label="Status"
              value={value.status}
              onChange={(event) => {
                const status = event.target.value;
              
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
            >
              {availableStatuses.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {status}
                  </MenuItem>
                ),
              )}
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
            >
              <MenuItem value="">
                No Resolution
              </MenuItem>
            
              {BUG_RESOLUTIONS.map(
                (resolution) => (
                  <MenuItem
                    key={resolution}
                    value={resolution}
                  >
                    {resolution}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
          >
            <TextField
              label="Assigned To"
              placeholder="Assign to a team member"
              value={value.assigned_to ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  assigned_to:
                    event.target.value,
                })
              }
              fullWidth
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
            />
          </Stack>
        </Stack>
      </Box>

      {/* =====================================================
          REPRODUCTION & RESULTS
      ====================================================== */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Reproduction & Results
        </Typography>

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Steps To Reproduce"
            placeholder="Describe the steps required to reproduce the defect"
            value={
              value.steps_to_reproduce ?? ""
            }
            onChange={(event) =>
              onChange({
                ...value,
                steps_to_reproduce:
                  event.target.value,
              })
            }
            multiline
            rows={4}
            fullWidth
          />

          <TextField
            label="Actual Result"
            placeholder="Describe what actually happened"
            value={value.actual_result ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                actual_result:
                  event.target.value,
              })
            }
            multiline
            rows={4}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor:
                  "action.hover",
              },
            }}
          />
        </Stack>
      </Box>

      {/* =====================================================
          ENVIRONMENT
      ====================================================== */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Environment
        </Typography>

        <TextField
          label="Environment"
          placeholder="e.g. QA, Staging, Production"
          value={value.environment ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              environment:
                event.target.value,
            })
          }
          fullWidth
          sx={{ mt: 1 }}
        />
      </Box>
    </Stack>
  );
}