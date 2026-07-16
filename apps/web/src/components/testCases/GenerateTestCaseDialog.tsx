import { useMemo, useState } from "react";
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
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateTestCaseDialog({
  open,
  projects,
  requirements,
  scenarios,
  onClose,
  onGenerated,
}: GenerateTestCaseDialogProps) {
  const [projectId, setProjectId] = useState(0);
  const [requirementId, setRequirementId] = useState(0);
  const [scenarioId, setScenarioId] = useState(0);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const filteredRequirements = useMemo(
    () =>
      requirements.filter(
        (r) => r.project_id === projectId,
      ),
    [requirements, projectId],
  );

  const filteredScenarios = useMemo(
    () =>
      scenarios.filter(
        (s) =>
          s.requirement_id ===
          requirementId,
      ),
    [scenarios, requirementId],
  );

  async function handleGenerate() {
    try {
      setLoading(true);

      const generated =
        await aiService.generateTestCases({
          scenario_id: scenarioId,
          manual_description: "",
          number_of_test_cases: count,
        });

      const scenario =
        scenarios.find(
          (s) => s.id === scenarioId,
        );

      if (!scenario) {
        throw new Error(
          "Scenario not found.",
        );
      }

      for (const tc of generated) {
        await testCaseService.createTestCase({
          scenario_id: scenario.id,
          module: scenario.module,
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
            select
            label="Project"
            value={projectId}
            onChange={(e) =>
              setProjectId(
                Number(e.target.value),
              )
            }
          >
            {projects.map((project) => (
              <MenuItem
                key={project.id}
                value={project.id}
              >
                {project.project_code} -{" "}
                {project.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Requirement"
            value={requirementId}
            onChange={(e) =>
              setRequirementId(
                Number(e.target.value),
              )
            }
          >
            {filteredRequirements.map(
              (requirement) => (
                <MenuItem
                  key={requirement.id}
                  value={requirement.id}
                >
                  {
                    requirement.requirement_code
                  }
                  {" - "}
                  {requirement.module}
                </MenuItem>
              ),
            )}
          </TextField>

          <TextField
            select
            label="Scenario"
            value={scenarioId}
            onChange={(e) =>
              setScenarioId(
                Number(e.target.value),
              )
            }
          >
            {filteredScenarios.map(
              (scenario) => (
                <MenuItem
                  key={scenario.id}
                  value={scenario.id}
                >
                  {
                    scenario.scenario_code
                  }
                  {" - "}
                  {scenario.title}
                </MenuItem>
              ),
            )}
          </TextField>

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
            scenarioId === 0
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