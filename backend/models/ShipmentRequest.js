// ======================================================
// LINKWORLD EXPRESS
// SHIPMENT REQUEST MODEL
// Public "Ship Now" quote/pickup request (ship.html)
// ======================================================

const mongoose = require("mongoose");


const shipmentRequestSchema = new mongoose.Schema({

    requestNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    sender:{

        name:{ type:String, required:true, trim:true },
        phone:{ type:String, required:true, trim:true },
        email:{ type:String, default:"", trim:true },
        company:{ type:String, default:"", trim:true },
        address:{ type:String, required:true, trim:true }

    },

    receiver:{

        name:{ type:String, required:true, trim:true },
        phone:{ type:String, required:true, trim:true },
        email:{ type:String, default:"", trim:true },
        country:{ type:String, required:true, trim:true },
        address:{ type:String, required:true, trim:true }

    },

    shipmentType:{
        type:String,
        required:true
    },

    deliverySpeed:{
        type:String,
        default:"Standard"
    },

    packageWeight:{
        type:Number,
        default:0
    },

    packageValue:{
        type:Number,
        default:0
    },

    packageQuantity:{
        type:Number,
        default:1
    },

    pickupDate:{
        type:Date,
        default:null
    },

    shipmentDescription:{
        type:String,
        required:true,
        trim:true
    },

    fragile:{
        type:Boolean,
        default:false
    },

    insurance:{
        type:Boolean,
        default:false
    },

    signatureRequired:{
        type:Boolean,
        default:false
    },

    priorityHandling:{
        type:Boolean,
        default:false
    },

    specialInstructions:{
        type:String,
        default:"",
        trim:true
    },

    status:{
        type:String,
        enum:["New","Contacted","Converted","Closed"],
        default:"New"
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "ShipmentRequest",
    shipmentRequestSchema
);
