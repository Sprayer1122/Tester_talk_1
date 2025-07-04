document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('login-message');
    
    // Check if user is already logged in
    checkAuthStatus();
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const user = await response.json();
                messageDiv.textContent = 'Login successful! Redirecting...';
                messageDiv.style.color = '#219653';
                
                // Store user info in localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect based on user role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/';
                    }
                }, 1000);
            } else {
                const error = await response.json();
                messageDiv.textContent = error.error || 'Login failed';
                messageDiv.style.color = '#d32f2f';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.textContent = 'Network error occurred';
            messageDiv.style.color = '#d32f2f';
        }
    });
});

async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect if already logged in
            if (user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.log('Not authenticated');
    }
} 