/* ======================================================
LINKWORLD EXPRESS
TRACKING RESULT JS
PART 1
FETCH SHIPMENT + CONNECT API
====================================================== */


"use strict";




// ======================================================
// API CONFIG
// Comes from js/config.js, which is loaded first and picks
// localhost or the live backend based on the hostname.
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
// BASEMAP PROVIDERS
// ------------------------------------------------------
// Tried in order, each falling back to the next.
//
// Two earlier choices were wrong for this page:
// tile.openstreetmap.org forbids commercial production
// traffic and now resolves IPv6-only, so it simply failed;
// Carto stamps "API KEY REQUIRED" across every tile served
// without a key, which reads as broken to a customer.
//
// Esri's ArcGIS Online basemaps need no key and carry no
// watermark. World Street Map leads because a customer
// tracking a parcel wants real geography around it - roads,
// towns, borders. Light Gray Canvas is cleaner still but
// carries almost no road detail outside major markets, so it
// sits last as a legible worst case rather than the default.
// ======================================================


const BASEMAP_PROVIDERS = [

{
    name: "Esri World Street Map",

    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",

    options: {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
},

{
    name: "OpenStreetMap Germany",

    url: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",

    options: {
        subdomains: "abc",
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
    }
},

{
    name: "Esri Light Gray Canvas",

    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",

    // Transparent place labels, drawn above the base.
    labelsUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",

    options: {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
}

];


// A handful of missing tiles is normal while panning. Only a
// provider that fails repeatedly is treated as unavailable.
const TILE_FAILURES_BEFORE_FALLBACK = 6;


let basemapLayer = null;

let basemapLabels = null;

let basemapIndex = 0;





// ======================================================
// COORDINATE VALIDATION
// ------------------------------------------------------
// A missing coordinate becomes NaN, and NaN !== 0, so the old
// "is it zero" check let it through - then Leaflet threw
// "Invalid LatLng" and took the whole map down with it. Range
// is checked too, since a transposed pair can otherwise put a
// shipment somewhere impossible.
// ======================================================


function isValidCoordinate(lat, lng){

    return Number.isFinite(lat) &&
           Number.isFinite(lng) &&
           Math.abs(lat) <= 90 &&
           Math.abs(lng) <= 180 &&
           !(lat === 0 && lng === 0);

}


function readCoordinate(latValue, lngValue){

    const lat = Number(latValue);

    const lng = Number(lngValue);

    return isValidCoordinate(lat, lng) ? [lat, lng] : null;

}



// ======================================================
// MAP STATUS MESSAGE
// Replaces the silent blank panel when tiles cannot load.
// ======================================================


function showMapMessage(text){

    const mapElement = document.getElementById("trackingMap");

    if(!mapElement) return;

    let banner = document.getElementById("trackingMapMessage");

    if(!banner){

        banner = document.createElement("div");

        banner.id = "trackingMapMessage";

        banner.className = "tracking-map-message";

        mapElement.appendChild(banner);

    }

    banner.textContent = text;

    banner.hidden = false;

}


function hideMapMessage(){

    const banner = document.getElementById("trackingMapMessage");

    if(banner) banner.hidden = true;

}



// ======================================================
// ATTACH A BASEMAP, FALLING BACK ON REPEATED FAILURE
// ======================================================


function removeBasemapLayers(){

    if(basemapLayer){

        trackingMap.removeLayer(basemapLayer);

        basemapLayer = null;

    }

    if(basemapLabels){

        trackingMap.removeLayer(basemapLabels);

        basemapLabels = null;

    }

}


function attachBasemap(index){

    if(!trackingMap) return;

    const provider = BASEMAP_PROVIDERS[index];

    if(!provider){

        showMapMessage(
            "Map imagery is unavailable right now. Shipment details and coordinates below are unaffected."
        );

        return;

    }

    basemapIndex = index;

    removeBasemapLayers();

    let failures = 0;

    let switched = false;

    basemapLayer = L.tileLayer(provider.url, provider.options);

    basemapLayer.on("tileerror", () => {

        failures += 1;

        if(failures >= TILE_FAILURES_BEFORE_FALLBACK && !switched){

            switched = true;

            console.warn(
                "Tracking map: " + provider.name +
                " failed to serve tiles - trying the next provider."
            );

            attachBasemap(index + 1);

        }

    });

    basemapLayer.on("load", hideMapMessage);

    basemapLayer.addTo(trackingMap);


    // Place names ride above the base. A failure here is not
    // worth falling back over - an unlabelled map still works.
    if(provider.labelsUrl){

        basemapLabels = L.tileLayer(provider.labelsUrl, provider.options);

        basemapLabels.addTo(trackingMap);

    }

}




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



// Leaflet throws if the same container is initialised twice,
// which happens whenever tracking is re-run in the same page.
if(trackingMap){

    trackingMap.remove();

    trackingMap = null;

    basemapLayer = null;

}



if(typeof L === "undefined"){

    showMapMessage(
        "Map library could not be loaded. Shipment details and coordinates below are unaffected."
    );

    return;

}




// CREATE WORLD VIEW


trackingMap =
L.map(
"trackingMap",
{

    zoomControl:false,

    worldCopyJump:true,

    // Stops the customer scrolling out into grey emptiness.
    minZoom:2,

    maxBounds:[[-85,-180],[85,180]],

    maxBoundsViscosity:0.8

}

)
.setView(

[
20,

0

],

2

);




// Controls placed where they do not cover the route.

L.control.zoom({ position:"topright" }).addTo(trackingMap);

L.control.scale({ position:"bottomleft", imperial:true }).addTo(trackingMap);




// MAP STYLE - with automatic fallback


attachBasemap(0);




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




// Validated rather than merely non-zero. A missing value
// arrives as NaN, which the old check treated as usable and
// Leaflet then rejected, taking the whole map down.

const current = readCoordinate(
    shipmentData.currentLatitude,
    shipmentData.currentLongitude
);

const origin = readCoordinate(
    shipmentData.originLatitude,
    shipmentData.originLongitude
);

const destination = readCoordinate(
    shipmentData.destinationLatitude,
    shipmentData.destinationLongitude
);


const hasOrigin = Boolean(origin);

const hasDestination = Boolean(destination);



// Without a usable live position there is nothing to plot.
// Say so rather than leaving an unexplained empty map.

if(!current){

    showMapMessage(
        "No GPS position has been recorded for this shipment yet."
    );

    return;

}


hideMapMessage();




// CURRENT LOCATION MARKER


const liveIcon =
L.divIcon({

className:
"live-map-marker",

// 38px pulse marker, centred on the true position. Without an explicit size
// Leaflet cannot anchor a divIcon, so the marker drifts
// away from the coordinate it is meant to mark.
iconSize:[38,38],

iconAnchor:[19,19],

popupAnchor:[0,-19],



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

// 14px dot, centred. Without an explicit size
// Leaflet cannot anchor a divIcon, so the marker drifts
// away from the coordinate it is meant to mark.
iconSize:[14,14],

iconAnchor:[7,7],

popupAnchor:[0,-7],


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

// 32px flag, centred. Without an explicit size
// Leaflet cannot anchor a divIcon, so the marker drifts
// away from the coordinate it is meant to mark.
iconSize:[32,32],

iconAnchor:[16,16],

popupAnchor:[0,-16],


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