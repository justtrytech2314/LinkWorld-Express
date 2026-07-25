// ======================================================
// LINKWORLD EXPRESS
// AUTH ROUTES
// ======================================================

const express = require("express");

const router = express.Router();

const { login } = require("../controllers/authController");

// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post("/login", login);

module.exports = router;