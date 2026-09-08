import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { Project } from "../../types/project";
import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";

import { aiService } from "../../services/aiService";
import { testCaseService } from "../../services/testCaseService";
import { useNotification } from "../../contexts/NotificationContext";

interface GenerateTestCaseDialogProps {
  open: boolean;
  projects: Project[];
  requirements: Requirement[];
  scenarios: TestScenario[];
  selectedScenarioId: number;
  onClose: () => void;
  onGenerated: () => void;
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
};

const readOnlyFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    backgroundColor: "#f8fafc",
  },
};

export default function GenerateTestCaseDialog({
  open,
  projects,
  requirements,
  scenarios,
  selectedScenarioId,
  onClose,
  onGenerated,
}: GenerateTestCaseDialogProps) {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const selectedScenario = scenarios.find(
    (scenario) =>
      scenario.id === selectedScenarioId,
  );

  const selectedRequirement =
    requirements.find(
      (requirement) =>
        requirement.id ===
        selectedScenario?.requirement_id,
    );

  const selectedProject = projects.find(
    (project) =>
      project.id ===
      selectedRequirement?.project_id,
  );

  async function handleGenerate() {
    try {
      setLoading(true);

      if (!selectedScenario) {
        throw new Error("Scenario not found.");
      }

      const generated =
        await aiService.generateTestCases({
          scenario_id: selectedScenario.id,
          manual_description: "",
          number_of_test_cases: count,
        });

      for (const tc of generated) {
        await testCaseService.createTestCase({
          scenario_id: selectedScenario.id,
          module: selectedScenario.module,
          priority: tc.priority,
          status: "Draft",
          automation_eligibility: "Eligible",
          automation_status: "Not Automated",
          title: tc.title,
          description: null,
          preconditions: tc.preconditions,
          test_data: tc.test_data,
          steps: tc.steps,
          expected_result: tc.expected_result,
        });
      }

      showNotification(
        `${generated.length} test cases generated successfully.`,
        "success",
      );

      onGenerated();
      onClose();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate test cases.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.75,
          fontSize: "1rem",
          fontWeight: 750,
          color: "#101828",
        }}
      >
        ✨ Generate Test Cases with AI
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 2.5,
          py: 2,
          backgroundColor: "#f8fafc",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              border: "1px solid #dbe7ff",
              borderRadius: "10px",
              backgroundColor: "#f5f8ff",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#175cd3",
              }}
            >
              AI Test Case Generation
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: "0.68rem",
                lineHeight: 1.45,
                color: "#667085",
              }}
            >
              Generate structured test cases from the
              selected test scenario.
            </Typography>
          </Box>

          <TextField
            label="Project"
            value={
              selectedProject
                ? `${selectedProject.project_code} - ${selectedProject.name}`
                : ""
            }
            fullWidth
            sx={readOnlyFieldSx}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Requirement"
            value={
              selectedRequirement
                ? `${selectedRequirement.requirement_code} - ${selectedRequirement.module}`
                : ""
            }
            fullWidth
            sx={readOnlyFieldSx}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Scenario"
            value={
              selectedScenario
                ? `${selectedScenario.scenario_code} - ${selectedScenario.title}`
                : ""
            }
            fullWidth
            sx={readOnlyFieldSx}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <Box
            sx={{
              mt: 0.5,
              p: 1.5,
              border: "1px solid #e4e7ec",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              sx={{
                mb: 1,
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#344054",
              }}
            >
              Generation Settings
            </Typography>

            <TextField
              select
              label="Number of Test Cases"
              value={count}
              onChange={(event) =>
                setCount(Number(event.target.value))
              }
              fullWidth
              sx={fieldSx}
            >
              {[3, 5, 10, 15].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                >
                  {value} Test Cases
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          gap: 0.75,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            minHeight: 34,
            px: 1.5,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 650,
            color: "#475467",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !selectedScenario}
          sx={{
            minHeight: 34,
            px: 1.75,
            borderRadius: "8px",
            fontSize: "0.76rem",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          {loading
            ? "Generating..."
            : "✨ Generate Test Cases"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}