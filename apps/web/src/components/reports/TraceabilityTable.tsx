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

import type { TraceabilityItem } from "../../types/report";

interface TraceabilityTableProps {
  traceability: TraceabilityItem[];
}

export default function TraceabilityTable({
  traceability,
}: TraceabilityTableProps) {
  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{ p: 2 }}
      >
        Traceability Matrix
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Requirement
            </TableCell>

            <TableCell>
              Scenario
            </TableCell>

            <TableCell>
              Test Case
            </TableCell>

            <TableCell>
              Execution Status
            </TableCell>

            <TableCell>
              Bug
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {traceability.map(
            (
              item,
              index,
            ) => (
              <TableRow
                key={index}
                hover
              >
                <TableCell>
                  {item.requirement_code}
                </TableCell>

                <TableCell>
                  {item.scenario_code}
                </TableCell>

                <TableCell>
                  {item.test_case_code}
                </TableCell>

                <TableCell>
                  {item.execution_status ??
                    "-"}
                </TableCell>

                <TableCell>
                  {item.bug_code ?? "-"}
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}