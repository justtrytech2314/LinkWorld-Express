// ======================================================
// LINKWORLD EXPRESS
// AUTH MIDDLEWARE
// PRODUCTION VERSION 10/10
// PART 1 OF 2
// ======================================================

const jwt = require("jsonwebtoken");


// ======================================================
// VERIFY AUTH TOKEN
// ======================================================

const auth = async (req, res, next) => {

    try {

        // ==============================================
        // CHECK AUTH HEADER
        // ==============================================

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Authorization token is required."

            });

        }


        // ==============================================
        // CHECK BEARER FORMAT
        // ==============================================

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format."

            });

        }


        // ==============================================
        // EXTRACT TOKEN
        // ==============================================

        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({

                success: false,

                message: "Authentication token missing."

            });

        }


        // ==============================================
        // CHECK JWT SECRET
        // ==============================================

        if (!process.env.JWT_SECRET) {

            console.error("JWT_SECRET missing from .env");

            return res.status(500).json({

                success: false,

                message: "Server configuration error."

            });

        }


        // ==============================================
        // VERIFY TOKEN
        // ==============================================

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

                // ==============================================
        // SAVE AUTH USER
        // ==============================================

        req.user = {

            id: decoded.id || decoded._id || null,

            username: decoded.username || "",

            email: decoded.email || "",

            role: decoded.role || "admin"

        };


        // Optional access to raw token
        req.token = token;


        // ==============================================
        // NEXT MIDDLEWARE
        // ==============================================

        return next();

    }

    catch (error) {

        console.error("AUTH ERROR:", error.message);


        // ==============================================
        // TOKEN EXPIRED
        // ==============================================

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({

                success: false,

                message: "Session expired. Please login again."

            });

        }


        // ==============================================
        // INVALID TOKEN
        // ==============================================

        if (error.name === "JsonWebTokenError") {

            return res.status(401).json({

                success: false,

                message: "Invalid authentication token."

            });

        }


        // ==============================================
        // UNKNOWN ERROR
        // ==============================================

        return res.status(500).json({

            success: false,

            message: "Authentication failed."

        });

    }

};


// ======================================================
// OPTIONAL ROLE MIDDLEWARE
// ======================================================

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "Access denied."

            });

        }

        next();

    };

};


// ======================================================
// EXPORTS
// ======================================================

module.exports = auth;

module.exports.authorize = authorize;


// ======================================================
// END OF FILE
// LINKWORLD EXPRESS
// AUTH MIDDLEWARE
// PRODUCTION READY
// ======================================================