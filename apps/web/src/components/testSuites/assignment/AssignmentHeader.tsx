import {
  Button,
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
    <Stack
      direction="row"
      sx={{
        mb: 3,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Typography variant="h5">
          {suite.suite_code} - {suite.name}
        </Typography>

        <Typography color="text.secondary">
          Assigned Test Cases: {assignedCount}
        </Typography>
      </div>

      <Button
        variant="contained"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Assignment"}
      </Button>
    </Stack>
  );
}