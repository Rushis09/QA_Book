import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { TestSuite } from "../../../types/testSuite";

interface AssignmentHeaderProps {
  suite: TestSuite;
  assignedCount: number;
  onSave: () => void;
  saving: boolean;
}

export default function AssignmentHeader({
  suite,
  assignedCount,
  onSave,
  saving,
}: AssignmentHeaderProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 3,
        p: 2.5,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mb: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Assign Test Cases
            </Typography>

            <Chip
              label={suite.suite_code}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
            }}
          >
            {suite.name}
          </Typography>

          {suite.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {suite.description}
            </Typography>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            {assignedCount}{" "}
            {assignedCount === 1
              ? "test case"
              : "test cases"}{" "}
            assigned
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          sx={{
            minWidth: 150,
          }}
        >
          {saving
            ? "Saving..."
            : "Save Assignment"}
        </Button>
      </Stack>
    </Paper>
  );
}