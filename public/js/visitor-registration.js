// Visitor registration modal and storage
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('registerVisitorBtn');
    if (!btn) return;

    btn.addEventListener('click', () => openVisitorModal());

    function openVisitorModal() {
        const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Register Visitor</h3>
                    <button class="close-modal text-text-secondary hover:text-text-primary">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="p-4 space-y-4">
                    <form id="visitorForm" class="space-y-4">
                        <div>
                            <label class="block text-sm text-text-secondary mb-1">Visitor Name</label>
                            <input id="visitorName" class="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label class="block text-sm text-text-secondary mb-1">Relation</label>
                            <input id="visitorRelation" class="w-full p-2 border rounded" placeholder="e.g. Parent, Friend" />
                        </div>
                        <div>
                            <label class="block text-sm text-text-secondary mb-1">Contact Number</label>
                            <input id="visitorContact" class="w-full p-2 border rounded" placeholder="+63..." />
                        </div>
                        <div>
                            <label class="block text-sm text-text-secondary mb-1">Purpose</label>
                            <input id="visitorPurpose" class="w-full p-2 border rounded" placeholder="Visit purpose" />
                        </div>
                        <div>
                            <label class="block text-sm text-text-secondary mb-1">Expected Arrival</label>
                            <input id="visitorDateTime" type="datetime-local" class="w-full p-2 border rounded" />
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="btn bg-primary text-white">Submit</button>
                            <button type="button" class="btn bg-secondary-100 close-modal">Cancel</button>
                        </div>
                    </form>

                    <div>
                        <h4 class="text-sm font-semibold mb-2">Recent Visitors</h4>
                        <div id="recentVisitors" class="space-y-2 text-sm text-text-secondary"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Populate recent visitors
        renderRecentVisitors(modal);

        // Close buttons
        modal.querySelectorAll('.close-modal').forEach(el => el.addEventListener('click', () => modal.remove()));

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const form = modal.querySelector('#visitorForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = modal.querySelector('#visitorName').value.trim();
            const relation = modal.querySelector('#visitorRelation').value.trim();
            const contact = modal.querySelector('#visitorContact').value.trim();
            const purpose = modal.querySelector('#visitorPurpose').value.trim();
            const dateTime = modal.querySelector('#visitorDateTime').value;

            if (!name) {
                alert('Please enter visitor name.');
                return;
            }

            const visitor = {
                id: Date.now().toString(),
                studentId: studentData.id || null,
                name,
                relation,
                contact,
                purpose,
                expectedAt: dateTime || new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            saveVisitor(visitor);
            // Notify dashboard manager (if present)
            try { window.dispatchEvent(new CustomEvent('dashboardDataUpdate', { detail: { type: 'visitors' } })); } catch (err) { }

            modal.remove();
            // Simple feedback
            alert('Visitor registered successfully.');
        });
    }

    function saveVisitor(visitor) {
        const list = JSON.parse(localStorage.getItem('visitors') || '[]');
        list.unshift(visitor);
        // Keep recent 50
        localStorage.setItem('visitors', JSON.stringify(list.slice(0, 50)));
    }

    function renderRecentVisitors(modal) {
        const container = modal.querySelector('#recentVisitors');
        const list = JSON.parse(localStorage.getItem('visitors') || '[]');
        if (!list.length) {
            container.innerHTML = '<p class="text-xs text-text-secondary">No recent visitors</p>';
            return;
        }
        container.innerHTML = list.slice(0, 5).map(v => `
            <div class="p-2 bg-secondary-50 rounded flex justify-between items-center">
                <div>
                    <div class="font-medium">${escapeHtml(v.name)}</div>
                    <div class="text-xs">${escapeHtml(v.relation || '')} ${v.contact ? '• ' + escapeHtml(v.contact) : ''}</div>
                </div>
                <div class="text-xs text-text-secondary">${new Date(v.expectedAt).toLocaleString()}</div>
            </div>
        `).join('');
    }

    function escapeHtml(str) {
        return String(str || '').replace(/[&"'<>]/g, function (s) {
            return ({ '&': '&amp;', '"': '&quot;', "'": "&#39;", '<': '&lt;', '>': '&gt;' })[s];
        });
    }
});