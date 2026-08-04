// ======================================================
// LINKWORLD EXPRESS
// SHIPMENT ROUTES
// COMPLETE VERSION
// ======================================================


const express = require("express");

const router = express.Router();



// ======================================================
// CONTROLLERS
// ======================================================


const {

    createShipment,

    getShipments,

    getShipmentById,

    trackShipment,

    getShipmentByTracking,

    updateShipment,

    updateLocation,

    deleteShipment


} = require("../controllers/shipmentController");





// ======================================================
// AUTH MIDDLEWARE
// ======================================================


const auth = require("../middleware/auth");




// ======================================================
// CREATE SHIPMENT
// ADMIN
// POST /api/shipments
// ======================================================


router.post(

    "/",

    auth,

    createShipment

);






// ======================================================
// GET ALL SHIPMENTS
// ADMIN DASHBOARD TABLE
// GET /api/shipments
// ======================================================


router.get(

    "/",

    auth,

    getShipments

);






// ======================================================
// PUBLIC TRACKING
// CUSTOMER TRACK PAGE
// IMPORTANT:
// THIS MUST COME BEFORE /:id
// ======================================================


router.get(

    "/track/:trackingNumber",

    trackShipment

);






// ======================================================
// RECEIPT LOOKUP
// receipt.html
// ======================================================


router.get(

    "/receipt/:trackingNumber",

    getShipmentByTracking

);







// ======================================================
// GET SINGLE SHIPMENT
// ADMIN VIEW BUTTON
// dashboard.js viewShipment()
// GET /api/shipments/:id
// ======================================================


router.get(

    "/:id",

    auth,

    getShipmentById

);







// ======================================================
// UPDATE FULL SHIPMENT
// EDIT BUTTON
// PUT /api/shipments/:id
// ======================================================


router.put(

    "/:id",

    auth,

    updateShipment

);







// ======================================================
// UPDATE LIVE LOCATION
// MAP LOCATION UPDATE
// PUT /api/shipments/location/:id
// ======================================================


router.put(

    "/location/:id",

    auth,

    updateLocation

);







// ======================================================
// DELETE SHIPMENT
// DELETE BUTTON
// DELETE /api/shipments/:id
// ======================================================


router.delete(

    "/:id",

    auth,

    deleteShipment

);






// ======================================================
// EXPORT
// ======================================================


module.exports = router;
