/* ======================================================
LINKWORLD EXPRESS
ADMIN DASHBOARD JS
PART 1
AUTH + API + INITIALIZATION + LOAD SHIPMENTS
MATCHES DASHBOARD.HTML IDS
====================================================== */


"use strict";



// ======================================================
// API CONFIGURATION
// ======================================================


const API_URL = "https://linkworld-express3.onrender.com/api";




// ======================================================
// GLOBAL VARIABLES
// ======================================================


let shipments = [];

let selectedShipment = null;

let adminToken = null;




// ======================================================
// CHECK ADMIN LOGIN
// ======================================================


adminToken = localStorage.getItem(
"adminToken"
);



if(!adminToken){


window.location.href =
"admin-login.html";


}






// ======================================================
// AUTH HEADERS
// ======================================================


function getHeaders(){


return {


"Content-Type":
"application/json",


"Authorization":
`Bearer ${adminToken}`


};


}






// ======================================================
// DOM READY
// ======================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


initializeDashboard();


});







// ======================================================
// INITIALIZE DASHBOARD
// ======================================================


async function initializeDashboard(){



try{


await loadShipments();


updateStats();


setupDashboardEvents();



}

catch(error){



console.error(
"Dashboard Error:",
error
);



Swal.fire({

icon:"error",

title:"Dashboard Error",

text:error.message

});


}



}







// ======================================================
// LOAD ALL SHIPMENTS
// GET /api/shipments
// ======================================================


async function loadShipments(){



const response =
await fetch(

`${API_URL}/shipments`,

{


method:"GET",


headers:getHeaders()


}


);







const data =
await response.json();








if(!data.success){


throw new Error(

data.message ||
"Unable to load shipments"

);


}







shipments =
data.shipments || [];






renderShipments();



}








// ======================================================
// UPDATE DASHBOARD STATISTICS
// ======================================================


function updateStats(){



const total =
document.getElementById(
"totalShipments"
);



const transit =
document.getElementById(
"transitShipments"
);



const delivered =
document.getElementById(
"deliveredShipments"
);



const pending =
document.getElementById(
"pendingShipments"
);








if(total)

total.textContent =
shipments.length;









if(transit)


transit.textContent =

shipments.filter(

shipment =>

shipment.status === "In Transit"

||

shipment.status === "Picked Up"


).length;









if(delivered)


delivered.textContent =

shipments.filter(

shipment =>

shipment.status === "Delivered"


).length;









if(pending)


pending.textContent =

shipments.filter(

shipment =>

shipment.status === "Created"


).length;





}








// ======================================================
// DASHBOARD EVENTS
// ======================================================


function setupDashboardEvents(){



const form =
document.getElementById(
"shipmentForm"
);




if(form){


form.addEventListener(

"submit",

createShipment

);


}






const logout =
document.getElementById(
"logoutBtn"
);



if(logout){


logout.addEventListener(

"click",

logoutAdmin

);


}






const updateBtn =
document.getElementById(
"updateShipmentBtn"
);



if(updateBtn){


updateBtn.addEventListener(

"click",

updateShipment

);


}







}









// ======================================================
// LOGOUT
// ======================================================


async function logoutAdmin(){



localStorage.removeItem(
"adminToken"
);


localStorage.removeItem(
"admin"
);



window.location.href =
"admin-login.html";


}








// ======================================================
// DATE FORMAT
// ======================================================


function formatDate(date){



if(!date)

return "-";



return new Date(date)

.toLocaleDateString(

"en-US",

{


year:"numeric",

month:"short",

day:"numeric"


}


);



}






// ======================================================
// STATUS CLASS
// ======================================================


function statusClass(status){



if(!status)

return "";



status =
status.toLowerCase();





if(status.includes("deliver"))

return "status-delivered";





if(
status.includes("transit")
||
status.includes("pickup")
)

return "status-transit";





return "status-created";


}






// ======================================================
// END PART 1
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
ADMIN DASHBOARD JS
PART 2
CREATE SHIPMENT SYSTEM
MATCHES DASHBOARD.HTML IDS
====================================================== */





// ======================================================
// CREATE NEW SHIPMENT
// POST /api/shipments
// ======================================================


async function createShipment(event){



event.preventDefault();





try{





const shipmentData = {




// ================================
// SENDER
// ================================


sender:{


name:
document.getElementById(
"senderName"
).value.trim(),



phone:
document.getElementById(
"senderPhone"
).value.trim(),



email:
document.getElementById(
"senderEmail"
).value.trim(),



address:
document.getElementById(
"senderAddress"
).value.trim()



},







// ================================
// RECEIVER
// ================================


receiver:{


name:
document.getElementById(
"receiverName"
).value.trim(),



phone:
document.getElementById(
"receiverPhone"
).value.trim(),



email:
document.getElementById(
"receiverEmail"
).value.trim(),



address:
document.getElementById(
"receiverAddress"
).value.trim()



},







// ================================
// SHIPMENT INFORMATION
// ================================


shipmentDescription:

document.getElementById(
"shipmentDescription"
).value.trim(),





shipmentType:

document.getElementById(
"shipmentType"
).value,





packageWeight:

Number(

document.getElementById(
"packageWeight"
).value

) || 0,





packageValue:

Number(

document.getElementById(
"packageValue"
).value

) || 0,









// ================================
// ROUTE
// ================================


origin:

document.getElementById(
"origin"
).value.trim(),





currentLocation:

document.getElementById(
"currentLocation"
).value.trim(),





destination:

document.getElementById(
"destination"
).value.trim(),







// ================================
// GPS
// ================================


currentLatitude:

Number(

document.getElementById(
"currentLatitude"
).value

) || 0,





currentLongitude:

Number(

document.getElementById(
"currentLongitude"
).value

) || 0,







destinationLatitude:

Number(

document.getElementById(
"destinationLatitude"
).value

) || 0,







destinationLongitude:

Number(

document.getElementById(
"destinationLongitude"
).value

) || 0,








// ================================
// CONTROL
// ================================


status:

document.getElementById(
"shipmentStatus"
).value,







paymentStatus:

document.getElementById(
"paymentStatus"
).value,








progress:

Number(

document.getElementById(
"shipmentProgress"
).value

) || 0,







expectedDelivery:

document.getElementById(
"expectedDelivery"
).value





};









// =================================
// BASIC VALIDATION
// =================================


if(

!shipmentData.sender.name ||

!shipmentData.sender.phone ||

!shipmentData.receiver.name ||

!shipmentData.receiver.phone ||

!shipmentData.receiver.address


){



Swal.fire({

icon:"warning",

title:"Missing Information",

text:
"Please complete sender and receiver required fields."

});


return;


}










// =================================
// SEND TO BACKEND
// =================================


const response =

await fetch(


`${API_URL}/shipments`,

{


method:"POST",


headers:getHeaders(),



body:

JSON.stringify(
shipmentData
)



}


);









const data =

await response.json();








if(!data.success){


throw new Error(

data.message ||

"Shipment creation failed"

);


}










// =================================
// DISPLAY GENERATED TRACKING NUMBER
// =================================


const trackingDisplay =

document.getElementById(
"generatedTrackingNumber"
);






if(trackingDisplay){



trackingDisplay.textContent =

data.shipment.trackingNumber;



}









// =================================
// SUCCESS MESSAGE
// =================================


Swal.fire({

icon:"success",

title:"Shipment Created",

html:`

<p>
Shipment successfully added to LinkWorld Express network.
</p>

<strong>
Tracking Number:
</strong>

<br>

<span style="font-size:22px">

${data.shipment.trackingNumber}

</span>

`

});









// =================================
// RESET FORM
// =================================


document.getElementById(
"shipmentForm"
).reset();







// =================================
// REFRESH TABLE
// =================================


await loadShipments();



updateStats();






}





catch(error){



console.error(

"CREATE SHIPMENT ERROR:",

error

);





Swal.fire({

icon:"error",

title:"Failed",

text:error.message

});





}



}









// ======================================================
// GENERATE LOCAL TRACKING PREVIEW
// ======================================================


function generateTrackingPreview(){



const box =

document.getElementById(
"generatedTrackingNumber"
);



if(!box)

return;






const year =

new Date()

.getFullYear();






const random =

Math.floor(

Math.random()*900000

)+100000;







box.textContent =

`LWX${year}${random}`;



}








// ======================================================
// AUTO TRACKING PREVIEW WHEN FORM OPENS
// ======================================================


const shipmentForm =

document.getElementById(
"shipmentForm"
);



