import requests
import json

BASE_URL = "http://localhost:8000/api"
EMAIL = "testuser@example.com"
PASSWORD = "password123"
ADMIN_EMAIL = "admin@uprev.id"
ADMIN_PASSWORD = "adminpassword123"

def test_auth_flow():
    print("--- Testing Auth Flow ---")
    
    # 1. Signup
    print("1. Signup...")
    payload = {"email": EMAIL, "password": PASSWORD}
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload)
        if response.status_code == 200:
            print("   Signup successful")
        elif response.status_code == 400 and "already registered" in response.text:
            print("   User already exists (expected if re-running)")
        else:
            print(f"   Signup failed: {response.status_code} {response.text}")
            return
    except Exception as e:
        print(f"   Failed to connect: {e}")
        return

    # 2. Login
    print("2. Login...")
    payload = {"username": EMAIL, "password": PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("   Login successful. Token received.")
    else:
        print(f"   Login failed: {response.status_code} {response.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Booking (Logged In)
    print("3. Create Booking (Logged In)...")
    # Need a package ID. Let's list packages first? Or hardcode one if I know?
    # I'll create a dummy one or list. Admin isn't needed for packages usually?
    # Packages endpoint is likely open.
    try:
        pkg_res = requests.get(f"{BASE_URL}/packages")
        if pkg_res.status_code == 200 and len(pkg_res.json()) > 0:
            package_id = pkg_res.json()[0]["id"]
            print(f"   Using package ID: {package_id}")
        else:
            print("   No packages found. Cannot test booking.")
            # Maybe seed packages? existing 'seed_packages' exists.
            package_id = "dummy_id" 
    except:
        package_id = "dummy_id"

    booking_payload = {
        "package_id": package_id,
        "customer_name": "Test User",
        "whatsapp_number": "+628123456789",
        "num_travelers": 2
    }
    
    response = requests.post(f"{BASE_URL}/bookings", json=booking_payload, headers=headers)
    if response.status_code == 200:
        print("   Booking created successfully.")
    else:
        print(f"   Booking failed: {response.status_code} {response.text}")

    # 4. Get My Bookings
    print("4. Get My Bookings...")
    response = requests.get(f"{BASE_URL}/bookings/me", headers=headers)
    if response.status_code == 200:
        bookings = response.json()
        print(f"   Retrieved {len(bookings)} bookings.")
        if len(bookings) > 0:
            print("   Success: Found user bookings.")
        else:
            print("   Warning: No bookings found (if creation failed).")
    else:
        print(f"   Get My Bookings failed: {response.status_code} {response.text}")

    # 5. Access All Bookings (As User - Should Fail)
    print("5. Access All Bookings (As User)...")
    response = requests.get(f"{BASE_URL}/bookings", headers=headers)
    if response.status_code == 403:
        print("   Access denied as expected (403).")
    else:
        print(f"   Unexpected status code: {response.status_code}")

    # 6. Login as Admin
    print("6. Login as Admin...")
    payload = {"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", data=payload)
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        print("   Admin Login successful.")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # 7. Access All Bookings (As Admin)
        print("7. Access All Bookings (As Admin)...")
        response = requests.get(f"{BASE_URL}/bookings", headers=admin_headers)
        if response.status_code == 200:
            all_bookings = response.json()
            print(f"   Admin retrieved {len(all_bookings)} bookings.")
        else:
            print(f"   Admin access failed: {response.status_code} {response.text}")
            
    else:
        print(f"   Admin Login failed: {response.status_code} {response.text}")

if __name__ == "__main__":
    test_auth_flow()
