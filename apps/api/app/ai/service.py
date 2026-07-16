import os

from google import genai


class AIService:

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not configured."
            )

        self.client = genai.Client(
            api_key=api_key,
        )

    def generate(
        self,
        prompt: str,
    ) -> str:

        try:
            response = self.client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
            )

            return response.text

        except Exception as error:
            raise RuntimeError(
                f"AI generation failed: {error}"
            )