// ======================================================
// LINKWORLD EXPRESS
// GENERATE TRACKING NUMBER
// PRODUCTION VERSION 10/10
// ======================================================

const crypto = require("crypto");

// ======================================================
// GENERATE TRACKING NUMBER
// FORMAT:
// LWX2026A8F4C9D2
// ======================================================

const generateTrackingNumber = () => {

    const year = new Date().getFullYear();

    const random = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `LWX${year}${random}`;

};

// ======================================================
// EXPORT
// ======================================================

module.exports = generateTrackingNumber;

// ======================================================
// END OF FILE
// ======================================================