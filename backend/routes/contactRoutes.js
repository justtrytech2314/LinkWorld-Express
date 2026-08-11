// ======================================================
// LINKWORLD EXPRESS
// CONTACT ROUTES
// ======================================================

const express = require("express");

const router = express.Router();

const {
    submitContactMessage
} = require("../controllers/contactController");


// ======================================================
// SUBMIT CONTACT MESSAGE
// PUBLIC
// POST /api/contact
// ======================================================

router.post(
    "/",
    submitContactMessage
);


module.exports = router;
