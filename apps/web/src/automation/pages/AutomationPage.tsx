import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useNotification } from "../../contexts/NotificationContext";

import { testCaseService } from "../../services/testCaseService";
import automationService, {
  type GitHubRepository,
} from "../services/automationService";

import AutomationMappingDialog from "../components/AutomationMappingDialog";
import AutomationMappingTable from "../components/AutomationMappingTable";

import type { TestCase } from "../../types/testCase";
import type {
  AutomationProject,
  AutomationTestMapping,
} from "../types/automation";

export default function AutomationPage() {
  const {
    selectedProject
  } = useWorkspace();

  const effectiveProject = selectedProject;

  const { showNotification } = useNotification();

  const [automationProject, setAutomationProject] =
    useState<AutomationProject | null>(null);

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [mappings, setMappings] = useState<AutomationTestMapping[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deinitializing, setDeinitializing] = useState(false);
  const [startingRun, setStartingRun] = useState(false);
  const [bulkMapping, setBulkMapping] = useState(false);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [framework] = useState("Python + pytest + Playwright");

  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);

  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCase | null>(null);

  const [selectedMapping, setSelectedMapping] =
    useState<AutomationTestMapping | undefined>(undefined);

  const [automationRun, setAutomationRun] = useState<{
    test_run_id: number;
    run_code: string;
    automation_token: string;
  } | null>(null);

  const [deinitializeConfirmOpen, setDeinitializeConfirmOpen] =
    useState(false);

  const [repositoryDialogOpen, setRepositoryDialogOpen] = useState(false);

  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);

  const [repositoriesLoading, setRepositoriesLoading] = useState(false);

  const [repositorySaving, setRepositorySaving] = useState(false);

  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);

  const [selectedBranch, setSelectedBranch] = useState("main");

  const [repositoryError, setRepositoryError] = useState("");

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubConnectionLoading, setGithubConnectionLoading] = useState(false);
  const [generatingFramework, setGeneratingFramework] = useState(false);

  const loadGitHubConnection = async (automationProjectId: number) => {
    try {
      setGithubConnectionLoading(true);

      const connection =
        await automationService.getGitHubConnection(automationProjectId);

      setGithubConnected(connection.connected);
    } catch (error) {
      console.error("Failed to load GitHub connection:", error);
      setGithubConnected(false);
    } finally {
      setGithubConnectionLoading(false);
    }
  };

  const mappedTestCaseIds = useMemo(
    () => new Set(mappings.map((mapping) => mapping.test_case_id)),
    [mappings]
  );

  async function loadAutomationData() {
    if (!effectiveProject) {
      setAutomationProject(null);
      setTestCases([]);
      setMappings([]);
      setAutomationRun(null);
      setGithubConnected(false);
      setError("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const testCaseData = await testCaseService.getTestCases(
        effectiveProject.id
      );

      setTestCases(
        testCaseData.filter(
          (testCase) => testCase.automation_eligibility === "Eligible"
        )
      );

      let automationProjectData: AutomationProject | null = null;

      try {
        automationProjectData =
          await automationService.getAutomationProjectByProjectId(
            effectiveProject.id
          );
      } catch (error) {
        const status = (
          error as {
            response?: {
              status?: number;
            };
          }
        ).response?.status;

        if (status !== 404) {
          throw error;
        }
      }

      if (!automationProjectData) {
        setAutomationProject(null);
        setMappings([]);
        setAutomationRun(null);
        setGithubConnected(false);
        return;
      }

      setAutomationProject(automationProjectData);

      await loadGitHubConnection(automationProjectData.id);

      const mappingData =
        await automationService.getAutomationTestMappings(
          automationProjectData.id
        );

      setMappings(mappingData);
    } catch (error) {
      console.error(error);

      setAutomationProject(null);
      setMappings([]);
      setGithubConnected(false);

      setError("Failed to load automation workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAutomationData();
  }, [effectiveProject]);

  async function handleInitialize() {
    if (!effectiveProject || automationProject || saving) {
      return;
    }

    if (!name.trim()) {
      showNotification(
        "Automation workspace name is required.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await automationService.createAutomationProject({
        project_id: effectiveProject.id,
        name: name.trim(),
        framework,
        status: "Active",
        repository_url: null,
      });

      setName("");

      await loadAutomationData();

      showNotification(
        "Automation workspace created successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      setError("Failed to create automation workspace.");

      showNotification(
        "Failed to create automation workspace.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDeinitialize() {
    if (!automationProject || deinitializing) {
      return;
    }

    setDeinitializeConfirmOpen(true);
  }

  async function confirmDeinitialize() {
    if (!automationProject) {
      return;
    }

    try {
      setDeinitializing(true);
      setError("");

      await automationService.deleteAutomationProject(
        automationProject.id
      );

      setAutomationRun(null);

      await loadAutomationData();

      showNotification(
        "Automation workspace removed successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      setError("Failed to remove automation workspace.");

      showNotification(
        "Failed to remove automation workspace.",
        "error"
      );
    } finally {
      setDeinitializing(false);
      setDeinitializeConfirmOpen(false);
    }
  }

  async function handleConnectGitHub() {
    if (!automationProject) {
      return;
    }

    try {
      setGithubConnectionLoading(true);

      const response = await automationService.authorizeGitHub(
        automationProject.id
      );

      window.location.href = response.authorization_url;
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to start GitHub authorization.",
        "error"
      );
    } finally {
      setGithubConnectionLoading(false);
    }
  }

  async function handleGenerateFramework() {
    if (!automationProject || generatingFramework) {
      return;
    }

    if (!githubConnected) {
      showNotification(
        "Connect GitHub before generating the framework.",
        "error"
      );
      return;
    }

    try {
      setGeneratingFramework(true);
      setError("");

      const response =
        await automationService.generateGitHubFramework(
          automationProject.id
        );

      setAutomationProject((current) =>
        current
          ? {
              ...current,
              repository_url:
                response.repository_url,
            }
          : current
      );

      showNotification(
        "Framework generated and pushed to GitHub successfully.",
        "success"
      );

      await loadGitHubConnection(automationProject.id);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate and push the automation framework.",
        "error"
      );
    } finally {
      setGeneratingFramework(false);
    }
  }

  async function handleOpenRepositoryDialog() {
    if (!automationProject) {
      return;
    }

    setRepositoryDialogOpen(true);
    setRepositoryError("");
    setRepositoriesLoading(true);

    try {
      const response =
        await automationService.getGitHubRepositories(
          automationProject.id
        );

      setRepositories(response.repositories);

      if (
        automationProject.repository_url &&
        response.repositories.length > 0
      ) {
        const currentRepository = response.repositories.find(
          (repository) =>
            repository.html_url ===
            automationProject.repository_url
        );

        if (currentRepository) {
          setSelectedRepository(currentRepository);
          setSelectedBranch(
            currentRepository.default_branch || "main"
          );
        }
      }
    } catch (error) {
      console.error(error);

      setRepositoryError(
        "GitHub is not connected or repositories could not be loaded."
      );
    } finally {
      setRepositoriesLoading(false);
    }
  }

  async function handleSaveRepository() {
    if (
      !automationProject ||
      !selectedRepository ||
      repositorySaving
    ) {
      return;
    }

    try {
      setRepositorySaving(true);
      setRepositoryError("");

      const response =
        await automationService.selectGitHubRepository(
          automationProject.id,
          {
            repository_owner:
              selectedRepository.owner.login,
            repository_name:
              selectedRepository.name,
            branch: selectedBranch.trim() || "main",
          }
        );

      setAutomationProject((current) =>
        current
          ? {
              ...current,
              repository_url:
                response.repository_url,
            }
          : current
      );

      setGithubConnected(true);

      setRepositoryDialogOpen(false);

      showNotification(
        "GitHub repository connected successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      setRepositoryError(
        "Failed to connect the selected repository."
      );

      showNotification(
        "Failed to connect GitHub repository.",
        "error"
      );
    } finally {
      setRepositorySaving(false);
    }
  }

  async function handleStartAutomationRun() {
    if (!automationProject || startingRun) {
      return;
    }

    if (mappings.length === 0) {
      showNotification(
        "Map at least one test case before starting automation.",
        "error"
      );
      return;
    }

    if (!automationProject.repository_url) {
      showNotification(
        "Connect a GitHub repository before starting automation.",
        "error"
      );
      return;
    }

    try {
      setStartingRun(true);

      const result =
        await automationService.startAutomationRun(
          automationProject.id
        );

      setAutomationRun({
        test_run_id: result.test_run_id,
        run_code: result.run_code,
        automation_token: result.automation_token,
      });

      showNotification(
        `Automation run ${result.run_code} created successfully.`,
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to start automation run.",
        "error"
      );
    } finally {
      setStartingRun(false);
    }
  }

  async function handleCopyAutomationCommand() {
    if (!automationRun) {
      return;
    }

    const command =
      `pytest --qabook-token "${automationRun.automation_token}"`;

    try {
      await navigator.clipboard.writeText(command);

      showNotification(
        "Automation command copied to clipboard.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to copy automation command.",
        "error"
      );
    }
  }

  async function handleBulkMap(testCaseIds: number[]) {
    if (
      !automationProject ||
      bulkMapping ||
      testCaseIds.length === 0
    ) {
      return;
    }

    try {
      setBulkMapping(true);

      const result =
        await automationService.bulkCreateAutomationTestMappings(
          {
            automation_project_id:
              automationProject.id,
            test_case_ids: testCaseIds,
          }
        );

      setMappings(result);

      showNotification(
        `${testCaseIds.length} test case${
          testCaseIds.length === 1 ? "" : "s"
        } mapped successfully.`,
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to map selected test cases.",
        "error"
      );
    } finally {
      setBulkMapping(false);
    }
  }

  function handleMapTestCase(testCase: TestCase) {
    if (!automationProject) {
      return;
    }

    const mapping = mappings.find(
      (item) => item.test_case_id === testCase.id
    );

    setSelectedTestCase(testCase);
    setSelectedMapping(mapping);
    setMappingDialogOpen(true);
  }

  async function handleSaveMapping(data: {
    test_name: string;
    test_file_path: string;
  }) {
    if (!automationProject || !selectedTestCase) {
      return;
    }

    try {
      if (selectedMapping) {
        await automationService.updateAutomationTestMapping(
          selectedMapping.id,
          data
        );

        showNotification(
          "Automation mapping updated successfully.",
          "success"
        );
      } else {
        await automationService.createAutomationTestMapping({
          automation_project_id:
            automationProject.id,
          test_case_id: selectedTestCase.id,
          test_name: data.test_name,
          test_file_path: data.test_file_path,
        });

        showNotification(
          "Test case mapped successfully.",
          "success"
        );
      }

      const mappingData =
        await automationService.getAutomationTestMappings(
          automationProject.id
        );

      setMappings(mappingData);
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to save automation mapping.",
        "error"
      );

      throw error;
    }
  }

  async function handleUnmap(
    mapping: AutomationTestMapping
  ) {
    if (!automationProject) {
      return;
    }

    try {
      await automationService.deleteAutomationTestMapping(
        mapping.id
      );

      const mappingData =
        await automationService.getAutomationTestMappings(
          automationProject.id
        );

      setMappings(mappingData);

      showNotification(
        "Test case unmapped successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to unmap test case.",
        "error"
      );
    }
  }

  function handleCloseMappingDialog() {
    setMappingDialogOpen(false);
    setSelectedTestCase(null);
    setSelectedMapping(undefined);
  }

  if (!effectiveProject) {
    return (
      <Alert severity="info">
        Select a specific project to open its automation workspace.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!automationProject) {
    return (
      <PageHeader
        title="Automation"
        actionLabel={
          saving
            ? "Creating..."
            : "Create Automation Workspace"
        }
        onAction={handleInitialize}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Set up automated testing for{" "}
              <strong>
                {effectiveProject.project_code}
              </strong>{" "}
              — {effectiveProject.name}.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 4,
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">
                  Create your automation workspace
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Connect your QA project to a persistent
                  Playwright automation repository.
                </Typography>
              </Box>

              <TextField
                label="Automation workspace name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: OrangeHRM E2E Automation"
                fullWidth
              />

              <TextField
                label="Automation framework"
                value={framework}
                fullWidth
                disabled
                helperText="The current QABook automation framework."
              />

              <Alert severity="info">
                After setup, you will connect GitHub,
                select a repository, map eligible test
                cases, and execute automation through your
                CI/CD workflow.
              </Alert>
            </Stack>
          </Paper>
        </Stack>
      </PageHeader>
    );
  }

  const repositoryConnected =
    Boolean(automationProject.repository_url);

  return (
    <PageHeader
      title="Automation"
      actionLabel={
        deinitializing
          ? "Removing..."
          : "Workspace Settings"
      }
      onAction={handleDeinitialize}
    >
      <Stack spacing={3}>
        {/* Workspace overview */}
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              gap: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="h5">
                  {automationProject.name}
                </Typography>

                <Chip
                  label={automationProject.status}
                  size="small"
                  color={
                    automationProject.status ===
                    "Active"
                      ? "success"
                      : "default"
                  }
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {effectiveProject.project_code} ·{" "}
                {effectiveProject.name}
              </Typography>
            </Box>

            <Chip
              label={`${mappings.length} mapped test${
                mappings.length === 1 ? "" : "s"
              }`}
              variant="outlined"
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* Source control */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6">
                Source control
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Your automation code lives in GitHub.
                Clone it locally, make changes, and push
                them back to the repository.
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Repository
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      wordBreak: "break-all",
                    }}
                  >
                    {automationProject.repository_url ||
                      "No repository connected"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleConnectGitHub}
                    disabled={
                      githubConnectionLoading ||
                      generatingFramework
                    }
                  >
                    {githubConnectionLoading
                      ? "Connecting..."
                      : githubConnected
                        ? "Reconnect GitHub"
                        : "Connect GitHub"}
                  </Button>
                    
                  <Button
                    variant="outlined"
                    onClick={handleGenerateFramework}
                    disabled={
                      !githubConnected ||
                      generatingFramework
                    }
                  >
                    {generatingFramework
                      ? "Generating Framework..."
                      : "Generate Framework"}
                  </Button>

                  <Button
                    variant={
                      repositoryConnected
                        ? "contained"
                        : "outlined"
                    }
                    onClick={handleOpenRepositoryDialog}
                    disabled={
                      githubConnectionLoading ||
                      generatingFramework
                    }
                  >
                    {repositoryConnected
                      ? "Change Repository"
                      : "Select Repository"}
                  </Button>
                </Box>
              </Box>

              {githubConnected && !repositoryConnected && (
                <Alert severity="info">
                  GitHub is connected. Generate the framework to
                  create a new repository and push the automation
                  framework automatically.
                </Alert>
              )}

              {repositoryConnected && (
                <Alert severity="success">
                  GitHub repository connected. Clone the
                  repository locally to implement and
                  maintain your automated tests.
                </Alert>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Execution */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6">
                Automation execution
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                QABook creates the Test Run and execution
                scope. Your Git/CI pipeline performs the
                actual Playwright execution and reports
                results back to QABook.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleStartAutomationRun}
                disabled={
                  startingRun ||
                  mappings.length === 0 ||
                  !repositoryConnected
                }
              >
                {startingRun
                  ? "Creating Run..."
                  : "Create Automation Run"}
              </Button>

              {!repositoryConnected && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Connect a GitHub repository first.
                </Typography>
              )}

              {repositoryConnected &&
                mappings.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Map at least one eligible test case
                    first.
                  </Typography>
                )}
            </Box>

            {automationRun && (
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 2.5,
                }}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {automationRun.run_code}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Test Run ID{" "}
                        {automationRun.test_run_id}
                      </Typography>
                    </Box>

                    <Chip
                      label="Ready for execution"
                      color="info"
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: "action.hover",
                      fontFamily: "monospace",
                      overflowX: "auto",
                    }}
                  >
                    pytest --qabook-token
                    {" "}
                    &lt;AUTOMATION_TOKEN&gt;
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={
                      handleCopyAutomationCommand
                    }
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Copy Execution Command
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Automated coverage */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6">
                  Automated test coverage
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Manage which eligible QABook test cases
                  are represented in the automation suite.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Chip
                  label={`${testCases.length} eligible`}
                  size="small"
                  variant="outlined"
                />

                <Chip
                  label={`${mappedTestCaseIds.size} mapped`}
                  size="small"
                  color={
                    mappedTestCaseIds.size > 0
                      ? "success"
                      : "default"
                  }
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          <Box sx={{ p: 2 }}>
            <AutomationMappingTable
              testCases={testCases}
              mappings={mappings}
              onMap={handleMapTestCase}
              onBulkMap={handleBulkMap}
              onUnmap={handleUnmap}
            />
          </Box>

          {bulkMapping && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 3,
                pb: 2,
              }}
            >
              <CircularProgress size={20} />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Updating automation coverage...
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Workflow guidance */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Recommended workflow:</strong>{" "}
            Connect GitHub → generate the framework → QABook creates
            a new GitHub repository and pushes the framework → clone
            the repository locally → implement tests → push changes
            to Git → create a QABook Test Run → execute through
            CI/CD → results update the corresponding Test Executions.
          </Typography>
        </Alert>

        {/* Danger zone */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "error.light",
            borderRadius: 2,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                color="error.main"
              >
                Remove automation workspace
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                This removes the QABook automation
                workspace and mappings. Your QABook project,
                test cases, and GitHub repository are not
                deleted.
              </Typography>
            </Box>

            <Button
              color="error"
              variant="outlined"
              onClick={handleDeinitialize}
              disabled={deinitializing}
            >
              {deinitializing
                ? "Removing..."
                : "Remove Workspace"}
            </Button>
          </Box>
        </Paper>
      </Stack>

      {/* GitHub repository selection */}
      <Dialog
        open={repositoryDialogOpen}
        onClose={() => {
          if (!repositorySaving) {
            setRepositoryDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Select GitHub repository
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Select the repository where the persistent
              QABook automation framework will live.
            </Typography>

            {repositoryError && (
              <Alert severity="error">
                {repositoryError}
              </Alert>
            )}

            {repositoriesLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 5,
                }}
              >
                <CircularProgress />
              </Box>
            ) : repositories.length === 0 ? (
              <Alert severity="info">
                No repositories are available to the
                connected GitHub App installation.
              </Alert>
            ) : (
              <>
                <Select
                  value={
                    selectedRepository
                      ? selectedRepository.full_name
                      : ""
                  }
                  displayEmpty
                  fullWidth
                  onChange={(event) => {
                    const repository =
                      repositories.find(
                        (item) =>
                          item.full_name ===
                          event.target.value
                      ) || null;

                    setSelectedRepository(repository);

                    if (repository) {
                      setSelectedBranch(
                        repository.default_branch ||
                          "main"
                      );
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    Select repository
                  </MenuItem>

                  {repositories.map((repository) => (
                    <MenuItem
                      key={repository.id}
                      value={repository.full_name}
                    >
                      {repository.full_name}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  label="Branch"
                  value={selectedBranch}
                  onChange={(event) =>
                    setSelectedBranch(event.target.value)
                  }
                  fullWidth
                  helperText="The branch QABook should associate with this automation project."
                />

                {selectedRepository && (
                  <Alert severity="success">
                    Selected repository:{" "}
                    <strong>
                      {selectedRepository.full_name}
                    </strong>
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRepositoryDialogOpen(false);
            }}
            disabled={repositorySaving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveRepository}
            disabled={
              repositorySaving ||
              repositoriesLoading ||
              !selectedRepository
            }
          >
            {repositorySaving
              ? "Connecting..."
              : "Connect Repository"}
          </Button>
        </DialogActions>
      </Dialog>

      <AutomationMappingDialog
        open={mappingDialogOpen}
        testCase={selectedTestCase}
        mapping={selectedMapping}
        onClose={handleCloseMappingDialog}
        onSave={handleSaveMapping}
      />

      <ConfirmDialog
        open={deinitializeConfirmOpen}
        title="Remove Automation Workspace"
        message="Are you sure you want to remove this automation workspace? This will remove the QABook automation project and its mappings. Your QABook project, test cases, and GitHub repository will not be deleted."
        confirmText="Remove Workspace"
        cancelText="Cancel"
        onConfirm={confirmDeinitialize}
        onCancel={() => {
          setDeinitializeConfirmOpen(false);
        }}
      />
    </PageHeader>
  );
}