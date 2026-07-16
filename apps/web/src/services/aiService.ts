import api from "./api";

export interface GenerateAIRequest {
  prompt: string;
}

export interface GenerateAIResponse {
  response: string;
}

export const aiService = {
  async generate(
    prompt: string,
  ): Promise<string> {
    const { data } =
      await api.post<GenerateAIResponse>(
        "/ai/generate",
        {
          prompt,
        },
      );

    return data.response;
  },
};