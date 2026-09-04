import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ConfirmDialog from "../../components/common/ConfirmDialog";

import type { TestCase } from "../../types/testCase";
import type { AutomationTestMapping } from "../types/automation";

interface AutomationMappingTableProps {
  testCases: TestCase[];
  mappings: AutomationTestMapping[];
  onMap: (testCase: TestCase) => void;
  onBulkMap?: (testCaseIds: number[]) => void;
  onUnmap?: (mapping: AutomationTestMapping) => void;
}

export default function AutomationMappingTable({
  testCases,
  mappings,
  onMap,
  onBulkMap,
  onUnmap,
}: AutomationMappingTableProps) {
  const [selectedTestCaseIds, setSelectedTestCaseIds] =
    useState<number[]>([]);

  const [mappingToUnmap, setMappingToUnmap] =
    useState<AutomationTestMapping | null>(null);

  const unmappedTestCases = useMemo(
    () =>
      testCases.filter(
        (testCase) =>
          !mappings.some(
            (mapping) =>
              mapping.test_case_id === testCase.id,
          ),
      ),
    [testCases, mappings],
  );

  useEffect(() => {
    setSelectedTestCaseIds((current) =>
      current.filter((id) =>
        testCases.some(
          (testCase) => testCase.id === id,
        ),
      ),
    );
  }, [testCases]);

  const allUnmappedSelected =
    unmappedTestCases.length > 0 &&
    unmappedTestCases.every((testCase) =>
      selectedTestCaseIds.includes(testCase.id),
    );

  function getPriorityColor(
    priority: string,
  ): "error" | "warning" | "success" | "default" {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  }

  function getAutomationStatusColor(
    status: string,
  ): "success" | "primary" | "default" {
    switch (status) {
      case "Automated":
        return "success";
      case "Not Automated":
        return "primary";
      default:
        return "default";
    }
  }

  function handleSelectAll() {
    if (allUnmappedSelected) {
      setSelectedTestCaseIds([]);
      return;
    }

    setSelectedTestCaseIds(
      unmappedTestCases.map(
        (testCase) => testCase.id,
      ),
    );
  }

  function handleSelectTestCase(
    testCaseId: number,
  ) {
    setSelectedTestCaseIds((current) => {
      if (current.includes(testCaseId)) {
        return current.filter(
          (id) => id !== testCaseId,
        );
      }

      return [...current, testCaseId];
    });
  }

  function handleBulkMap() {
    if (
      selectedTestCaseIds.length === 0 ||
      !onBulkMap
    ) {
      return;
    }

    onBulkMap(selectedTestCaseIds);
    setSelectedTestCaseIds([]);
  }

  function handleUnmapClick(
    mapping: AutomationTestMapping,
  ) {
    if (!onUnmap) {
      return;
    }

    setMappingToUnmap(mapping);
  }

  function handleConfirmUnmap() {
    if (!mappingToUnmap || !onUnmap) {
      return;
    }

    onUnmap(mappingToUnmap);
    setMappingToUnmap(null);
  }

  function handleCancelUnmap() {
    setMappingToUnmap(null);
  }

  return (
    <>
      <Stack spacing={1}>
        {onBulkMap && testCases.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={allUnmappedSelected}
                indeterminate={
                  selectedTestCaseIds.length > 0 &&
                  !allUnmappedSelected
                }
                onChange={handleSelectAll}
                disabled={
                  unmappedTestCases.length === 0
                }
              />

              <Typography variant="body2">
                Select All Unmapped
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleBulkMap}
              disabled={
                selectedTestCaseIds.length === 0
              }
            >
              Map Selected (
              {selectedTestCaseIds.length})
            </Button>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allUnmappedSelected}
                    indeterminate={
                      selectedTestCaseIds.length > 0 &&
                      !allUnmappedSelected
                    }
                    onChange={handleSelectAll}
                    disabled={
                      unmappedTestCases.length === 0
                    }
                  />
                </TableCell>

                <TableCell>
                  Test Case Code
                </TableCell>

                <TableCell>
                  Title
                </TableCell>

                <TableCell>
                  Priority
                </TableCell>

                <TableCell>
                  Automation Eligibility
                </TableCell>

                <TableCell>
                  Automation Status
                </TableCell>

                <TableCell>
                  Mapping
                </TableCell>

                <TableCell align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {testCases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                  >
                    No eligible test cases found.
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((testCase) => {
                  const mapping = mappings.find(
                    (item) =>
                      item.test_case_id ===
                      testCase.id,
                  );

                  const isSelected =
                    selectedTestCaseIds.includes(
                      testCase.id,
                    );

                  return (
                    <TableRow
                      key={testCase.id}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            handleSelectTestCase(
                              testCase.id,
                            )
                          }
                          disabled={Boolean(mapping)}
                        />
                      </TableCell>

                      <TableCell>
                        {testCase.test_case_code}
                      </TableCell>

                      <TableCell>
                        {testCase.title}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={testCase.priority}
                          color={getPriorityColor(
                            testCase.priority,
                          )}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            testCase.automation_eligibility
                          }
                          color={
                            testCase.automation_eligibility ===
                            "Eligible"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            testCase.automation_status
                          }
                          color={getAutomationStatusColor(
                            testCase.automation_status,
                          )}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {mapping ? (
                          <Chip
                            label="Mapped"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Not Mapped"
                            size="small"
                          />
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {mapping ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                onMap(testCase)
                              }
                            >
                              Edit Mapping
                            </Button>

                            {onUnmap && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  handleUnmapClick(
                                    mapping,
                                  )
                                }
                              >
                                Unmap
                              </Button>
                            )}
                          </Stack>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              onMap(testCase)
                            }
                          >
                            Map Test Case
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <ConfirmDialog
        open={Boolean(mappingToUnmap)}
        title="Unmap Test Case"
        message={
          mappingToUnmap
            ? `Are you sure you want to unmap this automation mapping? This will remove only the automation mapping. The QABook test case will not be deleted.`
            : ""
        }
        confirmText="Unmap"
        cancelText="Cancel"
        onConfirm={handleConfirmUnmap}
        onCancel={handleCancelUnmap}
      />
    </>
  );
}