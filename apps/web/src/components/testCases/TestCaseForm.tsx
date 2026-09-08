import { Box, MenuItem, TextField, Typography } from "@mui/material";

import type { TestScenario } from "../../types/testScenario";
import type { TestCaseFormData } from "../../types/testCaseForm";

interface TestCaseFormProps {
  value: TestCaseFormData;
  scenarios: TestScenario[];
  error: boolean;
  onChange: (value: TestCaseFormData) => void;
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

const readOnlyFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    backgroundColor: "#f8fafc",
  },
};

export default function TestCaseForm({
  value,
  scenarios,
  error,
  onChange,
}: TestCaseFormProps) {
  const selectedScenario = scenarios.find(
    (scenario) => scenario.id === value.scenario_id,
  );

  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography
        sx={{
          mb: 1.5,
          fontSize: "0.86rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        Test Case Details
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
          label="Test Scenario"
          value={
            selectedScenario
              ? `${selectedScenario.scenario_code} - ${selectedScenario.title}`
              : ""
          }
          fullWidth
          sx={{
            ...readOnlyFieldSx,
            gridColumn: {
              xs: "auto",
              sm: "1 / -1",
            },
          }}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="Module"
          value={value.module}
          fullWidth
          sx={readOnlyFieldSx}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

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
          required
          sx={fieldSx}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>

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
          sx={{
            ...fieldSx,
            gridColumn: {
              xs: "auto",
              sm: "1 / -1",
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
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Ready">Ready</MenuItem>
          <MenuItem value="Approved">
            Approved
          </MenuItem>
        </TextField>

        <TextField
          select
          label="Automation Eligibility"
          value={value.automation_eligibility}
          onChange={(event) =>
            onChange({
              ...value,
              automation_eligibility:
                event.target.value,
            })
          }
          fullWidth
          required
          sx={fieldSx}
        >
          <MenuItem value="Eligible">
            Eligible
          </MenuItem>
          <MenuItem value="Not Suitable">
            Not Suitable
          </MenuItem>
        </TextField>

        <TextField
          label="Automation Status"
          value={value.automation_status}
          fullWidth
          sx={readOnlyFieldSx}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 2.5,
          mb: 1.25,
          fontSize: "0.82rem",
          fontWeight: 750,
          color: "#344054",
        }}
      >
        Test Definition
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
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
          sx={fieldSx}
        />

        <TextField
          label="Preconditions"
          value={value.preconditions}
          onChange={(event) =>
            onChange({
              ...value,
              preconditions: event.target.value,
            })
          }
          fullWidth
          multiline
          minRows={3}
          sx={fieldSx}
        />

        <TextField
          label="Test Data"
          value={value.test_data}
          onChange={(event) =>
            onChange({
              ...value,
              test_data: event.target.value,
            })
          }
          fullWidth
          multiline
          minRows={3}
          sx={fieldSx}
        />

        <TextField
          label="Steps"
          value={value.steps}
          onChange={(event) =>
            onChange({
              ...value,
              steps: event.target.value,
            })
          }
          fullWidth
          multiline
          minRows={5}
          sx={fieldSx}
        />

        <TextField
          label="Expected Result"
          value={value.expected_result}
          onChange={(event) =>
            onChange({
              ...value,
              expected_result: event.target.value,
            })
          }
          fullWidth
          multiline
          minRows={3}
          sx={fieldSx}
        />
      </Box>
    </Box>
  );
}