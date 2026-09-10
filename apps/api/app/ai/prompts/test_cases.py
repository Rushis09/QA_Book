"""
QABook — AI Test Case Design Prompts

Purpose
-------
Production-grade prompt builders for QABook's unified Test Case generator.

Design principles
-----------------
1. Requirement/Scenario is the source-of-truth scope boundary.
2. Testing type determines the test-design discipline.
3. Execution method is separate from testing type.
4. Unknown project-specific facts must never be fabricated.
5. Requested count is a maximum, never a quota.
6. Cases must be behaviorally distinct and traceable.
7. Common TestCase fields remain backward compatible.
8. Type-specific definition belongs in meta_attributes.
9. Output must be strict JSON suitable for application validation.
10. The model must perform internal quality checks before returning output.

Supported testing types:
    FUNCTIONAL
    API
    DATABASE
    PERFORMANCE
    SECURITY
    ACCESSIBILITY
    AUTOMATION (legacy compatibility only)

Supported execution methods:
    MANUAL
    AUTOMATED
    EXTERNAL
    IMPORTED
"""

from app.testing_studio.constants import ExecutionMethod, TestingType


def _type_guidance(testing_type: TestingType) -> str:
    """Return discipline-specific test-design rules and schema guidance."""

    guidance = {
        TestingType.FUNCTIONAL: """
TESTING DISCIPLINE: FUNCTIONAL

Objective:
Verify the business/system behavior explicitly represented by the selected
scenario from a functional tester's perspective.

Apply only the design techniques justified by the available scenario/context:
- happy path / primary behavior
- alternate valid flow
- negative behavior
- equivalence partitioning
- boundary-value analysis
- validation/error handling
- state transition
- business-rule verification
- role/permission behavior
- recovery/state-related behavior

Do not force every technique into every scenario.

Definition requirements:
- steps: array of objects
- each step object:
  - step_no: positive integer
  - action: executable tester action
  - test_data: data used by that step, or ""
  - expected_result: observable result for that step, or ""

Functional rules:
- Each case must represent one distinct test objective.
- Steps must be executable without hidden actions.
- Expected results must be observable and attributable to the preceding action.
- Do not invent UI controls, labels, messages, validation rules, limits,
  roles, permissions, or workflows.
""",

        TestingType.API: """
TESTING DISCIPLINE: API

Objective:
Verify an API behavior explicitly supported by the selected scenario/context.

Design API tests using the contract information actually available. Consider,
when applicable and supported:
- HTTP method and endpoint
- path parameters
- query parameters
- headers
- authentication/authorization
- request body
- required/optional fields
- data types and contract/schema expectations
- success response
- relevant negative/error response
- boundary behavior
- idempotency where explicitly relevant
- response body assertions
- response headers where explicitly relevant

Do not generate API cases merely because the product probably has an API.

Definition requirements:
- endpoint_url: known endpoint, otherwise "NEEDS_INPUT"
- http_method: known HTTP method, otherwise "NEEDS_INPUT"
- headers: object
- path_parameters: object
- query_parameters: object
- request_body: object, array, string, or null
- expected_status_code: integer or null
- expected_response: object, array, string, or null
- authentication: known description, otherwise "NEEDS_INPUT"

API rules:
- Never invent endpoint paths, HTTP methods, status codes, response fields,
  authentication mechanisms, schemas, headers, or payload contracts.
- A realistic-looking invented API is still an invalid test case.
- If the scenario supports API testing but contract details are unavailable,
  preserve the test objective and mark unknown facts as "NEEDS_INPUT".
""",

        TestingType.DATABASE: """
TESTING DISCIPLINE: DATABASE

Objective:
Verify persistence/data behavior explicitly supported by the selected
scenario/context.

Consider, when justified:
- record creation
- record update
- record deletion
- persisted field values
- data relationships
- constraints
- transaction/state effects
- data consistency after the triggering action

Definition requirements:
- target_database: known database, otherwise "NEEDS_INPUT"
- schema_name: known schema, otherwise ""
- table_name: known table, otherwise "NEEDS_INPUT"
- prerequisite_action: action that causes the data change, otherwise ""
- verification_sql: SQL only when justified; otherwise "NEEDS_INPUT"
- expected_columns: array of objects with:
  - column
  - expected_value

Database rules:
- Never invent database names, schemas, tables, columns, relationships,
  constraints, or SQL.
- Do not assume the UI action persists data unless the available context
  supports that relationship.
- SQL must be consistent with the stated target/schema/table.
- Expected database state must directly correspond to the scenario behavior.
""",

        TestingType.PERFORMANCE: """
TESTING DISCIPLINE: PERFORMANCE

Objective:
Verify performance/load behavior explicitly supported by the selected
scenario/context.

Select the appropriate performance model only when justified:
- load
- stress
- spike
- endurance/soak
- volume
- scalability

Consider, when supported:
- concurrency / virtual users
- arrival rate
- ramp-up
- steady-state duration
- workload mix
- target operation/endpoint
- response-time thresholds
- percentile latency
- throughput
- error rate
- resource utilization
- SLA/SLO/SLO-like thresholds supplied by the source context

Definition requirements:
- tool: known tool, otherwise "NEEDS_INPUT"
- virtual_users: integer, 0 when not specified
- ramp_up_seconds: integer, 0 when not specified
- duration_seconds: integer, 0 when not specified
- target_endpoint: known target, otherwise "NEEDS_INPUT"
- workload_description: concise workload
- sla_benchmarks: object containing ONLY explicitly supported thresholds

Performance rules:
- Never invent an SLA, SLO, response-time threshold, capacity target,
  concurrency target, tool, endpoint, workload limit, or infrastructure capacity.
- Do not manufacture numbers simply to make the case look complete.
- If a threshold is absent, do not create one.
""",

        TestingType.SECURITY: """
TESTING DISCIPLINE: SECURITY

Objective:
Verify a security behavior/control explicitly supported by the selected
scenario/context.

Consider only security objectives justified by the source context, such as:
- authentication
- authorization/access control
- input handling
- injection resistance
- session behavior
- sensitive-data protection
- security configuration/control behavior

Definition requirements:
- vulnerability_category: known category, otherwise "NEEDS_INPUT"
- target_vector: known target/component/vector, otherwise "NEEDS_INPUT"
- attack_payload: safe representative payload, otherwise "NEEDS_INPUT"
- expected_defensive_behavior: observable protection expected
- severity: known severity, otherwise "NEEDS_INPUT"
- cwe: known CWE identifier, otherwise null
- cve: known CVE identifier, otherwise null

Security rules:
- Do not invent a vulnerability, weakness, threat model, security
  architecture, CWE, CVE, severity, or affected component.
- Use safe representative test inputs only.
- The expected result must describe the defensive behavior, not merely
  that an attack was attempted.
- Do not turn a normal functional scenario into a security test unless
  the scenario/context supports a security objective.
""",

        TestingType.ACCESSIBILITY: """
TESTING DISCIPLINE: ACCESSIBILITY

Objective:
Verify an accessibility behavior explicitly supported by the selected
scenario/context.

Consider, when applicable:
- keyboard access
- focus order/visibility
- accessible names, labels, roles and values
- alternative text
- contrast
- semantic structure
- assistive-technology interaction
- accessible error/feedback behavior

Definition requirements:
- wcag_clause: known clause, otherwise "NEEDS_INPUT"
- assistive_technology: known technology, otherwise "NEEDS_INPUT"
- audit_flags: object with:
  - alt_text: boolean
  - contrast_ratio: boolean
  - tab_order: boolean
  - keyboard_access: boolean
  - labels: boolean
- page_component: known component, otherwise "NEEDS_INPUT"
- expected_behavior: observable accessible outcome

Accessibility rules:
- Do not invent a specific WCAG violation, page/component, assistive
  technology behavior, or accessibility defect.
- Do not mark an audit flag true unless the scenario/context supports
  that check.
- Expected behavior must be observable by the intended user/assistive
  technology interaction.
""",

        TestingType.AUTOMATION: """
TESTING DISCIPLINE: AUTOMATION — LEGACY COMPATIBILITY ONLY

Automation is normally an execution method in QABook, not a testing
discipline. This type exists only for compatibility with older clients.

Definition requirements:
- framework: known framework, otherwise "NEEDS_INPUT"
- script_identifier: known identifier, otherwise "NEEDS_INPUT"
- repository: known repository, otherwise ""
- branch: known branch, otherwise ""
- result_source: known source, otherwise ""
- result_format: known format, otherwise ""

Never invent repository URLs, branches, script names, framework versions,
or automation identifiers.
""",
    }

    return guidance[testing_type]


