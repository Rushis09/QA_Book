import {
  MenuItem,
  TextField,
} from "@mui/material";

import type { TestScenario } from "../../types/testScenario";
import type { TestCaseFormData } from "../../types/testCaseForm";

interface TestCaseFormProps {
  value: TestCaseFormData;
  scenarios: TestScenario[];
  error: boolean;
  onChange: (
    value: TestCaseFormData,
  ) => void;
}

export default function TestCaseForm({
  value,
  scenarios,
  error,
  onChange,
}: TestCaseFormProps) {
  return (
    <>
      <TextField
        select
        label="Test Scenario"
        value={value.scenario_id}
        onChange={(event) =>
          onChange({
            ...value,
            scenario_id: Number(
              event.target.value,
            ),
          })
        }
        fullWidth
        required
        margin="normal"
      >
        {scenarios.map((scenario) => (
          <MenuItem
            key={scenario.id}
            value={scenario.id}
          >
            {`${scenario.scenario_code} - ${scenario.title}`}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Component / Module"
        value={value.component}
        onChange={(event) =>
          onChange({
            ...value,
            component: event.target.value,
          })
        }
        fullWidth
        required
        margin="normal"
      />

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
        required
        margin="normal"
      >
        <MenuItem value="High">
          High
        </MenuItem>
        <MenuItem value="Medium">
          Medium
        </MenuItem>
        <MenuItem value="Low">
          Low
        </MenuItem>
      </TextField>

      <TextField
        label="Title"
        value={value.title}
        onChange={(event) =>
          onChange({
            ...value,
            title: event.target.value,
          })
        }
        fullWidth
        required
        error={error}
        helperText={
          error ? "Title is required." : ""
        }
        margin="normal"
      />

      <TextField
        label="Description"
        value={value.description}
        onChange={(event) =>
          onChange({
            ...value,
            description: event.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
        margin="normal"
      />

      <TextField
        label="Preconditions"
        value={value.preconditions}
        onChange={(event) =>
          onChange({
            ...value,
            preconditions:
              event.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
        margin="normal"
      />

      <TextField
        label="Test Data"
        value={value.test_data}
        onChange={(event) =>
          onChange({
            ...value,
            test_data:
              event.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
        margin="normal"
      />

      <TextField
        label="Steps"
        value={value.steps}
        onChange={(event) =>
          onChange({
            ...value,
            steps: event.target.value,
          })
        }
        fullWidth
        multiline
        minRows={5}
        margin="normal"
      />

      <TextField
        label="Expected Result"
        value={value.expected_result}
        onChange={(event) =>
          onChange({
            ...value,
            expected_result:
              event.target.value,
          })
        }
        fullWidth
        multiline
        minRows={3}
        margin="normal"
      />
    </>
  );
}