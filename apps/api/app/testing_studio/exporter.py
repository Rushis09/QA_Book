from io import BytesIO

from app.exports.test_case_exporter import TestCaseExporter


class TestingStudioExporter:
    """
    Excel exporter for Testing Studio.

    Uses the canonical TestCaseExporter so that normal Test Case
    exports and Testing Studio exports always have the same
    structure and data representation.
    """

    def generate(
        self,
        project,
        cases: list[dict],
        testing_type: str | None,
    ) -> BytesIO:
        """
        Generate Testing Studio Excel document.

        If testing_type is provided, only that testing type is
        exported. Otherwise, all testing types are exported.
        """

        export_cases = cases

        if testing_type:
            export_cases = [
                case
                for case in cases
                if (
                    (case.get("profile") or {}).get("testing_type")
                    == testing_type
                )
            ]

        exporter = TestCaseExporter()

        metadata = {
            "project_name": project.name,
        }

        return exporter.generate(
            metadata=metadata,
            test_cases=export_cases,
        )