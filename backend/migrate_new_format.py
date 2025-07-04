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
            print("Running migration to update issues table to new format...")
            
            # Check if new columns already exist
            cursor.execute("SHOW COLUMNS FROM issues LIKE 'reviewer_name'")
            if cursor.fetchone():
                print("New format columns already exist")
            else:
                # Add new columns
                print("Adding new columns to issues table...")
                
                # Add reviewer_name column
                cursor.execute("ALTER TABLE issues ADD COLUMN reviewer_name VARCHAR(100) NOT NULL DEFAULT 'Unknown'")
                print("Added reviewer_name column")
                
                # Add review_date column
                cursor.execute("ALTER TABLE issues ADD COLUMN review_date DATE NOT NULL DEFAULT '2025-01-01'")
                print("Added review_date column")
                
                # Add testcase_title column
                cursor.execute("ALTER TABLE issues ADD COLUMN testcase_title VARCHAR(500) NOT NULL DEFAULT 'Untitled Test Case'")
                print("Added testcase_title column")
                
                # Add testcase_path column
                cursor.execute("ALTER TABLE issues ADD COLUMN testcase_path VARCHAR(200) NOT NULL DEFAULT '/'")
                print("Added testcase_path column")
                
                # Add severity column
                cursor.execute("ALTER TABLE issues ADD COLUMN severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium'")
                print("Added severity column")
                
                # Add test_case_ids column
                cursor.execute("ALTER TABLE issues ADD COLUMN test_case_ids VARCHAR(200) NOT NULL DEFAULT 'TC-0000'")
                print("Added test_case_ids column")
                
                # Add additional_comments column
                cursor.execute("ALTER TABLE issues ADD COLUMN additional_comments TEXT")
                print("Added additional_comments column")
                
                # Add reporter_name column
                cursor.execute("ALTER TABLE issues ADD COLUMN reporter_name VARCHAR(100) NOT NULL DEFAULT 'Unknown'")
                print("Added reporter_name column")
                
                # Update status enum to include new statuses
                cursor.execute("ALTER TABLE issues MODIFY COLUMN status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open'")
                print("Updated status enum")
                
                # Migrate existing data
                print("Migrating existing data...")
                cursor.execute("""
                    UPDATE issues SET 
                        reviewer_name = commenter_name,
                        review_date = DATE(created_at),
                        testcase_title = title,
                        testcase_path = '/legacy',
                        severity = 'Medium',
                        test_case_ids = COALESCE(test_case_id, 'TC-LEGACY'),
                        additional_comments = '',
                        reporter_name = commenter_name
                    WHERE reviewer_name = 'Unknown'
                """)
                print("Migrated existing data")
                
                # Drop old columns
                print("Dropping old columns...")
                cursor.execute("ALTER TABLE issues DROP COLUMN title")
                cursor.execute("ALTER TABLE issues DROP COLUMN commenter_name")
                cursor.execute("ALTER TABLE issues DROP COLUMN test_case_id")
                print("Dropped old columns")
            
            # Commit changes
            connection.commit()
            print("Migration completed successfully!")
            
            # Show table structure
            print("\nIssues table structure:")
            cursor.execute("DESCRIBE issues")
            for row in cursor.fetchall():
                print(f"  {row['Field']} - {row['Type']}")
                
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    run_migration() 