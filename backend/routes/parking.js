const express = require("express");
const router = express.Router();

const db = require("../db");


// =====================================================
// GET PARKING RECORDS
// /api/parking?user_id=1
// =====================================================

router.get("/", (req, res) => {

    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "user_id is required"
        });
    }

    const sql = `
        SELECT *
        FROM parking_records
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) {

            console.error(
                "❌ Error fetching parking records:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch parking records"
            });
        }

        res.json({
            success: true,
            data: results
        });

    });

});


// =====================================================
// ADD PARKED VEHICLE
// POST /api/parking
// =====================================================

router.post("/", (req, res) => {

    const {
        user_id,
        receipt_id,
        vehicle_number,
        owner_name,
        vehicle_type,
        slot,
        entry_time,
        exit_time,
        duration,
        parking_fee,
        status
    } = req.body;


    // Required fields

    if (
        !user_id ||
        !receipt_id ||
        !vehicle_number ||
        !owner_name ||
        !vehicle_type ||
        !slot ||
        !entry_time
    ) {

        return res.status(400).json({
            success: false,
            message: "Required parking fields are missing"
        });

    }


    // Convert date to MySQL format

    function toMySQLDateTime(dateValue) {

        const d = new Date(dateValue);

        if (isNaN(d.getTime())) {
            throw new Error(
                "Invalid date: " + dateValue
            );
        }

        const pad = (n) =>
            String(n).padStart(2, "0");

        return (
            `${d.getFullYear()}-` +
            `${pad(d.getMonth() + 1)}-` +
            `${pad(d.getDate())} ` +
            `${pad(d.getHours())}:` +
            `${pad(d.getMinutes())}:` +
            `${pad(d.getSeconds())}`
        );

    }


    let mysqlEntryTime;

    try {

        mysqlEntryTime =
            toMySQLDateTime(entry_time);

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Invalid entry time"
        });

    }


    const sql = `
        INSERT INTO parking_records
        (
            user_id,
            receipt_id,
            vehicle_number,
            owner_name,
            vehicle_type,
            slot,
            entry_time,
            exit_time,
            duration,
            parking_fee,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [

        user_id,

        receipt_id,

        vehicle_number,

        owner_name,

        vehicle_type,

        slot,

        mysqlEntryTime,

        exit_time || null,

        duration || "",

        parking_fee || 0,

        status || "Parked"

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error saving vehicle:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Vehicle save failed",
                    error: err.message
                });

            }


            res.json({

                success: true,

                message:
                    "Vehicle saved successfully",

                id: result.insertId

            });

        }
    );

});


// =====================================================
// UPDATE / VEHICLE EXIT
// PUT /api/parking/:id
// =====================================================

router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {
        user_id,
        exit_time,
        duration,
        parking_fee,
        status
    } = req.body;


    if (!user_id) {

        return res.status(400).json({
            success: false,
            message: "user_id is required"
        });

    }


    const sql = `
        UPDATE parking_records

        SET
            exit_time = ?,
            duration = ?,
            parking_fee = ?,
            status = ?

        WHERE
            id = ?
            AND user_id = ?
    `;


    db.query(

        sql,

        [
            exit_time || null,
            duration || "",
            parking_fee || 0,
            status || "Completed",
            id,
            user_id
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "❌ Error updating parking:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Parking update failed",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Parking record not found"
                });

            }


            res.json({

                success: true,

                message:
                    "Vehicle exit updated successfully"

            });

        }

    );

});


module.exports = router;