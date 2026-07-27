// ======================================================
// LINKWORLD EXPRESS
// tracking.js
// PART 1
// CONFIGURATION • GLOBALS • INITIALIZATION
// ======================================================

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL = "https://linkworld-express2-1.onrender.com";
const API_URL = `${API_BASE_URL}/api/shipments`;

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipment = null;

let map = null;
let truckMarker = null;
let destinationMarker = null;
let routeLine = null;

let animationTimer = null;
let animationPoints = [];
let animationIndex = 0;

let trackingNumber = "";

const REFRESH_INTERVAL = 5000;

// ======================================================
// GET TRACKING NUMBER
// ======================================================

function getTrackingNumber(){

    const params = new URLSearchParams(window.location.search);

    trackingNumber = params.get("tracking") || "";

    return trackingNumber;

}

// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async function(){

        const number = getTrackingNumber();

        if(number){

            document.getElementById("trackingInput").value = number;

            await trackShipment(number);

        }

    }

);

// ======================================================
// TRACK SHIPMENT
// ======================================================

async function trackShipment(number = null){

    try{

        const tracking =

            number ||

            document.getElementById("trackingInput").value.trim();

        if(tracking === ""){

            showError("Enter a tracking number.");

            return;

        }

        showLoading("Searching shipment...");

        console.log("Calling:", `${API_URL}/track/${tracking}`);

const response = await axios.get(
    `${API_URL}/track/${tracking}`
);

console.log("Server Response:", response.data);

        shipment = response.data.data;

        hideLoading();

        displayShipment();

        initializeTracking();

    }

    catch(error){

        hideLoading();

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Tracking number not found."

        );

    }

}

// ======================================================
// INITIALIZE TRACKING
// ======================================================

function initializeTracking(){

    initMap();

    startAutoRefresh();

}

// ======================================================
// AUTO REFRESH
// ======================================================

function startAutoRefresh(){

    if(animationTimer){

        clearInterval(animationTimer);

    }

    animationTimer = setInterval(

        async function(){

            if(!shipment) return;

            await trackShipment(

                shipment.trackingNumber

            );

        },

        REFRESH_INTERVAL

    );

}

// ======================================================
// STOP AUTO REFRESH
// ======================================================

function stopAutoRefresh(){

    if(animationTimer){

        clearInterval(animationTimer);

        animationTimer = null;

    }

}

// ======================================================
// END PART 1
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// tracking.js
// PART 2
// DISPLAY SHIPMENT • PROGRESS • ETA • STATUS
// ======================================================


// ======================================================
// DISPLAY SHIPMENT
// ======================================================

function displayShipment(){

    if(!shipment) return;

    setText("trackingNumber", shipment.trackingNumber);

    setText("sender", shipment.sender);

    setText("receiver", shipment.receiver);

    setText("shipmentName", shipment.shipment);

    setText("origin", shipment.origin);

    setText("currentLocation", shipment.currentLocation);

    setText("destination", shipment.destination);

    setText("status", shipment.status);

    setText(

        "expectedDelivery",

        shipment.expectedDelivery ?

        new Date(

            shipment.expectedDelivery

        ).toLocaleDateString()

        : "-"

    );

    updateProgress();

    updateETA();

    updateLastUpdated();

    renderHistory();

}


// ======================================================
// UPDATE PROGRESS BAR
// ======================================================

function updateProgress(){

    const progress =

        shipment.progress || 0;

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

        progress + "% Completed";

    }

}


// ======================================================
// ETA
// ======================================================

function updateETA(){

    const eta =

    document.getElementById(

        "eta"

    );

    if(!eta) return;

    eta.textContent =

    calculateETA(

        shipment.progress || 0

    );

}


// ======================================================
// CALCULATE ETA
// ======================================================

function calculateETA(progress){

    if(progress >= 100){

        return "Delivered";

    }

    const remaining =

    100 - progress;

    const hours =

    Math.ceil(

        remaining / 5

    );

    if(hours < 24){

        return hours + " Hours";

    }

    return Math.ceil(

        hours / 24

    ) + " Days";

}


// ======================================================
// UPDATE LAST UPDATED
// ======================================================

function updateLastUpdated(){

    const label =

    document.getElementById(

        "lastUpdated"

    );

    if(!label) return;

    label.textContent =

    "Last Updated: "

    +

    new Date().toLocaleString();

}


