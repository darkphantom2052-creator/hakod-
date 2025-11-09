
// Utility: SHA-256 hash to hex using Web Crypto (same as registration)
async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Form validation and submission (localStorage-based auth, compare hashed password)
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value.trim();
    const password = document.getElementById('password').value;
    const signInBtn = document.getElementById('signInBtn');
    const signInText = document.getElementById('signInText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loginError = document.getElementById('loginError');

    // Clear previous errors
    const sidErr = document.getElementById('studentIdError');
    if (sidErr) sidErr.classList.add('hidden');
    document.getElementById('passwordError').classList.add('hidden');
    loginError.classList.add('hidden');

    // Basic validation
    let isValid = true;
    if (!studentId) {
        if (sidErr) sidErr.classList.remove('hidden');
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

    try {
        // Read saved user from localStorage
        const raw = localStorage.getItem('studentData');
        if (!raw) {
            showLoginError('No account found. Please register first.');
            return;
        }

        const user = JSON.parse(raw);
        if (!user || user.studentId !== studentId) {
            showLoginError('Invalid TC Number or password');
            return;
        }

        // Hash entered password and compare with stored passwordHash
        const enteredHash = await hashPassword(password);
        if (!user.passwordHash || enteredHash !== user.passwordHash) {
            showLoginError('Invalid TC Number or password');
            return;
        }

        // Successful login: set session in localStorage
        const session = {
            isLoggedIn: true,
            studentId: user.studentId,
            fullName: user.fullName,
            createdAt: new Date().toISOString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24-hour session
        };
        localStorage.setItem('studentSession', JSON.stringify(session));

        // Set userType and userEmail to help site-wide redirects and session checks
        try {
            localStorage.setItem('userType', 'student');
            localStorage.setItem('userEmail', user.studentId);
        } catch (e) { /* ignore storage errors */ }

        // Remember studentId if requested
        if (document.getElementById('remember').checked) {
            localStorage.setItem('rememberedStudentId', user.studentId);
        } else {
            localStorage.removeItem('rememberedStudentId');
        }

        // Show success message and redirect to dashboard
        signInText.textContent = 'Success!';
        loadingSpinner.classList.add('hidden');
        setTimeout(() => {
            window.location.href = 'student_dashboard.html';
        }, 500);
    } catch (err) {
        console.error(err);
        showLoginError('An error occurred during login');
    }

    function showLoginError(message) {
        loadingSpinner.classList.add('hidden');
        signInBtn.disabled = false;
        signInText.textContent = 'Sign In';
        loginError.classList.remove('hidden');
        document.getElementById('loginErrorMessage').textContent = message;
    }
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

// Auto-fill remembered student ID if exists
window.addEventListener('load', function () {
    const rememberedStudentId = localStorage.getItem('rememberedStudentId');
    if (rememberedStudentId) {
        const sidInput = document.getElementById('studentId');
        if (sidInput) sidInput.value = rememberedStudentId;
        document.getElementById('remember').checked = true;
    }
});

// Save student ID if remember me is checked
document.getElementById('remember').addEventListener('change', function () {
    const sid = document.getElementById('studentId').value;
    if (this.checked && sid) {
        localStorage.setItem('rememberedStudentId', sid);
    } else {
        localStorage.removeItem('rememberedStudentId');
    }
});
