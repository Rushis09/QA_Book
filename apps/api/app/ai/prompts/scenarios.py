def build_scenario_prompt(
    requirement_code: str,
    requirement_module: str,
    requirement_description: str,
    manual_description: str,
    number_of_scenarios: int,
) -> str:

    if manual_description.strip():
        source = f"""
User Additional Instructions:

{manual_description}
"""
    else:
        source = f"""
Requirement Description:

{requirement_description}
"""

    return f"""
You are a Senior QA Engineer.

Generate exactly {number_of_scenarios} functional test scenarios.

Requirement Code:
{requirement_code}

Module:
{requirement_module}

{source}

Rules:

1. Generate exactly {number_of_scenarios} test scenarios.
2. Each scenario must be unique.
3. Focus only on high-level functional test scenarios.
4. Do NOT generate test cases.
5. Do NOT generate test steps.
6. Title should be short and descriptive.
7. Priority must be exactly one of:
   - High
   - Medium
   - Low
8. Status must be exactly:
   - Draft
9. Description must clearly explain what the scenario verifies.
10. Do NOT generate Module.
11. Do NOT generate Requirement Code.
12. Do NOT generate Scenario Code.
13. Return ONLY valid JSON.
14. Do NOT use Markdown.
15. Do NOT include explanations.
16. Do NOT include any text before or after the JSON.

Return this exact JSON format:

[
  {{
    "title": "Verify successful user login",
    "priority": "High",
    "status": "Draft",
    "description": "Verify that a registered user can log in using valid credentials."
  }}
]
"""