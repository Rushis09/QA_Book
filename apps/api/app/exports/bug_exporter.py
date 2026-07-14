from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class BugExporter(BaseExporter):
    """Excel exporter for Bugs."""

    def generate(
        self,
        metadata: dict,
        bugs: list[dict],
    ) -> BytesIO:

        self.create_document(
            sheet_name=ExportConstants.BUGS_SHEET,
            document_title=ExportConstants.BUGS_DOCUMENT_TITLE,
        )

        self.set_column_widths(
            {
                "A": 18,
                "B": 18,
                "C": 18,
                "D": 18,
                "E": 18,
                "F": 18,
                "G": 20,
                "H": 30,
                "I": 40,
                "J": 40,
                "K": 40,
                "L": 40,
            }
        )

        self.add_project_information(metadata)

        self.add_bug_table(bugs)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_bug_table(
        self,
        bugs: list[dict],
    ):

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Bug Code",
            "Test Run",
            "Test Case",
            "Title",
            "Severity",
            "Priority",
            "Status",
            "Assigned To",
            "Reported By",
            "Environment",
            "Description",
            "Steps To Reproduce",
            "Actual Result",
        ]

        # Header
        for col, header in enumerate(
            headers,
            start=1,
        ):

            cell = ws.cell(
                row=row,
                column=col,
            )

            cell.value = header
            cell.font = ExportStyles.TABLE_HEADER_FONT
            cell.fill = ExportStyles.TABLE_HEADER_FILL
            cell.border = ExportStyles.THIN_BORDER
            cell.alignment = (
                ExportStyles.WRAP_ALIGNMENT
            )

        row += 1

        # Data
        for bug in bugs:

            values = [
                bug.get("bug_code", ""),
                bug.get("run_code", ""),
                bug.get("test_case_code", ""),
                bug.get("title", ""),
                bug.get("severity", ""),
                bug.get("priority", ""),
                bug.get("status", ""),
                bug.get("assigned_to", ""),
                bug.get("reported_by", ""),
                bug.get("environment", ""),
                bug.get("description", ""),
                bug.get("steps_to_reproduce", ""),
                bug.get("actual_result", ""),
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

            ws.row_dimensions[row].height = 35

            row += 1

        data_end_row = row - 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:M{data_end_row}"
        )

        self.current_row = row