// Format currency in PHP Peso
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// Format date to readable string
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// Main function to populate all student dashboard cards
function populateStudentCards() {
    // Get data from localStorage
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const maintenanceRequests = JSON.parse(localStorage.getItem('maintenance') || '[]');
    const roommates = JSON.parse(localStorage.getItem('roommates') || '[]');

    // Populate Room Status Card
    const roomCard = {
        roomNumber: document.getElementById('roomNumber'),
        roomLocation: document.getElementById('roomLocation'),
        roomStatus: document.getElementById('roomStatus')
    };
    if (studentData.room) {
        roomCard.roomNumber.textContent = `Room ${studentData.room.number}`;
        roomCard.roomLocation.textContent = `Building ${studentData.room.building}, ${studentData.room.floor} Floor`;
        roomCard.roomStatus.textContent = studentData.room.status || 'Active';
        roomCard.roomStatus.className = `status-${studentData.room.status?.toLowerCase() === 'active' ? 'success' : 'warning'}`;
    }

    // Populate Payment Status Card
    const paymentCard = {
        status: document.getElementById('paymentStatus'),
        amount: document.getElementById('paymentAmount'),
        dueDate: document.getElementById('paymentDueDate')
    };
    // Determine current student (from session or studentData)
    let studentSession = {};
    try { studentSession = JSON.parse(localStorage.getItem('studentSession') || '{}'); } catch (e) { studentSession = {}; }
    const student = Object.assign({}, studentData || {}, studentSession || {});

    // find latest payment for this student if possible
    let currentPayment = null;
    try {
        // prefer payments that include studentId matching session/data
        if (student.studentId || student.id) {
            const sid = String(student.studentId || student.id);
            currentPayment = payments.find(p => p && (String(p.studentId || p.studentId) === sid || String(p.studentId || p.payerId || '') === sid));
        }

        // fallback: match by payerName / applicantName
        if (!currentPayment && student.fullName) {
            const name = student.fullName.split(' ')[0].toLowerCase();
            currentPayment = payments.find(p => (p.payerName && p.payerName.toLowerCase().includes(name)) || (p.payer && p.payer.toLowerCase().includes(name)));
        }

        // fallback: match by booking applicant
        if (!currentPayment) {
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            currentPayment = payments.find(p => {
                if (!p) return false;
                if (!p.bookingId) return false;
                const b = bookings.find(x => String(x.id) === String(p.bookingId));
                if (!b) return false;
                if (student.fullName && b.applicantName && b.applicantName === student.fullName) return true;
                if (student.studentId && b.studentId && String(b.studentId) === String(student.studentId)) return true;
                return false;
            });
        }

        // final fallback: most recent payment
        if (!currentPayment && payments.length > 0) currentPayment = payments[0];
    } catch (e) {
        console.error('Error finding current payment', e);
        currentPayment = payments[0] || null;
    }

    if (currentPayment) {
        const statusText = currentPayment.status || (currentPayment.paid ? 'Paid' : 'Pending');
        paymentCard.status.textContent = statusText;
        paymentCard.status.className = `status-${String(statusText).toLowerCase() === 'paid' ? 'success' : 'warning'}`;
        paymentCard.amount.textContent = formatCurrency(currentPayment.amount || 0);
        // apply color classes — keep tailwind-like class names used elsewhere
        const amountClass = String(statusText).toLowerCase() === 'paid' ? 'text-success' : 'text-warning';
        paymentCard.amount.className = `text-2xl font-bold ${amountClass} mb-2`;
        try {
            if (currentPayment.dueDate) paymentCard.dueDate.textContent = `Due: ${formatDate(currentPayment.dueDate)}`;
            else if (currentPayment.timestamp) paymentCard.dueDate.textContent = `Paid: ${formatDate(currentPayment.timestamp)}`;
            else paymentCard.dueDate.textContent = 'Due: TBD';
        } catch (e) { paymentCard.dueDate.textContent = 'Due: TBD'; }
    }

    // Populate Roommate Info Card
    const roommateCard = {
        count: document.getElementById('roommateCount'),
        name: document.getElementById('roommateName'),
        details: document.getElementById('roommateDetails')
    };
    if (roommates.length > 0) {
        const roommate = roommates[0]; // Primary roommate
        roommateCard.count.textContent = `${roommates.length}/2`;
        roommateCard.name.textContent = roommate.name;
        roommateCard.details.textContent = `${roommate.course} ${roommate.year}`;
    }

    // Populate Maintenance Requests Card
    const maintenanceCard = {
        status: document.getElementById('maintenanceStatus'),
        issue: document.getElementById('maintenanceIssue'),
        date: document.getElementById('maintenanceDate')
    };
    const pendingRequests = maintenanceRequests.filter(req => req.status === 'pending');
    if (maintenanceRequests.length > 0) {
        const latestRequest = maintenanceRequests[0];
        maintenanceCard.status.textContent = `${pendingRequests.length} Pending`;
        maintenanceCard.issue.textContent = latestRequest.issue;
        maintenanceCard.date.textContent = `Submitted ${formatDate(latestRequest.dateSubmitted)}`;
    }
}

