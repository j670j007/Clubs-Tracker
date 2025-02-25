"""
File: app.py
Description: Backend Flask application for club tracking system. Provides user registration and authentication, JWT session tokens
Author(s): Michelle Chen, Claire Channel
Creation Date: 02/13/2025
Revised: 02/15/2025 - (M) Updated register and login fields, added session tokens and comments

Preconditions:
- MySQL server running on localhost with database 'club_tracker'
- Python 3.x with Flask, Flask-SQLAlchemy, and PyMySQL installed

Input Values:
- Registration endpoint accepts JSON with: first_name, last_name, email, password, login_id
- Login endpoint accepts JSON with: login_id, password

Return Values:
- Registration success: JSON with message and user_id, status 201
- Login success: JSON with message, user_id, and name, status 200
- Error responses: JSON with error message, status 400 or 401

Error Conditions:
- Database connection failures
- Duplicate email or login_id during registration
- Invalid credentials during login
- Missing required fields
- Server-side exceptions during database operations

Warnings:
- db.drop_all() in main block will clear entire database - use with caution
"""

from functools import wraps  # (M) For preserving function metadata in decorators
from flask import Flask, request, jsonify  # (M) Flask for web framework, request/jsonify for HTTP handling 
from flask_sqlalchemy import SQLAlchemy  # (M) SQLAlchemy for database ORM
import jwt  # (M) JWT library for token operations
from datetime import datetime, timedelta  # (M) datetime for timestamp handling and token expiration
from werkzeug.security import generate_password_hash, check_password_hash  # (C) Security functions for password handling
from flask_cors import CORS

# (C) Initialize Flask application
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:eecs582sp25@localhost/club_tracker'  # (M) Database connection string
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # (M) Disable SQLAlchemy modification tracking
app.config['SECRET_KEY'] = 'eecs582'  # (M) Used for signing JWTs
app.config['JWT_EXPIRATION_DELTA'] = timedelta(hours=24)  # (M) Token validity period -- expires in 24 hours

# (M) Initialize database connection
db = SQLAlchemy(app)

# (M) User model definition
class User(db.Model):
    """
    (M) User database model representing the 'users' table
    
    Attributes:
        User_ID (int): Primary key for user identification
        Last_Name (str): User's last name
        First_Name (str): User's first name
        User_Date_Added (date): Date user was added to system
        Login_ID (str): Unique login identifier (unique)
        Password (str): Hashed password
        Email (str): User's email address (unique)
    """
    __tablename__ = 'users'
    User_ID = db.Column(db.Integer, primary_key=True)  # (M) Auto-incrementing primary key
    Last_Name = db.Column(db.String(255))             # (M) Last name field
    First_Name = db.Column(db.String(255))            # (M) First name field
    User_Date_Added = db.Column(db.Date)              # (M) Registration date
    Login_ID = db.Column(db.String(255))              # (M) Unique login identifier
    Password = db.Column(db.String(255))              # (M) Hashed password storage
    Email = db.Column(db.String(255))                 # (M) User email address

class Club(db.Model):
    """
    User database model representing the 'clubs' table
    
    Attributes:
        Club_ID (int): Primary key for user identification. Auto-assigned.
        Club_Name (str): Name of the club
        Club_Desc (text): Description of the club
        Date_Added (date): Date club was added to system
        Invite_Code (str): Invite code assigned to the club
    """
    __tablename__ = 'clubs'
    Club_ID = db.Column(db.Integer, primary_key=True)  # Auto-incrementing primary key
    Club_Name = db.Column(db.String(255))             # Club name field
    Club_Desc = db.Column(db.Text)                    # Description of the club
    Date_Added = db.Column(db.Date)                   #  Date added
    Invite_Code = db.Column(db.String(255))           #  Club invite code


class ClubUsers(db.Model):
    """
     User database model representing the 'club_users' table

    Attributes:
        Club_User_ID (int): Primary key for identifying club/user link. Auto-assigned. 
        Club_ID (int): ID of club being added, foreign key to clubs table
        User ID (int): ID of user currently logged in.
        Club_User_Date_Added: Date club/user link was created.
        Admin (boolean): Boolean value to indicate if user has special administrative privileges
    """
    __tablename__ = 'club_users'
    Club_Member_ID = db.Column(db.Integer, primary_key=True) #  Auto-incrementing primary key
    Club_ID = db.Column(db.Integer, db.ForeignKey('clubs.Club_ID')) # ID of club being added
    User_ID = db.Column(db.Integer, db.ForeignKey('users.User_ID')) # Logged-in user
    Club_Member_Date_Added = db.Column(db.Date) # Date added 
    Admin = db.Column(db.Boolean)  # (M) Admin boolean value

