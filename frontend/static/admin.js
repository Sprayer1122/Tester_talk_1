document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Admin Panel...');
    

    
    // Check authentication and admin status
    checkAdminAuth();
    
    // Load initial data
    loadUsers();
    loadIssuesForAdmin();
    loadBucketReviewerData();
    
    // Add event listeners for elements that exist
    
    // Bucket reviewer management functionality
    document.getElementById('add-bucket-reviewer').addEventListener('click', addBucketReviewer);
    document.getElementById('clear-bucket-form').addEventListener('click', clearBucketForm);
    
    console.log('✅ Admin Panel initialized');
});

async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        
        const user = await response.json();
        if (user.role !== 'admin') {
            notifications.error('Access denied. Admin privileges required.', 'Permission Denied');
            window.location.href = '/';
            return;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        window.location.href = '/login.html';
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

async function loadUsers() {
    console.log('👥 Loading users...');
    

    
    try {
        const response = await fetch('/api/admin/users', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const users = await response.json();
            renderUsersTable(users);
            console.log('✅ Users loaded successfully');
            

        } else {
            console.error('❌ Failed to load users');
            const tbody = document.getElementById('users-tbody');
            tbody.innerHTML = '<tr><td colspan="7"><div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Error loading users. Please try again.</div></div></td></tr>';
        }
    } catch (error) {
        console.error('❌ Error loading users:', error);
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = '<tr><td colspan="7"><div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Network error loading users. Please check your connection.</div></div></td></tr>';
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <select onchange="updateUserRole(${user.id}, this.value)" ${user.role === 'admin' ? 'disabled' : ''}>
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td>
                <select onchange="updateUserStatus(${user.id}, this.value)" ${user.role === 'admin' ? 'disabled' : ''}>
                    <option value="true" ${user.is_active ? 'selected' : ''}>Active</option>
                    <option value="false" ${!user.is_active ? 'selected' : ''}>Inactive</option>
                </select>
            </td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})" ${user.role === 'admin' ? 'disabled' : ''}>Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateUserRole(userId, role) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ role })
        });
        
        if (response.ok) {
            notifications.success('User role updated successfully!', 'Role Updated');
            loadUsers(); // Reload table
        } else {
            notifications.error('Failed to update user role', 'Update Error');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        notifications.error('Network error occurred while updating user role', 'Connection Error');
    }
}

async function updateUserStatus(userId, isActive) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_active: isActive === 'true' })
        });
        
        if (response.ok) {
            notifications.success('User status updated successfully!', 'Status Updated');
            loadUsers(); // Reload table
        } else {
            notifications.error('Failed to update user status', 'Update Error');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        notifications.error('Network error occurred while updating user status', 'Connection Error');
    }
}

async function loadIssuesForAdmin() {
    const status = document.getElementById('admin-status-filter').value;
    const severity = document.getElementById('admin-severity-filter').value;
    
    console.log('📋 Loading issues for admin...');
    

    
    try {
        let url = '/api/issues?per_page=50';
        if (status) url += `&status=${status}`;
        if (severity) url += `&severity=${severity}`;
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            renderIssuesTable(data.issues);
            console.log('✅ Issues loaded successfully');
        } else {
            console.error('❌ Failed to load issues');
            const tbody = document.getElementById('issues-tbody');
            tbody.innerHTML = '<tr><td colspan="7"><div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Error loading issues. Please try again.</div></div></td></tr>';
        }
    } catch (error) {
        console.error('❌ Error loading issues:', error);
        const tbody = document.getElementById('issues-tbody');
        tbody.innerHTML = '<tr><td colspan="7"><div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Network error loading issues. Please check your connection.</div></div></td></tr>';
    }
}

