import api from "./api";

export interface Document {
  id: number;
  document_code: string;
  project_id: number;
  document_type: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async getProjectDocuments(
    projectId: number,
  ): Promise<Document[]> {
    const response =
      await api.get<Document[]>(
        `/documents/project/${projectId}`,
      );

    return response.data;
  },

  async uploadDocument(
    projectId: number,
    title: string,
    file: File,
  ): Promise<Document> {
    const formData = new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "project_id",
      String(projectId),
    );

    formData.append(
      "title",
      title,
    );

    const response =
      await api.post<Document>(
        "/documents/upload",
        formData,
      );

    return response.data;
  },

  async downloadDocument(
    documentId: number,
  ): Promise<Blob> {
    const response =
      await api.get<Blob>(
        `/documents/${documentId}/download`,
        {
          responseType: "blob",
        },
      );

    return response.data;
  },

  async deleteDocument(
    documentId: number,
  ): Promise<void> {
    await api.delete(
      `/documents/${documentId}`,
    );
  },
};