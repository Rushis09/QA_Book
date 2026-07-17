import {
  AppBar,
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";

import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function Header() {
  const {
    projects,
    selectedProject,
    setSelectedProject,
  } = useWorkspace();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            ml: 1,
          }}
        >
          QABook
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="body2"
            color="inherit"
            sx={{
              opacity: 0.8,
            }}
          >
            Workspace
          </Typography>

          <FormControl size="small">
            <Select
              value={selectedProject?.id ?? ""}
              displayEmpty
              sx={{
                minWidth: 320,
                bgcolor: "white",
              }}
              onChange={(event) => {
                const project =
                  projects.find(
                    (project) =>
                      project.id ===
                      Number(event.target.value),
                  );

                if (project) {
                  setSelectedProject(project);
                }
              }}
            >
              {projects.map((project) => (
                <MenuItem
                  key={project.id}
                  value={project.id}
                >
                  {project.project_code}
                  {" - "}
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
              }}
            >
              A
            </Avatar>

            <Typography variant="body2">
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}