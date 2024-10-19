from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from app.api import users
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
app.mount("/static", StaticFiles(directory="static"), name="static")
# app.include_router(auth.router, prefix="/auth", tags=["auth"])

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

