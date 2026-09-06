import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { useWorkspace } from "../../contexts/WorkspaceContext";
import { useNotification } from "../../contexts/NotificationContext";

import { testCaseService } from "../../services/testCaseService";
import automationService from "../services/automationService";

import AutomationMappingDialog from "../components/AutomationMappingDialog";
import AutomationMappingTable from "../components/AutomationMappingTable";

import type { TestCase } from "../../types/testCase";
import type {
  AutomationProject,
  AutomationTestMapping,
} from "../types/automation";

export default function AutomationPage() {
  const { selectedProject } = useWorkspace();
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

  const [generatingFramework, setGeneratingFramework] = useState(false);
  const [syncingRepository, setSyncingRepository] = useState(false);

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
  } | null>(null);

  const [deinitializeConfirmOpen, setDeinitializeConfirmOpen] =
    useState(false);

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubConnectionLoading, setGithubConnectionLoading] =
    useState(false);

  /*
   * Tracks whether the QABook automation mapping state has changed
   * since the last repository synchronization.
   *
   * This is intentionally frontend state only. The backend remains
   * the source of truth for the automation project and repository.
   */
  const [repositorySyncRequired, setRepositorySyncRequired] =
    useState(false);

  const mappedTestCaseIds = useMemo(
    () => new Set(mappings.map((mapping) => mapping.test_case_id)),
    [mappings]
  );

  const repositoryConnected =
    Boolean(automationProject?.repository_url);

  

  const loadGitHubConnection = async (
    automationProjectId: number
  ) => {
    try {
      setGithubConnectionLoading(true);

      const connection =
        await automationService.getGitHubConnection(
          automationProjectId
        );

      setGithubConnected(connection.connected);
    } catch (error) {
      console.error(
        "Failed to load GitHub connection:",
        error
      );

      setGithubConnected(false);
    } finally {
      setGithubConnectionLoading(false);
    }
  };

  async function loadAutomationData() {
    if (!effectiveProject) {
      setAutomationProject(null);
      setTestCases([]);
      setMappings([]);
      setAutomationRun(null);
      setGithubConnected(false);
      setRepositorySyncRequired(false);
      setError("");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const testCaseData =
        await testCaseService.getTestCases(
          effectiveProject.id
        );

      setTestCases(
        testCaseData.filter(
          (testCase) =>
            testCase.automation_eligibility === "Eligible"
        )
      );

      let automationProjectData:
        | AutomationProject
        | null = null;

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
        setRepositorySyncRequired(false);
        return;
      }

      setAutomationProject(
        automationProjectData
      );

      await loadGitHubConnection(
        automationProjectData.id
      );

      const mappingData =
        await automationService.getAutomationTestMappings(
          automationProjectData.id
        );

      setMappings(mappingData);

      /*
       * A fresh page load should not claim that synchronization is
       * required unless a mapping operation happens in this session.
       */
      setRepositorySyncRequired(false);
    } catch (error) {
      console.error(error);

      setAutomationProject(null);
      setMappings([]);
      setGithubConnected(false);
      setRepositorySyncRequired(false);

      setError(
        "Failed to load automation workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAutomationData();
  }, [effectiveProject]);

  async function handleInitialize() {
    if (
      !effectiveProject ||
      automationProject ||
      saving
    ) {
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

      setError(
        "Failed to create automation workspace."
      );

      showNotification(
        "Failed to create automation workspace.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDeinitialize() {
    if (
      !automationProject ||
      deinitializing
    ) {
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

      setError(
        "Failed to remove automation workspace."
      );

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

      const response =
        await automationService.authorizeGitHub(
          automationProject.id
        );

      window.location.href =
        response.authorization_url;
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to start GitHub authorization.",
        "error"
      );

      setGithubConnectionLoading(false);
    }
  }

  async function handleGenerateFramework() {
    if (
      !automationProject ||
      generatingFramework ||
      syncingRepository
    ) {
      return;
    }

    /*
     * Generate Framework is intentionally a one-time action.
     * Once the repository exists, Sync Repository becomes the
     * only repository structure synchronization action.
     */
    if (repositoryConnected) {
      showNotification(
        "The framework has already been generated. Use Sync Repository for future mapping changes.",
        "info"
      );

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

      setRepositorySyncRequired(false);

      showNotification(
        "Automation framework generated and repository created successfully.",
        "success"
      );

      await loadGitHubConnection(
        automationProject.id
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to generate the automation framework.",
        "error"
      );
    } finally {
      setGeneratingFramework(false);
    }
  }

  async function handleSyncRepository() {
    if (
      !automationProject ||
      syncingRepository ||
      generatingFramework
    ) {
      return;
    }

    if (!githubConnected) {
      showNotification(
        "Connect GitHub before synchronizing the repository.",
        "error"
      );

      return;
    }

    if (!repositoryConnected) {
      showNotification(
        "Generate the framework before synchronizing the repository.",
        "error"
      );

      return;
    }

    try {
      setSyncingRepository(true);
      setError("");

      const response =
        await automationService.syncGitHubFramework(
          automationProject.id
        );

      setRepositorySyncRequired(false);

      const createdCount =
        response.created_test_files?.length ?? 0;

      const skippedCount =
        response.skipped_test_files?.length ?? 0;

      let message =
        "Repository synchronized successfully.";

      if (createdCount > 0) {
        message += ` ${createdCount} new test file${
          createdCount === 1 ? "" : "s"
        } added.`;
      }

      if (skippedCount > 0) {
        message += ` ${skippedCount} existing test file${
          skippedCount === 1 ? "" : "s"
        } preserved.`;
      }

      showNotification(
        message,
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to synchronize the GitHub repository.",
        "error"
      );
    } finally {
      setSyncingRepository(false);
    }
  }

  async function handleStartAutomationRun() {
    if (
      !automationProject ||
      startingRun
    ) {
      return;
    }

    if (mappings.length === 0) {
      showNotification(
        "Map at least one test case before starting automation.",
        "error"
      );

      return;
    }

    if (!repositoryConnected) {
      showNotification(
        "Generate the automation framework before creating a run.",
        "error"
      );

      return;
    }

    if (repositorySyncRequired) {
      showNotification(
        "Synchronize the repository before creating an automation run.",
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
      });

      showNotification(
        `Automation run ${result.run_code} created successfully.`,
        "success"
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to create automation run.",
        "error"
      );
    } finally {
      setStartingRun(false);
    }
  }

  async function handleBulkMap(
    testCaseIds: number[]
  ) {
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
      setRepositorySyncRequired(
        repositoryConnected
      );

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

  function handleMapTestCase(
    testCase: TestCase
  ) {
    if (!automationProject) {
      return;
    }

    const mapping = mappings.find(
      (item) =>
        item.test_case_id === testCase.id
    );

    setSelectedTestCase(testCase);
    setSelectedMapping(mapping);
    setMappingDialogOpen(true);
  }

  async function handleSaveMapping(data: {
    test_name: string;
    test_file_path: string;
  }) {
    if (
      !automationProject ||
      !selectedTestCase
    ) {
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
        await automationService.createAutomationTestMapping(
          {
            automation_project_id:
              automationProject.id,
            test_case_id:
              selectedTestCase.id,
            test_name:
              data.test_name,
            test_file_path:
              data.test_file_path,
          }
        );

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

      /*
       * Mapping changes affect the generated repository
       * structure, therefore the user must sync before creating
       * another automation run.
       */
      setRepositorySyncRequired(
        repositoryConnected
      );
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

      setRepositorySyncRequired(
        repositoryConnected
      );

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
        Select a specific project to open its
        automation workspace.
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
                  Create a dedicated automation workspace
                  for this QABook project.
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
                helperText="The QABook-supported automation framework."
              />

              <Alert severity="info">
                After creating the workspace, connect
                GitHub. QABook will create and configure
                the automation repository automatically.
              </Alert>
            </Stack>
          </Paper>
        </Stack>
      </PageHeader>
    );
  }

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
                mappings.length === 1
                  ? ""
                  : "s"
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
            <Stack spacing={0.75}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="h6">
                  Source control
                </Typography>

                <Chip
                  label={
                    repositoryConnected
                      ? "Repository connected"
                      : "Setup required"
                  }
                  size="small"
                  color={
                    repositoryConnected
                      ? "success"
                      : "default"
                  }
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                QABook manages the automation workspace
                structure while GitHub stores your
                Playwright automation code.
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

                  {repositoryConnected ? (
                    <Typography
                      component="a"
                      href={
                        automationProject.repository_url!
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body1"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        wordBreak: "break-all",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {automationProject.repository_url}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{ mt: 0.5 }}
                    >
                      No repository created yet
                    </Typography>
                  )}
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
                    variant={
                      githubConnected
                        ? "outlined"
                        : "contained"
                    }
                    onClick={handleConnectGitHub}
                    disabled={
                      githubConnectionLoading ||
                      generatingFramework ||
                      syncingRepository
                    }
                  >
                    {githubConnectionLoading
                      ? "Connecting..."
                      : githubConnected
                        ? "Reconnect GitHub"
                        : "Connect GitHub"}
                  </Button>

                  {!repositoryConnected ? (
                    <Button
                      variant="contained"
                      onClick={
                        handleGenerateFramework
                      }
                      disabled={
                        !githubConnected ||
                        generatingFramework ||
                        syncingRepository
                      }
                    >
                      {generatingFramework
                        ? "Creating Repository..."
                        : "Generate Framework"}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={
                        handleSyncRepository
                      }
                      disabled={
                        !githubConnected ||
                        generatingFramework ||
                        syncingRepository
                      }
                    >
                      {syncingRepository
                        ? "Syncing Repository..."
                        : "Sync Repository"}
                    </Button>
                  )}
                </Box>
              </Box>

              {!githubConnected && (
                <Alert severity="info">
                  Connect your GitHub account to create
                  and manage the automation repository.
                </Alert>
              )}

              {githubConnected &&
                !repositoryConnected && (
                  <Alert severity="info">
                    GitHub is connected. Generate the
                    framework to create a dedicated
                    repository and configure its CI/CD
                    integration automatically.
                  </Alert>
                )}

              {repositoryConnected &&
                !repositorySyncRequired && (
                  <Alert severity="success">
                    Repository is connected and
                    synchronized. You can clone the
                    repository locally and maintain your
                    Playwright tests using standard Git
                    workflows.
                  </Alert>
                )}

              {repositoryConnected &&
                repositorySyncRequired && (
                  <Alert severity="warning">
                    Automation mappings have changed.
                    Synchronize the repository before
                    creating a new automation run.
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
                scope. GitHub Actions performs the actual
                Playwright tests and reports results back
                to QABook automatically.
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
                onClick={
                  handleStartAutomationRun
                }
                disabled={
                  startingRun ||
                  mappings.length === 0 ||
                  !repositoryConnected ||
                  repositorySyncRequired
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
                  Generate the framework first.
                </Typography>
              )}

              {repositoryConnected &&
                mappings.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Map at least one eligible test
                    case first.
                  </Typography>
                )}

              {repositoryConnected &&
                mappings.length > 0 &&
                repositorySyncRequired && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                  >
                    Sync the repository before
                    creating a new run.
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
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      justifyContent:
                        "space-between",
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
                      label="CI/CD execution initiated"
                      color="info"
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    The repository workflow will execute
                    the mapped tests and report their
                    results back to QABook. No QABook token
                    or custom command is required from the
                    tester.
                  </Typography>
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
                  Map eligible QABook test cases to
                  automation tests maintained in GitHub.
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

                {repositorySyncRequired && (
                  <Chip
                    label="Sync required"
                    size="small"
                    color="warning"
                  />
                )}
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

        {/* SaaS workflow */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">
                Automation lifecycle
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                QABook separates QA management from
                automation implementation while keeping
                the workflow connected.
              </Typography>
            </Box>

            <Stack
              spacing={1}
              sx={{
                "& > *": {
                  minHeight: 36,
                },
              }}
            >
              <Typography variant="body2">
                <strong>1.</strong> Map eligible test cases
              </Typography>

              <Typography variant="body2">
                <strong>2.</strong> Sync repository structure
              </Typography>

              <Typography variant="body2">
                <strong>3.</strong> Maintain Playwright tests
                in GitHub
              </Typography>

              <Typography variant="body2">
                <strong>4.</strong> Create an automation run
                in QABook
              </Typography>

              <Typography variant="body2">
                <strong>5.</strong> GitHub Actions executes
                the tests
              </Typography>

              <Typography variant="body2">
                <strong>6.</strong> Results update QABook
                Test Executions
              </Typography>

              <Typography variant="body2">
                <strong>7.</strong> Review failures and
                create Bugs when required
              </Typography>

              <Typography variant="body2">
                <strong>8.</strong> Retest fixed Bugs through
                the automation workflow
              </Typography>
            </Stack>
          </Stack>
        </Paper>

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
                workspace and its mappings. Your QABook
                project, test cases, execution history, and
                GitHub repository are not deleted.
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
        message="Are you sure you want to remove this automation workspace? This removes the QABook automation project and its mappings. Your QABook project, test cases, execution history, and GitHub repository will not be deleted."
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