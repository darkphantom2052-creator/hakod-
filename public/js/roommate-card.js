// Roommate card functionality
document.addEventListener('DOMContentLoaded', function () {
    function updateRoommateCard() {
        // Get DOM elements
        const roommateCard = {
            count: document.getElementById('roommateCount'),
            name: document.getElementById('roommateName'),
            details: document.getElementById('roommateDetails')
        };

        // Get current student data
        const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
        const roommates = JSON.parse(localStorage.getItem('roommates') || '[]');

        // Get room capacity and current occupants
        const roomCapacity = studentData.room?.capacity || 2;
        const currentOccupants = roommates.length + 1; // +1 for the current student

        // Update roommate count
        if (roommateCard.count) {
            roommateCard.count.textContent = `${currentOccupants}/${roomCapacity}`;
            // Update status color based on occupancy
            if (currentOccupants >= roomCapacity) {
                roommateCard.count.className = 'status-success';
            } else if (currentOccupants === 1) {
                roommateCard.count.className = 'status-warning';
            } else {
                roommateCard.count.className = 'status-info';
            }
        }

        // Update roommate info
        if (roommates.length > 0) {
            const primaryRoommate = roommates[0];
            if (roommateCard.name) {
                roommateCard.name.textContent = primaryRoommate.fullName || primaryRoommate.name || 'Not Assigned';
            }
            if (roommateCard.details) {
                const details = [];
                if (primaryRoommate.course) details.push(primaryRoommate.course);
                if (primaryRoommate.year) details.push(`${primaryRoommate.year} Year`);
                roommateCard.details.textContent = details.join(' • ') || 'No details available';
            }
        } else {
            // No roommates
            if (roommateCard.name) roommateCard.name.textContent = 'No Roommate';
            if (roommateCard.details) roommateCard.details.textContent = 'Room available for sharing';
        }

        // Make card clickable to show roommate details
        const card = document.getElementById('roommateCard');
        if (card) {
            card.style.cursor = 'pointer';
            card.onclick = function () {
                showRoommateDetails(roommates, studentData);
            };
        }
    }

    function showRoommateDetails(roommates, studentData) {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-secondary-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl font-semibold text-text-primary">Room Occupants</h2>
                            <button id="closeRoommateModal" class="text-text-secondary hover:text-text-primary">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="p-6 overflow-y-auto">
                        <div class="space-y-4">
                            <!-- Current Student -->
                            <div class="flex items-center space-x-4 p-4 bg-primary-50 rounded-lg">
                                <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                    ${(studentData.firstName?.[0] || 'U')}${(studentData.lastName?.[0] || 'U')}
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium text-lg">${studentData.fullName || 'Current User'} (You)</p>
                                    <p class="text-sm text-text-secondary">${studentData.course || ''} ${studentData.year ? studentData.year + ' Year' : ''}</p>
                                    <p class="text-xs text-primary-600 mt-1">Student ID: ${studentData.studentId || 'N/A'}</p>
                                </div>
                                <div class="bg-primary-100 px-3 py-1 rounded-full">
                                    <span class="text-sm text-primary-700">Current</span>
                                </div>
                            </div>

                            ${roommates.map((roommate, index) => `
                                <div class="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                                    <div class="w-12 h-12 bg-secondary-200 rounded-full flex items-center justify-center text-text-primary font-bold">
                                        ${(roommate.firstName?.[0] || roommate.name?.[0] || 'U')}${(roommate.lastName?.[0] || 'U')}
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-medium text-lg">${roommate.fullName || roommate.name || 'Unnamed Roommate'}</p>
                                        <p class="text-sm text-text-secondary">${roommate.course || ''} ${roommate.year ? roommate.year + ' Year' : ''}</p>
                                        <p class="text-xs text-secondary-600 mt-1">Student ID: ${roommate.studentId || 'N/A'}</p>
                                    </div>
                                </div>
                            `).join('')}

                            ${roommates.length === 0 ? `
                                <div class="text-center py-8">
                                    <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <p class="text-lg font-medium text-text-primary">No Roommates Yet</p>
                                    <p class="text-sm text-text-secondary mt-2">You're currently the only occupant in this room.</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Add event listeners
        document.getElementById('closeRoommateModal').addEventListener('click', function () {
            modalContainer.remove();
        });

        // Close on background click
        modalContainer.firstElementChild.addEventListener('click', function (e) {
            if (e.target === this) {
                modalContainer.remove();
            }
        });
    }

    // Initial update
    updateRoommateCard();

    // Listen for changes in localStorage
    window.addEventListener('storage', function (e) {
        if (e.key === 'roommates' || e.key === 'studentData') {
            updateRoommateCard();
        }
    });
});