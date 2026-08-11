/* ======================================================
LINKWORLD EXPRESS
TRACKING RESULT JS
PART 1
FETCH SHIPMENT + CONNECT API
====================================================== */


"use strict";




// ======================================================
// API CONFIG
// ======================================================


const TRACKING_API = LWX_API;




// ======================================================
// GLOBAL VARIABLES
// ======================================================


let shipmentData = null;

let trackingMap = null;

let shipmentMarker = null;





// ======================================================
// GET TRACKING NUMBER FROM URL
// ======================================================


function getTrackingNumber(){


    const params = new URLSearchParams(
        window.location.search
    );


    return (
        params.get("tracking") ||
        params.get("trackingNumber") ||
        ""
    )
    .trim()
    .toUpperCase();


}





// ======================================================
// PAGE START
// ======================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


    loadShipmentTracking();


});






// ======================================================
// FETCH SHIPMENT FROM BACKEND
// SAME DATA AS DASHBOARD
// ======================================================


async function loadShipmentTracking(){



try{


    const trackingNumber =
    getTrackingNumber();




    if(!trackingNumber){


        showTrackingError(
            "No tracking number provided."
        );


        return;


    }






    const response =
    await fetch(

        `${TRACKING_API}/shipments/track/${trackingNumber}`

    );






    const data =
    await response.json();







    if(!data.success){


        showTrackingError(
            "Shipment not found."
        );


        return;


    }






    shipmentData =
    data.shipment;





    populateShipmentData();





}

catch(error){


    console.error(
        "TRACKING ERROR:",
        error
    );



    showTrackingError(
        "Unable to connect with tracking server."
    );



}



}







// ======================================================
// ERROR MESSAGE
// ======================================================


function showTrackingError(message){



Swal.fire({

    icon:"error",

    title:"Tracking Error",

    text:message

})
.then(()=>{


    window.location.href =
    "tracking.html";


});



}







// ======================================================
// POPULATE ALL PAGE INFORMATION
// ======================================================


function populateShipmentData(){



const shipment =
shipmentData;






// HEADER


setText(
"trackingNumberDisplay",
shipment.trackingNumber
);





setText(
"shipmentStatus",
shipment.status
);





setText(
"currentPackageLocation",
shipment.currentLocation
);







// MAIN STATUS


setText(
"shipmentStatusLarge",
shipment.status
);




setText(
"heroStampText",
shipment.status
);




setText(
"barcodeTrackingNumber",
shipment.trackingNumber
);








// ROUTE


setText(
"originDisplay",
shipment.origin
);



setText(
"destinationDisplay",
shipment.destination
);








// SUMMARY CARDS


setText(
"estimatedArrival",
formatDate(
shipment.expectedDelivery
)
);






setText(
"shipmentLastUpdated",
formatDate(
shipment.updatedAt
)
);








// MAP INFO


setText(
"mapCurrentLocation",
shipment.currentLocation
);




setText(
"mapLatitude",
shipment.currentLatitude
);




setText(
"mapLongitude",
shipment.currentLongitude
);




setText(
"detailsCurrentLocation",
shipment.currentLocation
);



setText(
"detailsCurrentLatitude",
shipment.currentLatitude
);



setText(
"detailsCurrentLongitude",
shipment.currentLongitude
);






// PROGRESS


updateProgress();







// DETAILS


loadShipmentDetails();





// TIMELINE


buildShipmentTimeline();






// MAP


initializeTrackingMap();




}









// ======================================================
// SAFE TEXT UPDATE
// ======================================================


