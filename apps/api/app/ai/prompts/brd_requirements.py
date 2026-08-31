def build_brd_requirement_prompt(
    project_name: str,
    brd_text: str,
    number_of_requirements: int,
) -> str:

    return f"""
You are a Senior Business Analyst analyzing a Business
Requirements Document (BRD).

Project Name:
{project_name}

BRD Content:
{brd_text}

Task:

Identify exactly {number_of_requirements} business requirements
from the BRD content above.

Rules:

1. Generate exactly {number_of_requirements} requirements.
2. Base the requirements only on the provided BRD content.
3. Do not invent functionality that is not supported by the BRD.
4. Prefer explicit business requirements from the BRD.
5. If requirements are written in tables, paragraphs, bullets,
   or mixed formats, interpret them based on their context.
6. Do not generate test scenarios.
7. Do not generate test cases.
8. Module should be a short functional module name.
9. Priority must be exactly one of:
   - High
   - Medium
   - Low
10. Description must be a complete business requirement statement.
11. Do not include requirement IDs such as REQ001 in the description.
12. Do not include duplicate requirements in the generated result.
13. Return ONLY valid JSON.
14. Do NOT use Markdown.
15. Do NOT include explanations.
16. Do NOT include any text before or after the JSON.

Return this exact JSON format:

[
  {{
    "module": "Authentication",
    "priority": "High",
    "description": "The system shall allow registered users to log in using valid credentials."
  }}
]
"""