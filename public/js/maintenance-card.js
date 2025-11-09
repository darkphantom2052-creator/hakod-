// Maintenance card interactivity
document.addEventListener('DOMContentLoaded', function () {
    const maintenanceCard = document.getElementById('maintenanceCard');

    if (maintenanceCard) {
        maintenanceCard.style.cursor = 'pointer';

        maintenanceCard.addEventListener('click', function () {
            const maintenanceRequests = JSON.parse(localStorage.getItem('maintenance') || '[]');
            const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
            const myRequests = maintenanceRequests.filter(req => req.studentId === studentData.id);

            if (myRequests.length === 0) {
                // If no requests, trigger the maintenance request button
                document.getElementById('submitMaintenanceBtn')?.click();
                return;
            }

            // Show maintenance history
            const requestsList = myRequests.map(req => `
                <div class="border-l-4 ${req.status === 'pending' ? 'border-warning' : 'border-success'} p-4 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg">${req.issue}</h3>
                            <p class="text-sm text-text-secondary">Submitted: ${new Date(req.dateSubmitted).toLocaleDateString()}</p>
                        </div>
                        <span class="status-${req.status === 'pending' ? 'warning' : 'success'}">${req.status}</span>
                    </div>
                    ${req.response ? `<p class="mt-2 text-sm">${req.response}</p>` : ''}
                </div>
            `).join('');

            // Create and show modal
            const modalHTML = `
                <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div class="p-6 border-b border-secondary-200">
                            <div class="flex justify-between items-center">
                                <h2 class="text-xl font-semibold">Maintenance Requests History</h2>
                                <button class="text-text-secondary hover:text-text-primary" id="closeMaintenanceModal">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="p-6 overflow-y-auto max-h-[60vh]">
                            <div class="space-y-4">
                                ${requestsList}
                            </div>
                        </div>
                        <div class="p-6 border-t border-secondary-200 flex justify-end">
                            <button class="btn bg-warning text-white hover:bg-warning-700" id="newMaintenanceRequest">
                                New Request
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to document
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);

            // Add event listeners
            document.getElementById('closeMaintenanceModal').addEventListener('click', function () {
                modalContainer.remove();
            });

            document.getElementById('newMaintenanceRequest').addEventListener('click', function () {
                modalContainer.remove();
                document.getElementById('submitMaintenanceBtn')?.click();
            });

            // Close on background click
            modalContainer.firstElementChild.addEventListener('click', function (e) {
                if (e.target === this) {
                    modalContainer.remove();
                }
            });
        });
    }
});