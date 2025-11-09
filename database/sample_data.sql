-- Insert sample users (landlords and students)
INSERT INTO
    Users (
        email,
        password_hash,
        user_type,
        first_name,
        last_name,
        contact_number,
        address,
        is_verified
    )
VALUES (
        'landlord1@example.com',
        'hashed_password',
        'landlord',
        'John',
        'Smith',
        '+639123456789',
        '123 Landlord St, City',
        true
    ),
    (
        'landlord2@example.com',
        'hashed_password',
        'landlord',
        'Mary',
        'Johnson',
        '+639123456790',
        '456 Owner Ave, City',
        true
    ),
    (
        'student1@example.com',
        'hashed_password',
        'student',
        'Alice',
        'Brown',
        '+639123456791',
        'JRMSU TC Campus',
        true
    ),
    (
        'student2@example.com',
        'hashed_password',
        'student',
        'Bob',
        'Wilson',
        '+639123456792',
        'JRMSU TC Campus',
        true
    );

-- Insert sample boarding houses
INSERT INTO
    BoardingHouses (
        landlord_id,
        title,
        description,
        address,
        amenities,
        rules,
        status
    )
VALUES (
        1,
        'Sunshine Boarding House',
        'Modern boarding house near JRMSU TC',
        '789 University Ave',
        '{"wifi": true, "security": true, "common_area": true, "kitchen": true}',
        'No pets allowed\nQuiet hours from 10 PM to 6 AM\nNo smoking inside rooms',
        'active'
    ),
    (
        2,
        'Student Haven',
        'Comfortable rooms with study areas',
        '101 College St',
        '{"wifi": true, "study_room": true, "laundry": true}',
        'Visitors allowed until 9 PM\nKeep common areas clean\nNo loud music',
        'active'
    );

-- Insert sample rooms
INSERT INTO
    Rooms (
        boarding_house_id,
        room_number,
        room_type,
        monthly_rent,
        capacity,
        current_occupants,
        floor_area,
        description,
        amenities,
        status
    )
VALUES (
        1,
        '101',
        'single',
        2500.00,
        1,
        0,
        12.5,
        'Single room with private bathroom',
        '{"aircon": true, "private_bath": true}',
        'available'
    ),
    (
        1,
        '102',
        'double',
        2000.00,
        2,
        1,
        20.0,
        'Spacious double room',
        '{"fan": true, "shared_bath": true}',
        'available'
    ),
    (
        2,
        '201',
        'single',
        3000.00,
        1,
        0,
        15.0,
        'Furnished single room',
        '{"aircon": true, "private_bath": true}',
        'available'
    ),
    (
        2,
        '202',
        'double',
        2500.00,
        2,
        2,
        25.0,
        'Double room with balcony',
        '{"fan": true, "balcony": true}',
        'occupied'
    );

-- Insert sample room images
INSERT INTO
    RoomImages (
        room_id,
        image_url,
        is_primary
    )
VALUES (
        1,
        '/images/rooms/101_1.jpg',
        true
    ),
    (
        1,
        '/images/rooms/101_2.jpg',
        false
    ),
    (
        2,
        '/images/rooms/102_1.jpg',
        true
    ),
    (
        3,
        '/images/rooms/201_1.jpg',
        true
    );

-- Insert sample bookings
INSERT INTO
    Bookings (
        room_id,
        student_id,
        move_in_date,
        duration_months,
        monthly_rate,
        status,
        special_requests
    )
VALUES (
        2,
        3,
        '2025-06-01',
        6,
        2000.00,
        'active',
        'Need extra mattress'
    ),
    (
        4,
        4,
        '2025-06-01',
        12,
        2500.00,
        'active',
        NULL
    );

-- Insert sample reviews
INSERT INTO
    Reviews (
        boarding_house_id,
        student_id,
        rating,
        comment
    )
VALUES (
        1,
        3,
        4.5,
        'Great location and clean facilities'
    ),
    (
        2,
        4,
        4.0,
        'Nice environment for studying'
    );

-- Insert sample notifications
INSERT INTO
    Notifications (user_id, title, message, type)
VALUES (
        1,
        'New Booking Request',
        'You have a new booking request for Room 101',
        'booking_request'
    ),
    (
        3,
        'Booking Approved',
        'Your booking request has been approved',
        'booking_update'
    );

-- Insert sample payments
INSERT INTO
    Payments (
        booking_id,
        amount,
        payment_date,
        payment_method,
        status,
        transaction_reference
    )
VALUES (
        1,
        2000.00,
        '2025-06-01',
        'gcash',
        'completed',
        'GC123456789'
    ),
    (
        2,
        2500.00,
        '2025-06-01',
        'bank_transfer',
        'completed',
        'BT987654321'
    );

-- Insert sample maintenance requests
INSERT INTO
    MaintenanceRequests (
        room_id,
        reported_by,
        issue_type,
        description,
        status,
        priority
    )
VALUES (
        2,
        3,
        'plumbing',
        'Leaking faucet in the bathroom',
        'in_progress',
        'medium'
    ),
    (
        4,
        4,
        'electrical',
        'Flickering lights in the room',
        'completed',
        'high'
    );