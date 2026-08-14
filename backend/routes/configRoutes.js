// ======================================================
// LINKWORLD EXPRESS
// PUBLIC FRONTEND CONFIG
// ------------------------------------------------------
// Exposes ONLY values that are safe to hand to the browser.
// This is not a secret endpoint - the Mapillary client token
// used for Street View imagery is meant to be visible in
// client code (Mapillary's own client-side integration model
// works this way). It's fetched from here instead of being
// hardcoded into source control, so it can be rotated without
// a frontend redeploy.
// ======================================================

const express = require("express");

const router = express.Router();


// ======================================================
// GET /api/config/maps-key
// ======================================================

router.get("/maps-key", (req, res) => {

    res.status(200).json({

        success: true,

        mapillaryAccessToken: process.env.MAPILLARY_ACCESS_TOKEN || ""

    });

});


module.exports = router;
