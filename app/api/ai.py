from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.crud import add_calendar_event, create_calendar_source, get_source_id_by_name, get_user_calendar_event, update_task_priority
from app.schemas.calendar import CalendarEventCreate, CalendarSourceCreate
from app.services.ai import process_calendar_image, process_assignment_pdf
from app.schemas.ai import AIEventExtractionResponse, AIUpdateResponse
from app.core import get_current_active_user, get_db

router = APIRouter()

@router.post("/calendar", response_model=AIEventExtractionResponse)
def upload_calendar_image(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_user)
):
    """
    Upload an image or PDF containing calendar data, which will be processed by the AI
    to extract calendar events.
    """
    extracted_events = process_calendar_image(file)
    source_id = get_source_id_by_name(db, current_user.id, file.filename)
    if not source_id:
        source_id = create_calendar_source(db, current_user.id, CalendarSourceCreate(**{"source_name": file.filename})).id
    for event in extracted_events:
        print(event)
        event["source_id"] = file.filename
        e = CalendarEventCreate(**event)
        add_calendar_event(db, e, source_id, current_user.id)
    return {"extracted_events": extracted_events}


@router.post("/assignment/{event_id}", response_model=AIUpdateResponse)
def upload_assignment_pdf(
    event_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_active_user)
):
    """
    Upload an assignment or event description as a PDF, and the AI will provide updates
    such as task priority and work blocks.
    """
    ai_updates = process_assignment_pdf(file, event_id)
    update_task_priority(db, event_id, ai_updates['task_priority'], current_user.id)
    for task in ai_updates['work_blocks']:
        event = get_user_calendar_event(db, current_user.id, event_id)
        task['source_id'] = ""
        t = CalendarEventCreate(**task)
        add_calendar_event(db, t, event.source_id, current_user.id)
    return {
        "updates": ai_updates
    }
