import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_auth_endpoints():
    print("Testing Authentication Endpoints...")
    
    # Test login
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
        print(f"Login response: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"Logged in as: {user_data['username']} (Role: {user_data['role']})")
            return True
        else:
            print(f"Login failed: {response.text}")
            return False
    except Exception as e:
        print(f"Login error: {e}")
        return False

def test_admin_endpoints():
    print("\nTesting Admin Endpoints...")
    
    # First login to get session
    session = requests.Session()
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    try:
        response = session.post(f'{BASE_URL}/auth/login', json=login_data)
        if response.status_code != 200:
            print("Failed to login for admin tests")
            return
        
        # Test get users
        response = session.get(f'{BASE_URL}/admin/users')
        print(f"Get users response: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"Found {len(users)} users")
            for user in users:
                print(f"  - {user['username']} ({user['role']})")
        
        # Test get current user
        response = session.get(f'{BASE_URL}/auth/me')
        print(f"Get current user response: {response.status_code}")
        if response.status_code == 200:
            user = response.json()
            print(f"Current user: {user['username']} ({user['role']})")
        
        # Test logout
        response = session.post(f'{BASE_URL}/auth/logout')
        print(f"Logout response: {response.status_code}")
        
    except Exception as e:
        print(f"Admin test error: {e}")

def test_regular_endpoints():
    print("\nTesting Regular Endpoints...")
    
    try:
        # Test get issues
        response = requests.get(f'{BASE_URL}/issues')
        print(f"Get issues response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data['issues'])} issues")
        
        # Test health check
        response = requests.get(f'{BASE_URL}/health')
        print(f"Health check response: {response.status_code}")
        
    except Exception as e:
        print(f"Regular endpoint test error: {e}")

if __name__ == "__main__":
    print("Testing Tester Talk API...")
    print("=" * 50)
    
    test_regular_endpoints()
    test_auth_endpoints()
    test_admin_endpoints()
    
    print("\n" + "=" * 50)
    print("Test completed!") 