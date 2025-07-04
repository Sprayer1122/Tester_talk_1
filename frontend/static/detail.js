// --- Detail Page Logic for Tester Talk ---
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Issue Detail page...');
    
    // Get issue ID from URL
    const issueId = getIssueIdFromUrl();
    if (issueId) {
        loadIssueDetail(issueId);
    } else {
        console.error('No issue ID found in URL');
        document.querySelector('.container').innerHTML = '<div class="loading-inline"><span>Error: Invalid issue URL</span></div>';
    }
    
    console.log('✅ Issue Detail page initialized');
});

// Global authentication state
window.currentUserAuthenticated = false;

// Global issue state
window.currentIssueStatus = null;

// Check authentication status and update UI
async function checkAuthenticationAndUpdateUI() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.currentUserAuthenticated = true;
            window.currentUser = user;
            showAuthenticatedUI();
        } else {
            window.currentUserAuthenticated = false;
            window.currentUser = null;
            hideAuthenticatedUI();
        }
    } catch (error) {
        console.log('Not authenticated');
        window.currentUserAuthenticated = false;
        window.currentUser = null;
        hideAuthenticatedUI();
    }
    
    // Update header
    updateHeader();
}

function showAuthenticatedUI() {
    // Show comment form
    const commentForm = document.getElementById('add-comment-form');
    if (commentForm) commentForm.style.display = 'block';
    
    // Update comment author display
    const authorDisplay = document.getElementById('comment-author-name');
    if (authorDisplay && window.currentUser) {
        authorDisplay.textContent = window.currentUser.username;
    }
    
    // Show move to CCR button
    const moveCcrBtn = document.getElementById('move-ccr-btn');
    if (moveCcrBtn) moveCcrBtn.style.display = 'inline-block';
    
    // Show add testcase path form
    const addTestcaseForm = document.getElementById('add-testcase-form');
    if (addTestcaseForm) addTestcaseForm.style.display = 'block';
    
    // Show voting buttons (these are generated dynamically, so we'll handle them in the render functions)
}

function hideAuthenticatedUI() {
    // Hide comment form
    const commentForm = document.getElementById('add-comment-form');
    if (commentForm) {
        commentForm.style.display = 'none';
        // Add login message
        addLoginMessage();
    }
    
    // Hide move to CCR button
    const moveCcrBtn = document.getElementById('move-ccr-btn');
    if (moveCcrBtn) moveCcrBtn.style.display = 'none';
    
    // Hide add testcase path form
    const addTestcaseForm = document.getElementById('add-testcase-form');
    if (addTestcaseForm) {
        addTestcaseForm.style.display = 'none';
        // Add login message for testcase paths
        addTestcaseLoginMessage();
    }
}

function addLoginMessage() {
    // Add a message telling users to log in to comment
    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection && !document.getElementById('comment-login-message')) {
        const loginMessage = document.createElement('div');
        loginMessage.id = 'comment-login-message';
        loginMessage.className = 'auth-required-message';
        loginMessage.innerHTML = `
            <div class="login-prompt">
                <p>You must be logged in to post comments and vote.</p>
                <button class="btn btn-primary" onclick="window.location.href='/login.html'">Log In</button>
            </div>
        `;
        
        // Insert after the comments header but before the comments list
        const commentsHeader = commentsSection.querySelector('.comments-header');
        if (commentsHeader) {
            commentsHeader.after(loginMessage);
        }
    }
}

function addTestcaseLoginMessage() {
    // Add a message telling users to log in to add testcase paths
    const testcaseSection = document.querySelector('.additional-testcases-section');
    if (testcaseSection && !document.getElementById('testcase-login-message')) {
        const loginMessage = document.createElement('div');
        loginMessage.id = 'testcase-login-message';
        loginMessage.className = 'auth-required-message';
        loginMessage.innerHTML = `
            <div class="login-prompt">
                <p>Log in to add additional testcase paths.</p>
                <button class="btn btn-primary btn-small" onclick="window.location.href='/login.html'">Log In</button>
            </div>
        `;
        testcaseSection.appendChild(loginMessage);
    }
}

