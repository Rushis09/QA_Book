import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { RequirementFormData } from "../../types/requirementForm";
import { useWorkspace } from "../../contexts/WorkspaceContext";

interface RequirementFormProps {
  value: RequirementFormData;
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

export default function RequirementForm({
  value,
  error,
  onChange,
}: RequirementFormProps) {
  const { selectedProject } = useWorkspace();

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
    <Box>
      <Typography
        sx={{
          fontSize: "0.74rem",
          fontWeight: 750,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.055em",
          mb: 1.2,
        }}
      >
        Requirement Details
      </Typography>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Project"
            value={
              selectedProject
                ? `${selectedProject.project_code} - ${selectedProject.name}`
                : ""
            }
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
            sx={{
              ...fieldSx,
              "& .MuiOutlinedInput-root": {
                ...fieldSx["& .MuiOutlinedInput-root"],
                backgroundColor: "#f8fafc",
              },
            }}
          />
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
            sx={fieldSx}
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
            sx={fieldSx}
          >
            {priorityOptions.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{ fontSize: "0.82rem" }}
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
            sx={fieldSx}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{ fontSize: "0.82rem" }}
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
            sx={{
              ...fieldSx,
              "& .MuiOutlinedInput-root": {
                ...fieldSx["& .MuiOutlinedInput-root"],
                alignItems: "flex-start",
                paddingTop: "9px",
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}