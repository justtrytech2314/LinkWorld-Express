// ======================================================
// LINKWORLD EXPRESS
// Shipment Model
// ======================================================

const mongoose = require("mongoose");


// ======================================================
// SHIPMENT SCHEMA
// ======================================================

const shipmentSchema = new mongoose.Schema({

    
    // ==================================================
    // TRACKING INFORMATION
    // ==================================================

    trackingNumber: {

        type: String,

        required: true,

        unique: true,

        uppercase: true,

        trim: true

    },


    // ==================================================
    // SENDER INFORMATION
    // ==================================================

    sender: {

        type: String,

        required: true,

        trim: true

    },


    senderPhone: {

        type: String,

        default: ""

    },


    senderEmail: {

        type: String,

        default: ""

    },


    // ==================================================
    // RECEIVER INFORMATION
    // ==================================================

    receiver: {

        type: String,

        required: true,

        trim: true

    },


    receiverPhone: {

        type: String,

        default: ""

    },


    receiverEmail: {

        type: String,

        default: ""

    },


    receiverAddress: {

        type: String,

        default: ""

    },


    // ==================================================
    // SHIPMENT INFORMATION
    // ==================================================

    shipment: {

        type: String,

        default: ""

    },


    origin: {

        type: String,

        required: true,

        trim: true

    },


    currentLocation: {

        type: String,

        default: ""

    },


    destination: {

        type: String,

        required: true,

        trim: true

    },


    // ==================================================
    // DELIVERY STATUS
    // ==================================================

    status: {

        type: String,

        enum:[

            "Shipment Created",

            "Picked Up",

            "Processing",

            "In Transit",

            "Customs Clearance",

            "Arrived at Destination",

            "Out for Delivery",

            "Delivered",

            "On Hold",

            "Cancelled"

        ],

        default:"Shipment Created"

    },


    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    paymentStatus: {

        type:String,

        enum:[

            "Pending",

            "Paid",

            "Partial",

            "Refunded"

        ],

        default:"Pending"

    },


    // ==================================================
    // EXPECTED DELIVERY
    // ==================================================

    expectedDelivery: {

        type:Date

    },
        // ==================================================
    // CURRENT GPS LOCATION
    // ==================================================

    currentLatitude: {

        type: Number,

        default: 0

    },


    currentLongitude: {

        type: Number,

        default: 0

    },


    // ==================================================
    // DESTINATION GPS LOCATION
    // ==================================================

    destinationLatitude: {

        type: Number,

        default: 0

    },


    destinationLongitude: {

        type: Number,

        default: 0

    },


    // ==================================================
    // DELIVERY PROGRESS
    // 0 - 100%
    // ==================================================

    progress: {

        type: Number,

        default: 0,

        min: 0,

        max: 100

    },


    // ==================================================
    // TRACKING HISTORY
    // ==================================================

    history: [

        {

            location: {

                type: String,

                default: ""

            },


            status: {

                type: String,

                default: ""

            },


            latitude: {

                type: Number,

                default: 0

            },


            longitude: {

                type: Number,

                default: 0

            },


            date: {

                type: Date,

                default: Date.now

            }

        }

    ],



    // ==================================================
    // LIVE ROUTE TRACKING
    // Used for moving map animation
    // ==================================================

    route: [

        {

            location: {

                type: String,

                default: ""

            },


            latitude: {

                type: Number,

                default: 0

            },


            longitude: {

                type: Number,

                default: 0

            },


            status: {

                type: String,

                default: ""

            },


            time: {

                type: Date,

                default: Date.now

            }

        }

    ]

},

{

    // Automatically creates:
    // createdAt
    // updatedAt

    timestamps: true

});



// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = mongoose.model(

    "Shipment",

    shipmentSchema

);