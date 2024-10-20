from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CalendarSourceCreate(BaseModel):
    source_name: str

class CalendarSourceResponse(BaseModel):
    id: int
    source_name: str

    class Config:
        orm_mode = True

class CalendarEventCreate(BaseModel):
    event_name: str
    start_time: datetime
    source_id: str
    end_time: datetime
    location: Optional[str]
    description: Optional[str]

class CalendarEventResponse(BaseModel):
    id: int
    event_name: str
    start_time: datetime
    end_time: datetime
    location: Optional[str]
    description: Optional[str]

    class Config:
        orm_mode = True
