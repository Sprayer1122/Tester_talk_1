# Development Guide

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Elasticsearch 7.x+

### Automated Setup
```bash
# Run the setup script
python setup.py
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
venv\Scripts\pip install -r requirements.txt

# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

#### 3. Database Setup
```bash
# Create database and tables
mysql -u root -p < database/schema.sql
```

#### 4. Environment Configuration
Create `backend/.env`:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=mysql+pymysql://username:password@localhost/testing_platform
ELASTICSEARCH_URL=http://localhost:9200
```

#### 5. Start Services
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\python app.py  # Windows
venv/bin/python app.py      # macOS/Linux

# Terminal 2 - Frontend
cd frontend
npm start
```

## Architecture Overview

### Backend Architecture (Flask)

```
backend/
├── app.py              # Main Flask application
├── models.py           # SQLAlchemy database models
├── routes.py           # API endpoints
├── search.py           # Elasticsearch integration
└── requirements.txt    # Python dependencies
```

**Key Components:**
- **Flask App**: Main application with CORS support
- **SQLAlchemy Models**: Database ORM for issues, comments, tags, attachments
- **REST API**: CRUD operations for all entities
- **Elasticsearch**: Full-text search and indexing
- **File Upload**: Local file storage with metadata tracking

### Frontend Architecture (React)

```
frontend/src/
├── components/         # Reusable UI components
│   ├── Header.js      # Navigation and search
│   ├── IssueCard.js   # Issue list item
│   └── CommentCard.js # Comment display
├── pages/             # Page components
│   ├── IssueList.js   # Main issues view
│   ├── IssueDetail.js # Single issue view
│   ├── CreateIssue.js # New issue form
│   └── SearchResults.js # Search interface
├── services/          # API integration
│   └── api.js         # HTTP client and endpoints
└── utils/             # Helper functions
```

**Key Features:**
- **Responsive Design**: Tailwind CSS for styling
- **Component Architecture**: Reusable, modular components
- **State Management**: React hooks for local state
- **API Integration**: Axios for HTTP requests
- **Markdown Support**: Rich text rendering

### Database Schema

```sql
-- Core tables
issues (id, title, description, test_case_id, commenter_name, status, created_at)
comments (id, issue_id, commenter_name, content, is_verified_solution, created_at)
tags (id, name)
issue_tags (issue_id, tag_id)  -- Many-to-many relationship
attachments (id, issue_id, comment_id, filename, file_path, uploaded_by)
```

**Relationships:**
- Issues have many Comments (one-to-many)
- Issues have many Tags (many-to-many)
- Issues and Comments have many Attachments (one-to-many)

## API Endpoints

### Issues
- `GET /api/issues` - List issues with pagination and filters
- `POST /api/issues` - Create new issue with file uploads
- `GET /api/issues/{id}` - Get single issue with comments
- `PUT /api/issues/{id}` - Update issue

### Comments
- `GET /api/issues/{id}/comments` - Get comments for issue
- `POST /api/issues/{id}/comments` - Add comment with file uploads
- `PUT /api/issues/{id}/comments/{comment_id}/verify` - Mark solution as verified

### Search
- `GET /api/search` - Full-text search with filters
- `GET /api/tags` - Get all available tags

### Files
- `GET /api/attachments/{id}` - Download file attachment

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
# Commit changes
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Testing

#### Backend Testing
```bash
cd backend
python -m pytest tests/
```

#### Frontend Testing
```bash
cd frontend
npm test
```

#### API Testing
```bash
# Using curl
curl -X GET http://localhost:5000/api/issues
curl -X POST http://localhost:5000/api/issues \
  -F "title=Test Issue" \
  -F "description=Test Description" \
  -F "commenter_name=Test User"
```

### 3. Database Migrations

For schema changes:
```sql
-- Create migration file
-- Update models.py
-- Test locally
-- Update schema.sql
```

### 4. Search Indexing

Elasticsearch automatically indexes new issues. For manual reindexing:
```python
# In Python shell
from app import app, es
from models import Issue

