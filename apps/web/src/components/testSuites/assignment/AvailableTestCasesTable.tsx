import {
  Checkbox,
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

interface AvailableTestCasesTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function AvailableTestCasesTable({
  testCases,
  selectedIds,
  onToggle,
}: AvailableTestCasesTableProps) {
  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{ p: 2 }}
      >
        Available Test Cases
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>Code</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.map((testCase) => (
            <TableRow key={testCase.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(
                    testCase.id,
                  )}
                  onChange={() =>
                    onToggle(testCase.id)
                  }
                />
              </TableCell>

              <TableCell>
                {testCase.test_case_code}
              </TableCell>

              <TableCell>
                {testCase.title}
              </TableCell>

              <TableCell>
                {testCase.priority}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}