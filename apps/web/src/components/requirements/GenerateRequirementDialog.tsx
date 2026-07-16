import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  TextField,
  Box,
  Typography,
} from "@mui/material";

import type { Project } from "../../types/project";
import { aiService } from "../../services/aiService";
import { requirementService } from "../../services/requirementService";
import { useNotification } from "../../contexts/NotificationContext";


interface GenerateRequirementDialogProps {
  open: boolean;
  projects: Project[];
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateRequirementDialog({
  open,
  projects,
  onClose,
  onGenerated,
}: GenerateRequirementDialogProps) {
  const [projectId, setProjectId] = useState(
    projects.length > 0 ? projects[0].id : 0,
  );

  const { showNotification } = useNotification();

  const [source, setSource] = useState<
    "project" | "manual"
  >("project");

  const [manualPrompt, setManualPrompt] =
    useState("");

  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);
    
      const requirements =
        await aiService.generateRequirements({
          project_id: projectId,
          manual_description:
            source === "manual"
              ? manualPrompt
              : "",
          number_of_requirements: count,
        });
      
      for (const requirement of requirements) {
        await requirementService.createRequirement({
          project_id: projectId,
          module: requirement.module,
          priority: requirement.priority,
          status: "Draft",
          description: requirement.description,
        });
      }
    
      showNotification(
        `${requirements.length} requirements generated successfully.`,
        "success",
      );
    
      onGenerated();
      onClose();
    
    } catch (error) {
      console.error(error);
      showNotification(
        "Failed to generate requirements.",
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
        ✨ Generate Requirements with AI
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
            <RadioGroup
              value={source}
              onChange={(event) =>
                setSource(
                  event.target.value as
                    | "project"
                    | "manual",
                )
              }
            >
              <FormControlLabel
                value="project"
                control={<Radio />}
                label="Use Project Description"
              />

              <FormControlLabel
                value="manual"
                control={<Radio />}
                label="Describe Requirement Manually"
              />
            </RadioGroup>
          </FormControl>

          {source === "manual" && (
            <TextField
              label="Requirement Description"
              multiline
              minRows={6}
              fullWidth
              value={manualPrompt}
              onChange={(event) =>
                setManualPrompt(event.target.value)
              }
              placeholder="Example:
          Build an e-commerce website with login, cart, payment gateway, order tracking and admin dashboard."
            />
          )}

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              Number of Requirements
            </Typography>

            <TextField
              select
              value={count}
              onChange={(event) =>
                setCount(Number(event.target.value))
              }
              sx={{ width: 180 }}
            >
              {[5, 10, 15, 20].map((value) => (
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
          disabled={loading}
        >
          {loading
            ? "Generating..."
            : "✨ Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}