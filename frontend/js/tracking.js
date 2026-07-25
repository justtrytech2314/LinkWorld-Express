// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 1
// ======================================================

// ==============================
// API
// ==============================

const API_URL =
"http://localhost:5000/api/shipments";

// ==============================
// GLOBAL VARIABLES
// ==============================

let shipment = null;

let map = null;

let packageMarker = null;

let refreshTimer = null;

// ==============================
// LOADER
// ==============================

const trackingLoader =
document.getElementById("trackingLoader");

const loaderBar =
document.getElementById("loaderBar");

const loaderPercent =
document.getElementById("loaderPercent");

const loaderMessage =
document.getElementById("loaderMessage");

// ==============================
// LOCATION PERMISSION
// ==============================

const permissionPopup =
document.getElementById("locationPermission");

const allowLocation =
document.getElementById("allowLocation");

const skipLocation =
document.getElementById("skipLocation");

// ==============================
// START
// ==============================

window.addEventListener("load", () => {

    showLoader();

});

// ==============================
// SHOW LOADER
// ==============================

function showLoader(){

    trackingLoader.style.display="flex";

    const steps=[

        {
            percent:15,
            text:"Connecting to LinkWorld Server..."
        },

        {
            percent:35,
            text:"Loading Shipment..."
        },

        {
            percent:55,
            text:"Loading Timeline..."
        },

        {
            percent:75,
            text:"Preparing Live Map..."
        },

        {
            percent:100,
            text:"Starting Live Tracking..."
        }

    ];

    let index=0;

    const timer=setInterval(()=>{

        loaderBar.style.width=
        steps[index].percent+"%";

        loaderPercent.innerHTML=
        steps[index].percent+"%";

        loaderMessage.innerHTML=
        steps[index].text;

        index++;

        if(index===steps.length){

            clearInterval(timer);

            setTimeout(()=>{

                trackingLoader.style.display="none";

                askLocationPermission();

            },700);

        }

    },500);

}

// ==============================
// LOCATION PERMISSION
// ==============================

function askLocationPermission(){

    permissionPopup.style.display="flex";

}

allowLocation.onclick=()=>{

    permissionPopup.style.display="none";

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(

            ()=>{

                loadShipment();

            },

            ()=>{

                loadShipment();

            }

        );

    }

    else{

        loadShipment();

    }

};

skipLocation.onclick=()=>{

    permissionPopup.style.display="none";

    loadShipment();

};

// ==============================
// LOAD SHIPMENT
// ==============================

async function loadShipment(){

    try{

        const savedShipment =
        JSON.parse(
            localStorage.getItem("shipment")
        );

        if(!savedShipment){

            alert("Shipment not found.");

            window.location.href="index.html";

            return;

        }

        const trackingNumber =
        savedShipment.trackingNumber;

        const response =
        await fetch(
            `${API_URL}/track/${trackingNumber}`
        );

        const result =
        await response.json();

        if(!result.success){

            alert(result.message);

            window.location.href="index.html";

            return;

        }

        shipment=result.data;

        localStorage.setItem(

            "shipment",

            JSON.stringify(shipment)

        );

        initializeTracking();

    }

    catch(error){

        console.error(error);

        alert("Unable to connect to server.");

        window.location.href="index.html";

    }

}
// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 2
// ======================================================

// ==============================
// INITIALIZE PAGE
// ==============================

function initializeTracking(){

    updateShipmentInformation();

    updateProgress();

    updateStatusCards();

    buildTimeline();

    initializeMap();

    startAutoRefresh();

}

// ==============================
// UPDATE SHIPMENT DETAILS
// ==============================

function updateShipmentInformation(){

    setValue(
        "summaryTrackingNumber",
        shipment.trackingNumber
    );

    setValue(
        "summaryStatus",
        shipment.status
    );

    setValue(
        "statusBadge",
        shipment.status
    );

    setValue(
        "sender",
        shipment.sender
    );

    setValue(
        "receiver",
        shipment.receiver
    );

    setValue(
        "origin",
        shipment.origin
    );

    setValue(
        "currentLocation",
        shipment.currentLocation
    );

    setValue(
        "destination",
        shipment.destination
    );

    setValue(
        "weight",
        shipment.weight || "N/A"
    );

    setValue(
        "deliveryDate",
        shipment.expectedDelivery || "Pending"
    );

    setValue(
        "deliveryMethod",
        shipment.deliveryMethod || "Air Freight"
    );

    setValue(
        "customsOffice",
        shipment.customsOffice || "Awaiting Customs"
    );

    setValue(
        "packageType",
        shipment.packageType || "Standard Shipment"
    );

    setValue(
        "lastUpdated",
        formatDate(
            shipment.updatedAt
        )
    );

    setValue(
        "lastUpdatedTime",
        formatDate(
            shipment.updatedAt
        )
    );

}

// ==============================
// UPDATE PROGRESS
// ==============================

function updateProgress(){

    const progress =
    Number(shipment.progress || 0);

    document
    .getElementById(
        "progressFill"
    )
    .style.width =
    progress + "%";

    setValue(

        "progressText",

        progress + "%"

    );

    setValue(

        "currentStage",

        shipment.status

    );

    setValue(

        "eta",

        shipment.expectedDelivery || "Pending"

    );

}

// ==============================
// STATUS CARDS
// ==============================

function updateStatusCards(){

    setValue(

        "mapStatus",

        shipment.status

    );

    setValue(

        "mapLocation",

        shipment.currentLocation

    );

    setValue(

        "mapUpdated",

        formatDate(
            shipment.updatedAt
        )

    );

    setValue(

        "packageCountry",

        shipment.currentLocation

    );

    setValue(

        "packageCity",

        shipment.currentLocation

    );

    setValue(

        "currentCountry",

        shipment.currentLocation

    );

    document
    .getElementById(
        "shipmentDescription"
    )
    .innerHTML =

    "Your shipment is currently <b>" +

    shipment.status +

    "</b> and is located in <b>" +

    shipment.currentLocation +

    "</b>. Live tracking is active.";

}

// ==============================
// HELPERS
// ==============================

function setValue(id,value){

    const el =
    document.getElementById(id);

    if(el){

        el.innerHTML =
        value || "N/A";

    }

}

function formatDate(date){

    if(!date){

        return "Just Now";

    }

    return new Date(date)
    .toLocaleString();

}
// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 3
// LIVE SHIPMENT JOURNEY
// ======================================================

// ==========================================
// BUILD TIMELINE
// ==========================================

function buildTimeline(){

    const timeline =
    document.getElementById("timeline");

    if(!timeline) return;

    timeline.innerHTML = "";

    // If no history exists create one
    if(
        !shipment.history ||
        shipment.history.length===0
    ){

        shipment.history=[{

            location:
            shipment.currentLocation,

            status:
            shipment.status,

            date:
            shipment.updatedAt

        }];

    }

    shipment.history.forEach(

        (item,index)=>{

            const card =
            document.createElement("div");

            card.className =
            "timeline-item active";

            card.innerHTML=`

            <div class="timeline-left">

                <div class="timeline-circle">

                    <i class="${getStatusIcon(item.status)}"></i>

                </div>

                ${
                    index!==shipment.history.length-1
                    ?
                    '<div class="timeline-line"></div>'
                    :
                    ''
                }

            </div>

            <div class="timeline-right">

                <h3>

                    ${item.status}

                </h3>

                <p>

                    ${item.location}

                </p>

                <small>

                    ${formatDate(item.date)}

                </small>

            </div>

            `;

            timeline.appendChild(card);

        }

    );

}

// ==========================================
// STATUS ICON
// ==========================================

function getStatusIcon(status){

    status =
    (status || "").toLowerCase();

    if(status.includes("created"))
        return "fa-solid fa-box";

    if(status.includes("picked"))
        return "fa-solid fa-truck";

    if(status.includes("processing"))
        return "fa-solid fa-warehouse";

    if(status.includes("transit"))
        return "fa-solid fa-plane";

    if(status.includes("custom"))
        return "fa-solid fa-building-shield";

    if(status.includes("destination"))
        return "fa-solid fa-location-dot";

    if(status.includes("delivery"))
        return "fa-solid fa-truck-fast";

    if(status.includes("delivered"))
        return "fa-solid fa-circle-check";

    if(status.includes("hold"))
        return "fa-solid fa-circle-pause";

    if(status.includes("cancel"))
        return "fa-solid fa-circle-xmark";

    return "fa-solid fa-box";

}

// ==========================================
// AUTO UPDATE TIMELINE
// ==========================================

function refreshTimeline(){

    buildTimeline();

}

// ==========================================
// SHIPMENT STATUS COLOR
// ==========================================

function updateBadgeColor(){

    const badge =
    document.getElementById(
        "statusBadge"
    );

    if(!badge) return;

    badge.className =
    "status-badge";

    const status =
    shipment.status.toLowerCase();

    if(status.includes("transit")){

        badge.classList.add(
            "transit"
        );

    }

    else if(status.includes("deliver")){

        badge.classList.add(
            "delivered"
        );

    }

    else if(status.includes("hold")){

        badge.classList.add(
            "hold"
        );

    }

    else{

        badge.classList.add(
            "processing"
        );

    }

}
// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 4
// LIVE PACKAGE MAP
// ======================================================

// ==========================================
// INITIALIZE LIVE MAP
// ==========================================

function initializeMap(){

    if(!shipment.currentLatitude ||
       !shipment.currentLongitude){

        document.getElementById("map").innerHTML =

        "<div style='padding:40px;text-align:center;'>Current package location is unavailable.</div>";

        return;

    }

    // Remove old map if refreshing

    if(map){

        map.remove();

    }

    // Create map

    map = L.map("map",{

        zoomControl:true,

        attributionControl:true

    }).setView(

        [

            Number(shipment.currentLatitude),

            Number(shipment.currentLongitude)

        ],

        6

    );

    // OpenStreetMap

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:19,

            attribution:"© OpenStreetMap"

        }

    ).addTo(map);

    // Build package marker

    createPackageMarker();

}

// ==========================================
// CREATE RED PACKAGE MARKER
// ==========================================

function createPackageMarker(){

    const packageIcon =

    L.divIcon({

        className:"",

        html:`

        <div class="package-marker">

            <div class="pulse"></div>

            <div class="dot"></div>

        </div>

        `,

        iconSize:[26,26],

        iconAnchor:[13,13]

    });

    packageMarker =

    L.marker(

        [

            Number(shipment.currentLatitude),

            Number(shipment.currentLongitude)

        ],

        {

            icon:packageIcon

        }

    )

    .addTo(map);

    packageMarker.bindPopup(

        `

        <div style="min-width:220px">

            <h3 style="margin-bottom:8px">

            📦 Package Location

            </h3>

            <b>Status:</b>

            ${shipment.status}

            <br><br>

            <b>Current Location:</b>

            ${shipment.currentLocation}

            <br><br>

            <b>Tracking Number:</b>

            ${shipment.trackingNumber}

        </div>

        `

    );

    packageMarker.openPopup();

}

// ==========================================
// MOVE PACKAGE WHEN ADMIN UPDATES LOCATION
// ==========================================

function updatePackageMarker(){

    if(!packageMarker) return;

    packageMarker.setLatLng([

        Number(shipment.currentLatitude),

        Number(shipment.currentLongitude)

    ]);

    packageMarker.setPopupContent(

        `

        <div style="min-width:220px">

            <h3 style="margin-bottom:8px">

            📦 Package Location

            </h3>

            <b>Status:</b>

            ${shipment.status}

            <br><br>

            <b>Current Location:</b>

            ${shipment.currentLocation}

            <br><br>

            <b>Tracking Number:</b>

            ${shipment.trackingNumber}

        </div>

        `

    );

    map.panTo([

        Number(shipment.currentLatitude),

        Number(shipment.currentLongitude)

    ],{

        animate:true,

        duration:1.2

    });

}

// ==========================================
// AUTO REFRESH MAP
// ==========================================

function refreshMap(){

    updatePackageMarker();

}
// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 5
// AUTO REFRESH & LIVE DATABASE UPDATES
// ======================================================

// ==========================================
// START LIVE REFRESH
// ==========================================

function startAutoRefresh(){

    // Prevent duplicate timers

    if(refreshTimer){

        clearInterval(refreshTimer);

    }

    refreshTimer = setInterval(

        refreshShipment,

        30000 // every 30 seconds

    );

}

// ==========================================
// REFRESH SHIPMENT
// ==========================================

async function refreshShipment(){

    try{

        const response = await fetch(

            `${API_URL}/track/${shipment.trackingNumber}`

        );

        const result = await response.json();

        if(!result.success){

            return;

        }

        shipment = result.data;

        localStorage.setItem(

            "shipment",

            JSON.stringify(shipment)

        );

        // =============================
        // UPDATE ENTIRE PAGE
        // =============================

        updateShipmentInformation();

        updateProgress();

        updateStatusCards();

        refreshTimeline();

        updateBadgeColor();

        refreshMap();

        animateProgressBar();

    }

    catch(error){

        console.log(

            "Live refresh failed.",

            error

        );

    }

}

