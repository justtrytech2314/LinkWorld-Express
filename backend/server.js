// ======================================================
// LINKWORLD EXPRESS
// PRODUCTION SERVER
// ======================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ======================================================
// IMPORTS
// ======================================================

// Database
const connectDB = require("./config/database");

// Create Default Admin
const createDefaultAdmin = require("./utils/createAdmin");

// Routes
const shipmentRoutes = require("./routes/shipmentRoutes");
const authRoutes = require("./routes/authRoutes");

// ======================================================
// INITIALIZE EXPRESS
// ======================================================

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,
        company: "LinkWorld Express",
        version: "1.0.0",
        status: "Online",
        message: "Welcome to the LinkWorld Express API."

    });

});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (req, res) => {

    res.status(200).json({

        success: true,
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date()

    });

});

// ======================================================
// API ROUTES
// ======================================================

// Authentication
app.use("/api/auth", authRoutes);

// Shipments
app.use("/api/shipments", shipmentRoutes);

// ======================================================
// 404
// ======================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "Route not found."

    });

});

// ======================================================
// START APPLICATION
// ======================================================

const startServer = async () => {

    try {

        // Connect MongoDB

        await connectDB();

        // Create Default Administrator

        await createDefaultAdmin();

        // Start Express Server

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {

            console.clear();

            console.log("======================================================");
            console.log("🚚 LINKWORLD EXPRESS API");
            console.log("======================================================");
            console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
            console.log(`🚀 Status      : Running`);
            console.log(`📡 Port        : ${PORT}`);
            console.log(`👤 Admin       : udehuchekingsley80@gmail.com`);
            console.log(`🕒 Started     : ${new Date().toLocaleString()}`);
            console.log("======================================================");

        });

    } catch (error) {

        console.error("======================================================");
        console.error("❌ SERVER START FAILED");
        console.error(error);
        console.error("======================================================");

        process.exit(1);

    }

};

startServer();