// Update header authentication status
async function updateHeader() {
    const loginBtn = document.getElementById('login-btn');
    const navCreateLink = document.querySelector('nav a[href="/create.html"]');
    
    if (!loginBtn) return;
    
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update button to show logout
            loginBtn.textContent = `Logout (${user.username})`;
            loginBtn.className = 'btn btn-logout';
            loginBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await logout();
            };
            
            // Show create link for authenticated users
            if (navCreateLink) navCreateLink.style.display = 'inline-block';
            
        } else {
            // User not logged in
            loginBtn.textContent = 'Login';
            loginBtn.className = 'btn btn-login';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/login.html';
            };
            
            // Hide create link for non-authenticated users
            if (navCreateLink) navCreateLink.style.display = 'none';
        }
    } catch (error) {
        console.log('Not authenticated');
        loginBtn.textContent = 'Login';
        loginBtn.className = 'btn btn-login';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/login.html';
        };
        
        // Hide create link for non-authenticated users
        if (navCreateLink) navCreateLink.style.display = 'none';
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('currentUser');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
        window.location.reload();
    }
}

function getIssueIdFromUrl() {
    console.log('Getting issue ID from URL:', window.location.pathname);
    const match = window.location.pathname.match(/\/issues\/(\d+)/);
    console.log('URL match result:', match);
    const issueId = match ? match[1] : null;
    console.log('Extracted issue ID:', issueId);
    return issueId;
}

