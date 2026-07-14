import {
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

import type { Project } from "../../types/project";
import type { RequirementFormData } from "../../types/requirementForm";

interface RequirementFormProps {
  value: RequirementFormData;
  projects: Project[];
  error: boolean;
  onChange: (value: RequirementFormData) => void;
}

const priorityOptions = [
  "High",
  "Medium",
  "Low",
];

const statusOptions = [
  "Draft",
  "Approved",
  "Implemented",
];

export default function RequirementForm({
  value,
  projects,
  error,
  onChange,
}: RequirementFormProps) {
  function updateField<K extends keyof RequirementFormData>(
    field: K,
    fieldValue: RequirementFormData[K],
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <TextField
          select
          label="Project"
          value={value.project_id}
          onChange={(event) =>
            updateField(
              "project_id",
              Number(event.target.value),
            )
          }
          fullWidth
          required
        >
          {projects.map((project) => (
            <MenuItem
              key={project.id}
              value={project.id}
            >
              {project.project_code} - {project.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          label="Module"
          value={value.module}
          onChange={(event) =>
            updateField("module", event.target.value)
          }
          fullWidth
          required
          error={error}
          helperText={error ? "Module is required." : ""}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          label="Priority"
          value={value.priority}
          onChange={(event) =>
            updateField("priority", event.target.value)
          }
          fullWidth
          required
        >
          {priorityOptions.map((option) => (
            <MenuItem
              key={option}
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          label="Status"
          value={value.status}
          onChange={(event) =>
            updateField("status", event.target.value)
          }
          fullWidth
          required
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option}
              value={option}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          label="Description"
          value={value.description}
          onChange={(event) =>
            updateField("description", event.target.value)
          }
          fullWidth
          multiline
          minRows={4}
        />
      </Grid>
    </Grid>
  );
}