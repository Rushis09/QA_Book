from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class ScenarioExporter(BaseExporter):
    """Excel exporter for Test Scenarios."""

    def generate(
        self,
        metadata: dict,
        scenarios: list[dict],
    ) -> BytesIO:
        """
        Generate Test Scenario Excel document.
        """

        self.create_document(
            sheet_name="Test Scenarios",
            document_title="Test Scenario Document",
        )

        self.add_project_information(metadata)

        self.add_scenario_table(scenarios)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_scenario_table(
        self,
        scenarios: list[dict],
    ):
        """Create the Test Scenario table."""

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Scenario Code",
            "Requirement Code",
            "Module",
            "Title",
            "Description",
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
        for scenario in scenarios:

            values = [
                scenario.get("scenario_code", ""),
                scenario.get("requirement_code", ""),
                scenario.get("module", ""),
                scenario.get("title", ""),
                scenario.get("description", ""),
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

            ws.row_dimensions[row].height = 30

            row += 1

        data_end_row = row - 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:E{data_end_row}"
        )

        self.current_row = row