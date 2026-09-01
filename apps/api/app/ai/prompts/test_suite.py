def build_test_suite_recommendation_prompt(
    suite_name: str,
    suite_description: str,
    test_cases: list[dict],
) -> str:

    candidates = "\n".join(
        [
            f"""
Test Case ID: {test_case["id"]}
Test Case Code: {test_case["test_case_code"]}
Requirement: {test_case["requirement_code"]}
Scenario: {test_case["scenario_code"]} - {test_case["scenario_title"]}
Module: {test_case["module"]}
Priority: {test_case["priority"]}
Status: {test_case["status"]}
Title: {test_case["title"]}
"""
            for test_case in test_cases
        ]
    )

    return f"""
You are a Senior QA Engineer responsible for selecting test cases
for a test suite.

Test Suite:

Name:
{suite_name}

Description:
{suite_description}

Below are EXISTING test cases available for this suite.

{candidates}

Your task is to recommend the test cases that are most relevant
for this test suite.

IMPORTANT RULES:

1. Recommend ONLY test cases from the provided list.
2. Do NOT create new test cases.
3. Do NOT modify any test case.
4. Do NOT invent test case IDs.
5. Select test cases based on the suite name, suite description,
   requirement, scenario, module, priority, status, and test case title.
6. Prefer meaningful functional coverage.
7. Avoid recommending duplicate or redundant coverage.
8. If the suite represents a focused testing purpose such as
   Smoke, prioritize critical business flows and high-value coverage.
9. If the suite description specifies a particular scope, stay
   within that scope.
10. Return only the IDs of recommended existing test cases.
11. Return valid JSON only.
12. Do NOT return Markdown.
13. Do NOT include explanations.

Return this exact JSON format:

{{
  "recommended_test_case_ids": [1, 4, 7]
}}
"""