def generate_token(user_id):
    """
    (M) Generate a new JWT token for a user.
    
    Args:
        user_id (str): The unique identifier of the user
        
    Returns:
        str: JWT token if successful, None if token generation fails
        
    Security:
        - Token includes expiration time
        - Token is signed with SECRET_KEY
        - Uses HS256 algorithm for signing
    """
    # (M) Create token payload with user ID and expiration
    try:
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
        }
        # (M) Generate signed token
        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
        return token
    except Exception as e:
        # (M) Return None if token generation fails
        return None
    
def token_required(f):
    """
    (M) Decorator to protect routes with JWT authentication.
    
    Args:
        f (function): The route function to be decorated
        
    Returns:
        function: Decorated function that includes token validation
        
    Error Responses:
        401: Missing token, expired token, invalid token, or user not found
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # (M) Extract token from Authorization header
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            # (M) Validate Bearer token format: "Bearer <token>"
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]

        # (M) Return error if no token is provided
        if not token:
            return jsonify({'error': 'Authentication token is missing!'}), 401

        try:
            # (M) Verify and decode the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            
            # (M) Retrieve user from database using token payload
            current_user = User.query.get(data['user_id'])
            
            # (M) Verify user exists in database
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401

        except jwt.ExpiredSignatureError:
            # (M) Handle expired tokens
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            # (M) Handle invalid/malformed tokens
            return jsonify({'error': 'Invalid token!'}), 401

        # (M) Pass user object to the protected route
        return f(current_user, *args, **kwargs)

    return decorated

@app.route('/register', methods=['POST'])
def register():
    """
    (M) Handle user registration requests
    
    Expects JSON payload with: first_name, last_name, email, password, login_id
    
    Returns:
        JSON response with success/error message and status code
    
    Error conditions:
        - Missing required fields (400)
        - Email already registered (400)
        - Login ID already taken (400)
        - Database operation failure (400)
    """
    data = request.get_json()  # (M) Parse JSON request data

    # (M) Validate that all required fields are present
    required_fields = ['first_name', 'last_name', 'email', 'password', 'login_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # (M) Check for existing email in database
    if User.query.filter_by(Email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # (M) Check for existing login_id in database
    if User.query.filter_by(Login_ID=data['login_id']).first():
        return jsonify({'error': 'Login ID already taken'}), 400
        
    try:
        # (M) Create new user object with hashed password
        new_user = User(
            Last_Name=data['last_name'],
            First_Name=data['first_name'],
            User_Date_Added=datetime.now().date(),
            Login_ID=data['login_id'],
            Password=generate_password_hash(data['password']),
            Email=data['email']
        )
        # (M) Add and commit new user to database
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message': 'User registered successfully',
            'user_id': new_user.User_ID
        }), 201
    
    except Exception as e:
        # (M) Roll back transaction on error
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    """
    (M) Handle user login requests and token generation.
    
    Expects JSON payload with: login_id, password
    
    Returns:
        JSON response with token and user information
    
    Error conditions:
        - Missing credentials (400)
        - Invalid credentials (401)
    """
    data = request.get_json()  # (M) Parse JSON request data

    # (M) Verify required fields are present
    if not data or 'login_id' not in data or 'password' not in data:
        return jsonify({'error': 'Missing login credentials'}), 400

    # (M) Query database for user 
    user = User.query.filter_by(Login_ID=data['login_id']).first()
    
    # (M) Verify password and return user data if valid
    if user and check_password_hash(user.Password, data['password']):
        # (M) Generate authentication token
        token = generate_token(user.User_ID)

        # (M) Return success response with token and user info
        return jsonify({
            'message': 'Login successful',
            'user_id': user.User_ID,
            'name': f'{user.First_Name} {user.Last_Name}',
            'token': token
        }), 200
    
    # (M) Return error for invalid credentials
    return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    # (M) Initialize database tables
    with app.app_context():
        db.drop_all()  # (M) !!! DANGER: Removes all data from database !!! Use with caution when testing!!!
        db.create_all()  # (M) Create fresh database tables

    # (M) Start Flask development server
    app.run(debug=True)