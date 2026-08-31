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

Generate exactly {number_of_test_cases} functional test cases for the ONE selected test scenario below.

Scenario Code:
{scenario_code}

Module:
{module}

{source}

IMPORTANT SCOPE RULE:

All generated test cases MUST test the exact behavior described by the selected scenario.

Do NOT expand into related, neighboring, or different functionality.
Do NOT create test cases for other scenarios under the same requirement.
Do NOT create test cases for other requirements.
Do NOT infer additional features that are not part of the selected scenario.

For example:
If the selected scenario is "Successful account registration", generate test cases
that verify successful account registration using valid variations of the scenario.
Do NOT generate separate cases for duplicate email, invalid email, weak password,
password reset, login, password visibility, or other functionality unless that
behavior is explicitly part of the selected scenario description.

Rules:

1. Generate exactly {number_of_test_cases} test cases.
2. Each test case must be unique.
3. Every test case must remain strictly within the selected scenario scope.
4. Focus only on functional testing.
5. Generate realistic enterprise QA test cases.
6. Test different valid conditions, input combinations, or meaningful variations
   of the selected scenario when appropriate.
7. Do not turn a different scenario into a test case.
8. Title should be short and descriptive.
9. Preconditions should describe the required system state before execution.
10. Test Data should contain only the required input data.
11. Steps should be a concise numbered list written as plain text.
12. Expected Result should clearly describe the expected outcome.
13. Priority must be exactly one of:
    - High
    - Medium
    - Low
14. Do NOT generate:
    - Module
    - Status
    - Scenario Code
    - Test Case Code
15. Status will always be Draft.
16. Return ONLY valid JSON.
17. Do NOT use Markdown.
18. Do NOT include explanations.
19. Do NOT include any text before or after the JSON.

Before generating each test case, verify internally:

- Does it test the selected scenario?
- Does it remain within the scenario description?
- Is it functionally different from the other generated cases?
- Is it NOT testing a separate scenario?

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