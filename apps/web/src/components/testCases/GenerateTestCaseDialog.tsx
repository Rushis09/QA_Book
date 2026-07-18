import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
        throw new Error(
          "Scenario not found.",
        );
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
          title: tc.title,
          description: null,
          preconditions:
            tc.preconditions,
          test_data: tc.test_data,
          steps: tc.steps,
          expected_result:
            tc.expected_result,
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
      maxWidth="md"
    >
      <DialogTitle>
        ✨ Generate Test Cases with AI
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
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
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              Number of Test Cases
            </Typography>

            <TextField
              select
              value={count}
              onChange={(e) =>
                setCount(
                  Number(e.target.value),
                )
              }
              sx={{ width: 220 }}
            >
              {[3, 5, 10, 15].map(
                (value) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {value}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={
            loading ||
            !selectedScenario
          }
        >
          {loading
            ? "Generating..."
            : "✨ Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}