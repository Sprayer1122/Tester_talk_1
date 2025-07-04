// SPA Router and App Skeleton
const app = document.getElementById('app');

function navigate(path) {
    window.history.pushState({}, '', path);
    renderRoute();
}

window.onpopstate = renderRoute;

async function renderHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    
    // Check authentication status
    let user = null;
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
            user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    } catch (error) {
        console.log('Not authenticated');
    }
    
    header.innerHTML = `
        <span class="logo">Tester Talk</span>
        <nav>
            <button class="btn" onclick="navigate('/')">Home</button>
            ${user ? `
                <button class="btn" onclick="navigate('/create')">Report Issue</button>
                ${user.role === 'admin' ? '<button class="btn" onclick="navigate(\'/admin.html\')">Admin</button>' : ''}
                <button class="btn" onclick="logout()">Logout (${user.username})</button>
            ` : '<button class="btn" onclick="navigate(\'/login.html\')">Login</button>'}
        </nav>
    `;
    app.innerHTML = '';
    app.appendChild(header);
}

function renderRoute() {
    const match = window.location.pathname.match(/^\/issues\/(\d+)$/);
    if (match) {
        issuesList.style.display = 'none';
        issueDetailView.style.display = 'block';
        showIssueDetail(match[1]);
    } else {
        issueDetailView.style.display = 'none';
        issuesList.style.display = '';
        performSearch();
    }
}

