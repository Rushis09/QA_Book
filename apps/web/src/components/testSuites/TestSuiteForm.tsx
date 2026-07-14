import {
  MenuItem,
  TextField,
} from "@mui/material";

import type { Project } from "../../types/project";
import type { TestSuiteFormData } from "../../types/testSuiteForm";

interface TestSuiteFormProps {
  value: TestSuiteFormData;
  projects: Project[];
  error: boolean;
  onChange: (
    value: TestSuiteFormData,
  ) => void;
}

export default function TestSuiteForm({
  value,
  projects,
  error,
  onChange,
}: TestSuiteFormProps) {
  return (
    <>
      <TextField
        select
        label="Project"
        value={value.project_id}
        onChange={(event) =>
          onChange({
            ...value,
            project_id: Number(
              event.target.value,
            ),
          })
        }
        fullWidth
        required
        margin="normal"
      >
        {projects.map((project) => (
          <MenuItem
            key={project.id}
            value={project.id}
          >
            {`${project.project_code} - ${project.name}`}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Suite Name"
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
          error ? "Suite name is required." : ""
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
        <MenuItem value="Active">
          Active
        </MenuItem>

        <MenuItem value="Archived">
          Archived
        </MenuItem>
      </TextField>
    </>
  );
}