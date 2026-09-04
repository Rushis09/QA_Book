export const BUG_SEVERITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export const BUG_PRIORITIES = [
  "High",
  "Medium",
  "Low",
] as const;

export const BUG_STATUSES = [
  "Open",
  "Triaged",
  "In Progress",
  "Fixed",
  "Ready for QA",
  "Retesting",
  "Closed",
  "Reopened",
] as const;

export const BUG_RESOLUTIONS = [
  "Fixed",
  "Duplicate",
  "Cannot Reproduce",
  "Won't Fix",
  "Not a Bug",
  "By Design",
] as const;