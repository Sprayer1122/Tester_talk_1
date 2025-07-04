#!/usr/bin/env python3
"""
Setup script for Internal Stack Overflow Platform
Automates the installation and configuration process
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_node_version():
    """Check if Node.js is installed"""
    result = run_command("node --version")
    if result:
        print(f"✅ Node.js {result} detected")
        return True
    else:
        print("❌ Node.js is not installed. Please install Node.js 16+")
        return False

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print("\n📦 Installing backend dependencies...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Create virtual environment
    if not Path("backend/venv").exists():
        print("Creating virtual environment...")
        run_command("python -m venv venv", cwd="backend")
    
    # Install dependencies
    pip_cmd = "venv\\Scripts\\pip" if platform.system() == "Windows" else "venv/bin/pip"
    result = run_command(f"{pip_cmd} install -r requirements.txt", cwd="backend")
    
    if result:
        print("✅ Backend dependencies installed successfully")
        return True
    else:
        print("❌ Failed to install backend dependencies")
        return False

def install_frontend_dependencies():
    """Install Node.js frontend dependencies"""
    print("\n📦 Installing frontend dependencies...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    result = run_command("npm install", cwd="frontend")
    
    if result:
        print("✅ Frontend dependencies installed successfully")
        return True
    else:
        print("❌ Failed to install frontend dependencies")
        return False

def create_env_file():
    """Create .env file with default configuration"""
    env_content = """# Backend Configuration
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=mysql+pymysql://root:password@localhost/testing_platform

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
"""
    
    env_file = Path("backend/.env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
    else:
        print("ℹ️  .env file already exists")

def setup_database():
    """Setup MySQL database"""
    print("\n🗄️  Setting up database...")
    
    schema_file = Path("database/schema.sql")
    if not schema_file.exists():
        print("❌ Database schema file not found")
        return False
    
    print("Please run the following command to setup the database:")
    print(f"mysql -u root -p < {schema_file}")
    print("\nOr if you have a different MySQL user:")
    print(f"mysql -u your_username -p < {schema_file}")
    
    return True

def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "="*60)
    print("🎉 Setup completed successfully!")
    print("="*60)
    print("\nNext steps:")
    print("\n1. Database Setup:")
    print("   - Install MySQL 8.0+ if not already installed")
    print("   - Run: mysql -u root -p < database/schema.sql")
    print("\n2. Start the Backend:")
    print("   cd backend")
    if platform.system() == "Windows":
        print("   venv\\Scripts\\python app.py")
    else:
        print("   venv/bin/python app.py")
    print("\n3. Start the Frontend:")
    print("   cd frontend")
    print("   npm start")
    print("\n4. Access the Application:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend API: http://localhost:5000")
    print("\n" + "="*60)

def main():
    """Main setup function"""
    print("🚀 Internal Stack Overflow Platform Setup")
    print("="*50)
    
    # Check prerequisites
    if not check_python_version():
        return
    
    if not check_node_version():
        return
    
    # Install dependencies
    if not install_backend_dependencies():
        return
    
    if not install_frontend_dependencies():
        return
    
    # Create environment file
    create_env_file()
    
    # Setup database
    setup_database()
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    main() 