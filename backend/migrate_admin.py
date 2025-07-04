import pymysql

# Database connection - using the same credentials as app.py
DB_HOST = '127.0.0.1'
DB_USER = 'root'
DB_PASSWORD = 'Sprayer#1122'
DB_NAME = 'testing_platform'

def run_migration():
    try:
        # Connect to database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            print("Running migration to add users table...")
            
            # Check if users table exists
            cursor.execute("SHOW TABLES LIKE 'users'")
            if cursor.fetchone():
                print("Users table already exists")
            else:
                # Create users table
                cursor.execute("""
                    CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(80) UNIQUE NOT NULL,
                        email VARCHAR(120) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role ENUM('admin', 'user') DEFAULT 'user',
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        last_login DATETIME
                    )
                """)
                print("Created users table")
            
            # Check if admin user exists
            cursor.execute("SELECT * FROM users WHERE username = 'admin'")
            if cursor.fetchone():
                print("Admin user already exists")
            else:
                # Create admin user (password: admin123)
                from werkzeug.security import generate_password_hash
                admin_password_hash = generate_password_hash('admin123')
                
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, role, is_active)
                    VALUES ('admin', 'admin@example.com', %s, 'admin', TRUE)
                """, (admin_password_hash,))
                print("Created admin user (username: admin, password: admin123)")
            
            # Commit changes
            connection.commit()
            print("Migration completed successfully!")
            
            # Show table structure
            print("\nUsers table structure:")
            cursor.execute("DESCRIBE users")
            for row in cursor.fetchall():
                print(f"  {row['Field']} - {row['Type']}")
                
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    run_migration() 