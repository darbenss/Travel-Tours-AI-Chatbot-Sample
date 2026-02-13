"""Bookings API endpoint"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db_session
from services.booking_service import BookingService
from typing import List, Dict, Any

router = APIRouter()

from models.schemas import BookingCreate

@router.post("/bookings")
async def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db_session)
):
    """
    Create a new booking manually from the specific form.
    """
    try:
        service = BookingService(db)
        result = service.create_booking(
            package_id=booking_data.package_id,
            customer_name=booking_data.customer_name,
            whatsapp_number=booking_data.whatsapp_number,
            num_travelers=booking_data.num_travelers
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings", response_model=List[Dict[str, Any]])
async def get_all_bookings(
    db: Session = Depends(get_db_session)
):
    """
    Get all bookings with package details.
    """
    try:
        service = BookingService(db)
        bookings = service.get_all_bookings()
        return bookings
    except Exception as e:
        print(f"Error fetching bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wa/{booking_id}")
async def redirect_to_whatsapp(
    booking_id: str,
    db: Session = Depends(get_db_session)
):
    """
    Redirect to the stored WhatsApp link for a booking.
    """
    from fastapi.responses import RedirectResponse
    
    service = BookingService(db)
    booking = service.get_booking(booking_id)
    
    if not booking or not booking.whatsapp_link:
        raise HTTPException(status_code=404, detail="Booking or WhatsApp link not found")
        
    return RedirectResponse(url=booking.whatsapp_link)
