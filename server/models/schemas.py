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


class UserBase(BaseModel):
    """Base user schema"""
    email: str = Field(..., description="User email")


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, description="User password")


class UserLogin(UserBase):
    """Schema for user login"""
    password: str = Field(..., description="User password")


class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT Token schema"""
    access_token: str
    token_type: str


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
    user_id: Optional[str] = None
    customer_name: str
    whatsapp_number: str
    num_travelers: Optional[int]
    total_price: Optional[float]
    status: str
    whatsapp_link: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    """Schema for creating a new booking manually"""
    package_id: str
    customer_name: str
    whatsapp_number: str
    num_travelers: int = 1
