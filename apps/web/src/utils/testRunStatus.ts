export function getTestRunStatusColor(
  status: string,
):
  | "default"
  | "warning"
  | "info"
  | "success" {
  switch (status) {
    case "Completed":
      return "success";

    case "In Progress":
      return "info";

    case "Not Started":
      return "warning";

    default:
      return "default";
  }
}