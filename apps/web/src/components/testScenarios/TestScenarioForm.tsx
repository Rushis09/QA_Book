import {
  MenuItem,
  TextField,
} from "@mui/material";

import type { Requirement } from "../../types/requirement";
import type { TestScenarioFormData } from "../../types/testScenarioForm";

interface TestScenarioFormProps {
  value: TestScenarioFormData;
  requirements: Requirement[];
  error: boolean;
  onChange: (
    value: TestScenarioFormData,
  ) => void;
}

export default function TestScenarioForm({
  value,
  requirements,
  error,
  onChange,
}: TestScenarioFormProps) {
  return (
    <>
      <TextField
        select
        label="Requirement"
        value={value.requirement_id}
        onChange={(event) =>
          onChange({
            ...value,
            requirement_id: Number(
              event.target.value,
            ),
          })
        }
        fullWidth
        required
        margin="normal"
      >
        {requirements.map((requirement) => (
          <MenuItem
            key={requirement.id}
            value={requirement.id}
          >
            {`${requirement.requirement_code} - ${requirement.module}`}
          </MenuItem>
        ))}
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
        minRows={4}
        margin="normal"
      />
    </>
  );
}