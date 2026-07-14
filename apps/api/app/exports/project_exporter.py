from io import BytesIO

from app.exports.base_exporter import BaseExporter
from app.exports.constants import ExportConstants
from app.exports.styles import ExportStyles


class ProjectExporter(BaseExporter):
    """Excel exporter for Project Summary."""

    def generate(
        self,
        metadata: dict,
        project: dict,
    ) -> BytesIO:

        self.create_document(
            sheet_name="Project Summary",
            document_title="Project Summary",
        )

        self.add_project_information(metadata)

        self.add_project_table(project)

        output = BytesIO()

        self.workbook.save(output)

        output.seek(0)

        return output

    def add_project_table(
        self,
        project: dict,
    ):
        ws = self.worksheet
        row = self.current_row

        headers = [
            "Field",
            "Value",
        ]

        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=row, column=col)

            cell.value = header
            cell.font = ExportStyles.TABLE_HEADER_FONT
            cell.fill = ExportStyles.TABLE_HEADER_FILL
            cell.border = ExportStyles.THIN_BORDER
            cell.alignment = ExportStyles.WRAP_ALIGNMENT

        row += 1

        values = [
            ("Project Code", project.get("project_code", "")),
            ("Project Name", project.get("name", "")),
            ("Status", project.get("status", "")),
            ("Version", project.get("version", "")),
            ("Start Date", project.get("start_date", "")),
            ("End Date", project.get("end_date", "")),
            ("Description", project.get("description", "")),
        ]

        for field, value in values:

            ws.cell(row=row, column=1).value = field
            ws.cell(row=row, column=2).value = value

            for column in (1, 2):
                cell = ws.cell(row=row, column=column)

                cell.font = ExportStyles.NORMAL_FONT
                cell.border = ExportStyles.THIN_BORDER
                cell.alignment = ExportStyles.WRAP_ALIGNMENT

            row += 1

        ws.auto_filter.ref = (
            f"A{self.current_row}:B{row - 1}"
        )

        self.current_row = row