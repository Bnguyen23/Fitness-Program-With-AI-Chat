from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from app import db


# TODO: work on the relationships for each model

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column((db.String), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return{
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }
    
class WorkoutProgram(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.name,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }
    
class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('workout_program.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    muscle_group = db.Column(db.String(50))
    equipment = db.Column(db.String(50))
    instructions = db.Column(db.Text)
    target_sets = db.Column(db.Integer)
    target_reps = db.Column(db.String(20))
        
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'muscle_group': self.muscle_group,
            'equipment': self.equipment,
            'instructions': self.instructions,
            'target_sets': self.target_sets,
            'target_reps': self.target_reps
        }
    
class Set(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_session.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
    set_number = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float)
    rest_seconds = db.Column(db.Integer)
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'exercise_id': self.exercise_id,
            'exercise_name': self.exercise.name if self.exercise else None,
            'set_number': self.set_number,
            'reps': self.reps,
            'weight': self.weight,
            'rest_seconds': self.rest_seconds,
            'notes': self.notes
        }
    
class CardioSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # running, cycling, swimming, etc.
    duration_minutes = db.Column(db.Integer, nullable=False)
    distance = db.Column(db.Float)  # might need to fix this
    calories_burned = db.Column(db.Integer)
    avg_heart_rate = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'activity_type': self.activity_type,
            'duration_minutes': self.duration_minutes,
            'distance': self.distance,
            'calories_burned': self.calories_burned,
            'avg_heart_rate': self.avg_heart_rate,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }