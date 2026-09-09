import { useState } from "react";
import { useNavigate } from "react-router-dom";
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


import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

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

    navigate("/", { replace: true });

    showNotification(
      "Logged out successfully.",
      "success",
    );
  }

  async function handleUserFilterChange(
    value: string,
  ) {
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
            minHeight: {
              xs: 52,
              md: 56,
            },
            height: {
              xs: 52,
              md: 56,
            },
            px: {
              xs: 1.5,
              md: 2,
            },
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
            <QABookLogo
              size="md"
            />
          </Box>

          {/* Right side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1,
                md: 1.75,
              },
              minWidth: 0,
              ml: "auto",
            }}
          >
            {/* Workspace filters */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: {
                  xs: 0.75,
                  md: 1,
                },
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
                          : String(
                              selectedUserFilter,
                            )
                    }
                    sx={{
                      minWidth: {
                        xs: 105,
                        md: 125,
                      },
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

            {/* Account */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <IconButton
                onClick={
                  handleAccountMenuOpen
                }
                size="small"
                sx={{
                  color: "inherit",
                  p: 0.25,
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
                    width: 32,
                    height: 32,
                    fontSize: "0.82rem",
                    bgcolor: "#eef4ff",
                    color: "#356dff",
                    fontWeight: 700,
                  }}
                >
                  {avatarLetter}
                </Avatar>
              </IconButton>

              <Box
                sx={{
                  ml: 0.75,
                  mr: 0.25,
                  minWidth: 76,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayUsername}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.58rem",
                    opacity: 0.75,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayRole}
                </Typography>
              </Box>
            </Box>

            <Menu
              id="account-menu"
              anchorEl={accountMenuAnchor}
              open={accountMenuOpen}
              onClose={handleAccountMenuClose}
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
                  px: 1.75,
                  py: 0.8,
                  minWidth: 200,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {displayUsername}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.65rem",
                  }}
                >
                  {displayRole}
                </Typography>
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleAccountMenuClose();
                  navigate("/settings");
                }}
                sx={{
                  minHeight: 36,
                  fontSize: "0.75rem",
                }}
              >
                <SettingsIcon
                  fontSize="small"
                  sx={{
                    mr: 1.25,
                    fontSize: 18,
                  }}
                />

                Settings
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={handleLogoutClick}
                sx={{
                  minHeight: 36,
                  fontSize: "0.75rem",
                }}
              >
                <LogoutIcon
                  fontSize="small"
                  sx={{
                    mr: 1.25,
                    fontSize: 18,
                  }}
                />

                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
}