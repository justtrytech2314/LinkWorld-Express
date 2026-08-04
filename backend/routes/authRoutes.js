// ======================================================
// LINKWORLD EXPRESS
// AUTH ROUTES
// PRODUCTION VERSION
// ======================================================


const express = require("express");

const router = express.Router();



// ======================================================
// MIDDLEWARE
// ======================================================

const auth = require("../middleware/auth");



// ======================================================
// CONTROLLER IMPORT
// USING authController.js
// ======================================================

const {

    loginAdmin,

    getAdminProfile,

    logoutAdmin,

    checkAdmin


} = require("../controllers/authController");





// ======================================================
// PUBLIC ROUTES
// ======================================================


// ADMIN LOGIN
// POST /api/admin/login

router.post(

    "/login",

    loginAdmin

);





// ======================================================
// PROTECTED ROUTES
// ======================================================


// GET ADMIN PROFILE
// GET /api/admin/me

router.get(

    "/me",

    auth,

    getAdminProfile

);





// CHECK TOKEN
// GET /api/admin/check

router.get(

    "/check",

    auth,

    checkAdmin

);





// LOGOUT ADMIN
// POST /api/admin/logout

router.post(

    "/logout",

    auth,

    logoutAdmin

);





// ======================================================
// EXPORT
// ======================================================

module.exports = router;


// ======================================================
// END AUTH ROUTES
// ======================================================