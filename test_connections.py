#!/usr/bin/env python3
"""
Test script to verify MySQL and Elasticsearch connections
"""

import sys
import os
import pymysql

def test_mysql_connection():
    """Test MySQL connection"""
    print("🔍 Testing MySQL Connection...")
    try:
        # MySQL connection parameters
        host = '127.0.0.1'
        port = 3306
        user = 'root'
        password = 'Sprayer#1122'
        database = 'testing_platform'
        
        # Test connection
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        
        print("✅ MySQL connection successful!")
        
        # Test if database exists
        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES LIKE 'testing_platform'")
            result = cursor.fetchone()
            
            if result:
                print("✅ Database 'testing_platform' exists")
                
                # Test database access
                cursor.execute("USE testing_platform")
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                
                if tables:
                    print(f"✅ Found {len(tables)} tables in database")
                    for table in tables:
                        print(f"   - {table[0]}")
                else:
                    print("⚠️  No tables found in database")
            else:
                print("⚠️  Database 'testing_platform' does not exist")
                print("   Run: mysql -u root -p -e \"CREATE DATABASE testing_platform;\"")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ MySQL connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure MySQL is running")
        print("2. Verify the password is correct")
        print("3. Check if MySQL is accessible on 127.0.0.1:3306")
        return False

def main():
    """Main test function"""
    print("🚀 Testing Database Connections")
    print("=" * 50)
    
    # Test MySQL
    mysql_success = test_mysql_connection()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Connection Test Summary")
    print("=" * 50)
    print(f"MySQL: {'✅ SUCCESS' if mysql_success else '❌ FAILED'}")
    
    if mysql_success:
        print("\n🎉 All connections successful! You can now run the application.")
        print("\nNext steps:")
        print("1. Create the .env file in backend/ directory")
        print("2. Run: cd backend && python app.py")
        print("3. Run: cd frontend && npm start")
    else:
        print("\n⚠️  Some connections failed. Please fix the issues above before running the application.")
    
    return mysql_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 