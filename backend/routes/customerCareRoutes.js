// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - ROUTES
// ======================================================

const express = require("express");

const router = express.Router();

const {
    chat,
    contactCard
} = require("../controllers/customerCareController");

const customerCareRateLimit = require("../middleware/customerCareRateLimit");


// ======================================================
// CHAT
// PUBLIC
// POST /api/customer-care/chat
// ======================================================

router.post(
    "/chat",
    customerCareRateLimit,
    chat
);


// ======================================================
// CONTACT CARD
// PUBLIC
// GET /api/customer-care/contact
// ======================================================

router.get(
    "/contact",
    customerCareRateLimit,
    contactCard
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
