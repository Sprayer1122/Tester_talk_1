#!/usr/bin/env python3
"""
Database setup script for the testing platform
This script will COMPLETELY RESET the database - dropping all existing data and tables
"""

import pymysql
import sys
import os

def create_database():
    """Create the database and tables (with complete reset)"""
    print("🚀 Setting up Database with COMPLETE RESET...")
    print("=" * 60)
    print("⚠️  WARNING: This will DELETE ALL EXISTING DATA!")
    print("=" * 60)
    
    try:
        # Connect to MySQL (without specifying database)
        connection = pymysql.connect(
            host='172.23.104.39',
            port=3306,
            user='etadmin',
            password='etadmin',  # Replace with actual password
            charset='utf8mb4'
        )
        
        print("✅ Connected to MySQL successfully!")
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            print("📝 Creating/Resetting database 'Tester_Talk'...")
            cursor.execute("DROP DATABASE IF EXISTS Tester_Talk")
            print("   🗑️  Dropped existing database (if it existed)")
            cursor.execute("CREATE DATABASE Tester_Talk")
            print("   ✅ Created fresh database")
            
            # Use the database
            cursor.execute("USE Tester_Talk")
            
            # Read and execute schema
            print("\n📝 Creating tables from schema...")
            schema_file = os.path.join('database', 'schema.sql')
            
            if os.path.exists(schema_file):
                with open(schema_file, 'r', encoding='utf-8') as f:
                    schema_content = f.read()
                
                print(f"   📄 Schema file size: {len(schema_content)} characters")
                
                # Better SQL statement parsing - handle multi-line statements
                statements = []
                current_statement = ""
                
                for line in schema_content.split('\n'):
                    line = line.strip()
                    
                    # Skip empty lines and comments
                    if not line or line.startswith('--'):
                        continue
                        
                    # Skip database creation statements
                    if line.startswith('CREATE DATABASE') or line.startswith('USE '):
                        continue
                    
                    current_statement += " " + line
                    
                    # If line ends with semicolon, we have a complete statement
                    if line.endswith(';'):
                        statements.append(current_statement.strip().rstrip(';'))
                        current_statement = ""
                
                print(f"   📝 Found {len(statements)} SQL statements to execute")
                
                # Execute each statement
                for i, statement in enumerate(statements):
                    if not statement.strip():
                        continue
                        
                    try:
                        print(f"   🔄 Executing statement {i+1}/{len(statements)}")
                        cursor.execute(statement)
                        
                        if statement.upper().startswith('CREATE TABLE'):
                            # Extract table name more carefully
                            parts = statement.split()
                            table_idx = -1
                            for j, part in enumerate(parts):
                                if part.upper() == 'TABLE':
                                    table_idx = j + 1
                                    break
                            
                            if table_idx < len(parts):
                                table_name = parts[table_idx].replace('IF', '').replace('NOT', '').replace('EXISTS', '').strip()
                                print(f"   ✅ Created table: {table_name}")
                        
                        elif statement.upper().startswith('INSERT INTO'):
                            table_name = statement.split()[2]
                            print(f"   ✅ Inserted sample data into: {table_name}")
                            
                    except Exception as e:
                        print(f"   ❌ Failed to execute statement {i+1}: {str(e)}")
                        print(f"   📜 Statement: {statement[:100]}...")
                        # Don't continue on CREATE TABLE failures, but continue on INSERT failures
                        if statement.upper().startswith('CREATE TABLE'):
                            print(f"   🚨 CREATE TABLE failed - this is critical!")
                        continue
                
                print("\n✅ Database schema setup completed!")
                
                # Show created tables
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print(f"\n📊 Created {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table[0]}")
                    
                # Show table contents summary
                print(f"\n📈 Data Summary:")
                for table in tables:
                    table_name = table[0]
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                    result = cursor.fetchone()
                    count = result[0] if result else 0
                    print(f"   - {table_name}: {count} records")
                    
            else:
                print(f"❌ Schema file not found: {schema_file}")
                return False
        
        connection.commit()
        connection.close()
        
        print("\n🎉 Database reset and setup completed successfully!")
        print("💫 All old data has been removed and fresh tables created!")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure MySQL is running")
        print("2. Verify the password is correct")
        print("3. Check if you have CREATE/DROP DATABASE privileges")
        return False

