import {
  Box,
  Checkbox,
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

interface AvailableTestCasesTableProps {
  testCases: TestCase[];
  selectedIds: number[];
  aiRecommendedIds: number[];
  onToggle: (id: number) => void;
}

export default function AvailableTestCasesTable({
  testCases,
  selectedIds,
  aiRecommendedIds,
  onToggle,
}: AvailableTestCasesTableProps) {
  const visibleIds = testCases.map(
    (testCase) => testCase.id,
  );

  const selectedVisibleIds =
    visibleIds.filter((id) =>
      selectedIds.includes(id),
    );

  const allSelected =
    visibleIds.length > 0 &&
    selectedVisibleIds.length ===
      visibleIds.length;

  const someSelected =
    selectedVisibleIds.length > 0 &&
    !allSelected;

  function toggleSelectAll(
    checked: boolean,
  ) {
    if (checked) {
      testCases.forEach((testCase) => {
        if (!selectedIds.includes(testCase.id)) {
          onToggle(testCase.id);
        }
      });
    } else {
      visibleIds.forEach((id) => {
        if (selectedIds.includes(id)) {
          onToggle(id);
        }
      });
    }
  }

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
            <TableCell padding="checkbox">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(event) =>
                  toggleSelectAll(
                    event.target.checked,
                  )
                }
              />
            </TableCell>

            <TableCell>
              Code
            </TableCell>

            <TableCell>
              Title
            </TableCell>

            <TableCell>
              Priority
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testCases.map((testCase) => (
            <TableRow
              key={testCase.id}
              hover
            >
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2">
                    {testCase.title}
                  </Typography>
                
                  {aiRecommendedIds.includes(
                    testCase.id,
                  ) && (
                    <Chip
                      label="AI Recommended"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
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