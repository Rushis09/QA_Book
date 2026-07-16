def build_requirement_prompt(
    project_name: str,
    project_description: str,
    manual_description: str,
    number_of_requirements: int,
) -> str:

    if manual_description.strip():
        source = f"""
User Requirement Description:

{manual_description}
"""
    else:
        source = f"""
Project Description:

{project_description}
"""

    return f"""
You are a Senior Business Analyst.

Generate exactly {number_of_requirements} functional software requirements.

Project Name:
{project_name}

{source}

Rules:

1. Generate exactly {number_of_requirements} requirements.
2. Each requirement must be unique.
3. Focus only on business requirements.
4. Do NOT generate test scenarios.
5. Do NOT generate test cases.
6. Module should be a short functional module name.
7. Priority must be exactly one of:
   - High
   - Medium
   - Low
8. Description must be a complete business requirement statement.
9. Return ONLY valid JSON.
10. Do NOT use Markdown.
11. Do NOT include explanations.
12. Do NOT include any text before or after the JSON.

Return this exact JSON format:

[
  {{
    "module": "Authentication",
    "priority": "High",
    "description": "The system shall allow registered users to log in using a valid email address and password."
  }}
]
"""