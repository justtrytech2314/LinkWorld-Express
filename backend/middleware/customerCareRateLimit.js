// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - RATE LIMIT
// Keeps the AI endpoint from being abused (cost + uptime).
// Scoped only to /api/customer-care - every other route on
// the site is untouched.
// ======================================================

"use strict";

const rateLimit = require("express-rate-limit");


// The AI provider's free tier grants the whole project only 20 calls a
// day and 5 a minute. The previous limit here - 20 per IP per five
// minutes - was looser than the entire daily budget, so a single
// visitor holding down the quick-action buttons could exhaust the day's
// quota for every other customer inside five minutes. Both tiers below
// are per-IP and apply together.


// Burst: mirrors the provider's own per-minute ceiling, so a fast
// typist stops generating rate-limit errors for themselves.
const burstLimit = rateLimit({

    windowMs: 60 * 1000,

    max: 5,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "You're sending messages too quickly. Please wait a few seconds and try again."
    },

    handler: (req, res, next, options) => {

        res.status(options.statusCode).json(options.message);

    }

});


// Sustained: one visitor should not be able to consume the whole day's
// budget. Comfortably more than a genuine support conversation needs.
const sustainedLimit = rateLimit({

    windowMs: 60 * 60 * 1000,

    max: 12,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "You've reached the message limit for this hour. Please contact LinkWorld Express customer care directly if you still need help."
    },

    handler: (req, res, next, options) => {

        res.status(options.statusCode).json(options.message);

    }

});


// The contact card is built from a local constant and never touches
// the AI, so it costs nothing to serve. It only needs enough of a limit
// to stop outright abuse - holding it to the AI budget above would
// block a customer from reading a phone number.
const contactRateLimit = rateLimit({

    windowMs: 5 * 60 * 1000,

    max: 40,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please wait a moment and try again."
    },

    handler: (req, res, next, options) => {

        res.status(options.statusCode).json(options.message);

    }

});


module.exports = {

    chatRateLimit: [burstLimit, sustainedLimit],

    contactRateLimit

};
