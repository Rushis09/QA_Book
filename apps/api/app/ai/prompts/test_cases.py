def build_test_case_prompt(
    scenario_code: str,
    module: str,
    scenario_title: str,
    scenario_description: str,
    manual_description: str,
    number_of_test_cases: int,
) -> str:

    if manual_description.strip():
        source = f"""
User Additional Instructions:

{manual_description}
"""
    else:
        source = f"""
Scenario Description:

Title:
{scenario_title}

Description:
{scenario_description}
"""

    return f"""
You are a Senior QA Engineer.

Generate exactly {number_of_test_cases} functional test cases.

Scenario Code:
{scenario_code}

Module:
{module}

{source}

Rules:

1. Generate exactly {number_of_test_cases} test cases.
2. Each test case must be unique.
3. Focus only on functional testing.
4. Generate realistic enterprise QA test cases.
5. Title should be short and descriptive.
6. Preconditions should describe the required system state before execution.
7. Test Data should contain only the required input data.
8. Steps should be a concise numbered list written as plain text.
9. Expected Result should clearly describe the expected outcome.
10. Priority must be exactly one of:
    - High
    - Medium
    - Low
11. Do NOT generate:
    - Module
    - Status
    - Scenario Code
    - Test Case Code
12. Status will always be Draft.
13. Return ONLY valid JSON.
14. Do NOT use Markdown.
15. Do NOT include explanations.
16. Do NOT include any text before or after the JSON.

Return this exact JSON format:

[
  {{
    "title": "Verify successful login with valid credentials",
    "priority": "High",
    "preconditions": "A registered active user account exists.",
    "test_data": "Username: user@example.com, Password: Password123",
    "steps": "1. Open the login page.\\n2. Enter valid credentials.\\n3. Click Login.",
    "expected_result": "The user is successfully logged in and redirected to the dashboard."
  }}
]
"""