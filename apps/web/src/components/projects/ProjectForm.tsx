import {
  Box,
  MenuItem,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface ProjectFormProps {
  name: string;
  description: string;
  status: string;
  version: string;
  startDate: string;
  endDate: string;
  error: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function ProjectForm({
  name,
  description,
  status,
  version,
  startDate,
  endDate,
  error,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onVersionChange,
  onStartDateChange,
  onEndDateChange,
}: ProjectFormProps) {
  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 1,
      }}
    >
      <TextField
        label="Project Name"
        value={name}
        onChange={(event) =>
          onNameChange(event.target.value)
        }
        error={error}
        helperText={
          error ? "Project Name is required." : ""
        }
        required
        fullWidth
      />

      <TextField
        label="Description"
        value={description}
        onChange={(event) =>
          onDescriptionChange(event.target.value)
        }
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        select
        label="Status"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value)
        }
        fullWidth
      >
        <MenuItem value="Active">
          Active
        </MenuItem>

        <MenuItem value="On Hold">
          On Hold
        </MenuItem>

        <MenuItem value="Completed">
          Completed
        </MenuItem>

        <MenuItem value="Archived">
          Archived
        </MenuItem>
      </TextField>

      <TextField
        label="Version"
        value={version}
        onChange={(event) =>
          onVersionChange(event.target.value)
        }
        fullWidth
      />

      <DatePicker
        label="Start Date"
        value={startDate ? dayjs(startDate) : null}
        onChange={(value) =>
          onStartDateChange(
            value ? value.format("YYYY-MM-DD") : "",
          )
        }
        slotProps={{
           textField: { 
            fullWidth: true,
           },
          }}
      />

      <DatePicker
        label="End Date"
        value={endDate ? dayjs(endDate) : null}

        onChange={(value) =>
          onEndDateChange(
            value ? value.format("YYYY-MM-DD") : "",
          )
        }
       slotProps={{
          textField: { 
            fullWidth: true,
           },
          }}
      />
    </Box>
  );
}