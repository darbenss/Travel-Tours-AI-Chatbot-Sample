"""Bookings API endpoint"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db_session
from services.booking_service import BookingService
from typing import List, Dict, Any

router = APIRouter()

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
