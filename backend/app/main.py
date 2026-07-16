from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.database import Base, engine
from app.routers import auth, integrations, tasks

Base.metadata.create_all(bind=engine)


def ensure_task_columns() -> None:
    """Small dev migration so existing Docker volumes get new task fields."""
    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("tasks")}
    required_columns = {
        "source": "VARCHAR DEFAULT 'manual' NOT NULL",
        "external_id": "VARCHAR",
        "external_url": "VARCHAR",
        "priority": "VARCHAR DEFAULT 'medium' NOT NULL",
        "due_date": "TIMESTAMP",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE tasks ADD COLUMN {column_name} {column_type}")
                )


ensure_task_columns()

app = FastAPI(title="Task Manager API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(integrations.router)


@app.get("/health")
def health():
    return {"status": "ok"}
