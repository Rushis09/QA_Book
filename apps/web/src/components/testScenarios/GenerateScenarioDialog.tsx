import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import type { Project } from "../../types/project";
import type { Requirement } from "../../types/requirement";
import { aiService } from "../../services/aiService";
import { testScenarioService } from "../../services/testScenarioService";
import { useNotification } from "../../contexts/NotificationContext";

interface GenerateScenarioDialogProps {
  open: boolean;
  projects: Project[];
  requirements: Requirement[];
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateScenarioDialog({
  open,
  projects,
  requirements,
  onClose,
  onGenerated,
}: GenerateScenarioDialogProps) {
  const [projectId, setProjectId] = useState(0);

  const [mode, setMode] = useState<
    "requirement" | "all"
  >("requirement");

  const filteredRequirements = useMemo(
    () =>
      requirements.filter(
        (requirement) =>
          requirement.project_id === projectId,
      ),
    [requirements, projectId],
  );

  const [requirementId, setRequirementId] =
    useState(0);

  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);

  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (filteredRequirements.length > 0) {
      setRequirementId(
        filteredRequirements[0].id,
      );
    }
  }, [filteredRequirements]);

  
  async function handleGenerate() {
    try {
      setLoading(true);

      const scenarios =
        await aiService.generateScenarios({
          project_id: projectId,
          requirement_id:
            mode === "requirement"
              ? requirementId
              : undefined,
          generate_for_all:
            mode === "all",
          manual_description: "",
          number_of_scenarios: count,
        });

      const requirement =
        requirements.find(
          (requirement) =>
            requirement.id === requirementId,
        );

      if (!requirement) {
        throw new Error(
          "Requirement not found.",
        );
      }

      for (const scenario of scenarios) {
        await testScenarioService.createTestScenario({
          requirement_id: requirementId,
          module: requirement.module,
          title: scenario.title,
          priority: scenario.priority,
          status: scenario.status,
          description: scenario.description,
        });
      }

      showNotification(
        `${scenarios.length} test scenarios generated successfully.`,
        "success",
      );

      onGenerated();

      onClose();
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate test scenarios.",
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
        ✨ Generate Test Scenarios with AI
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <TextField
            select
            label="Project"
            value={projectId}
            onChange={(event) =>
              setProjectId(
                Number(event.target.value),
              )
            }
            fullWidth
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

          <FormControl>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              Generation Mode
            </Typography>

            <RadioGroup
              value={mode}
              onChange={(event) =>
                setMode(
                  event.target.value as
                    | "requirement"
                    | "all",
                )
              }
            >
              <FormControlLabel
                value="requirement"
                control={<Radio />}
                label="Specific Requirement"
              />

              <FormControlLabel
                value="all"
                control={<Radio />}
                label="All Requirements"
              />
            </RadioGroup>
          </FormControl>

          {mode === "requirement" && (
            <TextField
              select
              label="Requirement"
              value={requirementId}
              onChange={(event) =>
                setRequirementId(
                  Number(event.target.value),
                )
              }
              fullWidth
            >
              {filteredRequirements.map(
                (requirement) => (
                  <MenuItem
                    key={requirement.id}
                    value={requirement.id}
                  >
                    {requirement.requirement_code}
                    {" - "}
                    {requirement.module}
                  </MenuItem>
                ),
              )}
            </TextField>
          )}

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              {mode === "requirement"
                ? "Number of Scenarios"
                : "Scenarios per Requirement"}
            </Typography>

            <TextField
              select
              value={count}
              onChange={(event) =>
                setCount(
                  Number(event.target.value),
                )
              }
              sx={{ width: 220 }}
            >
              {[3, 5, 10, 15].map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                >
                  {value}
                </MenuItem>
              ))}
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
            (mode === "requirement" &&
              requirementId === 0)
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