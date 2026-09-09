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

Requirement:
Code: {test_case["requirement_code"]}
Description: {test_case["requirement_description"]}

Scenario:
Code: {test_case["scenario_code"]}
Title: {test_case["scenario_title"]}
Description: {test_case["scenario_description"]}

Module: {test_case["module"]}
Priority: {test_case["priority"]}
Status: {test_case["status"]}

Test Case Title:
{test_case["title"]}

Expected Result:
{test_case["expected_result"]}

Automation Eligibility:
{test_case["automation_eligibility"]}
"""
            for test_case in test_cases
        ]
    )

    return f"""
You are a Senior QA Engineer responsible for building a focused,
high-quality test suite from existing test cases.

TEST SUITE

Name:
{suite_name}

Description:
{suite_description}

EXISTING TEST CASES

The following test cases are the ONLY candidates you may select:

{candidates}

YOUR TASK

Select only the test cases that genuinely belong in this test suite.

The suite name and description define the intended scope.

A test case should be recommended only when its actual functionality
directly supports the purpose of the suite.

Evaluate the COMPLETE functional context of each test case:

- Requirement description
- Scenario title
- Scenario description
- Module
- Test case title
- Expected result

IMPORTANT RELEVANCE RULES

1. Recommend ONLY test cases from the provided candidate list.

2. Never create, modify, or invent test cases.

3. Never invent test case IDs.

4. Direct functional relevance is required.

5. Do NOT select a test case merely because it shares one or more
   words with the suite name or description.

6. Do NOT treat generic words such as "user", "account", "test",
   "verify", "validate", "system", or "management" as sufficient
   evidence of relevance.

7. The requirement and scenario describe WHAT functionality is being
   tested. Use them as primary evidence when deciding relevance.

8. The test case title and expected result provide additional
   evidence about the actual behavior being tested.

9. Module is supporting context only. Do not recommend a test case
   solely because its module name appears related to the suite.

10. If a test case belongs to a different functional area, exclude it
    even if it contains words that overlap with the suite.

11. A test case must be directly useful for validating the purpose of
    this suite.

12. Prefer meaningful functional coverage over duplicate or nearly
    identical test cases.

13. Do not select unrelated project, requirements, scenarios,
    automation, CI/CD, reporting, or other functionality unless the
    suite itself explicitly covers that functionality.

14. For broad suites, include relevant coverage across the suite's
    stated scope.

15. For focused suites, keep the recommendations tightly scoped.

16. Do not force a fixed number of recommendations. The number should
    depend entirely on how many provided test cases are genuinely
    relevant.

17. When uncertain between a directly relevant case and a loosely
    related case, exclude the loosely related case.

QUALITY CHECK

Before returning the result, mentally evaluate every selected test case:

"Would a QA engineer reasonably expect this test case to be part of
this exact test suite?"

If the answer is no, do not recommend it.

FINAL OUTPUT

Return ONLY valid JSON.

Do not return Markdown.
Do not return explanations.
Do not return reasoning.
Do not return relevance scores.
Do not return test case details.

Use exactly this structure:

{{
  "recommended_test_case_ids": [1, 4, 7]
}}
"""