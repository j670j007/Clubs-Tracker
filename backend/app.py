"""
File: app.py
Description: Backend Flask application for club tracking system
Author(s): Michelle Chen, Jennifer Aber, Claire Channel
Creation Date: 02/13/2025
Revised: 04/04/2025 - (M) Add "add club profile picture" function

Preconditions:
- MySQL server running on localhost with database 'club_tracker'
- Python 3.x with Flask, Flask-SQLAlchemy, and PyMySQL installed

Input Values:
- Registration endpoint accepts JSON with: first_name, last_name, email, password, login_id
- Login endpoint accepts JSON with: login_id, password
- Create club endpoint accepts JSON with: club_name, club_desc, invite_code
- Create club endpoint accepts JSON with: event_desc, event_location, event_date

Return Values:
- Registration success: JSON with message and user_id, status 201
- Login success: JSON with message, user_id, and name, status 200
- Create club success: JSON with message and club_id, status 201
- Delete club success: JSON with message,status 200
- Join club success: JSON with message, status 201
- Leave club success: JSON with message, status 201
- Create event success: JSON with message, status 201
- Add profile picture success: JSON with message, status 200
- Error responses: JSON with error message, status 400/401/500

Error Conditions:
- Database connection failures
- Duplicate entries to database
- Invalid credentials during login
- Missing required fields

Warnings:
- drop_all_tables() in main block will clear entire database - use with caution
"""

from functools import wraps  # (M) For preserving function metadata in decorators
from flask import Flask, request, jsonify  # (M) Flask for web framework, request/jsonify for HTTP handling 
from flask_sqlalchemy import SQLAlchemy  # (M) SQLAlchemy for database ORM
from sqlalchemy import text
import jwt  # (M) JWT library for token operations
from datetime import datetime, timedelta  # (M) datetime for timestamp handling and token expiration
from werkzeug.security import generate_password_hash, check_password_hash  # (C) Security functions for password handling
from flask_cors import CORS
import os
import time

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

class ClubUser(db.Model):
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

class Event(db.Model):
    """
    (M) User database model representing the 'events' table

    Attributes:
        Event_ID (int): Primary key for identifying the event. Auto-assigned. 
        Club_ID (int): ID of club associated with the event.
        Event_Desc (text): Description of the event.
        Event_Location (string): Location of the event.
        Event_Date: Date of the event.
    """
    __tablename__ = 'events'
    Event_ID = db.Column(db.Integer, primary_key=True)
    Club_ID = db.Column(db.Integer, db.ForeignKey('clubs.Club_ID'))
    Event_Desc = db.Column(db.Text)
    Event_Location = db.Column(db.String(255))
    Event_Date = db.Column(db.Date)

class Image(db.Model):
    """
    (M) User database model representing the 'images' table

    Attributes:
        Image_ID (int): Primary key for identifying the image. Auto-assigned. 
        Club_ID (int): ID of club associated with the image.
        Image_Link (string): Contains a relative link to the image data.
        Date_Added: Date of upload.
        Profile_Pic (boolean): If the picture is uploaded using the "add a club profile picture" function, the value is true. Otherwise, the value is false.
    """
    __tablename__ = 'images'
    Image_ID = db.Column(db.Integer, primary_key=True)
    Club_ID = db.Column(db.Integer, db.ForeignKey('clubs.Club_ID'))
    Image_Link = db.Column(db.String(255))
    Date_Added = db.Column(db.Date)
    Profile_Pic = db.Column(db.Boolean, default=False)

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

