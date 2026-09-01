import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import AssignmentHeader from "../../components/testSuites/assignment/AssignmentHeader";
import AvailableTestCasesTable from "../../components/testSuites/assignment/AvailableTestCasesTable";
import AssignedTestCasesTable from "../../components/testSuites/assignment/AssignedTestCasesTable";

import { testSuiteService } from "../../services/testSuiteService";
import { testCaseService } from "../../services/testCaseService";
import { requirementService } from "../../services/requirementService";
import { testScenarioService } from "../../services/testScenarioService";

import type { TestCase } from "../../types/testCase";
import type { TestSuite } from "../../types/testSuite";
import type { Requirement } from "../../types/requirement";
import type { TestScenario } from "../../types/testScenario";

export default function AssignTestCasesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suite, setSuite] =
    useState<TestSuite | null>(null);

  const [testCases, setTestCases] =
    useState<TestCase[]>([]);

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [scenarios, setScenarios] =
    useState<TestScenario[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [selectedRequirementIds, setSelectedRequirementIds] =
    useState<number[]>([]);

  const [selectedScenarioIds, setSelectedScenarioIds] =
    useState<number[]>([]);

  const [moduleFilter, setModuleFilter] =
    useState<string>("all");

  const [priorityFilter, setPriorityFilter] =
    useState<string>("all");

  const [statusFilter, setStatusFilter] =
    useState<string>("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiRecommendedIds, setAiRecommendedIds] =
    useState<number[]>([]);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError("Invalid Test Suite.");
        setLoading(false);
        return;
      }

      try {
        const suiteData =
          await testSuiteService.getTestSuite(
            Number(id),
          );

        const [
          testCaseData,
          requirementData,
          scenarioData,
        ] = await Promise.all([
          testCaseService.getTestCases(
            suiteData.project_id,
          ),

          requirementService.getRequirements(
            suiteData.project_id,
          ),

          testScenarioService.getTestScenarios(
            suiteData.project_id,
          ),
        ]);

        setSuite(suiteData);
        setTestCases(testCaseData);
        setRequirements(requirementData);
        setScenarios(scenarioData);

        setSelectedIds(
          suiteData.test_cases.map(
            (testCase) => testCase.id,
          ),
        );
      } catch {
        setError(
          "Failed to load assignment data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleToggle(
    testCaseId: number,
  ) {
    setSelectedIds((previous) =>
      previous.includes(testCaseId)
        ? previous.filter(
            (id) => id !== testCaseId,
          )
        : [...previous, testCaseId],
    );
  }

  function handleRequirementChange(
    value: number[],
  ) {
    setSelectedRequirementIds(value);

    setSelectedScenarioIds((previous) =>
      previous.filter((scenarioId) => {
        const scenario =
          scenarios.find(
            (item) => item.id === scenarioId,
          );

        return (
          scenario !== undefined &&
          value.includes(
            scenario.requirement_id,
          )
        );
      }),
    );
  }

  function handleScenarioChange(
    value: number[],
  ) {
    setSelectedScenarioIds(value);
  }

  async function handleAIRecommend() {
    if (
      !suite ||
      filteredTestCases.length === 0
    ) {
      return;
    }

    try {
      setAiLoading(true);
      setError("");

      const recommendedIds =
        await testSuiteService.recommendTestCases(
          suite.id,
          filteredTestCases.map(
            (testCase) => testCase.id,
          ),
        );

      setAiRecommendedIds((previous) => [
        ...new Set([
          ...previous,
          ...recommendedIds,
        ]),
      ]);

      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...recommendedIds,
        ]),
      ]);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to get AI test case recommendations.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave() {
    if (!suite) {
      return;
    }

    try {
      setSaving(true);

      await testSuiteService.assignTestCases(
        suite.id,
        selectedIds,
      );

      navigate("/test-suites");
    } catch {
      setError(
        "Failed to save assignments.",
      );
    } finally {
      setSaving(false);
    }
  }

  const availableScenarios =
    scenarios.filter(
      (scenario) =>
        selectedRequirementIds.length === 0 ||
        selectedRequirementIds.includes(
          scenario.requirement_id,
        ),
    );

  const availableModules =
    Array.from(
      new Set(
        testCases.map(
          (testCase) => testCase.module,
        ),
      ),
    ).sort();

  const filteredTestCases =
    testCases.filter((testCase) => {
      const matchesRequirement =
        selectedRequirementIds.length === 0 ||
        selectedRequirementIds.includes(
          testCase.scenario.requirement.id,
        );

      const matchesScenario =
        selectedScenarioIds.length === 0 ||
        selectedScenarioIds.includes(
          testCase.scenario.id,
        );

      const matchesModule =
        moduleFilter === "all" ||
        testCase.module === moduleFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        testCase.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        testCase.status === statusFilter;

      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        testCase.test_case_code
          .toLowerCase()
          .includes(searchText) ||
        testCase.title
          .toLowerCase()
          .includes(searchText);

      return (
        matchesRequirement &&
        matchesScenario &&
        matchesModule &&
        matchesPriority &&
        matchesStatus &&
        matchesSearch
      );
    });

  if (loading) {
    return (
      <Stack
        sx={{
          alignItems: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/test-suites")
          }
          sx={{ mb: 2 }}
        >
          Back to Test Suites
        </Button>

        <Alert severity="error">
          {error}
        </Alert>
      </>
    );
  }

  if (!suite) {
    return (
      <>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/test-suites")
          }
          sx={{ mb: 2 }}
        >
          Back to Test Suites
        </Button>

        <Alert severity="error">
          Test Suite not found.
        </Alert>
      </>
    );
  }

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate("/test-suites")
        }
        disabled={saving}
        sx={{ mb: 2 }}
      >
        Back to Test Suites
      </Button>

      <AssignmentHeader
        suite={suite}
        assignedCount={selectedIds.length}
        saving={saving}
        onSave={handleSave}
      />

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 240 }}
        >
          <InputLabel>
            Requirements
          </InputLabel>

          <Select
            multiple
            value={selectedRequirementIds}
            onChange={(event) => {
              handleRequirementChange(
                event.target.value as number[],
              );
            }}
            input={
              <OutlinedInput label="Requirements" />
            }
            renderValue={(selected) => {
              const values =
                selected as number[];

              if (values.length === 0) {
                return "All Requirements";
              }

              if (values.length === 1) {
                const requirement =
                  requirements.find(
                    (item) =>
                      item.id === values[0],
                  );

                return requirement
                  ? `${requirement.requirement_code} - ${requirement.module}`
                  : "1 Requirement Selected";
              }

              return `${values.length} Requirements Selected`;
            }}
          >
            {requirements.map(
              (requirement) => (
                <MenuItem
                  key={requirement.id}
                  value={requirement.id}
                >
                  <Checkbox
                    checked={selectedRequirementIds.includes(
                      requirement.id,
                    )}
                  />

                  <ListItemText
                    primary={`${requirement.requirement_code} - ${requirement.module}`}
                  />
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 280 }}
        >
          <InputLabel>
            Scenarios
          </InputLabel>

          <Select
            multiple
            value={selectedScenarioIds}
            onChange={(event) => {
              handleScenarioChange(
                event.target.value as number[],
              );
            }}
            input={
              <OutlinedInput label="Scenarios" />
            }
            renderValue={(selected) => {
              const values =
                selected as number[];

              if (values.length === 0) {
                return "All Scenarios";
              }

              if (values.length === 1) {
                const scenario =
                  availableScenarios.find(
                    (item) =>
                      item.id === values[0],
                  );

                return scenario
                  ? `${scenario.scenario_code} - ${scenario.title}`
                  : "1 Scenario Selected";
              }

              return `${values.length} Scenarios Selected`;
            }}
          >
            {availableScenarios.map(
              (scenario) => (
                <MenuItem
                  key={scenario.id}
                  value={scenario.id}
                >
                  <Checkbox
                    checked={selectedScenarioIds.includes(
                      scenario.id,
                    )}
                  />

                  <ListItemText
                    primary={`${scenario.scenario_code} - ${scenario.title}`}
                  />
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 180 }}
        >
          <InputLabel>
            Module
          </InputLabel>

          <Select
            value={moduleFilter}
            label="Module"
            onChange={(event) =>
              setModuleFilter(
                event.target.value,
              )
            }
          >
            <MenuItem value="all">
              All Modules
            </MenuItem>

            {availableModules.map(
              (module) => (
                <MenuItem
                  key={module}
                  value={module}
                >
                  {module}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 150 }}
        >
          <InputLabel>
            Priority
          </InputLabel>

          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(event) =>
              setPriorityFilter(
                event.target.value,
              )
            }
          >
            <MenuItem value="all">
              All Priorities
            </MenuItem>

            <MenuItem value="High">
              High
            </MenuItem>

            <MenuItem value="Medium">
              Medium
            </MenuItem>

            <MenuItem value="Low">
              Low
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 150 }}
        >
          <InputLabel>
            Status
          </InputLabel>

          <Select
            value={statusFilter}
            label="Status"
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
          >
            <MenuItem value="all">
              All Statuses
            </MenuItem>

            <MenuItem value="Draft">
              Draft
            </MenuItem>

            <MenuItem value="Approved">
              Approved
            </MenuItem>

            <MenuItem value="Ready">
              Ready
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Code or title"
          sx={{ minWidth: 220 }}
        />
      </Stack>

      <Button
        variant="contained"
        onClick={handleAIRecommend}
        disabled={
          aiLoading ||
          filteredTestCases.length === 0
        }
      >
        {aiLoading
          ? "AI Recommending..."
          : "✨ AI Recommend"}
      </Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AvailableTestCasesTable
            testCases={filteredTestCases}
            aiRecommendedIds={
              aiRecommendedIds
            }
            selectedIds={selectedIds}
            onToggle={handleToggle}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AssignedTestCasesTable
            testCases={testCases}
            selectedIds={selectedIds}
            aiRecommendedIds={
              aiRecommendedIds
            }
          />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={() =>
            navigate("/test-suites")
          }
          disabled={saving}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
}