from io import BytesIO

from docx import Document
from docx.document import Document as DocumentObject
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl


class DocumentExtractor:
    """Extracts text from supported business documents."""

    @staticmethod
    def extract_docx(file_content: bytes) -> str:
        document = Document(
            BytesIO(file_content)
        )

        sections = []

        for element in DocumentExtractor._iter_block_items(
            document
        ):
            if isinstance(element, Paragraph):
                text = element.text.strip()

                if text:
                    sections.append(text)

            elif isinstance(element, Table):
                for row in element.rows:
                    cells = []

                    for cell in row.cells:
                        text = cell.text.strip()

                        if text:
                            cells.append(text)

                    if cells:
                        sections.append(" | ".join(cells))

        return "\n".join(sections)

    @staticmethod
    def _iter_block_items(
        parent: DocumentObject,
    ):
        parent_element = parent.element.body

        for child in parent_element.iterchildren():
            if isinstance(child, CT_P):
                yield Paragraph(
                    child,
                    parent,
                )

            elif isinstance(child, CT_Tbl):
                yield Table(
                    child,
                    parent,
                )