// ======================================================
// ROUTE HISTORY
// ======================================================

function renderHistory(){

    const history =

    document.getElementById(

        "routeHistory"

    );

    if(!history) return;

    history.innerHTML = "";

    if(

        !shipment.route ||

        shipment.route.length===0

    ){

        history.innerHTML =

        "<p>No route history available.</p>";

        return;

    }

    shipment.route

    .slice()

    .reverse()

    .forEach(stop=>{

        history.innerHTML += `

        <div class="history-item">

            <h4>${stop.location}</h4>

            <p>${stop.status}</p>

            <small>

            ${new Date(

                stop.time

            ).toLocaleString()}

            </small>

        </div>

        `;

    });

}


// ======================================================
// SET TEXT HELPER
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
// SHOW LOADING
// ======================================================

function showLoading(text){

    const overlay =

    document.getElementById(

        "loadingOverlay"

    );

    const message =

    document.getElementById(

        "loadingText"

    );

    if(overlay){

        overlay.style.display="flex";

    }

    if(message){

        message.textContent=text;

    }

}


// ======================================================
// HIDE LOADING
// ======================================================

function hideLoading(){

    const overlay =

    document.getElementById(

        "loadingOverlay"

    );

    if(overlay){

        overlay.style.display="none";

    }

}


// ======================================================
// SUCCESS
// ======================================================

function showSuccess(message){

    Swal.fire({

        icon:"success",

        toast:true,

        timer:2500,

        position:"top-end",

        showConfirmButton:false,

        title:message

    });

}


// ======================================================
// ERROR
// ======================================================

function showError(message){

    Swal.fire({

        icon:"error",

        title:"Tracking Error",

        text:message

    });

}


// ======================================================
// END PART 2
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// tracking.js
// PART 3
// PROFESSIONAL LIVE MAP
// ======================================================


// ======================================================
// INITIALIZE LEAFLET MAP
// ======================================================

function initMap(){

    if(!shipment) return;

    if(map){

        map.remove();

    }

    map = L.map("trackingMap",{

        zoomControl:true

    });

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:19,

            attribution:"© OpenStreetMap"

        }

    ).addTo(map);

    drawShipmentRoute();

}


// ======================================================
// DRAW SHIPMENT ROUTE
// ======================================================

function drawShipmentRoute(){

    if(

        !shipment.currentLatitude ||

        !shipment.destinationLatitude

    ){

        return;

    }

    const current = [

        shipment.currentLatitude,

        shipment.currentLongitude

    ];

    const destination = [

        shipment.destinationLatitude,

        shipment.destinationLongitude

    ];

    if(routeLine){

        map.removeLayer(routeLine);

    }

    routeLine = L.polyline(

        [

            current,

            destination

        ],

        {

            color:"#0d6efd",

            weight:5,

            opacity:0.85

        }

    ).addTo(map);

    addCurrentMarker(current);

    addDestinationMarker(destination);

    map.fitBounds(

        routeLine.getBounds(),

        {

            padding:[60,60]

        }

    );

}


// ======================================================
// CURRENT LOCATION MARKER
// ======================================================

function addCurrentMarker(position){

    if(truckMarker){

        map.removeLayer(truckMarker);

    }

    const truckIcon = L.divIcon({

        html:`

        <i

        class="fa-solid fa-truck-fast"

        style="

        color:#0d6efd;

        font-size:28px;

        ">

        </i>

        `,

        className:"",

        iconSize:[30,30]

    });

    truckMarker =

    L.marker(

        position,

        {

            icon:truckIcon

        }

    )

    .addTo(map)

    .bindPopup(

        "<b>Current Shipment Location</b>"

    );

}


// ======================================================
// DESTINATION MARKER
// ======================================================

function addDestinationMarker(position){

    if(destinationMarker){

        map.removeLayer(destinationMarker);

    }

    destinationMarker =

    L.marker(position)

    .addTo(map)

    .bindPopup(

        "<b>Destination</b>"

    );

}


// ======================================================
// UPDATE TRUCK POSITION
// ======================================================

function updateTruckPosition(){

    if(

        !shipment ||

        !truckMarker

    ){

        return;

    }

    const position=[

        shipment.currentLatitude,

        shipment.currentLongitude

    ];

    truckMarker.setLatLng(position);

}


// ======================================================
// REFRESH MAP
// ======================================================

