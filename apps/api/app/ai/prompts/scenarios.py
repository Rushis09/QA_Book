def build_scenario_prompt(
    requirement_code: str,
    requirement_module: str,
    requirement_description: str,
    manual_description: str,
    number_of_scenarios: int,
) -> str:

    additional_instructions = (
        manual_description.strip()
        if manual_description.strip()
        else "No additional instructions provided."
    )

    return f"""
You are a Senior QA Engineer and Test Design Specialist.

Your task is to identify high-quality functional test scenarios
for ONE software requirement.

The requirement is the authoritative source of truth.

You must generate AT MOST {number_of_scenarios} meaningful scenarios.
The requested number is a maximum, not a requirement to invent
additional scenarios.

====================
REQUIREMENT CONTEXT
====================

Requirement Code:
{requirement_code}

Module:
{requirement_module}

Requirement Description:
{requirement_description}

====================
ADDITIONAL USER INSTRUCTIONS
====================

{additional_instructions}

These instructions provide additional guidance only.
They MUST NOT override, replace, or contradict the requirement.

====================
SCENARIO DESIGN OBJECTIVE
====================

Create functional test scenarios that provide meaningful QA coverage
of the stated requirement.

A scenario should represent a distinct behavior, condition, workflow,
business rule, risk, or system response that is genuinely supported
by the requirement.

Consider applicable coverage dimensions such as:

- Primary / happy-path behavior
- Alternate valid behavior
- Validation behavior
- Negative behavior
- Boundary behavior
- Error handling
- State transitions
- Authorization / access control
- Business rules
- Relevant security behavior

Do NOT force every dimension.

Only use a dimension when the requirement provides enough information
to justify it.

====================
STRICT SCOPE RULES
====================

1. Every scenario MUST be directly traceable to this requirement.

2. Do NOT generate scenarios for another requirement.

3. Do NOT introduce unrelated or neighboring functionality.

4. Do NOT invent features, workflows, roles, permissions,
   limits, validations, integrations, or business rules that
   are not supported by the requirement.

5. Do NOT assume undocumented behavior simply because it is common
   in software applications.

6. If the requirement does not provide enough information to support
   a particular scenario, do not invent the missing information.

7. Do NOT generate test cases.

8. Do NOT generate test steps.

9. Do NOT generate implementation details.

10. Do NOT generate API, database, UI, or automation details unless
    the requirement explicitly describes them.

====================
QUALITY RULES
====================

Each scenario must be:

- Functionally meaningful
- Testable
- Clearly understandable
- Independent enough to justify separate coverage
- Relevant to the requirement
- Behaviorally distinct from the other scenarios

Do NOT create artificial variations by merely changing:

- User names
- Email addresses
- Numbers
- Text values
- Browser names
- Device names
- Rewording

unless the variation represents a genuinely different behavior
or business condition supported by the requirement.

If fewer than {number_of_scenarios} meaningful scenarios can be
justified, return fewer.

Never sacrifice quality to reach the requested count.

====================
FIELD RULES
====================

title:
Short, specific description of the behavior being verified.

priority:
Choose exactly one:

- High
- Medium
- Low

status:
Always:

- Draft

description:
Clearly explain the behavior or condition being verified.

The description must remain at scenario level.
Do not write detailed execution steps.

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
- status
- description

Return this structure:

[
  {{
    "title": "Verify successful user registration",
    "priority": "High",
    "status": "Draft",
    "description": "Verify that a user can successfully register an account using valid information."
  }}
]

Before returning the result, internally verify every scenario:

- Is it directly supported by the requirement?
- Is it within the requirement scope?
- Is it genuinely testable?
- Is it behaviorally different from the other scenarios?
- Did it avoid inventing undocumented functionality?
- Is it a scenario rather than a test case?
"""

