// ======================================================
// LINKWORLD EXPRESS
// SHIPMENT REQUEST CONTROLLER
// Public "Ship Now" quote/pickup request (ship.html)
// ======================================================

const ShipmentRequest = require("../models/ShipmentRequest");


function generateRequestNumber(){

    return (
        "REQ-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 9000 + 1000)
    );

}


// ======================================================
// CREATE SHIPMENT REQUEST
// PUBLIC
// POST /api/requests
// ======================================================

exports.createShipmentRequest = async (req, res) => {

    try{

        const {

            sender,
            receiver,
            shipmentType,
            deliverySpeed,
            packageWeight,
            packageValue,
            packageQuantity,
            pickupDate,
            shipmentDescription,
            fragile,
            insurance,
            signatureRequired,
            priorityHandling,
            specialInstructions

        } = req.body;


        if(

            !sender?.name ||
            !sender?.phone ||
            !sender?.address ||
            !receiver?.name ||
            !receiver?.phone ||
            !receiver?.country ||
            !receiver?.address ||
            !shipmentType ||
            !shipmentDescription

        ){

            return res.status(400).json({

                success:false,

                message:"Please complete all required fields."

            });

        }


        const request = await ShipmentRequest.create({

            requestNumber: generateRequestNumber(),

            sender:{
                name: sender.name,
                phone: sender.phone,
                email: sender.email || "",
                company: sender.company || "",
                address: sender.address
            },

            receiver:{
                name: receiver.name,
                phone: receiver.phone,
                email: receiver.email || "",
                country: receiver.country,
                address: receiver.address
            },

            shipmentType,

            deliverySpeed: deliverySpeed || "Standard",

            packageWeight: Number(packageWeight || 0),

            packageValue: Number(packageValue || 0),

            packageQuantity: Number(packageQuantity || 1),

            pickupDate: pickupDate || null,

            shipmentDescription,

            fragile: Boolean(fragile),

            insurance: Boolean(insurance),

            signatureRequired: Boolean(signatureRequired),

            priorityHandling: Boolean(priorityHandling),

            specialInstructions: specialInstructions || ""

        });


        return res.status(201).json({

            success:true,

            message:"Shipment request submitted successfully.",

            request

        });

    }

    catch(error){

        console.error("CREATE SHIPMENT REQUEST ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
