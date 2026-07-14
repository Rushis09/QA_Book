import {
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  BUG_PRIORITIES,
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
  onChange: (
    value: BugFormData,
  ) => void;
}

export default function BugForm({
  value,
  executions,
  error,
  onChange,
}: BugFormProps) {
  const selectedExecution =
    executions.find(
      (execution) =>
        execution.id === value.execution_id,
    ) ?? null;

  return (
    <Stack spacing={3}>
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
        error={error.execution}
        helperText={
          error.execution
            ? "Test Execution is required."
            : ""
        }
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

      {selectedExecution && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            Execution Details
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Run Code"
              value={
                selectedExecution.test_run.run_code
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Run Name"
              value={
                selectedExecution.test_run.name
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Test Case Code"
              value={
                selectedExecution.test_case
                  .test_case_code
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Test Case"
              value={
                selectedExecution.test_case.title
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Priority"
              value={
                selectedExecution.test_case
                  .priority
              }
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Preconditions"
              value={
                selectedExecution.test_case
                  .preconditions ?? ""
              }
              multiline
              rows={2}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Steps"
              value={
                selectedExecution.test_case
                  .steps ?? ""
              }
              multiline
              rows={4}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label="Expected Result"
              value={
                selectedExecution.test_case
                  .expected_result ?? ""
              }
              multiline
              rows={3}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </Stack>
        </Paper>
      )}

      <Divider />
              <Typography variant="h6">
        Bug Information
      </Typography>

      <TextField
        label="Bug Title"
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
            : ""
        }
        fullWidth
      />

      <TextField
        label="Description"
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
        onChange={(event) =>
          onChange({
            ...value,
            status:
              event.target.value,
          })
        }
        fullWidth
      >
        {BUG_STATUSES.map(
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
        label="Assigned To"
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

      <TextField
        label="Environment"
        value={value.environment ?? ""}
        onChange={(event) =>
          onChange({
            ...value,
            environment:
              event.target.value,
          })
        }
        fullWidth
      />
              <TextField
        label="Steps To Reproduce"
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
      />
    </Stack>
  );
}