if(shipmentForm){



shipmentForm.addEventListener(

"input",

()=>{


const tracking =

document.getElementById(
"generatedTrackingNumber"
);



if(

tracking &&

tracking.textContent.includes(
"generate"
)

){


generateTrackingPreview();


}



}


);



}









// ======================================================
// END PART 2
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
ADMIN DASHBOARD JS
PART 3
SHIPMENT TABLE + VIEW + RECEIPT + DELETE
MATCHES DASHBOARD.HTML IDS
====================================================== */






// ======================================================
// RENDER SHIPMENT TABLE
// ======================================================


function renderShipments(){



const tableBody =

document.getElementById(
"shipmentTableBody"
);




if(!tableBody)

return;







tableBody.innerHTML = "";







if(shipments.length === 0){



tableBody.innerHTML = `


<tr>


<td colspan="7" class="empty-table">


<i class="fa-solid fa-box-open"></i>


<h3>
No Shipments Found
</h3>


<p>
Create your first shipment.
</p>



</td>


</tr>


`;



return;


}










shipments.forEach(

shipment=>{





const row =

document.createElement(
"tr"
);









row.innerHTML = `



<td>

${shipment.trackingNumber || "-"}

</td>






<td>

${shipment.sender?.name || "-"}

</td>






<td>

${shipment.receiver?.name || "-"}

</td>







<td>

${shipment.currentLocation || "-"}

</td>







<td>


<span class="status-badge ${statusClass(shipment.status)}">


${shipment.status || "Created"}


</span>


</td>







<td>


<div class="table-progress">


<div

class="progress-fill"

style="width:${shipment.progress || 0}%">

</div>


</div>



<small>

${shipment.progress || 0}%

</small>



</td>








<td>


<div class="action-buttons">





<button

class="action-btn view-btn"

onclick="viewShipment('${shipment._id}')"

title="View Shipment">


<i class="fa-solid fa-eye"></i>


</button>







<button

class="action-btn edit-btn"

onclick="openEditShipment('${shipment._id}')"

title="Edit Shipment">


<i class="fa-solid fa-pen"></i>


</button>







<button

class="action-btn receipt-btn"

onclick="openReceipt('${shipment.trackingNumber}')"

title="Print Receipt">


<i class="fa-solid fa-file-invoice"></i>


</button>







<button

class="action-btn delete-btn"

onclick="deleteShipment('${shipment._id}')"

title="Delete Shipment">


<i class="fa-solid fa-trash"></i>


</button>




</div>


</td>



`;







tableBody.appendChild(row);




});





}












// ======================================================
// VIEW SHIPMENT
// ======================================================


function viewShipment(id){





const shipment =

shipments.find(

item => item._id === id

);






if(!shipment)

return;







selectedShipment = shipment;







const modal =

document.getElementById(
"viewShipmentModal"
);






if(!modal)

return;









document.getElementById(
"viewTracking"
).textContent =

shipment.trackingNumber || "-";






document.getElementById(
"viewSender"
).textContent =

shipment.sender?.name || "-";






document.getElementById(
"viewReceiver"
).textContent =

shipment.receiver?.name || "-";






document.getElementById(
"viewRoute"
).textContent =


`${shipment.origin || "-"} → ${shipment.destination || "-"}`;








document.getElementById(
"viewStatus"
).textContent =

shipment.status || "-";








document.getElementById(
"viewProgress"
).textContent =

`${shipment.progress || 0}%`;









modal.classList.add(
"active"
);





}












// ======================================================
// CLOSE VIEW MODAL
// ======================================================


const closeView =

document.getElementById(
"closeViewModal"
);





if(closeView){



closeView.onclick = ()=>{


document.getElementById(
"viewShipmentModal"
)

.classList.remove(
"active"
);



};


}












// ======================================================
// OPEN RECEIPT PAGE
// ======================================================
// ======================================================
// OPEN RECEIPT
// Saves selected shipment to localStorage
// ======================================================

function openReceipt(trackingNumber){

    const shipment = shipments.find(
        item => item.trackingNumber === trackingNumber
    );

    if(!shipment){

        Swal.fire({
            icon: "error",
            title: "Shipment Not Found",
            text: "Unable to locate this shipment."
        });

        return;
    }

    // Save shipment for receipt page
    localStorage.setItem(
        "receiptShipment",
        JSON.stringify(shipment)
    );

    // Open receipt page
    window.location.href = "receipt.html";

}






