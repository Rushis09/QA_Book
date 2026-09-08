import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Alert,
  Box,
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
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import RemoveDoneOutlinedIcon from "@mui/icons-material/RemoveDoneOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

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

interface PlanningMetricProps {
  icon: ReactNode;
  value: number;
  label: string;
}

function PlanningMetric({
  icon,
  value,
  label,
}: PlanningMetricProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eff6ff",
          color: "#1570ef",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 750,
            lineHeight: 1.15,
            color: "#101828",
          }}
        >
          {value}
        </Typography>

        <Typography
          noWrap
          sx={{
            mt: 0.15,
            fontSize: "0.65rem",
            color: "#667085",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

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
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

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
        setLoading(true);

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
      } catch (error) {
        console.error(error);

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
            (currentId) =>
              currentId !== testCaseId,
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
    } catch (error) {
      console.error(error);

      setError(
        "Failed to save assignments.",
      );
    } finally {
      setSaving(false);
    }
  }

  const availableScenarios =
    useMemo(
      () =>
        scenarios.filter(
          (scenario) =>
            selectedRequirementIds.length ===
              0 ||
            selectedRequirementIds.includes(
              scenario.requirement_id,
            ),
        ),
      [
        scenarios,
        selectedRequirementIds,
      ],
    );

  const availableModules =
    useMemo(
      () =>
        Array.from(
          new Set(
            testCases.map(
              (testCase) =>
                testCase.module,
            ),
          ),
        ).sort(),
      [testCases],
    );

  const filteredTestCases =
    useMemo(
      () =>
        testCases.filter((testCase) => {
          const matchesRequirement =
            selectedRequirementIds.length ===
              0 ||
            selectedRequirementIds.includes(
              testCase.scenario.requirement.id,
            );

          const matchesScenario =
            selectedScenarioIds.length ===
              0 ||
            selectedScenarioIds.includes(
              testCase.scenario.id,
            );

          const matchesModule =
            moduleFilter === "all" ||
            testCase.module ===
              moduleFilter;

          const matchesPriority =
            priorityFilter === "all" ||
            testCase.priority ===
              priorityFilter;

          const matchesStatus =
            statusFilter === "all" ||
            testCase.status ===
              statusFilter;

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
        }),
      [
        testCases,
        selectedRequirementIds,
        selectedScenarioIds,
        moduleFilter,
        priorityFilter,
        statusFilter,
        search,
      ],
    );

  const assignedCount =
    selectedIds.length;

  const totalCount =
    testCases.length;

  const unassignedCount =
    Math.max(
      totalCount - assignedCount,
      0,
    );

  const aiSuggestedCount =
    aiRecommendedIds.length;

  if (loading) {
    return (
      <Stack
        sx={{
          minHeight: 300,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (error && !suite) {
    return (
      <Box>
        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate("/test-suites")
          }
          sx={{
            mb: 1.5,
            fontSize: "0.76rem",
            textTransform: "none",
          }}
        >
          Back to Test Suites
        </Button>

        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!suite) {
    return (
      <Box>
        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate("/test-suites")
          }
          sx={{
            mb: 1.5,
            fontSize: "0.76rem",
            textTransform: "none",
          }}
        >
          Back to Test Suites
        </Button>

        <Alert severity="error">
          Test Suite not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        pb: 2,
      }}
    >
      <Button
        startIcon={
          <ArrowBackIcon />
        }
        onClick={() =>
          navigate("/test-suites")
        }
        disabled={saving}
        sx={{
          mb: 1,
          ml: -0.5,
          height: 32,
          px: 0.75,
          borderRadius: "7px",
          fontSize: "0.72rem",
          fontWeight: 650,
          textTransform: "none",
          color: "#475467",
        }}
      >
        Back to Test Suites
      </Button>

      <AssignmentHeader
        suite={suite}
        assignedCount={assignedCount}
        saving={saving}
        onSave={handleSave}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.25,
          mb: 1.75,
        }}
      >
        <Box
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
            px: 1.5,
            py: 1.25,
          }}
        >
          <PlanningMetric
            icon={
              <ChecklistOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            }
            value={totalCount}
            label="Total Test Cases"
          />
        </Box>

        <Box
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
            px: 1.5,
            py: 1.25,
          }}
        >
          <PlanningMetric
            icon={
              <AssignmentTurnedInOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            }
            value={assignedCount}
            label="Assigned"
          />
        </Box>

        <Box
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
            px: 1.5,
            py: 1.25,
          }}
        >
          <PlanningMetric
            icon={
              <RemoveDoneOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            }
            value={unassignedCount}
            label="Unassigned"
          />
        </Box>

        <Box
          sx={{
            border:
              "1px solid #e4e7ec",
            borderRadius: "10px",
            backgroundColor: "#fff",
            px: 1.5,
            py: 1.25,
          }}
        >
          <PlanningMetric
            icon={
              <AutoAwesomeOutlinedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            }
            value={aiSuggestedCount}
            label="AI Suggested"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 1.25 }}>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 750,
            color: "#101828",
          }}
        >
          Test Case Selection
        </Typography>

        <Typography
          sx={{
            mt: 0.2,
            fontSize: "0.68rem",
            color: "#667085",
          }}
        >
          Select the test cases that
          should belong to this suite.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 1.5,
            py: 0,
            fontSize: "0.75rem",
            borderRadius: "9px",
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          border:
            "1px solid #e4e7ec",
          borderRadius: "10px",
          backgroundColor: "#fff",
          p: 1.25,
          mb: 1.5,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={1}
          sx={{
            alignItems: {
              xs: "stretch",
              lg: "center",
            },
          }}
        >
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Code or title"
            sx={{
              width: {
                xs: "100%",
                lg: 220,
              },
              "& .MuiOutlinedInput-root":
                {
                  height: 38,
                  borderRadius: "8px",
                  fontSize: "0.74rem",
                },
              "& .MuiInputLabel-root": {
                fontSize: "0.72rem",
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                lg: 190,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.72rem",
              }}
            >
              Requirements
            </InputLabel>

            <Select
              multiple
              value={selectedRequirementIds.map(
                String,
              )}
              onChange={(event) => {
                const values =
                  typeof event.target
                    .value === "string"
                    ? event.target.value
                        .split(",")
                        .filter(Boolean)
                        .map(Number)
                    : event.target.value.map(
                        Number,
                      );

                handleRequirementChange(
                  values,
                );
              }}
              input={
                <OutlinedInput
                  label="Requirements"
                />
              }
              renderValue={(
                selected,
              ) => {
                const values =
                  selected as string[];

                const ids =
                  values.map(Number);

                if (
                  ids.length === 0
                ) {
                  return "All Requirements";
                }

                if (
                  ids.length === 1
                ) {
                  const requirement =
                    requirements.find(
                      (item) =>
                        item.id === ids[0],
                    );

                  return requirement
                    ? requirement.requirement_code
                    : "1 selected";
                }

                return `${ids.length} selected`;
              }}
              sx={{
                height: 38,
                borderRadius: "8px",
                fontSize: "0.74rem",
              }}
            >
              {requirements.map(
                (requirement) => (
                  <MenuItem
                    key={
                      requirement.id
                    }
                    value={
                      String(
                        requirement.id,
                      )
                    }
                    sx={{
                      fontSize:
                        "0.74rem",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedRequirementIds.includes(
                        requirement.id,
                      )}
                    />

                    <ListItemText
                      primary={`${requirement.requirement_code} - ${requirement.module}`}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize:
                              "0.74rem",
                          },
                        },
                      }}
                    />
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                lg: 200,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.72rem",
              }}
            >
              Scenarios
            </InputLabel>

            <Select
              multiple
              value={selectedScenarioIds.map(
                String,
              )}
              onChange={(event) => {
                const values =
                  typeof event.target
                    .value === "string"
                    ? event.target.value
                        .split(",")
                        .filter(Boolean)
                        .map(Number)
                    : event.target.value.map(
                        Number,
                      );

                handleScenarioChange(
                  values,
                );
              }}
              input={
                <OutlinedInput
                  label="Scenarios"
                />
              }
              renderValue={(
                selected,
              ) => {
                const values =
                  selected as string[];

                const ids =
                  values.map(Number);

                if (
                  ids.length === 0
                ) {
                  return "All Scenarios";
                }

                if (
                  ids.length === 1
                ) {
                  const scenario =
                    availableScenarios.find(
                      (item) =>
                        item.id === ids[0],
                    );

                  return scenario
                    ? scenario.scenario_code
                    : "1 selected";
                }

                return `${ids.length} selected`;
              }}
              sx={{
                height: 38,
                borderRadius: "8px",
                fontSize: "0.74rem",
              }}
            >
              {availableScenarios.map(
                (scenario) => (
                  <MenuItem
                    key={scenario.id}
                    value={String(
                      scenario.id,
                    )}
                    sx={{
                      fontSize:
                        "0.74rem",
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedScenarioIds.includes(
                        scenario.id,
                      )}
                    />

                    <ListItemText
                      primary={`${scenario.scenario_code} - ${scenario.title}`}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize:
                              "0.74rem",
                          },
                        },
                      }}
                    />
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                lg: 135,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.72rem",
              }}
            >
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
              sx={{
                height: 38,
                borderRadius: "8px",
                fontSize: "0.74rem",
              }}
            >
              <MenuItem
                value="all"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                All Modules
              </MenuItem>

              {availableModules.map(
                (module) => (
                  <MenuItem
                    key={module}
                    value={module}
                    sx={{
                      fontSize:
                        "0.74rem",
                    }}
                  >
                    {module}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                lg: 125,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.72rem",
              }}
            >
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
              sx={{
                height: 38,
                borderRadius: "8px",
                fontSize: "0.74rem",
              }}
            >
              <MenuItem
                value="all"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                All Priorities
              </MenuItem>

              <MenuItem
                value="High"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                High
              </MenuItem>

              <MenuItem
                value="Medium"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                Medium
              </MenuItem>

              <MenuItem
                value="Low"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                Low
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                lg: 125,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.72rem",
              }}
            >
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
              sx={{
                height: 38,
                borderRadius: "8px",
                fontSize: "0.74rem",
              }}
            >
              <MenuItem
                value="all"
                sx={{
                  fontSize:
                    "0.74rem",
                }}
              >
                All Statuses
              </MenuItem>

              <MenuItem
                value="Active"
                sx={{
                  fontSize: "0.74rem",
                }}
              >
                Active
              </MenuItem>
              
              <MenuItem
                value="Archived"
                sx={{
                  fontSize: "0.74rem",
                }}
              >
                Archived
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={
              handleAIRecommend
            }
            disabled={
              aiLoading ||
              filteredTestCases.length ===
                0
            }
            startIcon={
              <AutoAwesomeOutlinedIcon
                sx={{
                  fontSize: 16,
                }}
              />
            }
            sx={{
              height: 38,
              minWidth: {
                xs: "100%",
                lg: 145,
              },
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: 650,
              textTransform:
                "none",
              borderColor:
                "#d0d5dd",
              color: "#6941c6",
              whiteSpace:
                "nowrap",
              "&:hover": {
                borderColor:
                  "#b692f6",
                backgroundColor:
                  "#faf8ff",
              },
            }}
          >
            {aiLoading
              ? "Recommending..."
              : "AI Recommend"}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.68rem",
            color: "#667085",
          }}
        >
          Showing{" "}
          <strong>
            {filteredTestCases.length}
          </strong>{" "}
          of {totalCount} test cases
        </Typography>

        {assignedCount > 0 && (
          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 650,
              color: "#1570ef",
            }}
          >
            {assignedCount} assigned
          </Typography>
        )}
      </Box>

      <Grid
        container
        spacing={1.5}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7.5,
          }}
        >
          <AvailableTestCasesTable
            testCases={
              filteredTestCases
            }
            aiRecommendedIds={
              aiRecommendedIds
            }
            selectedIds={
              selectedIds
            }
            onToggle={
              handleToggle
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 4.5,
          }}
        >
          <AssignedTestCasesTable
            testCases={testCases}
            selectedIds={
              selectedIds
            }
            aiRecommendedIds={
              aiRecommendedIds
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}