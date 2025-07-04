from flask import request, jsonify, send_file, session
from app import app, db
from models import Issue, Comment, Tag, Attachment, User, TestcasePath, BucketReviewer
import os
from werkzeug.utils import secure_filename
import markdown
from datetime import datetime
from functools import wraps

# Authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    print(f"Login attempt for username: {username}")
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password) and user.is_active:
        session['user_id'] = user.id
        user.last_login = datetime.now()
        db.session.commit()
        
        print(f"Login successful for user: {user.username}, session user_id: {session.get('user_id')}")
        print(f"Session data: {dict(session)}")
        
        return jsonify(user.to_dict())
    
    print(f"Login failed for username: {username}")
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if not session.get('user_id'):
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        session.pop('user_id', None)
        return jsonify({'error': 'User not found'}), 401
    
    return jsonify(user.to_dict())

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password required'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(username=username, email=email)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user.to_dict()), 201

# Admin routes
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    if 'role' in data:
        user.role = data['role']
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    db.session.commit()
    return jsonify(user.to_dict())

@app.route('/api/admin/issues/<int:issue_id>', methods=['DELETE'])
@admin_required
def delete_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    db.session.delete(issue)
    db.session.commit()
    
    return jsonify({'message': 'Issue deleted successfully'})

@app.route('/api/admin/comments/<int:comment_id>', methods=['DELETE'])
@admin_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted successfully'})

@app.route('/api/admin/issues/<int:issue_id>/edit', methods=['PUT'])
@admin_required
def admin_edit_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    data = request.json
    
    if 'testcase_title' in data:
        issue.testcase_title = data['testcase_title']
    if 'description' in data:
        issue.description = data['description']
    if 'test_case_ids' in data:
        issue.test_case_ids = data['test_case_ids']
    if 'status' in data:
        issue.status = data['status']
    if 'reporter_name' in data:
        issue.reporter_name = data['reporter_name']
    
    # Update tags if provided
    if 'tags' in data:
        issue.tags.clear()
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            issue.tags.append(tag)
    
    db.session.commit()
    
    return jsonify(issue.to_dict())

@app.route('/api/admin/issues/ids', methods=['GET'])
@admin_required
def get_all_issue_ids():
    """Get all issue IDs for admin operations"""
    try:
        # Get all issues with just ID and title for admin reference
        issues = db.session.query(Issue.id, Issue.testcase_title).all()
        
        issue_list = []
        for issue_id, title in issues:
            issue_list.append({
                'id': issue_id,
                'title': title
            })
        
        return jsonify({
            'issues': issue_list,
            'total': len(issue_list)
        })
        
    except Exception as e:
        print(f"Error fetching issue IDs: {e}")
        return jsonify({'error': 'Failed to fetch issue IDs'}), 500

@app.route('/api/admin/issues/bulk-delete', methods=['POST'])
@admin_required
def bulk_delete_issues():
    """Delete multiple issues at once"""
    data = request.json
    issue_ids = data.get('issue_ids', [])
    
    if not issue_ids:
        return jsonify({'error': 'No issue IDs provided'}), 400
    
    try:
        # Delete issues from database
        issues_to_delete = Issue.query.filter(Issue.id.in_(issue_ids)).all()
        for issue in issues_to_delete:
            db.session.delete(issue)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully deleted {len(issues_to_delete)} issues',
            'deleted_count': len(issues_to_delete)
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete issues: {str(e)}'}), 500

# Helper function to save file
def save_file(file, folder='uploads'):
    if file and file.filename:
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(folder, filename)
        file.save(file_path)
        return filename, file_path
    return None, None

# Helper function to index issue in Elasticsearch (currently disabled)
def index_issue(issue):
    # TODO: Implement Elasticsearch indexing when ES is configured
    pass

# Issues endpoints
@app.route('/api/issues', methods=['GET'])
def get_issues():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    severity = request.args.get('severity')
    release = request.args.get('release')
    platform = request.args.get('platform')
    build = request.args.get('build')
    target = request.args.get('target')
    test_case_id = request.args.get('test_case_id')
    
    query = Issue.query
    
    if status:
        query = query.filter(Issue.status == status)
    if severity:
        query = query.filter(Issue.severity == severity)
    if release:
        query = query.filter(Issue.release == release)
    if platform:
        query = query.filter(Issue.platform == platform)
    if build:
        query = query.filter(Issue.build == build)
    if target:
        query = query.filter(Issue.target == target)
    if test_case_id:
        query = query.filter(Issue.test_case_ids == test_case_id)
    
    issues = query.order_by(Issue.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'issues': [issue.to_dict() for issue in issues.items],
        'total': issues.total,
        'pages': issues.pages,
        'current_page': page
    })