// Helper for API calls
async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorText;
            } catch {
                errorMessage = errorText || `HTTP ${res.status}: ${res.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        return res.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server. Please check your connection.');
        }
        throw error;
    }
}

// --- Debounce utility ---
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// --- SPA Main Logic for Tester Talk ---
const issuesList = document.getElementById('issues-list');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const statusSelect = document.getElementById('filter-status');
const severitySelect = document.getElementById('filter-severity');
const buildSelect = document.getElementById('filter-build');
const platformSelect = document.getElementById('filter-platform');
const releaseSelect = document.getElementById('filter-release');
const targetSelect = document.getElementById('filter-target');
const quickFilters = document.querySelectorAll('.quick-filter');
const issueDetailView = document.getElementById('issue-detail-view');

// --- Debounced search ---
const debouncedSearch = debounce(performSearch, 300);

// Authentication functions
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

// --- Check authentication status and update header ---
async function updateHeader() {
    const loginBtn = document.getElementById('login-btn');
    const createBtn = document.getElementById('create-issue-btn');
    const navCreateLink = document.getElementById('nav-create-link');
    const adminPanelLink = document.getElementById('admin-panel-link');
    
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
                console.log('Logout clicked');
                await logout();
            };
            
            // Show create issue options for authenticated users
            if (createBtn) createBtn.style.display = 'inline-block';
            if (navCreateLink) navCreateLink.style.display = 'inline-block';
            
            // Show admin panel link for admin users
            if (adminPanelLink) {
                if (user.role === 'admin') {
                    adminPanelLink.style.display = 'inline-block';
                } else {
                    adminPanelLink.style.display = 'none';
                }
            }
            
        } else {
            // User not logged in - ensure login button is set up correctly
            loginBtn.textContent = 'Login';
            loginBtn.className = 'btn btn-login';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Login clicked');
                window.location.href = '/login.html';
            };
            
            // Hide create issue options for non-authenticated users
            if (createBtn) createBtn.style.display = 'none';
            if (navCreateLink) navCreateLink.style.display = 'none';
            if (adminPanelLink) adminPanelLink.style.display = 'none';
        }
    } catch (error) {
        console.log('Not authenticated');
        loginBtn.textContent = 'Login';
        loginBtn.className = 'btn btn-login';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login clicked');
            window.location.href = '/login.html';
        };
        
        // Hide create issue options for non-authenticated users
        if (createBtn) createBtn.style.display = 'none';
        if (navCreateLink) navCreateLink.style.display = 'none';
        if (adminPanelLink) adminPanelLink.style.display = 'none';
    }
}

// --- On page load, render only the correct view ---
async function setupEventListeners() {
    // Check authentication status and update header first
    await updateHeader();
    
    // Add create issue button functionality
    const createBtn = document.getElementById('create-issue-btn');
    console.log('Create button found:', createBtn);
    if (createBtn) {
        createBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check authentication before allowing navigation
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                if (response.ok) {
                    console.log('Create button clicked, navigating to /create.html');
                    window.location.href = '/create.html';
                } else {
                    alert('You must be logged in to create an issue. Please log in first.');
                    window.location.href = '/login.html';
                }
            } catch (error) {
                alert('You must be logged in to create an issue. Please log in first.');
                window.location.href = '/login.html';
            }
        });
    } else {
        console.error('Create button not found!');
    }
    
    // Add authentication check for navigation create link
    const navCreateLink = document.getElementById('nav-create-link');
    if (navCreateLink) {
        navCreateLink.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check authentication before allowing navigation
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                if (response.ok) {
                    console.log('Navigation create link clicked, navigating to /create.html');
                    window.location.href = '/create.html';
                } else {
                    alert('You must be logged in to create an issue. Please log in first.');
                    window.location.href = '/login.html';
                }
            } catch (error) {
                alert('You must be logged in to create an issue. Please log in first.');
                window.location.href = '/login.html';
            }
        });
    }
    
    // Add search form functionality
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performSearch();
        });
    }
    
    // Add quick filter functionality
    quickFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            quickFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            // Set dropdowns to match quick filter
            if (filter.dataset.filter === 'all') {
                statusSelect.value = '';
            } else {
                statusSelect.value = filter.dataset.filter;
            }
            debouncedSearch();
        });
    });
    
    // Add change listeners to all filters
    [statusSelect, severitySelect, buildSelect, platformSelect, releaseSelect, targetSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', () => {
                // Sync quick filters with status
                if (select === statusSelect) {
                    quickFilters.forEach(f => {
                        if (statusSelect.value === '' && f.dataset.filter === 'all') f.classList.add('active');
                        else if (f.dataset.filter === statusSelect.value) f.classList.add('active');
                        else f.classList.remove('active');
                    });
                }
                debouncedSearch();
            });
        }
    });
    
    // Populate dropdowns with real API data
    await populateDropdowns();
    
    const match = window.location.pathname.match(/^\/issues\/(\d+)$/);
    if (match) {
        issuesList.style.display = 'none';
        issueDetailView.style.display = 'block';
        showIssueDetail(match[1]);
    } else {
        issueDetailView.style.display = 'none';
        issuesList.style.display = '';
        performSearch();
    }
}

// --- Filter Options ---
const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Resolved", value: "resolved" },
  { label: "CCR", value: "ccr" }
];
const SEVERITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Critical", value: "Critical" }
];

// --- Populate Filter Dropdowns with Real API Data ---
async function populateDropdowns() {
    try {
        // Populate status and severity dropdowns
        populateSelect(statusSelect, STATUS_OPTIONS);
        populateSelect(severitySelect, SEVERITY_OPTIONS);

        // Populate builds from API
        await populateBuilds();
        
        // Populate platforms from API
        await populatePlatforms();
        
        // Populate releases from API
        await populateReleases();
        
        // Populate targets (will be populated when release is selected)
        targetSelect.innerHTML = '<option value="">Select Release First</option>';
        
    } catch (error) {
        console.error('Error populating dropdowns:', error);
        // Show user-friendly error message
        notifications.error('Failed to load some dropdown options. Some features may be limited.', 'Loading Error');
    }
}

function populateSelect(select, options) {
    select.innerHTML = '';
    options.forEach(opt => {
        const option = document.createElement('option');
        if (typeof opt === 'object') {
            option.value = opt.value;
            option.textContent = opt.label;
        } else {
            option.value = opt === 'All' ? '' : opt;
            option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ');
        }
        select.appendChild(option);
    });
}

async function populateBuilds() {
    try {
        const response = await fetch('/api/builds');
        if (response.ok) {
            const builds = await response.json();
            buildSelect.innerHTML = '<option value="">All</option>';
            builds.forEach(build => {
                const option = document.createElement('option');
                option.value = build;
                option.textContent = build;
                buildSelect.appendChild(option);
            });
        } else {
            // Fallback to hardcoded builds
            const builds = ['Weekly', 'Daily', 'Daily Plus'];
            buildSelect.innerHTML = '<option value="">All</option>';
            builds.forEach(build => {
                const option = document.createElement('option');
                option.value = build;
                option.textContent = build;
                buildSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching builds:', error);
        // Fallback to hardcoded builds
        const builds = ['Weekly', 'Daily', 'Daily Plus'];
        buildSelect.innerHTML = '<option value="">All</option>';
        builds.forEach(build => {
            const option = document.createElement('option');
            option.value = build;
            option.textContent = build;
            buildSelect.appendChild(option);
        });
    }
}

async function populatePlatforms() {
    const platforms = [
        { code: 'lnx86', display: 'Linux' },
        { code: 'LR', display: 'LR' },
        { code: 'RHEL7.6', display: 'RHEL7.6' },
        { code: 'CENTOS7.4', display: 'CENTOS7.4' },
        { code: 'SLES12SP#', display: 'SLES12SP#' },
        { code: 'LOP', display: 'LOP' }
    ];
    platformSelect.innerHTML = '<option value="">All</option>';
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.code;
        option.textContent = platform.display;
        platformSelect.appendChild(option);
    });
}

async function populateReleases() {
    const releases = ['261', '251', '231'];
    releaseSelect.innerHTML = '<option value="">All</option>';
    releases.forEach(release => {
        const option = document.createElement('option');
        option.value = release;
        option.textContent = release;
        releaseSelect.appendChild(option);
    });
}

async function populateTargets(release) {
    if (!release) {
        targetSelect.innerHTML = '<option value="">Select Release First</option>';
        targetSelect.disabled = true;
        return;
    }
    
    try {
        const response = await fetch(`/api/targets/${release}`);
        if (response.ok) {
            const targets = await response.json();
            targetSelect.innerHTML = '<option value="">All</option>';
            targets.forEach(target => {
                const option = document.createElement('option');
                option.value = target;
                option.textContent = target;
                targetSelect.appendChild(option);
            });
            targetSelect.disabled = false;
        } else {
            targetSelect.innerHTML = '<option value="">Error loading targets</option>';
            targetSelect.disabled = true;
        }
    } catch (error) {
        console.error('Error fetching targets:', error);
        targetSelect.innerHTML = '<option value="">Error loading targets</option>';
        targetSelect.disabled = true;
    }
}

releaseSelect.addEventListener('change', e => {
    populateTargets(releaseSelect.value);
});

// --- Unified search function ---
async function performSearch() {
    console.log('🔍 Performing search...');
    

    
    const query = searchInput.value.trim();
    const status = statusSelect.value;
    const severity = severitySelect.value;
    const build = buildSelect.value;
    const platform = platformSelect.value;
    const release = releaseSelect.value;
    const target = targetSelect.value;
    
    try {
        const payload = {};
        if (query) payload.search = query;
        if (status) payload.status = status;
        if (severity) payload.severity = severity;
        if (build) payload.build = build;
        if (platform) payload.platform = platform;
        if (release) payload.release = release;
        if (target) payload.target = target;
        
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            renderIssuesList(data.issues || []);
            console.log('✅ Search completed successfully');
        } else {
            issuesList.innerHTML = '<div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Error loading issues. Please try again.</div></div>';
        }
    } catch (error) {
        console.error('❌ Search error:', error);
        issuesList.innerHTML = '<div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Network error occurred. Please check your connection and try again.</div></div>';
    }
}

function renderIssuesList(issues) {
    if (!issues.length) {
        issuesList.innerHTML = '<div>No issues found.</div>';
        return;
    }
    
    issuesList.innerHTML = '';
    issues.forEach(issue => {
        issuesList.appendChild(renderIssueCard(issue));
    });
}

function renderIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.style.cursor = 'pointer';
    card.style.position = 'relative';
    card.addEventListener('click', e => {
        e.stopPropagation();
        window.location.href = `/issues/${issue.id}`;
    });
    
    // CCR badge if status is ccr
    if (issue.status === 'ccr' && issue.test_case_ids) {
        const ccrBadge = document.createElement('div');
        ccrBadge.className = 'ccr-badge';
        ccrBadge.textContent = `CCR: ${issue.test_case_ids}`;
        ccrBadge.style.position = 'absolute';
        ccrBadge.style.top = '18px';
        ccrBadge.style.right = '18px';
        ccrBadge.style.background = '#d1fae5';
        ccrBadge.style.color = '#059669';
        ccrBadge.style.padding = '6px 18px';
        ccrBadge.style.borderRadius = '20px';
        ccrBadge.style.fontWeight = '600';
        ccrBadge.style.fontSize = '1.05rem';
        card.appendChild(ccrBadge);
    }
    
    // Tags
    const tags = document.createElement('div');
    tags.className = 'issue-tags';
    
    // Status tag
    tags.appendChild(makeTag(issue.status.toUpperCase(), 'status-' + issue.status));
    
    // Severity tag
    tags.appendChild(makeTag(issue.severity, 'severity-' + issue.severity));
    
    // Solved tag if verified solution exists
    if (issue.has_verified_solution) {
        tags.appendChild(makeTag('✔ Solved', 'solved'));
    }
    
    // Custom tags (like bucket names)
    if (issue.tags && issue.tags.length > 0) {
        issue.tags.forEach(tag => {
            tags.appendChild(makeTag(tag, 'custom-tag'));
        });
    }
    
    card.appendChild(tags);
    
    // Title
    const title = document.createElement('div');
    title.className = 'issue-title';
    title.textContent = issue.testcase_title;
    card.appendChild(title);
    
    // Path
    const path = document.createElement('div');
    path.className = 'issue-path';
    path.textContent = issue.testcase_path;
    card.appendChild(path);
    
    // Meta information in structured grid
    const meta = document.createElement('div');
    meta.className = 'issue-meta-grid';
    meta.innerHTML = `
        <div class="meta-row">
            <div class="meta-field">
                <span class="meta-label">Test Case ID(s):</span>
                <span class="meta-value">${issue.test_case_ids}</span>
            </div>
            <div class="meta-field">
                <span class="meta-label">Reporter:</span>
                <span class="meta-value">${issue.reporter_name}</span>
            </div>
            <div class="meta-field">
                <span class="meta-label">Release:</span>
                <span class="meta-value">${issue.release || '-'}</span>
            </div>
        </div>
        <div class="meta-row">
            <div class="meta-field">
                <span class="meta-label">Platform:</span>
                <span class="meta-value">${issue.platform_display || issue.platform || '-'}</span>
            </div>
            <div class="meta-field">
                <span class="meta-label">Build:</span>
                <span class="meta-value">${issue.build || '-'}</span>
            </div>
            <div class="meta-field">
                <span class="meta-label">Reviewer:</span>
                <span class="meta-value reviewer-name">👤 ${issue.reviewer_name || 'Admin'}</span>
            </div>
        </div>
    `;
    card.appendChild(meta);
    
    // Description
    const desc = document.createElement('div');
    desc.className = 'issue-desc';
    desc.textContent = issue.description.substring(0, 200) + (issue.description.length > 200 ? '...' : '');
    card.appendChild(desc);
    
    // Resolution indicator for resolved issues
    if (issue.status === 'resolved' && issue.updated_at && issue.created_at) {
        const resolutionTime = getResolutionTime(issue.created_at, issue.updated_at);
        if (resolutionTime) {
            const resolvedIndicator = document.createElement('div');
            resolvedIndicator.className = 'resolved-indicator';
            resolvedIndicator.innerHTML = `
                <span class="resolved-icon">✓</span>
                <span class="resolved-text">Resolved in ${resolutionTime}</span>
            `;
            card.appendChild(resolvedIndicator);
        }
    }

    // Footer with time, comments, score, and created info
    const footer = document.createElement('div');
    footer.className = 'issue-footer';
    footer.innerHTML = `
        <div class="footer-left">
            <span class="time-ago">&#x1F550; ${timeAgo(issue.created_at)}</span>
            <span class="comment-count">${issue.comment_count || 0} comments</span>
            <span class="testcase-count">Found in: ${1 + (issue.additional_testcase_paths?.length || 0)} testcase(s)</span>
        </div>
        <div class="footer-right">
            <span class="created-date">Created: ${new Date(issue.created_at).toLocaleString()}</span>
        </div>
    `;
    card.appendChild(footer);
    
    return card;
}

async function showIssueDetail(issueId) {
    try {
        const response = await fetch(`/api/issues/${issueId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const issue = await response.json();
        issueDetailView.innerHTML = renderIssueDetailHTML(issue);
        
        // Add event listeners for voting and commenting
        addIssueDetailEventListeners(issueId);
        
    } catch (error) {
        console.error('Error fetching issue details:', error);
        issueDetailView.innerHTML = '<div>Error loading issue details.</div>';
    }
}

