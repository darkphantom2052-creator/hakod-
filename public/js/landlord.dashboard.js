
// Mobile menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
});

// Profile dropdown toggle
document.getElementById('profileDropdown').addEventListener('click', function () {
    const profileMenu = document.getElementById('profileMenu');
    profileMenu.classList.toggle('hidden');
});

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileMenu = document.getElementById('profileMenu');

    if (!profileDropdown.contains(event.target)) {
        profileMenu.classList.add('hidden');
    }
});

// Room status tooltips and interactions
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('click', function () {
        const roomInfo = this.getAttribute('title');
        console.log('Room clicked:', roomInfo);
        // Here you could open a modal with detailed room information
    });
});

// Auto-refresh dashboard data (simulated)
function refreshDashboard() {
    const lastUpdated = document.querySelector('[class*="Last updated"]');
    if (lastUpdated) {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        console.log('Dashboard refreshed at:', timeString);
    }
}

// Refresh every 5 minutes
setInterval(refreshDashboard, 300000);

// --- Transaction management for landlord dashboard ---
function formatCurrency(amount) {
    if (amount == null || amount === '') return '₱0';
    const num = Number(amount) || 0;
    return '₱' + num.toLocaleString('en-PH');
}

function getBookingsFromStorage() {
    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    } catch (e) {
        bookings = [];
    }

    try {
        const legacy = localStorage.getItem('bookingRequest');
        if (legacy) {
            const b = JSON.parse(legacy);
            if (b && b.roomTitle) {
                if (!b.id) b.id = 'bk_' + Date.now();
                const exists = bookings.find(x => x.id === b.id || (x.roomTitle === b.roomTitle && x.applicantName === b.applicantName));
                if (!exists) bookings.push(b);
            }
        }
    } catch (e) { /* ignore */ }

    return bookings;
}

function saveBookings(bookings) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function getPaymentsFromStorage() {
    try { return JSON.parse(localStorage.getItem('payments') || '[]'); } catch (e) { return []; }
}

function savePayments(payments) {
    localStorage.setItem('payments', JSON.stringify(payments));
}

// Renderers similar to previous admin_dashboard.js logic
// Render applications (bookings) into the Applications table
function renderApplications() {
    const tbody = document.getElementById('applicationsTableBody');
    const noApps = document.getElementById('noApplications');
    if (!tbody) return;
    tbody.innerHTML = '';

    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
    if (!landlord) {
        if (noApps) { noApps.classList.remove('hidden'); noApps.textContent = 'You must be logged in as a landlord to see applications.'; }
        return;
    }

    const bookings = getBookingsFromStorage();
    const filtered = bookings.filter(b => {
        if (!b) return false;
        if (b.landlordId && landlord.id && String(b.landlordId) === String(landlord.id)) return true;
        if (b.landlordEmail && landlord.email && b.landlordEmail === landlord.email) return true;
        if (!b.landlordId && !b.landlordEmail && b.roomId) {
            try {
                const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
                const r = rooms.find(x => x.roomId === b.roomId);
                if (r && r.landlordId && landlord.id && String(r.landlordId) === String(landlord.id)) return true;
            } catch (e) { /* ignore */ }
        }
        return false;
    });

    if (!filtered || filtered.length === 0) {
        if (noApps) { noApps.classList.remove('hidden'); noApps.textContent = 'No applications found for your property.'; }
        return;
    }

    if (noApps) noApps.classList.add('hidden');

    filtered.forEach(b => {
        const id = b.id || ('bk_' + Date.now() + Math.floor(Math.random() * 9999));
        if (!b.id) b.id = id;
        const applicant = b.applicantName || b.name || b.studentName || 'Unknown';
        const room = b.roomTitle || b.room || b.roomId || 'Unknown Room';
        const rent = b.monthlyRent || b.monthly || b.price || b.rent || '';
        const moveIn = b.moveInDate || b.move_in || b.moveIn || 'TBD';
        const duration = b.duration || b.months || b.length || '1 month';
        const status = b.status || (b.paid ? 'paid' : 'pending');

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-secondary-50';
        tr.innerHTML = `
                    <td class="px-4 py-3 text-sm text-text-primary">${applicant}</td>
                    <td class="px-4 py-3 text-sm text-text-primary">${room}</td>
                    <td class="px-4 py-3 text-sm text-text-primary">${formatCurrency(rent)}</td>
                    <td class="px-4 py-3 text-sm text-text-secondary">${moveIn}</td>
                    <td class="px-4 py-3 text-sm text-text-secondary">${duration}</td>
                    <td class="px-4 py-3 text-sm"><span class="text-sm font-medium">${status}</span></td>
                    <td class="px-4 py-3 text-sm">
                        <div class="flex items-center space-x-2">
                            <button data-action="approve" data-id="${id}" class="px-3 py-1 text-xs bg-success-100 rounded text-success">Approve</button>
                            <button data-action="reject" data-id="${id}" class="px-3 py-1 text-xs bg-error-100 rounded text-error">Reject</button>
                            <button data-action="mark-paid" data-id="${id}" class="px-3 py-1 text-xs bg-primary-100 rounded text-primary">Mark Paid</button>
                        </div>
                    </td>
                `;

        tbody.appendChild(tr);
    });

    // wire buttons inside applications table
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.dataset.action;
            const id = this.dataset.id;
            handleTransactionAction(action, id);
        });
    });
}

