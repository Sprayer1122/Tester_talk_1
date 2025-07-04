document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const messageDiv = document.getElementById('register-message');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            messageDiv.textContent = 'Passwords do not match';
            messageDiv.style.color = '#d32f2f';
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters long';
            messageDiv.style.color = '#d32f2f';
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });
            
            if (response.ok) {
                const user = await response.json();
                messageDiv.textContent = 'Registration successful! Redirecting to login...';
                messageDiv.style.color = '#219653';
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                const error = await response.json();
                messageDiv.textContent = error.error || 'Registration failed';
                messageDiv.style.color = '#d32f2f';
            }
        } catch (error) {
            console.error('Registration error:', error);
            messageDiv.textContent = 'Network error occurred';
            messageDiv.style.color = '#d32f2f';
        }
    });
}); 