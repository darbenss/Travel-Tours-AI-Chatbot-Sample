"""Database models for Travel AI Agent"""
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, DECIMAL, Enum as SQLEnum, ForeignKey
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import uuid


Base = declarative_base()


def generate_uuid():
    """Generate UUID as string"""
    return str(uuid.uuid4())


class Package(Base):
    """Travel package model"""
    __tablename__ = "packages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False, index=True)
    destination = Column(String(200), nullable=False)
    price = Column(DECIMAL(12, 2), nullable=False)
    description = Column(Text, nullable=False)
    season = Column(
        SQLEnum('Winter', 'Spring', 'Summer', 'Fall', 'Year-Round', name='season_enum'),
        nullable=True
    )
    tags = Column(String(500), nullable=True)
    highlights = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    
    # For vector search (using pgvector)
    embedding = Column(Vector(1536), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "destination": self.destination,
            "price": float(self.price),
            "description": self.description,
            "season": self.season,
            "tags": self.tags,
            "highlights": self.highlights,
            "is_active": self.is_active
        }


class Booking(Base):
    """Booking model"""
    __tablename__ = "bookings"
    
    booking_id = Column(String(36), primary_key=True, default=generate_uuid)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=False, index=True)
    
    customer_name = Column(String(100), nullable=False)
    whatsapp_number = Column(String(20), nullable=False)
    num_travelers = Column(Integer, nullable=True)
    preferred_departure_date = Column(DateTime, nullable=True)
    
    status = Column(
        SQLEnum(
            'PENDING',
            'IN_PROGRESS',
            'CONFIRMED',
            'CANCELLED',
            name='booking_status_enum'
        ),
        default='PENDING',
        index=True
    )
    
    whatsapp_link = Column(String(1000), nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now(), index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "booking_id": self.booking_id,
            "package_id": self.package_id,
            "customer_name": self.customer_name,
            "whatsapp_number": self.whatsapp_number,
            "num_travelers": self.num_travelers,
            "status": self.status,
            "whatsapp_link": self.whatsapp_link,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
