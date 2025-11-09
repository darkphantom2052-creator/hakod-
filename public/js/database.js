// Database connection configuration
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // Update this if you have set a password
    database: 'boarding_house_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

// Helper function to execute queries
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Common database operations
const db = {
    // User operations
    async createUser(userData) {
        const sql = `INSERT INTO Users (email, password_hash, user_type, first_name, last_name, 
                     contact_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        return await query(sql, [
            userData.email,
            userData.password_hash,
            userData.user_type,
            userData.first_name,
            userData.last_name,
            userData.contact_number,
            userData.address
        ]);
    },

    async getUserById(userId) {
        return await query('SELECT * FROM Users WHERE user_id = ?', [userId]);
    },

    async getUserByEmail(email) {
        return await query('SELECT * FROM Users WHERE email = ?', [email]);
    },

    // Boarding House operations
    async getBoardingHouses() {
        return await query(`
            SELECT bh.*, u.first_name, u.last_name, u.contact_number,
            COUNT(DISTINCT r.room_id) as room_count,
            MIN(r.monthly_rent) as min_price
            FROM BoardingHouses bh
            LEFT JOIN Users u ON bh.landlord_id = u.user_id
            LEFT JOIN Rooms r ON bh.boarding_house_id = r.boarding_house_id
            WHERE bh.status = 'active'
            GROUP BY bh.boarding_house_id
        `);
    },

    async getBoardingHouseById(id) {
        return await query('SELECT * FROM BoardingHouses WHERE boarding_house_id = ?', [id]);
    },

    async createBoardingHouse(data) {
        const sql = `INSERT INTO BoardingHouses (landlord_id, title, description, address, 
                     amenities, rules) VALUES (?, ?, ?, ?, ?, ?)`;
        return await query(sql, [
            data.landlord_id,
            data.title,
            data.description,
            data.address,
            JSON.stringify(data.amenities),
            data.rules
        ]);
    },

    // Room operations
    async getRoomsByBoardingHouse(boardingHouseId) {
        return await query(`
            SELECT r.*, ri.image_url as primary_image
            FROM Rooms r
            LEFT JOIN RoomImages ri ON r.room_id = ri.room_id AND ri.is_primary = true
            WHERE r.boarding_house_id = ?
        `, [boardingHouseId]);
    },

    async createRoom(roomData) {
        const sql = `INSERT INTO Rooms (boarding_house_id, room_number, room_type, monthly_rent,
                     capacity, floor_area, description, amenities) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        return await query(sql, [
            roomData.boarding_house_id,
            roomData.room_number,
            roomData.room_type,
            roomData.monthly_rent,
            roomData.capacity,
            roomData.floor_area,
            roomData.description,
            JSON.stringify(roomData.amenities)
        ]);
    },

    // Booking operations
    async createBooking(bookingData) {
        const sql = `INSERT INTO Bookings (room_id, student_id, move_in_date, duration_months,
                     monthly_rate, special_requests) VALUES (?, ?, ?, ?, ?, ?)`;
        return await query(sql, [
            bookingData.room_id,
            bookingData.student_id,
            bookingData.move_in_date,
            bookingData.duration_months,
            bookingData.monthly_rate,
            bookingData.special_requests
        ]);
    },

    async getBookingsByStudent(studentId) {
        return await query(`
            SELECT b.*, r.room_number, r.room_type, bh.title as boarding_house_name
            FROM Bookings b
            JOIN Rooms r ON b.room_id = r.room_id
            JOIN BoardingHouses bh ON r.boarding_house_id = bh.boarding_house_id
            WHERE b.student_id = ?
            ORDER BY b.created_at DESC
        `, [studentId]);
    },

    async getBookingsByLandlord(landlordId) {
        return await query(`
            SELECT b.*, r.room_number, u.first_name, u.last_name, u.contact_number
            FROM Bookings b
            JOIN Rooms r ON b.room_id = r.room_id
            JOIN BoardingHouses bh ON r.boarding_house_id = bh.boarding_house_id
            JOIN Users u ON b.student_id = u.user_id
            WHERE bh.landlord_id = ?
            ORDER BY b.created_at DESC
        `, [landlordId]);
    }
};

module.exports = { pool, testConnection, query, db };