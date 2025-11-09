
// Update current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Simulate real-time notifications
function updateNotifications() {
    const notifications = document.querySelectorAll('.status-error');
    notifications.forEach(notification => {
        if (notification.textContent.includes('New')) {
            const count = Math.floor(Math.random() * 5) + 1;
            notification.textContent = `${count} New`;
        }
    });
}

// Update notifications every 30 seconds
setInterval(updateNotifications, 30000);

// Add click handlers for quick actions
document.querySelectorAll('.btn-primary, .btn').forEach(button => {
    if (!button.href) {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const action = this.textContent.trim();

            // Show loading state
            const originalText = this.innerHTML;
            this.innerHTML = `
                        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    `;

            // Simulate action processing
            setTimeout(() => {
                this.innerHTML = originalText;

                // Show success message
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down';
                toast.innerHTML = `
                            <div class="flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                ${action} action completed successfully!
                            </div>
                        `;
                document.body.appendChild(toast);

                setTimeout(() => {
                    toast.remove();
                }, 3000);
            }, 1500);
        });
    }
});

// Check authentication: prefer client-side session (studentSession), fallback to server-side check
window.addEventListener('load', async function () {
    try {
        // Check local session first
        const rawSession = localStorage.getItem('studentSession');
        if (rawSession) {
            try {
                const session = JSON.parse(rawSession);
                if (session && session.isLoggedIn) {
                    // Check expiry
                    if (!session.expires || new Date(session.expires) > new Date()) {
                        // Ensure global redirect keys exist
                        try { localStorage.setItem('userType', 'student'); localStorage.setItem('userEmail', session.studentId || ''); } catch (e) { }
                        // Populate profile using session/fallback and skip server check
                        const nameEl = document.getElementById('profileName');
                        const idEl = document.getElementById('profileId');
                        const welcomeEl = document.getElementById('welcomeName');
                        if (nameEl) nameEl.textContent = session.fullName || (session.studentId || 'Student');
                        if (idEl) idEl.textContent = `Student ID: ${session.studentId || ''}`;
                        if (welcomeEl) welcomeEl.textContent = session.fullName ? session.fullName.split(' ')[0] : (session.studentId || 'Student');
                        return; // authenticated via client session
                    }
                }
            } catch (e) {
                // fall through to server check
            }
        }

        // If no valid client session, attempt server-side check
        const res = await fetch('../backend/get_profile.php', { credentials: 'same-origin' });
        if (!res.ok) {
            // Not authenticated
            window.location.href = 'student_login.html';
            return;
        }

        const json = await res.json();
        if (!json.success || !json.student) {
            window.location.href = 'student_login.html';
            return;
        }

        // Populate profile fields with server data
        const student = json.student;
        const nameEl = document.getElementById('profileName');
        const idEl = document.getElementById('profileId');
        const welcomeEl = document.getElementById('welcomeName');
        if (nameEl) nameEl.textContent = student.fullName || student.email || 'Student';
        if (idEl) idEl.textContent = `Student ID: ${student.studentId || ''}`;
        if (welcomeEl) welcomeEl.textContent = student.fullName ? student.fullName.split(' ')[0] : (student.email || 'Student');
    } catch (err) {
        console.error('Auth check failed', err);
        // If server check failed and no session, redirect to login
        const rawSession2 = localStorage.getItem('studentSession');
        if (!rawSession2) {
            window.location.href = 'student_login.html';
        }
    }
});

// Populate student info from session (studentSession preferred, fallback to studentData)
(function populateStudentProfile() {
    try {
        const rawSession = localStorage.getItem('studentSession');
        let student = null;

        if (rawSession) {
            try { student = JSON.parse(rawSession); } catch (e) { student = null; }
        }

        // Fallback to studentData if session doesn't contain profile fields
        if (!student || !student.fullName) {
            const rawData = localStorage.getItem('studentData');
            if (rawData) {
                try { const data = JSON.parse(rawData); student = Object.assign({}, student || {}, data); } catch (e) { /* ignore */ }
            }
        }

        const nameEl = document.getElementById('profileName');
        const idEl = document.getElementById('profileId');
        const welcomeEl = document.getElementById('welcomeName');

        if (student) {
            if (nameEl) nameEl.textContent = student.fullName || (student.email || 'Student');
            if (idEl) idEl.textContent = `Student ID: ${student.studentId || ''}`;
            if (welcomeEl) welcomeEl.textContent = student.fullName ? student.fullName.split(' ')[0] : (student.email || 'Student');
        }
    } catch (err) {
        // ignore
    }
})();

// Logout handler: clear studentSession and redirect to home page
(function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Clear all session-related data
        try {
            localStorage.removeItem('studentSession');
            localStorage.removeItem('rememberedStudentId');
            localStorage.removeItem('userType');
            localStorage.removeItem('userEmail');
        } catch (err) {
            // ignore
        }
        // Redirect to home page after logout
        window.location.href = '../index.html';
    });
})();

// Auto-refresh data every 5 minutes
setInterval(() => {
    // Simulate data refresh
    console.log('Refreshing dashboard data...');
}, 300000);
