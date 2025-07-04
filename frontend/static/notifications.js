/**
 * Professional Notification System
 * Replaces browser alerts with styled toast notifications
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }
    }

    show(message, type = 'info', title = null, duration = 5000) {
        const id = Date.now() + Math.random();
        const notification = this.createNotification(id, message, type, title, duration);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove after duration (if duration > 0)
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    createNotification(id, message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icon = this.getIcon(type);
        const notificationTitle = title || this.getDefaultTitle(type);

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${notificationTitle}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="notifications.hide(${id})">×</button>
            ${duration > 0 ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        return notification;
    }

    getIcon(type) {
        const icons = {
            error: '⚠️',
            success: '✅',
            warning: '⚡',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    getDefaultTitle(type) {
        const titles = {
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.remove('show');
            notification.classList.add('hide');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 400);
        }
    }

    // Convenience methods
    error(message, title = 'Error') {
        return this.show(message, 'error', title, 6000);
    }

    success(message, title = 'Success') {
        return this.show(message, 'success', title, 4000);
    }

    warning(message, title = 'Warning') {
        return this.show(message, 'warning', title, 5000);
    }

    info(message, title = 'Info') {
        return this.show(message, 'info', title, 4000);
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
}

// Create global instance
const notifications = new NotificationSystem();

// Enhanced alert function that uses notifications
window.showAlert = function(message, type = 'info', title = null) {
    return notifications.show(message, type, title);
};

// Replace browser alert with notification
window.originalAlert = window.alert;
window.alert = function(message) {
    // Check if message looks like an error
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')) {
        notifications.error(message);
    } else if (message.toLowerCase().includes('success')) {
        notifications.success(message);
    } else {
        notifications.info(message);
    }
};

// Dialog functions
window.showConfirmDialog = function(title, message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            ">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${title}</h3>
                <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-btn" style="
                        background: #f3f4f6;
                        color: #374151;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                    <button id="confirm-btn" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#cancel-btn').onclick = () => {
            document.body.removeChild(modal);
            resolve(false);
        };
        
        modal.querySelector('#confirm-btn').onclick = () => {
            document.body.removeChild(modal);
            resolve(true);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(false);
            }
        };
    });
};

window.showPromptDialog = function(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            ">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${title}</h3>
                <p style="margin: 0 0 16px 0; color: #6b7280; line-height: 1.5;">${message}</p>
                <input type="text" id="prompt-input" value="${defaultValue}" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    box-sizing: border-box;
                " />
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-btn" style="
                        background: #f3f4f6;
                        color: #374151;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Cancel</button>
                    <button id="submit-btn" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: 500;
                    ">Submit</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#prompt-input');
        input.focus();
        input.select();
        
        const submit = () => {
            const value = input.value.trim();
            document.body.removeChild(modal);
            resolve(value || null);
        };
        
        modal.querySelector('#cancel-btn').onclick = () => {
            document.body.removeChild(modal);
            resolve(null);
        };
        
        modal.querySelector('#submit-btn').onclick = submit;
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                submit();
            } else if (e.key === 'Escape') {
                document.body.removeChild(modal);
                resolve(null);
            }
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                resolve(null);
            }
        };
    });
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
} 