@app.route('/create_club', methods=['POST'])
@token_required
def create_club(current_user):
    """
    Logged-in user can add a new club to the database

    Takes a club name, description, and invite code for adding users to an existing club.  

    Returns:
        - JSON response with success/error message and status code

    Error conditions:
        - Duplicate club name (400)
        - Missing required fields (400)
    """
    data = request.get_json()  # (M) Parse JSON request data
   
    # (M) Validate that all required fields are present
    required_fields = ['club_name', 'club_desc', 'invite_code']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # (M) Check if a club with the same name already exists
    if Club.query.filter_by(Club_Name=data['club_name']).first():
        return jsonify({'error': 'Club name already exists'}), 400
           
    try:
        # (M) Create new club object
        new_club = Club(
            Club_Name=data['club_name'],
            Club_Desc=data['club_desc'],
            Date_Added=datetime.now().date(),
            Invite_Code=data['invite_code']
        )
        db.session.add(new_club)
        db.session.commit()
       
        # (M) Also make the creator a club member and admin
        new_member = ClubUser(
            Club_ID=new_club.Club_ID,
            User_ID=current_user.User_ID,
            Club_Member_Date_Added=datetime.now().date(),
            Admin=True
        )
        db.session.add(new_member)
        db.session.commit()
       
        return jsonify({
            'message': 'Club created successfully',
            'club_id': new_club.Club_ID
        }), 201
    
    except Exception as e:
        # (M) Roll back transaction on error
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    
@app.route('/clubs/<int:club_id>', methods=['DELETE'])
@token_required
def delete_club(current_user, club_id):
    """
    (M) Delete a club from the database

    Returns:
        - JSON response with success/error message and status code

    Error conditions:
        - Club does not exist (404)
        - User is not admin (403)
    """
    # (M) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
       
    # (M) Check if user is an admin of the club
    is_admin = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()

    if not is_admin:
        return jsonify({'error': 'Permission denied. Only club admins can delete clubs'}), 403
    
    try:
        # (M) TODO later: delete all related records first (events, expenses, etc.) before deleting club itself
        # (M) Delete all club users
        ClubUser.query.filter_by(Club_ID=club_id).delete()

        # (M) Delete the club itself
        db.session.delete(club)
        db.session.commit()
       
        return jsonify({'message': 'Club and all related data successfully deleted'}), 200
    
    except Exception as e:
        # (M) Roll back transaction on error
        db.session.rollback()
        return jsonify({'error': f'Failed to delete club: {str(e)}'}), 500