@app.route('/api/issues', methods=['POST'])
@login_required
def create_issue():
    # Handle both JSON and FormData
    if request.content_type and 'multipart/form-data' in request.content_type:
        # FormData with files
        data = {}
        for key in request.form:
            data[key] = request.form[key]
        files = request.files.getlist('files') if request.files else []
        print(f"DEBUG: Received FormData - data: {data}")
        print(f"DEBUG: Files count: {len(files)}")
    else:
        # JSON data
        data = request.json
        files = []
        print(f"DEBUG: Received JSON data: {data}")

    # Validate required fields (removed test_case_ids from required fields)
    required_fields = [
        'testcase_title', 'testcase_path', 'severity', 
        'description', 'reporter_name'
    ]
    missing = [field for field in required_fields if not data or field not in data or not data[field]]
    if missing:
        return jsonify({'error': f'Missing required field(s): {", ".join(missing)}'}), 400

    # Generate unique test case ID
    unique_test_case_id = Issue.generate_unique_test_case_id()
    
    # Use only the auto-generated test case ID
    test_case_ids = unique_test_case_id

    # Parse testcase path to extract release and platform
    release, platform = Issue.parse_testcase_path(data['testcase_path'])
    
    # Check if testcase path already exists for the same target
    target = data.get('target')
    if target:
        existing_issue = Issue.is_testcase_path_duplicate_in_target(data['testcase_path'], target)
        if existing_issue:
                            return jsonify({
                    'error': f'This path is already used in issue #{existing_issue.id}. Please check existing issues or use a different path.'
                }), 400

    # Always get reporter name from authenticated user session (ignore form data)
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            reporter_name = user.username
            print(f"DEBUG: Got reporter_name from authenticated user: '{reporter_name}'")
        else:
            return jsonify({'error': 'User not found in session'}), 401
    else:
        return jsonify({'error': 'Authentication required to create issues'}), 401
    
    # Handle tags
    tags_input = data.get('tags', [])
    if isinstance(tags_input, str):
        tag_names = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
    else:
        tag_names = tags_input
    
    # Extract bucket name from testcase path and add as tag
    bucket_name = Issue.extract_bucket_name(data['testcase_path'])
    if bucket_name:
        # Add bucket name to tags if not already present
        if bucket_name not in tag_names:
            tag_names.append(bucket_name)
    
    # Automatically assign reviewer based on bucket name
    reviewer_name = Issue.get_reviewer_for_bucket(bucket_name) if bucket_name else 'Admin'
    
    # Create issue
    issue = Issue(
        testcase_title=data['testcase_title'],
        testcase_path=data['testcase_path'],
        severity=data['severity'],
        test_case_ids=test_case_ids,
        release=release,
        platform=platform,
        build=data.get('build'),
        target=target,
        description=data['description'],
        additional_comments=data.get('additional_comments', ''),
        reporter_name=reporter_name,
        reviewer_name=reviewer_name,  # Assign reviewer based on bucket
        status='open'
    )
    
    for tag_name in tag_names:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        issue.tags.append(tag)
    
    db.session.add(issue)
    db.session.commit()
    
    # Handle file attachments (screenshots)
    for file in files:
        if file and file.filename:
            filename, file_path = save_file(file)
            if filename and file_path:
                attachment = Attachment(
                    issue_id=issue.id,
                    filename=filename,
                    file_path=file_path,
                    file_size=os.path.getsize(file_path),
                    mime_type=file.content_type,
                    uploaded_by=reporter_name  # Use the validated reporter_name variable
                )
                db.session.add(attachment)
    
    db.session.commit()
    
    return jsonify(issue.to_dict()), 201

@app.route('/api/issues/<int:issue_id>', methods=['GET'])
def get_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    issue_dict = issue.to_dict()
    # Order comments by creation date descending (newest first)
    comments = Comment.query.filter_by(issue_id=issue_id).order_by(Comment.created_at.desc()).all()
    issue_dict['comments'] = [comment.to_dict() for comment in comments]
    issue_dict['attachments'] = [att.to_dict() for att in issue.attachments]
    return jsonify(issue_dict)

