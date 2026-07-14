import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import type { TestScenario } from "../../types/testScenario";

interface TestScenarioTableProps {
  testScenarios: TestScenario[];
  onEdit: (testScenario: TestScenario) => void;
  onDelete: (testScenario: TestScenario) => void;
}

export default function TestScenarioTable({
  testScenarios,
  onEdit,
  onDelete,
}: TestScenarioTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Scenario Code</TableCell>
            <TableCell>Requirement</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testScenarios.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
              >
                No test scenarios found.
              </TableCell>
            </TableRow>
          ) : (
            testScenarios.map((testScenario) => (
              <TableRow key={testScenario.id}>
                <TableCell>
                  {testScenario.scenario_code}
                </TableCell>

                <TableCell>
                  {`${testScenario.requirement.requirement_code} - ${testScenario.requirement.module}`}
                </TableCell>

                <TableCell>
                  {testScenario.title}
                </TableCell>

                <TableCell>
                  {testScenario.description ?? "-"}
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onEdit(testScenario)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() =>
                      onDelete(testScenario)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}