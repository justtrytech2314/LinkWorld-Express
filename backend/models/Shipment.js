// ======================================================
// LINKWORLD EXPRESS
// PREMIUM SHIPMENT MODEL
// PART 1/2
// ======================================================


const mongoose = require("mongoose");





// ======================================================
// HISTORY SCHEMA
// ======================================================


const historySchema = new mongoose.Schema({

    location:{
        type:String,
        default:""
    },


    status:{
        type:String,
        default:"Shipment Created"
    },


    latitude:{
        type:Number,
        default:0
    },


    longitude:{
        type:Number,
        default:0
    },


    timestamp:{
        type:Date,
        default:Date.now
    }


},
{
    _id:false
});







// ======================================================
// PERSON SCHEMA
// ======================================================


const personSchema = new mongoose.Schema({


    name:{
        type:String,
        required:true,
        trim:true
    },


    phone:{
        type:String,
        required:true,
        trim:true
    },


    email:{
        type:String,
        default:"",
        trim:true
    },


    address:{
        type:String,
        default:"",
        trim:true
    }



},
{
    _id:false
});







// ======================================================
// SHIPMENT SCHEMA
// ======================================================


const shipmentSchema = new mongoose.Schema({



// ======================================================
// TRACKING
// ======================================================


trackingNumber:{


    type:String,


    required:true,


    unique:true,


    uppercase:true,


    trim:true


},








// ======================================================
// SENDER
// ======================================================


sender:{


    type:personSchema,


    required:true


},








// ======================================================
// RECEIVER
// ======================================================


receiver:{


    type:personSchema,


    required:true


},







// ======================================================
// PACKAGE INFORMATION
// ======================================================


shipmentDescription:{


    type:String,


    required:true,


    trim:true


},



shipmentType:{


    type:String,


    default:"Package"


},



packageWeight:{


    type:Number,


    default:0


},



packageValue:{


    type:Number,


    default:0


},







// ======================================================
// ROUTE
// ======================================================


origin:{


    type:String,


    required:true,


    trim:true


},



currentLocation:{


    type:String,


    default:""


},



destination:{


    type:String,


    required:true,


    trim:true


},







// ======================================================
// GPS
// ======================================================


currentLatitude:{


    type:Number,


    default:0


},



currentLongitude:{


    type:Number,


    default:0


},



destinationLatitude:{


    type:Number,


    default:0


},



destinationLongitude:{


    type:Number,


    default:0


},







// ======================================================
// STATUS
// ======================================================


status:{


    type:String,


    enum:[


        "Shipment Created",


        "Processing",


        "Picked Up",


        "In Transit",


        "At Facility",


        "Out For Delivery",


        "Delivered",


        "Cancelled"


    ],


    default:"Shipment Created"


},



progress:{


    type:Number,


    default:5


},







// ======================================================
// PAYMENT
// ======================================================


paymentStatus:{


    type:String,


    enum:[


        "Pending",


        "Paid",


        "Failed"


    ],


    default:"Pending"


},







// ======================================================
// DELIVERY
// ======================================================


expectedDelivery:{


    type:Date,


    default:null


},







// ======================================================
// TRACKING HISTORY
// ======================================================


history:[historySchema]



},
{

timestamps:true


});




// ======================================================
// END PART 1/2
// ======================================================



// ======================================================
// INDEXES
// ======================================================


// IMPORTANT:
// Do NOT add another trackingNumber index here
// because unique:true already creates it.
//
// This prevents:
// Duplicate schema index warning
//


// shipmentSchema.index({
//     trackingNumber:1
// });








// ======================================================
// EXPORT MODEL
// ======================================================


// THIS IS THE IMPORTANT FIX
// Controller uses:
// const Shipment = require("../models/Shipment");
//
// So we export the actual mongoose model.


module.exports = mongoose.model(

    "Shipment",

    shipmentSchema

);




// ======================================================
// END OF LINKWORLD EXPRESS
// PREMIUM SHIPMENT MODEL
// ======================================================
