document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Create Issue page...');
    
    // Check authentication first
    checkAuthenticationAndRedirect();
    
    // Update header (login/logout button)
    updateHeader();
    
    // Populate dropdowns with real API data
    populateDropdowns();
    
    // Auto-populate reporter name from current user
    populateReporterName();
    
    // Handle form submission
    const form = document.getElementById('create-issue-form');
    form.addEventListener('submit', handleFormSubmit);
    
    console.log('✅ Create Issue page initialized');
});

async function checkAuthenticationAndRedirect() {
    try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (!response.ok) {
            // User not authenticated, redirect to login
            alert('You must be logged in to create an issue. Redirecting to login page...');
            window.location.href = '/login.html';
            return;
        }
        
        const user = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Authentication check failed:', error);
        alert('You must be logged in to create an issue. Redirecting to login page...');
        window.location.href = '/login.html';
    }
}

async function populateReporterName() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            const reporterNameField = document.querySelector('input[name="reporter_name"]');
            if (reporterNameField && user.username) {
                reporterNameField.value = user.username;
                reporterNameField.setAttribute('readonly', true);
                reporterNameField.style.backgroundColor = '#f9fafb';
                reporterNameField.style.color = '#6b7280';
                reporterNameField.style.cursor = 'not-allowed';
            }
        }
    } catch (error) {
        console.log('Could not auto-populate reporter name:', error);
        const reporterNameField = document.querySelector('input[name="reporter_name"]');
        if (reporterNameField) {
            reporterNameField.value = 'Error loading username';
            reporterNameField.setAttribute('readonly', true);
        }
    }
}

async function populateDropdowns() {
    try {
        console.log('🔄 Populating dropdowns...');
        
        // Populate severity dropdown
        const severitySelect = document.getElementById('severity-select');
        const severities = ['Critical', 'High', 'Medium', 'Low'];
        severitySelect.innerHTML = '<option value="">Select Severity</option>';
        severities.forEach(severity => {
            const option = document.createElement('option');
            option.value = severity;
            option.textContent = severity;
            severitySelect.appendChild(option);
        });

        // Populate build dropdown from API
        await populateBuilds();

        // Populate target dropdown (will be populated when release is selected)
        const targetSelect = document.getElementById('target-select');
        targetSelect.innerHTML = '<option value="">Select Release First</option>';
        
        console.log('✅ Dropdowns populated successfully');

    } catch (error) {
        console.error('❌ Error populating dropdowns:', error);
    }
}