function renderIssueDetailHTML(issue) {
    const resolutionIndicator = issue.status === 'resolved' && issue.updated_at && issue.created_at ? 
        `<div class="resolved-indicator">
            <span class="resolved-icon">✓</span>
            <span class="resolved-text">Resolved in ${getResolutionTime(issue.created_at, issue.updated_at)}</span>
         </div>` : '';
    
    return `
        <div class="issue-detail-card">
            <h2>${issue.testcase_title}</h2>
            ${resolutionIndicator}
            <div class="detail-row-2col">
                <div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="tag status-${issue.status}">${issue.status.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Severity:</span>
                        <span class="tag severity-${issue.severity}">${issue.severity}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tags:</span>
                        <span>${issue.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</span>
                    </div>
                </div>
                <div>
                    <div class="detail-row">
                        <span class="detail-label">Created by:</span>
                        <span>${issue.reporter_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Created at:</span>
                        <span>${new Date(issue.created_at).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Score:</span>
                        <span class="score">${issue.score || 0}</span>
                    </div>
                </div>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <div class="desc-box readonly-field">${issue.description}</div>
            </div>
            ${issue.additional_comments ? `
            <div class="detail-row">
                <span class="detail-label">Additional Comments:</span>
                <div class="desc-box readonly-field">${issue.additional_comments}</div>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Test Case Path:</span>
                <div class="readonly-field">${issue.testcase_path}</div>
            </div>
            <div class="detail-row">
                <span class="detail-label">Test Case IDs:</span>
                <div class="readonly-field">${issue.test_case_ids}</div>
            </div>
            <div class="detail-row-2col">
                <div class="detail-row">
                    <span class="detail-label">Release:</span>
                    <div class="readonly-field">${issue.release || '-'}</div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Platform:</span>
                    <div class="readonly-field">${issue.platform_display || issue.platform || '-'}</div>
                </div>
            </div>
            <div class="detail-row-2col">
                <div class="detail-row">
                    <span class="detail-label">Build:</span>
                    <div class="readonly-field">${issue.build || '-'}</div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target:</span>
                    <div class="readonly-field">${issue.target || '-'}</div>
                </div>
            </div>
            
            <div class="comments-section">
                <h3>Comments (${issue.comments ? issue.comments.length : 0})</h3>
                <div id="comments-list">
                    ${issue.comments ? issue.comments.map(comment => renderCommentHTML(comment, issue)).join('') : ''}
                </div>
                <form id="add-comment-form">
                    <div class="form-section">
                        <label for="comment-content">Add a comment</label>
                        <textarea id="comment-content" name="content" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn">Post Comment</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderCommentHTML(comment, issue) {
    return `
        <div class="comment-card ${comment.is_verified_solution ? 'verified' : ''}">
            <div class="comment-header">
                <div class="comment-avatar">${comment.commenter_name.charAt(0).toUpperCase()}</div>
                <span class="comment-author">${comment.commenter_name}</span>
                <span class="comment-time">${timeAgo(comment.created_at)}</span>
                <span class="comment-votes">Score: ${comment.upvotes - comment.downvotes}</span>
                ${!comment.is_verified_solution ? `
                    <button class="verify-solution-btn" onclick="verifySolution(${comment.id})">Verify Solution</button>
                ` : ''}
            </div>
            <div class="comment-content">${comment.content}</div>
            <div class="comment-footer">
                <button onclick="upvoteComment(${comment.id})">👍 ${comment.upvotes}</button>
                <button onclick="downvoteComment(${comment.id})">👎 ${comment.downvotes}</button>
            </div>
        </div>
    `;
}

function makeTag(text, cls) {
    const tag = document.createElement('span');
    tag.className = `tag ${cls}`;
    tag.textContent = text;
    return tag;
}

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
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

function resolveTime(issue) {
    if (issue.status === 'resolved' && issue.updated_at) {
        return timeAgo(issue.updated_at);
    }
    return null;
}

// Navigation handling without loading screens
function addNavigationLoading() {
    // No loading screens for navigation - let the browser handle it naturally
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initializing Tester Talk application...');
        
        // Add navigation loading effects
        addNavigationLoading();
        
        // Setup event listeners and populate dropdowns
        await setupEventListeners();
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        loading.hideOverlay();
        loading.hideLoading('issues-list');
        issuesList.innerHTML = '<div class="content-loading"><div class="content-loading-spinner"></div><div class="content-loading-text">Failed to initialize application. Please refresh the page.</div></div>';
    }
}); 