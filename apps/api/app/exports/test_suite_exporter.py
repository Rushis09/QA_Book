from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class TestSuiteExporter(BaseExporter):
    """Excel exporter for Test Suites."""

    def generate(
        self,
        metadata: dict,
        test_suites: list[dict],
    ) -> BytesIO:
        """
        Generate Test Suites Excel document.
        """

        self.create_document(
            sheet_name=ExportConstants.TEST_SUITES_SHEET,
            document_title=ExportConstants.TEST_SUITES_DOCUMENT_TITLE,
        )

        self.set_column_widths(
            {
                "A": 18,
                "B": 30,
                "C": 15,
                "D": 18,
                "E": 40,
                "F": 15,
            }
        )

        self.add_project_information(metadata)

        self.add_test_suite_table(test_suites)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_test_suite_table(
        self,
        test_suites: list[dict],
    ):
        """Create the Test Suite table."""

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Suite Code",
            "Suite Name",
            "Status",
            "Test Case Code",
            "Test Case Title",
            "Priority",
        ]

        # Header Row
        for col, header in enumerate(headers, start=1):

            cell = ws.cell(
                row=row,
                column=col,
            )

            cell.value = header
            cell.font = ExportStyles.TABLE_HEADER_FONT
            cell.fill = ExportStyles.TABLE_HEADER_FILL
            cell.border = ExportStyles.THIN_BORDER
            cell.alignment = ExportStyles.WRAP_ALIGNMENT

        row += 1

        # Data Rows
        for suite in test_suites:

            assigned_cases = suite.get(
                "test_cases",
                [],
            )

            if not assigned_cases:

                assigned_cases = [
                    {
                        "test_case_code": "-",
                        "title": "-",
                        "priority": "-",
                    }
                ]

            for test_case in assigned_cases:

                values = [
                    suite.get("suite_code", ""),
                    suite.get("name", ""),
                    suite.get("status", ""),
                    test_case.get(
                        "test_case_code",
                        "",
                    ),
                    test_case.get(
                        "title",
                        "",
                    ),
                    test_case.get(
                        "priority",
                        "",
                    ),
                ]

                for col, value in enumerate(
                    values,
                    start=1,
                ):

                    cell = ws.cell(
                        row=row,
                        column=col,
                    )

                    cell.value = value
                    cell.font = ExportStyles.NORMAL_FONT
                    cell.border = ExportStyles.THIN_BORDER
                    cell.alignment = (
                        ExportStyles.WRAP_ALIGNMENT
                    )

                ws.row_dimensions[row].height = 30

                row += 1

        data_end_row = row - 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:F{data_end_row}"
        )

        self.current_row = row