function renderIssuesTable(issues) {
    const tbody = document.getElementById('issues-tbody');
    tbody.innerHTML = '';
    
    issues.forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${issue.id}</td>
            <td>${issue.testcase_title.substring(0, 50)}${issue.testcase_title.length > 50 ? '...' : ''}</td>
            <td>
                <select onchange="updateIssueStatus(${issue.id}, this.value)">
                    <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                    <option value="in_progress" ${issue.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                    <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed</option>
                    <option value="ccr" ${issue.status === 'ccr' ? 'selected' : ''}>CCR</option>
                </select>
            </td>
            <td>${issue.severity}</td>
            <td>${issue.reporter_name}</td>
            <td>${new Date(issue.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editIssue(${issue.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteIssue(${issue.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateIssueStatus(issueId, status) {
    try {
        const response = await fetch(`/api/issues/${issueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            notifications.success('Issue status updated successfully!', 'Status Updated');
            loadIssuesForAdmin(); // Reload table
        } else {
            notifications.error('Failed to update issue status', 'Update Error');
        }
    } catch (error) {
        console.error('Error updating issue status:', error);
        notifications.error('Network error occurred while updating issue status', 'Connection Error');
    }
}

async function deleteIssue(issueId) {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/issues/${issueId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            notifications.success('Issue deleted successfully!', 'Issue Deleted');
            loadIssuesForAdmin(); // Reload table
        } else {
            notifications.error('Failed to delete issue', 'Delete Error');
        }
    } catch (error) {
        console.error('Error deleting issue:', error);
        notifications.error('Network error occurred while deleting issue', 'Connection Error');
    }
}

async function bulkDeleteIssues() {
    const status = document.getElementById('bulk-status-filter').value;
    const severity = document.getElementById('bulk-severity-filter').value;
    
    if (!confirm('Are you sure you want to delete ALL issues matching the selected filters? This action cannot be undone.')) {
        return;
    }
    

    
    try {
        // Get issue IDs that match the filters
        let url = '/api/admin/issues/ids';
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (severity) params.append('severity', severity);
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.issue_ids.length === 0) {
                notifications.warning('No issues found matching the selected filters', 'No Matches');
                return;
            }
            
            // Delete the issues
            const deleteResponse = await fetch('/api/admin/issues/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ issue_ids: data.issue_ids })
            });
            
            if (deleteResponse.ok) {
                const result = await deleteResponse.json();
                notifications.success(`Successfully deleted ${result.deleted_count} issues`, 'Bulk Delete Complete');
                loadIssuesForAdmin(); // Reload table
            } else {
                notifications.error('Failed to delete issues', 'Bulk Delete Error');
            }
        } else {
            notifications.error('Failed to get issue IDs for deletion', 'Query Error');
        }
    } catch (error) {
        console.error('Error in bulk delete:', error);
        notifications.error('Network error occurred during bulk delete', 'Connection Error');
    }
}

function editIssue(issueId) {
    // Redirect to issue detail page for editing
    window.location.href = `/issues/${issueId}`;
}

// Bucket Reviewer Management
async function loadBucketReviewerData() {
    console.log('🏷️ Loading bucket reviewer data...');
    
    try {
        // Load available reviewers
        console.log('📡 Fetching available reviewers...');
        const reviewersResponse = await fetch('/api/admin/available-reviewers', {
            credentials: 'include'
        });
        
        if (reviewersResponse.ok) {
            const reviewers = await reviewersResponse.json();
            console.log('✅ Available reviewers loaded:', reviewers);
            populateReviewerSelect(reviewers);
        } else {
            console.error('❌ Failed to load available reviewers:', reviewersResponse.status);
        }
        
        // Load current mappings
        console.log('📡 Fetching bucket reviewer mappings...');
        const mappingsResponse = await fetch('/api/admin/bucket-reviewers', {
            credentials: 'include'
        });
        
        if (mappingsResponse.ok) {
            const mappings = await mappingsResponse.json();
            console.log('✅ Bucket reviewer mappings loaded:', mappings);
            displayBucketReviewers(mappings);
        } else {
            console.error('❌ Failed to load bucket reviewer mappings:', mappingsResponse.status);
            throw new Error('Failed to load bucket reviewer mappings');
        }
    } catch (error) {
        console.error('❌ Error loading bucket reviewer data:', error);
        const loadingElement = document.getElementById('bucket-reviewers-loading');
        if (loadingElement) {
            loadingElement.innerHTML = '<p class="error">Error loading data</p>';
        }
    }
}

function populateReviewerSelect(reviewers) {
    const select = document.getElementById('reviewer-select');
    select.innerHTML = '<option value="">Select a reviewer...</option>';
    
    reviewers.forEach(reviewer => {
        const option = document.createElement('option');
        option.value = reviewer;
        option.textContent = reviewer;
        select.appendChild(option);
    });
}

function displayBucketReviewers(mappings) {
    console.log('🎨 Displaying bucket reviewers:', mappings);
    
    const loadingDiv = document.getElementById('bucket-reviewers-loading');
    const containerDiv = document.getElementById('bucket-reviewers-container');
    const listDiv = document.getElementById('bucket-reviewers-list');
    
    if (!loadingDiv || !containerDiv || !listDiv) {
        console.error('❌ Missing DOM elements for bucket reviewer display');
        return;
    }
    
    loadingDiv.style.display = 'none';
    containerDiv.style.display = 'block';
    
    if (mappings.length === 0) {
        listDiv.innerHTML = '<p class="empty-state">No bucket reviewer mappings found.</p>';
        console.log('ℹ️ No bucket reviewer mappings to display');
        return;
    }
    
    console.log(`📋 Rendering ${mappings.length} bucket reviewer mappings`);
    listDiv.innerHTML = '';
    mappings.forEach(mapping => {
        const mappingDiv = document.createElement('div');
        mappingDiv.className = 'bucket-reviewer-item';
        mappingDiv.innerHTML = `
            <span class="bucket-name">${mapping.bucket_name}</span>
            <span class="reviewer-name">👤 ${mapping.reviewer_name}</span>
            <div class="actions">
                <button class="btn btn-danger btn-small" onclick="deleteBucketReviewer(${mapping.id}, '${mapping.bucket_name}')">Delete</button>
            </div>
        `;
        listDiv.appendChild(mappingDiv);
    });
    console.log('✅ Bucket reviewer mappings displayed successfully');
}

async function addBucketReviewer() {
    const bucketName = document.getElementById('bucket-name').value.trim();
    const reviewerName = document.getElementById('reviewer-select').value;
    
    if (!bucketName || !reviewerName) {
        alert('Please provide both bucket name and reviewer name');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/bucket-reviewers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bucket_name: bucketName,
                reviewer_name: reviewerName
            }),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            clearBucketForm();
            loadBucketReviewerData(); // Refresh the data
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding bucket reviewer:', error);
        alert('Network error occurred');
    }
}

async function deleteBucketReviewer(id, bucketName) {
    if (!confirm(`Are you sure you want to delete the mapping for bucket "${bucketName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/bucket-reviewers/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            loadBucketReviewerData(); // Refresh the data
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting bucket reviewer:', error);
        alert('Network error occurred');
    }
}

function clearBucketForm() {
    document.getElementById('bucket-name').value = '';
    document.getElementById('reviewer-select').value = '';
} 