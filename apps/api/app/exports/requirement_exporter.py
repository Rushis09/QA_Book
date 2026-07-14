from io import BytesIO

from openpyxl import Workbook

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class RequirementExporter(BaseExporter):
    """Excel exporter for Requirements."""

    def generate(
        self,
        metadata: dict,
        requirements: list[dict],
    ) -> BytesIO:
        """
        Generate Requirements Excel document.
        """

        self.create_document(
            sheet_name=ExportConstants.REQUIREMENTS_SHEET,
            document_title=ExportConstants.REQUIREMENTS_DOCUMENT_TITLE,
        )

        self.add_project_information(metadata)

        self.add_requirement_table(requirements)

        output = BytesIO()
        self.workbook.save(output)
        output.seek(0)

        return output

    def add_requirement_table(
        self,
        requirements: list[dict],
    ):
        """Create the Requirements table."""

        ws = self.worksheet
        row = self.current_row

        headers = [
            "Requirement Code",
            "Module",
            "Priority",
            "Status",
            "Description",
        ]

        # Header Row
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=row, column=col)

            cell.value = header
            cell.font = ExportStyles.TABLE_HEADER_FONT
            cell.fill = ExportStyles.TABLE_HEADER_FILL
            cell.border = ExportStyles.THIN_BORDER
            cell.alignment = ExportStyles.WRAP_ALIGNMENT
            

        row += 1

        # Data Rows
        for requirement in requirements:

            values = [
                requirement.get("requirement_code", ""),
                requirement.get("module", ""),
                requirement.get("priority", ""),
                requirement.get("status", ""),
                requirement.get("description", ""),
            ]

            for col, value in enumerate(values, start=1):

                cell = ws.cell(row=row, column=col)

                cell.value = value
                cell.font = ExportStyles.NORMAL_FONT
                cell.border = ExportStyles.THIN_BORDER
                cell.alignment = ExportStyles.WRAP_ALIGNMENT
                ws.row_dimensions[row].height = 30

            row += 1

            data_end_row = row - 1

            ws.auto_filter.ref = f"A{self.current_row}:E{data_end_row}"  
            self.current_row = row