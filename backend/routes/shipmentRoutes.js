// ======================================================
// LINKWORLD EXPRESS
// Shipment Routes
// ======================================================

const express = require("express");

const router = express.Router();


// ======================================================
// MIDDLEWARE
// ======================================================

const auth = require("../middleware/auth");


// ======================================================
// CONTROLLER IMPORTS
// ======================================================

const {

    createShipment,

    getShipments,

    trackShipment,

    getShipmentByTracking,

    getShipmentById,

    updateShipment,

    updateLocation,

    deleteShipment


} = require("../controllers/shipmentController");




// ======================================================
// PUBLIC ROUTES
// ======================================================


// Customer Tracking

// GET /api/shipments/track/:trackingNumber

router.get(

    "/track/:trackingNumber",

    trackShipment

);



// Receipt / Tracking lookup

// GET /api/shipments/receipt/:trackingNumber

router.get(

    "/receipt/:trackingNumber",

    getShipmentByTracking

);




// ======================================================
// ADMIN ROUTES
// ======================================================


// Get all shipments

// GET /api/shipments

router.get(

    "/",

    auth,

    getShipments

);




// Get shipment by ID

// GET /api/shipments/:id

router.get(

    "/:id",

    auth,

    getShipmentById

);




// Create shipment

// POST /api/shipments

router.post(

    "/",

    auth,

    createShipment

);




// Update shipment

// PUT /api/shipments/:id

router.put(

    "/:id",

    auth,

    updateShipment

);




// Update shipment location

// PUT /api/shipments/location/:id

router.put(

    "/location/:id",

    auth,

    updateLocation

);




// Delete shipment

// DELETE /api/shipments/:id

router.delete(

    "/:id",

    auth,

    deleteShipment

);




// ======================================================
// EXPORT
// ======================================================

module.exports = router;