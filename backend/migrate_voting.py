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
            print("Running migration to add voting columns...")
            
            # Check if columns already exist
            cursor.execute("SHOW COLUMNS FROM issues LIKE 'upvotes'")
            if cursor.fetchone():
                print("Voting columns already exist in issues table")
            else:
                # Add upvotes and downvotes columns to issues table
                cursor.execute("ALTER TABLE issues ADD COLUMN upvotes INT DEFAULT 0")
                cursor.execute("ALTER TABLE issues ADD COLUMN downvotes INT DEFAULT 0")
                print("Added voting columns to issues table")
            
            cursor.execute("SHOW COLUMNS FROM comments LIKE 'upvotes'")
            if cursor.fetchone():
                print("Voting columns already exist in comments table")
            else:
                # Add upvotes and downvotes columns to comments table
                cursor.execute("ALTER TABLE comments ADD COLUMN upvotes INT DEFAULT 0")
                cursor.execute("ALTER TABLE comments ADD COLUMN downvotes INT DEFAULT 0")
                print("Added voting columns to comments table")
            
            # Commit changes
            connection.commit()
            print("Migration completed successfully!")
            
            # Show table structure
            print("\nIssues table structure:")
            cursor.execute("DESCRIBE issues")
            for row in cursor.fetchall():
                print(f"  {row['Field']} - {row['Type']}")
            
            print("\nComments table structure:")
            cursor.execute("DESCRIBE comments")
            for row in cursor.fetchall():
                print(f"  {row['Field']} - {row['Type']}")
                
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    run_migration() 