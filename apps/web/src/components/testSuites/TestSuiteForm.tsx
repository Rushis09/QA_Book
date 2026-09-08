import {
  Box,
  MenuItem,
  TextField,
  Typography,
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

export default function TestSuiteForm({
  value,
  projects,
  error,
  onChange,
}: TestSuiteFormProps) {
  const selectedProject =
    projects.find(
      (project) =>
        project.id === value.project_id,
    );

  return (
    <Box
      sx={{
        pt: 0.5,
      }}
    >
      <Typography
        sx={{
          mb: 1.5,
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#344054",
        }}
      >
        Suite Details
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
          label="Project"
          value={
            selectedProject
              ? `${selectedProject.project_code} - ${selectedProject.name}`
              : ""
          }
          fullWidth
          sx={{
            ...fieldSx,
            "& .MuiOutlinedInput-root": {
              ...fieldSx[
                "& .MuiOutlinedInput-root"
              ],
              backgroundColor: "#f8fafc",
            },
          }}
          slotProps={{
            input: {
              readOnly: true,
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
          sx={fieldSx}
        >
          <MenuItem value="Active">
            Active
          </MenuItem>

          <MenuItem value="Archived">
            Archived
          </MenuItem>
        </TextField>
      </Box>

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
          error
            ? "Suite name is required."
            : ""
        }
        sx={{
          ...fieldSx,
          mt: 1.5,
        }}
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
        sx={{
          ...fieldSx,
          mt: 1.5,
          "& .MuiOutlinedInput-root": {
            ...fieldSx[
              "& .MuiOutlinedInput-root"
            ],
            minHeight: "auto",
          },
        }}
      />
    </Box>
  );
}