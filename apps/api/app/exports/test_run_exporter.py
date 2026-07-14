from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class TestRunExporter(BaseExporter):
    """Excel exporter for Test Runs."""

    def generate(
        self,
        metadata: dict,
        test_runs: list[dict],
    ) -> BytesIO:

        self.create_document(
            sheet_name=ExportConstants.TEST_RUNS_SHEET,
            document_title=ExportConstants.TEST_RUNS_DOCUMENT_TITLE,
        )

        self.set_column_widths(
            {
                "A": 18,
                "B": 18,
                "C": 30,
                "D": 30,
                "E": 18,
                "F": 20,
                "G": 20,
                "H": 22,
                "I": 22,
                "J": 18,
            }
        )

        self.add_project_information(metadata)

        self.add_test_run_table(test_runs)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_test_run_table(
        self,
        test_runs: list[dict],
    ):

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Run Code",
            "Suite Code",
            "Suite Name",
            "Run Name",
            "Build Version",
            "Environment",
            "Tester",
            "Start Date",
            "End Date",
            "Status",
        ]

        # Header
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

        # Data
        for test_run in test_runs:

            values = [
                test_run.get("run_code", ""),
                test_run.get("suite_code", ""),
                test_run.get("suite_name", ""),
                test_run.get("name", ""),
                test_run.get("build_version", ""),
                test_run.get("environment", ""),
                test_run.get("tester", ""),
                test_run.get("start_date", ""),
                test_run.get("end_date", ""),
                test_run.get("status", ""),
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

            ws.row_dimensions[row].height = 28

            row += 1

        data_end_row = row - 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:J{data_end_row}"
        )

        self.current_row = row