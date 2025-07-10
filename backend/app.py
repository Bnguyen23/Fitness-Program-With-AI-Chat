from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
# from flask_jwt_extended import JWTManger, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from openai import OpenAI
import os
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initalize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

#OpenAI configuration for AI chatbox
open.api.key = os.getenv('OPENAI_API_KEY')

# Import models

from models import User, WorkoutProgram, Exercise, Set, CardioSession

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)