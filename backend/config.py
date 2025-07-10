import os

class Config:
    Debug = True
    SECRET_KEY= ''
    
    #Database configuration
    DATABASE_URL = ''

    #OpenAI Key
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