function setText(id,value){



const element =
document.getElementById(id);



if(element){


element.textContent =
value || "-";


}


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
// END PART 1
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
TRACKING RESULT JS
PART 2
WORLD MAP + GPS + TIMELINE SYSTEM
====================================================== */






// ======================================================
// INITIALIZE WORLD MAP
// ======================================================


function initializeTrackingMap(){



const mapElement =
document.getElementById(
"trackingMap"
);




if(!mapElement)

return;





// CREATE WORLD VIEW


trackingMap =
L.map(
"trackingMap",
{

    zoomControl:false,

    worldCopyJump:true

}

)
.setView(

[
20,

0

],

2

);







// MAP STYLE


L.tileLayer(

"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

{


maxZoom:18,


attribution:

"© OpenStreetMap"


}

)

.addTo(
trackingMap
);











// DRAW SHIPMENT ROUTE


drawShipmentRoute();






}









// ======================================================
// CREATE ROUTE LINE
// ORIGIN TO DESTINATION
// ======================================================


function drawShipmentRoute(){



if(!shipmentData)

return;






const current = [

Number(
shipmentData.currentLatitude
),

Number(
shipmentData.currentLongitude
)

];





const destination = [

Number(
shipmentData.destinationLatitude
),

Number(
shipmentData.destinationLongitude
)

];








// REMOVE INVALID GPS


if(

current[0] === 0 ||

current[1] === 0

)

return;








// CURRENT LOCATION MARKER


const liveIcon =
L.divIcon({

className:
"live-map-marker",


html:


`

<div class="pulse-marker">

<i class="fa-solid fa-truck-fast"></i>

</div>

`



});







shipmentMarker =

L.marker(

current,

{

icon:liveIcon

}

)

.addTo(
trackingMap
)

.bindPopup(

`

<b>
LinkWorld Express
</b>

<br>

${shipmentData.currentLocation}

<br>

Status:
${shipmentData.status}

`

)

.openPopup();












// DESTINATION MARKER


const destinationMarker =

L.marker(

destination

)

.addTo(
trackingMap
)

.bindPopup(

`

<b>
Destination
</b>

<br>

${shipmentData.destination}

`

);











// ROUTE LINE


const routeLine =

L.polyline(

[

current,

destination

],

{

color:"#00c853",

weight:4,

opacity:0.8

}

)

.addTo(
trackingMap
);












// FIT WORLD VIEW


trackingMap.fitBounds(

routeLine.getBounds(),

{

padding:[40,40]

}

);








}









// ======================================================
// UPDATE LIVE POSITION
// USED WHEN DASHBOARD CHANGES LOCATION
// ======================================================


function updateLiveMarker(){



if(

!shipmentMarker ||

!shipmentData

)

return;






shipmentMarker.setLatLng(

[

shipmentData.currentLatitude,

shipmentData.currentLongitude

]

);





trackingMap.panTo(

[

shipmentData.currentLatitude,

shipmentData.currentLongitude

]

);



}









// ======================================================
// BUILD SHIPMENT TIMELINE
// FROM DATABASE HISTORY[]
// ======================================================


function buildShipmentTimeline(){



const container =

document.getElementById(

"shipmentTimeline"

);





if(!container)

return;







container.innerHTML="";








if(

!shipmentData.history ||

shipmentData.history.length===0

){



container.innerHTML =

`

<div class="timeline-empty">

Shipment journey will appear here.

</div>

`;



return;


}









shipmentData.history.forEach(

(item,index)=>{



const completed =

index !==

shipmentData.history.length-1;







const timelineItem =

document.createElement(
"div"
);




timelineItem.className =

`

timeline-item

${completed ? "completed":""}

`;









timelineItem.innerHTML =



`

<div class="timeline-icon">


<i class="fa-solid fa-check"></i>


</div>





<div class="timeline-content">



<h3>

${item.status}

</h3>



<p>

<i class="fa-solid fa-location-dot"></i>

${item.location}

</p>




<span>

${formatDateTime(item.timestamp)}

</span>



</div>

`;









container.appendChild(

timelineItem

);







}

);








}









// ======================================================
// DATE + TIME FORMAT
// ======================================================


function formatDateTime(date){



if(!date)

return "-";





return new Date(date)

.toLocaleString(

"en-US",

{

year:"numeric",

month:"short",

day:"numeric",

hour:"2-digit",

minute:"2-digit"


}

);



}









// ======================================================
// END PART 2
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
TRACKING RESULT JS
PART 3
DETAILS + PROGRESS + LIVE STATUS SYSTEM
====================================================== */





// ======================================================
// LOAD SHIPMENT DETAILS
// ======================================================


function loadShipmentDetails(){



if(!shipmentData)

return;





const shipment =
shipmentData;







// ================================
// SHIPMENT DETAILS
// ================================


setText(

"detailsTrackingNumber",

shipment.trackingNumber

);





setText(

"detailsShipmentType",

shipment.shipmentType

);





setText(

"detailsStatus",

shipment.status

);








// ================================
// SENDER
// ================================


setText(

"detailsSender",

shipment.sender?.name

);





setText(

"detailsOrigin",

shipment.origin

);







setText(

"createdDate",

formatDate(

shipment.createdAt

)

);










// ================================
// RECEIVER
// ================================


setText(

"detailsReceiver",

shipment.receiver?.name

);





setText(

"detailsDestination",

shipment.destination

);






setText(

"expectedDelivery",

formatDate(

shipment.expectedDelivery

)

);










// ================================
// LOCATION
// ================================


setText(

"locationHub",

shipment.currentLocation

);






setText(

"locationLatitude",

shipment.currentLatitude

);






setText(

"locationLongitude",

shipment.currentLongitude

);







}









// ======================================================
// UPDATE DELIVERY PROGRESS
// ======================================================


function updateProgress(){



if(!shipmentData)

return;







const progress =

Number(

shipmentData.progress || 0

);








const bar =

document.getElementById(

"progressBar"

);






const text =

document.getElementById(

"progressText"

);









if(bar){


bar.style.width =

progress + "%";


}






if(text){


text.textContent =

progress + "%";


}









// MOVE TRUCK ICON


const truck =

document.querySelector(

".truck-progress-icon"

);






if(truck){


truck.style.left =

progress + "%";


}





}











// ======================================================
// STATUS COLOR CONTROL
// ======================================================


function updateStatusStyle(){



const statusElements = [


"shipmentStatus",


"shipmentStatusLarge",


"detailsStatus"


];







let status =

shipmentData.status

.toLowerCase();








statusElements.forEach(

id=>{


const element =

document.getElementById(id);






if(!element)

return;





element.classList.remove(

"status-created",

"status-transit",

"status-delivered",

"status-cancelled"

);







if(

status.includes("deliver")

){



element.classList.add(

"status-delivered"

);


}







else if(

status.includes("transit")

||

status.includes("pickup")

){



element.classList.add(

"status-transit"

);


}






else if(

status.includes("cancel")

){



element.classList.add(

"status-cancelled"

);


}







else{


element.classList.add(

"status-created"

);


}





}


);






}










// ======================================================
// LIVE BADGE UPDATE
// ======================================================


function updateLiveStatus(){



const liveBadges =

document.querySelectorAll(

".location-live, .live-location-badge"

);







liveBadges.forEach(

badge=>{



badge.innerHTML =

`

<span></span>

LIVE TRACKING

`;



}

);








const signal =

document.getElementById(

"gpsLastSignal"

);





if(signal){


signal.textContent =

"Active";


}





}









// ======================================================
// AUTO REFRESH TRACKING DATA
// SAME DATA AS DASHBOARD
// ======================================================


async function refreshTracking(){



if(!shipmentData)

return;







try{



const response =

await fetch(

`${TRACKING_API}/shipments/track/${shipmentData.trackingNumber}`

);








const data =

await response.json();








if(data.success){



shipmentData =

data.shipment;






populateShipmentData();





}



}

catch(error){



console.log(

"Auto refresh skipped"

);



}




}









// REFRESH EVERY 60 SECONDS


setInterval(

()=>{


refreshTracking();


},

60000

);












// ======================================================
// RUN STATUS UPDATE AFTER LOAD
// ======================================================


window.addEventListener(

"load",

()=>{


if(shipmentData){


updateStatusStyle();


updateLiveStatus();


}



}

);









// ======================================================
// END PART 3
// ======================================================
/* ======================================================
LINKWORLD EXPRESS
TRACKING RESULT JS
PART 4
FINAL GPS + MAP ENHANCEMENTS
====================================================== */






// ======================================================
// REQUEST CUSTOMER LOCATION
// OPTIONAL
// ======================================================


function requestCustomerLocation(){



if(

!navigator.geolocation

)

return;






navigator.geolocation.getCurrentPosition(



(position)=>{



console.log(

"Customer location available:",

position.coords.latitude,

position.coords.longitude

);



},



(error)=>{



console.log(

"Customer location permission denied"

);



},



{

enableHighAccuracy:true,

timeout:10000,

maximumAge:60000


}



);



}









// ======================================================
// SMOOTH MOVE SHIPMENT MARKER
// ======================================================


function moveMarkerSmoothly(

marker,

newPosition

){





if(!marker)

return;







const start =

marker.getLatLng();







const end =

L.latLng(

newPosition[0],

newPosition[1]

);







let step = 0;






const steps = 100;







const interval =

setInterval(

()=>{



step++;






const lat =

start.lat +

(end.lat - start.lat)

*

(step / steps);






const lng =

start.lng +

(end.lng - start.lng)

*

(step / steps);







marker.setLatLng(

[lat,lng]

);








if(step >= steps){


clearInterval(interval);


}



},

20

);






}









// ======================================================
// UPDATE MAP WITHOUT RELOAD
// ======================================================


function updateMapPosition(){



if(

!shipmentMarker ||

!shipmentData

)

return;







moveMarkerSmoothly(

shipmentMarker,

[


shipmentData.currentLatitude,


shipmentData.currentLongitude


]

);









}





// ======================================================
// OVERRIDE LIVE UPDATE
// ======================================================


const originalRefresh =

refreshTracking;





refreshTracking = async()=>{





await originalRefresh();







updateMapPosition();






};









// ======================================================
// MAP RESIZE FIX
// ======================================================


window.addEventListener(

"resize",

()=>{



if(trackingMap){



setTimeout(

()=>{


trackingMap.invalidateSize();


},

300

);



}



}

);









// ======================================================
// CREATE TRACKING LINK
// ======================================================


function createTrackingURL(number){



return window.location.origin +

window.location.pathname +

"?tracking=" +

number;



}









// ======================================================
// COPY TRACKING NUMBER
// ======================================================


function copyTrackingNumber(){



if(!shipmentData)

return;






navigator.clipboard.writeText(

shipmentData.trackingNumber

);






Swal.fire({


icon:"success",


title:"Copied",


text:"Tracking number copied successfully.",


timer:1500,


showConfirmButton:false



});






}









// ======================================================
// INITIAL SYSTEM START
// ======================================================


window.addEventListener(

"load",

()=>{





requestCustomerLocation();





if(

trackingMap

){



setTimeout(

()=>{


trackingMap.invalidateSize();


},

500

);



}






});









// ======================================================
// END LINKWORLD EXPRESS
// TRACKING RESULT SYSTEM
// COMPLETE
// ======================================================