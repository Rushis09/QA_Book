import  { useEffect, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import type { TestCase } from "../../../types/testCase";

interface AIRecommendationDialogProps {
  open: boolean;
  testCases: TestCase[];
  recommendedIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
  loading?: boolean;
}

export default function AIRecommendationDialog({
  open,
  testCases,
  recommendedIds,
  onClose,
  onConfirm,
  loading = false,
}: AIRecommendationDialogProps) {
  const recommendedTestCases = testCases.filter((testCase) =>
    recommendedIds.includes(testCase.id),
  );

    const [selectedIds, setSelectedIds] =
        useState<number[]>(recommendedIds);

    useEffect(() => {
      if (open) {
        setSelectedIds(recommendedIds);
      }
    }, [open, recommendedIds]);

  const allSelected =
    recommendedTestCases.length > 0 &&
    recommendedTestCases.every((testCase) =>
      selectedIds.includes(testCase.id),
    );

  const selectedCount = selectedIds.length;

  function handleToggle(id: number) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  function handleAcceptAll() {
    setSelectedIds(
      recommendedTestCases.map(
        (testCase) => testCase.id,
      ),
    );
  }

  function handleRejectAll() {
    setSelectedIds([]);
  }

  function handleRemove(id: number) {
    setSelectedIds((previous: number[]) =>
      previous.filter((item) => item !== id),
    );
  }

  function handleConfirm() {
    onConfirm(selectedIds);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "14px",
          overflow: "hidden",
        },
      }}
    
    >
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.75,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                mb: 0.45,
              }}
            >
              <AutoAwesomeRoundedIcon
                sx={{
                  fontSize: 19,
                  color: "#356dff",
                }}
              />

              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 750,
                  color: "#101828",
                }}
              >
                AI Recommended Test Cases
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#667085",
              }}
            >
              Review the recommendations and select
              only the test cases you want to assign.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#667085",
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          p: 0,
        }}
      >
        {/* Review Summary */}
        <Box
          sx={{
            px: 2.5,
            py: 1.35,
            backgroundColor: "#f8fbff",
            borderBottom: "1px solid #e4e7ec",
          }}
        >
          <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
            <Chip
              icon={
                <AutoAwesomeRoundedIcon
                  sx={{ fontSize: 14 }}
                />
              }
              label={`${recommendedTestCases.length} recommended`}
              size="small"
              sx={{
                height: 24,
                borderRadius: "6px",
                backgroundColor: "#eef4ff",
                color: "#3538cd",
                border: "1px solid #c7d7fe",
                fontSize: "0.63rem",
                fontWeight: 700,
              }}
            />

            <Chip
              icon={
                <CheckCircleOutlineRoundedIcon
                  sx={{ fontSize: 14 }}
                />
              }
              label={`${selectedCount} selected`}
              size="small"
              sx={{
                height: 24,
                borderRadius: "6px",
                backgroundColor: "#ecfdf3",
                color: "#027a48",
                border: "1px solid #abefc6",
                fontSize: "0.63rem",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* Bulk Actions */}
        <Box
          sx={{
            px: 2.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderBottom: "1px solid #e4e7ec",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.68rem",
              color: "#667085",
            }}
          >
            Accept or reject individual recommendations.
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
          >
            <Button
              size="small"
              onClick={handleAcceptAll}
              disabled={
                loading ||
                recommendedTestCases.length === 0 ||
                allSelected
              }
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Accept All
            </Button>

            <Button
              size="small"
              onClick={handleRejectAll}
              disabled={
                loading ||
                selectedIds.length === 0
              }
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Reject All
            </Button>
          </Stack>
        </Box>

        {/* Recommendations */}
        <Box
          sx={{
            maxHeight: "55vh",
            overflowY: "auto",
            px: 2.5,
            py: 1.5,
          }}
        >
          {recommendedTestCases.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#344054",
                }}
              >
                No recommendations available
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: "0.68rem",
                  color: "#667085",
                }}
              >
                AI did not return any applicable test cases.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {recommendedTestCases.map(
                (testCase) => {
                  const selected =
                    selectedIds.includes(testCase.id);

                  return (
                    <Box
                      key={testCase.id}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1.25,
                        border: selected
                          ? "1px solid #b2ccff"
                          : "1px solid #e4e7ec",
                        borderRadius: "9px",
                        backgroundColor: selected
                          ? "#f8fbff"
                          : "#ffffff",
                      }}
                    >
                      <Checkbox
                        checked={selected}
                        onChange={() =>
                          handleToggle(testCase.id)
                        }
                        size="small"
                        sx={{
                          p: 0.25,
                          mt: 0.1,
                        }}
                      />

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.7,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.74rem",
                              fontWeight: 750,
                              color: "#101828",
                            }}
                          >
                            {testCase.title}
                          </Typography>

                          <Chip
                            label={testCase.test_case_code}
                            size="small"
                            sx={{
                              height: 19,
                              borderRadius: "5px",
                              fontSize: "0.57rem",
                              fontWeight: 700,
                              backgroundColor: "#ffffff",
                              border:
                                "1px solid #d0d5dd",
                              color: "#475467",
                            }}
                          />

                          <Chip
                            label={testCase.priority}
                            size="small"
                            sx={{
                              height: 19,
                              borderRadius: "5px",
                              fontSize: "0.57rem",
                              fontWeight: 700,
                            }}
                          />
                        </Box>

                        {testCase.description && (
                          <Typography
                            sx={{
                              mt: 0.45,
                              fontSize: "0.66rem",
                              color: "#667085",
                              lineHeight: 1.45,
                            }}
                          >
                            {testCase.description}
                          </Typography>
                        )}
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() =>
                          handleRemove(testCase.id)
                        }
                        disabled={loading}
                        sx={{
                          color: "#98a2b3",
                          "&:hover": {
                            color: "#d92d20",
                            backgroundColor: "#fef3f2",
                          },
                        }}
                      >
                        <DeleteOutlineRoundedIcon
                          sx={{ fontSize: 17 }}
                        />
                      </IconButton>
                    </Box>
                  );
                },
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.4,
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.66rem",
            color: "#667085",
          }}
        >
          {selectedCount} test case
          {selectedCount === 1 ? "" : "s"} will be
          assigned.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={
              loading || selectedIds.length === 0
            }
            sx={{
              minWidth: 145,
              borderRadius: "8px",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            {loading
              ? "Assigning..."
              : `Assign Selected (${selectedCount})`}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}