// ======================================================
// LINKWORLD EXPRESS
// Shipment Controller
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

        case "Picked Up":
            return 15;

        case "Processing":
            return 25;

        case "In Transit":
            return 50;

        case "Customs Clearance":
            return 65;

        case "Arrived at Destination":
            return 80;

        case "Out for Delivery":
            return 95;

        case "Delivered":
            return 100;

        case "On Hold":
            return 40;

        case "Cancelled":
            return 0;

        default:
            return 0;

    }

}



// ======================================================
// CREATE SHIPMENT
// ======================================================

exports.createShipment = async (req,res)=>{

try{


const {


sender,

senderPhone,

senderEmail,


receiver,

receiverPhone,

receiverEmail,

receiverAddress,


shipment,


origin,

currentLocation,

destination,


currentLatitude,

currentLongitude,


destinationLatitude,

destinationLongitude,


status,

paymentStatus,


expectedDelivery


}=req.body;



if(

!sender ||

!receiver ||

!origin ||

!destination

){

return res.status(400).json({

success:false,

message:"Please fill all required fields."

});

}



// Generate tracking number

let trackingNumber;

let exists=true;


while(exists){


trackingNumber=

generateTrackingNumber();


exists=

await Shipment.findOne({

trackingNumber

});


}




const shipmentStatus=

status ||

"Shipment Created";



const progress=

calculateProgress(

shipmentStatus

);




// Create shipment

const newShipment=

await Shipment.create({


trackingNumber,


sender,

senderPhone,

senderEmail,


receiver,

receiverPhone,

receiverEmail,

receiverAddress,


shipment,


origin,


currentLocation,


destination,



currentLatitude,

currentLongitude,


destinationLatitude,

destinationLongitude,



status:shipmentStatus,


paymentStatus:

paymentStatus ||

"Pending",



expectedDelivery,



progress,



// Tracking history

history:[

{

location:

currentLocation || origin,


status:

shipmentStatus,


latitude:

currentLatitude || 0,


longitude:

currentLongitude || 0

}

],



// Live route

route:[

{

location:

currentLocation || origin,


latitude:

currentLatitude || 0,


longitude:

currentLongitude || 0,


status:

shipmentStatus

}

]


});



res.status(201).json({

success:true,

message:"Shipment created successfully.",

trackingNumber:

newShipment.trackingNumber,

data:newShipment

});



}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
// ======================================================
// GET ALL SHIPMENTS
// ADMIN
// ======================================================

exports.getShipments = async (req,res)=>{

try{


const shipments = await Shipment.find()

.sort({

createdAt:-1

});



res.status(200).json({

success:true,

total:shipments.length,

data:shipments

});



}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};



// ======================================================
// TRACK SHIPMENT
// PUBLIC TRACKING
// ======================================================

exports.trackShipment = async (req,res)=>{

try{


const trackingNumber =

req.params.trackingNumber

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



res.status(200).json({

success:true,

data:shipment

});



}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};



// ======================================================
// GET SHIPMENT BY TRACKING NUMBER
// RECEIPT / TRACKING PAGE
// ======================================================

exports.getShipmentByTracking = async (req,res)=>{

try{


const shipment = await Shipment.findOne({

trackingNumber:

req.params.trackingNumber

.trim()

.toUpperCase()

});



if(!shipment){


return res.status(404).json({

success:false,

message:"Shipment not found."

});


}



res.status(200).json({

success:true,

shipment

});



}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};



// ======================================================
// GET SHIPMENT BY ID
// ADMIN
// ======================================================

exports.getShipmentById = async(req,res)=>{

try{


const shipment = await Shipment.findById(

req.params.id

);



if(!shipment){


return res.status(404).json({

success:false,

message:"Shipment not found."

});


}



res.status(200).json({

success:true,

data:shipment

});


}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
// ======================================================
// UPDATE SHIPMENT
// ADMIN
// ======================================================

exports.updateShipment = async (req,res)=>{

try{


const shipment = await Shipment.findById(

req.params.id

);



if(!shipment){


return res.status(404).json({

success:false,

message:"Shipment not found."

});


}



// Save old values before update

const oldLocation = shipment.currentLocation;

const oldStatus = shipment.status;



// Update fields

Object.assign(

shipment,

req.body

);



// Recalculate progress

shipment.progress =

calculateProgress(

shipment.status

);



// Check if location or status changed

const locationChanged =

req.body.currentLocation &&

req.body.currentLocation !== oldLocation;



const statusChanged =

req.body.status &&

req.body.status !== oldStatus;



if(locationChanged || statusChanged){



// Add tracking history

shipment.history.push({

location:

shipment.currentLocation,


status:

shipment.status,


latitude:

shipment.currentLatitude || 0,


longitude:

shipment.currentLongitude || 0,


date:

new Date()

});




// Add live route point

shipment.route.push({

location:

shipment.currentLocation,


latitude:

shipment.currentLatitude || 0,


longitude:

shipment.currentLongitude || 0,


status:

shipment.status,


time:

new Date()

});


}



await shipment.save();



res.status(200).json({

success:true,

message:"Shipment updated successfully.",

data:shipment

});



}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};




// ======================================================
// UPDATE LOCATION ONLY
// ======================================================

exports.updateLocation = async(req,res)=>{

try{


const shipment = await Shipment.findById(

req.params.id

);



if(!shipment){


return res.status(404).json({

success:false,

message:"Shipment not found."

});


}



const {

currentLocation,

currentLatitude,

currentLongitude,

status

}=req.body;



shipment.currentLocation =

currentLocation ||

shipment.currentLocation;



shipment.currentLatitude =

currentLatitude ||

shipment.currentLatitude;



shipment.currentLongitude =

currentLongitude ||

shipment.currentLongitude;



if(status){

shipment.status=status;

}



shipment.progress =

calculateProgress(

shipment.status

);




// Add history

shipment.history.push({

location:

shipment.currentLocation,


status:

shipment.status,


latitude:

shipment.currentLatitude,


longitude:

shipment.currentLongitude

});




// Add route

shipment.route.push({

location:

shipment.currentLocation,


latitude:

shipment.currentLatitude,


longitude:

shipment.currentLongitude,


status:

shipment.status

});



await shipment.save();



res.status(200).json({

success:true,

message:"Location updated successfully.",

data:shipment

});


}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};





// ======================================================
// DELETE SHIPMENT
// ======================================================

exports.deleteShipment = async(req,res)=>{

try{


const shipment =

await Shipment.findByIdAndDelete(

req.params.id

);



if(!shipment){


return res.status(404).json({

success:false,

message:"Shipment not found."

});


}



res.status(200).json({

success:true,

message:"Shipment deleted successfully."

});


}

catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
