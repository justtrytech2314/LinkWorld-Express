// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - ROUTES
// ======================================================

const express = require("express");

const router = express.Router();

const {
    chat,
    contactCard,
    status
} = require("../controllers/customerCareController");

const {
    chatRateLimit,
    contactRateLimit
} = require("../middleware/customerCareRateLimit");


// ======================================================
// CHAT
// PUBLIC
// POST /api/customer-care/chat
// ======================================================

router.post(
    "/chat",
    chatRateLimit,
    chat
);


// ======================================================
// CONTACT CARD
// PUBLIC
// GET /api/customer-care/contact
// ======================================================

router.get(
    "/contact",
    contactRateLimit,
    contactCard
);




// ======================================================
// AI STATUS
// PUBLIC (no secrets - model name and health only)
// GET /api/customer-care/status
// ======================================================

router.get(
    "/status",
    contactRateLimit,
    status
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