// ======================================================
// DELETE SHIPMENT
// ======================================================


async function deleteShipment(id){





const confirmDelete =

await Swal.fire({


title:
"Delete Shipment?",


text:
"This action cannot be reversed.",


icon:
"warning",


showCancelButton:true,


confirmButtonText:
"Delete"



});








if(!confirmDelete.isConfirmed)

return;








try{






const response =

await fetch(


`${API_URL}/shipments/${id}`,

{


method:"DELETE",


headers:getHeaders()


}


);







const data =

await response.json();









if(!data.success){


throw new Error(

data.message ||

"Delete failed"

);


}









Swal.fire({

icon:"success",

title:"Deleted",

text:
"Shipment removed successfully."

});








await loadShipments();



updateStats();






}

catch(error){



console.error(

"DELETE ERROR:",

error

);






Swal.fire({

icon:"error",

title:"Delete Failed",

text:error.message


});





}



}









// ======================================================
// END PART 3
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
ADMIN DASHBOARD JS
PART 4
EDIT SHIPMENT + UPDATE + LOGOUT + FINAL SYSTEM
MATCHES DASHBOARD.HTML IDS
====================================================== */







// ======================================================
// OPEN EDIT SHIPMENT MODAL
// ======================================================


function openEditShipment(id){





const shipment =

shipments.find(

item => item._id === id

);






if(!shipment)

return;






selectedShipment = shipment;









const modal =

document.getElementById(
"editShipmentModal"
);







if(!modal)

return;









// hidden ID


document.getElementById(
"editShipmentId"
).value =

shipment._id;









// current location


document.getElementById(
"editCurrentLocation"
).value =

shipment.currentLocation || "";







document.getElementById(
"editCurrentLatitude"
).value =

shipment.currentLatitude || 0;








document.getElementById(
"editCurrentLongitude"
).value =

shipment.currentLongitude || 0;








document.getElementById(
"editStatus"
).value =

shipment.status || "Created";








document.getElementById(
"editProgress"
).value =

shipment.progress || 0;








document.getElementById(
"editPaymentStatus"
).value =

shipment.paymentStatus || "Pending";









modal.classList.add(
"active"
);





}











// ======================================================
// CLOSE EDIT MODAL
// ======================================================


const closeEdit =

document.getElementById(
"closeEditModal"
);





if(closeEdit){



closeEdit.onclick = ()=>{


document.getElementById(
"editShipmentModal"
)

.classList.remove(
"active"
);



};


}











// ======================================================
// UPDATE SHIPMENT
// PUT /api/shipments/:id
// ======================================================


async function updateShipment(){






const id =

document.getElementById(
"editShipmentId"
).value;







if(!id)

return;








const updateData = {





currentLocation:

document.getElementById(
"editCurrentLocation"
).value.trim(),






currentLatitude:

Number(

document.getElementById(
"editCurrentLatitude"
).value

)||0,







currentLongitude:

Number(

document.getElementById(
"editCurrentLongitude"
).value

)||0,







status:

document.getElementById(
"editStatus"
).value,








progress:

Number(

document.getElementById(
"editProgress"
).value

)||0,








paymentStatus:

document.getElementById(
"editPaymentStatus"
).value





};









try{





const response =

await fetch(


`${API_URL}/shipments/${id}`,

{


method:"PUT",


headers:getHeaders(),


body:

JSON.stringify(
updateData
)



}


);









const data =

await response.json();








if(!data.success){


throw new Error(

data.message ||

"Update failed"

);


}










Swal.fire({

icon:"success",

title:"Updated",

text:
"Shipment updated successfully."

});









document.getElementById(
"editShipmentModal"
)

.classList.remove(
"active"
);








await loadShipments();



updateStats();








}

catch(error){



console.error(

"UPDATE ERROR:",

error

);






Swal.fire({

icon:"error",

title:"Update Failed",

text:error.message


});



}



}











// ======================================================
// UPDATE BUTTON CONNECTION
// ======================================================


const updateButton =

document.getElementById(
"updateShipmentBtn"
);





if(updateButton){


updateButton.addEventListener(

"click",

updateShipment

);


}











// ======================================================
// LOGOUT BUTTON
// ======================================================


const logoutButton =

document.getElementById(
"logoutBtn"
);





if(logoutButton){


logoutButton.addEventListener(

"click",

logoutAdmin

);


}












