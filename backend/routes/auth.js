const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../db");


// ===============================
// CREATE USER / REGISTER
// ===============================
router.post("/register", async (req, res) => {

    const { name, username, email, password } = req.body;

    // Required fields
    if (!name || !username || !password) {

        return res.status(400).json({
            success: false,
            message:
                "Name, username and password are required"
        });

    }

    try {

        // ===============================
        // CHECK USERNAME
        // ===============================

        const checkSql = `
            SELECT id
            FROM users
            WHERE username = ?
            LIMIT 1
        `;

        db.query(
            checkSql,
            [username],
            async (err, results) => {

                if (err) {

                    console.error(
                        "Username check error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });

                }


                // Username already exists
                if (results.length > 0) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Username already exists"
                    });

                }


                // ===============================
                // HASH PASSWORD
                // ===============================

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // ===============================
                // INSERT USER
                // ===============================

                const sql = `
                    INSERT INTO users
                    (name, username, email, password)
                    VALUES (?, ?, ?, ?)
                `;


                db.query(
                    sql,
                    [
                        name,
                        username,
                        email || null,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(
                                "Register error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Registration failed"
                            });

                        }


                        res.json({
                            success: true,
                            message:
                                "User registered successfully"
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "Register server error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});


// ===============================
// LOGIN WITH USERNAME
// ===============================
router.post("/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    // Required fields
    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message:
                "Username and password are required"
        });

    }


    // ===============================
    // FIND USER
    // ===============================

    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
    `;


    db.query(
        sql,
        [username],
        async (err, results) => {

            // Database error
            if (err) {

                console.error(
                    "Login database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });

            }


            // User not found
            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password"
                });

            }


            const user = results[0];


            // ===============================
            // CHECK PASSWORD
            // ===============================

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password"
                });

            }


            // ===============================
            // LOGIN SUCCESS
            // ===============================

            res.json({

                success: true,

                message:
                    "Login successful",

                user: {

                    id: user.id,

                    name: user.name,

                    username: user.username,

                    email: user.email,

                    role: user.role

                }

            });

        }
    );

});


// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;