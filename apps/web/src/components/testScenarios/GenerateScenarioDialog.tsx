import { useEffect, useState } from "react";
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
import { aiService } from "../../services/aiService";
import { testScenarioService } from "../../services/testScenarioService";
import { useNotification } from "../../contexts/NotificationContext";

interface GenerateScenarioDialogProps {
  open: boolean;
  projects: Project[];
  requirements: Requirement[];
  selectedRequirementId: number;
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateScenarioDialog({
  open,
  projects,
  requirements,
  selectedRequirementId,
  onClose,
  onGenerated,
}: GenerateScenarioDialogProps) {
  const [projectId, setProjectId] = useState(0);




  const requirementId = selectedRequirementId;
  

  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);

  const selectedProject = projects.find(
    (project) => project.id === projectId,
  );

  const selectedRequirement = requirements.find(
  (requirement) =>
    requirement.id === selectedRequirementId,
);


  const { showNotification } =
    useNotification();

  useEffect(() => {
    if (!selectedRequirementId) {
      if (projects.length > 0) {
        setProjectId(projects[0].id);
      }
      return;
    }

    const requirement = requirements.find(
      (requirement) =>
        requirement.id === selectedRequirementId,
    );

    if (requirement) {
      setProjectId(requirement.project_id);
    }
  }, [
    projects,
    requirements,
    selectedRequirementId,
  ]);

  
  async function handleGenerate() {
    try {
      setLoading(true);

      const scenarios =
        await aiService.generateScenarios({
          project_id: projectId,
          requirement_id: requirementId,
          generate_for_all: false,
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

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              "Number of Scenarios"
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
            loading || requirementId === 0
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