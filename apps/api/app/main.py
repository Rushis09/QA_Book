from fastapi import FastAPI

from app.db.database import Base, engine
from app.models.project import Project

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QABook API",
    description="AI-Powered Manual Testing Workspace",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "application": "QABook",
        "version": "0.1.0",
        "status": "Running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }