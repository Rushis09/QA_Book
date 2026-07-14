import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TestCase } from "../../../types/testCase";

interface AssignedTestCasesTableProps {
  testCases: TestCase[];
  selectedIds: number[];
}

export default function AssignedTestCasesTable({
  testCases,
  selectedIds,
}: AssignedTestCasesTableProps) {
  const assignedTestCases = testCases.filter(
    (testCase) =>
      selectedIds.includes(testCase.id),
  );

  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{ p: 2 }}
      >
        Assigned Test Cases
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {assignedTestCases.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                align="center"
              >
                No test cases assigned.
              </TableCell>
            </TableRow>
          ) : (
            assignedTestCases.map(
              (testCase) => (
                <TableRow
                  key={testCase.id}
                >
                  <TableCell>
                    {
                      testCase.test_case_code
                    }
                  </TableCell>

                  <TableCell>
                    {testCase.title}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        testCase.priority
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ),
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}