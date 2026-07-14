import api from "./api";

async function downloadExport(
  endpoint: string,
  filename: string,
) {
  const response = await api.get(endpoint, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

export const exportService = {

  async exportProject(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/project/${projectId}`,
      `${projectCode}_ProjectSummary.xlsx`,
    );
  },
  async exportRequirements(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/requirements/${projectId}`,
      `${projectCode}_Requirements.xlsx`,
    );
  },

    async exportScenarios(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/scenarios/${projectId}`,
      `${projectCode}_TestScenarios.xlsx`,
    );
  },

  async exportTestCases(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/test-cases/${projectId}`,
      `${projectCode}_TestCases.xlsx`,
    );
  },

  async exportTestSuites(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/test-suites/${projectId}`,
      `${projectCode}_TestSuites.xlsx`,
    );
  },

  async exportTestRuns(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/test-runs/${projectId}`,
      `${projectCode}_TestRuns.xlsx`,
    );
  },

  async exportBugs(
    projectId: number,
    projectCode: string,
  ) {
    await downloadExport(
      `/exports/bugs/${projectId}`,
      `${projectCode}_BugReport.xlsx`,
    );
  },
};