import {
  Box,
  Card,
  CardContent,
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

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              color="primary"
            >
              {
                execution.test_case
                  .test_case_code
              }
            </Typography>

            <Typography variant="h5">
              {execution.test_case.title}
            </Typography>
          </Box>

          <Chip
            label={
              execution.test_case.priority
            }
            color="primary"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="subtitle2"
          gutterBottom
        >
          Preconditions
        </Typography>

        <Typography sx={{ mb: 2 }}>
          {execution.test_case
            .preconditions || "-"}
        </Typography>

        <Typography
          variant="subtitle2"
          gutterBottom
        >
          Test Steps
        </Typography>

        <Typography sx={{ mb: 2 }}>
          {execution.test_case.steps ||
            "-"}
        </Typography>

        <Typography
          variant="subtitle2"
          gutterBottom
        >
          Expected Result
        </Typography>

        <Typography sx={{ mb: 3 }}>
          {execution.test_case
            .expected_result || "-"}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="h6"
          gutterBottom
        >
          Execution Details
        </Typography>

        <FormControl
          fullWidth
          sx={{ mb: 3 }}
        >
          <InputLabel>Status</InputLabel>

          <Select
            value={status}
            label="Status"
            onChange={
              handleStatusChange
            }
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

        <TextField
          label="Actual Result"
          fullWidth
          multiline
          minRows={4}
          value={actualResult}
          onChange={(e) =>
            onActualResultChange(
              e.target.value,
            )
          }
          sx={{ mb: 3 }}
        />

        <TextField
          label="Comments"
          fullWidth
          multiline
          minRows={3}
          value={comments}
          onChange={(e) =>
            onCommentsChange(
              e.target.value,
            )
          }
        />
      </CardContent>
    </Card>
  );
}