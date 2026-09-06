import { useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";

import LogoutDialog from "../auth/LogoutDialog";

export default function Header() {
  const {
    projects,
    workspaceUsers,
    selectedProject,
    isAllProjects,
    selectedUserFilter,
    setSelectedProject,
    setSelectedUserFilter,
  } = useWorkspace();

  const {
    username,
    role,
    logout,
  } = useAuth();

  const { showNotification } =
    useNotification();

  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);

  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const accountMenuOpen =
    Boolean(accountMenuAnchor);

  const displayUsername =
    username || "User";

  const displayRole =
    role === "PLATFORM_ADMIN"
      ? "Platform Admin"
      : "User";

  const avatarLetter =
    displayUsername.charAt(0).toUpperCase();

  const isPlatformAdmin =
    role === "PLATFORM_ADMIN";

  function handleAccountMenuOpen(
    event: React.MouseEvent<HTMLElement>,
  ) {
    setAccountMenuAnchor(
      event.currentTarget,
    );
  }

  function handleAccountMenuClose() {
    setAccountMenuAnchor(null);
  }

  function handleLogoutClick() {
    handleAccountMenuClose();
    setLogoutOpen(true);
  }

  function handleLogout() {
    logout();

    setLogoutOpen(false);

    showNotification(
      "Logged out successfully.",
      "success",
    );
  }

  async function handleUserFilterChange(
    value: string,
  ) {
    if (value === "none") {
      await setSelectedUserFilter(
        "NONE",
      );
      return;
    }

    if (value === "all") {
      await setSelectedUserFilter(
        "ALL",
      );
      return;
    }

    await setSelectedUserFilter(
      Number(value),
    );
  }

  function handleProjectFilterChange(
    value: string,
  ) {
    if (value === "all") {
      setSelectedProject(null);
      return;
    }

    const project = projects.find(
      (project) =>
        project.id === Number(value),
    );

    if (project) {
      setSelectedProject(project);
    }
  }

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 64,
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
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

              {isPlatformAdmin && (
                <FormControl size="small">
                  <Select
                    value={
                      selectedUserFilter ===
                      "NONE"
                        ? "none"
                        : selectedUserFilter ===
                            "ALL"
                          ? "all"
                          : String(
                              selectedUserFilter,
                            )
                    }
                    sx={{
                      minWidth: 150,
                      bgcolor: "white",
                    }}
                    onChange={(event) => {
                      handleUserFilterChange(
                        String(
                          event.target.value,
                        ),
                      );
                    }}
                  >
                    <MenuItem value="none">
                      None
                    </MenuItem>

                    <MenuItem value="all">
                      All Users
                    </MenuItem>

                    {workspaceUsers.map(
                      (user) => (
                        <MenuItem
                          key={user.id}
                          value={user.id}
                        >
                          {user.username}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              )}

              <FormControl size="small">
                <Select
                  value={
                    isAllProjects
                      ? "all"
                      : selectedProject?.id ?? ""
                  }
                  displayEmpty
                  sx={{
                    minWidth: 320,
                    bgcolor: "white",
                  }}
                  onChange={(event) => {
                    handleProjectFilterChange(
                      String(
                        event.target.value,
                      ),
                    );
                  }}
                >
                  <MenuItem value="all">
                    All Projects
                  </MenuItem>

                  {projects.map(
                    (project) => (
                      <MenuItem
                        key={project.id}
                        value={project.id}
                      >
                        {project.project_code}
                        {" - "}
                        {project.name}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={
                  handleAccountMenuOpen
                }
                size="small"
                sx={{
                  color: "inherit",
                  p: 0.5,
                }}
                aria-label="Account menu"
                aria-controls={
                  accountMenuOpen
                    ? "account-menu"
                    : undefined
                }
                aria-haspopup="true"
                aria-expanded={
                  accountMenuOpen
                    ? "true"
                    : undefined
                }
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "0.95rem",
                  }}
                >
                  {avatarLetter}
                </Avatar>
              </IconButton>

              <Box
                sx={{
                  ml: 1,
                  mr: 0.5,
                  minWidth: 90,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {displayUsername}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.75,
                    lineHeight: 1.2,
                  }}
                >
                  {displayRole}
                </Typography>
              </Box>
            </Box>

            <Menu
              id="account-menu"
              anchorEl={
                accountMenuAnchor
              }
              open={accountMenuOpen}
              onClose={
                handleAccountMenuClose
              }
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  minWidth: 220,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {displayUsername}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {displayRole}
                </Typography>
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleAccountMenuClose();

                  showNotification(
                    "Profile will be available here.",
                    "info",
                  );
                }}
              >
                <AccountCircleIcon
                  fontSize="small"
                  sx={{ mr: 1.5 }}
                />

                Profile
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleAccountMenuClose();

                  showNotification(
                    "Settings will be available here.",
                    "info",
                  );
                }}
              >
                <SettingsIcon
                  fontSize="small"
                  sx={{ mr: 1.5 }}
                />

                Settings
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={
                  handleLogoutClick
                }
              >
                <LogoutIcon
                  fontSize="small"
                  sx={{ mr: 1.5 }}
                />

                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <LogoutDialog
        open={logoutOpen}
        onClose={() =>
          setLogoutOpen(false)
        }
        onLogout={handleLogout}
      />
    </>
  );
}