def _common_design_rules() -> str:
    return """
CORE TEST DESIGN RULES

A. SOURCE OF TRUTH AND TRACEABILITY
- The supplied scenario is the authoritative scope boundary.
- Every case must test behavior represented by that scenario.
- A test case is not a new requirement or a new scenario.
- Never merge behavior from multiple scenarios.
- Do not infer unrelated product capabilities from the module name.

B. TEST OBJECTIVE
- Every case must have one clear primary objective.
- Two cases are distinct only when their expected behavior, condition,
  state, risk, or verification objective is materially different.
- Do not create duplicates by changing only names, emails, numbers,
  browsers, devices, timestamps, or other superficial data.

C. COVERAGE
Select the strongest meaningful coverage supported by the source:
- primary/happy path
- alternate valid behavior
- negative behavior
- boundary/partition
- validation/error handling
- state transition
- authorization/access
- persistence/data integrity
- relevant integration behavior
- discipline-specific risk

Do not force coverage categories when the source does not justify them.

D. NO FABRICATION
Never invent:
- business rules
- validation rules
- limits
- roles
- permissions
- error messages
- UI controls
- API contracts
- database schema
- performance thresholds
- security architecture
- accessibility implementation
- automation repositories/scripts

When the type contract permits an unknown value, use "NEEDS_INPUT".
Otherwise use null or "" according to the field contract.

E. TEST DATA
- Include only data needed to execute the case.
- Data must be consistent with the scenario.
- Do not create artificial cases by changing irrelevant values.

F. EXECUTABILITY
A tester should be able to understand what to do, what data to use,
and what observable evidence determines pass/fail.

G. CONSISTENCY
The following must form one coherent chain:

Preconditions
    ↓
Test Data
    ↓
Steps / Type Definition
    ↓
Expected Result

The expected result must be observable and caused by the actions or
verification performed.

H. PRIORITY
Use exactly one:
- High
- Medium
- Low

Choose based on business/risk significance supported by the scenario.
Do not make every case High.

I. COUNT
The requested count is a MAXIMUM.
Return fewer cases when the source does not justify more distinct cases.
Never invent cases merely to reach the requested number.

J. EXECUTION METHOD
Default to MANUAL unless the supplied context explicitly requires:
- AUTOMATED
- EXTERNAL
- IMPORTED

Do not use execution method to change the testing discipline.

K. BACKWARD COMPATIBILITY
Common fields must remain usable by the existing QABook TestCase model:
- title
- priority
- description
- preconditions
- test_data
- steps
- expected_result

Type-specific structured data belongs in meta_attributes.
"""


