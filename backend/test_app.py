"""
File: test_app.py
Description: Automated test suite for app.py functionality
Author(s): Michelle Chen
Creation Date: 02/15/2025
Revised: 02/25/2025 - (M) Add create_club test

Preconditions:
- Flask server must be running on localhost:5000
- Database should be cleared before running tests
- Python requests library must be installed

Input Values:
- Registration requires: first_name, last_name, email, password, login_id (all strings)
- Login requires: login_id, password (both strings)
- Create club requires: club_name, club_desc, invite_code

Return Values:
- Each test function returns JSON response indicating success or failure
- Full test results are printed to console

Error Conditions:
- ConnectionError if server is not running
- HTTP error code for any negative test cases
"""

import requests  # (M) Import requests library for HTTP operations

# (M) Define constant for base URL of API endpoints
BASE_URL = 'http://localhost:5000'

class TestSession:
    """
    (M) Manages test session state and authentication headers.
    
    Attributes:
        user_id (str): Authenticated user's ID
        token (str): JWT authentication token
        headers (dict): HTTP headers including authentication token
    """
    def __init__(self):
        # (M) Initialize session with empty state
        self.user_id = None  # (M) Stores the authenticated user's ID
        self.token = None    # (M) Stores the JWT token
        self.headers = {}    # (M) Stores request headers

    def set_token(self, token):
        # (M) Configure session with JWT token and authorization headers
        self.token = token  # (M) Store the JWT token
        self.headers = {'Authorization': f'Bearer {token}'}  # (M) Create Authorization header with Bearer scheme

def test_registration():
    """
    (M) Test user registration endpoint with both valid and invalid cases.
    
    Returns:
        str: User ID of successfully registered user, or None if registration fails
    """
    print("\nTesting User Registration...")
    
    # (M) Test Case 1: Valid user registration with complete data
    print("Positive Test - Valid Registration:")
    registration_data = {
        "first_name": "Test",  # (M) User's first name
        "last_name": "User",   # (M) User's last name
        "email": "test@example.com",  # (M) Unique email address
        "password": "testpassword123",  # (M) User's password
        "login_id": "testuser"  # (M) Unique login identifier
    }
    
    # (M) Send POST request to registration endpoint
    response = requests.post(f'{BASE_URL}/register', json=registration_data)
    print(f"Status Code: {response.status_code}")  # (M) Print HTTP status code
    print(f"Response: {response.json()}")  # (M) Print response body
    user_id = response.json().get('user_id')  # (M) Extract user_id from response

    # (M) Test Case 2: Invalid registration with missing required fields
    print("\nNegative Test - Missing Required Fields:")
    invalid_data = {
        "first_name": "Test",  # (M) Only providing partial data
        "last_name": "User"
    }
    response = requests.post(f'{BASE_URL}/register', json=invalid_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    # (M) Test Case 3: Attempt to register with duplicate email
    print("\nNegative Test - Duplicate Email:")
    duplicate_email = registration_data.copy()  # (M) Copy original registration data
    duplicate_email["login_id"] = "different_user"  # (M) Change login_id but keep same email
    response = requests.post(f'{BASE_URL}/register', json=duplicate_email)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    return user_id  # (M) Return user_id for use in subsequent tests

def test_login(session):
    """
    (M) Test user login endpoint with both valid and invalid credentials.
    
    Returns:
        str: User ID of successfully logged in user, or None if login fails
    """
    print("\nTesting User Login...")
    
    # (M) Test Case 1: Valid login with correct credentials
    print("Positive Test - Valid Login:")
    login_data = {
        "login_id": "testuser",  # (M) Login ID from registration
        "password": "testpassword123"  # (M) Correct password
    }
    
    # (M) Send POST request to login endpoint
    response = requests.post(f'{BASE_URL}/login', json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # (M) Check if login was successful
    if response.status_code != 200:
        return None
    
    # (M) Store token for future requests
    session.set_token(response.json().get('token'))
    session.user_id = response.json().get('user_id')
        
    user_id = response.json().get('user_id')  # (M) Extract user_id from response
    
    # (M) Test Case 2: Invalid login with incorrect password
    print("\nNegative Test - Wrong Password:")
    wrong_password = {
        "login_id": "testuser",  # (M) Correct login ID
        "password": "wrongpassword"  # (M) Incorrect password
    }
    response = requests.post(f'{BASE_URL}/login', json=wrong_password)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    # (M) Test Case 3: Invalid login with non-existent user
    print("\nNegative Test - Non-existent User:")
    nonexistent_user = {
        "login_id": "nonexistentuser",  # (M) User that doesn't exist
        "password": "testpassword123"
    }
    response = requests.post(f'{BASE_URL}/login', json=nonexistent_user)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    return session.user_id  # (M) Return user_id for potential use in other tests

def test_create_club(session):
    """
    (M) Test create club endpoint with both valid and invalid cases.
    
    Returns:
        str: Club ID of successfully created club, or None if creation fails
    """
    print("\nTesting Club Creation...")
   
    # (M) Positive test case
    print("Positive Test - Valid Club Creation:")
    club_data = {
        "club_name": "Test Club",
        "club_desc": "A club for testing",
        "invite_code": "TEST123"
    }
   
    response = requests.post(
        f'{BASE_URL}/create_club',
        json=club_data,
        headers=session.headers
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    club_id = response.json().get('club_id')

    # (M) Negative test cases
    print("\nNegative Test - Missing Required Fields:")
    invalid_club = {
        "club_name": "Invalid Club"
    }
    response = requests.post(
        f'{BASE_URL}/create_club',
        json=invalid_club,
        headers=session.headers
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    print("\nNegative Test - No Authentication:")
    response = requests.post(f'{BASE_URL}/create_club', json=club_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

    return club_id

def run_all_tests():
    """
    (M) Main test runner that executes all test cases in sequence.
    
    Side Effects:
        - Executes all test cases
        - Prints overall test results and any errors
        - Creates test data in database
    
    Error Handling:
        - Catches and reports connection errors
        - Catches and reports unexpected exceptions
    """
    try:
        print("=== Starting Test Suite ===")
        print("\nNote: Make sure database is cleared before running tests")

        # (M) Create a session to manage authentication state
        session = TestSession()
        
        # (M) Execute registration tests
        user_id = test_registration()
        if not user_id:  # (M) Check if registration was successful
            print("Registration failed, stopping tests")
            return
        print(f"Successfully registered with user_id: {user_id}")

        # (M) Execute login tests and get token
        logged_in_user_id = test_login(session)
        if not logged_in_user_id:  # (M) Check if login was successful
            print("Login failed, stopping tests. Check if registration succeeded and login credentials are correct.")
            return
        print(f"Successfully logged in with user_id: {logged_in_user_id}")

        # Test club creation with authentication
        club_id = test_create_club(session)
        if not club_id:
            print("Club creation failed, stopping tests")
            return

        print("\n=== Test Suite Completed ===")
        
    except requests.exceptions.ConnectionError:
        # (M) Handle case where server is not running
        print("Error: Could not connect to the server. Make sure your Flask app is running.")
    except Exception as e:
        # (M) Handle any unexpected errors
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    run_all_tests()