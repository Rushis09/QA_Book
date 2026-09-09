def build_test_case_prompt(
    scenario_code: str,
    module: str,
    scenario_title: str,
    scenario_description: str,
    manual_description: str,
    number_of_test_cases: int,
) -> str:

    additional_instructions = (
        manual_description.strip()
        if manual_description.strip()
        else "No additional instructions provided."
    )

    return f"""
You are a Senior QA Engineer and Test Case Design Specialist.

Your task is to create high-quality functional test cases for
ONE selected test scenario.

The selected scenario is the authoritative scope boundary.

Generate AT MOST {number_of_test_cases} meaningful test cases.

The requested number is a maximum, not a requirement to invent
additional test cases.

====================
SELECTED SCENARIO
====================

Scenario Code:
{scenario_code}

Module:
{module}

Scenario Title:
{scenario_title}

Scenario Description:
{scenario_description}

====================
ADDITIONAL USER INSTRUCTIONS
====================

{additional_instructions}

These instructions provide additional guidance only.
They MUST NOT replace or contradict the selected scenario.

====================
STRICT SCOPE
====================

Every generated test case MUST verify the behavior described
by the selected scenario.

Do NOT generate test cases for:

- Other scenarios
- Other requirements
- Related functionality
- Neighboring workflows
- Features merely because they are commonly associated
  with the scenario

For example, if the scenario describes successful registration,
do not create test cases for:

- Login
- Password reset
- Duplicate registration
- Invalid email
- Account lockout
- Password visibility

unless those behaviors are explicitly part of the selected scenario.

====================
TEST CASE QUALITY
====================

Each test case must be:

- Functionally meaningful
- Executable by a QA tester
- Behaviorally distinct
- Traceable to the selected scenario
- Internally consistent
- Realistic for the stated behavior

Meaningful variations may include, when supported by the scenario:

- Different valid input combinations
- Relevant boundary conditions
- Different supported states
- Alternate valid paths
- Applicable validation conditions
- Relevant error conditions

Do NOT create artificial variations by merely changing:

- Usernames
- Email addresses
- Random numbers
- Text values
- Browser names
- Device names

unless the variation changes the actual behavior being tested.

====================
NO INVENTED BEHAVIOR
====================

Do NOT invent:

- Business rules
- Validation rules
- Input limits
- Roles
- Permissions
- Error messages
- Integrations
- Database behavior
- API behavior
- UI behavior
- System states

unless they are explicitly supported by the scenario
or additional user instructions.

If the available information does not justify a test case,
do not create it.

If fewer than {number_of_test_cases} meaningful test cases can
be justified, return fewer.

Never sacrifice QA quality to reach the requested count.

====================
FIELD RULES
====================

title:
Short and specific test objective.

priority:
Exactly one:

- High
- Medium
- Low

preconditions:
Only the system state genuinely required before execution.

test_data:
Only data required to execute the test.

steps:
A concise numbered sequence of executable actions.

expected_result:
A clear observable result that directly corresponds
to the executed steps and selected scenario.

Do not include:

- Module
- Scenario Code
- Test Case Code
- Status

Status will be assigned by the application as Draft.

====================
STEP / EXPECTED RESULT CONSISTENCY
====================

The test case must have logical consistency:

Preconditions
    ↓
Test Data
    ↓
Steps
    ↓
Expected Result

The expected result must describe what should happen because
of the actions performed in the steps.

Do not include an expected result that is not caused by,
or observable from, the executed steps.

====================
OUTPUT RULES
====================

Return ONLY valid JSON.

Return a JSON array.

Do NOT return Markdown.

Do NOT return explanations.

Do NOT include text before or after the JSON.

Each object MUST contain exactly:

- title
- priority
- preconditions
- test_data
- steps
- expected_result

Return this structure:

[
  {{
    "title": "Verify successful login with valid credentials",
    "priority": "High",
    "preconditions": "A registered active user account exists.",
    "test_data": "Valid username and password.",
    "steps": "1. Open the login page.\\n2. Enter valid credentials.\\n3. Submit the login form.",
    "expected_result": "The user is authenticated successfully and the expected post-login page is displayed."
  }}
]

Before returning each test case, internally verify:

- Does it test the selected scenario?
- Is it within the exact scenario scope?
- Is the behavior genuinely different from other generated cases?
- Are the steps executable?
- Does the expected result match the steps?
- Has undocumented behavior been invented?
- Is this a test case rather than a separate scenario?
"""

