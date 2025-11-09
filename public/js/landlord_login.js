// landlord_login.js
// Form validation and submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const signInBtn = document.getElementById('signInBtn');
    const signInText = document.getElementById('signInText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loginError = document.getElementById('loginError');

    // Clear previous errors
    document.getElementById('emailError').classList.add('hidden');
    document.getElementById('passwordError').classList.add('hidden');
    loginError.classList.add('hidden');

    // Basic validation
    let isValid = true;

    if (!email) {
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    }

    if (!password) {
        document.getElementById('passwordError').classList.remove('hidden');
        isValid = false;
    }

    if (!isValid) return;

    // Show loading state
    signInBtn.disabled = true;
    signInText.textContent = 'Signing In...';
    loadingSpinner.classList.remove('hidden');

    // Store form data locally for offline persistence
    localStorage.setItem('landlordLoginAttempt', JSON.stringify({
        email: email,
        timestamp: new Date().toISOString()
    }));

    // Get registered landlords from localStorage
    const registeredLandlords = JSON.parse(localStorage.getItem('registeredLandlords') || '[]');

    // Simulate authentication (replace with actual API call)
    setTimeout(() => {
        // Check if the landlord exists in registered landlords
        const landlord = registeredLandlords.find(l => l.email === email);

        if (landlord) {
            // Verify password if stored (password stored as base64 in registration)
            const stored = landlord.password || '';
            const provided = btoa(password);
            if (stored && stored !== provided) {
                loginError.classList.remove('hidden');
                document.getElementById('loginErrorMessage').textContent = 'Incorrect password. Please try again.';
                signInBtn.disabled = false;
                signInText.textContent = 'Sign In as Landlord';
                loadingSpinner.classList.add('hidden');
                return;
            }

            // Authentication success
            localStorage.setItem('userType', 'landlord');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('landlordData', JSON.stringify(landlord));
            window.location.href = 'landlord_dashboard.html';
        } else {
            // Show error
            loginError.classList.remove('hidden');
            document.getElementById('loginErrorMessage').textContent =
                'Landlord account not found. Please register first.';
            signInBtn.disabled = false;
            signInText.textContent = 'Sign In as Landlord';
            loadingSpinner.classList.add('hidden');
        }
    }, 800);
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

// Offline detection
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        offlineIndicator.classList.add('hidden');
    } else {
        offlineIndicator.classList.remove('hidden');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Auto-fill remembered credentials
window.addEventListener('load', function () {
    const rememberedEmail = localStorage.getItem('rememberedAdminEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});

// Save email if remember me is checked
document.getElementById('remember').addEventListener('change', function () {
    const email = document.getElementById('email').value;
    if (this.checked && email) {
        localStorage.setItem('rememberedAdminEmail', email);
    } else {
        localStorage.removeItem('rememberedAdminEmail');
    }
});