// Render payments into payments table
function renderPayments() {
    const tbody = document.getElementById('paymentsTableBody');
    const noPayments = document.getElementById('noPayments');
    if (!tbody) return;
    tbody.innerHTML = '';

    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
    if (!landlord) {
        if (noPayments) { noPayments.classList.remove('hidden'); noPayments.textContent = 'You must be logged in as a landlord to see payments.'; }
        return;
    }

    const payments = getPaymentsFromStorage();
    const filtered = payments.filter(p => {
        if (!p) return false;
        if (p.landlordId && landlord.id && String(p.landlordId) === String(landlord.id)) return true;
        return false;
    });

    if (!filtered || filtered.length === 0) {
        if (noPayments) { noPayments.classList.remove('hidden'); noPayments.textContent = 'No payments found for your property.'; }
        return;
    }

    if (noPayments) noPayments.classList.add('hidden');

    filtered.forEach(p => {
        const payer = p.payerName || 'Unknown';
        const room = p.room || p.roomTitle || p.roomId || '';
        const amount = p.amount || 0;
        const date = p.timestamp ? new Date(p.timestamp).toLocaleString() : (p.date || 'TBD');
        const status = p.status || 'received';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-secondary-50';
        tr.innerHTML = `
                    <td class="px-4 py-3 text-sm text-text-primary">${payer}</td>
                    <td class="px-4 py-3 text-sm text-text-primary">${room}</td>
                    <td class="px-4 py-3 text-sm text-text-primary">${formatCurrency(amount)}</td>
                    <td class="px-4 py-3 text-sm text-text-secondary">${date}</td>
                    <td class="px-4 py-3 text-sm text-text-secondary">${status}</td>
                    <td class="px-4 py-3 text-sm">
                        <div class="flex items-center space-x-2">
                            <button data-action="view" data-id="${p.id || ''}" class="px-3 py-1 text-xs bg-secondary-100 rounded text-text-secondary">View</button>
                            <button data-action="refund" data-id="${p.id || ''}" class="px-3 py-1 text-xs bg-error-100 rounded text-error">Refund</button>
                        </div>
                    </td>
                `;
        tbody.appendChild(tr);
    });

    // wire payment action buttons (view, refund)
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.dataset.action;
            const id = this.dataset.id;
            handlePaymentAction(action, id);
        });
    });
}

// Handle payment actions (view, refund)
function handlePaymentAction(action, id) {
    if (!action || !id) return;
    switch (action) {
        case 'view':
            try {
                const payments = getPaymentsFromStorage();
                const p = payments.find(x => String(x.id) === String(id));
                if (p) {
                    alert(`Payer: ${p.payerName || 'Unknown'}\nAmount: ${formatCurrency(p.amount || 0)}\nDate: ${p.timestamp || p.date || 'TBD'}\nRoom: ${p.room || p.roomId || ''}`);
                } else alert('Payment not found');
            } catch (e) { console.error(e); alert('Unable to show payment'); }
            break;
        case 'refund':
            if (!confirm('Issue a refund and remove this payment?')) return;
            try {
                let payments = getPaymentsFromStorage();
                const idx = payments.findIndex(x => String(x.id) === String(id));
                if (idx === -1) { alert('Payment not found'); return; }
                const payment = payments[idx];
                // remove payment
                payments.splice(idx, 1);
                savePayments(payments);

                // if payment was linked to a booking, mark booking as unpaid/pending
                if (payment && payment.bookingId) {
                    const bookings = getBookingsFromStorage();
                    const bidx = bookings.findIndex(x => String(x.id) === String(payment.bookingId));
                    if (bidx !== -1) {
                        bookings[bidx].paid = false;
                        bookings[bidx].status = 'pending';
                        saveBookings(bookings);
                    }
                }

                // signal and re-render
                try { localStorage.setItem('payments_last_update', Date.now().toString()); } catch (e) { }
                try { renderPayments(); } catch (e) { }
                try { renderApplications(); } catch (e) { }
                try { updateDashboardKPIs(); } catch (e) { }
                pushActivity({
                    type: 'payment-refund',
                    title: 'Payment refunded',
                    subtitle: `${payment.payerName || 'Unknown'} • ${payment.room || payment.roomId || ''}`
                });
                renderRecentActivity();
                alert('Refund issued and payment removed');
            } catch (e) { console.error(e); alert('Failed to refund payment'); }
            break;
        default:
            console.log('Unknown payment action', action);
    }
}

// Create a new notification that will appear in student notifications panel
function createNotification(type, title, message, studentId = null, roomId = null) {
    try {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const note = {
            id: 'not_' + Date.now() + Math.floor(Math.random() * 9999),
            type: type,
            title: title,
            message: message,
            timestamp: new Date().toISOString(),
            studentId: studentId,
            roomId: roomId
        };
        notifications.unshift(note);
        // Keep up to 50 notifications
        if (notifications.length > 50) notifications.splice(50);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        localStorage.setItem('notifications_last_update', Date.now().toString());
    } catch (e) {
        console.error('Failed to create notification', e);
    }
}

// Add an activity entry into localStorage (keeps most recent 30) and creates a notification
function pushActivity(item) {
    try {
        const activities = JSON.parse(localStorage.getItem('activity') || '[]');
        const entry = Object.assign({ id: 'act_' + Date.now() + Math.floor(Math.random() * 9999), ts: new Date().toISOString() }, item || {});
        activities.unshift(entry);
        // keep up to 50 entries
        if (activities.length > 50) activities.splice(50);
        localStorage.setItem('activity', JSON.stringify(activities));
        try { localStorage.setItem('activity_last_update', Date.now().toString()); } catch (e) { }

        // Also create a notification for relevant activities
        if (item) {
            const type = item.type || '';
            const title = item.title || '';
            const message = item.subtitle || '';
            const studentId = item.studentId || null;
            const roomId = item.roomId || null;

            // Don't create notifications for certain activity types
            if (!type.includes('view') && !type.includes('export')) {
                createNotification(type, title, message, studentId, roomId);
            }
        }
    } catch (e) { console.error('Failed to push activity', e); }
}

// Render recent activity list into the Recent Activity card
function renderRecentActivity() {
    try {
        const container = document.getElementById('recentActivityList');
        if (!container) return;
        container.innerHTML = '';
        const activities = JSON.parse(localStorage.getItem('activity') || '[]');
        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="text-sm text-text-secondary">No recent activity.</div>';
            return;
        }

        activities.slice(0, 10).forEach(a => {
            const div = document.createElement('div');
            div.className = 'flex items-start space-x-3';

            const icon = document.createElement('div');
            const type = (a.type || 'info').toLowerCase();
            let bg = 'bg-secondary-100';
            let svg = '<svg class="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/></svg>';
            if (type === 'payment') { bg = 'bg-success-100'; svg = '<svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a2 2 0 00-2 2v2h4V4a2 2 0 00-2-2z"/></svg>'; }
            if (type === 'application') { bg = 'bg-primary-100'; svg = '<svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/></svg>'; }
            if (type === 'maintenance') { bg = 'bg-warning-100'; svg = '<svg class="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/></svg>'; }

            icon.className = 'flex-shrink-0 w-8 h-8 ' + bg + ' rounded-full flex items-center justify-center';
            icon.innerHTML = svg;

            const body = document.createElement('div');
            body.className = 'flex-1 min-w-0';

            const title = document.createElement('p');
            title.className = 'text-sm text-text-primary';
            const primary = a.title || a.actor || a.payerName || a.applicantName || a.message || 'Activity';
            const sub = a.subtitle || a.detail || a.room || '';
            title.innerHTML = sub ? `<span class="font-medium">${primary}</span> ${sub}` : `<span class="font-medium">${primary}</span>`;

            const meta = document.createElement('p');
            meta.className = 'text-xs text-text-secondary';
            const time = a.ts ? new Date(a.ts).toLocaleString() : (a.date ? new Date(a.date).toLocaleString() : 'just now');
            meta.textContent = `${time}`;

            body.appendChild(title);
            body.appendChild(meta);

            div.appendChild(icon);
            div.appendChild(body);
            container.appendChild(div);
        });
    } catch (e) { console.error('Failed to render activity', e); }
}

// Render recent visitors into the Quick Actions card
function renderRecentVisitors() {
    try {
        const container = document.getElementById('recentVisitorsQuick');
        if (!container) return;
        container.innerHTML = '';
        const list = JSON.parse(localStorage.getItem('visitors') || '[]');
        if (!list || list.length === 0) {
            container.innerHTML = '<div class="text-xs text-text-secondary">No recent visitors</div>';
            return;
        }

        // Determine landlord context so we only show visitors relevant to this landlord
        const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
        // load rooms and bookings to help map visitors -> landlord
        let rooms = [];
        let bookings = [];
        try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }
        try { bookings = JSON.parse(localStorage.getItem('bookings') || '[]'); } catch (e) { bookings = []; }

        // helper: check if a visitor record belongs to this landlord
        function visitorBelongsToLandlord(v) {
            if (!landlord) return false; // not logged in as landlord
            // if visitor explicitly contains landlordId
            if (v.landlordId && String(v.landlordId) === String(landlord.id)) return true;
            // if visitor has roomId, find room and compare landlordId
            if (v.roomId) {
                const r = rooms.find(x => String(x.roomId || x.id) === String(v.roomId));
                if (r && r.landlordId && String(r.landlordId) === String(landlord.id)) return true;
            }
            // if visitor has studentId, try to find a booking for that student that belongs to this landlord
            if (v.studentId) {
                const matched = bookings.find(b => String(b.studentId) === String(v.studentId) && (
                    (b.landlordId && String(b.landlordId) === String(landlord.id)) ||
                    (b.roomId && (() => { const rr = rooms.find(x => String(x.roomId || x.id) === String(b.roomId)); return rr && String(rr.landlordId) === String(landlord.id); })())
                ));
                if (matched) return true;
            }
            return false;
        }

        // show up to 5 recent visitors that belong to this landlord
        const filtered = list.filter(visitorBelongsToLandlord).slice(0, 5);
        if (!filtered || filtered.length === 0) {
            container.innerHTML = '<div class="text-xs text-text-secondary">No recent visitors for your property</div>';
            return;
        }

        filtered.forEach(v => {
            const div = document.createElement('div');
            div.className = 'p-2 bg-secondary-50 rounded flex items-start justify-between';

            const left = document.createElement('div');
            left.className = 'min-w-0';
            const title = document.createElement('div');
            title.className = 'font-medium text-text-primary text-sm';

            // try to resolve student name from bookings or stored studentName
            let studentName = v.studentName;
            if (!studentName && v.studentId) {
                const b = bookings.find(x => String(x.studentId) === String(v.studentId));
                if (b) studentName = b.applicantName || b.studentName || b.name;
            }

            title.textContent = v.name || 'Unknown Visitor';

            const meta = document.createElement('div');
            meta.className = 'text-xs text-text-secondary';
            const rel = v.relation ? (v.relation + (v.contact ? ' • ' + v.contact : '')) : (v.contact || '');
            const studentHint = studentName ? (' for ' + studentName) : (v.studentId ? (' for student ' + v.studentId) : '');
            meta.textContent = (rel ? rel + (studentHint ? ' • ' + studentHint : '') : (studentHint || ''));

            left.appendChild(title);
            left.appendChild(meta);

            const right = document.createElement('div');
            right.className = 'text-xs text-text-secondary';
            try {
                right.textContent = v.expectedAt ? new Date(v.expectedAt).toLocaleString() : new Date(v.createdAt).toLocaleString();
            } catch (e) { right.textContent = v.expectedAt || v.createdAt || ''; }

            div.appendChild(left);
            div.appendChild(right);
            container.appendChild(div);
        });
    } catch (e) { console.error('Failed to render recent visitors', e); }
}

function handleTransactionAction(action, id) {
    const bookings = getBookingsFromStorage();
    const idx = bookings.findIndex(b => String(b.id) === String(id));
    if (idx === -1) {
        alert('Transaction not found');
        return;
    }
    const b = bookings[idx];
    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');

    switch (action) {
        case 'approve':
            b.status = 'approved';
            b.approvedAt = new Date().toISOString();
            saveBookings(bookings);
            try { renderApplications(); } catch (e) { }
            try { renderPayments(); } catch (e) { }
            try { renderRooms(); } catch (e) { }
            pushActivity({ type: 'application', title: 'Application approved', subtitle: `${b.applicantName || 'Applicant'} • ${b.roomTitle || b.roomId || ''}` });
            try { renderRecentActivity(); } catch (e) { }
            break;
        case 'reject':
            if (!confirm('Reject this application?')) return;
            b.status = 'rejected';
            b.rejectedAt = new Date().toISOString();
            saveBookings(bookings);
            try { renderApplications(); } catch (e) { }
            try { renderPayments(); } catch (e) { }
            try { renderRooms(); } catch (e) { }
            pushActivity({ type: 'application', title: 'Application rejected', subtitle: `${b.applicantName || 'Applicant'} • ${b.roomTitle || b.roomId || ''}` });
            try { renderRecentActivity(); } catch (e) { }
            break;
        case 'mark-paid':
            b.paid = true;
            b.status = 'paid';
            b.paidAt = new Date().toISOString();
            const payments = getPaymentsFromStorage();
            const amount = Number(b.monthlyRent || b.monthly || b.price || 0) || 0;
            const payment = {
                id: 'py_' + Date.now() + Math.floor(Math.random() * 9999),
                bookingId: b.id,
                landlordId: landlord ? landlord.id : null,
                amount: amount,
                payerName: b.applicantName || b.name || 'Unknown',
                timestamp: new Date().toISOString(),
                studentId: b.studentId || null,
                roomId: b.roomId || null
            };
            payments.push(payment);
            savePayments(payments);
            saveBookings(bookings);
            try { renderApplications(); } catch (e) { }
            try { renderPayments(); } catch (e) { }
            try { renderRooms(); } catch (e) { }
            pushActivity({ type: 'payment', title: 'Payment received', subtitle: `${payment.payerName} • ${formatCurrency(payment.amount)}` });
            try { renderRecentActivity(); } catch (e) { }
            break;
        default:
            console.log('Unknown action', action);
    }
}

// Export report for current landlord (rooms, bookings, payments)
function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportReport() {
    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
    if (!landlord) {
        alert('Please log in as a landlord to export a report.');
        return;
    }

    let rooms = [];
    let bookings = [];
    let payments = [];
    try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }
    try { bookings = JSON.parse(localStorage.getItem('bookings') || '[]'); } catch (e) { bookings = []; }
    try { payments = JSON.parse(localStorage.getItem('payments') || '[]'); } catch (e) { payments = []; }

    const filterByLandlord = item => {
        if (!item) return false;
        if (item.landlordId && landlord.id && String(item.landlordId) === String(landlord.id)) return true;
        if (item.landlordEmail && landlord.email && String(item.landlordEmail) === String(landlord.email)) return true;
        return false;
    };

    const myRooms = rooms.filter(filterByLandlord);
    const myBookings = bookings.filter(filterByLandlord);
    const myPayments = payments.filter(filterByLandlord);

    // Build CSV rows
    const rows = [];
    rows.push(['type', 'id', 'title', 'roomId', 'person', 'amount', 'status', 'date', 'notes']);

    myRooms.forEach(r => {
        rows.push(['room', r.id || '', r.title || '', r.roomId || '', '', r.price || r.monthlyRent || r.monthly || '', r.status || '', r.createdAt || r.updatedAt || '', '']);
    });

    myBookings.forEach(b => {
        rows.push(['booking', b.id || '', b.roomTitle || b.title || '', b.roomId || '', b.applicantName || b.name || '', b.monthlyRent || b.price || '', b.status || '', b.moveInDate || b.timestamp || '', b.duration || b.months || '']);
    });

    myPayments.forEach(p => {
        rows.push(['payment', p.id || '', '', p.room || p.roomId || '', p.payerName || p.name || '', p.amount || '', p.status || '', p.timestamp || p.date || '', p.notes || '']);
    });

    const csv = rows.map(r => r.map(c => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const filename = `jrmsu-landlord-report-${landlord.id || landlord.email || Date.now()}.csv`;
    downloadFile(filename, csv, 'text/csv;charset=utf-8;');
    alert('Report exported as ' + filename);
}

// Update KPI cards (occupancy, pending, overdue, maintenance)
function updateDashboardKPIs() {
    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
    // defaults
    let rooms = [];
    let bookings = [];
    let payments = [];
    let maintenance = [];
    try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }
    try { bookings = JSON.parse(localStorage.getItem('bookings') || '[]'); } catch (e) { bookings = []; }
    try { payments = JSON.parse(localStorage.getItem('payments') || '[]'); } catch (e) { payments = []; }
    // try common maintenance keys
    try { maintenance = JSON.parse(localStorage.getItem('maintenance') || localStorage.getItem('maintenanceRequests') || '[]'); } catch (e) { maintenance = []; }

    const filterByLandlord = item => {
        if (!item) return false;
        if (!landlord) return false;
        if (item.landlordId && landlord.id && String(item.landlordId) === String(landlord.id)) return true;
        if (item.landlordEmail && landlord.email && String(item.landlordEmail) === String(landlord.email)) return true;
        return false;
    };

    const myRooms = rooms.filter(filterByLandlord);
    const myBookings = bookings.filter(filterByLandlord);
    const myPayments = payments.filter(filterByLandlord);
    const myMaintenance = maintenance.filter(filterByLandlord);

    // Occupancy: use approved/paid bookings as occupied rooms (best-effort)
    const occupied = myBookings.filter(b => b.status && (b.status.toLowerCase() === 'approved' || b.status.toLowerCase() === 'paid' || b.paid)).length;
    const totalRooms = myRooms.length || 0;
    const occupancyPct = totalRooms === 0 ? 0 : Math.round((occupied / totalRooms) * 100);
    const occupancyEl = document.getElementById('occupancyPct');
    if (occupancyEl) occupancyEl.textContent = String(occupancyPct);

    // Pending applications
    const pendingCount = myBookings.filter(b => !b.status || b.status.toLowerCase() === 'pending').length;
    const pendingEl = document.getElementById('pendingApplicationsCount');
    if (pendingEl) pendingEl.textContent = String(pendingCount);

    // Overdue: count bookings without paid=true and sum their monthly amount
    const overdueBookings = myBookings.filter(b => !b.paid && !(b.status && b.status.toLowerCase() === 'paid'));
    const overdueCount = overdueBookings.length;
    const overdueAmount = overdueBookings.reduce((s, b) => {
        const amt = Number(b.monthlyRent || b.monthly || b.price || 0) || 0;
        return s + amt;
    }, 0);
    const overdueAmtEl = document.getElementById('overduePaymentsAmount');
    if (overdueAmtEl) overdueAmtEl.textContent = formatCurrency(overdueAmount);
    const overdueCntEl = document.getElementById('overdueCount');
    if (overdueCntEl) overdueCntEl.textContent = String(overdueCount);

    // Maintenance
    const maintCount = myMaintenance.length;
    const maintEl = document.getElementById('maintenanceRequestsCount');
    if (maintEl) maintEl.textContent = String(maintCount);
    const maintDetailEl = document.getElementById('maintenanceRequestsDetail');
    if (maintDetailEl) {
        if (maintCount === 0) maintDetailEl.textContent = '—';
        else {
            // try to summarize severities if present
            const urgent = myMaintenance.filter(m => m.priority && m.priority.toLowerCase && m.priority.toLowerCase().includes('urgent')).length;
            const routine = maintCount - urgent;
            maintDetailEl.textContent = `${urgent} urgent, ${routine} routine`;
        }
    }
}

// renderApplications, renderPayments and renderRooms
function renderRooms() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;
    container.innerHTML = '';

    const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
    if (!landlord) {
        container.innerHTML = '<div class="p-4 text-sm text-text-secondary">Please log in as landlord to manage rooms.</div>';
        return;
    }

    let rooms = [];
    try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }
    // filter rooms owned by this landlord (best-effort)
    const myRooms = rooms.filter(r => String(r.landlordId) === String(landlord.id) || (r.landlordEmail && landlord.email && r.landlordEmail === landlord.email));

    if (!myRooms || myRooms.length === 0) {
        container.innerHTML = '<div class="p-4 text-sm text-text-secondary">No rooms found. Add rooms from the Room Availability page.</div>';
        return;
    }

    myRooms.forEach(r => {
        const card = document.createElement('div');
        // make each card a column flexbox so content can stretch and footer sits at bottom
        card.className = 'border rounded-lg overflow-hidden hover:shadow-sm transition h-full flex flex-col';
        card.innerHTML = `
                    <div class="relative">
                        <img src="${r.image || 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400'}" alt="${r.title || ''}" class="w-full h-36 object-cover" />
                        <button data-room-id="${r.roomId || (r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="room-image-edit absolute top-2 left-2 bg-white/90 p-2 rounded-md" title="Edit image">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="p-3 flex-1 flex flex-col justify-between">
                        <div class="flex items-start justify-between">
                            <div class="min-w-0">
                                <div class="text-sm font-medium text-text-primary truncate">${r.title || 'Untitled'}</div>
                                <div class="text-xs text-text-secondary truncate">${r.floor || ''} • ${r.beds || ''} beds</div>
                            </div>
                            <div class="ml-3 text-right">
                                <div class="text-sm font-semibold text-primary">${formatCurrency(r.price || r.monthlyRent || r.monthly || 0)}</div>
                                <div class="text-xs text-text-secondary">per month</div>
                            </div>
                        </div>
                    </div>
                    <div class="p-2 border-t flex items-center justify-between">
                        <div class="text-xs text-text-secondary truncate">ID: ${r.roomId || ''}</div>
                        <div class="space-x-2">
                            <button data-room-id-edit="${r.roomId || (r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="room-edit-btn px-3 py-1 text-xs bg-secondary-100 rounded text-text-secondary">Edit</button>
                            <button data-room-id-delete="${r.roomId || (r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="room-delete-btn px-3 py-1 text-xs bg-error-100 rounded text-error">Delete</button>
                        </div>
                    </div>
                `;
        container.appendChild(card);
        // highlight recently added room
        try {
            const lastAdded = localStorage.getItem('rooms_last_added');
            if (lastAdded && (r.roomId || '').toString() === lastAdded.toString()) {
                card.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.18)';
                setTimeout(() => { card.style.boxShadow = ''; }, 2200);
            }
        } catch (e) { /* ignore */ }
    });

    // setup file input for image edits
    if (!document.getElementById('landlordRoomImageEditor')) {
        const fi = document.createElement('input');
        fi.type = 'file'; fi.accept = 'image/*'; fi.id = 'landlordRoomImageEditor'; fi.className = 'hidden';
        document.body.appendChild(fi);

        fi.addEventListener('change', function () {
            const inputEl = this; // the file input
            const file = inputEl.files && inputEl.files[0];
            const roomId = inputEl.dataset.roomId;
            if (!file || !roomId) return;

            // optional size guard to avoid blowing localStorage
            try {
                const maxBytes = 1_500_000; // ~1.5MB
                if (file.size && file.size > maxBytes) {
                    if (!confirm('The selected image is quite large and may exceed browser storage limits. Continue?')) {
                        inputEl.value = '';
                        delete inputEl.dataset.roomId;
                        return;
                    }
                }
            } catch (e) { /* ignore */ }

            const reader = new FileReader();
            reader.onload = function (e) {
                const dataUrl = e.target.result;
                // update rooms array
                try {
                    const roomsArr = JSON.parse(localStorage.getItem('rooms') || '[]');
                    const idx = roomsArr.findIndex(x => (x.roomId || '').toString() === roomId.toString() || (x.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === roomId);
                    if (idx !== -1) {
                        roomsArr[idx].image = dataUrl;
                        roomsArr[idx].updatedAt = new Date().toISOString();
                        localStorage.setItem('rooms', JSON.stringify(roomsArr));
                        // signal other tabs/pages
                        try { localStorage.setItem('rooms_last_edited', roomsArr[idx].roomId || ''); } catch (e) { }
                        try { localStorage.setItem('rooms_last_update', Date.now().toString()); } catch (e) { }
                    }
                } catch (e) { console.error('Failed to persist room image', e); }

                // re-render rooms to show update
                try { renderRooms(); } catch (e) { console.error(e); }

                // clear input and dataset
                try { inputEl.value = ''; delete inputEl.dataset.roomId; } catch (e) { }
            };
            reader.readAsDataURL(file);
        });
    }

    // wire edit buttons
    document.querySelectorAll('.room-image-edit').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const roomId = this.dataset.roomId;
            const fi = document.getElementById('landlordRoomImageEditor');
            if (!fi) return;
            fi.dataset.roomId = roomId;
            fi.click();
        });
    });

    // wire edit and delete buttons (open modal / delete)
    document.querySelectorAll('.room-edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const roomId = this.dataset.roomIdEdit || this.getAttribute('data-room-id-edit');
            openRoomEditor(roomId);
        });
    });

    document.querySelectorAll('.room-delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const roomId = this.dataset.roomIdDelete || this.getAttribute('data-room-id-delete');
            deleteRoom(roomId);
        });
    });
}

// --- Room editor (Add / Edit / Delete) ---
function openRoomEditor(roomId) {
    const modal = document.getElementById('roomEditorModal');
    const titleEl = document.getElementById('roomEditorTitle');
    const titleInput = document.getElementById('roomTitleInput');
    const priceInput = document.getElementById('roomPriceInput');
    const bedsInput = document.getElementById('roomBedsInput');
    const floorInput = document.getElementById('roomFloorInput');
    const preview = document.getElementById('roomImagePreview');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // reset image data store
    modal.dataset.imageData = '';

    if (!roomId) {
        titleEl.textContent = 'Add Room';
        titleInput.value = '';
        priceInput.value = '';
        bedsInput.value = '';
        floorInput.value = '';
        preview.src = 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800';
        modal.dataset.roomId = '';
        return;
    }

    titleEl.textContent = 'Edit Room';
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const r = rooms.find(x => (x.roomId || '').toString() === roomId.toString() || ((x.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === roomId));
    if (!r) return;
    titleInput.value = r.title || '';
    priceInput.value = r.price || r.monthlyRent || r.monthly || '';
    bedsInput.value = r.beds || '';
    floorInput.value = r.floor || '';
    preview.src = r.image || 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800';
    modal.dataset.roomId = r.roomId || ((r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    modal.dataset.imageData = r.image || '';
}

function closeRoomEditor() {
    const modal = document.getElementById('roomEditorModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    delete modal.dataset.roomId;
    delete modal.dataset.imageData;
}

// Wire modal image chooser and preview
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'roomEditorChooseImage') {
        e.preventDefault();
        document.getElementById('roomEditorImageInput').click();
    }
});

document.getElementById('roomEditorImageInput').addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) return;
    // warn on large files
    try {
        const maxBytes = 1_500_000; // ~1.5MB
        if (file.size && file.size > maxBytes) {
            if (!confirm('The selected image is large and may not persist in some browsers. Continue?')) {
                this.value = '';
                return;
            }
        }
    } catch (e) { /* ignore */ }

    const reader = new FileReader();
    const inputEl = this;
    reader.onload = function (ev) {
        const dataUrl = ev.target.result;
        const preview = document.getElementById('roomImagePreview');
        preview.src = dataUrl;
        const modal = document.getElementById('roomEditorModal');
        modal.dataset.imageData = dataUrl;
        // keep input clean
        try { inputEl.value = ''; } catch (e) { }
    };
    reader.readAsDataURL(file);
});

// Save room from modal
document.getElementById('roomEditorSave').addEventListener('click', function () {
    const modal = document.getElementById('roomEditorModal');
    const roomId = modal.dataset.roomId;
    const title = document.getElementById('roomTitleInput').value.trim();
    const price = document.getElementById('roomPriceInput').value;
    const beds = document.getElementById('roomBedsInput').value;
    const floor = document.getElementById('roomFloorInput').value.trim();
    const imageData = modal.dataset.imageData || '';

    if (!title) {
        alert('Please provide a room title');
        return;
    }

    let rooms = [];
    try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }

    if (roomId) {
        // update
        const idx = rooms.findIndex(x => (x.roomId || '').toString() === roomId.toString() || ((x.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === roomId));
        if (idx !== -1) {
            rooms[idx].title = title;
            rooms[idx].price = price;
            rooms[idx].monthlyRent = price;
            rooms[idx].monthly = price;
            rooms[idx].beds = beds;
            rooms[idx].floor = floor;
            if (imageData) rooms[idx].image = imageData;
            rooms[idx].updatedAt = new Date().toISOString();
            // mark last edited for cross-tab listeners
            try { localStorage.setItem('rooms_last_edited', rooms[idx].roomId || ''); } catch (e) { }
        }
    } else {
        // create (add to the front so recent rooms show first)
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
        const newRoom = {
            id: 'rm_' + Date.now() + Math.floor(Math.random() * 9999),
            roomId: slug,
            title: title,
            price: price,
            monthlyRent: price,
            monthly: price,
            beds: beds,
            floor: floor,
            image: imageData || '',
            landlordId: landlord ? landlord.id : null,
            landlordEmail: landlord ? landlord.email : null,
            createdAt: new Date().toISOString()
        };
        // insert at beginning so newest rooms appear first
        rooms.unshift(newRoom);
        try { localStorage.setItem('rooms_last_added', newRoom.roomId); } catch (e) { }
    }

    // persist and notify other tabs/pages
    try {
        localStorage.setItem('rooms', JSON.stringify(rooms));
        localStorage.setItem('rooms_last_update', Date.now().toString());
    } catch (e) { console.error('Failed to persist rooms', e); }
    closeRoomEditor();
    try { renderRooms(); } catch (e) { console.error(e); }
});

document.getElementById('roomEditorCancel').addEventListener('click', function () { closeRoomEditor(); });
document.getElementById('roomEditorClose').addEventListener('click', function () { closeRoomEditor(); });

// Delete room helper
function deleteRoom(roomId) {
    if (!confirm('Delete this room? This action cannot be undone.')) return;
    let rooms = [];
    try { rooms = JSON.parse(localStorage.getItem('rooms') || '[]'); } catch (e) { rooms = []; }
    const filtered = rooms.filter(x => !(((x.roomId || '').toString() === roomId.toString()) || ((x.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === roomId)));
    localStorage.setItem('rooms', JSON.stringify(filtered));
    try { renderRooms(); } catch (e) { console.error(e); }
}


// Logout utility
function landlordLogout() {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('landlordData');
    window.location.href = 'landlord_login.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const userType = localStorage.getItem('userType');
    if (userType !== 'landlord') {
        window.location.href = 'landlord_login.html';
    }

    // Render all dashboard components
    try { renderApplications(); } catch (e) { console.error('Error rendering applications:', e); }
    try { renderPayments(); } catch (e) { console.error('Error rendering payments:', e); }
    try { renderRooms(); } catch (e) { console.error('Error rendering rooms:', e); }
    try { renderRecentVisitors(); } catch (e) { console.error('Error rendering visitors:', e); }

    // Listen for visitor updates
    window.addEventListener('dashboardDataUpdate', function (event) {
        if (event.detail && event.detail.type === 'visitors') {
            try {
                renderRecentVisitors();
            } catch (e) {
                console.error('Error updating visitors:', e);
            }
        }
    });
    // Add Room button
    const addBtn = document.getElementById('addRoomBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () { openRoomEditor(null); });
    }
    // Boarding House button (one per landlord account)
    const manageBoardingBtn = document.getElementById('manageBoardingBtn');
    function getBoardingKey(landlord) {
        try {
            if (landlord && landlord.id) return 'boardingHouse_' + landlord.id;
        } catch (e) { }
        return 'boardingHouse_global';
    }
    function boardingHouseExists(landlord) {
        try {
            const key = getBoardingKey(landlord);
            return !!localStorage.getItem(key);
        } catch (e) { return false; }
    }
    function createBoardingHouse(landlord) {
        try {
            const key = getBoardingKey(landlord);
            const bh = {
                id: 'bh_' + Date.now() + Math.floor(Math.random() * 9999),
                landlordId: landlord ? landlord.id : null,
                title: landlord && (landlord.name || landlord.email) ? (landlord.name || landlord.email) + "'s Boarding House" : 'My Boarding House',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(bh));
            try { localStorage.setItem('boardingHouse_last_update', Date.now().toString()); } catch (e) { }
            return bh;
        } catch (e) { console.error('Failed to create boarding house', e); return null; }
    }
    function updateManageBoardingBtnState() {
        if (!manageBoardingBtn) return;
        const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
        if (!landlord) {
            manageBoardingBtn.textContent = 'Boarding House';
            manageBoardingBtn.classList.remove('opacity-50');
            return;
        }
        if (boardingHouseExists(landlord)) {
            manageBoardingBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/></svg>View Boarding House';
            manageBoardingBtn.classList.remove('btn-primary');
            manageBoardingBtn.classList.add('btn-secondary');
        } else {
            manageBoardingBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Create Boarding House';
            manageBoardingBtn.classList.remove('btn-secondary');
            manageBoardingBtn.classList.add('btn-primary');
        }
    }
    if (manageBoardingBtn) {
        updateManageBoardingBtnState();
        manageBoardingBtn.addEventListener('click', function () {
            const landlord = JSON.parse(localStorage.getItem('landlordData') || 'null');
            if (!landlord) { alert('Please log in as a landlord to manage a boarding house.'); return; }
            if (boardingHouseExists(landlord)) {
                // open boarding house overview (reuse room availability or a dedicated page if available)
                const key = getBoardingKey(landlord);
                const bh = JSON.parse(localStorage.getItem(key) || 'null');
                if (confirm('Open your boarding house page?')) {
                    // navigate to the Boarding House page in the same folder (URL-encoded space)
                    window.location.href = 'Boarding%20house.html';
                }
            } else {
                if (!confirm('Create a boarding house for your account? You can only have one.')) return;
                const created = createBoardingHouse(landlord);
                if (created) {
                    updateManageBoardingBtnState();
                    alert('Boarding house created. You can now add rooms to it.');
                } else {
                    alert('Failed to create boarding house.');
                }
            }
        });
    }
    // Export Report button
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function (e) {
            e.preventDefault();
            try { exportReport(); } catch (err) { console.error(err); alert('Failed to export report'); }
        });
    }
    // Update KPI cards on load
    try { updateDashboardKPIs(); } catch (e) { console.error('Failed to update dashboard KPIs', e); }
});

// Update KPIs and re-render lists when localStorage changes in other tabs
window.addEventListener('storage', function (e) {
    if (!e) return;
    try {
        const keys = ['rooms', 'bookings', 'payments', 'maintenance', 'maintenanceRequests', 'rooms_last_update', 'rooms_last_edited', 'rooms_last_added', 'boardingHouse_last_update', 'activity', 'activity_last_update', 'visitors', 'notifications'];
        if (keys.includes(e.key)) {
            try { updateDashboardKPIs(); } catch (err) { /* ignore */ }
            // ensure UI lists stay in sync across tabs
            try { renderApplications(); } catch (err) { /* ignore */ }
            try { renderPayments(); } catch (err) { /* ignore */ }
            try { renderRooms(); } catch (err) { /* ignore */ }
            try { renderRecentVisitors(); } catch (err) { /* ignore */ }
            // show a brief notification to the landlord about new applications
            try {
                // read pending count from DOM (updateDashboardKPIs should have set it)
                const pendingEl = document.getElementById('pendingApplicationsCount');
                const pending = pendingEl ? Number(pendingEl.textContent || 0) : null;
                if (pending !== null) {
                    showToast('New application received', pending + ' pending application' + (pending !== 1 ? 's' : ''), function () {
                        // scroll to Applications section and highlight
                        const apps = document.getElementById('applicationsTableBody');
                        if (apps) {
                            const section = apps.closest('section') || apps.parentElement;
                            try { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
                            const card = apps.closest('.card-elevated');
                            if (card) {
                                const prev = card.style.boxShadow;
                                card.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.18)';
                                setTimeout(() => { card.style.boxShadow = prev || ''; }, 2200);
                            }
                        }
                    });
                } else {
                    showToast('New application received', 'Check Tenant Applications');
                }
            } catch (ex) { /* ignore toast errors */ }
        }
    } catch (ex) { /* ignore unexpected storage event shapes */ }
});

// Wire Quick Actions and render initial recent activity
window.addEventListener('load', function () {
    // Quick Action buttons
    const reviewBtn = document.getElementById('reviewAppsBtn');
    const paymentsBtn = document.getElementById('processPaymentsBtn');
    const maintBtn = document.getElementById('assignMaintenanceBtn');
    const notifyBtn = document.getElementById('sendNotificationsBtn');

    if (reviewBtn) reviewBtn.addEventListener('click', function () {
        const apps = document.getElementById('applicationsTableBody');
        if (apps) { apps.closest('section').scrollIntoView({ behavior: 'smooth' }); }
    });
    if (paymentsBtn) paymentsBtn.addEventListener('click', function () {
        const pay = document.getElementById('paymentsTableBody');
        if (pay) { pay.closest('section').scrollIntoView({ behavior: 'smooth' }); }
    });
    if (maintBtn) maintBtn.addEventListener('click', function () {
        const maint = document.getElementById('maintenanceRequestsCount');
        if (maint) { maint.closest('section') ? maint.closest('section').scrollIntoView({ behavior: 'smooth' }) : maint.scrollIntoView({ behavior: 'smooth' }); }

        // Get maintenance requests
        try {
            const requests = JSON.parse(localStorage.getItem('maintenance') || '[]');
            if (requests.length > 0) {
                requests.forEach(req => {
                    if (req.status === 'pending') {
                        createNotification(
                            'maintenance',
                            'Maintenance Request Update',
                            `Your request for ${req.issue} is being processed.`,
                            req.studentId,
                            req.roomId
                        );
                    }
                });
                showToast('Maintenance Updates', 'Notifications sent to affected tenants');
                pushActivity({
                    type: 'maintenance',
                    title: 'Maintenance Requests Processed',
                    subtitle: `Updated ${requests.length} request(s)`
                });
                renderRecentActivity();
            }
        } catch (e) {
            console.error('Error processing maintenance requests', e);
        }
    });
    // Notification composer modal handling
    const notificationModal = document.getElementById('notificationComposerModal');
    const closeNotificationModal = () => {
        notificationModal.classList.add('hidden');
        notificationModal.classList.remove('flex');
        // Reset form
        document.getElementById('notificationType').value = 'announcement';
        document.getElementById('notificationTitle').value = '';
        document.getElementById('notificationMessage').value = '';
        document.getElementById('notificationRecipients').value = 'all';
    };

    // Wire up notification modal buttons
    document.getElementById('notificationComposerClose')?.addEventListener('click', closeNotificationModal);
    document.getElementById('notificationComposerCancel')?.addEventListener('click', closeNotificationModal);

    // Handle notification type changes to update title placeholder
    document.getElementById('notificationType')?.addEventListener('change', function (e) {
        const titleInput = document.getElementById('notificationTitle');
        switch (e.target.value) {
            case 'payment':
                titleInput.placeholder = 'e.g., "Monthly Rent Due Reminder"';
                break;
            case 'maintenance':
                titleInput.placeholder = 'e.g., "Maintenance Schedule Update"';
                break;
            case 'rules':
                titleInput.placeholder = 'e.g., "New Visitor Policy"';
                break;
            default:
                titleInput.placeholder = 'e.g., "Important Announcement"';
        }
    });

    // Send notification button handler
    document.getElementById('notificationComposerSend')?.addEventListener('click', function () {
        const type = document.getElementById('notificationType').value;
        const title = document.getElementById('notificationTitle').value.trim();
        const message = document.getElementById('notificationMessage').value.trim();
        const recipients = document.getElementById('notificationRecipients').value;

        if (!title || !message) {
            alert('Please fill in both title and message');
            return;
        }

        // Get relevant student IDs based on recipient selection
        let targetStudentIds = [];
        try {
            if (recipients === 'unpaid') {
                const payments = getPaymentsFromStorage();
                const unpaidBookings = getBookingsFromStorage().filter(b => !b.paid);
                targetStudentIds = unpaidBookings.map(b => b.studentId).filter(Boolean);
            } else if (recipients === 'maintenance') {
                const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
                targetStudentIds = maintenance
                    .filter(m => m.status === 'pending')
                    .map(m => m.studentId)
                    .filter(Boolean);
            }
            // 'all' will leave targetStudentIds empty, meaning send to everyone
        } catch (e) {
            console.error('Error filtering recipients', e);
        }

        // Create the notification
        createNotification(
            type,
            title,
            message,
            recipients === 'all' ? null : targetStudentIds.length > 0 ? targetStudentIds : null
        );

        // Add to activity log
        pushActivity({
            type: type,
            title: title,
            subtitle: message,
            targetGroup: recipients
        });

        // Show success toast
        showToast('Notification Sent', `Sent to ${recipients === 'all' ? 'all students' : 'selected students'}`);

        // Update UI
        try { renderRecentActivity(); } catch (e) { }

        // Close modal
        closeNotificationModal();
    });

    if (notifyBtn) notifyBtn.addEventListener('click', function () {
        // Show notification composer modal
        notificationModal.classList.remove('hidden');
        notificationModal.classList.add('flex');
    });    // initial render
    // Initial render
    try { renderRecentActivity(); } catch (e) { console.error('Error rendering activity:', e); }
    try { renderRecentVisitors(); } catch (e) { console.error('Error rendering visitors:', e); }

    // Listen for dashboard data updates
    window.addEventListener('dashboardDataUpdate', function (event) {
        if (event.detail) {
            switch (event.detail.type) {
                case 'visitors':
                    try { renderRecentVisitors(); } catch (e) { console.error('Error updating visitors:', e); }
                    break;
                case 'notifications':
                    try { renderRecentActivity(); } catch (e) { console.error('Error updating activity:', e); }
                    break;
            }
        }
    });
});

// Toast helper: show a short notification with optional view callback
function showToast(title, subtitle, onView) {
    const toast = document.getElementById('liveToast');
    if (!toast) return;
    const msg = document.getElementById('liveToastMessage');
    const sub = document.getElementById('liveToastSub');
    const viewBtn = document.getElementById('liveToastViewBtn');
    const closeBtn = document.getElementById('liveToastCloseBtn');
    if (msg) msg.textContent = title || '';
    if (sub) sub.textContent = subtitle || '';
    // show
    toast.classList.remove('hidden');

    // view handler
    if (viewBtn) {
        viewBtn.onclick = function (ev) {
            ev.preventDefault();
            try { if (typeof onView === 'function') onView(); } catch (e) { }
            // hide after view
            try { toast.classList.add('hidden'); } catch (e) { }
        };
    }

    // close handler
    if (closeBtn) closeBtn.onclick = function () { toast.classList.add('hidden'); };

    // auto-hide after 6s
    try {
        if (toast._timeout) clearTimeout(toast._timeout);
    } catch (e) { }
    toast._timeout = setTimeout(() => { try { toast.classList.add('hidden'); } catch (e) { } }, 6000);
}