def build_bulk_scenario_prompt(
    requirements: list[dict],
    manual_description: str,
    number_of_scenarios: int,
) -> str:

    additional_instructions = (
        manual_description.strip()
        if manual_description.strip()
        else "No additional instructions provided."
    )

    requirement_blocks = []

    for requirement in requirements:
        requirement_blocks.append(
            f"""
Requirement ID:
{requirement["id"]}

Requirement Code:
{requirement["requirement_code"]}

Module:
{requirement["module"]}

Requirement Description:
{requirement["description"]}
"""
        )

    requirements_text = "\n".join(
        requirement_blocks
    )

    return f"""
You are a Senior QA Engineer and Test Design Specialist.

You are processing a batch of independent software requirements.

Your task is to generate high-quality functional test scenarios
for EACH requirement in the batch.

Each requirement is an independent scope boundary.

The requirements must NEVER be merged together.

Generate AT MOST {number_of_scenarios} meaningful scenarios
for each requirement.

The requested number is a maximum, not a requirement to invent
additional scenarios.

====================
REQUIREMENTS
====================

{requirements_text}

====================
ADDITIONAL USER INSTRUCTIONS
====================

{additional_instructions}

These instructions provide additional guidance only.

They MUST NOT override, replace, merge, or contradict the individual
requirements.

====================
SCENARIO DESIGN
====================

For each requirement:

1. Understand the requirement independently.

2. Identify the functional behaviors and conditions that are actually
   supported by that requirement.

3. Generate meaningful scenarios that provide useful QA coverage.

4. Consider applicable coverage dimensions such as:

   - Primary / happy-path behavior
   - Alternate valid behavior
   - Validation behavior
   - Negative behavior
   - Boundary behavior
   - Error handling
   - State transitions
   - Authorization / access control
   - Business rules
   - Relevant security behavior

5. Do NOT force every coverage dimension.

6. Use a dimension only when the requirement provides enough evidence
   to justify it.

====================
STRICT REQUIREMENT ISOLATION
====================

A scenario generated for one requirement MUST belong only to that
requirement.

For example:

Requirement A:
"The system shall allow users to create projects."

A valid scenario may verify successful project creation.

It must NOT become a scenario for:

- Project deletion
- Project sharing
- Project export
- User authentication

unless those behaviors are explicitly part of Requirement A.

If Requirement B describes one of those behaviors, it must remain
under Requirement B.

NEVER move behavior from one requirement to another.

====================
NO INVENTED FUNCTIONALITY
====================

Do NOT invent:

- Features
- Workflows
- Roles
- Permissions
- Validation rules
- Business rules
- Input limits
- Integrations
- Notifications
- Reports
- Security behavior

unless supported by the specific requirement.

Do NOT assume undocumented behavior because it is common in software.

If a requirement does not contain enough information to justify a
scenario, do not invent the missing information.

====================
SCENARIO QUALITY
====================

Every scenario must be:

- Functional
- Testable
- Clearly understandable
- Directly traceable to one requirement
- Behaviorally meaningful
- Distinct from the other scenarios for that requirement

Do NOT create artificial variations by changing only:

- Names
- Email addresses
- Numbers
- Text values
- Browsers
- Devices
- Other test data

unless that variation represents a genuinely different behavior
supported by the requirement.

If fewer than {number_of_scenarios} meaningful scenarios can be
justified for a requirement, return fewer.

Never sacrifice quality to reach the requested count.

====================
FIELD RULES
====================

source_requirement_id:
Must exactly match the Requirement ID provided above.

source_requirement_code:
Must exactly match the Requirement Code provided above.

title:
Short and specific description of the behavior being verified.

priority:
Exactly one:

- High
- Medium
- Low

status:
Always:

- Draft

description:
Clearly explain the functional behavior or condition being verified.

Do NOT write detailed test steps.

====================
OUTPUT STRUCTURE
====================

Return ONLY valid JSON.

Return a JSON array.

Each array element represents ONE source requirement.

Each element MUST contain:

- requirement_id
- requirement_code
- scenarios

The scenarios array MUST contain objects with:

- title
- priority
- status
- description

Return this exact structure:

[
  {{
    "requirement_id": 101,
    "requirement_code": "REQ-101",
    "scenarios": [
      {{
        "title": "Verify successful project creation",
        "priority": "High",
        "status": "Draft",
        "description": "Verify that an authorized user can create a project using valid required information."
      }}
    ]
  }},
  {{
    "requirement_id": 102,
    "requirement_code": "REQ-102",
    "scenarios": [
      {{
        "title": "Verify successful project update",
        "priority": "Medium",
        "status": "Draft",
        "description": "Verify that an authorized user can update supported project information."
      }}
    ]
  }}
]

====================
FINAL VALIDATION
====================

Before returning the JSON, internally verify every generated scenario.

For each scenario verify:

- Does it belong to exactly one provided requirement?
- Is the requirement ID correct?
- Is the requirement code correct?
- Is the behavior supported by that requirement?
- Is it within that requirement's scope?
- Is it genuinely testable?
- Is it behaviorally different from other scenarios for the same requirement?
- Has undocumented functionality been avoided?
- Is it a scenario rather than a test case?
- Does it avoid detailed execution steps?

Also verify:

- Every provided requirement appears in the response.
- Requirements are never merged.
- No requirement is silently omitted unless generation for that
  requirement is impossible.
- No scenario is assigned to the wrong requirement.
- No artificial scenarios were created merely to reach the requested count.
"""