/**
 * Loading Utility System
 * Provides consistent loading states across the application
 */

class LoadingManager {
    constructor() {
        this.activeLoadings = new Set();
        this.minLoadingDuration = 15000; // Minimum 15 seconds to show loading - extremely conservative
        this.loadingStartTimes = new Map();
        this.createOverlay();
    }

    // Create the main loading overlay
    createOverlay() {
        if (document.getElementById('loading-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
                <div class="loading-subtext">Please wait while we process your request</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Show full screen loading overlay
    showOverlay(text = 'Loading...', subtext = 'Please wait while we process your request') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const textEl = overlay.querySelector('.loading-text');
            const subtextEl = overlay.querySelector('.loading-subtext');
            if (textEl) textEl.textContent = text;
            if (subtextEl) subtextEl.textContent = subtext;
            overlay.classList.add('show');
        }
    }

    // Smart loading methods that only show if operation takes longer than minimum duration
    showSmartOverlay(text = 'Loading...', subtext = 'Please wait while we process your request') {
        const startTime = Date.now();
        this.loadingStartTimes.set('overlay', startTime);
        
        // Delay showing the overlay
        setTimeout(() => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            // Only show if still loading and enough time has passed
            if (this.loadingStartTimes.get('overlay') === startTime && elapsed >= this.minLoadingDuration) {
                this.showOverlay(text, subtext);
            }
        }, this.minLoadingDuration);
    }

    hideSmartOverlay() {
        this.loadingStartTimes.delete('overlay');
        this.hideOverlay();
    }

