require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect((err) => {
    if (err) {
        console.error(
            "❌ MySQL connection failed:",
            err.message
        );
        return;
    }

    console.log(
        "✅ MySQL connected successfully!"
    );

    // Create the parking table on a fresh Railway database. This makes the
    // backend work even when only the `users` table has been created so far.
    db.query(`
        CREATE TABLE IF NOT EXISTS parking_records (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            receipt_id VARCHAR(100) NOT NULL,
            vehicle_number VARCHAR(30) NOT NULL,
            owner_name VARCHAR(100) NOT NULL,
            vehicle_type VARCHAR(30) NOT NULL,
            slot VARCHAR(20) NOT NULL,
            entry_time DATETIME NOT NULL,
            exit_time DATETIME NULL,
            duration VARCHAR(50) DEFAULT '',
            parking_fee DECIMAL(10, 2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'Parked',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_parking_user_id (user_id),
            INDEX idx_parking_status (status)
        )
    `, (tableError) => {
        if (tableError) {
            console.error(
                "❌ Parking table setup failed:",
                tableError.message
            );
            return;
        }

        console.log("✅ parking_records table is ready!");
    });
});

module.exports = db;