async function loadIssueDetail(issueId) {
    try {
        console.log('Loading issue details for ID:', issueId);
        
        // Check authentication and update UI first
        await checkAuthenticationAndUpdateUI();
        
        const response = await fetch(`/api/issues/${issueId}`);
        console.log('API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const issue = await response.json();
        console.log('Issue data:', issue);
        
        updateIssueDisplay(issue);
        setupEventListeners(issueId);
        
    } catch (error) {
        console.error('Error loading issue:', error);
        document.querySelector('.container').innerHTML = '<div class="loading-inline"><span>Error loading issue details: ' + error.message + '</span></div>';
    }
}

function updateIssueDisplay(issue) {
    console.log('Updating issue display with:', issue);
    
    // Store current issue status globally for comment rendering
    window.currentIssueStatus = issue.status;
    
    // Update issue title
    const titleElement = document.getElementById('issue-title');
    if (titleElement) {
        titleElement.textContent = issue.testcase_title;
        console.log('Updated title to:', issue.testcase_title);
    } else {
        console.error('Title element not found!');
    }
    
    // Update voting buttons
    const upvotesElement = document.getElementById('upvotes');
    const downvotesElement = document.getElementById('downvotes');
    if (upvotesElement) upvotesElement.textContent = issue.upvotes || 0;
    if (downvotesElement) downvotesElement.textContent = issue.downvotes || 0;
    
    // Update status
    const statusElement = document.getElementById('issue-status');
    if (statusElement) {
        statusElement.textContent = issue.status.toUpperCase();
        statusElement.className = `tag status-${issue.status}`;
    }
    
    // Update severity
    const severityElement = document.getElementById('issue-severity');
    if (severityElement) {
        severityElement.textContent = issue.severity;
        severityElement.className = `tag severity-${issue.severity}`;
    }
    
    // Update tags
    const tagsElement = document.getElementById('issue-tags');
    if (tagsElement) {
        tagsElement.innerHTML = issue.tags.map(tag => `<span class="tag custom-tag">${tag}</span>`).join(' ');
    }
    
    // Update CCR number if exists - show CCR number and hide Move to CCR button
    const ccrDisplay = document.getElementById('ccr-display');
    const ccrElement = document.getElementById('issue-ccr');
    const moveCcrBtn = document.getElementById('move-ccr-btn');
    
    if (issue.ccr_number && ccrElement) {
        // Show CCR number, hide Move to CCR button
        ccrElement.textContent = issue.ccr_number;
        if (ccrDisplay) ccrDisplay.style.display = 'inline';
        if (moveCcrBtn) moveCcrBtn.style.display = 'none';
    } else if (issue.status === 'resolved') {
        // Hide both CCR number and Move to CCR button for resolved issues
        if (ccrDisplay) ccrDisplay.style.display = 'none';
        if (moveCcrBtn) moveCcrBtn.style.display = 'none';
    } else {
        // Hide CCR number, show Move to CCR button only for authenticated users (and non-resolved issues)
        if (ccrDisplay) ccrDisplay.style.display = 'none';
        if (moveCcrBtn) {
            if (window.currentUserAuthenticated) {
                moveCcrBtn.style.display = 'inline-block';
            } else {
                moveCcrBtn.style.display = 'none';
            }
        }
    }
    
    // Update test case details
    const testcaseIdsElement = document.getElementById('issue-testcase-ids');
    if (testcaseIdsElement) {
        testcaseIdsElement.textContent = issue.test_case_ids || '-';
    }
    
    const testcasePathElement = document.getElementById('issue-testcase-path');
    if (testcasePathElement) {
        testcasePathElement.textContent = issue.testcase_path || '-';
    }
    
    const releaseElement = document.getElementById('issue-release');
    if (releaseElement) {
        releaseElement.textContent = issue.release || '-';
    }
    
    const platformElement = document.getElementById('issue-platform');
    if (platformElement) {
        platformElement.textContent = issue.platform_display || issue.platform || '-';
    }
    
    const buildElement = document.getElementById('issue-build');
    if (buildElement) {
        buildElement.textContent = issue.build || '-';
    }
    
    const targetElement = document.getElementById('issue-target');
    if (targetElement) {
        targetElement.textContent = issue.target || '-';
    }
    
    // Update metadata
    const authorElement = document.getElementById('issue-author');
    if (authorElement) {
        authorElement.textContent = issue.reporter_name;
    }
    
    // Update reviewer information
    const reviewerElement = document.getElementById('issue-reviewer');
    if (reviewerElement) {
        const reviewerName = reviewerElement.querySelector('.reviewer-name');
        if (reviewerName) {
            reviewerName.textContent = issue.reviewer_name || 'Admin';
        }
    }
    
    const createdElement = document.getElementById('issue-created');
    if (createdElement) {
        createdElement.textContent = new Date(issue.created_at).toLocaleString();
    }
    
    const updatedElement = document.getElementById('issue-updated');
    if (updatedElement) {
        updatedElement.textContent = new Date(issue.updated_at).toLocaleString();
    }
    
    const testcaseCountElement = document.getElementById('testcase-count');
    if (testcaseCountElement) {
        const additionalPaths = issue.additional_testcase_paths || [];
        const totalCount = 1 + additionalPaths.length; // 1 for main path + additional paths
        testcaseCountElement.textContent = totalCount;
    }
    
    // Update additional testcase paths
    updateAdditionalTestcasePaths(issue);
    
    // Update resolved time tag if issue is resolved
    const resolvedLabel = document.getElementById('resolved-label');
    if (resolvedLabel) {
        if (issue.status === 'resolved' && issue.updated_at && issue.created_at) {
            const resolutionTime = getResolutionTime(issue.created_at, issue.updated_at);
            if (resolutionTime) {
                resolvedLabel.textContent = `Resolved in ${resolutionTime}`;
                resolvedLabel.style.display = 'inline';
            }
        } else {
            resolvedLabel.style.display = 'none';
        }
    }
    
    // Update description
    const descElement = document.getElementById('issue-desc');
    if (descElement) {
        descElement.textContent = issue.description;
    }
    
    // Update additional comments if exists
    const additionalCommentsSection = document.getElementById('additional-comments-section');
    const additionalCommentsElement = document.getElementById('issue-additional-comments');
    if (issue.additional_comments && additionalCommentsSection && additionalCommentsElement) {
        additionalCommentsElement.textContent = issue.additional_comments;
        additionalCommentsSection.style.display = 'block';
    }
    
    // Update attachments if exists
    const attachmentsSection = document.getElementById('attachments-section');
    const attachmentsGrid = document.getElementById('attachments-grid');
    if (issue.attachments && issue.attachments.length > 0 && attachmentsSection && attachmentsGrid) {
        console.log('Processing attachments:', issue.attachments); // Debug log
        
        attachmentsGrid.innerHTML = issue.attachments.map(attachment => {
            console.log('Attachment:', attachment.filename, 'MIME type:', attachment.mime_type); // Debug log
            
            // Check if this is an image file - try multiple ways
            const isImageByMime = attachment.mime_type && attachment.mime_type.startsWith('image/');
            const isImageByExtension = attachment.filename && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(attachment.filename);
            const isImage = isImageByMime || isImageByExtension;
            
            console.log('Is image?', isImage, 'By MIME:', isImageByMime, 'By extension:', isImageByExtension); // Debug log
            
            // Temporarily show all as images to fix the display issue
            const showAsImage = true; // We'll fix detection later
            
            if (showAsImage) {
                return `<div class="attachment-item image-attachment">
                    <div class="attachment-link" onclick="openImageModal('/api/attachments/${attachment.id}', '${attachment.filename}')">
                        <img src="/api/attachments/${attachment.id}" alt="${attachment.filename}" class="attachment-thumbnail" 
                             onerror="console.error('Failed to load image:', '/api/attachments/${attachment.id}'); this.parentElement.innerHTML='<div class=\\'attachment-error\\'>❌ Failed to load: ${attachment.filename}</div>'" />
                    </div>
                </div>`;
            } else {
                return `<div class="attachment-item file-attachment">
                    <a href="/api/attachments/${attachment.id}" target="_blank" class="attachment-link">
                        <div class="attachment-icon">📎</div>
                        <div class="attachment-info">
                            <div class="attachment-filename">${attachment.filename}</div>
                            <div class="attachment-meta">${formatFileSize(attachment.file_size)} • Click to download</div>
                        </div>
                    </a>
                </div>`;
            }
        }).join('');
        attachmentsSection.style.display = 'block';
    } else {
        console.log('No attachments found or elements missing:', {
            attachments: issue.attachments,
            attachmentsSection: !!attachmentsSection,
            attachmentsGrid: !!attachmentsGrid
        });
    }
    
    // Load comments
    loadComments(issue.id);
}

async function loadComments(issueId) {
    try {
        // Show comments loading
        loading.showCommentsLoading('comments-list', 'Loading comments...');
        
        const response = await fetch(`/api/issues/${issueId}/comments`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const comments = await response.json();
        
        // Hide loading and render comments
        loading.hideLoading('comments-list');
        renderComments(comments);
        
    } catch (error) {
        console.error('Error loading comments:', error);
        loading.hideLoading('comments-list');
        document.getElementById('comments-list').innerHTML = '<div class="comments-loading"><span>Error loading comments. Please try again.</span></div>';
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    const commentsBadge = document.getElementById('comments-badge');
    
    if (!commentsList) return;
    
    // Update comment count
    if (commentsBadge) {
        commentsBadge.textContent = comments.length;
    }
    
    // Show resolved notice if issue is resolved
    let commentsHTML = '';
    if (window.currentIssueStatus === 'resolved') {
        commentsHTML += `
            <div class="comments-resolved-notice">
                <span class="icon">✅</span>
                <span class="text">This issue has been resolved. No new solutions can be marked.</span>
            </div>
        `;
    }
    
    if (comments.length === 0) {
        commentsList.innerHTML = commentsHTML; // Show only the notice if no comments
        return;
    }
    
    commentsHTML += comments.map(comment => renderCommentHTML(comment)).join('');
    commentsList.innerHTML = commentsHTML;
}

function renderCommentHTML(comment) {
    const isVerified = comment.is_verified_solution;
    const isAuthenticated = window.currentUserAuthenticated || false;
    const isOwnComment = window.currentUser && comment.commenter_name === window.currentUser.username;
    const isIssueResolved = window.currentIssueStatus === 'resolved';
    
    // Don't show verification buttons if issue is already resolved
    const verificationButton = !isVerified && isAuthenticated && !isIssueResolved ? 
        `<button class="verify-solution-btn" onclick="verifySolution(${comment.id})">Mark as Solution</button>` : 
        isVerified ? `<span class="verified-badge">Verified Solution</span>` : '';

    const votingButtons = isAuthenticated ? `
                <button onclick="upvoteComment(${comment.id})" ${comment.user_vote === 'upvote' ? 'class="upvoted"' : ''}>
                    👍 ${comment.upvotes}
                </button>
                <button onclick="downvoteComment(${comment.id})" ${comment.user_vote === 'downvote' ? 'class="downvoted"' : ''}>
                    👎 ${comment.downvotes}
                </button>
    ` : `
        <span class="vote-display">👍 ${comment.upvotes}</span>
        <span class="vote-display">👎 ${comment.downvotes}</span>
        <span class="auth-required-text">Log in to vote</span>
    `;

    return `
        <div class="comment-wrapper ${isOwnComment ? 'own-comment' : 'other-comment'}">
            <div class="comment-card ${isVerified ? 'verified' : ''} ${isOwnComment ? 'own' : 'other'}">
                <div class="comment-header">
                    <div class="comment-avatar ${isOwnComment ? 'own-avatar' : ''}">${comment.commenter_name.charAt(0).toUpperCase()}</div>
                    <div class="comment-meta">
                        <span class="comment-author">${isOwnComment ? 'You' : comment.commenter_name}</span>
                        <span class="comment-time">${timeAgo(comment.created_at)}</span>
                    </div>
                    ${isVerified ? verificationButton : ''}
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="comment-footer">
                    <div class="comment-votes">
                        <span class="comment-score">Score: ${comment.upvotes - comment.downvotes}</span>
                    </div>
                    <div class="comment-actions">
                        ${votingButtons}
                        ${!isVerified && isAuthenticated && !isOwnComment && !isIssueResolved ? verificationButton : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupEventListeners(issueId) {
    // Comment form submission
    const commentForm = document.getElementById('add-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitComment(issueId);
        });
    }
    
    // Add voting buttons
    const upvoteBtn = document.getElementById('upvote-btn');
    const downvoteBtn = document.getElementById('downvote-btn');
    if (upvoteBtn) {
        upvoteBtn.addEventListener('click', () => voteIssue('upvote'));
    }
    if (downvoteBtn) {
        downvoteBtn.addEventListener('click', () => voteIssue('downvote'));
    }
    
    // Add move to CCR button
    const moveToCcrBtn = document.getElementById('move-ccr-btn');
    if (moveToCcrBtn) {
        moveToCcrBtn.addEventListener('click', () => moveToCcr(issueId));
    }
}

async function submitComment(issueId) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            showCommentMessage('You must be logged in to post comments. Please log in first.', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
    } catch (error) {
        showCommentMessage('Authentication check failed. Please log in.', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    const commentForm = document.getElementById('add-comment-form');
    const contentInput = document.getElementById('comment-content');
    const messageDiv = document.getElementById('comment-form-message');
    const submitBtn = commentForm.querySelector('.comment-submit-btn');
    
    const content = contentInput.value.trim();
    
    if (!content) {
        showCommentMessage('Please enter a comment', 'error');
        contentInput.focus();
        return;
    }
    
    // Show button loading state
    loading.showButtonLoading('comment-submit-btn', 'Posting...');
    
    try {
        const response = await fetch(`/api/issues/${issueId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content: content
            })
        });
        
        if (response.ok) {
            showCommentMessage('Comment posted successfully!', 'success');
            contentInput.value = '';
            
            // Reload comments after short delay
            setTimeout(() => {
                loadComments(issueId);
                clearCommentMessage();
            }, 1000);
        } else {
            const error = await response.json();
            showCommentMessage(`Error: ${error.error || 'Failed to post comment'}`, 'error');
        }
    } catch (error) {
        console.error('Error posting comment:', error);
        showCommentMessage('Error: Network error occurred', 'error');
    } finally {
        // Hide button loading state
        loading.hideButtonLoading('comment-submit-btn');
    }
}

