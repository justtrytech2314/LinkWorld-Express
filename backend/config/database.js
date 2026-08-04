// ======================================================
// LINKWORLD EXPRESS
// DATABASE CONFIGURATION
// ======================================================

const mongoose = require("mongoose");
const dns = require("dns");

// ======================================================
// FORCE GOOGLE DNS
// ======================================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

// ======================================================
// CONNECT DATABASE
// ======================================================

const connectDB = async () => {

    try {

        if (!process.env.MONGO_URI) {

            throw new Error("MONGO_URI is missing from .env");

        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("========================================");
        console.log("✅ MongoDB Connected Successfully");
        console.log("========================================");

    } catch (error) {

        console.log("========================================");
        console.log("❌ MongoDB Connection Failed");
        console.log(error.message);
        console.log("========================================");

        process.exit(1);

    }

};

// ======================================================
// MONGOOSE EVENTS
// ======================================================

mongoose.connection.on("disconnected", () => {

    console.log("⚠️ MongoDB Disconnected");

});

mongoose.connection.on("reconnected", () => {

    console.log("🔄 MongoDB Reconnected");

});

mongoose.connection.on("error", (err) => {

    console.log("❌ MongoDB Error:", err.message);

});

// ======================================================
// EXPORT
// ======================================================

module.exports = connectDB;