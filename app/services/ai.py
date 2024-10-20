# crud/ai_processing.py
from typing import List
import openai
import json
import base64
from pdf2image import convert_from_path
import io
from fastapi import HTTPException
from PIL import Image

from app.config.settings import Settings

settings = Settings()

openai.api_key = settings.OPENAI_KEY
client = openai.OpenAI(api_key=settings.OPENAI_KEY)


def encode_image(image: Image):
    """
    Convert a PIL Image to base64-encoded string for sending to OpenAI.
    Convert RGBA images to RGB to avoid transparency issues when saving as JPEG.
    """
    if image.mode == 'RGBA':
        # Convert RGBA to RGB to remove the alpha channel
        image = image.convert('RGB')
    
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def pdf_to_images(pdf_path: str):
    """
    Convert a PDF file to a list of images (one per page).
    """
    images = convert_from_path(pdf_path)
    return images

def process_calendar_image(file):
    """
    Send the calendar image or PDF (converted to images) to OpenAI for event extraction.
    """
    file_extension = file.filename.split(".")[-1].lower()

    # If the uploaded file is a PDF, convert it to images
    images = []
    if file_extension == "pdf":
        pdf_path = f"/tmp/{file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(file.file.read())
        images = pdf_to_images(pdf_path)
    else:
        # Assume the uploaded file is an image
        image = Image.open(file.file)
        images.append(image)

    # Encode all images for sending to OpenAI
    encoded_images = [encode_image(image) for image in images]

    # Construct the OpenAI prompt
    messages = [
        {
            "role": "system",
            "content":[
                {
                        "type": "text",
                        "text": "You are an AI that helps users extract calendar events from images or PDFs.",
                }
            ]
        },
        {
            "role": "user",
            "content":[
                {
                        "type": "text",
                        "text": "Please extract all calendar events from the provided ximages.",
                },
            ]
        }
    ]
    for encoded_image in encoded_images:
        messages.append(
            {
                "role": "user",
                "content":[
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    }
                ]
            }
        )

    # Request event extraction from OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "event_extraction",
                "description": "Extract calendar events from provided images or PDFs. if data is cut off you can try to extrapolate it within reason. timestamps MUST be in iso format ex. 2023-08-21T07:55:00",
                "schema": {
                    "type": "object",
                    "properties": {
                        "extracted_events": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "event_name": {"type": "string"},
                                    "start_time": {"type": "string"},
                                    "end_time": {"type": "string"},
                                    "location": {"type": "string"},
                                    "description": {"type": "string"}
                                },
                                "required": ["event_name", "start_time", "end_time", "location", "description"]
                            }
                        }
                    }
                }
            }
        },
        max_tokens=1024
    )

    # Parse and return the JSON response
    try:
        ai_response = json.loads(response.choices[0].message.content)["extracted_events"]
        return ai_response
    except (json.JSONDecodeError, KeyError) as e:
        raise HTTPException(status_code=500, detail="Error parsing AI response")


def process_assignment_pdf(file, event_id):
    """
    Send the assignment PDF or image to OpenAI for task priority and work block updates.
    Convert PDFs to images before processing.
    """
    file_extension = file.filename.split(".")[-1].lower()

    # If the uploaded file is a PDF, convert it to images
    images = []
    if file_extension == "pdf":
        pdf_path = f"/tmp/{file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(file.file.read())
        images = pdf_to_images(pdf_path)
    else:
        # Assume the uploaded file is an image
        image = Image.open(file.file)
        images.append(image)

    # Encode all images for sending to OpenAI
    encoded_images = [encode_image(image) for image in images]

    # Construct the OpenAI prompt
    messages = [
        {
            "role": "system",
            "content":[
                {
                        "type": "text",
                        "text": "You are an AI that helps students manage their workload by analyzing assignment descriptions and breaking tasks into manageable blocks.",
                },
            ]
        },
        {
            "role": "user",
            "content":[
                {
                        "type": "text",
                        "text": f"I have uploaded images of an assignment for event ID {event_id}. Please analyze the content and provide task priority and work blocks.",
                },
            ]
        }
    ]
    for encoded_image in encoded_images:
        messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    }
                ]
            }
        )

    # Request task priority and work block updates from OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "task_priority_update",
                "description": "Task priority and work block updates for a student's assignment",
                "schema": {
                    "type": "object",
                    "properties": {
                        "task_priority": {
                            "type": "number",
                            "description": "The overall priority of this task (integer 0-5)"
                        },
                        "work_blocks": {
                            "type": "array",
                            "description": "A list of recommended work blocks for completing the assignment",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "event_name": {"type": "string"},
                                    "start_time": {"type": "string"},
                                    "end_time": {"type": "string"},
                                    "location": {"type": "string"},
                                    "description": {"type": "string"}
                                },
                                "required": ["event_name", "start_time", "end_time", "location", "description"]
                            }
                        }
                    },
                    "required": ["task_priority", "work_blocks"]
                }
            }
        },
        max_tokens=512
    )

    # Parse and return the JSON response
    try:
        print(response.choices[0].message.content)
        ai_response = json.loads(response.choices[0].message.content)
        return ai_response
    except (json.JSONDecodeError, KeyError) as e:
        raise HTTPException(status_code=500, detail="Error parsing AI response")
