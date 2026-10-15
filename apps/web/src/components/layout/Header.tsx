
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";

import LogoutDialog from "../auth/LogoutDialog";
import QABookLogo from "../brand/QABookLogo";

export default function Header() {
  const navigate = useNavigate();

  const {
    projects,
    workspaceUsers,
    selectedProject,
    isAllProjects,
    selectedUserFilter,
    setSelectedProject,
    setSelectedUserFilter,
  } = useWorkspace();

  const { username, role, logout } = useAuth();
  const { showNotification } = useNotification();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const isPlatformAdmin = role === "PLATFORM_ADMIN";

  function handleLogout() {
    logout();

    setLogoutOpen(false);

    navigate("/", { replace: true });

    showNotification(
      "Logged out successfully.",
      "success",
    );
  }

  async function handleUserFilterChange(value: string) {
    if (value === "none") {
      await setSelectedUserFilter("NONE");
      return;
    }

    if (value === "all") {
      await setSelectedUserFilter("ALL");
      return;
    }

    await setSelectedUserFilter(Number(value));
  }

  function handleProjectFilterChange(value: string) {
    if (value === "all") {
      setSelectedProject(null);
      return;
    }

    const project = projects.find(
      (project) => project.id === Number(value),
    );

    if (project) {
      setSelectedProject(project);
    }
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          flexShrink: 0,
          bgcolor: "#ffffff",
          color: "#344054",
          borderBottom: "1px solid #e4e7ec",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: { xs: 52, md: 56 },
            height: { xs: 52, md: 56 },
            px: { xs: 1.5, md: 2 },
            gap: 2,
          }}
        >
          {/* Brand */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transform: "scale(0.9)",
              transformOrigin: "left center",
            }}
          >
            <QABookLogo size="md" />
          </Box>

          {/* Right side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 1.75 },
              minWidth: 0,
              ml: "auto",
            }}
          >
            {/* Workspace filters */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.75, md: 1 },
                minWidth: 0,
              }}
            >
              <Typography
                variant="body2"
                color="inherit"
                sx={{
                  opacity: 0.8,
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                }}
              >
                Workspace
              </Typography>

              {isPlatformAdmin && (
                <FormControl size="small">
                  <Select
                    value={
                      selectedUserFilter === "NONE"
                        ? "none"
                        : selectedUserFilter === "ALL"
                          ? "all"
                          : String(selectedUserFilter)
                    }
                    inputProps={{
                      "aria-label": "Workspace user filter",
                    }}
                    sx={{
                      minWidth: { xs: 105, md: 125 },
                      height: 36,
                      bgcolor: "white",
                      fontSize: "0.75rem",
                      borderRadius: "7px",
                      "& .MuiSelect-select": {
                        py: 0.8,
                        px: 1.2,
                      },
                    }}
                    onChange={(event) => {
                      handleUserFilterChange(
                        String(event.target.value),
                      );
                    }}
                  >
                    <MenuItem value="none">
                      None
                    </MenuItem>

                    <MenuItem value="all">
                      All Users
                    </MenuItem>

                    {workspaceUsers.map((user) => (
                      <MenuItem
                        key={user.id}
                        value={user.id}
                      >
                        {user.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl
                size="small"
                sx={{
                  minWidth: {
                    xs: 190,
                    sm: 240,
                    md: 285,
                  },
                }}
              >
                <Select
                  value={
                    isAllProjects
                      ? "all"
                      : selectedProject?.id ?? ""
                  }
                  displayEmpty
                  inputProps={{
                    "aria-label": "Workspace project filter",
                  }}
                  sx={{
                    height: 36,
                    bgcolor: "white",
                    fontSize: "0.75rem",
                    borderRadius: "7px",
                    "& .MuiSelect-select": {
                      py: 0.8,
                      px: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                  onChange={(event) => {
                    handleProjectFilterChange(
                      String(event.target.value),
                    );
                  }}
                >
                  <MenuItem value="all">
                    All Projects
                  </MenuItem>

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
            </Box>

            {/* Username, Settings and Logout */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.75, md: 1 },
                flexShrink: 0,
              }}
            >
              {/* Logged-in username */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: 0,
                  maxWidth: { xs: 90, sm: 150, md: 200 },
                }}
              >
                <AccountCircleOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: "#667085",
                    flexShrink: 0,
                  }}
                />

                <Typography
                  data-testid="header-username"
                  variant="body2"
                  title={username ?? ""}
                  sx={{
                    color: "#344054",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {username ?? "User"}
                </Typography>
              </Box>

              <Button
                id="header-settings-button"
                aria-label="Settings"
                startIcon={<SettingsIcon />}
                onClick={() => navigate("/settings")}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Settings
              </Button>

              <Button
                id="header-logout-button"
                aria-label="Open logout confirmation"
                startIcon={<LogoutIcon />}
                onClick={() => setLogoutOpen(true)}
                variant="contained"
                color="error"
                size="small"
                sx={{
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout confirmation */}
      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