async function populateBuilds() {
    try {
        const response = await fetch('/api/builds');
        if (response.ok) {
            const builds = await response.json();
            const buildSelect = document.getElementById('build-select');
            buildSelect.innerHTML = '<option value="">Select Build</option>';
            builds.forEach(build => {
                const option = document.createElement('option');
                option.value = build;
                option.textContent = build;
                buildSelect.appendChild(option);
            });
        } else {
            // Fallback to hardcoded builds
            const builds = ['Weekly', 'Daily', 'Daily Plus'];
            const buildSelect = document.getElementById('build-select');
            buildSelect.innerHTML = '<option value="">Select Build</option>';
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
        const buildSelect = document.getElementById('build-select');
        buildSelect.innerHTML = '<option value="">Select Build</option>';
        builds.forEach(build => {
            const option = document.createElement('option');
            option.value = build;
            option.textContent = build;
            buildSelect.appendChild(option);
        });
    }
}

// Target options by release
const TARGETS_BY_RELEASE = {
  '261': ['26.10-d075_1_May_08'],
  '251': [
    '25.11-d065_1_Jun23',
    '25.11-d062_1_Jun_19',
    '25.11-d057_1_Jun_12',
    '25.11-d049_1Jun_05'
  ],
  '231': [
    '23.13-d014_1_Oct_23',
    '23.13-d012_1_Oct_15'
  ]
};

function populateTargetsForRelease(release) {
    const targetSelect = document.getElementById('target-select');
    
    targetSelect.innerHTML = '<option value="">Select Target</option>';
    
    if (release && TARGETS_BY_RELEASE[release]) {
        TARGETS_BY_RELEASE[release].forEach(target => {
            const option = document.createElement('option');
            option.value = target;
            option.textContent = target;
            targetSelect.appendChild(option);
        });
    }
}

// Platform code to display name mapping
const PLATFORM_MAP = {
    'lnx86': 'Linux',
    'LR': 'LR',
    'RHEL7.6': 'RHEL7.6',
    'CENTOS7.4': 'CENTOS7.4',
    'SLES12SP#': 'SLES12SP#',
    'LOP': 'LOP'
};
const RELEASES = ['251', '261', '231'];
const AREAS = ['etpv', 'etpv3', 'etpv5'];

function extractInfoFromPath(path) {
    // Regex: /lan/fed/<area>/release/<release>/<platform>/etautotest/
    const regex = /\/lan\/fed\/(etpv|etpv3|etpv5)\/release\/(251|261|231)\/([^/]+)\/etautotest\//;
    const match = path.match(regex);
    if (match) {
        const area = match[1];
        const release = match[2];
        const platformCode = match[3];
        const platform = PLATFORM_MAP[platformCode] || platformCode;
        return { area, release, platformCode, platform };
    }
    return null;
}

// Update info box and dropdowns when testcase path changes
function updateInfoFromPath() {
    const testcasePathInput = document.getElementById('testcase-path');
    const infoBox = document.getElementById('testcase-info-box');
    const bucketInfoBox = document.getElementById('bucket-info-box');
    const platformSelect = document.getElementById('platform-select');
    const targetSelect = document.getElementById('target-select');
    const path = testcasePathInput.value;
    const info = extractInfoFromPath(path);
    if (info) {
        // Update info box
        infoBox.innerHTML = `<b>Information:</b> Release: ${info.release} &nbsp;&nbsp; Platform: ${info.platform} (${info.platformCode})`;
        infoBox.style.color = '#2563eb';
        infoBox.style.background = '#e8f0fe';
        // Always update targets for this release
        populateTargetsForRelease(info.release);
        // Auto-select platform dropdown if present
        if (platformSelect) {
            platformSelect.value = info.platformCode;
        }
    } else {
        infoBox.innerHTML = `<i class="info-icon">ℹ</i> Information: Release and Platform will be extracted from the path.`;
        infoBox.style.color = '#475569';
        infoBox.style.background = '#f8fafc';
    }
    
    // Handle bucket name extraction and tag management
    const bucketName = extractBucketName(path);
    const previousBucketName = autoTags.length > 0 ? autoTags[0] : null;
    
    if (bucketName) {
        // Remove previous auto tag if it exists
        if (previousBucketName && previousBucketName !== bucketName) {
            removeAutoTag(previousBucketName);
        }
        
        // Add new bucket name as auto tag
        addAutoTag(bucketName);
        
        // Update bucket info box
        if (bucketInfoBox) {
            bucketInfoBox.innerHTML = `<b>Auto-Tag:</b> "${bucketName}" will be automatically added as a tag`;
            bucketInfoBox.style.color = '#059669';
            bucketInfoBox.style.background = '#ecfdf5';
            bucketInfoBox.style.display = 'block';
        }
    } else {
        // Remove previous auto tag if path no longer has bucket
        if (previousBucketName) {
            removeAutoTag(previousBucketName);
        }
        
        // Hide bucket info box
        if (bucketInfoBox) {
            bucketInfoBox.style.display = 'none';
        }
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

// Also update targets when release is changed manually
function onReleaseChange() {
    const releaseSelect = document.getElementById('release-select');
    if (releaseSelect) {
        populateTargetsForRelease(releaseSelect.value);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const testcasePathInput = document.getElementById('testcase-path');
    const tagInput = document.getElementById('tag-input');
    
    if (testcasePathInput) {
        testcasePathInput.addEventListener('input', updateInfoFromPath);
        // Initial update in case there's pre-filled data
        updateInfoFromPath();
    }
    
    // Handle Enter key for tag input
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
    
    // Initialize tag management
    initializeTagManagement();
    
    // Setup other event listeners
    const releaseSelect = document.getElementById('release-select');
    if (releaseSelect) {
        releaseSelect.addEventListener('change', onReleaseChange);
    }
});

// Global arrays to track tags
let manualTags = [];
let autoTags = [];

function initializeTagManagement() {
    updateTagsDisplay();
    updateHiddenTagsInput();
}

function addTag() {
    const tagInput = document.getElementById('tag-input');
    const tagValue = tagInput.value.trim();
    
    if (!tagValue) {
        return;
    }
    
    // Check if tag already exists
    if (manualTags.includes(tagValue) || autoTags.includes(tagValue)) {
        tagInput.value = '';
        return;
    }
    
    // Add to manual tags
    manualTags.push(tagValue);
    tagInput.value = '';
    
    updateTagsDisplay();
    updateHiddenTagsInput();
}

function removeTag(tagName, isAuto = false) {
    if (isAuto) {
        // Don't allow removing auto tags
        return;
    }
    
    manualTags = manualTags.filter(tag => tag !== tagName);
    updateTagsDisplay();
    updateHiddenTagsInput();
}

function updateTagsDisplay() {
    const addedTagsContainer = document.getElementById('added-tags');
    if (!addedTagsContainer) return;
    
    let tagsHTML = '';
    
    // Add auto tags (bucket names)
    autoTags.forEach(tag => {
        tagsHTML += `
            <div class="added-tag auto-tag">
                <span>🪣 ${tag}</span>
                <span class="tag-type">(auto)</span>
            </div>
        `;
    });
    
    // Add manual tags
    manualTags.forEach(tag => {
        tagsHTML += `
            <div class="added-tag">
                <span>${tag}</span>
                <button type="button" class="remove-tag" onclick="removeTag('${tag}')" title="Remove tag">×</button>
            </div>
        `;
    });
    
    addedTagsContainer.innerHTML = tagsHTML;
}

function updateHiddenTagsInput() {
    const hiddenInput = document.getElementById('tags-hidden-input');
    if (!hiddenInput) return;
    
    const allTags = [...autoTags, ...manualTags];
    hiddenInput.value = allTags.join(',');
}

function addAutoTag(tagName) {
    // Remove from manual tags if it exists there
    manualTags = manualTags.filter(tag => tag !== tagName);
    
    // Add to auto tags if not already there
    if (!autoTags.includes(tagName)) {
        autoTags.push(tagName);
        updateTagsDisplay();
        updateHiddenTagsInput();
    }
}

function removeAutoTag(tagName) {
    autoTags = autoTags.filter(tag => tag !== tagName);
    updateTagsDisplay();
    updateHiddenTagsInput();
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('form-message');
    
    try {
        console.log('📝 Submitting issue...');
        
        // Reporter name will be automatically set by the backend from the authenticated user
        // No need to manually include it in form data as the backend will override it anyway
        
        // Validate required fields (reporter_name is auto-populated)
        const requiredFields = ['testcase_title', 'testcase_path', 'severity', 'description'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                missingFields.push(field.replace('_', ' '));
            }
        });
        
        if (missingFields.length > 0) {
            notifications.warning(`Please fill in all required fields: ${missingFields.join(', ')}`, 'Missing Fields');
            // Focus on first missing field
            const firstMissingField = document.querySelector(`[name="${requiredFields.find(field => missingFields.includes(field.replace('_', ' ')))}"]`);
            if (firstMissingField) firstMissingField.focus();
            return;
        }
        
        // Debug: Log all form data before sending
        console.log('DEBUG: FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // Send form data to backend
        const response = await fetch('/api/issues', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            notifications.success('Issue created successfully! Redirecting to issue details...', 'Issue Created');
            
            // Clear the form
            form.reset();
            
            // Redirect to the new issue detail page
            setTimeout(() => {
                window.location.href = `/issues/${result.id}`;
            }, 1500);
        } else {
            const error = await response.json();
            notifications.error(error.error || 'Failed to create issue', 'Creation Error');
        }
        } catch (error) {
        console.error('Error submitting form:', error);
        notifications.error('Network error occurred while creating issue', 'Connection Error');
    }
} 