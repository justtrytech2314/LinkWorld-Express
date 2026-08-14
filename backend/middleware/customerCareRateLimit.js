// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - RATE LIMIT
// Keeps the AI endpoint from being abused (cost + uptime).
// Scoped only to /api/customer-care - every other route on
// the site is untouched.
// ======================================================

"use strict";

const rateLimit = require("express-rate-limit");

const customerCareRateLimit = rateLimit({

    windowMs: 5 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "You're sending messages too quickly. Please wait a moment and try again."
    },

    handler: (req, res, next, options) => {

        res.status(options.statusCode).json(options.message);

    }

});

module.exports = customerCareRateLimit;
