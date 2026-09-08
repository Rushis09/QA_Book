import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useNotification } from "../../contexts/NotificationContext";
import { aiService } from "../../services/aiService";
import automationService from "../../automation/services/automationService";
import api from "../../services/api";

import type { AutomationProject } from "../../automation/types/automation";

interface GitHubSettingsConnection {
  automation_project_id: number;
  automation_project_name: string;
  project_id: number;
  project_name: string;
  github_username: string | null;
  repository_owner: string | null;
  repository_name: string | null;
  branch: string | null;
  repository_url: string | null;
  connected: boolean;
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        mb: 2,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: "rgba(53, 109, 255, 0.08)",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.96rem",
            fontWeight: 750,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.35,
            fontSize: "0.72rem",
            lineHeight: 1.45,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

function SettingField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        p: 1.5,
        minHeight: 76,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            display: "flex",
            color: "text.secondary",
          }}
        >
          {icon}
        </Box>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: "0.66rem",
            fontWeight: 650,
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: "0.82rem",
          fontWeight: 650,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function SettingsPage() {
  const { account, logout } = useAuth();
  const { projects } = useWorkspace();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [aiConfigured, setAiConfigured] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(true);

  const [aiDialogOpen, setAiDialogOpen] =
    useState(false);

  const [aiApiKey, setAiApiKey] =
    useState("");

  const [showApiKey, setShowApiKey] =
    useState(false);

  const [aiSaving, setAiSaving] =
    useState(false);

  const [aiTesting, setAiTesting] =
    useState(false);

  const [aiRemoving, setAiRemoving] =
    useState(false);

  const [githubConnections, setGithubConnections] =
    useState<GitHubSettingsConnection[]>([]);

  const [githubLoading, setGithubLoading] =
    useState(true);

  const [disconnectTarget, setDisconnectTarget] =
    useState<GitHubSettingsConnection | null>(null);

  const [disconnecting, setDisconnecting] =
    useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] =
    useState(false);

  const [forgotPasswordEmail, setForgotPasswordEmail] =
    useState(account?.email || "");

  const [forgotPasswordSending, setForgotPasswordSending] =
    useState(false);

  const [connectDialogOpen, setConnectDialogOpen] =
    useState(false);

  const [connectableAutomationProjects, setConnectableAutomationProjects] =
    useState<AutomationProject[]>([]);

  const [connectProjectsLoading, setConnectProjectsLoading] =
    useState(false);

  const [connectingProjectId, setConnectingProjectId] =
    useState<number | null>(null);

  const displayRole =
    account?.role === "PLATFORM_ADMIN"
      ? "Platform Admin"
      : "User";

  const accountStatus =
    account?.is_active
      ? "Active"
      : "Inactive";

  async function loadAIStatus() {
    try {
      setAiLoading(true);

      const response =
        await aiService.getCredentialStatus();

      setAiConfigured(response.configured);
    } catch {
      showNotification(
        "Unable to load AI configuration.",
        "error",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function loadConnectableAutomationProjects() {
    try {
      setConnectProjectsLoading(true);

      const results = await Promise.all(
        projects.map(async (project) => {
          try {
            return await automationService.getAutomationProjectByProjectId(
              project.id,
            );
          } catch {
            return null;
          }
        }),
      );

      const connectedIds = new Set(
        githubConnections.map(
          (connection) => connection.automation_project_id,
        ),
      );

      setConnectableAutomationProjects(
        results.filter(
          (project): project is AutomationProject =>
            project !== null && !connectedIds.has(project.id),
        ),
      );
    } finally {
      setConnectProjectsLoading(false);
    }
  }

  async function loadGitHubConnections() {
    try {
      setGithubLoading(true);

      const response =
        await automationService.getGitHubConnections();

      setGithubConnections(response);
    } catch {
      showNotification(
        "Unable to load GitHub connections.",
        "error",
      );
    } finally {
      setGithubLoading(false);
    }
  }

  useEffect(() => {
    loadAIStatus();
    loadGitHubConnections();
  }, []);

  useEffect(() => {
    if (connectDialogOpen) {
      loadConnectableAutomationProjects();
    }
  }, [connectDialogOpen, projects, githubConnections]);

  async function handleSaveAIKey() {
    if (!aiApiKey.trim()) {
      showNotification(
        "Please enter your Gemini API key.",
        "error",
      );
      return;
    }

    try {
      setAiSaving(true);

      await aiService.saveCredential({
        provider: "gemini",
        api_key: aiApiKey.trim(),
      });

      setAiConfigured(true);
      setAiApiKey("");
      setAiDialogOpen(false);

      showNotification(
        "Gemini API key saved successfully.",
        "success",
      );
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to save Gemini API key.",
        "error",
      );
    } finally {
      setAiSaving(false);
    }
  }

  async function handleTestAI() {
    try {
      setAiTesting(true);

      const response =
        await aiService.testCredential();

      if (response.connected) {
        showNotification(
          response.message,
          "success",
        );
      } else {
        showNotification(
          response.message,
          "error",
        );
      }
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Gemini connection test failed.",
        "error",
      );
    } finally {
      setAiTesting(false);
    }
  }

  async function handleRemoveAI() {
    try {
      setAiRemoving(true);

      await aiService.deleteCredential();

      setAiConfigured(false);

      showNotification(
        "Gemini API key removed successfully.",
        "success",
      );
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to remove Gemini API key.",
        "error",
      );
    } finally {
      setAiRemoving(false);
    }
  }

  async function handleConnectGitHub(automationProjectId: number) {
    try {
      setConnectingProjectId(automationProjectId);

      const response = await automationService.authorizeGitHub(
        automationProjectId,
        "/settings",
      );

      window.location.href = response.authorization_url;
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to start GitHub authorization.",
        "error",
      );
      setConnectingProjectId(null);
    }
  }

  async function handleDisconnectGitHub() {
    if (!disconnectTarget) {
      return;
    }

    try {
      setDisconnecting(true);

      await automationService.disconnectGitHub(
        disconnectTarget.automation_project_id,
      );

      setGithubConnections((current) =>
        current.filter(
          (connection) =>
            connection.automation_project_id !==
            disconnectTarget.automation_project_id,
        ),
      );

      setDisconnectTarget(null);

      showNotification(
        "GitHub access disconnected successfully.",
        "success",
      );
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to disconnect GitHub.",
        "error",
      );
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleForgotPassword() {
    const email = forgotPasswordEmail.trim().toLowerCase();

    if (!email) {
      showNotification(
        "Please enter your account email.",
        "error",
      );
      return;
    }

    try {
      setForgotPasswordSending(true);

      const response = await api.post<{ message: string }>(
        "/auth/forgot-password",
        {
          email,
        },
      );

      showNotification(
        response.data.message,
        "success",
      );

      setForgotPasswordDialogOpen(false);
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to send password reset instructions.",
        "error",
      );
    } finally {
      setForgotPasswordSending(false);
    }
  }

  function openForgotPasswordDialog() {
    setForgotPasswordEmail(account?.email || "");
    setForgotPasswordDialogOpen(true);
  }

  function closeForgotPasswordDialog() {
    if (forgotPasswordSending) {
      return;
    }

    setForgotPasswordDialogOpen(false);
    setForgotPasswordEmail(account?.email || "");
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification(
        "Please complete all password fields.",
        "error",
      );
      return;
    }

    if (newPassword.length < 8) {
      showNotification(
        "New password must be at least 8 characters.",
        "error",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification(
        "New password and confirmation do not match.",
        "error",
      );
      return;
    }

    if (currentPassword === newPassword) {
      showNotification(
        "New password must be different from the current password.",
        "error",
      );
      return;
    }

    try {
      setPasswordSaving(true);

      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      showNotification(
        "Password changed successfully.",
        "success",
      );

      closePasswordDialog();
    } catch (error: any) {
      showNotification(
        error?.response?.data?.detail ||
          "Unable to change password.",
        "error",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  function closePasswordDialog() {
    if (passwordSaving) {
      return;
    }

    setPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <Box
      sx={{
        p: {
          xs: 1.5,
          md: 2.25,
        },
        maxWidth: 1280,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* Page header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h1"
          sx={{
            fontSize: "1.45rem",
            lineHeight: 1.2,
            fontWeight: 750,
            letterSpacing: "-0.035em",
          }}
        >
          Settings
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            fontSize: "0.78rem",
          }}
        >
          Manage your account, security, AI configuration,
          and automation connections.
        </Typography>
      </Box>

      {/* Profile */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              md: 2.25,
            },
            "&:last-child": {
              pb: {
                xs: 1.75,
                md: 2.25,
              },
            },
          }}
        >
          <SectionHeader
            icon={
              <AccountCircleOutlinedIcon
                sx={{ fontSize: 21 }}
              />
            }
            title="Profile"
            description="Your QABook account information."
          />

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SettingField
                label="Username"
                value={
                  account?.username || "-"
                }
                icon={
                  <AccountCircleOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SettingField
                label="Email"
                value={
                  account?.email || "-"
                }
                icon={
                  <EmailOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SettingField
                label="Role"
                value={displayRole}
                icon={
                  <AdminPanelSettingsOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  p: 1.5,
                  minHeight: 76,
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 650,
                    mb: 0.8,
                  }}
                >
                  Account Status
                </Typography>

                <Chip
                  label={accountStatus}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Security */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              md: 2.25,
            },
            "&:last-child": {
              pb: {
                xs: 1.75,
                md: 2.25,
              },
            },
          }}
        >
          <SectionHeader
            icon={
              <SecurityOutlinedIcon
                sx={{ fontSize: 21 }}
              />
            }
            title="Security"
            description="Protect your account and manage your active session."
          />

          <Divider sx={{ mb: 1.75 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                }}
              >
                Password & Session
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  fontSize: "0.7rem",
                }}
              >
                Change your password or sign out of this account.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <LockOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                }
                onClick={() => setPasswordDialogOpen(true)}
                disabled={passwordSaving}
                sx={{
                  height: 34,
                  fontSize: "0.72rem",
                  textTransform: "none",
                }}
              >
                Change Password
              </Button>

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={
                  <LogoutOutlinedIcon
                    sx={{ fontSize: 17 }}
                  />
                }
                onClick={handleLogout}
                sx={{
                  height: 34,
                  fontSize: "0.72rem",
                  textTransform: "none",
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* AI */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              md: 2.25,
            },
            "&:last-child": {
              pb: {
                xs: 1.75,
                md: 2.25,
              },
            },
          }}
        >
          <SectionHeader
            icon={
              <AutoAwesomeOutlinedIcon
                sx={{ fontSize: 21 }}
              />
            }
            title="AI Configuration"
            description="Configure the AI provider used by QABook's AI-assisted features."
          />

          <Divider sx={{ mb: 1.75 }} />

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.75,
              p: 1.75,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: {
                  xs: "flex-start",
                  sm: "center",
                },
                justifyContent: "space-between",
                gap: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(53, 109, 255, 0.08)",
                    color: "primary.main",
                  }}
                >
                  <AutoAwesomeOutlinedIcon
                    sx={{ fontSize: 21 }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.84rem",
                      fontWeight: 750,
                    }}
                  >
                    Google Gemini
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.2,
                      fontSize: "0.68rem",
                    }}
                  >
                    AI-powered requirement, scenario, and test case generation.
                  </Typography>
                </Box>
              </Box>

              {aiLoading ? (
                <CircularProgress size={18} />
              ) : (
                <Chip
                  label={
                    aiConfigured
                      ? "Configured"
                      : "Not Configured"
                  }
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.67rem",
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.7rem",
                }}
              >
                Your API key is stored securely on the QABook server and is never displayed here.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    aiTesting ? (
                      <CircularProgress
                        size={14}
                      />
                    ) : (
                      <RefreshOutlinedIcon
                        sx={{ fontSize: 16 }}
                      />
                    )
                  }
                  onClick={handleTestAI}
                  disabled={
                    !aiConfigured ||
                    aiTesting
                  }
                  sx={{
                    height: 32,
                    fontSize: "0.7rem",
                    textTransform: "none",
                  }}
                >
                  Test Connection
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    <AutoAwesomeOutlinedIcon
                      sx={{ fontSize: 16 }}
                    />
                  }
                  onClick={() =>
                    setAiDialogOpen(true)
                  }
                  sx={{
                    height: 32,
                    fontSize: "0.7rem",
                    textTransform: "none",
                  }}
                >
                  {aiConfigured
                    ? "Update API Key"
                    : "Add API Key"}
                </Button>

                {aiConfigured && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    startIcon={
                      aiRemoving ? (
                        <CircularProgress
                          size={14}
                        />
                      ) : (
                        <DeleteIcon
                          sx={{ fontSize: 16 }}
                        />
                      )
                    }
                    onClick={handleRemoveAI}
                    disabled={aiRemoving}
                    sx={{
                      height: 32,
                      fontSize: "0.7rem",
                      textTransform: "none",
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Automation / GitHub */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              md: 2.25,
            },
            "&:last-child": {
              pb: {
                xs: 1.75,
                md: 2.25,
              },
            },
          }}
        >
          <SectionHeader
            icon={
              <GitHubIcon
                sx={{ fontSize: 21 }}
              />
            }
            title="Automation & Integrations"
            description="Manage GitHub connections used by your automation projects."
          />

          <Divider sx={{ mb: 1.75 }} />

          {!githubLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 1.25,
              }}
            >
              <Button
                variant="contained"
                size="small"
                startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
                onClick={() => setConnectDialogOpen(true)}
                sx={{
                  height: 32,
                  fontSize: "0.7rem",
                  textTransform: "none",
                }}
              >
                Connect GitHub
              </Button>
            </Box>
          )}

          {githubLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : githubConnections.length === 0 ? (
            <Alert
              severity="info"
              icon={
                <LinkOutlinedIcon
                  sx={{ fontSize: 19 }}
                />
              }
              sx={{
                fontSize: "0.72rem",
                borderRadius: 1.5,
              }}
            >
              No GitHub connections are currently configured for your automation projects.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
              }}
            >
              {githubConnections.map(
                (connection) => (
                  <Box
                    key={
                      connection.automation_project_id
                    }
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.75,
                      p: 1.75,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: {
                          xs: "flex-start",
                          md: "center",
                        },
                        justifyContent: "space-between",
                        gap: 2,
                        flexDirection: {
                          xs: "column",
                          md: "row",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <GitHubIcon
                            sx={{
                              fontSize: 20,
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: "0.84rem",
                              fontWeight: 750,
                            }}
                          >
                            {connection.github_username ||
                              "GitHub Account"}
                          </Typography>

                          <Chip
                            label="Connected"
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.62rem",
                              fontWeight: 700,
                            }}
                          />
                        </Box>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.45,
                            fontSize: "0.69rem",
                          }}
                        >
                          {connection.project_name}
                          {" • "}
                          {connection.automation_project_name}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={
                          <DeleteIcon
                            sx={{ fontSize: 16 }}
                          />
                        }
                        onClick={() =>
                          setDisconnectTarget(
                            connection,
                          )
                        }
                        sx={{
                          height: 32,
                          fontSize: "0.7rem",
                          textTransform: "none",
                          flexShrink: 0,
                        }}
                      >
                        Disconnect
                      </Button>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.25}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                        }}
                      >
                        <SettingField
                          label="Repository"
                          value={
                            connection.repository_name ||
                            "Not selected"
                          }
                          icon={
                            <GitHubIcon
                              sx={{ fontSize: 17 }}
                            />
                          }
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                        }}
                      >
                        <SettingField
                          label="Branch"
                          value={
                            connection.branch ||
                            "main"
                          }
                          icon={
                            <LinkOutlinedIcon
                              sx={{ fontSize: 17 }}
                            />
                          }
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                        }}
                      >
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor:
                              "divider",
                            borderRadius: 1.5,
                            p: 1.5,
                            minHeight: 76,
                          }}
                        >
                          <Typography
                            color="text.secondary"
                            sx={{
                              fontSize:
                                "0.66rem",
                              fontWeight: 650,
                              mb: 0.8,
                            }}
                          >
                            Repository Access
                          </Typography>

                          {connection.repository_url ? (
                            <Button
                              component="a"
                              href={
                                connection.repository_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              startIcon={
                                <LinkOutlinedIcon
                                  sx={{
                                    fontSize: 15,
                                  }}
                                />
                              }
                              sx={{
                                p: 0,
                                minWidth: 0,
                                height: 24,
                                fontSize:
                                  "0.68rem",
                                textTransform:
                                  "none",
                              }}
                            >
                              Open Repository
                            </Button>
                          ) : (
                            <Typography
                              sx={{
                                fontSize:
                                  "0.78rem",
                                fontWeight: 650,
                              }}
                            >
                              Not connected
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ),
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Account actions */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "error.light",
          borderRadius: 2,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.75,
              md: 2.25,
            },
            "&:last-child": {
              pb: {
                xs: 1.75,
                md: 2.25,
              },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 750,
            }}
          >
            Account
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.35,
              fontSize: "0.7rem",
            }}
          >
            Sign out of your current QABook session.
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={
              <LogoutOutlinedIcon
                sx={{ fontSize: 17 }}
              />
            }
            onClick={handleLogout}
            sx={{
              height: 34,
              fontSize: "0.72rem",
              textTransform: "none",
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* GitHub connect dialog */}
      <Dialog
        open={connectDialogOpen}
        onClose={() => {
          if (connectingProjectId === null) {
            setConnectDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          Connect GitHub
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{
              mb: 1.75,
              fontSize: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            Select the automation project that should use this GitHub authorization.
          </Typography>

          {connectProjectsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 3,
              }}
            >
              <CircularProgress size={23} />
            </Box>
          ) : connectableAutomationProjects.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                fontSize: "0.72rem",
                borderRadius: 1.5,
              }}
            >
              No unconnected automation projects are available. Create an automation project first, or connect another project from the Automation page.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {connectableAutomationProjects.map((project) => (
                <Box
                  key={project.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    p: 1.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.79rem",
                        fontWeight: 700,
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                        fontSize: "0.67rem",
                      }}
                    >
                      {project.framework} • {project.status}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleConnectGitHub(project.id)}
                    disabled={connectingProjectId !== null}
                    startIcon={
                      connectingProjectId === project.id ? (
                        <CircularProgress size={14} />
                      ) : (
                        <LinkOutlinedIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    sx={{
                      height: 30,
                      fontSize: "0.68rem",
                      textTransform: "none",
                      flexShrink: 0,
                    }}
                  >
                    {connectingProjectId === project.id
                      ? "Connecting..."
                      : "Connect"}
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setConnectDialogOpen(false)}
            disabled={connectingProjectId !== null}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change password dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={closePasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          Change Password
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2,
              fontSize: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            Update the password you use to sign in to QABook.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              disabled={passwordSaving}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          setShowCurrentPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                      >
                        {showCurrentPassword ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              disabled={passwordSaving}
              autoComplete="new-password"
              helperText="Minimum 8 characters"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          setShowNewPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                      >
                        {showNewPassword ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={passwordSaving}
              autoComplete="new-password"
              error={
                Boolean(confirmPassword) &&
                confirmPassword !== newPassword
              }
              helperText={
                Boolean(confirmPassword) &&
                confirmPassword !== newPassword
                  ? "Passwords do not match"
                  : "Re-enter your new password"
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) => !current,
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirmation password"
                            : "Show confirmation password"
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={() => {
                closePasswordDialog();
                openForgotPasswordDialog();
              }}
              disabled={passwordSaving}
              sx={{
                fontSize: "0.7rem",
                textTransform: "none",
              }}
            >
              Forgot password?
            </Button>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closePasswordDialog}
            disabled={passwordSaving}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              passwordSaving ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            startIcon={
              passwordSaving ? (
                <CircularProgress size={15} />
              ) : (
                <LockOutlinedIcon sx={{ fontSize: 17 }} />
              )
            }
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forgot password dialog */}
      <Dialog
        open={forgotPasswordDialogOpen}
        onClose={closeForgotPasswordDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          Reset Password
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2,
              fontSize: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            Enter your QABook account email and we will send
            password reset instructions if an account exists.
          </Typography>

          <TextField
            fullWidth
            label="Account Email"
            type="email"
            value={forgotPasswordEmail}
            disabled
            autoComplete="email"
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={closeForgotPasswordDialog}
            disabled={forgotPasswordSending}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleForgotPassword}
            disabled={
              forgotPasswordSending ||
              !forgotPasswordEmail.trim()
            }
            startIcon={
              forgotPasswordSending ? (
                <CircularProgress size={15} />
              ) : (
                <LockOutlinedIcon sx={{ fontSize: 17 }} />
              )
            }
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Send Reset Instructions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gemini API key dialog */}
      <Dialog
        open={aiDialogOpen}
        onClose={() => {
          if (!aiSaving) {
            setAiDialogOpen(false);
            setAiApiKey("");
            setShowApiKey(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          {aiConfigured
            ? "Update Gemini API Key"
            : "Configure Gemini"}
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2,
              fontSize: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            Enter your Google Gemini API key. QABook stores
            the key securely on the server and does not
            return it to the browser after saving.
          </Typography>

          <TextField
            fullWidth
            label="Gemini API Key"
            type={
              showApiKey
                ? "text"
                : "password"
            }
            value={aiApiKey}
            onChange={(event) =>
              setAiApiKey(
                event.target.value,
              )
            }
            placeholder="Enter your Gemini API key"
            disabled={aiSaving}
            autoComplete="new-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() =>
                        setShowApiKey(
                          (current) =>
                            !current,
                        )
                      }
                      aria-label={
                        showApiKey
                          ? "Hide API key"
                          : "Show API key"
                      }
                    >
                      {showApiKey ? (
                        <VisibilityOffOutlinedIcon
                          sx={{ fontSize: 18 }}
                        />
                      ) : (
                        <VisibilityOutlinedIcon
                          sx={{ fontSize: 18 }}
                        />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() => {
              setAiDialogOpen(false);
              setAiApiKey("");
              setShowApiKey(false);
            }}
            disabled={aiSaving}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveAIKey}
            disabled={
              aiSaving ||
              !aiApiKey.trim()
            }
            startIcon={
              aiSaving ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <AutoAwesomeOutlinedIcon
                  sx={{ fontSize: 17 }}
                />
              )
            }
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Save API Key
          </Button>
        </DialogActions>
      </Dialog>

      {/* GitHub disconnect confirmation */}
      <Dialog
        open={Boolean(disconnectTarget)}
        onClose={() => {
          if (!disconnecting) {
            setDisconnectTarget(null);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 750,
          }}
        >
          Disconnect GitHub?
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: "0.78rem",
              lineHeight: 1.55,
            }}
          >
            This will disconnect QABook from the GitHub
            authorization used by{" "}
            <strong>
              {disconnectTarget?.automation_project_name ||
                "this automation project"}
            </strong>
            .
          </Typography>

          <Alert
            severity="info"
            sx={{
              mt: 1.75,
              fontSize: "0.72rem",
              borderRadius: 1.5,
            }}
          >
            Your QABook project, automation project,
            repository, test files, and QA data will be
            preserved. You can reconnect GitHub later.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() =>
              setDisconnectTarget(null)
            }
            disabled={disconnecting}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDisconnectGitHub}
            disabled={disconnecting}
            startIcon={
              disconnecting ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <DeleteIcon
                  sx={{ fontSize: 17 }}
                />
              )
            }
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
            }}
          >
            Disconnect GitHub
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

