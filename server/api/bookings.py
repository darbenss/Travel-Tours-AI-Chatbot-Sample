"""Bookings API endpoint"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db_session
from services.booking_service import BookingService
from typing import List, Dict, Any

router = APIRouter()

from models.schemas import BookingCreate

from api.deps import get_current_user_optional, get_current_admin, get_current_user
from models.database import User
from typing import Optional

@router.post("/bookings")
async def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Create a new booking manually from the specific form.
    """
    try:
        service = BookingService(db)
        user_id = current_user.id if current_user else None
        
        result = service.create_booking(
            package_id=booking_data.package_id,
            customer_name=booking_data.customer_name,
            whatsapp_number=booking_data.whatsapp_number,
            num_travelers=booking_data.num_travelers,
            user_id=user_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/me", response_model=List[Dict[str, Any]])
async def get_my_bookings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get bookings for the current user.
    """
    try:
        service = BookingService(db)
        bookings = service.get_user_bookings(current_user.id)
        return bookings
    except Exception as e:
        print(f"Error fetching user bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings", response_model=List[Dict[str, Any]])
async def get_all_bookings(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all bookings (Admin only).
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
