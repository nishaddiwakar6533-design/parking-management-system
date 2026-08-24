const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: [
        "https://nishaddiwakar6533-design.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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