# Configuration Guide

## Your Specific Configuration

Based on your provided credentials, here's how to configure the application:

## 1. Create the .env File

Create a file named `.env` in the `backend/` directory with the following content:

```env
# Backend Configuration
SECRET_KEY=dev-secret-key-change-in-production

# MySQL Configuration
DATABASE_URL=mysql+pymysql://root:Sprayer#1122@127.0.0.1:3306/testing_platform

# Elasticsearch Cloud Configuration
ELASTICSEARCH_URL=https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443
ELASTICSEARCH_API_KEY=WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Flask Configuration
FLASK_ENV=development
DEBUG=True
```

## 2. Quick Setup Commands

### Create the .env file:
```bash
cd backend
cat > .env << 'EOF'
# Backend Configuration
SECRET_KEY=dev-secret-key-change-in-production

# MySQL Configuration
DATABASE_URL=mysql+pymysql://root:Sprayer#1122@127.0.0.1:3306/testing_platform

# Elasticsearch Cloud Configuration
ELASTICSEARCH_URL=https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443
ELASTICSEARCH_API_KEY=WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Flask Configuration
FLASK_ENV=development
DEBUG=True
EOF
```

### Create uploads directory:
```bash
mkdir -p backend/uploads
```

## 3. Database Setup

### Create the database:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS testing_platform;"
```

### Import the schema:
```bash
mysql -u root -p testing_platform < database/schema.sql
```

**Note:** When prompted for password, enter: `Sprayer#1122`

## 4. Test Your Configuration

### Test MySQL Connection:
```bash
mysql -u root -p -e "USE testing_platform; SHOW TABLES;"
```

### Test Elasticsearch Connection:
```bash
curl -H "Authorization: ApiKey WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==" \
     "https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443"
```

## 5. Start the Application

### Start Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

### Start Frontend:
```bash
cd frontend
npm install
npm start
```

## 6. Configuration Details

### MySQL Configuration:
- **Host**: 127.0.0.1 (localhost)
- **Port**: 3306 (default MySQL port)
- **Username**: root
- **Password**: Sprayer#1122
- **Database**: testing_platform

### Elasticsearch Configuration:
- **URL**: https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443
- **Authentication**: API Key
- **API Key**: WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==
- **SSL**: Enabled (verify_certs=True)

## 7. Troubleshooting

### MySQL Issues:
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1;"

# If connection fails, try:
mysql -u root -p -h 127.0.0.1 -P 3306 -e "SELECT 1;"
```

### Elasticsearch Issues:
```bash
# Test Elasticsearch connection
curl -H "Authorization: ApiKey WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==" \
     "https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443/_cluster/health"

# Check if the API key is valid
curl -H "Authorization: ApiKey WTZSdnRwY0JVU1R5d3ZRM1drd2I6S2lLMUJUR0Q3Tm1UWWhGc0xBNEtDZw==" \
     "https://cd7f32447b724562b48b4eb2a392db13.us-central1.gcp.cloud.es.io:443/_security/_authenticate"
```

### Common Error Messages:

1. **MySQL Connection Error**:
   ```
   Error: (2003, "Can't connect to MySQL server on '127.0.0.1'")
   ```
   - Check if MySQL is running
   - Verify the password is correct
   - Check if the port 3306 is accessible

2. **Elasticsearch Connection Error**:
   ```
   Error: ConnectionError(HTTPSConnectionPool...)
   ```
   - Check if the API key is valid
   - Verify the URL is correct
   - Check network connectivity

3. **Database Not Found**:
   ```
   Error: (1049, "Unknown database 'testing_platform'")
   ```
   - Run the database creation command
   - Import the schema file

## 8. Security Notes

### For Production:
1. **Change the SECRET_KEY** to a secure random string
2. **Use environment variables** instead of hardcoded values
3. **Enable SSL** for MySQL connections
4. **Restrict database user permissions**
5. **Use a dedicated Elasticsearch user** instead of API key

### Generate a Secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 9. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key for security | `dev-secret-key-change-in-production` |
| `DATABASE_URL` | MySQL connection string | `mysql+pymysql://user:pass@host:port/db` |
| `ELASTICSEARCH_URL` | Elasticsearch cloud URL | `https://your-cluster.cloud.es.io:443` |
| `ELASTICSEARCH_API_KEY` | Elasticsearch API key | `your-api-key-here` |
| `UPLOAD_FOLDER` | File upload directory | `uploads` |
| `MAX_CONTENT_LENGTH` | Max file upload size (bytes) | `16777216` (16MB) |

## 10. Next Steps

After configuration:

1. **Test the application** by creating a test issue
2. **Verify search functionality** works with Elasticsearch
3. **Check file uploads** work correctly
4. **Monitor logs** for any connection issues
5. **Customize the application** for your team's needs

The application should now be fully configured with your MySQL and Elasticsearch cloud instances! 