import {
  Grid,
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
      onChange={(event) => {
        const requirement = requirements.find(
          (r) => r.id === Number(event.target.value),
        );

        onChange({
          ...value,
          requirement_id: Number(event.target.value),
          module: requirement?.module ?? "",
        });
      }}
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

    <Grid
      container
      spacing={2}
      sx={{ mt: 0.5 }}
    >
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label="Module"
          value={value.module}
          fullWidth
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
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
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
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
        >
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Ready">Ready</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
        </TextField>
      </Grid>
    </Grid>

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