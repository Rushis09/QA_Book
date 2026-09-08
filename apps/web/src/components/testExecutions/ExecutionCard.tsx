import {
  Box,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material/Select";
import type { TestExecution } from "../../types/testExecution";

interface ExecutionCardProps {
  execution: TestExecution;

  status: string;
  actualResult: string;
  comments: string;

  onStatusChange: (
    value: string,
  ) => void;

  onActualResultChange: (
    value: string,
  ) => void;

  onCommentsChange: (
    value: string,
  ) => void;
}

const priorityStyles: Record<
  string,
  {
    background: string;
    color: string;
    border: string;
  }
> = {
  Critical: {
    background: "#fef3f2",
    color: "#b42318",
    border: "#fecdca",
  },
  High: {
    background: "#fff4ed",
    color: "#c4320a",
    border: "#fddcab",
  },
  Medium: {
    background: "#fffaeb",
    color: "#b54708",
    border: "#fedf89",
  },
  Low: {
    background: "#ecfdf3",
    color: "#027a48",
    border: "#abefc6",
  },
};

const statusStyles: Record<
  string,
  {
    background: string;
    color: string;
    border: string;
  }
> = {
  "Not Executed": {
    background: "#f2f4f7",
    color: "#475467",
    border: "#d0d5dd",
  },
  Passed: {
    background: "#ecfdf3",
    color: "#027a48",
    border: "#abefc6",
  },
  Failed: {
    background: "#fef3f2",
    color: "#b42318",
    border: "#fecdca",
  },
  Blocked: {
    background: "#fffaeb",
    color: "#b54708",
    border: "#fedf89",
  },
};

export default function ExecutionCard({
  execution,
  status,
  actualResult,
  comments,
  onStatusChange,
  onActualResultChange,
  onCommentsChange,
}: ExecutionCardProps) {
  const handleStatusChange = (
    event: SelectChangeEvent,
  ) => {
    onStatusChange(event.target.value);
  };

  const priority =
    execution.test_case.priority || "Medium";

  const priorityStyle =
    priorityStyles[priority] ??
    priorityStyles.Medium;

  const currentStatusStyle =
    statusStyles[status] ??
    statusStyles["Not Executed"];

  return (
    <Box
      sx={{
        border: "1px solid #e4e7ec",
        borderRadius: "12px",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* TEST CASE HEADER */}
      <Box
        sx={{
          px: 2,
          py: 1.6,
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
          borderBottom: "1px solid #eaecf0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.66rem",
                fontWeight: 750,
                color: "#175cd3",
                letterSpacing: "0.03em",
                mb: 0.35,
              }}
            >
              {execution.test_case.test_case_code}
            </Typography>

            <Typography
              sx={{
                fontSize: "1rem",
                lineHeight: 1.35,
                fontWeight: 750,
                color: "#101828",
              }}
            >
              {execution.test_case.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.45,
                fontSize: "0.68rem",
                color: "#667085",
              }}
            >
              Test Case Execution
            </Typography>
          </Box>

          <Chip
            label={priority}
            size="small"
            sx={{
              flexShrink: 0,
              height: 24,
              borderRadius: "7px",
              backgroundColor:
                priorityStyle.background,
              color: priorityStyle.color,
              border: `1px solid ${priorityStyle.border}`,
              fontSize: "0.64rem",
              fontWeight: 750,
            }}
          />
        </Box>
      </Box>

      {/* TEST CASE INFORMATION */}
      <Box sx={{ px: 2, py: 1.75 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {/* PRECONDITIONS */}
          <Box
            sx={{
              border: "1px solid #eaecf0",
              borderRadius: "9px",
              backgroundColor: "#fcfcfd",
              p: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 750,
                color: "#344054",
                mb: 0.55,
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
            >
              Preconditions
            </Typography>

            <Typography
              sx={{
                fontSize: "0.72rem",
                lineHeight: 1.55,
                color: "#667085",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {execution.test_case
                .preconditions || "-"}
            </Typography>
          </Box>

          {/* TEST STEPS */}
          <Box
            sx={{
              border: "1px solid #eaecf0",
              borderRadius: "9px",
              backgroundColor: "#fcfcfd",
              p: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 750,
                color: "#344054",
                mb: 0.55,
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
            >
              Test Steps
            </Typography>

            <Typography
              sx={{
                fontSize: "0.72rem",
                lineHeight: 1.55,
                color: "#475467",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {execution.test_case.steps ||
                "-"}
            </Typography>
          </Box>

          {/* EXPECTED RESULT */}
          <Box
            sx={{
              border: "1px solid #eaecf0",
              borderRadius: "9px",
              backgroundColor: "#fcfcfd",
              p: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 750,
                color: "#344054",
                mb: 0.55,
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
            >
              Expected Result
            </Typography>

            <Typography
              sx={{
                fontSize: "0.72rem",
                lineHeight: 1.55,
                color: "#475467",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {execution.test_case
                .expected_result || "-"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* EXECUTION SECTION */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          backgroundColor: "#fbfcfe",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.35,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.84rem",
                fontWeight: 750,
                color: "#101828",
              }}
            >
              Execution Result
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.68rem",
                color: "#667085",
              }}
            >
              Record the outcome of this test
              case.
            </Typography>
          </Box>

          <Chip
            label={status}
            size="small"
            sx={{
              height: 24,
              borderRadius: "7px",
              backgroundColor:
                currentStatusStyle.background,
              color: currentStatusStyle.color,
              border: `1px solid ${currentStatusStyle.border}`,
              fontSize: "0.64rem",
              fontWeight: 750,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 0.35fr) minmax(0, 1fr)",
            gap: 1.25,
            mb: 1.25,
          }}
        >
          {/* STATUS */}
          <FormControl
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "9px",
                backgroundColor: "#fff",
                fontSize: "0.78rem",
                minHeight: 42,
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.76rem",
              },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              value={status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="Not Executed">
                Not Executed
              </MenuItem>

              <MenuItem value="Passed">
                Passed
              </MenuItem>

              <MenuItem value="Failed">
                Failed
              </MenuItem>

              <MenuItem value="Blocked">
                Blocked
              </MenuItem>
            </Select>
          </FormControl>

          {/* ACTUAL RESULT */}
          <TextField
            label="Actual Result"
            fullWidth
            multiline
            minRows={3}
            value={actualResult}
            onChange={(event) =>
              onActualResultChange(
                event.target.value,
              )
            }
            placeholder="Describe what happened during execution..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "9px",
                backgroundColor: "#fff",
                fontSize: "0.78rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.76rem",
              },
              "& .MuiOutlinedInput-input": {
                lineHeight: 1.5,
              },
            }}
          />
        </Box>

        {/* COMMENTS */}
        <TextField
          label="Comments"
          fullWidth
          multiline
          minRows={2}
          value={comments}
          onChange={(event) =>
            onCommentsChange(
              event.target.value,
            )
          }
          placeholder="Add execution notes, observations, or additional context..."
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "9px",
              backgroundColor: "#fff",
              fontSize: "0.78rem",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.76rem",
            },
            "& .MuiOutlinedInput-input": {
              lineHeight: 1.5,
            },
          }}
        />
      </Box>
    </Box>
  );
}