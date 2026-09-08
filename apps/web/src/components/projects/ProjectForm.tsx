import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.82rem",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.84rem",
  },
};

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
        gap: 2.75,
      }}
    >
      {/* Project Details */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#172033",
            mb: 0.35,
          }}
        >
          Project Details
        </Typography>

        <Typography
          sx={{
            fontSize: "0.76rem",
            color: "#667085",
            mb: 1.75,
          }}
        >
          Define the basic information for this QA project.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
          }}
        >
          <TextField
            label="Project Name"
            placeholder="e.g. E-commerce Platform"
            value={name}
            onChange={(event) =>
              onNameChange(event.target.value)
            }
            error={error}
            helperText={
              error
                ? "Project name is required."
                : "Use a clear name that identifies the project."
            }
            required
            fullWidth
            sx={fieldSx}
          />

          <TextField
            label="Description"
            placeholder="Briefly describe the project and its QA scope..."
            value={description}
            onChange={(event) =>
              onDescriptionChange(
                event.target.value,
              )
            }
            multiline
            minRows={3}
            maxRows={5}
            fullWidth
            sx={fieldSx}
          />
        </Box>
      </Box>

      {/* Project Configuration */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#172033",
            mb: 0.35,
          }}
        >
          Project Configuration
        </Typography>

        <Typography
          sx={{
            fontSize: "0.76rem",
            color: "#667085",
            mb: 1.75,
          }}
        >
          Set the project lifecycle and release information.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1.75,
          }}
        >
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            fullWidth
            sx={fieldSx}
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
            placeholder="e.g. 1.0.0"
            value={version}
            onChange={(event) =>
              onVersionChange(event.target.value)
            }
            fullWidth
            sx={fieldSx}
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
                  ? value.format("YYYY-MM-DD")
                  : "",
              )
            }
            slotProps={{
              textField: {
                fullWidth: true,
                sx: fieldSx,
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
                  ? value.format("YYYY-MM-DD")
                  : "",
              )
            }
            slotProps={{
              textField: {
                fullWidth: true,
                sx: fieldSx,
              },
            }}
          />
        </Box>
      </Box>

      {/* BRD / Documentation */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#172033",
            mb: 0.35,
          }}
        >
          Project Documentation
        </Typography>

        <Typography
          sx={{
            fontSize: "0.76rem",
            color: "#667085",
            mb: 1.5,
          }}
        >
          Upload the Business Requirements Document for this project.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: "10px",
            borderStyle: "dashed",
            borderColor: "#cfd7e6",
            backgroundColor: "#fbfcfe",
            p: 1.75,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 1.5,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#eef4ff",
                color: "#356dff",
                flexShrink: 0,
              }}
            >
              <DescriptionOutlinedIcon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 650,
                  color: "#344054",
                }}
              >
                {brdFile
                  ? brdFile.name
                  : existingBrdFileName
                    ? existingBrdFileName
                    : "No BRD selected"}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.72rem",
                  color: "#667085",
                  mt: 0.25,
                }}
              >
                DOCX or PDF • Recommended for project context
              </Typography>
            </Box>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{
                height: 34,
                px: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.76rem",
                fontWeight: 650,
                whiteSpace: "nowrap",
              }}
            >
              {brdFile || existingBrdFileName
                ? "Change File"
                : "Choose File"}

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
          </Box>

          {existingBrdFileName &&
            !brdFile && (
              <Box
                sx={{
                  mt: 1.25,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "#667085",
                  }}
                >
                  Existing document
                </Typography>

                <Chip
                  label="Uploaded"
                  size="small"
                  sx={{
                    height: 21,
                    fontSize: "0.66rem",
                    fontWeight: 650,
                  }}
                />
              </Box>
            )}

          {brdFile && (
            <Typography
              sx={{
                mt: 1.25,
                fontSize: "0.7rem",
                color: "#667085",
              }}
            >
              Selected file will be uploaded when the project is saved.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}