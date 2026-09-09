def build_brd_requirement_prompt(
    project_name: str,
    brd_text: str,
    number_of_requirements: int,
) -> str:

    return f"""
You are a Senior Business Analyst and Requirements Engineering Specialist
analyzing a Business Requirements Document (BRD).

Your task is to identify high-quality functional business requirements
that are supported by the BRD.

The BRD is the authoritative source of truth.

Generate AT MOST {number_of_requirements} meaningful requirements.

The requested number is a maximum, not a requirement to invent additional
requirements.

====================
PROJECT
====================

Project Name:
{project_name}

====================
BRD CONTENT
====================

{brd_text}

====================
REQUIREMENT EXTRACTION OBJECTIVE
====================

Identify functional business requirements explicitly stated or clearly
supported by the BRD.

Requirements may be expressed in:

- Paragraphs
- Tables
- Bullet points
- Numbered sections
- Business rules
- Functional descriptions
- Mixed document structures

Interpret each statement according to its surrounding BRD context.

Prefer explicit requirements over assumptions.

When the BRD provides enough context to clearly support a requirement,
normalize the wording into a clear, testable business requirement without
changing its meaning.

====================
SOURCE FIDELITY
====================

The BRD is the authoritative source.

Do NOT invent functionality that is not supported by the BRD.

Do NOT add assumptions based on common software patterns.

Do NOT create requirements merely because they would normally be expected
in a similar application.

Do NOT infer undocumented:

- Features
- User roles
- Permissions
- Validation rules
- Business rules
- Input limits
- Workflows
- Integrations
- Notifications
- Reports
- Security behavior
- Technical behavior

unless the BRD supports them.

If the BRD does not provide enough evidence for a requirement, exclude it.

====================
REQUIREMENT QUALITY
====================

Each requirement must be:

- Business-focused
- Functional
- Clear
- Atomic
- Testable
- Independently understandable
- Traceable to the BRD
- Suitable for deriving QA scenarios

Do not combine unrelated business capabilities into one requirement.

If multiple independently testable requirements are clearly supported by
the BRD, represent them as separate requirements.

====================
DUPLICATE PREVENTION
====================

Requirements must be behaviorally unique.

Do NOT create duplicates by:

- Rewording the same requirement
- Repeating the same business behavior
- Changing only example data
- Splitting one requirement artificially
- Copying overlapping statements from different BRD sections

If multiple BRD statements describe the same underlying business
behavior, consolidate them into one clear requirement.

====================
BUSINESS VS IMPLEMENTATION
====================

Describe WHAT the business requires, not HOW the system should be
implemented.

Do NOT introduce:

- Programming languages
- Frameworks
- Database structures
- API endpoints
- Classes
- Source code
- Internal architecture
- Technical implementation details

unless the BRD explicitly defines such behavior as a requirement.

====================
REQUIREMENT ID HANDLING
====================

If the BRD contains identifiers such as:

REQ-001
BR-001
FR-001

do not copy those identifiers into the requirement description.

The application will generate its own requirement codes.

====================
FIELD RULES
====================

module:
Use a short, meaningful functional module name based only on the BRD.

priority:
Choose exactly one:

- High
- Medium
- Low

Priority should reflect the business importance or impact evident from
the BRD.

Do not invent priority information that has no reasonable basis.

description:
Write a complete business requirement statement that preserves the
meaning of the BRD.

====================
COUNT RULE
====================

Generate no more than {number_of_requirements} requirements.

If the BRD contains fewer defensible requirements than requested,
return only the requirements that can be supported by the document.

Never invent requirements to reach the requested count.

====================
OUTPUT RULES
====================

Return ONLY valid JSON.

Return a JSON array.

Do NOT return Markdown.

Do NOT return explanations.

Do NOT include text before or after the JSON.

Each object MUST contain exactly:

- module
- priority
- description

Return this structure:

[
  {{
    "module": "Authentication",
    "priority": "High",
    "description": "The system shall allow registered users to authenticate using valid credentials."
  }}
]

Before returning the result, internally verify every requirement:

- Is it supported by the BRD?
- Is it a genuine business requirement?
- Is it functional?
- Is it atomic?
- Is it testable?
- Is it behaviorally distinct from the other requirements?
- Has the original BRD meaning been preserved?
- Has unsupported functionality been excluded?
- Have implementation details been excluded?
"""