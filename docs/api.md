# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
No authentication required for the prototype. All endpoints are publicly accessible.

## Endpoints

### Issues

#### GET /api/issues
Get a list of all issues with optional filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10)
- `status` (optional): Filter by status ('open' or 'resolved')
- `test_case_id` (optional): Filter by test case ID

**Response:**
```json
{
  "issues": [
    {
      "id": 1,
      "title": "Login button not responding",
      "description": "The login button on the main page is not responding to clicks.",
      "test_case_id": "TC-001",
      "commenter_name": "John Tester",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "tags": ["ui", "login"],
      "comment_count": 2,
      "has_verified_solution": false
    }
  ],
  "total": 25,
  "pages": 3,
  "current_page": 1
}
```

#### POST /api/issues
Create a new issue.

**Request Body (multipart/form-data):**
- `title` (required): Issue title
- `description` (required): Issue description (supports Markdown)
- `test_case_id` (optional): Test case ID
- `commenter_name` (required): Name of the person creating the issue
- `tags` (optional): Comma-separated list of tags
- `files` (optional): File attachments

**Response:**
```json
{
  "id": 1,
  "title": "Login button not responding",
  "description": "The login button on the main page is not responding to clicks.",
  "test_case_id": "TC-001",
  "commenter_name": "John Tester",
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "tags": ["ui", "login"],
  "comment_count": 0,
  "has_verified_solution": false
}
```

#### GET /api/issues/{id}
Get a single issue with all comments and attachments.

**Response:**
```json
{
  "id": 1,
  "title": "Login button not responding",
  "description": "The login button on the main page is not responding to clicks.",
  "test_case_id": "TC-001",
  "commenter_name": "John Tester",
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "tags": ["ui", "login"],
  "comment_count": 2,
  "has_verified_solution": true,
  "comments": [
    {
      "id": 1,
      "issue_id": 1,
      "commenter_name": "Alice Dev",
      "content": "This was caused by a JavaScript event handler conflict.",
      "is_verified_solution": true,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ],
  "attachments": [
    {
      "id": 1,
      "issue_id": 1,
      "comment_id": null,
      "filename": "screenshot.png",
      "file_size": 1024000,
      "mime_type": "image/png",
      "uploaded_by": "John Tester",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### PUT /api/issues/{id}
Update an existing issue.

**Request Body (JSON):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "resolved",
  "test_case_id": "TC-001",
  "tags": ["ui", "login", "bug"]
}
```

### Comments

#### GET /api/issues/{id}/comments
Get all comments for an issue.

**Response:**
```json
[
  {
    "id": 1,
    "issue_id": 1,
    "commenter_name": "Alice Dev",
    "content": "This was caused by a JavaScript event handler conflict.",
    "is_verified_solution": true,
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
]
```

#### POST /api/issues/{id}/comments
Add a comment to an issue.

**Request Body (multipart/form-data):**
- `commenter_name` (required): Name of the commenter
- `content` (required): Comment content (supports Markdown)
- `files` (optional): File attachments

#### PUT /api/issues/{id}/comments/{comment_id}/verify
Mark a comment as the verified solution.

**Response:**
```json
{
  "id": 1,
  "issue_id": 1,
  "commenter_name": "Alice Dev",
  "content": "This was caused by a JavaScript event handler conflict.",
  "is_verified_solution": true,
  "created_at": "2024-01-15T11:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### Search

#### GET /api/search
Search issues using Elasticsearch.

**Query Parameters:**
- `q` (optional): Search query
- `status` (optional): Filter by status
- `test_case_id` (optional): Filter by test case ID
- `tags` (optional): Filter by tags (comma-separated)

**Response:**
```json
{
  "issues": [
    {
      "id": 1,
      "title": "Login button not responding",
      "description": "The login button on the main page is not responding to clicks.",
      "test_case_id": "TC-001",
      "commenter_name": "John Tester",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "tags": ["ui", "login"],
      "comment_count": 2,
      "has_verified_solution": false
    }
  ],
  "total": 1
}
```

### Tags

#### GET /api/tags
Get all available tags.

**Response:**
```json
[
  {
    "id": 1,
    "name": "ui",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "backend",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Attachments

#### GET /api/attachments/{id}
Download a file attachment.

**Response:** File download

### Health Check

#### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

## File Upload

File uploads are supported for:
- Images (PNG, JPG, GIF)
- Documents (PDF)
- Text files (TXT, LOG)

Maximum file size: 16MB per file

## Markdown Support

The following fields support Markdown formatting:
- Issue descriptions
- Comment content

Supported Markdown features:
- Headers (# ## ###)
- Bold (**text**)
- Italic (*text*)
- Code blocks (```language)
- Inline code (`code`)
- Lists (- item)
- Links [text](url) 