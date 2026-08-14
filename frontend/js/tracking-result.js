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

let originMarker = null;

let destinationMarker = null;

let routeLine = null;

let mapInitialized = false;

let previousCoords = { lat:0, lng:0 };





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
"mapLastUpdated",
formatRelativeTime(shipment.locationUpdatedAt)
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


if(!mapInitialized){

initializeTrackingMap();

mapInitialized = true;

previousCoords = {

lat:Number(shipment.currentLatitude || 0),

lng:Number(shipment.currentLongitude || 0)

};

}

else{

handleLocationRefresh();

}




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


const origin = [

Number(
shipmentData.originLatitude
),

Number(
shipmentData.originLongitude
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



const hasCurrent =
current[0] !== 0 || current[1] !== 0;

const hasOrigin =
origin[0] !== 0 || origin[1] !== 0;

const hasDestination =
destination[0] !== 0 || destination[1] !== 0;



// REMOVE INVALID GPS


if(!hasCurrent)

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




// ORIGIN MARKER


if(hasOrigin){


const originIcon =
L.divIcon({

className:
"origin-map-marker",

html:
`<div class="origin-marker-dot"></div>`

});


originMarker =

L.marker(

origin,

{

icon:originIcon

}

)

.addTo(
trackingMap
)

.bindPopup(

`

<b>
Origin
</b>

<br>

${shipmentData.origin}

`

);


}




// DESTINATION MARKER


if(hasDestination){


const destinationIcon =
L.divIcon({

className:
"destination-map-marker",

html:
`<div class="destination-marker-flag"><i class="fa-solid fa-flag-checkered"></i></div>`

});


destinationMarker =

L.marker(

destination,

{

icon:destinationIcon

}

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


}




// ROUTE LINE
// Origin -> Current -> Destination when all three points
// are available. This is a straight geographic line
// between recorded coordinates, NOT the actual road,
// flight, or sea route the shipment physically travels.


const routePoints = [];

if(hasOrigin) routePoints.push(origin);

routePoints.push(current);

if(hasDestination) routePoints.push(destination);


if(routePoints.length > 1){


routeLine =

L.polyline(

routePoints,

{

color:"#00c853",

weight:4,

opacity:0.8,

dashArray:"8 6"

}

)

.addTo(
trackingMap
)

.bindTooltip(

"Approximate progress line - not the exact road, flight or sea route",

{

sticky:true

}

);


}




// FIT WORLD VIEW


const boundsSource =

routeLine ?
routeLine.getBounds() :
L.latLngBounds([current]);


trackingMap.fitBounds(

boundsSource,

{

padding:[40,40]

}

);




}




// ======================================================
// HANDLE LOCATION REFRESH
// Called on every periodic refresh (never on first load).
// Only moves the marker when the freshly-fetched
// coordinates differ from the last known ones - if the
// admin hasn't changed anything, nothing moves.
// ======================================================


function handleLocationRefresh(){


if(!shipmentData || !shipmentMarker)

return;


const newLat = Number(shipmentData.currentLatitude || 0);

const newLng = Number(shipmentData.currentLongitude || 0);


if(newLat === 0 && newLng === 0)

return;


const changed =

newLat !== previousCoords.lat ||

newLng !== previousCoords.lng;


if(!changed)

return;


moveMarkerSmoothly(

shipmentMarker,

[newLat, newLng]

);


shipmentMarker.setPopupContent(

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

);


if(routeLine){


const points = [];

if(originMarker) points.push(originMarker.getLatLng());

points.push([newLat, newLng]);

if(destinationMarker) points.push(destinationMarker.getLatLng());

routeLine.setLatLngs(points);


}


previousCoords = { lat:newLat, lng:newLng };


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
// RELATIVE TIME
// "2 minutes ago" style, falling back to a plain date once
// it's more than a day old.
// ======================================================


function formatRelativeTime(date){


if(!date)

return "-";


const then = new Date(date);

if(Number.isNaN(then.getTime()))

return "-";


const seconds = Math.floor((Date.now() - then.getTime()) / 1000);


if(seconds < 45)

return "Just now";


if(seconds < 90)

return "1 minute ago";


const minutes = Math.floor(seconds / 60);

if(minutes < 60)

return `${minutes} minutes ago`;


const hours = Math.floor(minutes / 60);

if(hours < 24)

return hours === 1 ? "1 hour ago" : `${hours} hours ago`;


return formatDateTime(date);


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









// REFRESH EVERY 30 SECONDS


setInterval(

()=>{


refreshTracking();


},

30000

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
// STREET VIEW BUTTON
// ======================================================


document.addEventListener("DOMContentLoaded", () => {


const streetViewBtn = document.getElementById("streetViewBtn");

if(!streetViewBtn) return;

streetViewBtn.addEventListener("click", () => {

if(!shipmentData) return;

const lat = Number(shipmentData.currentLatitude || 0);

const lng = Number(shipmentData.currentLongitude || 0);

if(lat === 0 && lng === 0){

Swal.fire({
icon:"info",
title:"Location Not Available",
text:"This shipment doesn't have GPS coordinates yet, so Street View isn't available."
});

return;

}

if(window.LinkWorldStreetView){

window.LinkWorldStreetView.open(lat, lng, shipmentData.currentLocation);

}

});


});




// ======================================================
// END LINKWORLD EXPRESS
// TRACKING RESULT SYSTEM
// COMPLETE
// ======================================================