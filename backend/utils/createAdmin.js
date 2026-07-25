// ======================================================
// LINKWORLD EXPRESS
// CREATE DEFAULT ADMIN
// ======================================================

const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");

const createAdmin = async () => {

    try {

        // Check if admin already exists

        const existingAdmin = await Admin.findOne({

            email: "udehuchekingsley80@gmail.com"

        });

        if (existingAdmin) {

            console.log("✅ Default administrator already exists.");

            return;

        }

        // Hash Password

        const hashedPassword = await bcrypt.hash(

            "linkworld2026$",

            10

        );

        // Create Admin

        await Admin.create({

            fullName: "Udeh Uche",

            email: "udehuchekingsley80@gmail.com",

            password: hashedPassword,

            role: "admin",

            isActive: true

        });

        console.log("========================================");
        console.log("✅ Default Administrator Created");
        console.log("Email : udehuchekingsley80@gmail.com");
        console.log("========================================");

    }

    catch (error) {

        console.error("❌ Failed to create administrator");

        console.error(error.message);

    }

};

module.exports = createAdmin;