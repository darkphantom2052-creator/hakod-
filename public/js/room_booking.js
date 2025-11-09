
// Form validation and submission
document.getElementById('bookingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(error => error.classList.add('hidden'));

    // Validate form
    let isValid = validateForm();

    if (!isValid) return;

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Processing...';
    submitSpinner.classList.remove('hidden');

    // Save form data locally for offline persistence and push booking into bookings array
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // include selected room and price in saved booking request
    const selectedRaw = document.getElementById('selectedRoomInput') ? document.getElementById('selectedRoomInput').value : localStorage.getItem('selectedRoom');
    let selectedObj = null;
    try {
        selectedObj = typeof selectedRaw === 'string' ? JSON.parse(selectedRaw) : selectedRaw;
    } catch (e) {
        // selectedRaw might be a plain string title
        selectedObj = { title: selectedRaw };
    }

    const selectedTitle = selectedObj ? (selectedObj.title || selectedObj.roomTitle || '') : '';
    const selectedPrice = document.getElementById('selectedPriceInput') ? document.getElementById('selectedPriceInput').value : (selectedObj ? selectedObj.price : null);
    const roomId = selectedObj && (selectedObj.roomId || selectedObj.title) ? (selectedObj.roomId || (selectedObj.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')) : 'unknown-room';

    // attempt to include landlord linkage on the booking (each boarding house has a landlord)
    let landlordId = selectedObj && selectedObj.landlordId ? selectedObj.landlordId : null;
    let landlordEmail = selectedObj && selectedObj.landlordEmail ? selectedObj.landlordEmail : null;
    if (!landlordId) {
        try {
            const roomsArr = JSON.parse(localStorage.getItem('rooms') || '[]');
            const found = roomsArr.find(r => r.roomId === roomId || r.title === selectedTitle);
            if (found) {
                landlordId = landlordId || found.landlordId || null;
                landlordEmail = landlordEmail || found.landlordEmail || null;
            }
        } catch (e) { /* ignore */ }
    }

    const bookingRecord = {
        id: 'bk_' + Date.now() + Math.floor(Math.random() * 9999),
        timestamp: new Date().toISOString(),
        roomTitle: selectedTitle,
        roomId: roomId,
        monthlyRent: selectedPrice ? Number(selectedPrice) : null,
        applicantName: (formObject.firstName || '') + ' ' + (formObject.lastName || ''),
        applicantEmail: formObject.email || formObject.contactEmail || null,
        contactNumber: formObject.contactNumber || null,
        moveInDate: formObject.moveInDate || null,
        duration: formObject.duration || null,
        landlordId: landlordId || null,
        landlordEmail: landlordEmail || null,
        status: 'pending',
        form: formObject
    };

    // push into bookings array and signal update for other tabs
    try {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingRecord);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        // signal other tabs/pages that bookings changed
        try { localStorage.setItem('bookings_last_update', Date.now().toString()); } catch (e) { /* ignore */ }
    } catch (e) {
        console.error('Failed to save booking to bookings array', e);
        // fallback: save single legacy booking key
        localStorage.setItem('bookingRequest', JSON.stringify(bookingRecord));
        try { localStorage.setItem('bookings_last_update', Date.now().toString()); } catch (err) { /* ignore */ }
    }

    // also save legacy single bookingRequest for backward compatibility
    try { localStorage.setItem('bookingRequest', JSON.stringify(bookingRecord)); } catch (e) { /* ignore */ }

    // Simulate API call
    setTimeout(() => {
        // Show success modal
        document.getElementById('successModal').classList.remove('hidden');

        // Reset form
        this.reset();
        submitBtn.disabled = false;
        submitText.textContent = 'Submit Booking Request';
        submitSpinner.classList.add('hidden');
    }, 2000);
});

// Form validation function
function validateForm() {
    let isValid = true;

    // Required fields validation - only check fields that exist on this form
    const requiredFields = [
        'firstName', 'lastName', 'studentId', 'course', 'yearLevel',
        'contactNumber', 'moveInDate', 'duration', 'emergencyName',
        'emergencyRelationship', 'emergencyPhone', 'emergencyAddress'
    ];

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorDiv = document.getElementById(fieldName + 'Error');

        // If element doesn't exist, skip it (defensive)
        if (!field) return;

        const value = (field.value || '').toString().trim();
        if (!value) {
            if (errorDiv) errorDiv.classList.remove('hidden');
            isValid = false;
        }
    });

    // Check agreements (defensive: ensure elements exist)
    const agreements = ['agreeRules', 'agreePayment', 'agreeInfo'];
    let allAgreed = true;

    agreements.forEach(agreementId => {
        const el = document.getElementById(agreementId);
        if (!el || !el.checked) allAgreed = false;
    });

    if (!allAgreed) {
        const agreementError = document.getElementById('agreementError');
        if (agreementError) agreementError.classList.remove('hidden');
        isValid = false;
    }

    return isValid;
}

// Roommate preference handling
document.querySelectorAll('input[name="roommatePreference"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const roommateDetails = document.getElementById('roommateDetails');
        if (this.value === 'specific-person') {
            roommateDetails.style.display = 'block';
        } else {
            roommateDetails.style.display = 'none';
        }
    });
});


// Payment method selection
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function () {
        // Remove selected class from all labels
        document.querySelectorAll('input[name="paymentMethod"]').forEach(r => {
            r.closest('label').classList.remove('border-primary', 'bg-primary-50');
        });

        // Add selected class to chosen option
        this.closest('label').classList.add('border-primary', 'bg-primary-50');
    });
});

// File upload handling
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function () {
        const label = this.nextElementSibling.querySelector('span');
        if (this.files.length > 0) {
            label.textContent = this.files[0].name;
            this.closest('.border-dashed').classList.add('border-success', 'bg-success-50');
        }
    });
});

// Auto-save form data
function autoSaveForm() {
    const formData = new FormData(document.getElementById('bookingForm'));
    const formObject = {};
    formData.forEach((value, key) => {
        if (value) formObject[key] = value;
    });

    localStorage.setItem('bookingFormDraft', JSON.stringify(formObject));
}

// Auto-save every 30 seconds
setInterval(autoSaveForm, 30000);

// Load saved form data on page load
window.addEventListener('load', function () {
    const savedData = localStorage.getItem('bookingFormDraft');
    if (savedData) {
        const formObject = JSON.parse(savedData);
        Object.keys(formObject).forEach(key => {
            const field = document.getElementById(key);
            if (field && field.type !== 'file') {
                field.value = formObject[key];
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = formObject[key] === 'on' || formObject[key] === field.value;
                }
            }
        });
    }
});

// Close modal function
function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
}

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

// Set minimum date to today
document.getElementById('moveInDate').min = new Date().toISOString().split('T')[0];

// Populate selected room and pricing based on selection from Room Availability
function populateSelectedRoom() {
    const selectedRaw = localStorage.getItem('selectedRoom');
    const monthlyEl = document.getElementById('monthlyRent');
    const depositEl = document.getElementById('securityDeposit');
    const appFeeEl = document.getElementById('applicationFee');
    const initialEl = document.getElementById('initialPayment');
    const selectedRoomInput = document.getElementById('selectedRoomInput');
    const selectedPriceInput = document.getElementById('selectedPriceInput');

    // default values
    let monthly = null;
    const appFee = 500;

    // parse structured selectedRoom if available
    let selectedObj = null;
    try {
        if (selectedRaw) {
            selectedObj = JSON.parse(selectedRaw);
        }
    } catch (e) {
        // legacy string
        selectedObj = { title: selectedRaw };
    }

    if (selectedObj) {
        // populate display fields from object
        if (selectedRoomInput) selectedRoomInput.value = selectedObj.title || selectedObj.roomTitle || '';
        const titleEl = document.getElementById('selectedRoomTitle');
        const locationEl = document.getElementById('selectedRoomLocation');
        if (titleEl) titleEl.textContent = selectedObj.title || selectedObj.roomTitle || titleEl.textContent;
        if (locationEl && selectedObj.floor) locationEl.textContent = selectedObj.floor;

        // set image if landlord saved one
        const selImg = document.getElementById('selectedRoomImage');
        if (selImg && selectedObj.image) selImg.src = selectedObj.image;

        // try to refresh from rooms storage if available (use latest landlord edits)
        try {
            const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
            if (rooms && rooms.length && selectedObj.roomId) {
                const found = rooms.find(r => r.roomId === selectedObj.roomId || (r.title && (r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedObj.roomId));
                if (found) {
                    if (selImg && found.image) selImg.src = found.image;
                    monthly = found.price || found.monthlyRent || monthly;
                    if (selectedRoomInput) selectedRoomInput.value = found.title || selectedRoomInput.value;
                }
            }
        } catch (e) { /* ignore */ }

        monthly = selectedObj.price || selectedObj.monthlyRent || null;
    }

    // fallback: try to parse number shown already
    if (!monthly) {
        const current = monthlyEl.textContent.replace(/[^0-9]/g, '');
        monthly = current ? parseInt(current, 10) : 0;
    }

    const deposit = monthly; // deposit equals one month's rent by policy
    const initial = monthly + deposit + appFee;

    // Update UI
    monthlyEl.textContent = '₱' + (monthly || 0).toLocaleString();
    depositEl.textContent = '₱' + (deposit || 0).toLocaleString();
    appFeeEl.textContent = '₱' + appFee.toLocaleString();
    initialEl.textContent = '₱' + (initial || 0).toLocaleString();

    // set hidden inputs
    selectedPriceInput.value = monthly || '';
    if (selectedRoomInput && !selectedRoomInput.value && selectedObj) selectedRoomInput.value = selectedObj.title || selectedObj.roomTitle || '';
}

// run on load
window.addEventListener('load', populateSelectedRoom);

// Listen for cross-tab changes to rooms/selectedRoom so booking page updates in open tabs
window.addEventListener('storage', function (e) {
    if (!e) return;
    if (e.key === 'selectedRoom' || e.key === 'rooms' || e.key === 'rooms_last_update' || e.key === 'rooms_last_added') {
        populateSelectedRoom();
    }
});
