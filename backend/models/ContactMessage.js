// ======================================================
// LINKWORLD EXPRESS
// CONTACT MESSAGE MODEL
// Public contact form submission (contact.html)
// ======================================================

const mongoose = require("mongoose");


const contactMessageSchema = new mongoose.Schema({

    referenceNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    name:{
        type:String,
        required:true,
        trim:true
    },

    email:{
        type:String,
        required:true,
        trim:true
    },

    phone:{
        type:String,
        default:"",
        trim:true
    },

    subject:{
        type:String,
        required:true,
        trim:true
    },

    message:{
        type:String,
        required:true,
        trim:true
    },

    status:{
        type:String,
        enum:["New","Read","Replied"],
        default:"New"
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "ContactMessage",
    contactMessageSchema
);