// Small helper to format "time ago" strings
function timeAgo(dateString) {
    try {
        const then = new Date(dateString).getTime();
        const diff = Date.now() - then;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 30) return 'Just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch (e) {
        return '';
    }
}

// Get read status of notifications from localStorage
function getReadStatus() {
    try {
        return JSON.parse(localStorage.getItem('notificationStatus') || '{}');
    } catch (e) {
        return {};
    }
}

// Mark a notification as read
function markNotificationRead(notificationId) {
    const status = getReadStatus();
    status[notificationId] = true;
    localStorage.setItem('notificationStatus', JSON.stringify(status));
    populateNotifications(); // refresh ui
}

// Populate the Notifications panel from localStorage.notifications or fallback to localStorage.activity
function populateNotifications() {
    const listEl = document.getElementById('notificationsList');
    const countEl = document.querySelector('#notificationsCard .status-error');
    if (!listEl) return;

    let notes = [];
    try {
        notes = JSON.parse(localStorage.getItem('notifications') || 'null') || JSON.parse(localStorage.getItem('activity') || '[]');
    } catch (e) {
        console.error('Error parsing notifications', e);
        notes = [];
    }

    if (!Array.isArray(notes)) notes = [];
    const readStatus = getReadStatus();

    // show latest 5
    const recent = notes.slice(0, 5);
    listEl.innerHTML = '';

    if (recent.length === 0) {
        listEl.innerHTML = '<p class="text-sm text-text-secondary">No notifications</p>';
        if (countEl) countEl.textContent = '';
        return;
    }

    // Count unread notifications
    const unreadCount = recent.filter(n => !readStatus[n.id || n.timestamp || JSON.stringify(n)]).length;
    if (countEl) {
        countEl.textContent = unreadCount > 0 ? `${unreadCount} New` : '';
        countEl.style.display = unreadCount > 0 ? '' : 'none';
    }

    recent.forEach(n => {
        const type = (n.type || n.category || '').toLowerCase();
        const title = n.title || (type === 'payment' ? 'Payment Reminder' : type === 'maintenance' ? 'Maintenance Update' : 'Announcement');
        const message = n.message || n.text || n.note || n.details || n.summary || '';
        const ts = n.timestamp || n.date || n.createdAt || n.time || null;
        const timeText = ts ? timeAgo(ts) : (n.age || 'Just now');

        // choose styling and icon based on type
        let bg = 'bg-primary-50';
        let border = 'border-primary';
        let timeClass = 'primary';
        let icon = `
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
            </svg>`;

        if (type === 'payment' || title.toLowerCase().includes('payment')) {
            bg = 'bg-warning-50';
            border = 'border-warning';
            timeClass = 'warning';
            icon = `
            <svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>`;
        } else if (type === 'maintenance' || title.toLowerCase().includes('maintenance')) {
            bg = 'bg-success-50';
            border = 'border-success';
            timeClass = 'success';
            icon = `
            <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>`;
        } else {
            bg = 'bg-primary-50';
            border = 'border-primary';
            timeClass = 'primary';
            icon = `
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
            </svg>`;
        }

        const notificationId = n.id || n.timestamp || JSON.stringify(n);
        const isRead = readStatus[notificationId];

        const item = document.createElement('div');
        item.className = `flex items-start space-x-3 p-3 ${bg} rounded-lg border-l-4 ${border} ${isRead ? 'opacity-75' : ''}`;
        item.innerHTML = `
            <div class="w-8 h-8 ${bg.replace('bg-', 'bg-100')} rounded-full flex items-center justify-center flex-shrink-0">${icon}</div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <p class="text-sm font-medium text-text-primary">${title}</p>
                    ${!isRead ? `
                        <button class="text-xs text-${timeClass} hover:text-${timeClass}-700 transition-colors duration-200 mark-read-btn" data-id="${notificationId}">
                            Mark Read
                        </button>
                    ` : ''}
                </div>
                <p class="text-xs text-text-secondary mt-1">${message}</p>
                <p class="text-xs text-${timeClass} font-medium mt-1">${timeText}</p>
            </div>
        `;

        // Wire up the mark read button
        const markReadBtn = item.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                markNotificationRead(markReadBtn.dataset.id);
            });
        }

        listEl.appendChild(item);
    });
}

