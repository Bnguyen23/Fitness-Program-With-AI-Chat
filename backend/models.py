from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workouts = db.relationship('Workout', backref='user', lazy=True, cascade='all, delete-orphan')
    cardio_sessions = db.relationship('CardioSession', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Workout(db.Model):
    __tablename__ = 'workouts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    exercises = db.relationship('Exercise', backref='workout', lazy=True, cascade='all, delete-orphan', order_by='Exercise.order')
    
    def to_dict(self, include_exercises=True):
        data = {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'description': self.description,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_exercises and self.exercises:
            data['exercises'] = [exercise.to_dict() for exercise in self.exercises]
        else:
            data['exercises'] = []
        
        return data

class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    order = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sets = db.relationship('Set', backref='exercise', lazy=True, cascade='all, delete-orphan', order_by='Set.set_number')
    
    def to_dict(self, include_sets=True):
        data = {
            'id': self.id,
            'workoutId': self.workout_id,
            'name': self.name,
            'order': self.order,
            'notes': self.notes
        }
        
        if include_sets and self.sets:
            data['sets'] = [set_obj.to_dict() for set_obj in self.sets]
        else:
            data['sets'] = []
        
        return data

class Set(db.Model):
    __tablename__ = 'sets'
    
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float)
    completed = db.Column(db.Boolean, default=False)
    rest_seconds = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exerciseId': self.exercise_id,
            'setNumber': self.set_number,
            'reps': self.reps,
            'weight': self.weight,
            'completed': self.completed,
            'restSeconds': self.rest_seconds,
            'notes': self.notes
        }

class CardioSession(db.Model):
    __tablename__ = 'cardio_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # running, cycling, swimming, etc.
    duration_minutes = db.Column(db.Integer, nullable=False)
    distance = db.Column(db.Float)
    distance_unit = db.Column(db.String(10), default='km')  # km or miles
    calories_burned = db.Column(db.Integer)
    avg_heart_rate = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'activityType': self.activity_type,
            'durationMinutes': self.duration_minutes,
            'distance': self.distance,
            'distanceUnit': self.distance_unit,
            'caloriesBurned': self.calories_burned,
            'avgHeartRate': self.avg_heart_rate,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }