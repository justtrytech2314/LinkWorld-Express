/* ======================================================
LINKWORLD EXPRESS
PREMIUM TRACKING SYSTEM
PART 1
CORE INITIALIZATION
====================================================== */

"use strict";

/* ======================================================
API
====================================================== */

const API_URL = "https://linkworld-express3.onrender.com/api";

/* ======================================================
GLOBAL VARIABLES
====================================================== */

let trackingMap = null;
let shipmentMarker = null;
let destinationMarker = null;
let routeLine = null;
let userMarker = null;

let currentShipment = null;
let refreshTimer = null;

/* ======================================================
DOM READY
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    initializeTrackingEvents();

    requestUserLocation();

    loadTrackingFromURL();

});

/* ======================================================
INITIALIZE LEAFLET MAP
====================================================== */

function initializeMap(){

    const map = document.getElementById("trackingMap");

    if(!map){
        console.error("trackingMap not found.");
        return;
    }

    trackingMap = L.map("trackingMap",{
        zoomControl:true
    }).setView([20,0],2);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom:19,
            attribution:"© OpenStreetMap"
        }
    ).addTo(trackingMap);

}

/* ======================================================
TRACK BUTTON EVENTS
====================================================== */

function initializeTrackingEvents(){

    const button =
    document.getElementById("trackButton");

    const input =
    document.getElementById("trackingInput");

    if(button){

        button.addEventListener("click",()=>{

            startTracking();

        });

    }

    if(input){

        input.addEventListener("keypress",(event)=>{

            if(event.key==="Enter"){

                event.preventDefault();

                startTracking();

            }

        });

    }

}

/* ======================================================
START TRACKING
====================================================== */

function startTracking(){

    const input =
    document.getElementById("trackingInput");

    const trackingNumber =
    input.value.trim().toUpperCase();

    if(!trackingNumber){

        Swal.fire({

            icon:"warning",

            title:"Tracking Number Required",

            text:"Please enter your tracking number."

        });

        return;

    }

    localStorage.setItem(
        "lastTrackingNumber",
        trackingNumber
    );

    loadShipment(trackingNumber);

}

/* ======================================================
LOAD TRACKING FROM URL
tracking.html?tracking=LWX202600001
====================================================== */

function loadTrackingFromURL(){

    const params =
    new URLSearchParams(window.location.search);

    const tracking =
    params.get("tracking");

    if(tracking){

        document.getElementById(
            "trackingInput"
        ).value = tracking;

        loadShipment(
            tracking.toUpperCase()
        );

        return;

    }

    const last =
    localStorage.getItem(
        "lastTrackingNumber"
    );

    if(last){

        document.getElementById(
            "trackingInput"
        ).value = last;

    }

}

/* ======================================================
USER LOCATION
====================================================== */

function requestUserLocation(){

    if(!navigator.geolocation){

        return;

    }

    navigator.geolocation.getCurrentPosition(

        position=>{

            const lat =
            position.coords.latitude;

            const lng =
            position.coords.longitude;

            showUserLocation(lat,lng);

        },

        ()=>{

            console.log("User location unavailable.");

        },

        {

            enableHighAccuracy:true,

            timeout:10000

        }

    );

}

/* ======================================================
SHOW USER LOCATION
====================================================== */

function showUserLocation(lat,lng){

    if(!trackingMap) return;

    if(userMarker){

        trackingMap.removeLayer(userMarker);

    }

    userMarker = L.circleMarker(

        [lat,lng],

        {

            radius:8,

            color:"#ffffff",

            fillColor:"#0066ff",

            fillOpacity:1,

            weight:3

        }

    ).addTo(trackingMap);

    userMarker.bindPopup(

        "<strong>Your Location</strong>"

    );

}

/* ======================================================
SHIPMENT ICON
====================================================== */

function createShipmentIcon(){

    return L.divIcon({

        className:"",

        html:`

        <div class="live-marker">

            <div class="live-pulse"></div>

            <div class="live-dot"></div>

        </div>

        `,

        iconSize:[40,40],

        iconAnchor:[20,20]

    });

}

/* ======================================================
END PART 1
====================================================== */
/* ======================================================
LINKWORLD EXPRESS
PREMIUM TRACKING SYSTEM
PART 2
LOAD SHIPMENT + AUTO REFRESH
====================================================== */

/* ======================================================
LOAD SHIPMENT
GET /api/shipments/track/:trackingNumber
====================================================== */

async function loadShipment(trackingNumber){

    try{

        await showPremiumLoading();

        const response = await fetch(

            `${API_URL}/shipments/track/${trackingNumber}`

        );

        const data = await response.json();

        if(!response.ok || !data.success){

            throw new Error(

                data.message ||

                "Tracking number not found."

            );

        }

        currentShipment = data.shipment;

        displayShipment(currentShipment);

        startAutoRefresh(trackingNumber);

    }

    catch(error){

        console.error(error);

        clearTrackingDisplay();

        Swal.fire({

            icon:"error",

            title:"Shipment Not Found",

            text:error.message

        });

    }

}

/* ======================================================
AUTO REFRESH
====================================================== */

function startAutoRefresh(trackingNumber){

    if(refreshTimer){

        clearInterval(refreshTimer);

    }

    refreshTimer = setInterval(async()=>{

        try{

            const response = await fetch(

                `${API_URL}/shipments/track/${trackingNumber}`

            );

            const data = await response.json();

            if(data.success){

                currentShipment = data.shipment;

                displayShipment(currentShipment);

            }

        }

        catch(error){

            console.log("Live refresh failed.");

        }

    },30000);

}

/* ======================================================
CLEAR DISPLAY
====================================================== */

function clearTrackingDisplay(){

    const ids=[

        "shipmentStatus",

        "currentPackageLocation",

        "estimatedArrival",

        "shipmentLastUpdated",

        "trackingNumberDisplay",

        "shipmentDisplay",

        "senderDisplay",

        "receiverDisplay",

        "originDisplay",

        "destinationDisplay",

        "detailsSender",

        "detailsReceiver",

        "detailsOrigin",

        "detailsDestination",

        "detailsTrackingNumber",

        "detailsShipmentType",

        "detailsStatus",

        "detailsCurrentLocation",

        "detailsCurrentLatitude",

        "detailsCurrentLongitude",

        "destinationLatitude",

        "destinationLongitude",

        "destinationCity",

        "progressPercentage",

        "etaDetails",

        "lastUpdatedDetails",

        "createdDate",

        "expectedDelivery",

        "currentLocationTimeline"

    ];

    ids.forEach(id=>{

        const element=document.getElementById(id);

        if(element){

            element.textContent="-";

        }

    });

    const progressBar=document.getElementById(

        "progressBar"

    );

    if(progressBar){

        progressBar.style.width="0%";

    }

    const progressText=document.getElementById(

        "progressText"

    );

    if(progressText){

        progressText.textContent="0%";

    }

}

/* ======================================================
STOP AUTO REFRESH
====================================================== */

function stopAutoRefresh(){

    if(refreshTimer){

        clearInterval(refreshTimer);

        refreshTimer=null;

    }

}

/* ======================================================
PAGE EXIT
====================================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        stopAutoRefresh();

    }

);

/* ======================================================
END PART 2
====================================================== */
/* ======================================================
LINKWORLD EXPRESS
PREMIUM TRACKING SYSTEM
PART 3
DISPLAY SHIPMENT + LIVE MAP
====================================================== */

/* ======================================================
DISPLAY SHIPMENT
====================================================== */

function displayShipment(shipment){

    if(!shipment) return;

    // ===============================
    // MAIN STATUS
    // ===============================

    setText("shipmentStatus", shipment.status);

    setText("currentPackageLocation", shipment.currentLocation);

    setText(
        "estimatedArrival",
        formatDate(shipment.expectedDelivery)
    );

    setText(
        "shipmentLastUpdated",
        formatDateTime(shipment.updatedAt)
    );

    // ===============================
    // OVERVIEW
    // ===============================

    setText(
        "trackingNumberDisplay",
        shipment.trackingNumber
    );

    setText(
        "shipmentDisplay",
        shipment.shipmentDescription ||
        shipment.shipmentType
    );

    setText(
        "senderDisplay",
        shipment.sender?.name
    );

    setText(
        "receiverDisplay",
        shipment.receiver?.name
    );

    setText(
        "originDisplay",
        shipment.origin
    );

    setText(
        "destinationDisplay",
        shipment.destination
    );

    // ===============================
    // DETAILS
    // ===============================

    setText(
        "detailsSender",
        shipment.sender?.name
    );

    setText(
        "detailsReceiver",
        shipment.receiver?.name
    );

    setText(
        "detailsOrigin",
        shipment.origin
    );

    setText(
        "detailsDestination",
        shipment.destination
    );

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

    setText(
        "destinationLatitude",
        shipment.destinationLatitude
    );

    setText(
        "destinationLongitude",
        shipment.destinationLongitude
    );

    setText(
        "destinationCity",
        shipment.destination
    );

    setText(
        "progressPercentage",
        `${shipment.progress || 0}%`
    );

    setText(
        "etaDetails",
        formatDate(shipment.expectedDelivery)
    );

    setText(
        "lastUpdatedDetails",
        formatDateTime(shipment.updatedAt)
    );

    setText(
        "createdDate",
        formatDate(shipment.createdAt)
    );

    setText(
        "expectedDelivery",
        formatDate(shipment.expectedDelivery)
    );

    setText(
        "currentLocationTimeline",
        shipment.currentLocation
    );

    updateProgressBar(
        shipment.progress || 0
    );

    updateShipmentMap(shipment);

}

/* ======================================================
UPDATE MAP
====================================================== */

function updateShipmentMap(shipment){

    if(!trackingMap) return;

    const lat =
    Number(shipment.currentLatitude);

    const lng =
    Number(shipment.currentLongitude);

    if(isNaN(lat) || isNaN(lng)){

        return;

    }

    const destinationLat =
    Number(shipment.destinationLatitude);

    const destinationLng =
    Number(shipment.destinationLongitude);

    // Shipment Marker

    if(!shipmentMarker){

        shipmentMarker = L.marker(

            [lat,lng],

            {

                icon:createShipmentIcon()

            }

        ).addTo(trackingMap);

    }

    else{

        shipmentMarker.setLatLng([lat,lng]);

    }

    shipmentMarker.bindPopup(

        `<strong>${shipment.currentLocation}</strong><br>Current Shipment Location`

    );

    // Destination Marker

    if(

        !isNaN(destinationLat) &&

        !isNaN(destinationLng)

    ){

        if(!destinationMarker){

            destinationMarker =

            L.marker([

                destinationLat,

                destinationLng

            ]).addTo(trackingMap);

        }

        else{

            destinationMarker.setLatLng([

                destinationLat,

                destinationLng

            ]);

        }

    }

    // Route Line

    if(routeLine){

        trackingMap.removeLayer(routeLine);

    }

    if(

        !isNaN(destinationLat) &&

        !isNaN(destinationLng)

    ){

        routeLine =

        L.polyline(

            [

                [lat,lng],

                [

                    destinationLat,

                    destinationLng

                ]

            ],

            {

                color:"#007bff",

                weight:4,

                opacity:0.8,

                dashArray:"8"

            }

        ).addTo(trackingMap);

    }

    // Fit Bounds

    const layers=[];

    if(shipmentMarker) layers.push(shipmentMarker);

    if(destinationMarker) layers.push(destinationMarker);

    if(userMarker) layers.push(userMarker);

    if(layers.length){

        const group =

        L.featureGroup(layers);

        trackingMap.fitBounds(

            group.getBounds(),

            {

                padding:[60,60]

            }

        );

    }

}

/* ======================================================
UPDATE PROGRESS
====================================================== */

function updateProgressBar(progress){

    const bar =
    document.getElementById("progressBar");

    if(bar){

        bar.style.width = progress + "%";

    }

    setText(

        "progressText",

        progress + "%"

    );

}

/* ======================================================
TEXT HELPER
====================================================== */

function setText(id,value){

    const element =
    document.getElementById(id);

    if(!element) return;

    element.textContent = value || "-";

}

/* ======================================================
DATE FORMAT
====================================================== */

function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleDateString(

        "en-US",

        {

            year:"numeric",

            month:"short",

            day:"numeric"

        }

    );

}

/* ======================================================
DATE TIME FORMAT
====================================================== */

function formatDateTime(date){

    if(!date) return "-";

    return new Date(date).toLocaleString(

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

/* ======================================================
END PART 3
====================================================== */
/* ======================================================
LINKWORLD EXPRESS
PREMIUM TRACKING SYSTEM
PART 4
STATUS COLORS + TIMELINE + CONNECTION + MAP HELPERS
====================================================== */

/* ======================================================
UPDATE STATUS COLOR
====================================================== */

function updateStatusAppearance(status){

    const statusElement =
    document.getElementById("shipmentStatus");

    if(!statusElement) return;

    statusElement.classList.remove(

        "status-created",
        "status-transit",
        "status-delivered",
        "status-pending"

    );

    if(!status){

        statusElement.classList.add("status-created");

        return;

    }

    const value = status.toLowerCase();

    if(value.includes("deliver")){

        statusElement.classList.add("status-delivered");

    }

    else if(

        value.includes("transit") ||

        value.includes("picked") ||

        value.includes("pickup") ||

        value.includes("processing") ||

        value.includes("facility")

    ){

        statusElement.classList.add("status-transit");

    }

    else{

        statusElement.classList.add("status-created");

    }

}


/* ======================================================
UPDATE TIMELINE
====================================================== */

function updateTimeline(status){

    const steps =

    document.querySelectorAll(".journey-step");

    if(!steps.length) return;

    steps.forEach(step=>{

        step.classList.remove(

            "completed",

            "active"

        );

    });

    let currentStep = 0;

    switch((status || "").toLowerCase()){

        case "created":
            currentStep = 0;
            break;

        case "picked up":
            currentStep = 1;
            break;

        case "processing":
            currentStep = 2;
            break;

        case "in transit":
            currentStep = 3;
            break;

        case "destination facility":
            currentStep = 4;
            break;

        case "out for delivery":
            currentStep = 5;
            break;

        case "delivered":
            currentStep = 6;
            break;

        default:
            currentStep = 0;

    }

    steps.forEach((step,index)=>{

        if(index < currentStep){

            step.classList.add("completed");

        }

        if(index === currentStep){

            step.classList.add("active");

        }

    });

}


/* ======================================================
UPDATE CONNECTION STATUS
====================================================== */

function updateConnectionStatus(){

    const indicator =

    document.querySelector(

        ".tracking-live-indicator"

    );

    if(!indicator) return;

    if(navigator.onLine){

        indicator.innerHTML = `

            <span class="live-dot"></span>

            LIVE TRACKING

        `;

    }

    else{

        indicator.innerHTML = `

            <span class="live-dot offline"></span>

            OFFLINE

        `;

    }

}


/* ======================================================
MAP RESIZE FIX
====================================================== */

window.addEventListener(

    "resize",

    ()=>{

        if(trackingMap){

            setTimeout(()=>{

                trackingMap.invalidateSize();

            },300);

        }

    }

);


/* ======================================================
PATCH DISPLAY SHIPMENT
====================================================== */

const originalDisplayShipment = displayShipment;

displayShipment = function(shipment){

    originalDisplayShipment(shipment);

    updateStatusAppearance(

        shipment.status

    );

    updateTimeline(

        shipment.status

    );

};


/* ======================================================
ONLINE / OFFLINE EVENTS
====================================================== */

window.addEventListener(

    "online",

    updateConnectionStatus

);

window.addEventListener(

    "offline",

    updateConnectionStatus

);


/* ======================================================
INITIALIZE STATUS
====================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        updateConnectionStatus();

    }

);


/* ======================================================
END PART 4
====================================================== */
/* ======================================================
LINKWORLD EXPRESS
PREMIUM TRACKING SYSTEM
PART 5
PREMIUM LOADING + STARTUP + FINAL
====================================================== */

/* ======================================================
LOADING ELEMENTS
====================================================== */

const loadingOverlay =
document.getElementById("trackingLoading");

const loadingBar =
document.getElementById("loadingProgressBar");

const loadingPercent =
document.getElementById("loadingPercent");

const loadingMessage =
document.getElementById("loadingMessage");

const loadingTitle =
document.getElementById("loadingTitle");

const loadingSteps=[

document.getElementById("step1"),

document.getElementById("step2"),

document.getElementById("step3"),

document.getElementById("step4"),

document.getElementById("step5"),

document.getElementById("step6"),

document.getElementById("step7"),

document.getElementById("step8")

];


/* ======================================================
LOADING MESSAGES
====================================================== */

const loadingMessages=[

"Checking registered shipment...",

"Connecting with LinkWorld Express servers...",

"Verifying shipment information...",

"Connecting to GPS satellites...",

"Synchronizing global logistics network...",

"Finding current shipment location...",

"Building live tracking map...",

"Loading shipment information..."

];


/* ======================================================
PREMIUM LOADING SCREEN
====================================================== */

async function showPremiumLoading(){

    if(!loadingOverlay){

        return;

    }

    loadingOverlay.classList.add("show");

    loadingTitle.textContent="Initializing Secure Tracking";

    loadingBar.style.width="0%";

    loadingPercent.textContent="0%";

    loadingSteps.forEach(step=>{

        if(step){

            step.classList.remove("active");

        }

    });

    for(let i=0;i<loadingMessages.length;i++){

        if(loadingSteps[i]){

            loadingSteps[i].classList.add("active");

        }

        loadingMessage.textContent=

        loadingMessages[i];

        const percent=Math.round(

            ((i+1)/loadingMessages.length)*100

        );

        loadingBar.style.width=

        percent+"%";

        loadingPercent.textContent=

        percent+"%";

        await new Promise(resolve=>{

            setTimeout(resolve,350);

        });

    }

    await new Promise(resolve=>{

        setTimeout(resolve,300);

    });

    loadingOverlay.classList.remove("show");

}


/* ======================================================
SAVE LAST SEARCH
====================================================== */

function saveLastTrackingNumber(number){

    localStorage.setItem(

        "lastTrackingNumber",

        number

    );

}


/* ======================================================
AUTO LOAD LAST SEARCH
====================================================== */

function restoreLastTrackingNumber(){

    const last=

    localStorage.getItem(

        "lastTrackingNumber"

    );

    if(!last) return;

    const input=

    document.getElementById(

        "trackingInput"

    );

    if(input){

        input.value=last;

    }

}


/* ======================================================
STARTUP
====================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        restoreLastTrackingNumber();

        updateConnectionStatus();

        console.log(

            "LinkWorld Express Premium Tracking Ready"

        );

    }

);


/* ======================================================
GLOBAL ERROR HANDLER
====================================================== */

window.addEventListener(

    "error",

    function(event){

        console.error(

            "Tracking Error:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    function(event){

        console.error(

            "Promise Error:",

            event.reason

        );

    }

);


/* ======================================================
PATCH START TRACKING
====================================================== */

const originalStartTracking = startTracking;

startTracking = function(){

    const trackingNumber =

    document.getElementById(

        "trackingInput"

    ).value.trim().toUpperCase();

    if(trackingNumber){

        saveLastTrackingNumber(

            trackingNumber

        );

    }

    originalStartTracking();

};


/* ======================================================
END PART 5
====================================================== */
