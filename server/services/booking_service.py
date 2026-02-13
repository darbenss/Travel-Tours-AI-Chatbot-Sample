"""Booking service for creating and managing bookings"""
import urllib.parse
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.orm import Session
from models.database import Booking, Package, generate_uuid
from config import get_settings

settings = get_settings()


class BookingService:
    """Service for handling booking operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_booking(
        self,
        package_id: str,
        customer_name: str,
        whatsapp_number: str,
        num_travelers: Optional[int] = None
    ) -> Dict:
        """Create a new booking and generate WhatsApp link"""
        
        # Validate package exists
        package = self.db.query(Package).filter(Package.id == package_id).first()
        if not package:
            raise ValueError(f"Package {package_id} not found")
        
        # Validate customer name (must have at least 2 words)
        if len(customer_name.split()) < 2:
            raise ValueError("Please provide both first and last name")
        
        # Ensure WhatsApp number has country code
        if not whatsapp_number.startswith('+'):
            # Assume Indonesia (+62) if no country code
            whatsapp_number = f"+62{whatsapp_number.lstrip('0')}"
        
        # Generate booking ID
        booking_id = generate_uuid()
        
        # Calculate total price
        total_price = package.price * (num_travelers or 1)
        
        # Generate WhatsApp link
        whatsapp_link = self._generate_whatsapp_link(
            package=package,
            customer_name=customer_name,
            whatsapp_number=whatsapp_number,
            booking_id=booking_id,
            num_travelers=num_travelers,
            total_price=total_price
        )
        
        # Create booking record
        booking = Booking(
            booking_id=booking_id,
            package_id=package_id,
            customer_name=customer_name,
            whatsapp_number=whatsapp_number,
            num_travelers=num_travelers,
            total_price=total_price,
            status='PENDING',
            whatsapp_link=whatsapp_link,
            created_at=datetime.utcnow()
        )
        
        self.db.add(booking)
        self.db.commit()
        
        # Construct short link (redirect endpoint)
        # Use APP_URL from settings (defaults to localhost:3000)
        base_url = settings.app_url
        short_link = f"{base_url}/api/wa/{booking_id}"
        
        return {
            "success": True,
            "booking_id": booking_id,
            "whatsapp_link": short_link,
            "original_link": whatsapp_link,
            "message": f"Booking berhasil dibuat untuk {customer_name}! Silakan klik link WhatsApp untuk melanjutkan."
        }
    
    def _generate_whatsapp_link(
        self,
        package: Package,
        customer_name: str,
        whatsapp_number: str,
        num_travelers: int,
        booking_id: str,
        total_price: float
    ) -> str:
        """Generate pre-filled WhatsApp link"""
        
        # Create message template
        message = f"""Halo! Saya tertarik untuk booking paket tour melalui AI assistant:

- *Paket*: {package.title}
- *Booking ID*: {booking_id}
- *Nama*: {customer_name}
- *Pax*: {num_travelers}
- *WhatsApp Saya*: {whatsapp_number}
- *Total Harga*: IDR {total_price:,.0f} (IDR {package.price:,.0f}/pax)
- *Destinasi*: {package.destination}

Mohon bantuannya untuk melanjutkan proses booking. Terima kasih!"""
        
        # URL encode the message
        encoded_message = urllib.parse.quote(message)
        
        # Construct wa.me link (remove + from company number)
        company_number = settings.company_whatsapp.replace('+', '')
        link = f"https://wa.me/{company_number}?text={encoded_message}"
        
        return link
    
    def get_booking(self, booking_id: str) -> Optional[Booking]:
        """Get booking by ID"""
        return self.db.query(Booking).filter(Booking.booking_id == booking_id).first()

    def get_all_bookings(self):
        """Get all bookings with package details"""
        # Join Booking with Package to get package details
        results = self.db.query(Booking, Package).join(
            Package, Booking.package_id == Package.id
        ).order_by(Booking.created_at.desc()).all()
        
        bookings_list = []
        for booking, package in results:
            bookings_list.append({
                "booking_id": booking.booking_id,
                "customer_name": booking.customer_name,
                "whatsapp_number": booking.whatsapp_number,
                "package_id": booking.package_id,
                "status": booking.status,
                "created_at": booking.created_at,
                "num_travelers": booking.num_travelers,
                "total_price": float(booking.total_price) if booking.total_price else None,
                "package_title": package.title,
                "package_destination": package.destination,
                "package_price": float(package.price)
            })
            
        return bookings_list
