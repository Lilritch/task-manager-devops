from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import auth, models, schemas
from app.database import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[schemas.TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Task)
        .filter(models.Task.owner_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@router.post("/", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = models.Task(**task_in.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def _get_owned_task(task_id: int, db: Session, current_user: models.User) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = _get_owned_task(task_id, db, current_user)
    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = _get_owned_task(task_id, db, current_user)
    db.delete(task)
    db.commit()
