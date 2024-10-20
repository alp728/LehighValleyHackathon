from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.crud import create_calendar_source, add_calendar_event, get_user_calendar, delete_calendar_source, get_source_id_by_name
from app.schemas.calendar import CalendarSourceCreate, CalendarEventCreate, CalendarEventResponse, CalendarSourceResponse
from app.core import get_current_active_user, get_db

router = APIRouter()

@router.post("/source", response_model=CalendarSourceResponse)
def add_calendar_source(source_data: CalendarSourceCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return create_calendar_source(db, current_user.id, source_data)

@router.post("/event", response_model=CalendarEventResponse)
def add_event(event_data: CalendarEventCreate, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    source_id = get_source_id_by_name(db, current_user.id, event_data.source_id)
    return add_calendar_event(db, event_data, source_id, current_user.id)

@router.get("/events", response_model=List[CalendarEventResponse])
def get_user_events(db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return get_user_calendar(db, current_user.id)

@router.delete("/source/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    return delete_calendar_source(db, source_id, current_user.id)