function refreshMap(){

    if(!shipment) return;

    updateTruckPosition();

    drawShipmentRoute();

}


// ======================================================
// ZOOM TO SHIPMENT
// ======================================================

function zoomToShipment(){

    if(!truckMarker) return;

    map.setView(

        truckMarker.getLatLng(),

        10,

        {

            animate:true

        }

    );

}


// ======================================================
// ZOOM TO DESTINATION
// ======================================================

function zoomToDestination(){

    if(!destinationMarker) return;

    map.setView(

        destinationMarker.getLatLng(),

        10,

        {

            animate:true

        }

    );

}


// ======================================================
// RESET MAP VIEW
// ======================================================

function resetMapView(){

    if(routeLine){

        map.fitBounds(

            routeLine.getBounds(),

            {

                padding:[60,60]

            }

        );

    }

}


// ======================================================
// END PART 3
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// tracking.js
// PART 4
// LIVE TRUCK ANIMATION & REAL-TIME SYNCHRONIZATION
// ======================================================


// ======================================================
// GLOBAL ANIMATION VARIABLES
// ======================================================

let truckRoute = [];

let truckIndex = 0;

let truckAnimation = null;


// ======================================================
// GENERATE ROUTE POINTS
// ======================================================

function generateRoutePoints(){

    if(!shipment) return [];

    const points=[];

    const steps=120;

    const startLat=Number(shipment.currentLatitude);

    const startLng=Number(shipment.currentLongitude);

    const endLat=Number(shipment.destinationLatitude);

    const endLng=Number(shipment.destinationLongitude);

    for(let i=0;i<=steps;i++){

        const percent=i/steps;

        points.push([

            startLat+(endLat-startLat)*percent,

            startLng+(endLng-startLng)*percent

        ]);

    }

    return points;

}


// ======================================================
// START TRUCK ANIMATION
// ======================================================

function startTruckAnimation(){

    if(!shipment) return;

    stopTruckAnimation();

    truckRoute=generateRoutePoints();

    truckIndex=0;

    truckAnimation=setInterval(

        animateTruck,

        700

    );

}


// ======================================================
// ANIMATE TRUCK
// ======================================================

function animateTruck(){

    if(!truckMarker) return;

    if(truckIndex>=truckRoute.length){

        stopTruckAnimation();

        deliveryCompleted();

        return;

    }

    truckMarker.setLatLng(

        truckRoute[truckIndex]

    );

    truckIndex++;

}


// ======================================================
// STOP TRUCK
// ======================================================

function stopTruckAnimation(){

    if(truckAnimation){

        clearInterval(truckAnimation);

        truckAnimation=null;

    }

}


// ======================================================
// SYNCHRONIZE WITH DASHBOARD
// ======================================================

function synchronizeShipment(){

    if(!shipment) return;

    const stored=

    JSON.parse(

        localStorage.getItem(

            "shipments"

        ) || "[]"

    );

    const latest=

    stored.find(

        s=>

        s.trackingNumber===

        shipment.trackingNumber

    );

    if(!latest) return;

    shipment=latest;

    displayShipment();

    refreshMap();

}


// ======================================================
// LIVE SYNCHRONIZATION
// ======================================================

function startSynchronization(){

    setInterval(function(){

        synchronizeShipment();

    },3000);

}


// ======================================================
// DELIVERY COMPLETED
// ======================================================

function deliveryCompleted(){

    shipment.progress=100;

    shipment.status="Delivered";

    shipment.currentLatitude=

    shipment.destinationLatitude;

    shipment.currentLongitude=

    shipment.destinationLongitude;

    shipment.currentLocation=

    shipment.destination;

    updateProgress();

    updateETA();

    Swal.fire({

        icon:"success",

        title:"Shipment Delivered",

        text:"Your package has arrived."

    });

}


// ======================================================
// REFRESH TRACKING DATA
// ======================================================

async function refreshTracking(){

    if(!shipment) return;

    try{

        const response=

        await axios.get(

            `${API_URL}/track/${shipment.trackingNumber}`

        );

        shipment=response.data.data;

        displayShipment();

        refreshMap();

    }

    catch(error){

        console.error(error);

    }

}


// ======================================================
// AUTO REFRESH SERVER
// ======================================================

setInterval(function(){

    refreshTracking();

},5000);


// ======================================================
// START EVERYTHING
// ======================================================

