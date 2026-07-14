import api from "./api";

export const exportService = {
  async exportRequirements(
    projectId: number,
    projectCode: string,
  ) {
    const response = await api.get(
      `/exports/requirements/${projectId}`,
      {
        responseType: "blob",
      },
    );

    const blob = new Blob([response.data], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${projectCode}_Requirements.xlsx`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  },
};