// Listen for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    populateStudentCards();
    populateNotifications();
});

// Populate the All Notifications Modal
function populateAllNotifications() {
    const listEl = document.getElementById('allNotificationsList');
    const countEl = document.getElementById('notificationCount');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const scrollContainer = document.getElementById('notificationsScroll');

    if (!listEl) return;

    let notes = [];
    try {
        notes = JSON.parse(localStorage.getItem('notifications') || 'null') || JSON.parse(localStorage.getItem('activity') || '[]');
    } catch (e) {
        console.error('Error parsing notifications', e);
        notes = [];
    }

    if (!Array.isArray(notes)) notes = [];
    const readStatus = getReadStatus();

    listEl.innerHTML = '';

    if (notes.length === 0) {
        listEl.innerHTML = '<p class="text-sm text-text-secondary">No notifications</p>';
        if (countEl) countEl.textContent = 'No notifications';
        return;
    }

    // Update notification count
    if (countEl) {
        const unreadCount = notes.filter(n => !readStatus[n.id || n.timestamp || JSON.stringify(n)]).length;
        countEl.textContent = `${notes.length} notifications (${unreadCount} unread)`;
    }

    // Handle scroll to top button visibility
    if (scrollContainer && scrollTopBtn) {
        const handleScroll = () => {
            if (scrollContainer.scrollTop > 300) {
                scrollTopBtn.classList.remove('hidden');
            } else {
                scrollTopBtn.classList.add('hidden');
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);

        // Scroll to top functionality
        scrollTopBtn.addEventListener('click', () => {
            scrollContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Add some test notifications if none exist
    if (notes.length === 0) {
        notes = [
            {
                type: 'payment',
                title: 'Payment Due',
                message: 'Your November rent payment is due soon',
                timestamp: new Date(2025, 10, 3, 14, 30).toISOString()
            },
            {
                type: 'maintenance',
                title: 'Maintenance Request Updated',
                message: 'Your AC repair request has been scheduled',
                timestamp: new Date(2025, 10, 3, 12, 15).toISOString()
            },
            {
                type: 'announcement',
                title: 'New House Rules',
                message: 'Updated visitor policies are now in effect',
                timestamp: new Date(2025, 10, 2, 9, 0).toISOString()
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(notes));
    }

    notes.forEach(n => {
        const type = (n.type || n.category || '').toLowerCase();
        const title = n.title || (type === 'payment' ? 'Payment Reminder' : type === 'maintenance' ? 'Maintenance Update' : 'Announcement');
        const message = n.message || n.text || n.note || n.details || n.summary || '';
        const ts = n.timestamp || n.date || n.createdAt || n.time || null;
        const timeText = ts ? timeAgo(ts) : (n.age || 'Just now');

        // Determine styling based on type (reusing the same logic as before)
        let bg, border, timeClass, icon;
        if (type === 'payment' || title.toLowerCase().includes('payment')) {
            bg = 'bg-warning-50'; border = 'border-warning'; timeClass = 'warning';
            icon = '<svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>';
        } else if (type === 'maintenance' || title.toLowerCase().includes('maintenance')) {
            bg = 'bg-success-50'; border = 'border-success'; timeClass = 'success';
            icon = '<svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
        } else {
            bg = 'bg-primary-50'; border = 'border-primary'; timeClass = 'primary';
            icon = '<svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" /></svg>';
        }

        const notificationId = n.id || n.timestamp || JSON.stringify(n);
        const isRead = readStatus[notificationId];

        const item = document.createElement('div');
        item.className = `flex items-start space-x-3 p-3 ${bg} rounded-lg border-l-4 ${border} ${isRead ? 'opacity-75' : ''}`;
        item.innerHTML = `
            <div class="w-8 h-8 ${bg.replace('bg-', 'bg-100')} rounded-full flex items-center justify-center flex-shrink-0">${icon}</div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <p class="text-sm font-medium text-text-primary">${title}</p>
                    ${!isRead ? `
                        <button class="text-xs text-${timeClass} hover:text-${timeClass}-700 transition-colors duration-200 mark-read-btn" data-id="${notificationId}">
                            Mark Read
                        </button>
                    ` : ''}
                </div>
                <p class="text-xs text-text-secondary mt-1">${message}</p>
                <p class="text-xs text-${timeClass} font-medium mt-1">${timeText}</p>
            </div>
        `;

        // Wire up the mark read button
        const markReadBtn = item.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                markNotificationRead(markReadBtn.dataset.id);
                populateAllNotifications(); // Refresh the list after marking as read
            });
        }

        listEl.appendChild(item);
    });
}

// Modal Control Functions
function openAllNotificationsModal() {
    const modal = document.getElementById('allNotificationsModal');
    if (modal) {
        modal.classList.remove('hidden');
        populateAllNotifications();

        // Reset scroll position
        const scrollContainer = document.getElementById('notificationsScroll');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }
}

function closeAllNotificationsModal() {
    const modal = document.getElementById('allNotificationsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Initialize notifications if none exist
document.addEventListener('DOMContentLoaded', () => {
    const existingNotes = localStorage.getItem('notifications');
    if (!existingNotes || existingNotes === 'null' || existingNotes === '[]') {
        const initialNotifications = [
            {
                type: 'payment',
                title: 'Payment Due',
                message: 'Your November rent payment is due soon',
                timestamp: new Date(2025, 10, 3, 14, 30).toISOString()
            },
            {
                type: 'maintenance',
                title: 'Maintenance Request Updated',
                message: 'Your AC repair request has been scheduled',
                timestamp: new Date(2025, 10, 3, 12, 15).toISOString()
            },
            {
                type: 'announcement',
                title: 'New House Rules',
                message: 'Updated visitor policies are now in effect',
                timestamp: new Date(2025, 10, 2, 9, 0).toISOString()
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }
});

// Listen for storage changes to update cards and notifications in real-time
window.addEventListener('storage', (e) => {
    if (['studentData', 'payments', 'maintenance', 'roommates', 'notifications', 'activity'].includes(e.key)) {
        populateStudentCards();
    }
    if (['notifications', 'activity', 'notificationStatus'].includes(e.key)) {
        populateNotifications();
        populateAllNotifications();
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    populateStudentCards();
    populateNotifications();

    // Modal event listeners
    const viewAllBtn = document.getElementById('viewAllNotificationsBtn');
    const closeBtn = document.getElementById('closeNotificationsModal');
    const modal = document.getElementById('allNotificationsModal');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', openAllNotificationsModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAllNotificationsModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllNotificationsModal();
            }
        });
    }
    // Make the modal dialog draggable by its header
    const dialog = document.getElementById('allNotificationsDialog');
    const header = document.getElementById('allNotificationsHeader');
    if (dialog && header) {
        let isDragging = false;
        let pointerId = null;
        let offsetX = 0;
        let offsetY = 0;
        let dialogRect = null;

        header.addEventListener('pointerdown', (ev) => {
            // only start drag on primary button
            if (ev.button && ev.button !== 0) return;
            ev.preventDefault();
            header.setPointerCapture(ev.pointerId);
            pointerId = ev.pointerId;
            isDragging = true;
            dialogRect = dialog.getBoundingClientRect();

            // compute offset from dialog top-left to pointer
            offsetX = ev.clientX - dialogRect.left;
            offsetY = ev.clientY - dialogRect.top;

            // switch dialog to fixed positioning so it can move freely
            dialog.style.position = 'fixed';
            dialog.style.left = dialogRect.left + 'px';
            dialog.style.top = dialogRect.top + 'px';
            dialog.style.margin = '0';
            header.classList.remove('cursor-grab');
            header.classList.add('cursor-grabbing');

            const onPointerMove = (moveEv) => {
                if (!isDragging || moveEv.pointerId !== pointerId) return;
                const newLeft = Math.min(Math.max(0, moveEv.clientX - offsetX), window.innerWidth - dialogRect.width);
                const newTop = Math.min(Math.max(0, moveEv.clientY - offsetY), window.innerHeight - dialogRect.height);
                dialog.style.left = newLeft + 'px';
                dialog.style.top = newTop + 'px';
            };

            const onPointerUp = (upEv) => {
                if (upEv.pointerId === pointerId) {
                    isDragging = false;
                    pointerId = null;
                    header.releasePointerCapture(upEv.pointerId);
                    header.classList.remove('cursor-grabbing');
                    header.classList.add('cursor-grab');
                    document.removeEventListener('pointermove', onPointerMove);
                    document.removeEventListener('pointerup', onPointerUp);
                }
            };

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        });

        // Double-click header to re-center the dialog
        header.addEventListener('dblclick', () => {
            // clear fixed positioning so the flex centering takes over again
            dialog.style.position = 'absolute';
            dialog.style.left = '20px';
            dialog.style.top = '20px';
            dialog.style.margin = '20px auto';
        });
    }
});

// Initial population
populateStudentCards();
populateNotifications();