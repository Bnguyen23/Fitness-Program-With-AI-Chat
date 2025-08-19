import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Debug mode
    DEBUG = True
    
    # Secret keys from environment
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # PostgreSQL database config
    DATABASE_URL = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:password@localhost:5432/fitness_db'
    )
    
    # OpenAI API key from environment
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = 604800  # 7 days in seconds