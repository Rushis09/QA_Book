import {
  MenuItem,
  TextField,
} from "@mui/material";

import type { TestSuite } from "../../types/testSuite";
import type { TestRunFormData } from "../../types/testRunForm";

interface TestRunFormProps {
  value: TestRunFormData;
  testSuites: TestSuite[];
  error: boolean;
  onChange: (
    value: TestRunFormData,
  ) => void;
}

export default function TestRunForm({
  value,
  testSuites,
  error,
  onChange,
}: TestRunFormProps) {
  return (
    <>
      <TextField
        select
        label="Test Suite"
        value={value.suite_id}
        onChange={(event) =>
          onChange({
            ...value,
            suite_id: Number(
              event.target.value,
            ),
          })
        }
        fullWidth
        required
        margin="normal"
      >
        {testSuites.map((suite) => (
          <MenuItem
            key={suite.id}
            value={suite.id}
          >
            {`${suite.suite_code} - ${suite.name}`}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Run Name"
        value={value.name}
        onChange={(event) =>
          onChange({
            ...value,
            name: event.target.value,
          })
        }
        fullWidth
        required
        error={error}
        helperText={
          error ? "Run name is required." : ""
        }
        margin="normal"
      />

      <TextField
        label="Build Version"
        value={value.build_version}
        onChange={(event) =>
          onChange({
            ...value,
            build_version:
              event.target.value,
          })
        }
        fullWidth
        margin="normal"
      />

      <TextField
        label="Environment"
        value={value.environment}
        onChange={(event) =>
          onChange({
            ...value,
            environment:
              event.target.value,
          })
        }
        fullWidth
        margin="normal"
      />

      <TextField
        label="Tester"
        value={value.tester}
        onChange={(event) =>
          onChange({
            ...value,
            tester: event.target.value,
          })
        }
        fullWidth
        margin="normal"
      />

      <TextField
        label="Start Date"
        type="date"
        value={value.start_date}
        onChange={(event) =>
          onChange({
            ...value,
            start_date:
              event.target.value,
          })
        }
        fullWidth
        margin="normal"
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />

      <TextField
        label="End Date"
        type="date"
        value={value.end_date}
        onChange={(event) =>
          onChange({
            ...value,
            end_date:
              event.target.value,
          })
        }
        fullWidth
        margin="normal"
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />

      <TextField
        select
        label="Status"
        value={value.status}
        onChange={(event) =>
          onChange({
            ...value,
            status: event.target.value,
          })
        }
        fullWidth
        required
        margin="normal"
      >
        <MenuItem value="Not Started">
          Not Started
        </MenuItem>

        <MenuItem value="In Progress">
          In Progress
        </MenuItem>

        <MenuItem value="Completed">
          Completed
        </MenuItem>
      </TextField>
    </>
  );
}