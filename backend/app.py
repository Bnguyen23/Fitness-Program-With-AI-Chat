from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_migrate import Migrate
from openai import OpenAI
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# PostgreSQL Database configuration
# Format: postgresql://username:password@host:port/database_name
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:password@localhost:5432/fitness_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_BINDS'] = {}  # Fixes SQLAlchemy error

# OpenAI setup for fitness coaching
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key:
    client = OpenAI(api_key=openai_api_key)
    print("AI Coach ready")
else:
    client = None
    print("AI features disabled - no API key found")

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# CORS setup for Angular frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Import models after db initialization
from models import User, Workout, Exercise, Set, CardioSession

# Import and register blueprints
from routes import auth_bp, workout_bp, cardio_bp
app.register_blueprint(auth_bp)
app.register_blueprint(workout_bp)
app.register_blueprint(cardio_bp)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'database': 'PostgreSQL'}), 200

# Root endpoint
@app.route('/')
def index():
    return jsonify({
        'message': 'Fitness Tracker API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/*',
            'workouts': '/api/workouts/*',
            'cardio': '/api/cardio/*',
            'chat': '/api/chat' if client else 'AI disabled'
        }
    }), 200

# AI Fitness Coach endpoint
@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat_with_ai():
    if not client:
        return jsonify({'error': 'AI coach unavailable. Configure API key.'}), 503
    
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Fitness coach personality
        system_prompt = """You're an experienced fitness coach. 
        Help with workouts, nutrition, and motivation. 
        Keep advice practical and safe."""
        
        # Get AI response
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        return jsonify({'response': ai_response}), 200
        
    except Exception as e:
        print(f"AI error: {str(e)}")
        return jsonify({'error': 'Failed to get response'}), 500

# Database initialization
with app.app_context():
    try:
        db.create_all()
        print("Database ready")
    except Exception as e:
        print(f"Database error: {e}")
        print("Make sure PostgreSQL is running and database exists")

if __name__ == '__main__':
    print("🚀 Starting backend on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)