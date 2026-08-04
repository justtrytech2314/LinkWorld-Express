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
// CREATE SHIPMENT
// POST /api/shipments
// ======================================================


exports.createShipment = async(req,res)=>{


try{


const {


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



}=req.body;








// ================================
// VALIDATION
// ================================


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


message:

"Please complete all required shipment fields."


});


}









// ================================
// CREATE TRACKING NUMBER
// ================================


let finalTrackingNumber = trackingNumber;



if(!finalTrackingNumber){


let exists = true;



while(exists){



finalTrackingNumber =

generateTrackingNumber();



const check = await Shipment.findOne({

trackingNumber:finalTrackingNumber

});



exists = Boolean(check);



}


}








const finalStatus =

status || "Shipment Created";









// ================================
// SAVE SHIPMENT
// ================================


const shipment = await Shipment.create({




trackingNumber:

finalTrackingNumber,





sender:{


name:sender.name,


phone:sender.phone,


email:sender.email || "",


address:sender.address || ""


},






receiver:{


name:receiver.name,


phone:receiver.phone,


email:receiver.email || "",


address:receiver.address


},






shipmentDescription,





shipmentType:

packageType || "Package",






packageWeight:

Number(packageWeight || 0),





packageValue:

Number(packageValue || 0),







origin,



currentLocation:

currentLocation || origin,




destination,









currentLatitude:

Number(currentLatitude || 0),




currentLongitude:

Number(currentLongitude || 0),




destinationLatitude:

Number(destinationLatitude || 0),




destinationLongitude:

Number(destinationLongitude || 0),







status:finalStatus,




progress:

calculateProgress(finalStatus),






paymentStatus:

paymentStatus || "Pending",





expectedDelivery:

expectedDelivery || null,









history:[{


location:

currentLocation || origin,


status:finalStatus,


latitude:

Number(currentLatitude || 0),



longitude:

Number(currentLongitude || 0),



timestamp:new Date()


}]




});









return res.status(201).json({


success:true,


message:

"Shipment created successfully.",


shipment


});




}

catch(error){



console.error(

"CREATE SHIPMENT ERROR:",

error

);



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


exports.getShipments = async(req,res)=>{


try{


const shipments = await Shipment.find()

.sort({

createdAt:-1

});




return res.status(200).json({


success:true,


total:shipments.length,


shipments


});



}

catch(error){



console.error(

"GET SHIPMENTS ERROR:",

error

);



return res.status(500).json({


success:false,


message:error.message


});



}


};









// ======================================================
// GET SHIPMENT BY ID
// ADMIN VIEW BUTTON
// GET /api/shipments/:id
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







return res.status(200).json({


success:true,


shipment


});




}

catch(error){



console.error(

"GET SHIPMENT BY ID ERROR:",

error

);



return res.status(500).json({


success:false,


message:error.message


});



}


};









// ======================================================
// PUBLIC TRACK SHIPMENT
// CUSTOMER TRACKING
// GET /api/shipments/track/:trackingNumber
// ======================================================


exports.trackShipment = async(req,res)=>{


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







return res.status(200).json({


success:true,


shipment


});



}

catch(error){



console.error(

"TRACK SHIPMENT ERROR:",

error

);



return res.status(500).json({


success:false,


message:error.message


});



}


};









// ======================================================
// RECEIPT LOOKUP
// CUSTOMER RECEIPT PAGE
// GET /api/shipments/receipt/:trackingNumber
// ======================================================


exports.getShipmentByTracking = async(req,res)=>{


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


message:"Shipment not found."


});


}







return res.status(200).json({


success:true,


shipment


});



}

catch(error){



console.error(

"RECEIPT LOOKUP ERROR:",

error

);



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


exports.updateShipment = async(req,res)=>{


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








const updatedShipment = await Shipment.findByIdAndUpdate(


req.params.id,


req.body,


{


new:true,


runValidators:true


}


);









return res.status(200).json({


success:true,


message:

"Shipment updated successfully.",


shipment:updatedShipment



});



}

catch(error){



console.error(

"UPDATE SHIPMENT ERROR:",

error

);



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









let changed = false;








// ================================
// UPDATE LOCATION
// ================================


if(currentLocation !== undefined){


shipment.currentLocation = currentLocation;


changed = true;


}







if(currentLatitude !== undefined){


shipment.currentLatitude =

Number(currentLatitude);


changed = true;


}







if(currentLongitude !== undefined){


shipment.currentLongitude =

Number(currentLongitude);


changed = true;


}









// ================================
// UPDATE STATUS
// ================================


if(status){


shipment.status = status;


shipment.progress = calculateProgress(status);


changed = true;


}









// ================================
// SAVE HISTORY
// ================================


if(changed){


shipment.history.push({



location:


shipment.currentLocation || "Updated Location",




status:


shipment.status,




latitude:


shipment.currentLatitude || 0,




longitude:


shipment.currentLongitude || 0,




timestamp:new Date()



});


}









await shipment.save();









return res.status(200).json({


success:true,


message:

"Shipment location updated successfully.",



shipment



});





}

catch(error){



console.error(

"UPDATE LOCATION ERROR:",

error

);



return res.status(500).json({


success:false,


message:error.message


});



}


};



// ======================================================
// END PART 3/5
// ======================================================
// ======================================================
// DELETE SHIPMENT
// DELETE /api/shipments/:id
// ======================================================


exports.deleteShipment = async(req,res)=>{


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







await Shipment.findByIdAndDelete(

req.params.id

);








return res.status(200).json({


success:true,


message:

"Shipment deleted successfully."



});



}

catch(error){



console.error(

"DELETE SHIPMENT ERROR:",

error

);



return res.status(500).json({


success:false,


message:error.message


});



}


};






// ======================================================
// END PART 4/5
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// PREMIUM SHIPMENT CONTROLLER
// PART 5/5
// FINAL PROTECTION
// ======================================================



// ======================================================
// CLEAN STRING HELPER
// ======================================================


function clean(value){


    if(typeof value !== "string"){

        return value;

    }


    return value.trim();



}







// ======================================================
// NORMALIZE TRACKING NUMBER
// ======================================================


function normalizeTrackingNumber(number){


    if(!number){

        return "";

    }


    return number

    .toString()

    .trim()

    .toUpperCase();



}







// ======================================================
// CONTROLLER READY CHECK
// ======================================================


console.log(
"✅ Shipment Controller Loaded Successfully"
);




// ======================================================
// END OF LINKWORLD EXPRESS
// PREMIUM SHIPMENT CONTROLLER
// ======================================================
// ======================================================
// EXPORT CHECK
// ======================================================


module.exports = {


createShipment: exports.createShipment,


getShipments: exports.getShipments,


trackShipment: exports.trackShipment,


getShipmentByTracking: exports.getShipmentByTracking,


getShipmentById: exports.getShipmentById,


updateShipment: exports.updateShipment,


updateLocation: exports.updateLocation,


deleteShipment: exports.deleteShipment


};