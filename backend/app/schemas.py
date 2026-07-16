import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    source: str = "manual"
    external_id: str | None = None
    external_url: str | None = None
    priority: str = "medium"
    due_date: datetime.datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority: str | None = None
    due_date: datetime.datetime | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    source: str
    external_id: str | None
    external_url: str | None
    priority: str
    due_date: datetime.datetime | None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class TaskStats(BaseModel):
    total: int
    open: int
    completed: int
    by_source: dict[str, int]


class GitHubSyncRequest(BaseModel):
    owner: str | None = None
    repo: str | None = None


class SyncResult(BaseModel):
    source: str
    imported: int
    skipped: int
    message: str
