import json
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
                model="gemini-3.1-flash-lite",
                contents=prompt,
            )

            return response.text

        except Exception as error:
            raise RuntimeError(
                f"AI generation failed: {error}"
            )

    def generate_json(
        self,
        prompt: str,
    ):
        response = self.generate(prompt).strip()
    
        if response.startswith("```json"):
            response = response[7:]
    
        if response.startswith("```"):
            response = response[3:]
    
        if response.endswith("```"):
            response = response[:-3]
    
        response = response.strip()
    
        try:
            return json.loads(response)
    
        except json.JSONDecodeError as error:
            raise ValueError(
                f"AI returned invalid JSON: {error}"
            )