with app.app_context():
    for issue in Issue.query.all():
        # Reindex issue
        pass
```

## Configuration

### Environment Variables

```env
# Backend
SECRET_KEY=your-secret-key
DATABASE_URL=mysql+pymysql://user:pass@host/db
ELASTICSEARCH_URL=http://localhost:9200
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Configuration

```python
# MySQL connection
DATABASE_URL = "mysql+pymysql://username:password@localhost/testing_platform"

# Connection pooling (optional)
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

### Elasticsearch Configuration

```python
# Basic configuration
es = Elasticsearch(['http://localhost:9200'])

# With authentication
es = Elasticsearch(
    ['http://localhost:9200'],
    http_auth=('user', 'password'),
    timeout=30
)
```

## Performance Optimization

### Backend Optimizations

1. **Database Indexing**
```sql
-- Add indexes for common queries
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_comments_issue_id ON comments(issue_id);
```

2. **Query Optimization**
```python
# Use eager loading for relationships
issues = Issue.query.options(
    joinedload(Issue.comments),
    joinedload(Issue.tags)
).all()
```

3. **Caching**
```python
# Redis caching (optional)
from flask_caching import Cache

cache = Cache(config={'CACHE_TYPE': 'redis'})

@cache.memoize(timeout=300)
def get_popular_tags():
    return Tag.query.limit(10).all()
```

### Frontend Optimizations

1. **Code Splitting**
```javascript
// Lazy load components
const IssueDetail = React.lazy(() => import('./pages/IssueDetail'));
```

2. **Image Optimization**
```javascript
// Use WebP format with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Screenshot" />
</picture>
```

3. **Bundle Optimization**
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## Security Considerations

### Input Validation
```python
# Validate file uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'log'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
```

### SQL Injection Prevention
```python
# Use parameterized queries (SQLAlchemy handles this)
issue = Issue.query.filter_by(id=issue_id).first()
```

### XSS Prevention
```javascript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userContent);
```

### File Upload Security
```python
# Validate file types and sizes
def secure_filename(filename):
    return werkzeug.utils.secure_filename(filename)
```

## Deployment

### Production Setup

1. **Environment Configuration**
```env
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=mysql+pymysql://prod_user:prod_pass@prod_host/prod_db
ELASTICSEARCH_URL=https://your-elasticsearch.com
```

2. **Database Setup**
```bash
# Production database
mysql -u prod_user -p prod_db < database/schema.sql
```

3. **Static File Serving**
```python
# Configure static file serving
app.config['UPLOAD_FOLDER'] = '/var/www/uploads'
```

4. **Process Management**
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=mysql://user:pass@db/testing_platform
    depends_on:
      - db
      - elasticsearch
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: testing_platform
  
  elasticsearch:
    image: elasticsearch:7.17.0
    environment:
      - discovery.type=single-node
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1;"
```

2. **Elasticsearch Connection Error**
```bash
# Check Elasticsearch service
curl http://localhost:9200

# Check logs
sudo journalctl -u elasticsearch
```

3. **File Upload Issues**
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Create directory if missing
mkdir -p backend/uploads
chmod 755 backend/uploads
```

4. **Frontend Build Issues**
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Debug Mode

```python
# Backend debug
app.run(debug=True, host='0.0.0.0', port=5000)

# Frontend debug
# Add console.log statements
# Use React Developer Tools
```

### Logging

```python
# Configure logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Log to file
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)
```

## Contributing

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint configuration
- **SQL**: Use consistent naming conventions
- **CSS**: Follow Tailwind CSS guidelines

### Git Workflow

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Testing Guidelines

- Write unit tests for new features
- Test API endpoints
- Test frontend components
- Test database migrations
- Test search functionality

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Elasticsearch Documentation](https://www.elastic.co/guide/)
- [MySQL Documentation](https://dev.mysql.com/doc/) 