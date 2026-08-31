import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
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

  brdFile: File | null;
  existingBrdFileName?: string;

  error: boolean;

  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  onBrdFileChange: (file: File | null) => void;
}

export default function ProjectForm({
  name,
  description,
  status,
  version,
  startDate,
  endDate,

  brdFile,
  existingBrdFileName,

  error,

  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onVersionChange,
  onStartDateChange,
  onEndDateChange,

  onBrdFileChange,
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
          error
            ? "Project Name is required."
            : ""
        }
        required
        fullWidth
      />

      <TextField
        label="Description"
        value={description}
        onChange={(event) =>
          onDescriptionChange(
            event.target.value,
          )
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
          onStatusChange(
            event.target.value,
          )
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
          onVersionChange(
            event.target.value,
          )
        }
        fullWidth
      />

      <DatePicker
        label="Start Date"
        value={
          startDate
            ? dayjs(startDate)
            : null
        }
        onChange={(value) =>
          onStartDateChange(
            value
              ? value.format(
                  "YYYY-MM-DD",
                )
              : "",
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
        value={
          endDate
            ? dayjs(endDate)
            : null
        }
        onChange={(value) =>
          onEndDateChange(
            value
              ? value.format(
                  "YYYY-MM-DD",
                )
              : "",
          )
        }
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />

      {/* BRD Document */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1 }}
        >
          BRD Document
        </Typography>

        {existingBrdFileName &&
          !brdFile && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Existing:{" "}
              {existingBrdFileName}
            </Typography>
          )}

        <Button
          variant="outlined"
          component="label"
        >
          {brdFile
            ? "Change BRD"
            : "Choose BRD File"}

          <input
            type="file"
            hidden
            accept=".docx,.pdf"
            onChange={(event) => {
              const file =
                event.target.files?.[0] ??
                null;

              onBrdFileChange(file);

              event.target.value = "";
            }}
          />
        </Button>

        {brdFile && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Selected: {brdFile.name}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1,
            display: "block",
          }}
        >
          Supported formats: DOCX, PDF
        </Typography>
      </Box>
    </Box>
  );
}