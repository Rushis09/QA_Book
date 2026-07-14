import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { RequirementCoverage } from "../../types/report";

interface RequirementCoverageTableProps {
  coverage: RequirementCoverage[];
}

export default function RequirementCoverageTable({
  coverage,
}: RequirementCoverageTableProps) {
  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{ p: 2 }}
      >
        Requirement Coverage
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Requirement Code
            </TableCell>

            <TableCell>
              Module
            </TableCell>

            <TableCell align="center">
              Scenarios
            </TableCell>

            <TableCell align="center">
              Test Cases
            </TableCell>

            <TableCell align="center">
              Coverage
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {coverage.map((item) => (
            <TableRow
              key={item.requirement_id}
              hover
            >
              <TableCell>
                {item.requirement_code}
              </TableCell>

              <TableCell>
                {item.module}
              </TableCell>

              <TableCell align="center">
                {item.scenario_count}
              </TableCell>

              <TableCell align="center">
                {item.test_case_count}
              </TableCell>

              <TableCell align="center">
                {item.coverage_percentage}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}