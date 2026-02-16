import sys
import os
import asyncio

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

from main import startup_event
from config import get_settings

async def debug():
    print("Debug: Starting startup_event")
    settings = get_settings()
    print(f"Debug: DB URL from settings: {settings.database_url}")
    try:
        await startup_event()
        print("Debug: Startup event completed successfully")
    except Exception as e:
        print(f"Debug: Startup event failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
