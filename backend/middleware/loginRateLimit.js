// ======================================================
// LINKWORLD EXPRESS
// ADMIN LOGIN RATE LIMIT
// ------------------------------------------------------
// The login endpoint had no limit at all, so an attacker
// could try passwords as fast as the network allowed.
//
// This matters more, not less, once two-factor is on: a
// TOTP code is only six digits, so a million guesses breaks
// it. Unthrottled that is hours; at ten attempts an hour it
// is longer than the 30-second code stays valid, which is
// what actually makes the second factor worth having.
// ======================================================

"use strict";

const rateLimit = require("express-rate-limit");


const loginRateLimit = rateLimit({

    windowMs: 60 * 60 * 1000,

    max: 10,

    // Successful logins should not count towards the limit -
    // an admin working normally must never lock themselves out.
    skipSuccessfulRequests: true,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many failed login attempts. Please try again later."
    },

    handler: (req, res, next, options) => {

        console.warn(
            `⚠️  Admin login rate limit hit from ${req.ip}`
        );

        res.status(options.statusCode).json(options.message);

    }

});


module.exports = loginRateLimit;
