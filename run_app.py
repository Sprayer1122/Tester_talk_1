#!/usr/bin/env python3
"""
Simple script to run the Tester Talk application
"""

import os
import sys

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Change to backend directory
os.chdir(backend_dir)

# Import and run the app
from app import app

if __name__ == '__main__':
    print("🚀 Starting Tester Talk application...")
    print("📱 Frontend will be available at: http://localhost:8080")
    print("🔧 Backend API will be available at: http://localhost:8080/api/")
    print("📊 Admin panel will be available at: http://localhost:8080/admin.html")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=8080, use_reloader=False) 