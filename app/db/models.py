from enum import Enum
from sqlalchemy import (
    VARCHAR,
    Column,
    Float,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    ARRAY,
    create_engine,
    Table,
)
from sqlalchemy.types import Enum as EnumType
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from app.config.settings import settings

Base = declarative_base()

class CalendarSource(Base):
    __tablename__ = "calendar_sources"
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="calendar_sources")
    user_calendars = relationship("UserCalendar", back_populates="calendar_source")

class UserCalendar(Base):
    __tablename__ = "user_calendars"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_name = Column(Text, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    source_id = Column(Integer, ForeignKey("calendar_sources.id"))
    calendar_source = relationship("CalendarSource", back_populates="user_calendars")
    user = relationship("User", back_populates="user_calendars")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)
    email = Column(VARCHAR(255), unique=True, index=True)
    profile_picture = Column(Text, nullable=True)
    password = Column(Text, nullable=False)
    
    calendar_sources = relationship("CalendarSource", back_populates="user")
    user_calendars = relationship("UserCalendar", back_populates="user")

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)