window.addEventListener(

    "load",

    function(){

        if(shipment){

            startTruckAnimation();

        }

        startSynchronization();

    }

);


// ======================================================
// END PART 4
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// tracking.js
// PART 5
// ROUTE HISTORY • DELIVERY EFFECTS • FINAL INITIALIZATION
// ======================================================


// ======================================================
// FOLLOW TRUCK
// ======================================================

function followTruck(){

    if(!map || !truckMarker) return;

    map.panTo(

        truckMarker.getLatLng(),

        {

            animate:true,

            duration:1

        }

    );

}


// ======================================================
// UPDATE ROUTE HISTORY
// ======================================================

function updateRouteHistory(){

    if(!shipment) return;

    const container =

    document.getElementById(

        "routeHistory"

    );

    if(!container) return;

    container.innerHTML = "";

    const history =

    shipment.route ||

    shipment.history ||

    [];

    if(history.length===0){

        container.innerHTML =

        "<p>No tracking history available.</p>";

        return;

    }

    history

    .slice()

    .reverse()

    .forEach(item=>{

        container.innerHTML += `

        <div class="history-card">

            <div class="history-dot"></div>

            <div>

                <h4>${item.location}</h4>

                <p>${item.status}</p>

                <small>

                ${new Date(

                    item.time ||

                    item.date

                ).toLocaleString()}

                </small>

            </div>

        </div>

        `;

    });

}


// ======================================================
// LIVE STATUS BADGE
// ======================================================

function updateStatusBadge(){

    const badge =

    document.getElementById(

        "status"

    );

    if(!badge) return;

    badge.textContent = shipment.status;

    badge.className = "status-badge";

    if(shipment.status==="Delivered"){

        badge.classList.add(

            "delivered"

        );

    }

    else if(

        shipment.status==="In Transit"

    ){

        badge.classList.add(

            "transit"

        );

    }

    else{

        badge.classList.add(

            "pending"

        );

    }

}


// ======================================================
// DELIVERY CELEBRATION
// ======================================================

function playDeliveryAnimation(){

    if(

        shipment.status!=="Delivered"

    ){

        return;

    }

    Swal.fire({

        icon:"success",

        title:"Package Delivered",

        html:`

        <h2>

        ${shipment.trackingNumber}

        </h2>

        <br>

        Thank you for choosing

        <b>LinkWorld Express</b>.

        `,

        confirmButtonText:"Close"

    });

}


// ======================================================
// LIVE CLOCK
// ======================================================

function updateClock(){

    const clock =

    document.getElementById(

        "liveClock"

    );

    if(!clock) return;

    clock.innerHTML =

    new Date().toLocaleString();

}

setInterval(

    updateClock,

    1000

);


// ======================================================
// AUTO FOLLOW TRUCK
// ======================================================

setInterval(function(){

    followTruck();

},1500);


// ======================================================
// COMPLETE UI REFRESH
// ======================================================

function refreshTrackingUI(){

    if(!shipment) return;

    displayShipment();

    updateProgress();

    updateETA();

    updateStatusBadge();

    updateRouteHistory();

    refreshMap();

}


// ======================================================
// STORAGE SYNC
// ======================================================

window.addEventListener(

    "storage",

    function(){

        synchronizeShipment();

    }

);


// ======================================================
// INITIAL LOAD
// ======================================================

window.addEventListener(

    "load",

    function(){

        updateClock();

        if(shipment){

            refreshTrackingUI();

            startTruckAnimation();

        }

    }

);


// ======================================================
// CLEANUP
// ======================================================

window.addEventListener(

    "beforeunload",

    function(){

        stopTruckAnimation();

        stopAutoRefresh();

    }

);


// ======================================================
// TRACK BUTTON
// ======================================================

const trackButton =

document.getElementById(

    "trackButton"

);

if(trackButton){

    trackButton.addEventListener(

        "click",

        function(){

            trackShipment();

        }

    );

}


// ======================================================
// ENTER KEY SUPPORT
// ======================================================

const trackingInput =

document.getElementById(

    "trackingInput"

);

if(trackingInput){

    trackingInput.addEventListener(

        "keypress",

        function(e){

            if(e.key==="Enter"){

                trackShipment();

            }

        }

    );

}


// ======================================================
// FINAL STARTUP
// ======================================================

console.log(

    "✅ LinkWorld Express Tracking System Ready"

);


// ======================================================
// END OF tracking.js
// ======================================================