def _output_contract(testing_type: TestingType) -> str:
    return f"""
OUTPUT CONTRACT

Return ONLY valid JSON.
Do not return Markdown.
Do not return explanations.
Do not return comments.
Do not wrap JSON in code fences.

Return a JSON array.

Each generated object MUST contain exactly these keys:

- testing_type
- execution_method
- title
- priority
- description
- preconditions
- test_data
- steps
- expected_result
- meta_attributes

testing_type MUST be exactly "{testing_type.value}".

execution_method MUST normally be "{ExecutionMethod.MANUAL.value}" unless
the supplied context explicitly requires another supported method.

Common fields and meta_attributes MUST describe the same test case.


Compatibility:
- `steps` is a concise numbered string for the existing TestCase model.
- `test_data` is a concise execution-data string.
- `meta_attributes` is the structured, type-specific definition.
- `meta_attributes` MUST satisfy the definition requirements for the selected
  testing type above.
- For FUNCTIONAL testing, `meta_attributes.steps` MUST be an array of objects.
- Each Functional `meta_attributes.steps` object MUST contain:
  - `step_no`: positive integer
  - `action`: executable tester action
  - `test_data`: data used by that step, or ""
  - `expected_result`: observable result of that step, or ""
- The top-level `steps` string and `meta_attributes.steps` array MUST describe
  the same execution flow.
- For API, DATABASE, PERFORMANCE, SECURITY, and ACCESSIBILITY testing,
  `meta_attributes` MUST contain all required fields defined in the selected
  testing discipline above, using `NEEDS_INPUT`, null, or "" exactly as
  specified when source information is unavailable.

Do not include:
- test_case_code
- scenario_code
- scenario_id
- module
- status
- created_at
- updated_at

The application assigns identifiers, traceability fields and lifecycle state.
"""


