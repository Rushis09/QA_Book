import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";

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
  const { showNotification } = useNotification();

  const [automationProject, setAutomationProject] =
    useState<AutomationProject | null>(null);

  const [testCases, setTestCases] =
    useState<TestCase[]>([]);

  const [mappings, setMappings] =
    useState<AutomationTestMapping[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [startingRun, setStartingRun] =
    useState(false);

  const [bulkMapping, setBulkMapping] =
    useState(false);

  const [error, setError] =
    useState("");

  const [name, setName] =
    useState("");

  const [framework, setFramework] =
    useState("Python + pytest + Playwright");

  const [mappingDialogOpen, setMappingDialogOpen] =
    useState(false);

  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCase | null>(null);

  const [selectedMapping, setSelectedMapping] =
    useState<AutomationTestMapping | undefined>(
      undefined,
    );

  async function loadAutomationData() {
    if (!selectedProject) {
      setAutomationProject(null);
      setTestCases([]);
      setMappings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        automationProjectData,
        testCaseData,
      ] = await Promise.all([
        automationService.getAutomationProjectByProjectId(
          selectedProject.id,
        ),
        testCaseService.getTestCases(
          selectedProject.id,
        ),
      ]);

      setAutomationProject(
        automationProjectData,
      );

      setTestCases(
        testCaseData.filter(
          (testCase) =>
            testCase.automation_eligibility ===
            "Eligible",
        ),
      );

      const mappingData =
        await automationService.getAutomationTestMappings(
          automationProjectData.id,
        );

      setMappings(mappingData);
    } catch (error) {
      console.error(error);

      setAutomationProject(null);
      setMappings([]);
      setError(
        "Failed to load automation project.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAutomationData();
  }, [selectedProject]);

  async function handleInitialize() {
    if (
      !selectedProject ||
      automationProject ||
      saving
    ) {
      return;
    }

    if (!name.trim()) {
      showNotification(
        "Automation project name is required.",
        "error",
      );
      return;
    }

    try {
      setSaving(true);

      const data =
        await automationService.createAutomationProject({
          project_id: selectedProject.id,
          name: name.trim(),
          framework,
          status: "Active",
          repository_url: null,
        });

      setAutomationProject(data);
      setName("");

      showNotification(
        "Automation project initialized successfully.",
        "success",
      );
    } catch (error) {
      console.error(error);

      setError(
        "Failed to initialize automation project.",
      );

      showNotification(
        "Failed to initialize automation project.",
        "error",
      );
    } finally {
      setSaving(false);
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
        "error",
      );
      return;
    }

    try {
      setStartingRun(true);

      const result =
        await automationService.startAutomationRun(
          automationProject.id,
        );

      showNotification(
        `Automation run ${result.run_code} created successfully.`,
        "success",
      );

      console.log(
        "Automation run created:",
        result,
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to start automation run.",
        "error",
      );
    } finally {
      setStartingRun(false);
    }
  }

  async function handleBulkMap(
    testCaseIds: number[],
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
          },
        );

      setMappings(result);

      showNotification(
        `${testCaseIds.length} test case${
          testCaseIds.length === 1
            ? ""
            : "s"
        } mapped successfully.`,
        "success",
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to map selected test cases.",
        "error",
      );
    } finally {
      setBulkMapping(false);
    }
  }

  async function handleDownloadFramework() {
    if (!automationProject || downloading) {
      return;
    }

    try {
      setDownloading(true);

      const blob =
        await automationService.downloadAutomationFramework(
          automationProject.id,
        );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${automationProject.name
          .trim()
          .replace(/\s+/g, "_")}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      showNotification(
        "Automation framework downloaded successfully.",
        "success",
      );
    } catch (error) {
      console.error(error);

      showNotification(
        "Failed to download automation framework.",
        "error",
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleMapTestCase(
    testCase: TestCase,
  ) {
    if (!automationProject) {
      return;
    }

    const mapping = mappings.find(
      (item) =>
        item.test_case_id === testCase.id,
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

    if (selectedMapping) {
      await automationService.updateAutomationTestMapping(
        selectedMapping.id,
        data,
      );

      showNotification(
        "Automation mapping updated successfully.",
        "success",
      );
    } else {
      await automationService.createAutomationTestMapping({
        automation_project_id:
          automationProject.id,
        test_case_id:
          selectedTestCase.id,
        test_name: data.test_name,
        test_file_path:
          data.test_file_path,
      });

      showNotification(
        "Test case mapped successfully.",
        "success",
      );
    }

    const mappingData =
      await automationService.getAutomationTestMappings(
        automationProject.id,
      );

    setMappings(mappingData);
  }

  function handleCloseMappingDialog() {
    setMappingDialogOpen(false);
    setSelectedTestCase(null);
    setSelectedMapping(undefined);
  }

  if (!selectedProject) {
    return (
      <Alert severity="info">
        Please select a project to manage automation.
      </Alert>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <PageHeader
      title="Automation"
      actionLabel={
        automationProject
          ? "Automation Initialized"
          : saving
            ? "Initializing..."
            : "Initialize Automation"
      }
      onAction={handleInitialize}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
      >
        Automation workspace for project{" "}
        <strong>
          {selectedProject.project_code}
        </strong>
        {" — "}
        {selectedProject.name}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      {!automationProject ? (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mt: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">
              Initialize Automation
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Create an automation workspace for this
              QABook project.
            </Typography>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Automation Project Name
              </Typography>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: OrangeHRM Automation"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Framework
              </Typography>

              <input
                value={framework}
                onChange={(event) =>
                  setFramework(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  boxSizing: "border-box",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Enter the automation project name and
              click "Initialize Automation" above.
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              mt: 2,
              mb: 3,
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">
                {automationProject.name}
              </Typography>

              <Typography variant="body2">
                <strong>Framework:</strong>{" "}
                {automationProject.framework}
              </Typography>

              <Typography variant="body2">
                <strong>Status:</strong>{" "}
                {automationProject.status}
              </Typography>

              <Typography variant="body2">
                <strong>Repository:</strong>{" "}
                {automationProject.repository_url ||
                  "Not configured"}
              </Typography>

              <Box>
                <Stack
                  direction="row"
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    onClick={
                      handleDownloadFramework
                    }
                    disabled={downloading}
                  >
                    {downloading
                      ? "Downloading..."
                      : "Download Framework"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={
                      handleStartAutomationRun
                    }
                    disabled={
                      startingRun ||
                      mappings.length === 0
                    }
                  >
                    {startingRun
                      ? "Starting..."
                      : "Run Automation"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Typography
            variant="h6"
            sx={{ mb: 1 }}
          >
            Test Case Automation Mapping
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Eligible test cases for this automation
            project.
          </Typography>

          <AutomationMappingTable
            testCases={testCases}
            mappings={mappings}
            onMap={handleMapTestCase}
            onBulkMap={handleBulkMap}
          />

          {bulkMapping && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 2,
              }}
            >
              <CircularProgress size={20} />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Mapping selected test cases...
              </Typography>
            </Box>
          )}
        </>
      )}

      <AutomationMappingDialog
        open={mappingDialogOpen}
        testCase={selectedTestCase}
        mapping={selectedMapping}
        onClose={handleCloseMappingDialog}
        onSave={handleSaveMapping}
      />
    </PageHeader>
  );
}