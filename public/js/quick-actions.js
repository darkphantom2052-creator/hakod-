// Quick Actions Handler for both Student and Landlord dashboards
function initializeQuickActions() {
    // Helper functions
    function formatCurrency(amount) {
        if (amount == null || amount === '') return '₱0';
        const num = Number(amount) || 0;
        return '₱' + num.toLocaleString('en-PH');
    }

    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    function getStudentData() {
        try {
            const studentSession = localStorage.getItem('studentSession');
            if (studentSession) {
                return JSON.parse(studentSession);
            }
            return JSON.parse(localStorage.getItem('studentData') || '{}');
        } catch (e) {
            console.error('Error getting student data:', e);
            return {};
        }
    }

    function getLandlordData() {
        try {
            return JSON.parse(localStorage.getItem('landlordData') || '{}');
        } catch (e) {
            console.error('Error getting landlord data:', e);
            return {};
        }
    }

    // Pay Rent Action - Student Side
    document.getElementById('payRentBtn')?.addEventListener('click', function () {
        const studentData = getStudentData();
        if (!studentData.id) {
            showToast('Please log in to make payments', 'error');
            return;
        }

        const amount = 3500; // Get from payment card
        if (confirm(`Proceed to pay ${formatCurrency(amount)} for this month's rent?`)) {
            const payment = {
                id: 'py_' + Date.now() + Math.floor(Math.random() * 9999),
                studentId: studentData.id,
                studentName: studentData.fullName,
                amount: amount,
                status: 'pending',
                room: studentData.room?.number,
                timestamp: new Date().toISOString(),
                landlordId: studentData.landlordId
            };

            // Save to payments
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            payments.unshift(payment);
            localStorage.setItem('payments', JSON.stringify(payments));

            // Add to activity log
            pushActivity({
                type: 'payment',
                title: 'New Payment Submitted',
                subtitle: `${studentData.fullName} • ${formatCurrency(amount)}`,
                timestamp: new Date().toISOString()
            });

            showToast('Payment submitted for processing!', 'success');
            try { populateStudentCards(); } catch (e) { } // Update the cards if function exists
        }
    });

    // Process Payments - Landlord Side
    document.getElementById('processPaymentsBtn')?.addEventListener('click', function () {
        const landlordData = getLandlordData();
        if (!landlordData.id) {
            showToast('Please log in as landlord to process payments', 'error');
            return;
        }

        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const pendingPayments = payments.filter(p => p.status === 'pending' && p.landlordId === landlordData.id);

        if (pendingPayments.length === 0) {
            showToast('No pending payments to process', 'info');
            return;
        }

        const message = `You have ${pendingPayments.length} pending payment${pendingPayments.length > 1 ? 's' : ''} to review.`;
        showToast(message, 'info');

        // Scroll to payments section if it exists
        const paymentsSection = document.getElementById('paymentsSection');
        if (paymentsSection) {
            paymentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Submit Maintenance Request - Student Side
    document.getElementById('submitMaintenanceBtn')?.addEventListener('click', function () {
        const studentData = getStudentData();
        if (!studentData.id) {
            showToast('Please log in to submit maintenance requests', 'error');
            return;
        }

        const issue = prompt('Please describe the maintenance issue:');
        if (!issue) return;

        const request = {
            id: 'mr_' + Date.now() + Math.floor(Math.random() * 9999),
            studentId: studentData.id,
            studentName: studentData.fullName,
            landlordId: studentData.landlordId,
            issue: issue,
            room: studentData.room?.number,
            status: 'pending',
            priority: 'normal',
            dateSubmitted: new Date().toISOString()
        };

        // Save to maintenance requests
        const requests = JSON.parse(localStorage.getItem('maintenance') || '[]');
        requests.unshift(request);
        localStorage.setItem('maintenance', JSON.stringify(requests));

        // Add to activity log
        pushActivity({
            type: 'maintenance',
            title: 'New Maintenance Request',
            subtitle: `${request.room} • ${issue.substring(0, 30)}${issue.length > 30 ? '...' : ''}`,
            timestamp: new Date().toISOString()
        });

        showToast('Maintenance request submitted successfully!', 'success');
        try { populateStudentCards(); } catch (e) { } // Update cards if function exists
    });

    // Assign Maintenance - Landlord Side
    document.getElementById('assignMaintenanceBtn')?.addEventListener('click', function () {
        const landlordData = getLandlordData();
        if (!landlordData.id) {
            showToast('Please log in as landlord to manage maintenance', 'error');
            return;
        }

        const requests = JSON.parse(localStorage.getItem('maintenance') || '[]');
        const pendingRequests = requests.filter(r => r.status === 'pending' && r.landlordId === landlordData.id);

        if (pendingRequests.length === 0) {
            showToast('No pending maintenance requests', 'info');
            return;
        }

        const message = `You have ${pendingRequests.length} maintenance request${pendingRequests.length > 1 ? 's' : ''} to review.`;
        showToast(message, 'info');

        // Update maintenance count in landlord dashboard
        const maintCountEl = document.getElementById('maintenanceRequestsCount');
        if (maintCountEl) maintCountEl.textContent = pendingRequests.length;
    });

    // Register Visitor - Student Side
    document.getElementById('registerVisitorBtn')?.addEventListener('click', function () {
        const studentData = getStudentData();
        if (!studentData.id) {
            showToast('Please log in to register visitors', 'error');
            return;
        }

        const visitorName = prompt('Enter visitor\'s name:');
        if (!visitorName) return;

        const purpose = prompt('Enter purpose of visit:');
        if (!purpose) return;

        const visitor = {
            id: 'v_' + Date.now() + Math.floor(Math.random() * 9999),
            studentId: studentData.id,
            studentName: studentData.fullName,
            landlordId: studentData.landlordId,
            name: visitorName,
            purpose: purpose,
            room: studentData.room?.number,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        // Save to visitors list
        const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        visitors.unshift(visitor);
        localStorage.setItem('visitors', JSON.stringify(visitors));

        // Add to activity log
        pushActivity({
            type: 'visitor',
            title: 'New Visitor Registration',
            subtitle: `${visitorName} • ${studentData.room?.number || 'Unknown Room'}`,
            timestamp: new Date().toISOString()
        });

        showToast('Visitor registration submitted for approval!', 'success');
    });

    // Review Applications - Landlord Side 
    document.getElementById('reviewAppsBtn')?.addEventListener('click', function () {
        const landlordData = getLandlordData();
        if (!landlordData.id) {
            showToast('Please log in as landlord to review applications', 'error');
            return;
        }

        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const pendingBookings = bookings.filter(b => (!b.status || b.status === 'pending') && b.landlordId === landlordData.id);

        if (pendingBookings.length === 0) {
            showToast('No pending applications to review', 'info');
            return;
        }

        const message = `You have ${pendingBookings.length} pending application${pendingBookings.length > 1 ? 's' : ''} to review.`;
        showToast(message, 'info');

        // Scroll to applications section if it exists
        const appsSection = document.getElementById('applicationsSection');
        if (appsSection) {
            appsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Payment History - Student Side
    document.getElementById('paymentHistoryBtn')?.addEventListener('click', function () {
        const studentData = getStudentData();
        if (!studentData.id) {
            showToast('Please log in to view payment history', 'error');
            return;
        }

        const payments = JSON.parse(localStorage.getItem('payments') || '[]')
            .filter(p => p.studentId === studentData.id);

        if (payments.length === 0) {
            showToast('No payment history available', 'info');
            return;
        }

        let history = 'Payment History:\n\n';
        payments.forEach((payment, index) => {
            history += `${index + 1}. ${formatCurrency(payment.amount)} - ${payment.status}\n`;
            history += `   Date: ${formatDate(payment.timestamp)}\n`;
            if (payment.notes) {
                history += `   Notes: ${payment.notes}\n`;
            }
            history += '\n';
        });

        alert(history); // In a real app, show this in a modal
    });

    // Send Notifications - Landlord Side
    document.getElementById('sendNotificationsBtn')?.addEventListener('click', function () {
        const landlordData = getLandlordData();
        if (!landlordData.id) {
            showToast('Please log in as landlord to send notifications', 'error');
            return;
        }

        const message = prompt('Enter notification message for all tenants:');
        if (!message) return;

        const notification = {
            id: 'n_' + Date.now() + Math.floor(Math.random() * 9999),
            landlordId: landlordData.id,
            message: message,
            timestamp: new Date().toISOString(),
            type: 'announcement'
        };

        // Save to notifications
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));

        // Add to activity log
        pushActivity({
            type: 'notification',
            title: 'Notification Sent',
            subtitle: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            timestamp: new Date().toISOString()
        });

        showToast('Notification sent to all tenants', 'success');
    });

    // Emergency Contact - Student Side
    document.getElementById('emergencyBtn')?.addEventListener('click', function () {
        const studentData = getStudentData();
        const landlord = getLandlordData();

        const confirmation = confirm(
            'Emergency Contacts:\n\n' +
            `House Manager: ${landlord.phone || '+63 917 123 4567'}\n` +
            'Security Office: +63 917 234 5678\n' +
            'JRMSU TC Office: +63 917 345 6789\n\n' +
            'Click OK to call House Manager now.'
        );

        if (confirmation) {
            // Log emergency call attempt
            pushActivity({
                type: 'emergency',
                title: 'Emergency Call',
                subtitle: `${studentData.fullName || 'Unknown'} initiated emergency call`,
                timestamp: new Date().toISOString()
            });

            window.location.href = `tel:${landlord.phone || '+639171234567'}`;
        }
    });
}

// Toast notification helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-down ${type === 'success' ? 'bg-success text-white' :
            type === 'error' ? 'bg-error text-white' :
                'bg-info text-white'
        }`;

    toast.innerHTML = `
        <div class="flex items-center">
            ${type === 'success' ? `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            ` : type === 'error' ? `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            ` : `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `}
            ${message}
        </div>
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Activity logger helper
function pushActivity(activity) {
    try {
        const activities = JSON.parse(localStorage.getItem('activity') || '[]');
        const entry = {
            id: 'act_' + Date.now() + Math.floor(Math.random() * 9999),
            timestamp: new Date().toISOString(),
            ...activity
        };

        activities.unshift(entry);

        // Keep only latest 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }

        localStorage.setItem('activity', JSON.stringify(activities));
        localStorage.setItem('activity_last_update', Date.now().toString());
    } catch (e) {
        console.error('Failed to push activity:', e);
    }
}

// Cross-tab/window sync helper
function setupStorageSync() {
    window.addEventListener('storage', function (e) {
        if (!e.key) return;

        const syncKeys = ['payments', 'maintenance', 'visitors', 'notifications', 'activity'];
        if (syncKeys.includes(e.key)) {
            try { populateStudentCards(); } catch (e) { }
            // Refresh landlord KPIs if on landlord dashboard
            try { updateDashboardKPIs(); } catch (e) { }
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeQuickActions();
    setupStorageSync();
});