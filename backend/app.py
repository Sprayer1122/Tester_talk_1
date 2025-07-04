from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))

# Initialize Flask app
app = Flask(
    __name__,
    static_folder=os.path.join(FRONTEND_DIR, 'static'),
    template_folder=FRONTEND_DIR
)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL', 
    'mysql+pymysql://root:Sprayer#1122@127.0.0.1:3306/testing_platform'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)

# Configure CORS to support credentials
CORS(app, 
     origins=['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Frontend route handlers
@app.route('/issues/<int:issue_id>')
def serve_issue_detail(issue_id):
    return send_from_directory(app.template_folder, 'detail.html')

@app.route('/create.html')
def serve_create_page():
    return send_from_directory(app.template_folder, 'create.html')

@app.route('/login.html')
def serve_login_page():
    return send_from_directory(app.template_folder, 'login.html')

@app.route('/register.html')
def serve_register_page():
    return send_from_directory(app.template_folder, 'register.html')

@app.route('/admin.html')
def serve_admin_page():
    return send_from_directory(app.template_folder, 'admin.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api/') or path.startswith('static/'):
        return app.send_static_file(path)
    return send_from_directory(app.template_folder, 'index.html')

# Import routes after db initialization
from routes import *

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8080, use_reloader=False)