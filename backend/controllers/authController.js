// ======================================================
// LINKWORLD EXPRESS
// ADMIN CONTROLLER
// PRODUCTION VERSION 10/10
// PART 1 OF 3
// ======================================================


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// ======================================================
// ADMIN LOGIN
// POST /api/admin/login
// ======================================================


exports.loginAdmin = async (req, res) => {


    try {


        const {

            email,

            password


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


        if (

            email.toLowerCase()

            !==

            adminEmail.toLowerCase()

        ) {


            return res.status(401).json({

                success:false,

                message:
                "Invalid email or password."

            });


        }



        // ==============================================
        // CHECK PASSWORD
        // ==============================================


        const passwordMatch =

        await bcrypt.compare(

            password,

            adminPassword

        );



        if (!passwordMatch) {


            return res.status(401).json({

                success:false,

                message:
                "Invalid email or password."

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