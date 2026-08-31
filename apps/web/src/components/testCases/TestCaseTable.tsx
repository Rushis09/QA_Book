import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import type { TestCase } from "../../types/testCase";

interface TestCaseTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCase: TestCase) => void;
}

export default function TestCaseTable({
  testCases,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
}: TestCaseTableProps) {
  function getPriorityColor(
    priority: string,
  ):
    | "error"
    | "warning"
    | "success"
    | "default" {
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

  function getStatusColor(
    status: string,
  ): "default" | "primary" | "success" {
    switch (status) {
      case "Approved":
        return "primary";
      case "Ready":
        return "success";
      default:
        return "default";
    }
  }

  const visibleIds = testCases.map(
    (testCase) => testCase.id,
  );

  const selectedVisibleIds = visibleIds.filter(
    (id) => selectedIds.includes(id),
  );

  const allSelected =
    visibleIds.length > 0 &&
    selectedVisibleIds.length === visibleIds.length;

  const someSelected =
    selectedVisibleIds.length > 0 &&
    selectedVisibleIds.length < visibleIds.length;

  function handleSelectAll() {
    if (allSelected) {
      onSelectionChange(
        selectedIds.filter(
          (id) => !visibleIds.includes(id),
        ),
      );
      return;
    }

    const nextIds = [
      ...selectedIds,
      ...visibleIds.filter(
        (id) => !selectedIds.includes(id),
      ),
    ];

    onSelectionChange(nextIds);
  }

  function handleSelectTestCase(
    testCaseId: number,
  ) {
    if (selectedIds.includes(testCaseId)) {
      onSelectionChange(
        selectedIds.filter(
          (id) => id !== testCaseId,
        ),
      );
      return;
    }

    onSelectionChange([
      ...selectedIds,
      testCaseId,
    ]);
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleSelectAll}
              />
            </TableCell>

            <TableCell>
              Test Case Code
            </TableCell>

            <TableCell>
              Scenario
            </TableCell>

            <TableCell>
              Requirement
            </TableCell>

            <TableCell>
              Module
            </TableCell>

            <TableCell>
              Priority
            </TableCell>

            <TableCell>
              Status
            </TableCell>

            <TableCell>
              Title
            </TableCell>

            <TableCell>
              Expected Result
            </TableCell>

            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                align="center"
              >
                No test cases found.
              </TableCell>
            </TableRow>
          ) : (
            testCases.map((testCase) => {
              const isSelected =
                selectedIds.includes(
                  testCase.id,
                );

              return (
                <TableRow
                  key={testCase.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() =>
                        handleSelectTestCase(
                          testCase.id,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {testCase.test_case_code}
                  </TableCell>

                  <TableCell>
                    {`${testCase.scenario.scenario_code} - ${testCase.scenario.title}`}
                  </TableCell>

                  <TableCell>
                    {`${testCase.scenario.requirement.requirement_code} - ${testCase.scenario.requirement.module}`}
                  </TableCell>

                  <TableCell>
                    {testCase.module}
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
                      label={testCase.status}
                      color={getStatusColor(
                        testCase.status,
                      )}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {testCase.title}
                  </TableCell>

                  <TableCell>
                    {testCase.expected_result ??
                      "-"}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        onEdit(testCase)
                      }
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() =>
                        onDelete(testCase)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}