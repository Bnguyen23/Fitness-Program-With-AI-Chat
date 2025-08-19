from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from models import db, User, Workout, Exercise, Set, CardioSession
from sqlalchemy.exc import IntegrityError

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
workout_bp = Blueprint('workouts', __name__, url_prefix='/api/workouts')
cardio_bp = Blueprint('cardio', __name__, url_prefix='/api/cardio')

# ============== AUTH ROUTES ==============

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Username, email and password are required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already taken'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ============== WORKOUT ROUTES ==============

@workout_bp.route('', methods=['GET'])
@jwt_required()
def get_workouts():
    try:
        user_id = get_jwt_identity()
        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).all()
        
        return jsonify([workout.to_dict() for workout in workouts]), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@workout_bp.route('/<int:workout_id>', methods=['GET'])
@jwt_required()
def get_workout(workout_id):
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'message': 'Workout not found'}), 404
        
        return jsonify(workout.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@workout_bp.route('', methods=['POST'])
@jwt_required()
def create_workout():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'message': 'Workout name is required'}), 400
        
        # Create workout
        workout = Workout(
            user_id=user_id,
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(workout)
        db.session.flush()  # Get the workout ID without committing
        
        # Add exercises if provided
        if data.get('exercises'):
            for idx, exercise_data in enumerate(data['exercises']):
                exercise = Exercise(
                    workout_id=workout.id,
                    name=exercise_data['name'],
                    order=exercise_data.get('order', idx + 1),
                    notes=exercise_data.get('notes', '')
                )
                
                db.session.add(exercise)
                db.session.flush()
                
                # Add sets if provided
                if exercise_data.get('sets'):
                    for set_data in exercise_data['sets']:
                        set_obj = Set(
                            exercise_id=exercise.id,
                            set_number=set_data['setNumber'],
                            reps=set_data['reps'],
                            weight=set_data.get('weight', 0),
                            completed=set_data.get('completed', False)
                        )
                        db.session.add(set_obj)
        
        db.session.commit()
        
        return jsonify(workout.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@workout_bp.route('/<int:workout_id>', methods=['PUT'])
@jwt_required()
def update_workout(workout_id):
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'message': 'Workout not found'}), 404
        
        data = request.get_json()
        
        # Update workout fields
        if data.get('name'):
            workout.name = data['name']
        if 'description' in data:
            workout.description = data['description']
        
        workout.updated_at = datetime.utcnow()
        
        # Handle exercises update (delete existing and recreate)
        if 'exercises' in data:
            # Delete existing exercises (cascades to sets)
            Exercise.query.filter_by(workout_id=workout_id).delete()
            
            # Add new exercises
            for idx, exercise_data in enumerate(data['exercises']):
                exercise = Exercise(
                    workout_id=workout.id,
                    name=exercise_data['name'],
                    order=exercise_data.get('order', idx + 1),
                    notes=exercise_data.get('notes', '')
                )
                
                db.session.add(exercise)
                db.session.flush()
                
                # Add sets
                if exercise_data.get('sets'):
                    for set_data in exercise_data['sets']:
                        set_obj = Set(
                            exercise_id=exercise.id,
                            set_number=set_data['setNumber'],
                            reps=set_data['reps'],
                            weight=set_data.get('weight', 0),
                            completed=set_data.get('completed', False)
                        )
                        db.session.add(set_obj)
        
        db.session.commit()
        
        return jsonify(workout.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@workout_bp.route('/<int:workout_id>', methods=['DELETE'])
@jwt_required()
def delete_workout(workout_id):
    try:
        user_id = get_jwt_identity()
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'message': 'Workout not found'}), 404
        
        db.session.delete(workout)
        db.session.commit()
        
        return jsonify({'message': 'Workout deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# ============== CARDIO ROUTES ==============

@cardio_bp.route('', methods=['GET'])
@jwt_required()
def get_cardio_sessions():
    try:
        user_id = get_jwt_identity()
        sessions = CardioSession.query.filter_by(user_id=user_id).order_by(CardioSession.date.desc()).all()
        
        return jsonify([session.to_dict() for session in sessions]), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@cardio_bp.route('', methods=['POST'])
@jwt_required()
def create_cardio_session():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('date') or not data.get('activity_type') or not data.get('duration_minutes'):
            return jsonify({'message': 'Date, activity type, and duration are required'}), 400
        
        # Parse date
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # Create cardio session
        session = CardioSession(
            user_id=user_id,
            date=date_obj,
            activity_type=data['activity_type'],
            duration_minutes=data['duration_minutes'],
            distance=data.get('distance'),
            distance_unit=data.get('distance_unit', 'km'),
            calories_burned=data.get('calories_burned'),
            avg_heart_rate=data.get('avg_heart_rate'),
            notes=data.get('notes', '')
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify(session.to_dict()), 201
        
    except ValueError as e:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@cardio_bp.route('/<int:session_id>', methods=['DELETE'])
@jwt_required()
def delete_cardio_session(session_id):
    try:
        user_id = get_jwt_identity()
        session = CardioSession.query.filter_by(id=session_id, user_id=user_id).first()
        
        if not session:
            return jsonify({'message': 'Cardio session not found'}), 404
        
        db.session.delete(session)
        db.session.commit()
        
        return jsonify({'message': 'Cardio session deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500