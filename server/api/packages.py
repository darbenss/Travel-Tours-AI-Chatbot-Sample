"""Packages API endpoint"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db_session
from models.database import Package
from typing import List, Dict, Any

router = APIRouter()

@router.get("/packages", response_model=List[Dict[str, Any]])
async def get_all_packages(
    db: Session = Depends(get_db_session)
):
    """
    Get all available packages (simple list for dropdowns).
    """
    try:
        packages = db.query(Package).filter(Package.is_active == True).all()
        return [pkg.to_dict() for pkg in packages]
    except Exception as e:
        print(f"Error fetching packages: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
