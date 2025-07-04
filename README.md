# Tester Talk - Complete Test Case Issue Management System

A comprehensive web application for managing test case issues, reviews, and collaboration among testing teams.

## 🚀 Features

### 🔐 Authentication System
- **User Registration**: New users can create accounts with username, email, and password
- **User Login**: Secure authentication with session management
- **Role-based Access**: Admin and regular user roles with different permissions
- **Session Management**: Persistent login sessions with automatic logout

### 📋 Issue Management
- **Create Issues**: Comprehensive issue creation with all required fields
- **View Issues**: Detailed issue viewing with all metadata
- **Edit Issues**: Full issue editing capabilities (admin only)
- **Delete Issues**: Issue deletion with confirmation (admin only)
- **Status Management**: Track issues through different statuses (open, in_progress, resolved, closed, ccr)

### 🔍 Advanced Search & Filtering
- **Full-text Search**: Search across titles, descriptions, and test case IDs
- **Elasticsearch Integration**: Fast and accurate search results
- **Multiple Filters**: Filter by status, severity, release, platform, build, target
- **Quick Filters**: One-click filtering for common statuses
- **Real-time Results**: Instant search results with highlighting

### 💬 Collaboration Features
- **Comments System**: Add comments to issues with user attribution
- **Voting System**: Upvote/downvote issues and comments
- **Solution Verification**: Mark comments as verified solutions
- **File Attachments**: Upload screenshots and files with issues and comments

### 🏷️ Tagging & Organization
- **Tag Management**: Add custom tags to issues
- **Tag Filtering**: Filter issues by tags
- **Tag Display**: Visual tag representation with color coding

### 📊 Admin Panel
- **User Management**: View, edit, and manage user accounts
- **Role Management**: Assign admin/user roles
- **Account Status**: Activate/deactivate user accounts
- **Bulk Operations**: Delete multiple issues based on filters
- **Issue Management**: Comprehensive issue administration

### 🔄 CCR Integration
- **Move to CCR**: Convert issues to CCR (Customer Change Request) status
- **CCR Number Tracking**: Associate issues with CCR numbers
- **CCR Status Display**: Visual indication of CCR status

### 📱 Responsive Design
- **Mobile-friendly**: Works on all device sizes
- **Modern UI**: Clean, intuitive interface
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **MySQL**: Primary database
- **Elasticsearch**: Search engine for fast queries
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **HTML5/CSS3**: Modern web standards
- **Responsive Design**: Mobile-first approach

### Database
- **MySQL**: Primary data storage
- **Elasticsearch**: Search indexing and queries

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Elasticsearch 8.x (optional, for enhanced search)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tester_3
```

### 2. Set Up Python Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/testing_platform
ELASTICSEARCH_URL=https://your-elasticsearch-url:443
ELASTICSEARCH_API_KEY=your-elasticsearch-api-key
```

### 4. Set Up Database
```bash
python setup_database.py
```

### 5. Run the Application
```bash
# From the root directory
python run_app.py

# Or from the backend directory
python app.py
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:8080/api/
- **Admin Panel**: http://localhost:8080/admin.html

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration

### Issues
- `GET /api/issues` - List issues with filtering
- `POST /api/issues` - Create new issue
- `GET /api/issues/<id>` - Get issue details
- `PUT /api/issues/<id>` - Update issue
- `DELETE /api/admin/issues/<id>` - Delete issue (admin)

### Comments
- `GET /api/issues/<id>/comments` - Get issue comments
- `POST /api/issues/<id>/comments` - Add comment
- `POST /api/comments/<id>/verify` - Verify solution
- `POST /api/comments/<id>/upvote` - Upvote comment
- `POST /api/comments/<id>/downvote` - Downvote comment

### Voting
- `POST /api/issues/<id>/upvote` - Upvote issue
- `POST /api/issues/<id>/downvote` - Downvote issue

### Search
- `GET /api/search` - Advanced search with filters

### Admin
- `GET /api/admin/users` - List users (admin)
- `PUT /api/admin/users/<id>` - Update user (admin)
- `POST /api/admin/issues/bulk-delete` - Bulk delete issues (admin)
- `GET /api/admin/issues/ids` - Get issue IDs for bulk operations (admin)

### Metadata
- `GET /api/tags` - Get all tags
- `GET /api/releases` - Get all releases
- `GET /api/platforms` - Get all platforms
- `GET /api/builds` - Get all builds
- `GET /api/targets/<release>` - Get targets for release

## 👥 User Roles

### Regular User
- Create and view issues
- Add comments and vote
- Search and filter issues
- Upload attachments

### Admin User
- All regular user permissions
- Manage user accounts
- Edit and delete issues
- Bulk operations
- Access admin panel

## 🎯 Usage Guide

### For Testers
1. **Register/Login**: Create an account or log in
2. **Create Issues**: Report test case issues with detailed information
3. **Add Comments**: Provide additional context and solutions
4. **Vote**: Upvote helpful comments and important issues
5. **Search**: Find relevant issues using advanced search

### For Admins
1. **User Management**: Manage user accounts and roles
2. **Issue Administration**: Edit, delete, and bulk manage issues
3. **System Monitoring**: Monitor system usage and user activity
4. **Data Management**: Perform bulk operations and data cleanup

## 🔍 Search Features

### Text Search
- Search across issue titles, descriptions, and test case IDs
- Fuzzy matching for typos
- Exact phrase matching
- Relevance scoring

### Filtering
- **Status**: open, in_progress, resolved, closed, ccr
- **Severity**: Critical, High, Medium, Low
- **Release**: Filter by specific releases
- **Platform**: Filter by platform (Linux, LR, RHEL, etc.)
- **Build**: Filter by build type (Weekly, Daily, Daily Plus)
- **Target**: Filter by specific build targets

### Quick Filters
- All issues
- Open issues
- Resolved issues
- CCR issues

## 📊 Data Model

### Issues
- Test case information (title, path, IDs)
- Severity and status
- Release and platform details
- Description and additional comments
- Tags and metadata
- Voting and scoring

### Comments
- User attribution
- Content and timestamps
- Voting system
- Solution verification
- File attachments

### Users
- Authentication details
- Role-based permissions
- Account status
- Activity tracking

## 🚀 Deployment

### Production Setup
1. Use a production WSGI server (Gunicorn, uWSGI)
2. Set up a reverse proxy (Nginx)
3. Configure SSL certificates
4. Set up proper database backups
5. Configure monitoring and logging

### Environment Variables
```env
SECRET_KEY=your-production-secret-key
DATABASE_URL=mysql+pymysql://user:pass@host:port/db
ELASTICSEARCH_URL=your-elasticsearch-url
ELASTICSEARCH_API_KEY=your-api-key
FLASK_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Tester Talk** - Making test case management collaborative and efficient! 🚀 