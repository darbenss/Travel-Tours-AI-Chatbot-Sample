import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_booking_creation():
    print("--- Testing POST /bookings Auth Handling ---")
    
    booking_payload = {
        "package_id": "5b43ff87-1a5b-4090-9db8-b510df40ba19", # ID from user log
        "customer_name": "Test User",
        "whatsapp_number": "+628123456789",
        "num_travelers": 2
    }
    
    # 1. Guest (No Header)
    print("\n1. Testing Guest Booking (No Header)...")
    res = requests.post(f"{BASE_URL}/bookings", json=booking_payload)
    if res.status_code == 200:
        print("   ✅ Success (Code 200)")
        print(f"   Response: ID={res.json().get('booking_id')}, UserID={res.json().get('user_id')}")
    else:
        print(f"   ❌ Failed. Code: {res.status_code}")
        print(f"   Response: {res.text}")

    # 2. Invalid Token
    print("\n2. Testing Invalid Token (Bearer invalid_token)...")
    headers = {"Authorization": "Bearer invalid_token_string"}
    res = requests.post(f"{BASE_URL}/bookings", json=booking_payload, headers=headers)
    if res.status_code == 200:
        print("   ✅ Success (Code 200) - Handled gracefully as guest")
        print(f"   Response: ID={res.json().get('booking_id')}, UserID={res.json().get('user_id')}")
    elif res.status_code == 401:
        print("   ❌ Failed with 401. This confirms the issue!")
        print(f"   Response: {res.text}")
    else:
        print(f"   ❌ Failed. Code: {res.status_code}")
        print(f"   Response: {res.text}")

    # 3. Valid Token (if possible to login first)
    print("\n3. Testing Valid Token...")
    # Login as admin to get token
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@uprev.id", "password": "adminpassword123"})
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post(f"{BASE_URL}/bookings", json=booking_payload, headers=headers)
        if res.status_code == 200:
            print("   ✅ Success (Code 200)")
            print(f"   Response: ID={res.json().get('booking_id')}, UserID={res.json().get('user_id')}")
        else:
            print(f"   ❌ Failed. Code: {res.status_code}")
    else:
        print("   ⚠️  Could not login to test valid token.")

if __name__ == "__main__":
    test_booking_creation()
