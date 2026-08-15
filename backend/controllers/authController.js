// ======================================================
// LINKWORLD EXPRESS
// ADMIN CONTROLLER
// PRODUCTION VERSION 10/10
// PART 1 OF 3
// ======================================================


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { verifyToken } = require("../utils/totp");


// ======================================================
// Every rejected login returns this one message. Saying
// "wrong password" or "wrong code" would confirm to an
// attacker which half they already have.
// ======================================================

const REJECTION_MESSAGE = "Invalid email, password or authentication code.";


// ======================================================
// ADMIN LOGIN
// POST /api/admin/login
// ======================================================


exports.loginAdmin = async (req, res) => {


    try {


        const {

            email,

            password,

            totp


        } = req.body;



        // ==============================================
        // VALIDATION
        // ==============================================


        if (!email || !password) {


            return res.status(400).json({

                success: false,

                message:
                "Email and password are required."

            });


        }



        // ==============================================
        // ADMIN CREDENTIALS
        // ==============================================
        //
        // Replace these later with Admin collection
        // from MongoDB.
        //
        // ==============================================


        const adminEmail =
        process.env.ADMIN_EMAIL;


        const adminPassword =
        process.env.ADMIN_PASSWORD;



        if (!adminEmail || !adminPassword) {


            return res.status(500).json({

                success:false,

                message:
                "Admin credentials are not configured."

            });


        }



        // ==============================================
        // CHECK EMAIL
        // ==============================================


        const emailMatch =

            email.trim().toLowerCase()

            ===

            adminEmail.trim().toLowerCase();



        // ==============================================
        // CHECK PASSWORD
        // ==============================================
        //
        // The password is compared even when the email is
        // already wrong. Skipping it would return noticeably
        // faster for an unknown address than a known one,
        // which tells an attacker when they have guessed the
        // right email.
        // ==============================================


        const passwordMatch =

        await bcrypt.compare(

            password,

            adminPassword

        );



        // ==============================================
        // CHECK TWO-FACTOR CODE
        // ==============================================
        //
        // Enforced only once ADMIN_TOTP_SECRET is set, so
        // enrolling does not lock anyone out mid-deployment.
        // ==============================================


        const totpSecret = process.env.ADMIN_TOTP_SECRET;


        let totpMatch = true;


        if (totpSecret) {


            totpMatch = await verifyToken(

                totpSecret,

                totp

            );


        }

        else {


            console.warn(
                "⚠️  ADMIN_TOTP_SECRET is not set - admin login is running WITHOUT two-factor authentication."
            );


        }



        if (!emailMatch || !passwordMatch || !totpMatch) {


            return res.status(401).json({

                success:false,

                message: REJECTION_MESSAGE

            });


        }



                // ==============================================
        // CREATE JWT TOKEN
        // ==============================================


        if (!process.env.JWT_SECRET) {


            return res.status(500).json({

                success:false,

                message:
                "JWT secret is missing."

            });


        }



        const token = jwt.sign(

            {

                id: "linkworld-admin",

                email: adminEmail,

                role: "admin"

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "24h"

            }

        );





        // ==============================================
        // ADMIN SESSION DATA
        // ==============================================


        const admin = {


            id:
            "linkworld-admin",


            email:
            adminEmail,


            role:
            "admin",


            loginTime:
            new Date()


        };





        // ==============================================
        // SUCCESS RESPONSE
        // ==============================================


        return res.status(200).json({

            success:true,


            message:
            "Admin login successful.",


            token,


            admin


        });



    }


    catch(error)
    {


        console.error(

            "ADMIN LOGIN ERROR:",

            error

        );



        return res.status(500).json({

            success:false,

            message:
            "Server error during login."

        });


    }


};

// ======================================================
// GET CURRENT ADMIN
// GET /api/admin/me
// ======================================================


exports.getAdminProfile = async (req, res) => {


    try {


        return res.status(200).json({

            success:true,

            admin:req.user

        });


    }


    catch(error)
    {


        console.error(

            "ADMIN PROFILE ERROR:",

            error

        );


        return res.status(500).json({

            success:false,

            message:
            "Unable to get admin profile."

        });


    }


};





// ======================================================
// ADMIN LOGOUT
// POST /api/admin/logout
// ======================================================


exports.logoutAdmin = async (req, res) => {


    try {


        return res.status(200).json({

            success:true,

            message:
            "Admin logout successful."

        });


    }


    catch(error)
    {


        console.error(

            "ADMIN LOGOUT ERROR:",

            error

        );


        return res.status(500).json({

            success:false,

            message:
            "Logout failed."

        });


    }


};





// ======================================================
// VERIFY TOKEN STATUS
// GET /api/admin/check
// ======================================================


exports.checkAdmin = async (req, res) => {


    try {


        return res.status(200).json({

            success:true,

            authenticated:true,

            admin:req.user

        });


    }


    catch(error)
    {


        return res.status(401).json({

            success:false,

            authenticated:false,

            message:
            "Invalid session."

        });


    }


};




// ======================================================
// END OF LINKWORLD EXPRESS
// ADMIN CONTROLLER
// PRODUCTION VERSION 10/10
// ======================================================