// ======================================================
// LINKWORLD EXPRESS
// AUTH CONTROLLER
// ======================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

// ======================================================
// ADMIN LOGIN
// ======================================================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and password are required."

            });

        }

        // Find admin

        const admin = await Admin.findOne({

            email: email.toLowerCase()

        });

        if (!admin) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Check if account is active

        if (!admin.isActive) {

            return res.status(403).json({

                success: false,
                message: "Administrator account is disabled."

            });

        }

        // Compare password

        const isMatch = await bcrypt.compare(

            password,
            admin.password

        );

        if (!isMatch) {

            return res.status(401).json({

                success: false,
                message: "Invalid email or password."

            });

        }

        // Update last login

        admin.lastLogin = new Date();

        await admin.save();

        // Generate JWT

        const token = jwt.sign(

            {

                id: admin._id,
                email: admin.email,
                role: admin.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            admin: {

                id: admin._id,

                fullName: admin.fullName,

                email: admin.email,

                role: admin.role

            }

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal server error."

        });

    }

};