def build_bulk_test_case_prompt(
    scenarios: list[dict],
    manual_description: str,
    number_of_test_cases: int,
) -> str:

    additional_instructions = (
        manual_description.strip()
        if manual_description.strip()
        else "No additional instructions provided."
    )

    scenario_blocks = []

    for scenario in scenarios:
        scenario_blocks.append(
            f"""
Scenario ID:
{scenario["id"]}

Scenario Code:
{scenario["scenario_code"]}

Module:
{scenario["module"]}

Scenario Title:
{scenario["title"]}

Scenario Description:
{scenario["description"]}
"""
        )

    scenarios_text = "\n".join(
        scenario_blocks
    )

    return f"""
You are a Senior QA Engineer and Test Case Design Specialist.

You are processing a batch of independent test scenarios.

Your task is to generate high-quality functional test cases
for EACH scenario in the batch.

Each scenario is an independent scope boundary.

The scenarios MUST NEVER be merged together.

Generate AT MOST {number_of_test_cases} meaningful test cases
for each scenario.

The requested number is a maximum, not a requirement to invent
additional test cases.

====================
SCENARIOS
====================

{scenarios_text}

====================
ADDITIONAL USER INSTRUCTIONS
====================

{additional_instructions}

These instructions provide additional guidance only.

They MUST NOT override, replace, merge, or contradict the
individual scenarios.

====================
TEST CASE DESIGN
====================

For each scenario:

1. Understand the scenario independently.

2. Generate executable functional test cases that verify the
   behavior explicitly described by that scenario.

3. Cover meaningful conditions or variations only when supported
   by the scenario.

Applicable coverage may include:

- Primary / happy path
- Alternate valid path
- Negative behavior
- Validation behavior
- Boundary behavior
- Error handling
- State-related behavior
- Authorization / access behavior
- Business rules

Do NOT force every coverage dimension.

Only use a dimension when the scenario provides enough information
to justify it.

====================
STRICT SCENARIO ISOLATION
====================

A test case generated for one scenario MUST belong only to that
scenario.

Do NOT generate test cases for:

- Another scenario
- Another requirement
- Related functionality
- Neighboring workflows
- Features merely because they are commonly associated
  with the scenario

Never move behavior from one scenario to another.

====================
NO INVENTED BEHAVIOR
====================

Do NOT invent:

- Business rules
- Validation rules
- Input limits
- Roles
- Permissions
- Error messages
- Integrations
- System states
- UI behavior
- API behavior
- Database behavior

unless supported by the specific scenario.

Do NOT assume undocumented behavior because it is common
in software applications.

If the scenario does not provide enough information to justify
a test case, do not invent the missing information.

====================
TEST CASE QUALITY
====================

Every test case must be:

- Functional
- Executable
- Clear
- Realistic
- Behaviorally meaningful
- Directly traceable to one scenario
- Internally consistent
- Distinct from the other test cases for that scenario

Do NOT create artificial variations by changing only:

- Names
- Email addresses
- Random numbers
- Text values
- Browsers
- Devices
- Other test data

unless the variation represents a genuinely different behavior
supported by the scenario.

If fewer than {number_of_test_cases} meaningful test cases can
be justified for a scenario, return fewer.

Never sacrifice quality to reach the requested count.

====================
TEST CASE STRUCTURE
====================

title:
Short and specific test objective.

priority:
Exactly one:

- High
- Medium
- Low

preconditions:
Only the system state genuinely required before execution.

test_data:
Only data genuinely required to execute the test.

steps:
A concise numbered sequence of executable actions.

expected_result:
A clear observable result directly caused by the steps.

The following relationship must remain logically consistent:

Preconditions
    ↓
Test Data
    ↓
Steps
    ↓
Expected Result

====================
OUTPUT RULES
====================

Return ONLY valid JSON.

Return a JSON array.

Each array element represents ONE source scenario.

Each element MUST contain:

- scenario_id
- scenario_code
- test_cases

Each test_cases element MUST contain:

- title
- priority
- preconditions
- test_data
- steps
- expected_result

Do NOT include:

- Module
- Scenario Code inside each test case
- Test Case Code
- Status

Status will be assigned by the application as Draft.

Return this structure:

[
  {{
    "scenario_id": 101,
    "scenario_code": "SCN-101",
    "test_cases": [
      {{
        "title": "Verify successful operation with valid data",
        "priority": "High",
        "preconditions": "The required valid system state exists.",
        "test_data": "Valid data required by the scenario.",
        "steps": "1. Open the relevant functionality.\\n2. Enter valid data.\\n3. Submit the operation.",
        "expected_result": "The operation completes successfully and the expected result is displayed."
      }}
    ]
  }}
]

====================
FINAL VALIDATION
====================

Before returning the JSON, internally verify every test case.

For each test case verify:

- Does it belong to exactly one provided scenario?
- Is the scenario ID correct?
- Is the scenario code correct?
- Does it test the exact selected scenario?
- Is it within the scenario scope?
- Is it genuinely executable?
- Are the steps logically consistent?
- Does the expected result match the steps?
- Is it behaviorally different from the other cases?
- Has undocumented functionality been avoided?
- Is it a test case rather than another scenario?

Also verify:

- Every provided scenario appears in the response.
- Scenarios are never merged.
- No test case is assigned to the wrong scenario.
- No artificial test cases were created merely to reach the requested count.
"""