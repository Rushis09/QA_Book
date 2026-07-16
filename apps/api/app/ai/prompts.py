"""
Centralized AI prompts for QABook.

Every AI feature should define its prompt here.
Do not place prompts inside router.py or service.py.
"""

GENERATE_REQUIREMENTS_PROMPT = """
You are a Senior QA Business Analyst.

Generate functional software requirements for the following project.

Return ONLY valid JSON.

Project:

{project}
"""


GENERATE_SCENARIOS_PROMPT = """
You are a Senior QA Engineer.

Generate comprehensive test scenarios for the following requirement.

Return ONLY valid JSON.

Requirement:

{requirement}
"""


GENERATE_TEST_CASES_PROMPT = """
You are a Senior QA Engineer.

Generate comprehensive manual test cases.

Return ONLY valid JSON.

Rules:

1. Do not return markdown.
2. Do not return explanations.
3. Generate test cases only for the given scenario.
4. Include:
   - Functional
   - Negative
   - Boundary
   - Validation
   - Security (if applicable)
   - Session/Auth (if applicable)

Scenario:

{scenario}
"""