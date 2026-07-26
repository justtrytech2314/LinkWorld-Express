// ======================================================
// LINKWORLD EXPRESS
// RECEIPT JAVASCRIPT
// PART 1
// ======================================================


// Backend API URL

const API_URL = "https://linkworld-express2-1.onrender.com/api/shipments";




// ======================================================
// GET TRACKING NUMBER FROM URL
// ======================================================

const params = new URLSearchParams(

    window.location.search

);


const trackingNumber = params.get(

    "tracking"

);





// ======================================================
// LOAD RECEIPT
// ======================================================

async function loadReceipt(){


try{


if(!trackingNumber){


alert(

"No tracking number provided."

);


return;


}



// Show loading

document.getElementById(

"loading"

).style.display="flex";




// Request shipment data

const response = await fetch(

`${API_URL}/receipt/${trackingNumber}`

);



const result = await response.json();



if(!result.success){


throw new Error(

result.message

);


}



const shipment = result.shipment;





// ==================================================
// HEADER INFORMATION
// ==================================================


document.getElementById(

"receiptDate"

).textContent =

new Date(

shipment.createdAt

).toLocaleDateString();





document.getElementById(

"trackingNumber"

).textContent =

shipment.trackingNumber;





document.getElementById(

"shipmentStatus"

).textContent =

shipment.status;





// ==================================================
// SENDER INFORMATION
// ==================================================


document.getElementById(

"senderName"

).textContent =

shipment.sender || "-";



document.getElementById(

"senderPhone"

).textContent =

shipment.senderPhone || "-";



document.getElementById(

"senderEmail"

).textContent =

shipment.senderEmail || "-";





// ==================================================
// RECEIVER INFORMATION
// ==================================================


document.getElementById(

"receiverName"

).textContent =

shipment.receiver || "-";



document.getElementById(

"receiverPhone"

).textContent =

shipment.receiverPhone || "-";



document.getElementById(

"receiverEmail"

).textContent =

shipment.receiverEmail || "-";



document.getElementById(

"receiverAddress"

).textContent =

shipment.receiverAddress || "-";





// Hide loading

document.getElementById(

"loading"

).style.display="none";



}

catch(error){


console.error(error);



document.getElementById(

"loading"

).style.display="none";



alert(

"Unable to load receipt."

);



}


}




// ======================================================
// START
// ======================================================

window.onload = loadReceipt;
// ======================================================
// RECEIPT JAVASCRIPT
// PART 2
// ======================================================



// ======================================================
// LOAD SHIPMENT DETAILS
// ======================================================

function loadShipmentDetails(shipment){



// Shipment information

document.getElementById(

"shipmentType"

).textContent =

shipment.shipment || "-";



document.getElementById(

"origin"

).textContent =

shipment.origin || "-";



document.getElementById(

"currentLocation"

).textContent =

shipment.currentLocation || "-";



document.getElementById(

"destination"

).textContent =

shipment.destination || "-";





// Delivery date

document.getElementById(

"deliveryDate"

).textContent =

shipment.expectedDelivery ?

new Date(

shipment.expectedDelivery

).toLocaleDateString()

:

"Not Available";





// Payment status

document.getElementById(

"paymentStatus"

).textContent =

shipment.paymentStatus || "Pending";





// GPS

document.getElementById(

"currentLatitude"

).textContent =

shipment.currentLatitude || 0;



document.getElementById(

"currentLongitude"

).textContent =

shipment.currentLongitude || 0;



document.getElementById(

"destinationLatitude"

).textContent =

shipment.destinationLatitude || 0;



document.getElementById(

"destinationLongitude"

).textContent =

shipment.destinationLongitude || 0;





// Progress

const progress =

shipment.progress || 0;



document.getElementById(

"progressFill"

).style.width =

progress + "%";



document.getElementById(

"progressText"

).textContent =

progress;




// Barcode number

document.getElementById(

"barcodeNumber"

).textContent =

shipment.trackingNumber;



}




// ======================================================
// ROUTE HISTORY
// ======================================================

function loadRouteHistory(shipment){


const table = document.getElementById(

"routeHistory"

);



if(!shipment.route || shipment.route.length===0){


table.innerHTML = `

<tr>

<td colspan="4">

No route history available

</td>

</tr>

`;

return;

}




table.innerHTML="";



shipment.route.forEach(point=>{


table.innerHTML += `

<tr>

<td>

${

new Date(

point.time

).toLocaleString()

}

</td>


<td>

${point.location || "-"}

</td>


<td>

${point.status || "-"}

</td>


<td>

${point.latitude},

${point.longitude}

</td>


</tr>

`;

});


}



// ======================================================
// DOWNLOAD RECEIPT
// ======================================================

function downloadReceipt(){


window.print();


}
// ======================================================
// COMPLETE RECEIPT DATA CONNECTION
// PART 3
// ======================================================


// ======================================================
// UPDATE LOAD RECEIPT FUNCTION
// ======================================================

async function loadReceipt(){


try{


if(!trackingNumber){


alert(

"No tracking number provided."

);


return;


}



document.getElementById(

"loading"

).style.display="flex";




// Fetch shipment

const response = await fetch(

`${API_URL}/receipt/${trackingNumber}`

);



const result = await response.json();



if(!result.success){


throw new Error(

result.message

);


}



const shipment = result.shipment;





// ================================
// HEADER
// ================================


document.getElementById(

"receiptDate"

).textContent =

new Date(

shipment.createdAt

).toLocaleDateString();





document.getElementById(

"trackingNumber"

).textContent =

shipment.trackingNumber;





document.getElementById(

"shipmentStatus"

).textContent =

shipment.status;







// ================================
// PEOPLE DETAILS
// ================================


document.getElementById(

"senderName"

).textContent =

shipment.sender || "-";



document.getElementById(

"senderPhone"

).textContent =

shipment.senderPhone || "-";



document.getElementById(

"senderEmail"

).textContent =

shipment.senderEmail || "-";





document.getElementById(

"receiverName"

).textContent =

shipment.receiver || "-";



document.getElementById(

"receiverPhone"

).textContent =

shipment.receiverPhone || "-";



document.getElementById(

"receiverEmail"

).textContent =

shipment.receiverEmail || "-";



document.getElementById(

"receiverAddress"

).textContent =

shipment.receiverAddress || "-";





// ================================
// SHIPMENT DETAILS
// ================================


loadShipmentDetails(

shipment

);




// ================================
// ROUTE
// ================================


loadRouteHistory(

shipment

);




// ================================
// REMOVE LOADING
// ================================


document.getElementById(

"loading"

).style.display="none";



}


catch(error){


console.error(error);



document.getElementById(

"loading"

).style.display="none";



alert(

"Unable to generate receipt."

);



}


}



// ======================================================
// START RECEIPT
// ======================================================


window.addEventListener(

"DOMContentLoaded",

()=>{


loadReceipt();


});