function showCommentMessage(message, type) {
    const messageDiv = document.getElementById('comment-form-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `comment-message ${type}`;
    }
}

function clearCommentMessage() {
    const messageDiv = document.getElementById('comment-form-message');
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'comment-message';
    }
}

async function verifySolution(commentId) {
    // Check if issue is already resolved
    if (window.currentIssueStatus === 'resolved') {
        notifications.warning('Cannot mark solutions on resolved issues. This issue is already resolved.', 'Issue Already Resolved');
        return;
    }

    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to verify solutions. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    // Show loading overlay for verification
    loading.showOverlay('Verifying Solution', 'Please wait while we verify this solution...');
    
    try {
        const response = await fetch(`/api/comments/${commentId}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            // Reload the page to show updated status
            window.location.reload();
        } else {
            const error = await response.json();
            notifications.error(error.error || 'Failed to verify solution', 'Verification Error');
        }
    } catch (error) {
        console.error('Error verifying solution:', error);
        notifications.error('Network error occurred while verifying solution', 'Connection Error');
    }
}

async function upvoteComment(commentId) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to vote on comments. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    try {
        const response = await fetch(`/api/comments/${commentId}/upvote`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Reload comments to show updated votes
            const issueId = getIssueIdFromUrl();
            loadComments(issueId);
        }
    } catch (error) {
        console.error('Error upvoting comment:', error);
    }
}

async function downvoteComment(commentId) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to vote on comments. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    try {
        const response = await fetch(`/api/comments/${commentId}/downvote`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Reload comments to show updated votes
            const issueId = getIssueIdFromUrl();
            loadComments(issueId);
        }
    } catch (error) {
        console.error('Error downvoting comment:', error);
    }
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function voteIssue(voteType) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to vote. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    const issueId = getIssueIdFromUrl();
    if (!issueId) return;
    
    // Show quick loading for voting
    const buttonId = voteType === 'upvote' ? 'upvote-btn' : 'downvote-btn';
    const originalText = document.getElementById(buttonId)?.textContent;
    
    try {
        const endpoint = voteType === 'upvote' ? 'upvote' : 'downvote';
        const response = await fetch(`/api/issues/${issueId}/${endpoint}`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Reload the page to show updated votes
            window.location.reload();
        } else {
            console.error('Failed to vote:', response.status);
            notifications.error('Failed to register vote. Please try again.', 'Vote Error');
        }
    } catch (error) {
        console.error('Error voting:', error);
        notifications.error('Network error occurred while voting. Please try again.', 'Connection Error');
    }
}

async function moveToCcr(issueId) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to move issues to CCR. Please log in first.', 'Authentication Required');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }

    // First, get the current issue data to check status
    try {
        const issueResponse = await fetch(`/api/issues/${issueId}`);
        if (issueResponse.ok) {
            const issue = await issueResponse.json();
            if (issue.status === 'resolved') {
                notifications.warning('Cannot move resolved issues to CCR. Resolved issues should not be moved to CCR.', 'Invalid Operation');
                return;
            }
        }
    } catch (error) {
        console.error('Error checking issue status:', error);
    }
    
    const ccrNumber = await showPromptDialog('Move to CCR', 'Enter CCR number:');
    if (!ccrNumber) return;
    
    try {
        const response = await fetch(`/api/issues/${issueId}/move-to-ccr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ ccr_number: ccrNumber })
        });
        
        if (response.ok) {
            notifications.success('Issue moved to CCR successfully!', 'CCR Update');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            const error = await response.json();
            notifications.error(error.error || 'Failed to move to CCR', 'CCR Error');
        }
    } catch (error) {
        console.error('Error moving to CCR:', error);
        notifications.error('Network error occurred while moving to CCR', 'Connection Error');
    }
}

