// ======================================================
// LINKWORLD EXPRESS
// PREMIUM SHIPMENT CONTROLLER
// PART 1/5
// ======================================================

const Shipment = require("../models/Shipment");
const generateTrackingNumber = require("../utils/generateTrackingNumber");



// ======================================================
// CALCULATE PROGRESS
// ======================================================

function calculateProgress(status){

    switch(status){

        case "Shipment Created":
            return 5;

        case "Processing":
            return 30;

        case "Picked Up":
            return 45;

        case "In Transit":
            return 60;

        case "At Facility":
            return 75;

        case "Out For Delivery":
            return 90;

        case "Delivered":
            return 100;

        case "Cancelled":
            return 0;

        default:
            return 5;

    }

}



// ======================================================
// GENERATE RECEIPT NUMBER
// ======================================================

function generateReceiptNumber(){

    return (
        "RCPT-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 9000 + 1000)
    );

}



// ======================================================
// CREATE SHIPMENT
// POST /api/shipments
// ======================================================

exports.createShipment = async (req, res) => {

    try{

        const{

            trackingNumber,

            sender,

            receiver,

            shipmentDescription,

            packageType,

            packageWeight,

            packageValue,

            origin,

            destination,

            currentLocation,

            currentLatitude,

            currentLongitude,

            destinationLatitude,

            destinationLongitude,

            status,

            paymentStatus,

            expectedDelivery

        } = req.body;



        // ==========================================
        // VALIDATION
        // ==========================================

        if(

            !sender?.name ||

            !sender?.phone ||

            !receiver?.name ||

            !receiver?.phone ||

            !receiver?.address ||

            !shipmentDescription ||

            !origin ||

            !destination

        ){

            return res.status(400).json({

                success:false,

                message:"Please complete all required shipment fields."

            });

        }



        // ==========================================
        // TRACKING NUMBER
        // ==========================================

        let finalTrackingNumber = trackingNumber;

        if(!finalTrackingNumber){

            let exists = true;

            while(exists){

                finalTrackingNumber = generateTrackingNumber();

                const check = await Shipment.findOne({

                    trackingNumber: finalTrackingNumber

                });

                exists = Boolean(check);

            }

        }



        const finalStatus = status || "Shipment Created";



        // ==========================================
        // CREATE SHIPMENT
        // ==========================================

        const shipment = await Shipment.create({

            receiptNumber: generateReceiptNumber(),

            trackingNumber: finalTrackingNumber,

            sender:{
                name: sender.name,
                phone: sender.phone,
                email: sender.email || "",
                address: sender.address || ""
            },

            receiver:{
                name: receiver.name,
                phone: receiver.phone,
                email: receiver.email || "",
                address: receiver.address
            },

            shipmentDescription,

            shipmentType: packageType || "Package",

            packageWeight: Number(packageWeight || 0),

            packageValue: Number(packageValue || 0),

            origin,

            currentLocation: currentLocation || origin,

            destination,

            currentLatitude: Number(currentLatitude || 0),

            currentLongitude: Number(currentLongitude || 0),

            destinationLatitude: Number(destinationLatitude || 0),

            destinationLongitude: Number(destinationLongitude || 0),

            status: finalStatus,

            progress: calculateProgress(finalStatus),

            paymentStatus: paymentStatus || "Pending",

            expectedDelivery: expectedDelivery || null,

            history:[
                {
                    location: currentLocation || origin,
                    status: finalStatus,
                    latitude: Number(currentLatitude || 0),
                    longitude: Number(currentLongitude || 0),
                    timestamp: new Date()
                }
            ]

        });



        return res.status(201).json({

            success:true,

            message:"Shipment created successfully.",

            shipment

        });

    }

    catch(error){

        console.error("CREATE SHIPMENT ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// ======================================================
// END PART 1/5
// ======================================================
// ======================================================
// GET ALL SHIPMENTS
// ADMIN DASHBOARD
// GET /api/shipments
// ======================================================

exports.getShipments = async (req, res) => {

    try{

        const shipments = await Shipment.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            total: shipments.length,

            shipments

        });

    }

    catch(error){

        console.error("GET SHIPMENTS ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




// ======================================================
// GET SHIPMENT BY ID
// ADMIN VIEW
// GET /api/shipments/:id
// ======================================================

exports.getShipmentById = async (req, res) => {

    try{

        const shipment = await Shipment.findById(req.params.id);

        if(!shipment){

            return res.status(404).json({

                success:false,

                message:"Shipment not found."

            });

        }

        return res.status(200).json({

            success:true,

            shipment

        });

    }

    catch(error){

        console.error("GET SHIPMENT BY ID ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




// ======================================================
// PUBLIC TRACK SHIPMENT
// GET /api/shipments/track/:trackingNumber
// ======================================================

exports.trackShipment = async (req, res) => {

    try{

        const trackingNumber = req.params.trackingNumber
            .trim()
            .toUpperCase();

        const shipment = await Shipment.findOne({

            trackingNumber

        });

        if(!shipment){

            return res.status(404).json({

                success:false,

                message:"Tracking number not found."

            });

        }

        return res.status(200).json({

            success:true,

            shipment

        });

    }

    catch(error){

        console.error("TRACK SHIPMENT ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




// ======================================================
// RECEIPT LOOKUP
// GET /api/shipments/receipt/:trackingNumber
// ======================================================

exports.getShipmentByTracking = async (req, res) => {

    try{

        const trackingNumber = req.params.trackingNumber
            .trim()
            .toUpperCase();

        const shipment = await Shipment.findOne({

            trackingNumber

        });

        if(!shipment){

            return res.status(404).json({

                success:false,

                message:"Shipment not found."

            });

        }

        // Sort history from newest to oldest
        shipment.history.sort(

            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)

        );

        return res.status(200).json({

            success:true,

            shipment

        });

    }

    catch(error){

        console.error("RECEIPT LOOKUP ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// ======================================================
// END PART 2/5
// ======================================================
// ======================================================
// UPDATE FULL SHIPMENT
// PUT /api/shipments/:id
// ======================================================

exports.updateShipment = async (req, res) => {

    try{

        const shipment = await Shipment.findById(req.params.id);

        if(!shipment){

            return res.status(404).json({

                success:false,

                message:"Shipment not found."

            });

        }



        // ==========================================
        // UPDATE FIELDS
        // ==========================================

        Object.assign(shipment, req.body);



        // ==========================================
        // UPDATE PROGRESS
        // ==========================================

        if(req.body.status){

            shipment.progress = calculateProgress(req.body.status);

        }



        // ==========================================
        // SAVE HISTORY WHEN STATUS OR LOCATION CHANGES
        // ==========================================

        if(

            req.body.status ||

            req.body.currentLocation ||

            req.body.currentLatitude ||

            req.body.currentLongitude

        ){

            shipment.history.push({

                location:
                    shipment.currentLocation,

                status:
                    shipment.status,

                latitude:
                    Number(shipment.currentLatitude || 0),

                longitude:
                    Number(shipment.currentLongitude || 0),

                timestamp:new Date()

            });

        }



        await shipment.save();



        return res.status(200).json({

            success:true,

            message:"Shipment updated successfully.",

            shipment

        });

    }

    catch(error){

        console.error("UPDATE SHIPMENT ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};




// ======================================================
// UPDATE LIVE LOCATION
// PUT /api/shipments/location/:id
// ======================================================

exports.updateLocation = async (req, res) => {

    try{

        const shipment = await Shipment.findById(req.params.id);

        if(!shipment){

            return res.status(404).json({

                success:false,

                message:"Shipment not found."

            });

        }



        const{

            currentLocation,

            currentLatitude,

            currentLongitude,

            status

        } = req.body;



        let changed = false;



        // ==========================================
        // LOCATION
        // ==========================================

        if(currentLocation !== undefined){

            shipment.currentLocation = currentLocation;

            changed = true;

        }



        if(currentLatitude !== undefined){

            shipment.currentLatitude = Number(currentLatitude);

            changed = true;

        }



        if(currentLongitude !== undefined){

            shipment.currentLongitude = Number(currentLongitude);

            changed = true;

        }



        // ==========================================
        // STATUS
        // ==========================================

        if(status){

            shipment.status = status;

            shipment.progress = calculateProgress(status);

            changed = true;

        }



        // ==========================================
        // SAVE HISTORY
        // ==========================================

        if(changed){

            shipment.history.push({

                location: shipment.currentLocation,

                status: shipment.status,

                latitude: shipment.currentLatitude,

                longitude: shipment.currentLongitude,

                timestamp:new Date()

            });

        }



        await shipment.save();



        return res.status(200).json({

            success:true,

            message:"Shipment location updated successfully.",

            shipment

        });

    }

    catch(error){

        console.error("UPDATE LOCATION ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// ======================================================
// END PART 3/5
// ======================================================
