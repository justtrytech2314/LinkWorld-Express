// ======================================================
// LINKWORLD EXPRESS
// SHIPMENT REQUEST ROUTES
// ======================================================

const express = require("express");

const router = express.Router();

const {
    createShipmentRequest
} = require("../controllers/requestController");


// ======================================================
// CREATE SHIPMENT REQUEST
// PUBLIC
// POST /api/requests
// ======================================================

router.post(
    "/",
    createShipmentRequest
);


module.exports = router;
