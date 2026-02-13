"""Pydantic schemas for API requests and responses"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    """Chat request from frontend"""
    message: str = Field(..., min_length=1, description="User's message")
    thread_id: Optional[str] = Field(None, description="Thread ID for conversation continuity")


class ChatResponse(BaseModel):
    """Chat response to frontend"""
    id: str = Field(..., description="Message ID")
    role: str = Field(default="assistant", description="Message role")
    content: str = Field(..., description="Assistant's response")


class PackageSchema(BaseModel):
    """Package schema for API responses"""
    id: str
    title: str
    destination: str
    price: float
    description: str
    season: Optional[str]
    tags: Optional[str]
    highlights: Optional[str]
    
    class Config:
        from_attributes = True


class BookingSchema(BaseModel):
    """Booking schema for API responses"""
    booking_id: str
    package_id: str
    customer_name: str
    whatsapp_number: str
    num_travelers: Optional[int]
    total_price: Optional[float]
    status: str
    whatsapp_link: str
    created_at: datetime
    
    class Config:
        from_attributes = True
