from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from app.api import ai, users, calendar
from app.db import models
from app.db.database import engine
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.models import OpenAPI
from fastapi.openapi.utils import get_openapi
from starlette.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from the .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=[]
)

# Include API routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
app.include_router(ai.router, prefix="/upload", tags=["ai"])

@app.get("/")
async def serve_a_html():
    return FileResponse("static/index.html")

app.mount("/", StaticFiles(directory="static"), name="static")
# app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Root endpoint to serve 'a.html' from the 'static' directory
# @app.get("/")
# async def serve_a_html():
#     return FileResponse("static/a.html")

# @app.get("/")
# async def serve_a_html():
#     return FileResponse("static/a.html")



# Create tables in the database
models.Base.metadata.create_all(bind=engine)

# Generate OpenAPI schema with custom routes
def openapi_route():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Docs",
        version="1.0.0",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = openapi_route