    showSmartSearchLoading(containerId, text = 'Searching...') {
        const startTime = Date.now();
        this.loadingStartTimes.set(`search-${containerId}`, startTime);
        
        setTimeout(() => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (this.loadingStartTimes.get(`search-${containerId}`) === startTime && elapsed >= this.minLoadingDuration) {
                this.showSearchLoading(containerId, text);
            }
        }, this.minLoadingDuration);
    }

    hideSmartSearchLoading(containerId) {
        this.loadingStartTimes.delete(`search-${containerId}`);
        this.hideLoading(containerId);
    }

    showSmartFormLoading(formId, text = 'Processing...') {
        const startTime = Date.now();
        this.loadingStartTimes.set(`form-${formId}`, startTime);
        
        setTimeout(() => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            
            if (this.loadingStartTimes.get(`form-${formId}`) === startTime && elapsed >= this.minLoadingDuration) {
                this.showFormLoading(formId, text);
            }
        }, this.minLoadingDuration);
    }

    hideSmartFormLoading(formId) {
        this.loadingStartTimes.delete(`form-${formId}`);
        this.hideFormLoading(formId);
    }

    // Hide full screen loading overlay
    hideOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Show inline loading in a container
    showInline(containerId, text = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-inline';
        loadingEl.id = `loading-${containerId}`;
        loadingEl.innerHTML = `
            <div class="loading-spinner-small"></div>
            <span>${text}</span>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingEl);
        this.activeLoadings.add(containerId);
    }

    // Show search-specific loading
    showSearchLoading(containerId, text = 'Searching...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'search-loading';
        loadingEl.id = `loading-${containerId}`;
        loadingEl.innerHTML = `
            <div class="loading-spinner-small"></div>
            <span>${text}</span>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingEl);
        this.activeLoadings.add(containerId);
    }

    // Show comments loading
    showCommentsLoading(containerId, text = 'Loading comments...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'comments-loading';
        loadingEl.id = `loading-${containerId}`;
        loadingEl.innerHTML = `
            <div class="loading-spinner-small"></div>
            <span>${text}</span>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingEl);
        this.activeLoadings.add(containerId);
    }

    // Show skeleton loading for cards
    showSkeleton(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeletonEl = document.createElement('div');
            skeletonEl.className = 'skeleton-card';
            skeletonEl.innerHTML = `
                <div class="skeleton-line title"></div>
                <div class="skeleton-line subtitle"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            `;
            container.appendChild(skeletonEl);
        }
        this.activeLoadings.add(containerId);
    }

    // Show card loading placeholder
    showCardLoading(containerId, text = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'card-loading';
        loadingEl.id = `loading-${containerId}`;
        loadingEl.innerHTML = `
            <div class="loading-spinner-small"></div>
            <span>${text}</span>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingEl);
        this.activeLoadings.add(containerId);
    }

    // Hide loading for a specific container
    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.getElementById(`loading-${containerId}`);
        if (loadingEl) {
            loadingEl.remove();
        }
        this.activeLoadings.delete(containerId);
    }

    // Button loading states
    showButtonLoading(buttonId, loadingText = null) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        // Store original state
        button.dataset.originalText = button.textContent;
        button.dataset.originalDisabled = button.disabled;
        
        // Apply loading state
        button.disabled = true;
        button.classList.add('btn-loading');
        
        if (loadingText) {
            button.textContent = loadingText;
        }
    }

    hideButtonLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        // Restore original state
        button.disabled = button.dataset.originalDisabled === 'true';
        button.classList.remove('btn-loading');
        
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
        
        // Clean up data attributes
        delete button.dataset.originalText;
        delete button.dataset.originalDisabled;
    }

    // Form loading overlay
    showFormLoading(formId, text = 'Processing...') {
        const form = document.getElementById(formId);
        if (!form) return;

        // Make form container relative if not already
        if (getComputedStyle(form).position === 'static') {
            form.style.position = 'relative';
        }

        const loadingEl = document.createElement('div');
        loadingEl.className = 'form-loading';
        loadingEl.id = `loading-${formId}`;
        loadingEl.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
            </div>
        `;
        
        form.appendChild(loadingEl);
        this.activeLoadings.add(formId);
    }

    hideFormLoading(formId) {
        const loadingEl = document.getElementById(`loading-${formId}`);
        if (loadingEl) {
            loadingEl.remove();
        }
        this.activeLoadings.delete(formId);
    }

    // Professional dropdown loading state
    showDropdownLoading(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.disabled = true;
        select.innerHTML = '<option>Loading options...</option>';
        
        // Add a subtle loading indicator without spinning
        select.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M8 2a6 6 0 0 1 6 6h-2a4 4 0 0 0-4-4V2z\' fill=\'%236b7280\'/%3E%3C/svg%3E")';
        select.style.backgroundRepeat = 'no-repeat';
        select.style.backgroundPosition = 'right 12px center';
        select.style.backgroundSize = '16px';
        select.style.opacity = '0.7';
    }

    hideDropdownLoading(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.disabled = false;
        select.style.backgroundImage = '';
        select.style.opacity = '1';
    }

    // Professional page transition loading bar
    showPageLoading() {
        let loadingBar = document.getElementById('page-loading');
        if (!loadingBar) {
            loadingBar = document.createElement('div');
            loadingBar.id = 'page-loading';
            loadingBar.className = 'page-loading';
            loadingBar.innerHTML = '<div class="page-loading-bar"></div>';
            document.body.appendChild(loadingBar);
        }
        
        const bar = loadingBar.querySelector('.page-loading-bar');
        if (bar) {
            bar.style.width = '70%';
        }
    }

    hidePageLoading() {
        const loadingBar = document.getElementById('page-loading');
        if (loadingBar) {
            const bar = loadingBar.querySelector('.page-loading-bar');
            if (bar) {
                bar.style.width = '100%';
                setTimeout(() => {
                    loadingBar.remove();
                }, 300);
            }
        }
    }

    // Professional content loading state
    showContentLoading(containerId, text = 'Loading content...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingEl = document.createElement('div');
        loadingEl.className = 'content-loading';
        loadingEl.id = `loading-${containerId}`;
        loadingEl.innerHTML = `
            <div class="content-loading-spinner"></div>
            <div class="content-loading-text">${text}</div>
        `;
        
        container.innerHTML = '';
        container.appendChild(loadingEl);
        this.activeLoadings.add(containerId);
    }

    // Professional table loading state
    showTableLoading(containerId, rows = 5) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const skeletonRow = document.createElement('div');
            skeletonRow.className = 'table-skeleton-row';
            skeletonRow.innerHTML = `
                <div class="table-skeleton-cell"></div>
                <div class="table-skeleton-cell"></div>
                <div class="table-skeleton-cell"></div>
                <div class="table-skeleton-cell"></div>
            `;
            container.appendChild(skeletonRow);
        }
        this.activeLoadings.add(containerId);
    }

    // Utility function to add loading dots animation to text
    addLoadingDots(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('loading-dots');
        }
    }

    removeLoadingDots(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading-dots');
        }
    }

    // Clear all active loadings
    clearAllLoadings() {
        this.hideOverlay();
        this.hidePageLoading();
        
        this.activeLoadings.forEach(containerId => {
            this.hideLoading(containerId);
            this.hideFormLoading(containerId);
        });
        
        this.activeLoadings.clear();
    }

    // Check if any loading is active
    isLoading() {
        return this.activeLoadings.size > 0 || 
               document.getElementById('loading-overlay')?.classList.contains('show');
    }
}

// Create global loading manager instance
const loading = new LoadingManager();

// Export for module usage or global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loading, LoadingManager };
}

// Make available globally
window.loading = loading;

// Ensure loading system is properly initialized
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Loading system initialized');
    console.log('📊 Loading manager available:', !!window.loading);
    console.log('🔧 Loading methods available:', Object.getOwnPropertyNames(LoadingManager.prototype));
});

// Add error handling for loading system
window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('loading')) {
        console.error('❌ Loading system error:', event.error);
        // Try to recover loading system
        if (!window.loading) {
            console.log('🔄 Attempting to recover loading system...');
            window.loading = new LoadingManager();
        }
    }
});

// Utility functions for common loading patterns
window.showLoading = (text, subtext) => loading.showOverlay(text, subtext);
window.hideLoading = () => loading.hideOverlay();
window.showSearchLoading = (containerId, text) => loading.showSearchLoading(containerId, text);
window.showCommentsLoading = (containerId, text) => loading.showCommentsLoading(containerId, text);
window.showSkeleton = (containerId, count) => loading.showSkeleton(containerId, count);
window.showButtonLoading = (buttonId, text) => loading.showButtonLoading(buttonId, text);
window.hideButtonLoading = (buttonId) => loading.hideButtonLoading(buttonId);
window.showFormLoading = (formId, text) => loading.showFormLoading(formId, text);
window.hideFormLoading = (formId) => loading.hideFormLoading(formId);
window.showContentLoading = (containerId, text) => loading.showContentLoading(containerId, text);
window.showTableLoading = (containerId, rows) => loading.showTableLoading(containerId, rows);
window.showDropdownLoading = (selectId) => loading.showDropdownLoading(selectId);
window.hideDropdownLoading = (selectId) => loading.hideDropdownLoading(selectId);

// Smart loading utility functions
window.showSmartLoading = (text, subtext) => loading.showSmartOverlay(text, subtext);
window.hideSmartLoading = () => loading.hideSmartOverlay();
window.showSmartSearchLoading = (containerId, text) => loading.showSmartSearchLoading(containerId, text);
window.hideSmartSearchLoading = (containerId) => loading.hideSmartSearchLoading(containerId);
window.showSmartFormLoading = (formId, text) => loading.showSmartFormLoading(formId, text);
window.hideSmartFormLoading = (formId) => loading.hideSmartFormLoading(formId);

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    loading.clearAllLoadings();
});

// Debug mode (set window.loadingDebug = true to enable logging)
const originalMethods = {};
if (window.loadingDebug) {
    Object.getOwnPropertyNames(LoadingManager.prototype).forEach(method => {
        if (typeof LoadingManager.prototype[method] === 'function' && method !== 'constructor') {
            originalMethods[method] = LoadingManager.prototype[method];
            LoadingManager.prototype[method] = function(...args) {
                console.log(`[Loading] ${method} called with args:`, args);
                return originalMethods[method].apply(this, args);
            };
        }
    });
} 