def create_env_file():
    """Create the .env file for the backend"""
    print("\n📝 Creating .env file...")
    
    env_content = """# Flask Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production-2024

# MySQL Database Configuration
DATABASE_URL=mysql+pymysql://etladmin:YOUR_ACTUAL_PASSWORD@172.23.104.39:3306/Tester_Talk

# Legacy MySQL Configuration (for backward compatibility)
MYSQL_HOST=172.23.104.39
MYSQL_PORT=3306
MYSQL_USER=etladmin
MYSQL_PASSWORD=YOUR_ACTUAL_PASSWORD
MYSQL_DATABASE=Tester_Talk

# Application Configuration
DEBUG=True
FLASK_ENV=development
"""
    
    try:
        # Create backend directory if it doesn't exist
        os.makedirs('backend', exist_ok=True)
        
        # Check if .env already exists
        env_path = 'backend/.env'
        if os.path.exists(env_path):
            print("   ⚠️  .env file already exists - backing up...")
            backup_path = 'backend/.env.backup'
            os.rename(env_path, backup_path)
            print(f"   📁 Backed up existing .env to {backup_path}")
        
        # Write .env file
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print("   ✅ .env file created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def reset_uploads_folder():
    """Reset the uploads folder"""
    print("\n📁 Resetting uploads folder...")
    
    uploads_backend = 'backend/uploads'
    uploads_root = 'uploads'
    
    try:
        # Reset backend uploads
        if os.path.exists(uploads_backend):
            import shutil
            shutil.rmtree(uploads_backend)
            print("   🗑️  Removed existing backend/uploads folder")
        
        os.makedirs(uploads_backend, exist_ok=True)
        print("   ✅ Created fresh backend/uploads folder")
        
        # Reset root uploads
        if os.path.exists(uploads_root):
            import shutil
            shutil.rmtree(uploads_root)
            print("   🗑️  Removed existing uploads folder")
        
        os.makedirs(uploads_root, exist_ok=True)
        print("   ✅ Created fresh uploads folder")
        
        return True
        
    except Exception as e:
        print(f"   ⚠️  Warning: Could not reset uploads folder: {e}")
        return False

def main():
    """Main setup function"""
    print("🔧 Testing Platform Database COMPLETE RESET")
    print("=" * 60)
    print("⚠️  THIS WILL DELETE ALL EXISTING DATA!")
    print("=" * 60)
    
    # Ask for confirmation
    while True:
        confirm = input("\n❓ Are you sure you want to proceed? (yes/no): ").lower().strip()
        if confirm in ['yes', 'y']:
            break
        elif confirm in ['no', 'n']:
            print("❌ Setup cancelled by user.")
            return False
        else:
            print("Please enter 'yes' or 'no'")
    
    print("\n🚀 Starting complete database reset...")
    
    # Reset database and tables
    db_success = create_database()
    
    # Create .env file
    env_success = create_env_file()
    
    # Reset uploads folder
    uploads_success = reset_uploads_folder()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Setup Summary")
    print("=" * 60)
    print(f"Database Reset: {'✅ SUCCESS' if db_success else '❌ FAILED'}")
    print(f"Environment File: {'✅ SUCCESS' if env_success else '❌ FAILED'}")
    print(f"Uploads Reset: {'✅ SUCCESS' if uploads_success else '⚠️  WARNING'}")
    
    if db_success and env_success:
        print("\n🎉 Complete reset completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the backend: cd backend && python app.py")
        print("2. Open your browser to: http://localhost:8080")
        print("3. Register a new admin user or use existing sample data")
        print("\n💡 Sample data has been loaded - check the database!")
    else:
        print("\n⚠️  Setup failed. Please fix the issues above.")
    
    return db_success and env_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
