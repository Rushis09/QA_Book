from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class TestCaseExporter(BaseExporter):
    """Excel exporter for Test Cases."""

    def generate(
        self,
        metadata: dict,
        test_cases: list[dict],
    ) -> BytesIO:
        """
        Generate Test Cases Excel document.
        """

        self.create_document(
            sheet_name=ExportConstants.TEST_CASES_SHEET,
            document_title=ExportConstants.TEST_CASES_DOCUMENT_TITLE,
        )

        self.set_column_widths(
            {
                "D": 20,   # Module
                "E": 12,   # Priority
                "F": 15,   # Status
                "G": 35,   # Title
                "H": 35,   # Preconditions
                "I": 40,   # Test Data
                "J": 60,   # Steps
                "K": 40,   # Expected Result
            }
        )

        self.add_project_information(metadata)

        self.add_test_case_table(test_cases)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_test_case_table(
        self,
        test_cases: list[dict],
    ):
        """Create the Test Cases table."""

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Test Case Code",
            "Requirement Code",
            "Scenario Code",
            "Module",
            "Priority",
            "Status",
            "Title",
            "Preconditions",
            "Test Data",
            "Steps",
            "Expected Result",
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
        for test_case in test_cases:

            values = [
                test_case.get("test_case_code", ""),
                test_case.get("requirement_code", ""),
                test_case.get("scenario_code", ""),
                test_case.get("module", ""),
                test_case.get("priority", ""),
                test_case.get("status", ""),
                test_case.get("title", ""),
                test_case.get("preconditions", ""),
                test_case.get("test_data", ""),
                test_case.get("steps", ""),
                test_case.get("expected_result", ""),
            ]

            for col, value in enumerate(values, start=1):

                cell = ws.cell(
                    row=row,
                    column=col,
                )

                cell.value = value
                cell.font = ExportStyles.NORMAL_FONT
                cell.border = ExportStyles.THIN_BORDER
                cell.alignment = ExportStyles.WRAP_ALIGNMENT

            ws.row_dimensions[row].height = 90

            row += 1

        data_end_row = row - 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:K{data_end_row}"
        )

        self.current_row = row