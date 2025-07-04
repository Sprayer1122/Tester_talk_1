from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
import re

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'user'), default='user')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Issue(db.Model):
    __tablename__ = 'issues'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Issue Details
    testcase_title = db.Column(db.String(500), nullable=False)
    testcase_path = db.Column(db.String(200), nullable=False)
    severity = db.Column(db.Enum('Low', 'Medium', 'High', 'Critical'), nullable=False)
    test_case_ids = db.Column(db.String(200), nullable=False)  # Can contain multiple IDs separated by comma
    
    # Extracted path parameters
    release = db.Column(db.String(10))  # e.g., '251', '261', '231'
    platform = db.Column(db.String(20))  # e.g., 'lnx86', 'lr', 'rhel7.6', etc.
    
    # User input fields
    build = db.Column(db.String(20))  # Weekly, Daily, Daily Plus
    target = db.Column(db.String(100))  # Release-specific build targets
    
    # Content
    description = db.Column(db.Text, nullable=False)
    additional_comments = db.Column(db.Text)
    
    # Metadata
    reporter_name = db.Column(db.String(100), nullable=False)
    reviewer_name = db.Column(db.String(100), default='Admin')  # New reviewer field
    status = db.Column(db.Enum('open', 'in_progress', 'resolved', 'closed', 'ccr'), default='open')
    ccr_number = db.Column(db.String(100))  # CCR number when status is 'ccr'
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    
    # Relationships
    comments = db.relationship('Comment', backref='issue', lazy=True, cascade='all, delete-orphan')
    attachments = db.relationship('Attachment', backref='issue', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('Tag', secondary='issue_tags', lazy='subquery', backref=db.backref('issues', lazy=True))
    
    @staticmethod
    def parse_testcase_path(path):
        """
        Parse testcase path to extract release and platform information.
        Expected format: /lan/fed/etpv5/release/<Release>/<Platform>/etautotest/<<path_to_testcase>
        """
        if not path:
            return None, None
            
        # Regular expression to match the path pattern
        pattern = r'/lan/fed/etpv5/release/(\d+)/([^/]+)/etautotest/'
        match = re.match(pattern, path)
        
        if match:
            release = match.group(1)
            platform = match.group(2)
            return release, platform
        return None, None
    
    @staticmethod
    def extract_bucket_name(path):
        """
        Extract bucket name from testcase path.
        Expected format: /lan/fed/etpv5/release/<Release>/<Platform>/etautotest/<bucket_name>/...
        Returns the bucket name (first directory after etautotest/) in uppercase for proper mapping
        """
        if not path:
            return None
            
        # Regular expression to match the path pattern and extract bucket name
        pattern = r'/lan/fed/etpv5/release/\d+/[^/]+/etautotest/([^/]+)'
        match = re.match(pattern, path)
        
        if match:
            bucket_name = match.group(1)
            # Normalize to uppercase for proper mapping to reviewers
            return bucket_name.upper()
        return None
    
    @staticmethod
    def get_reviewer_for_bucket(bucket_name):
        """
        Get the assigned reviewer for a given bucket name.
        Returns 'Admin' as default if no specific mapping exists.
        """
        if not bucket_name:
            return 'Admin'
        
        # Try to find a specific bucket-reviewer mapping
        bucket_reviewer = BucketReviewer.query.filter_by(bucket_name=bucket_name).first()
        if bucket_reviewer:
            return bucket_reviewer.reviewer_name
        
        # Return default reviewer if no mapping found
        return 'Admin'
    
    @staticmethod
    def get_platform_display_name(platform_code):
        """
        Convert platform code to display name
        """
        platform_mapping = {
            'lnx86': 'Linux',
            'lr': 'LR',
            'rhel7.6': 'RHEL7.6',
            'centos7.4': 'CENTOS7.4',
            'sles12sp3': 'SLES12SP3',
            'lop': 'LOP'
        }
        return platform_mapping.get(platform_code, platform_code)
    
    @staticmethod
    def get_platform_code(display_name):
        """
        Convert display name to platform code
        """
        platform_mapping = {
            'Linux': 'lnx86',
            'LR': 'lr',
            'RHEL7.6': 'rhel7.6',
            'CENTOS7.4': 'centos7.4',
            'SLES12SP3': 'sles12sp3',
            'LOP': 'lop'
        }
        return platform_mapping.get(display_name, display_name)
    
    @staticmethod
    def get_build_options():
        """
        Get all available build options
        """
        return ['Weekly', 'Daily', 'Daily Plus']
    
    @staticmethod
    def get_target_options(release):
        """
        Get target options based on release
        """
        target_mapping = {
            '251': [
                '25.11-d065_1_Jun23',
                '25.11-d062_1_Jun_19',
                '25.11-d057_1_Jun_12',
                '25.11-d049_1_Jun_05'
            ],
            '261': [
                '26.10-d075_1_May_08'
            ],
            '231': [
                '23.13-d014_1_Oct_23',
                '23.13-d012_1_Oct_15'
            ]
        }
        return target_mapping.get(release, [])
    
    @staticmethod
    def generate_unique_test_case_id():
        """Generate a unique test case ID in format: TC-YYYYMMDD-XXXX"""
        while True:
            # Get current date
            date_str = datetime.now().strftime('%Y%m%d')
            # Generate 4 random alphanumeric characters
            random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            test_case_id = f"TC-{date_str}-{random_chars}"
            
            # Check if this ID already exists
            existing_issue = Issue.query.filter(Issue.test_case_ids.like(f"%{test_case_id}%")).first()
            if not existing_issue:
                return test_case_id
    
    @staticmethod
    def is_testcase_path_duplicate_in_target(testcase_path, target, exclude_issue_id=None):
        """
        Check if a testcase path already exists for the same target.
        Returns the conflicting issue if found, None otherwise.
        
        Args:
            testcase_path: The testcase path to check
            target: The build target to check within
            exclude_issue_id: Issue ID to exclude from check (for updates)
        """
        if not target or not testcase_path:
            return None
        
        # Check primary testcase paths in issues
        query = Issue.query.filter(
            Issue.testcase_path == testcase_path,
            Issue.target == target
        )
        
        if exclude_issue_id:
            query = query.filter(Issue.id != exclude_issue_id)
        
        existing_issue = query.first()
        if existing_issue:
            return existing_issue
        
        # Check additional testcase paths
        # We need to join with issues to get the target information
        additional_path_query = db.session.query(TestcasePath).join(Issue).filter(
            TestcasePath.testcase_path == testcase_path,
            Issue.target == target
        )
        
        if exclude_issue_id:
            additional_path_query = additional_path_query.filter(Issue.id != exclude_issue_id)
        
        existing_additional_path = additional_path_query.first()
        if existing_additional_path:
            return existing_additional_path.issue
        
        return None
    
    def to_dict(self):
        # Count how many testcase paths this issue has (1 for primary + additional paths)
        additional_paths_count = TestcasePath.query.filter_by(issue_id=self.id).count()
        testcase_count = 1 + additional_paths_count  # 1 for primary path + additional paths
        
        return {
            'id': self.id,
            'testcase_title': self.testcase_title,
            'testcase_path': self.testcase_path,
            'severity': self.severity,
            'test_case_ids': self.test_case_ids,
            'release': self.release,
            'platform': self.platform,
            'platform_display': self.get_platform_display_name(self.platform) if self.platform else None,
            'build': self.build,
            'target': self.target,
            'description': self.description,
            'additional_comments': self.additional_comments,
            'reporter_name': self.reporter_name,
            'reviewer_name': self.reviewer_name,
            'status': self.status,
            'ccr_number': self.ccr_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'tags': [tag.name for tag in self.tags],
            'comment_count': len(self.comments),
            'has_verified_solution': any(comment.is_verified_solution for comment in self.comments),
            'upvotes': self.upvotes,
            'downvotes': self.downvotes,
            'score': self.upvotes - self.downvotes,
            'testcase_count': testcase_count,
            'additional_testcase_paths': [path.to_dict() for path in TestcasePath.query.filter_by(issue_id=self.id).all()]
        }

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class IssueTag(db.Model):
    __tablename__ = 'issue_tags'
    
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('tags.id'), primary_key=True)

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)
    commenter_name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_verified_solution = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    
    # Relationships
    attachments = db.relationship('Attachment', backref='comment', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'commenter_name': self.commenter_name,
            'content': self.content,
            'is_verified_solution': self.is_verified_solution,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'upvotes': self.upvotes,
            'downvotes': self.downvotes,
            'score': self.upvotes - self.downvotes
        }

class Attachment(db.Model):
    __tablename__ = 'attachments'
    
    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)
    comment_id = db.Column(db.Integer, db.ForeignKey('comments.id'))
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    uploaded_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'comment_id': self.comment_id,
            'filename': self.filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TestcasePath(db.Model):
    __tablename__ = 'testcase_paths'
    
    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey('issues.id'), nullable=False)
    testcase_path = db.Column(db.String(200), nullable=False)
    release = db.Column(db.String(10))  # Extracted from path
    platform = db.Column(db.String(20))  # Extracted from path
    added_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    
    # Relationship
    issue = db.relationship('Issue', backref=db.backref('additional_paths', lazy=True, cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'issue_id': self.issue_id,
            'testcase_path': self.testcase_path,
            'release': self.release,
            'platform': self.platform,
            'platform_display': Issue.get_platform_display_name(self.platform) if self.platform else None,
            'added_by': self.added_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BucketReviewer(db.Model):
    __tablename__ = 'bucket_reviewers'
    
    id = db.Column(db.Integer, primary_key=True)
    bucket_name = db.Column(db.String(100), unique=True, nullable=False)
    reviewer_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'bucket_name': self.bucket_name,
            'reviewer_name': self.reviewer_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }