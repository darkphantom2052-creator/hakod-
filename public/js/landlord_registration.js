
// Landlord registration form handling
document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect fields
    const fullName = document.getElementById('fullName').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const propertyName = document.getElementById('propertyName').value.trim();
    const propertyAddress = document.getElementById('propertyAddress').value.trim();
    const distanceFromCampus = parseFloat(document.getElementById('distanceFromCampus').value);
    const totalRooms = parseInt(document.getElementById('totalRooms').value, 10);
    const minPrice = parseFloat(document.getElementById('minPrice').value);
    const maxPrice = parseFloat(document.getElementById('maxPrice').value);
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // Room types
    const roomTypeNodes = Array.from(document.querySelectorAll('input[name="roomTypes"]'));
    const roomTypes = roomTypeNodes.filter(n => n.checked).map(n => n.value);

    // Amenities
    const amenityNodes = Array.from(document.querySelectorAll('input[name="amenities"]'));
    const amenities = amenityNodes.filter(n => n.checked).map(n => n.value);

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(err => err.classList.add('hidden'));

    let isValid = true;

    if (!fullName) { document.getElementById('fullNameError').classList.remove('hidden'); isValid = false; }
    const phonePattern = /^9\d{9}$/;
    if (!contactNumber || !phonePattern.test(contactNumber)) { document.getElementById('contactNumberError').classList.remove('hidden'); isValid = false; }
    if (!email || !/.+@.+\..+/.test(email)) { document.getElementById('emailError').classList.remove('hidden'); isValid = false; }
    if (!propertyName) { document.getElementById('propertyNameError').classList.remove('hidden'); isValid = false; }
    if (!propertyAddress) { document.getElementById('propertyAddressError').classList.remove('hidden'); isValid = false; }
    if (isNaN(distanceFromCampus) || distanceFromCampus < 0) { document.getElementById('distanceError').classList.remove('hidden'); isValid = false; }
    if (isNaN(totalRooms) || totalRooms < 1) { document.getElementById('totalRoomsError').classList.remove('hidden'); isValid = false; }
    if (roomTypes.length === 0) { document.getElementById('roomTypesError').classList.remove('hidden'); isValid = false; }
    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) { document.getElementById('priceError').classList.remove('hidden'); isValid = false; }
    if (!password || password.length < 8) { document.getElementById('passwordError').classList.remove('hidden'); isValid = false; }
    if (password !== confirmPassword) { document.getElementById('confirmPasswordError').classList.remove('hidden'); isValid = false; }
    if (!terms) { document.getElementById('termsError').classList.remove('hidden'); isValid = false; }

    if (!isValid) return;

    // Show loading state
    const registerBtn = document.getElementById('registerBtn');
    const registerText = document.getElementById('registerText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    registerBtn.disabled = true;
    registerText.textContent = 'Registering...';
    loadingSpinner.classList.remove('hidden');

    setTimeout(() => {
        const landlordData = {
            id: 'landlord-' + email.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            fullName,
            contactNumber,
            email,
            propertyName,
            propertyAddress,
            distanceFromCampus,
            totalRooms,
            roomTypes,
            amenities,
            minPrice,
            maxPrice,
            // store a simple base64-encoded password for demo (not secure for production)
            password: btoa(password),
            registeredAt: new Date().toISOString()
        };

        const landlords = JSON.parse(localStorage.getItem('registeredLandlords') || '[]');
        landlords.push(landlordData);
        localStorage.setItem('registeredLandlords', JSON.stringify(landlords));

        // Auto-login the newly registered landlord and redirect to dashboard
        localStorage.setItem('userType', 'landlord');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('landlordData', JSON.stringify(landlordData));
        window.location.href = 'landlord_dashboard.html';
    }, 1000);
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
});

// Show registration success message if redirected from registration
window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registration') === 'success') {
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md text-sm animate-fade-in';
        successMessage.innerHTML = `
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Registration successful! Please sign in.
                    </div>
                `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 5000);
    }
});
