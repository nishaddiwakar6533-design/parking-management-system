const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ParkEase Backend is running!"
    });
});

const parkingRoutes = require("./routes/parking");
const authRoutes = require("./routes/auth");

app.use("/api/parking", parkingRoutes);
app.use("/api/auth", authRoutes);
app.get("/api/auth/test", (req, res) => {
    res.json({
        success: true,
        message: "Auth route is working!"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ParkEase server running on port ${PORT}`);
});