@app.route('/api/issues/<int:issue_id>', methods=['PUT'])
@login_required
def update_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    data = request.json
    
    if 'testcase_title' in data:
        issue.testcase_title = data['testcase_title']
    if 'testcase_path' in data:
        new_testcase_path = data['testcase_path']
        # Check for conflicts if testcase_path is being changed
        if new_testcase_path != issue.testcase_path and issue.target:
            existing_issue = Issue.is_testcase_path_duplicate_in_target(new_testcase_path, issue.target, exclude_issue_id=issue_id)
            if existing_issue:
                return jsonify({
                    'error': f'This path is already used in issue #{existing_issue.id}. Please check existing issues or use a different path.'
                }), 400
        
        issue.testcase_path = new_testcase_path
        # Re-parse release and platform if testcase_path is updated
        release, platform = Issue.parse_testcase_path(new_testcase_path)
        issue.release = release
        issue.platform = platform
        
        # Extract bucket name from new testcase path and add as tag
        bucket_name = Issue.extract_bucket_name(new_testcase_path)
        if bucket_name:
            # Check if bucket name is already a tag for this issue
            existing_tag_names = [tag.name for tag in issue.tags]
            if bucket_name not in existing_tag_names:
                tag = Tag.query.filter_by(name=bucket_name).first()
                if not tag:
                    tag = Tag(name=bucket_name)
                    db.session.add(tag)
                issue.tags.append(tag)
    if 'severity' in data:
        issue.severity = data['severity']
    if 'test_case_ids' in data:
        issue.test_case_ids = data['test_case_ids']
    if 'build' in data:
        issue.build = data['build']
    if 'target' in data:
        new_target = data['target']
        # Check for conflicts if target is being changed
        if new_target != issue.target and new_target:
            existing_issue = Issue.is_testcase_path_duplicate_in_target(issue.testcase_path, new_target, exclude_issue_id=issue_id)
            if existing_issue:
                return jsonify({
                    'error': f'This path is already used in issue #{existing_issue.id}. Please check existing issues or use a different path.'
                }), 400
        
        issue.target = new_target
    if 'description' in data:
        issue.description = data['description']
    if 'additional_comments' in data:
        issue.additional_comments = data['additional_comments']
    if 'reporter_name' in data:
        issue.reporter_name = data['reporter_name']
    if 'status' in data:
        issue.status = data['status']
    
    # Update tags if provided
    if 'tags' in data:
        issue.tags.clear()
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            issue.tags.append(tag)
    
    db.session.commit()
    
    return jsonify(issue.to_dict())

