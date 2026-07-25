// ======================================================
// LINKWORLD EXPRESS
// Admin Model
// ======================================================

const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "super-admin"],
        default: "admin"
    },

    isActive: {
    type: Boolean,
    default: true
},

lastLogin: {
    type: Date,
    default: null
}

}, {

    timestamps: true

});

module.exports = mongoose.model("Admin", AdminSchema);