// ==========================================
// ANIMATE PROGRESS BAR
// ==========================================

function animateProgressBar(){

    const progressFill =

    document.getElementById(

        "progressFill"

    );

    if(!progressFill) return;

    progressFill.style.transition =

    "width .8s ease";

    progressFill.style.width =

    shipment.progress + "%";

}

// ==========================================
// PAGE VISIBILITY
// ==========================================

// Pause refresh if page hidden

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.hidden){

            clearInterval(refreshTimer);

        }

        else{

            startAutoRefresh();

            refreshShipment();

        }

    }

);

// ==========================================
// ONLINE STATUS
// ==========================================

window.addEventListener(

    "online",

    ()=>{

        refreshShipment();

    }

);

// ==========================================
// BEFORE LEAVING PAGE
// ==========================================

window.addEventListener(

    "beforeunload",

    ()=>{

        clearInterval(refreshTimer);

    }

);

// ==========================================
// LIVE CLOCK
// ==========================================

setInterval(()=>{

    const now = new Date();

    const mapUpdated =

    document.getElementById(

        "mapUpdated"

    );

    if(mapUpdated && shipment){

        mapUpdated.innerHTML =

        formatDate(

            shipment.updatedAt

        );

    }

},1000);
// ======================================================
// LINKWORLD EXPRESS
// LIVE TRACKING SYSTEM
// tracking.js
// PART 6
// FINAL INITIALIZATION
// ======================================================

// ==========================================
// PAGE ANIMATIONS
// ==========================================

function animateCards(){

    const cards = document.querySelectorAll(

        ".info-card,.summary-box,.status-card,.progress-box,.timeline-item"

    );

    cards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(20px)";

        setTimeout(()=>{

            card.style.transition=

            "all .5s ease";

            card.style.opacity="1";

            card.style.transform="translateY(0px)";

        },index*80);

    });

}

// ==========================================
// STATUS BADGE STYLES
// ==========================================

function updateStatusBadge(){

    const badge =

    document.getElementById(

        "statusBadge"

    );

    if(!badge) return;

    badge.className="status-badge";

    const status=

    shipment.status.toLowerCase();

    if(status.includes("delivered")){

        badge.style.background="#16a34a";

    }

    else if(status.includes("transit")){

        badge.style.background="#2563eb";

    }

    else if(status.includes("custom")){

        badge.style.background="#ea580c";

    }

    else if(status.includes("hold")){

        badge.style.background="#dc2626";

    }

    else{

        badge.style.background="#0f766e";

    }

}

// ==========================================
// PAGE TITLE
// ==========================================

function updatePageTitle(){

    document.title=

    shipment.trackingNumber+

    " | LinkWorld Express";

}

// ==========================================
// SAVE LATEST SHIPMENT
// ==========================================

function saveShipment(){

    localStorage.setItem(

        "shipment",

        JSON.stringify(shipment)

    );

}

// ==========================================
// COMPLETE REFRESH
// ==========================================

function refreshEntirePage(){

    updateShipmentInformation();

    updateProgress();

    updateStatusCards();

    buildTimeline();

    updateStatusBadge();

    refreshMap();

    animateProgressBar();

    saveShipment();

}

// ==========================================
// INITIALIZATION
// ==========================================

window.addEventListener(

    "load",

    ()=>{

        animateCards();

        updatePageTitle();

    }

);

// ==========================================
// ESC CLOSES POPUPS
// ==========================================

document.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            if(packageMarker){

                packageMarker.closePopup();

            }

        }

    }

);

// ==========================================
// MAP RESIZE FIX
// ==========================================

window.addEventListener(

    "resize",

    ()=>{

        if(map){

            setTimeout(()=>{

                map.invalidateSize();

            },300);

        }

    }

);

// ==========================================
// FINAL SUCCESS MESSAGE
// ==========================================

console.log(

    "%cLinkWorld Express Live Tracking Loaded",

    "color:#0f62fe;font-size:16px;font-weight:bold;"

);

console.log(

    "Live Shipment Tracking Ready."

);