function getResolutionTime(createdAt, updatedAt) {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);
    const diffInSeconds = Math.floor((updated - created) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''}`;
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''}`;
}

// Image modal functions
function openImageModal(imageSrc, filename) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = createImageModal();
        document.body.appendChild(modal);
    }
    
    // Set image source and filename
    const modalImg = modal.querySelector('#modal-image');
    const modalFilename = modal.querySelector('#modal-filename');
    const downloadLink = modal.querySelector('#modal-download');
    
    modalImg.src = imageSrc;
    modalFilename.textContent = filename;
    downloadLink.href = imageSrc + '?download=true';
    downloadLink.download = filename;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

function createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <span id="modal-filename" class="modal-filename"></span>
                <div class="modal-actions">
                    <a id="modal-download" class="modal-download-btn" title="Download">
                        📥 Download
                    </a>
                    <button class="modal-close-btn" onclick="closeImageModal()" title="Close">
                        ✕
                    </button>
                </div>
            </div>
            <div class="modal-image-container">
                <img id="modal-image" class="modal-image" alt="Screenshot" />
            </div>
        </div>
    `;
    
    // Close modal when clicking outside or pressing Escape
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-overlay')) {
            closeImageModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeImageModal();
        }
    });
    
    return modal;
}

// Additional Testcase Paths Management
function updateAdditionalTestcasePaths(issue) {
    const additionalPathsList = document.getElementById('additional-testcases-list');
    if (!additionalPathsList) return;
    
    const additionalPaths = issue.additional_testcase_paths || [];
    
    // Always show the primary testcase path first
    let pathsHTML = `
        <div class="testcase-path-item primary-path">
            <div class="testcase-path-content">
                <div class="testcase-path-text">${issue.testcase_path}</div>
                <div class="testcase-path-meta">
                    <div class="testcase-release-platform">Release: ${issue.release || 'N/A'} | Platform: ${issue.platform_display || issue.platform || 'N/A'}</div>
                    <div style="font-size: 0.75rem; color: #059669; font-weight: 600;">PRIMARY PATH</div>
                </div>
            </div>
            <button type="button" class="copy-btn path-copy-btn" onclick="copyPathToClipboard('${issue.testcase_path}')" title="Copy path to clipboard">
                <span class="copy-icon">📋</span>
            </button>
        </div>
    `;
    
    // Add additional paths
    additionalPaths.forEach((pathData) => {
        pathsHTML += `
            <div class="testcase-path-item">
                <div class="testcase-path-content">
                    <div class="testcase-path-text">${pathData.testcase_path}</div>
                    <div class="testcase-path-meta">
                        <div class="testcase-release-platform">Release: ${pathData.release || 'N/A'} | Platform: ${pathData.platform_display || pathData.platform || 'N/A'}</div>
                        <button class="remove-testcase-btn" onclick="removeTestcasePath(${pathData.id})">Remove</button>
                    </div>
                </div>
                <button type="button" class="copy-btn path-copy-btn" onclick="copyPathToClipboard('${pathData.testcase_path}')" title="Copy path to clipboard">
                    <span class="copy-icon">📋</span>
                </button>
            </div>
        `;
    });
    
    if (additionalPaths.length === 0) {
        pathsHTML += `
            <div class="no-additional-paths" style="text-align: center; color: #6b7280; font-style: italic; padding: 20px;">
                No additional testcase paths added yet. Use the form below to add paths where this issue also appears.
            </div>
        `;
    }
    
    additionalPathsList.innerHTML = pathsHTML;
}

// Copy path directly (for additional testcase paths)
async function copyPathToClipboard(pathText) {
    try {
        // Use the modern Clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(pathText);
            showPathCopySuccess(pathText);
            notifications.success(`Copied: ${pathText}`, 'Copied to Clipboard');
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = pathText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showPathCopySuccess(pathText);
                notifications.success(`Copied: ${pathText}`, 'Copied to Clipboard');
            } catch (err) {
                console.error('Fallback copy failed:', err);
                notifications.error('Failed to copy to clipboard', 'Copy Error');
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        notifications.error('Failed to copy to clipboard', 'Copy Error');
    }
}

// Show visual feedback for path copy buttons
function showPathCopySuccess(pathText) {
    const copyBtns = document.querySelectorAll(`button[onclick="copyPathToClipboard('${pathText}')"]`);
    copyBtns.forEach(copyBtn => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<span class="copy-icon">✓</span>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    });
}

async function addTestcasePath() {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to add testcase paths. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    const pathInput = document.getElementById('new-testcase-path');
    const newPath = pathInput.value.trim();
    
    if (!newPath) {
        notifications.warning('Please enter a testcase path', 'Missing Input');
        pathInput.focus();
        return;
    }
    
    // Validate path format (basic validation)
    if (!newPath.includes('/lan/fed/') || !newPath.includes('/etautotest/')) {
        const shouldContinue = await showConfirmDialog(
            'Path Format Warning',
            'The path format doesn\'t match the expected pattern. Do you want to add it anyway?'
        );
        if (!shouldContinue) {
            return;
        }
    }
    
    const issueId = getIssueIdFromUrl();
    if (!issueId) return;
    
    try {
        const response = await fetch(`/api/issues/${issueId}/add-testcase-path`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ testcase_path: newPath })
        });
        
        if (response.ok) {
            pathInput.value = '';
            
            // Show success message with bucket name info if available
            const bucketName = extractBucketName(newPath);
            if (bucketName) {
                notifications.success(`Testcase path added successfully! "${bucketName}" was automatically added as a tag.`, 'Path Added');
            } else {
            notifications.success('Testcase path added successfully!', 'Path Added');
            }
            
            // Reload the issue to get updated data
            loadIssueDetail(issueId);
        } else {
            const error = await response.json();
            notifications.error(error.error || 'Failed to add testcase path', 'Validation Error');
        }
    } catch (error) {
        console.error('Error adding testcase path:', error);
        notifications.error('Network error occurred while adding testcase path', 'Connection Error');
    }
}

// Extract bucket name from testcase path
function extractBucketName(path) {
    if (!path) return null;
    
    const pattern = /\/lan\/fed\/etpv5\/release\/\d+\/[^/]+\/etautotest\/([^/]+)/;
    const match = path.match(pattern);
    
    if (match) {
        // Convert to uppercase for consistency with backend and reviewer mapping
        return match[1].toUpperCase();
    }
    return null;
}

// Add event listener for testcase path input to show bucket info
document.addEventListener('DOMContentLoaded', function() {
    const pathInput = document.getElementById('new-testcase-path');
    if (pathInput) {
        pathInput.addEventListener('input', function() {
            const path = this.value;
            const bucketName = extractBucketName(path);
            const formHint = document.querySelector('.form-hint');
            
            if (bucketName && formHint) {
                formHint.innerHTML = `Add paths where this same issue appears in other testcases. <br><span style="color: #059669; font-weight: 600;">📦 "${bucketName}" will be automatically added as a tag</span>`;
            } else if (formHint) {
                formHint.innerHTML = 'Add paths where this same issue appears in other testcases';
            }
        });
    }
});

async function removeTestcasePath(pathId) {
    // Check authentication first
    try {
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authResponse.ok) {
            notifications.error('You must be logged in to remove testcase paths. Please log in first.', 'Authentication Required');
            return;
        }
    } catch (error) {
        notifications.error('Authentication check failed. Please log in.', 'Authentication Error');
        return;
    }

    const shouldRemove = await showConfirmDialog(
        'Remove Testcase Path',
        'Are you sure you want to remove this testcase path?'
    );
    if (!shouldRemove) {
        return;
    }
    
    const issueId = getIssueIdFromUrl();
    if (!issueId) return;
    
    try {
        const response = await fetch(`/api/issues/${issueId}/remove-testcase-path/${pathId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            notifications.success('Testcase path removed successfully!', 'Path Removed');
            // Reload the issue to get updated data
            loadIssueDetail(issueId);
        } else {
            const error = await response.json();
            notifications.error(error.error || 'Failed to remove testcase path', 'Removal Error');
        }
    } catch (error) {
        console.error('Error removing testcase path:', error);
        notifications.error('Network error occurred while removing testcase path', 'Connection Error');
    }
}