// ======================================================
// CHECK ADMIN SESSION
// VERIFY TOKEN
// GET /api/admin/check
// ======================================================


async function verifyAdminSession(){





try{



const response =

await fetch(


`${API_URL}/admin/check`,

{


method:"GET",


headers:getHeaders()



}


);







const data =

await response.json();








if(!data.success){


throw new Error(
"Session expired"
);


}






}

catch(error){





localStorage.removeItem(
"adminToken"
);






window.location.href =

"admin-login.html";



}



}












// ======================================================
// AUTO REFRESH SHIPMENTS
// EVERY 60 SECONDS
// ======================================================


setInterval(

async()=>{


try{


await loadShipments();



updateStats();



}

catch(error){


console.log(
"Auto refresh failed"
);



}



},

60000

);











// ======================================================
// START FINAL CHECK
// ======================================================


verifyAdminSession();











// ======================================================
// END PART 4
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
ADMIN DASHBOARD JS
PART 5
FINAL HELPERS + STARTUP CONNECTION
MATCHES ALL PREVIOUS PARTS
====================================================== */







// ======================================================
// COMMON AUTH HEADER FUNCTION
// USED BY ALL API REQUESTS
// ======================================================


function getHeaders(){



const token =

localStorage.getItem(
"adminToken"
);






return {



"Content-Type":

"application/json",



"Authorization":

`Bearer ${token}`



};



}












// ======================================================
// STATUS BADGE COLORS
// ======================================================


function statusClass(status){



if(!status)

return "status-created";





const value =

status.toLowerCase();








if(

value.includes("deliver")

)

return "status-delivered";








if(

value.includes("transit")

||

value.includes("picked")

||

value.includes("pickup")

)

return "status-transit";








if(

value.includes("arriv")

)

return "status-arrived";








return "status-created";



}











// ======================================================
// UPDATE DASHBOARD STATISTICS
// ======================================================


function updateStats(){





const total =

document.getElementById(
"totalShipments"
);






const transit =

document.getElementById(
"transitShipments"
);






const delivered =

document.getElementById(
"deliveredShipments"
);






const pending =

document.getElementById(
"pendingShipments"
);









if(total)

total.textContent =

shipments.length;









if(transit)


transit.textContent =


shipments.filter(

item =>

item.status === "In Transit"

||

item.status === "Picked Up"

).length;









if(delivered)


delivered.textContent =


shipments.filter(

item =>

item.status === "Delivered"

).length;









if(pending)


pending.textContent =


shipments.filter(

item =>

item.status === "Created"

).length;





}












// ======================================================
// SAVE BUTTON CONNECTION
// DASHBOARD HTML:
// <button type="submit">
// ======================================================


const shipmentFormSubmit =

document.getElementById(
"shipmentForm"
);







if(shipmentFormSubmit){



shipmentFormSubmit.addEventListener(

"submit",

createShipment

);



}












// ======================================================
// LOGOUT FUNCTION
// ======================================================


function logoutAdmin(){



localStorage.removeItem(
"adminToken"
);






localStorage.removeItem(
"receiptShipment"
);






window.location.href =

"admin-login.html";



}












// ======================================================
// CLOSE MODALS WHEN CLICK OUTSIDE
// ======================================================


window.addEventListener(

"click",

(event)=>{






const viewModal =

document.getElementById(
"viewShipmentModal"
);







const editModal =

document.getElementById(
"editShipmentModal"
);








if(

event.target === viewModal

)

{


viewModal.classList.remove(
"active"
);



}








if(

event.target === editModal

)

{


editModal.classList.remove(
"active"
);



}





}

);











// ======================================================
// INITIAL DASHBOARD BOOT
// RUNS AFTER LOGIN TOKEN CHECK
// ======================================================


async function startDashboard(){






const token =

localStorage.getItem(
"adminToken"
);







if(!token){



window.location.href =

"admin-login.html";



return;



}








try{





await verifyAdminSession();





await loadShipments();





renderShipments();





updateStats();






}

catch(error){



console.error(

"Dashboard start error:",

error

);






localStorage.removeItem(
"adminToken"
);





window.location.href =

"admin-login.html";



}




}











// ======================================================
// PAGE READY
// ======================================================


document.addEventListener(

"DOMContentLoaded",

()=>{


startDashboard();



}

);









// ======================================================
// END PART 5
// ======================================================
