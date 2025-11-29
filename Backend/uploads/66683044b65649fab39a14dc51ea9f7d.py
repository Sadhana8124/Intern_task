import requests
import json

# Test data
test_user = {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123",
    "role": "intern"
}

try:
    # Test the backend connection
    print("Testing backend connection...")
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Backend status: {response.status_code}")
    print(f"Backend response: {response.json()}")
    
    # Test user registration
    print("\nTesting user registration...")
    response = requests.post(
        "http://127.0.0.1:8000/users/",
        json=test_user,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Registration status: {response.status_code}")
    if response.status_code == 201:
        print("Registration successful!")
        print(f"Response: {response.json()}")
    else:
        print(f"Registration failed: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("Error: Cannot connect to backend server. Make sure it's running on http://127.0.0.1:8000")
except Exception as e:
    print(f"Error: {e}")