def build_test_case_prompt(
    scenario_code: str,
    module: str,
    scenario_title: str,
    scenario_description: str,
    manual_description: str,
    number_of_test_cases: int,
    testing_type: TestingType = TestingType.FUNCTIONAL,
) -> str:
    """
    Build a single-scenario, type-aware test-case generation prompt.

    The prompt deliberately keeps the scenario as the scope boundary and
    uses a discipline-specific design contract.
    """

    additional_instructions = (
        manual_description.strip()
        if manual_description and manual_description.strip()
        else "No additional instructions provided."
    )

    return f"""
You are QABook's Senior QA Test Design Engine.

You are designing executable software test cases for professional QA teams.
Your output will be consumed by QABook and reviewed by a human tester before
the cases become official test assets.

{_common_design_rules()}

SELECTED TESTING TYPE
=====================
{testing_type.value}

{_type_guidance(testing_type)}

SELECTED SCENARIO
=================
Scenario Code: {scenario_code}
Module: {module}
Scenario Title: {scenario_title}
Scenario Description: {scenario_description}

ADDITIONAL USER INSTRUCTIONS
============================
{additional_instructions}

User instructions are secondary guidance. They may refine the requested
coverage, but they MUST NOT override the selected scenario, introduce
unsupported facts, or cause unrelated behavior to be tested.

GENERATION TARGET
=================
Generate AT MOST {number_of_test_cases} meaningful test cases.

Before creating a case, internally determine:
1. What exact behavior does the scenario establish?
2. What test objective would this case verify?
3. Is this objective materially different from other cases?
4. Which testing-design technique is justified?
5. Which facts are known versus unknown?
6. What observable evidence determines pass/fail?

If the scenario cannot justify a type-specific case, do not fabricate one.
For a type-specific field that is genuinely required but unavailable,
use "NEEDS_INPUT" according to the type contract.

FINAL INTERNAL QUALITY GATE
===========================
Before returning each case, verify:
- It is traceable to exactly this scenario.
- It uses the requested testing type.
- It has one clear test objective.
- It is behaviorally distinct.
- It is executable.
- Preconditions are genuinely necessary.
- Test data is sufficient and relevant.
- Steps are logically ordered.
- Type-specific metadata is internally consistent.
- Expected result is observable and follows from the test.
- No unsupported project-specific fact was invented.
- No duplicate or superficial variation was created.
- Priority is justified.
- Common fields and meta_attributes describe the same test.

{_output_contract(testing_type)}

Return the JSON array now.
"""


def build_bulk_test_case_prompt(
    scenarios: list[dict],
    manual_description: str,
    number_of_test_cases: int,
    testing_type: TestingType = TestingType.FUNCTIONAL,
) -> str:
    """
    Build a batch prompt for independent scenarios.

    Each scenario remains an independent traceability boundary.
    """

    additional_instructions = (
        manual_description.strip()
        if manual_description and manual_description.strip()
        else "No additional instructions provided."
    )

    scenario_blocks = []

    for scenario in scenarios:
        scenario_blocks.append(
            f"""
Scenario ID: {scenario["id"]}
Scenario Code: {scenario["scenario_code"]}
Module: {scenario["module"]}
Scenario Title: {scenario["title"]}
Scenario Description: {scenario["description"]}
"""
        )

    scenarios_text = "\n".join(scenario_blocks)

    return f"""
You are QABook's Senior QA Test Design Engine.

You are processing multiple independent test scenarios for professional
software QA. Every generated test case must remain traceable to exactly one
source scenario.

TESTING TYPE
============
{testing_type.value}

{_common_design_rules()}

{_type_guidance(testing_type)}

SCENARIOS
=========
{scenarios_text}

ADDITIONAL USER INSTRUCTIONS
============================
{additional_instructions}

The instructions may refine coverage but MUST NOT merge scenarios or
introduce unsupported behavior.

GENERATION TARGET
=================
Generate AT MOST {number_of_test_cases} meaningful test cases PER scenario.

SCENARIO ISOLATION
==================
- Treat each supplied scenario as an independent scope boundary.
- Every response group must use the exact supplied scenario_id and
  scenario_code.
- Never transfer behavior from one scenario to another.
- Never invent scenario IDs or codes.
- Every supplied scenario must appear in the response, even if its
  test_cases array is empty because the available information does not
  justify a valid case.

NO FABRICATION
==============
Never invent project-specific:
- API endpoints/contracts
- database schemas/tables/columns/SQL
- performance thresholds/capacity
- security architecture/vulnerabilities/CWE/CVE
- accessibility implementation/WCAG failure
- automation repositories/scripts

Use "NEEDS_INPUT" where the type contract permits an unknown value.

FINAL INTERNAL QUALITY GATE
===========================
For every generated case verify:
- exact scenario ownership
- exact scenario ID/code
- requested testing type
- clear independent objective
- executable design
- appropriate coverage technique
- logical preconditions/data/steps/results
- type-specific metadata consistency
- no fabricated project facts
- no duplicate/superficial variation

OUTPUT CONTRACT
===============
Return ONLY valid JSON.
No Markdown.
No explanations.
No code fences.

Return a JSON array.

Each array element MUST contain exactly:
- scenario_id
- scenario_code
- test_cases

Each test_cases element MUST contain exactly:
- testing_type
- execution_method
- title
- priority
- description
- preconditions
- test_data
- steps
- expected_result
- meta_attributes

testing_type MUST be "{testing_type.value}".
execution_method MUST normally be "{ExecutionMethod.MANUAL.value}".

Do not include test-case IDs, status, timestamps, module, or extra fields.
The application supplies lifecycle and identity fields.

Return the JSON array now.
"""
