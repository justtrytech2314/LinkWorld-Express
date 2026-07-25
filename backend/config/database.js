// ======================================================
// LINKWORLD EXPRESS
// MongoDB Database Connection
// ======================================================

const mongoose = require("mongoose");
const dns = require("dns");

// ======================================================
// FIX DNS RESOLUTION FOR MONGODB SRV
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

        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log("======================================================");
        console.log("✅ MongoDB Connected Successfully");
        console.log(`🗄 Database : ${connection.connection.name}`);
        console.log(`🌍 Host     : ${connection.connection.host}`);
        console.log("======================================================");

    } catch (error) {

        console.error("======================================================");
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        console.error("======================================================");

        process.exit(1);

    }

};

module.exports = connectDB;