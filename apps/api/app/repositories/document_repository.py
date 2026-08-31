from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:
    @staticmethod
    def create(
        db: Session,
        document: Document,
    ) -> Document:
        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_all_by_project(
        db: Session,
        project_id: int,
    ) -> list[Document]:
        return (
            db.query(Document)
            .filter(Document.project_id == project_id)
            .order_by(Document.id.asc())
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        document_id: int,
    ) -> Document | None:
        return (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    @staticmethod
    def delete(
        db: Session,
        document: Document,
    ) -> None:
        db.delete(document)
        db.commit()