@app.route('/api/issues/<int:issue_id>/move-to-ccr', methods=['POST'])
@login_required
def move_to_ccr(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    data = request.json
    
    if not data or 'ccr_number' not in data or not data['ccr_number']:
        return jsonify({'error': 'CCR number is required'}), 400
    
    # Check if issue is already resolved
    if issue.status == 'resolved':
        return jsonify({'error': 'Cannot move resolved issues to CCR. Resolved issues should not be moved to CCR.'}), 400
    
    # Update issue status and CCR number
    issue.status = 'ccr'
    issue.ccr_number = data['ccr_number']
    
    db.session.commit()
    
    return jsonify(issue.to_dict())

# Comments endpoints
@app.route('/api/issues/<int:issue_id>/comments', methods=['GET'])
def get_comments(issue_id):
    comments = Comment.query.filter_by(issue_id=issue_id).order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@app.route('/api/issues/<int:issue_id>/comments', methods=['POST'])
@login_required
def create_comment(issue_id):
    data = request.json
    files = request.files.getlist('files') if request.files else []
    
    # Get current user from session (same pattern as /api/auth/me)
    if not session.get('user_id'):
        return jsonify({'error': 'Authentication required'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    comment = Comment(
        issue_id=issue_id,
        commenter_name=user.username,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    # Handle file attachments
    for file in files:
        if file and file.filename:
            filename, file_path = save_file(file)
            if filename and file_path:
                attachment = Attachment(
                    issue_id=issue_id,
                    comment_id=comment.id,
                    filename=filename,
                    file_path=file_path,
                    file_size=os.path.getsize(file_path),
                    mime_type=file.content_type,
                    uploaded_by=user.username
                )
                db.session.add(attachment)
    
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@app.route('/api/comments/<int:comment_id>/verify', methods=['POST'])
@login_required
def verify_solution(comment_id):
    # Get the comment
    comment = Comment.query.get_or_404(comment_id)
    
    # Unverify all other comments for this issue
    Comment.query.filter_by(issue_id=comment.issue_id).update({'is_verified_solution': False})
    
    # Verify the selected comment
    comment.is_verified_solution = True
    
    # Update issue status to resolved
    issue = Issue.query.get_or_404(comment.issue_id)
    issue.status = 'resolved'
    
    db.session.commit()
    
    return jsonify(comment.to_dict())

# Voting endpoints
@app.route('/api/issues/<int:issue_id>/upvote', methods=['POST'])
@login_required
def upvote_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    issue.upvotes += 1
    db.session.commit()
    return jsonify(issue.to_dict())

@app.route('/api/issues/<int:issue_id>/downvote', methods=['POST'])
@login_required
def downvote_issue(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    issue.downvotes += 1
    db.session.commit()
    return jsonify(issue.to_dict())

@app.route('/api/comments/<int:comment_id>/upvote', methods=['POST'])
@login_required
def upvote_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    comment.upvotes += 1
    db.session.commit()
    return jsonify(comment.to_dict())

@app.route('/api/comments/<int:comment_id>/downvote', methods=['POST'])
@login_required
def downvote_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    comment.downvotes += 1
    db.session.commit()
    return jsonify(comment.to_dict())

# Search endpoint
@app.route('/api/search', methods=['GET', 'POST'])
def search_issues():
    if request.method == 'POST':
        data = request.get_json() or {}
        query = data.get('search', '')
        status = data.get('status')
        severity = data.get('severity')
        release = data.get('release')
        platform = data.get('platform')
        build = data.get('build')
        target = data.get('target')
        test_case_id = data.get('test_case_id')
        reporter_name = data.get('reporter_name')
        tags = data.get('tags', [])
        size = data.get('size', 20)
        from_date = data.get('from_date')
        to_date = data.get('to_date')
    else:
        query = request.args.get('q', '')
        status = request.args.get('status')
        severity = request.args.get('severity')
        release = request.args.get('release')
        platform = request.args.get('platform')
        build = request.args.get('build')
        target = request.args.get('target')
        test_case_id = request.args.get('test_case_id')
        reporter_name = request.args.get('reporter_name')
        tags = request.args.get('tags', '').split(',') if request.args.get('tags') else []
        size = request.args.get('size', 20, type=int)
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')

    # Use only SQLAlchemy for all search and filters
    db_query = Issue.query

    # Full-text search (case-insensitive, partial match)
    if query:
        db_query = db_query.filter(
            db.or_(
                Issue.testcase_title.ilike(f'%{query}%'),
                Issue.description.ilike(f'%{query}%'),
                Issue.test_case_ids.ilike(f'%{query}%')
            )
        )
    if status:
        db_query = db_query.filter(Issue.status == status)
    if severity:
        db_query = db_query.filter(Issue.severity == severity)
    if release:
        db_query = db_query.filter(Issue.release == release)
    if platform:
        db_query = db_query.filter(Issue.platform == platform)
    if build:
        db_query = db_query.filter(Issue.build == build)
    if target:
        db_query = db_query.filter(Issue.target == target)
    if test_case_id:
        db_query = db_query.filter(Issue.test_case_ids == test_case_id)
    if reporter_name:
        db_query = db_query.filter(Issue.reporter_name == reporter_name)
    if tags:
        valid_tags = [tag.strip() for tag in tags if tag.strip()]
        if valid_tags:
            # This is a simplified tag search - in production you'd want a proper tag relationship
            pass
    # Date range filter (if needed)
    # if from_date or to_date:
    #     ...

    issues = db_query.order_by(Issue.created_at.desc()).limit(size).all()
    return jsonify({
        'issues': [issue.to_dict() for issue in issues],
        'total': len(issues)
    })

# Tags endpoint
@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags])

@app.route('/api/releases', methods=['GET'])
def get_releases():
    """Get all available releases from existing issues"""
    releases = db.session.query(Issue.release).filter(Issue.release.isnot(None)).distinct().all()
    return jsonify([release[0] for release in releases if release[0]])

@app.route('/api/platforms', methods=['GET'])
def get_platforms():
    platforms = db.session.query(Issue.platform).distinct().filter(Issue.platform.isnot(None)).all()
    platform_list = [platform[0] for platform in platforms]
    
    # Add display names
    platform_options = []
    for platform in platform_list:
        display_name = Issue.get_platform_display_name(platform)
        platform_options.append({
            'code': platform,
            'display': display_name
        })
    
    return jsonify(platform_options)

@app.route('/api/builds', methods=['GET'])
def get_builds():
    """Get all available build options"""
    build_options = Issue.get_build_options()
    return jsonify(build_options)

@app.route('/api/targets/<release>', methods=['GET'])
def get_targets(release):
    """Get target options for a specific release"""
    target_options = Issue.get_target_options(release)
    return jsonify(target_options)

# File serving endpoint - serves images inline, other files as downloads
@app.route('/api/attachments/<int:attachment_id>', methods=['GET'])
def serve_attachment(attachment_id):
    attachment = Attachment.query.get_or_404(attachment_id)
    
    print(f"Serving attachment {attachment_id}: {attachment.filename}, MIME: {attachment.mime_type}")  # Debug log
    
    # Check if this is an image file - try multiple ways
    is_image_by_mime = attachment.mime_type and attachment.mime_type.startswith('image/')
    is_image_by_extension = attachment.filename and any(attachment.filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'])
    is_image = is_image_by_mime or is_image_by_extension
    
    print(f"Is image? {is_image} (by MIME: {is_image_by_mime}, by extension: {is_image_by_extension})")  # Debug log
    
    # Check if user wants to force download
    force_download = request.args.get('download', '').lower() == 'true'
    
    if is_image and not force_download:
        # Serve images inline for display
        print(f"Serving image inline: {attachment.filename}")  # Debug log
        
        # If mime_type is missing, try to detect it from file extension
        mime_type = attachment.mime_type
        if not mime_type and attachment.filename:
            if attachment.filename.lower().endswith(('.jpg', '.jpeg')):
                mime_type = 'image/jpeg'
            elif attachment.filename.lower().endswith('.png'):
                mime_type = 'image/png'
            elif attachment.filename.lower().endswith('.gif'):
                mime_type = 'image/gif'
            elif attachment.filename.lower().endswith('.bmp'):
                mime_type = 'image/bmp'
            elif attachment.filename.lower().endswith('.webp'):
                mime_type = 'image/webp'
        
        return send_file(attachment.file_path, mimetype=mime_type)
    else:
        # Serve other files as downloads
        print(f"Serving as download: {attachment.filename}")  # Debug log
        return send_file(attachment.file_path, as_attachment=True, download_name=attachment.filename)

@app.route('/api/issues/<int:issue_id>/add-testcase-path', methods=['POST'])
@login_required
def add_testcase_path(issue_id):
    issue = Issue.query.get_or_404(issue_id)
    data = request.json
    
    if not data or 'testcase_path' not in data or not data['testcase_path']:
        return jsonify({'error': 'Testcase path is required'}), 400
    
    testcase_path = data['testcase_path'].strip()
    
    # Check if this path already exists for this issue
    existing_path = TestcasePath.query.filter_by(
        issue_id=issue_id,
        testcase_path=testcase_path
    ).first()
    
    if existing_path:
        return jsonify({'error': 'This testcase path already exists for this issue'}), 400
    
    # Check if this is the same as the primary path
    if testcase_path == issue.testcase_path:
        return jsonify({'error': 'This path is already the primary testcase path'}), 400
    
    # Check if testcase path already exists for the same target (excluding current issue)
    if issue.target:
        existing_issue = Issue.is_testcase_path_duplicate_in_target(testcase_path, issue.target, exclude_issue_id=issue_id)
        if existing_issue:
            return jsonify({
                'error': f'This path is already used in issue #{existing_issue.id}. Please check existing issues or use a different path.'
            }), 400
    
    # Parse the path to extract release and platform
    release, platform = Issue.parse_testcase_path(testcase_path)
    
    # Extract bucket name from testcase path and add as tag to the issue
    bucket_name = Issue.extract_bucket_name(testcase_path)
    if bucket_name:
        # Check if bucket name is already a tag for this issue
        existing_tag_names = [tag.name for tag in issue.tags]
        if bucket_name not in existing_tag_names:
            tag = Tag.query.filter_by(name=bucket_name).first()
            if not tag:
                tag = Tag(name=bucket_name)
                db.session.add(tag)
            issue.tags.append(tag)
    
    # Use provided added_by or default to 'System' if not provided
    added_by = data.get('added_by', 'System')
    
    # Create new testcase path
    new_path = TestcasePath(
        issue_id=issue_id,
        testcase_path=testcase_path,
        release=release,
        platform=platform,
        added_by=added_by
    )
    
    db.session.add(new_path)
    db.session.commit()
    
    return jsonify(new_path.to_dict()), 201

@app.route('/api/issues/<int:issue_id>/remove-testcase-path/<int:path_id>', methods=['DELETE'])
@login_required
def remove_testcase_path(issue_id, path_id):
    # Verify the issue exists
    issue = Issue.query.get_or_404(issue_id)
    
    # Find the testcase path
    testcase_path = TestcasePath.query.filter_by(
        id=path_id,
        issue_id=issue_id
    ).first()
    
    if not testcase_path:
        return jsonify({'error': 'Testcase path not found'}), 404
    
    db.session.delete(testcase_path)
    db.session.commit()
    
    return jsonify({'message': 'Testcase path removed successfully'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Tester Talk API is running'})

# Global error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error occurred'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    db.session.rollback()
    print(f"Unhandled exception: {str(e)}")
    return jsonify({'error': 'An unexpected error occurred'}), 500

# Handle database integrity errors specifically
from sqlalchemy.exc import IntegrityError
@app.errorhandler(IntegrityError)
def handle_integrity_error(e):
    db.session.rollback()
    error_message = str(e.orig) if hasattr(e, 'orig') else str(e)
    print(f"Database integrity error: {error_message}")
    
    if "reporter_name" in error_message and "cannot be null" in error_message:
        return jsonify({'error': 'Reporter name is required and cannot be empty'}), 400
    elif "Duplicate entry" in error_message:
        return jsonify({'error': 'A record with this information already exists'}), 400
    else:
        return jsonify({'error': 'Database constraint violation occurred'}), 400

# Bucket-Reviewer Management Endpoints
@app.route('/api/admin/bucket-reviewers', methods=['GET'])
@admin_required
def get_bucket_reviewers():
    """Get all bucket-reviewer mappings"""
    try:
        bucket_reviewers = BucketReviewer.query.all()
        return jsonify([br.to_dict() for br in bucket_reviewers])
    except Exception as e:
        print(f"Error fetching bucket reviewers: {e}")
        return jsonify({'error': 'Failed to fetch bucket reviewers'}), 500

@app.route('/api/admin/bucket-reviewers', methods=['POST'])
@admin_required
def create_bucket_reviewer():
    """Create or update a bucket-reviewer mapping"""
    try:
        data = request.json
        bucket_name = data.get('bucket_name', '').strip()
        reviewer_name = data.get('reviewer_name', '').strip()
        
        if not bucket_name or not reviewer_name:
            return jsonify({'error': 'Bucket name and reviewer name are required'}), 400
        
        # Check if mapping already exists
        existing = BucketReviewer.query.filter_by(bucket_name=bucket_name).first()
        
        if existing:
            # Update existing mapping
            existing.reviewer_name = reviewer_name
            existing.updated_at = datetime.now()
            message = f'Updated reviewer for bucket "{bucket_name}" to "{reviewer_name}"'
        else:
            # Create new mapping
            bucket_reviewer = BucketReviewer(
                bucket_name=bucket_name,
                reviewer_name=reviewer_name
            )
            db.session.add(bucket_reviewer)
            message = f'Created new mapping: bucket "{bucket_name}" -> reviewer "{reviewer_name}"'
        
        db.session.commit()
        return jsonify({'message': message})
        
    except Exception as e:
        print(f"Error creating/updating bucket reviewer: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create/update bucket reviewer'}), 500

@app.route('/api/admin/bucket-reviewers/<int:br_id>', methods=['DELETE'])
@admin_required
def delete_bucket_reviewer(br_id):
    """Delete a bucket-reviewer mapping"""
    try:
        bucket_reviewer = BucketReviewer.query.get_or_404(br_id)
        bucket_name = bucket_reviewer.bucket_name
        
        db.session.delete(bucket_reviewer)
        db.session.commit()
        
        return jsonify({'message': f'Deleted mapping for bucket "{bucket_name}"'})
        
    except Exception as e:
        print(f"Error deleting bucket reviewer: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete bucket reviewer'}), 500

@app.route('/api/admin/available-reviewers', methods=['GET'])
@admin_required
def get_available_reviewers():
    """Get all available users who can be assigned as reviewers"""
    try:
        # Get all active users
        users = User.query.filter_by(is_active=True).all()
        reviewers = [user.username for user in users]
        
        # Add 'Admin' as default option if not already present
        if 'Admin' not in reviewers:
            reviewers.insert(0, 'Admin')
        
        return jsonify(reviewers)
        
    except Exception as e:
        print(f"Error fetching available reviewers: {e}")
        return jsonify({'error': 'Failed to fetch available reviewers'}), 500 