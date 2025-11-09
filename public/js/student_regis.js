



// Utility: SHA-256 hash using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Password strength indicators
const passwordInput = document.getElementById('password');
const lengthCheck = document.getElementById('lengthCheck');
const upperCheck = document.getElementById('upperCheck');
const numberCheck = document.getElementById('numberCheck');

function updatePasswordChecks(password) {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{ }|<>]/.test(password);

    lengthCheck.classList.toggle('text-success', hasLength);
    upperCheck.classList.toggle('text-success', hasUpper);
    numberCheck.classList.toggle('text-success', hasNumber);
    specialCheck.classList.toggle('text-success', hasSpecial);

    return hasLength && hasUpper && hasNumber && hasSpecial;
}

passwordInput.addEventListener('input', function () {
    updatePasswordChecks(this.value);
    validatePasswordMatch();
});

// Confirm password validation
const confirmPasswordInput = document.getElementById('confirmPassword');
function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const error = document.getElementById('confirmPasswordError');

    if (confirmPassword && password !== confirmPassword) {
        error.classList.remove('hidden');
        return false;
    } else {
        error.classList.add('hidden');
        return true;
    }
}

confirmPasswordInput.addEventListener('input', validatePasswordMatch);

// Toggle confirm password visibility
document.getElementById('toggleConfirmPassword').addEventListener('click', function () {
    const input = document.getElementById('confirmPassword');
    if (input.type === 'password') {
        input.type = 'text';
        setTimeout(() => { input.type = 'password'; }, 2000); // Auto-hide after 2s
    }
});

// TC Number validation with real-time format checking
document.getElementById('studentId').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
    const error = document.getElementById('studentIdError');
    if (!this.value.match(/^TC-\d{2}-[A-D]-\d{5}$/)) {
        error.textContent = 'Format: TC-YY-Section-NNNNN (e.g., TC-23-A-00001)';
        error.classList.remove('hidden');
    } else {
        // Check if TC number already exists
        const existingData = localStorage.getItem('studentData');
        if (existingData) {
            const existing = JSON.parse(existingData);
            if (existing.studentId === this.value) {
                error.textContent = 'This TC Number is already registered';
                error.classList.remove('hidden');
                return;
            }
        }
        error.classList.add('hidden');
    }
});

// Toggle password visibility safely
document.getElementById('togglePassword').addEventListener('click', function () {
    const input = document.getElementById('password');
    if (input.type === 'password') {
        input.type = 'text';
        setTimeout(() => { input.type = 'password'; }, 2000); // Auto-hide after 2s
    }
});

// Secure form submission
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const password = document.getElementById('password').value;

    // Validate TC Number format
    if (!studentId.match(/^TC-\d{2}-[A-D]-\d{5}$/)) {
        alert('Please enter a valid TC Number (Format:TC-23-A-NNNNN)');
        return;
    }

    // Check if TC Number is already registered
    const existingData = localStorage.getItem('studentData');
    if (existingData) {
        const existing = JSON.parse(existingData);
        if (existing.studentId === studentId) {
            alert('This TC Number is already registered. Please sign in instead.');
            window.location.href = 'student_login.html';
            return;
        }
    }

    // Validate full name (at least 2 words)
    if (fullName.trim().split(/\s+/).length < 2) {
        alert('Please enter your full name (first and last name)');
        return;
    }

    // Validate password strength
    if (!updatePasswordChecks(password)) {
        alert('Please ensure your password meets all requirements');
        return;
    }

    // Validate password confirmation
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        document.getElementById('agreeTermsError').classList.remove('hidden');
        return;
    }

    try {
        // Hash password before storing
        const passwordHash = await hashPassword(password);

        // Store user data with hashed password
        const userData = {
            studentId,
            fullName,
            passwordHash,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('studentData', JSON.stringify(userData));

        // Create secure session
        const session = {
            isLoggedIn: true,
            studentId,
            fullName,
            createdAt: new Date().toISOString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24-hour session
        };
        localStorage.setItem('studentSession', JSON.stringify(session));

        // Show success, set user type/session and redirect to dashboard
        document.getElementById('successModal').classList.remove('hidden');

        // Set a lightweight userType and userEmail for site redirects/consistency
        try {
            localStorage.setItem('userType', 'student');
            localStorage.setItem('userEmail', studentId);
        } catch (e) { /* ignore storage errors */ }

        // Redirect to student dashboard after a short pause
        setTimeout(() => {
            window.location.href = 'student_dashboard.html';
        }, 1200);
    } catch (err) {
        console.error('Registration error:', err);
        alert('An error occurred. Please try again.');
    }
});