@app.route('/my-clubs', methods=['GET'])
@token_required
def get_user_clubs(current_user):
    """
    (M) Gets all of the clubs that the current user is a part of.

    This data will be used to populate all of the clubs on the user homepage/landing page,
    hence why we only return club_id, name, and is_admin.

    Returns:
        - JSON response with success/error message and status code
    """
    try:
        # (M) Query for all clubs where the user is a member
        clubs_query = db.session.query(Club, ClubUser).join(
            ClubUser, Club.Club_ID == ClubUser.Club_ID
        ).filter(ClubUser.User_ID == current_user.User_ID).all()
        
        # (M) Format the results
        clubs_list = [{
            'club_id': club.Club.Club_ID,
            'name': club.Club.Club_Name,
            'is_admin': club.ClubUser.Admin,
            'club_desc': club.Club.Club_Desc
        } for club in clubs_query]
        
        return jsonify({
            'clubs': clubs_list,
            'count': len(clubs_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/join_club', methods=['POST'])
@token_required  # (M) The user must be authenticated (logged in) in order to access this functionality (joining a club)
def join_club(current_user):  # (M) Pass in the current_user to indicate which user is currently authenticated
    """
    (M) Logged-in user can join an existing club in the database
    
    Takes a club_id to identify which club the user wants to join
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - Missing club_id, invite code field (400)
        - User already a member of the club (400)
        - Club not found (404)
        - Wrong invite code (403)
    """
    data = request.get_json()
    
    # (M) Check for required fields
    if 'invite_code' not in data:
        return jsonify({'error': 'Missing required invite_code field'}), 400
        
    # (M) Find the club by invite code
    club = Club.query.filter_by(Invite_Code=data['invite_code']).first()
    if not club:
        return jsonify({'error': 'Club not found. Invalid invite code'}), 404
    
    # (M) Check if user is already a member
    existing_member = ClubUser.query.filter_by(
        Club_ID=club.Club_ID,
        User_ID=current_user.User_ID
    ).first()
    
    if existing_member:
        return jsonify({'error': 'User is already a member of this club'}), 400
        
    try:
        new_member = ClubUser(
            Club_ID=club.Club_ID,
            User_ID=current_user.User_ID,
            Club_Member_Date_Added=datetime.now().date(),
            Admin=False  # (M) New members are not admins by default
        )
        db.session.add(new_member)
        db.session.commit()
        return jsonify({'message': 'Successfully joined club'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/leave_club', methods=['DELETE'])
@token_required  # (M) The user must be authenticated (logged in) in order to access this functionality (leaving a club)
def leave_club(current_user):

    """
    (J) Logged-in user can leave a club where they are a member
    
    Takes a club_id to identify which club the user wants to leave
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - Missing club_id (400)
        - User not a member of the club (400)
        - Club not found (404)
    """

    data = request.get_json()

    # Check for the required field
    if 'club_id' not in data:
        return jsonify({'error': 'Missing required club_id field'}), 400

    # Check if the user is a member of the club
    existing_member = ClubUser.query.filter_by(
        Club_ID=data['club_id'],
        User_ID=current_user.User_ID
    ).first()

    if not existing_member:
        return jsonify({'error': 'User is not a member of this club'}), 400

    # Check if the club exists
    club = Club.query.get(data['club_id'])
    if not club:
        return jsonify({'error': 'Club not found'}), 404

    try:
        db.session.delete(existing_member)
        db.session.commit()
        return jsonify({'message': 'Successfully left club'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/clubs/<int:club_id>', methods=['GET'])
@token_required
def get_club(current_user, club_id):
    """
    Get detailed information about a specific club
    
    Returns:
        - JSON response with club details
        
    Error conditions:
        - Club does not exist (404)
        - User is not a member of the club (403)
    """
    # (A) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
        
    # (A) Check if user is a member of the club
    is_member = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID
    ).first()
    
    if not is_member:
        return jsonify({'error': 'Permission denied. You must be a member to view club details'}), 403
    
    try:
        # (A) Get club information
        club_data = {
            'club_id': club.Club_ID,
            'name': club.Club_Name,
            'description': club.Club_Desc,
            'date_added': club.Date_Added.strftime('%Y-%m-%d'),
            'invite_code': club.Invite_Code,
            'is_admin': is_member.Admin
        }
        
        return jsonify(club_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/clubs/<int:club_id>/events', methods=['POST'])
@token_required
def create_event(current_user, club_id):
    """
    (M) Admin member can create a event for their club
    
    Takes in an event description, location, and date
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - User is not an admin of the club (403)
        - Missing required fields (400)
        - Wrong date format (400)
    """

    # (M) Check if user is an admin of the club
    is_admin = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()
    
    if not is_admin:
        return jsonify({'error': 'Permission denied. Only club admins can create events'}), 403
    
    # (M) Validate request data
    data = request.get_json()
    required_fields = ['event_desc', 'event_location', 'event_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # (M) Parse the date
    try:
        event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
            
    try:
        new_event = Event(
            Club_ID=club_id,
            Event_Desc=data['event_desc'],
            Event_Location=data['event_location'],
            Event_Date=event_date
        )
        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            'message': 'Event created successfully',
            'event_id': new_event.Event_ID,
            'event_date': new_event.Event_Date.strftime('%Y-%m-%d')
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/clubs/<int:club_id>/events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(current_user, club_id, event_id):
    """
    (C) Admin member can delete an event for their club
    
    Deletes selected event from schedule
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - User is not an admin of the club (403)
        - Event not found (404)
        - Failed to delete (500)
    """
    # (C) Check if event exists
    event = Event.query.get(event_id)
    if not event or event.Club_ID != club_id:
        return jsonify({'error': 'Event not found or does not belong to this club'}), 404

    # (C) Check if the user is an admin of the club
    is_admin = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()

    if not is_admin:
        return jsonify({'error': 'Permission denied. Only club admins can delete events'}), 403

    try:
        # (C) Delete the event
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Event successfully deleted'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete event: {str(e)}'}), 500

@app.route('/clubs/<int:club_id>/description', methods=['PUT'])
@token_required
def update_club_description(current_user, club_id):
    """
    (A) Update the description of a specific club
    
    Takes a new club description in the request data
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - Club does not exist (404)
        - User is not an admin of the club (403)
        - Missing required fields (400)
    """
    # (A) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
        
    # (A) Check if user is an admin of the club
    is_admin = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()
    
    if not is_admin:
        return jsonify({'error': 'Permission denied. Only club admins can update club description'}), 403
    
    # (A) Validate request data
    data = request.get_json()
    if not data or 'club_desc' not in data:
        return jsonify({'error': 'Missing required field: club_desc'}), 400
    
    try:
        # (A) Update club description
        club.Club_Desc = data['club_desc']
        db.session.commit()
        
        return jsonify({
            'message': 'Club description updated successfully',
            'club_id': club.Club_ID,
            'new_description': club.Club_Desc
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/clubs/<int:club_id>/invite-code', methods=['PUT'])
@token_required
def update_club_invite_code(current_user, club_id):
    """
    (A) Update the invite code of a specific club
    
    Takes a new invite code in the request data
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - Club does not exist (404)
        - User is not an admin of the club (403)
        - Missing required fields (400)
    """
    # (A) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
        
    # (A) Check if user is an admin of the club
    is_admin = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()
    
    if not is_admin:
        return jsonify({'error': 'Permission denied. Only club admins can update invite code'}), 403
    
    # (A) Validate request data
    data = request.get_json()
    if not data or 'invite_code' not in data:
        return jsonify({'error': 'Missing required field: invite_code'}), 400
    
    try:
        # (A) Update club invite code
        club.Invite_Code = data['invite_code']
        db.session.commit()
        
        return jsonify({
            'message': 'Club invite code updated successfully',
            'club_id': club.Club_ID,
            'new_invite_code': club.Invite_Code
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/clubs/<int:club_id>/events', methods=['GET'])
@token_required
def get_club_events(current_user, club_id):
    """
    (A) Get all events for a specific club
    
    Returns:
        - JSON response with list of events
        
    Error conditions:
        - Club does not exist (404)
        - User is not a member of the club (403)
    """
    # (A) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
        
    # (A) Check if user is a member of the club
    is_member = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID
    ).first()
    
    if not is_member:
        return jsonify({'error': 'Permission denied. You must be a member to view club events'}), 403
    
    try:
        # (A) Query for all events of the club
        events = Event.query.filter_by(Club_ID=club_id).all()
        
        # (A) Format the results
        events_list = [{
            'event_id': event.Event_ID,
            'description': event.Event_Desc,
            'location': event.Event_Location,
            'date': event.Event_Date.strftime('%Y-%m-%d')
        } for event in events]
        
        return jsonify({
            'events': events_list,
            'count': len(events_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/clubs/<int:club_id>/profile-picture', methods=['POST'])
@token_required
def add_club_profile_picture(current_user, club_id):
    """
    (M) Add or update a profile picture for a club.
    User must be an admin of the club.

    Takes in an uploaded image file (png, jpg, jpeg).
    
    Returns:
        - JSON response with success/error message and status code
        
    Error conditions:
        - Club doesn't exist (404)
        - User is not an admin of the club (403)
        - No image / invalid image file provided (400)
    """
    # (M) Check if club exists
    club = Club.query.get(club_id)
    if not club:
        return jsonify({'error': 'Club not found'}), 404
        
    # (M) Check if user is an admin of the club
    member = ClubUser.query.filter_by(
        Club_ID=club_id,
        User_ID=current_user.User_ID,
        Admin=True
    ).first()
    
    if not member:
        return jsonify({'error': 'Permission denied. Only club admins can update profile pictures'}), 403
    
    # (M) Check if file was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
        
    image_file = request.files['image']
    
    if image_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
        
    # (M) Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    if not ('.' in image_file.filename and image_file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
        return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg'}), 400
    
    try:
        # (M) Generate a unique filename
        filename = f"club_{club_id}_profile_{int(time.time())}.{image_file.filename.rsplit('.', 1)[1].lower()}"
        
        # (M) Define upload path (ensure this directory exists)
        upload_dir = os.path.join(app.root_path, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # (M) Save the file
        file_path = os.path.join(upload_dir, filename)
        image_file.save(file_path)
        
        # (M) Store relative path in database
        relative_path = f"/static/uploads/{filename}"
        
        # (M) Check if a profile picture already exists
        existing_profile = Image.query.filter_by(
            Club_ID=club_id,
            Profile_Pic=True
        ).first()
        
        if existing_profile:
            # (M) Update existing record
            existing_profile.Image_Link = relative_path
            existing_profile.Date_Added = datetime.now().date()
        else:
            # (M) Create new record
            new_image = Image(
                Club_ID=club_id,
                Image_Link=relative_path,
                Date_Added=datetime.now().date(),
                Profile_Pic=True
            )
            db.session.add(new_image)
            
        db.session.commit()
        
        return jsonify({
            'message': 'Profile picture updated successfully',
            'image_url': relative_path
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def drop_all_tables():
    """
    (M) Custom function to safely drop all tables, handling foreign key constraints.
    
    This function temporarily disables foreign key checks, drops all tables, and then re-enables the checks.

    !!! WARNING !!! Removes all data from database!!! Should only be used for testing purposes!!!
    """
    with db.engine.connect() as conn:
        conn.execute(db.text("SET FOREIGN_KEY_CHECKS = 0"))
        
        # (M) Drop all tables using raw SQL for maximum control
        for table in reversed(db.metadata.sorted_tables):
            conn.execute(db.text(f"DROP TABLE IF EXISTS {table.name}"))
            
        conn.execute(db.text("SET FOREIGN_KEY_CHECKS = 1"))
        conn.commit()

if __name__ == '__main__':
    # (M) Initialize database tables
    with app.app_context():
        # drop_all_tables()  # (M) !!! DANGER: Removes all data from database !!! Use with caution when testing!!!
        db.create_all()  # (M) Create fresh database tables

    # (M) Start Flask development server
    app.run(debug=True)