// Parse testcase path to extract release and platform info (for frontend validation)
function parseTestcasePath(path) {
    const pattern = /\/lan\/fed\/etpv5\/release\/(\d+)\/([^/]+)\/etautotest\//;
    const match = path.match(pattern);
    if (match) {
        return {
            release: match[1],
            platform: match[2]
        };
    }
    return null;
}

function addIssueVotingUI(issue) {
    // Remove existing voting UI if it exists
    const existingVotingDiv = document.getElementById('issue-voting');
    if (existingVotingDiv) {
        existingVotingDiv.remove();
    }
    
    // Create voting UI
    const votingDiv = document.createElement('div');
    votingDiv.id = 'issue-voting';
    votingDiv.className = 'issue-voting-section';
    
    if (window.currentUserAuthenticated) {
        votingDiv.innerHTML = `
            <div class="voting-buttons">
                <button id="upvote-btn" class="vote-btn upvote-btn" onclick="voteIssue('upvote')">
                    👍 ${issue.upvotes || 0}
                </button>
                <button id="downvote-btn" class="vote-btn downvote-btn" onclick="voteIssue('downvote')">
                    👎 ${issue.downvotes || 0}
                </button>
                <span class="vote-score">Score: ${(issue.upvotes || 0) - (issue.downvotes || 0)}</span>
            </div>
        `;
    } else {
        votingDiv.innerHTML = `
            <div class="voting-display">
                <span class="vote-display">👍 ${issue.upvotes || 0}</span>
                <span class="vote-display">👎 ${issue.downvotes || 0}</span>
                <span class="vote-score">Score: ${(issue.upvotes || 0) - (issue.downvotes || 0)}</span>
                <span class="auth-required-text">Log in to vote</span>
            </div>
        `;
    }
    
    // Insert voting UI after the issue metadata
    const metadataSection = document.querySelector('.issue-metadata-grid');
    if (metadataSection) {
        metadataSection.after(votingDiv);
    }
}

// Copy to clipboard function
async function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        notifications.error('Could not find element to copy', 'Copy Error');
        return;
    }
    
    const textToCopy = element.textContent || element.innerText;
    if (!textToCopy) {
        notifications.warning('No text to copy', 'Copy Warning');
        return;
    }
    
    try {
        // Use the modern Clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
            showCopySuccess(elementId);
            notifications.success(`Copied: ${textToCopy}`, 'Copied to Clipboard');
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopySuccess(elementId);
                notifications.success(`Copied: ${textToCopy}`, 'Copied to Clipboard');
            } catch (err) {
                console.error('Fallback copy failed:', err);
                notifications.error('Failed to copy to clipboard', 'Copy Error');
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        notifications.error('Failed to copy to clipboard', 'Copy Error');
    }
}

// Show visual feedback when copy is successful
function showCopySuccess(elementId) {
    const copyBtn = document.querySelector(`button[onclick="copyToClipboard('${elementId}')"]`);
    if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<span class="copy-icon">✓</span>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }
}