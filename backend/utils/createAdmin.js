// ======================================================
// LINKWORLD EXPRESS
// CREATE DEFAULT ADMIN
// ------------------------------------------------------
// Seeds the first administrator on boot if one does not
// already exist. Credentials come from the environment -
// ADMIN_EMAIL and ADMIN_PASSWORD - and are never written
// into this file, which is public on GitHub.
//
// ADMIN_PASSWORD may be either a plain password or an
// already-bcrypted hash. Hashes are stored as-is; hashing a
// hash would silently lock the account out.
// ======================================================

const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");


// bcrypt hashes look like $2a$10$..., $2b$12$... etc.
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;


const createAdmin = async () => {

    try {

        const email = (process.env.ADMIN_EMAIL || "").trim();

        const password = process.env.ADMIN_PASSWORD || "";

        if (!email || !password) {

            console.warn(
                "⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not configured - skipping administrator seed."
            );

            return;

        }

        // Check if admin already exists

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {

            console.log("✅ Default administrator already exists.");

            return;

        }

        // Accept a pre-hashed value so the plain password never has to
        // exist anywhere, but still support a plain one for convenience.

        const hashedPassword = BCRYPT_HASH_PATTERN.test(password)

            ? password

            : await bcrypt.hash(password, 10);

        // Create Admin

        await Admin.create({

            fullName: process.env.ADMIN_NAME || "Udeh Uche",

            email,

            password: hashedPassword,

            role: "admin",

            isActive: true

        });

        console.log("========================================");
        console.log("✅ Default Administrator Created");
        console.log("Email :", email);
        console.log("========================================");

    }

    catch (error) {

        console.error("❌ Failed to create administrator");

        console.error(error.message);

    }

};

module.exports = createAdmin;
