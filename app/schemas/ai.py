from pydantic import BaseModel
from typing import List, Optional

class ExtractedEvent(BaseModel):
    event_name: str
    start_time: str
    end_time: str
    location: Optional[str]
    description: Optional[str]

class AIEventExtractionResponse(BaseModel):
    extracted_events: List[ExtractedEvent]

class TaskPriorityUpdate(BaseModel):
    task_priority: int
    work_blocks: List[ExtractedEvent]

class AIUpdateResponse(BaseModel):
    updates: TaskPriorityUpdate