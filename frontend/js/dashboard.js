// ======================================================
// LINKWORLD EXPRESS
// PROFESSIONAL ADMIN DASHBOARD
// dashboard.js
// PART 1
// ======================================================


// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL = "https://linkworld-express2-1.onrender.com";

const API_URL = `${API_BASE_URL}/api/shipments`;

const AUTH_URL = `${API_BASE_URL}/api/auth`;


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipments = [];

let filteredShipments = [];

let selectedShipment = null;

let currentPage = 1;

const rowsPerPage = 10;

let searchKeyword = "";

let statusFilter = "All";

let sortDirection = "newest";

let map = null;

let marker = null;

let destinationMarker = null;

let truckMarker = null;

let truckRoute = [];

let truckIndex = 0;

let truckTimer = null;

let selectedLatitude = null;

let selectedLongitude = null;

let locationTarget = null;


// ======================================================
// AUTH TOKEN
// ======================================================

function getToken(){

    return localStorage.getItem("adminToken");

}


// ======================================================
// LOGOUT
// ======================================================

function logout(showMessage = true){

    localStorage.removeItem("adminToken");

    if(showMessage){

        Swal.fire({

            icon:"success",

            title:"Logged Out",

            text:"You have been logged out."

        }).then(()=>{

            window.location.href="admin.html";

        });

    }

    else{

        window.location.href="admin.html";

    }

}


// ======================================================
// HANDLE 401
// ======================================================

function handleUnauthorized(error){

    if(

        error.response &&

        error.response.status===401

    ){

        logout(false);

        return true;

    }

    return false;

}


// ======================================================
// AXIOS CONFIG
// ======================================================

axios.defaults.baseURL = API_BASE_URL;

axios.defaults.timeout = 30000;


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

axios.interceptors.request.use(

(config)=>{

    const token = getToken();

    if(token){

        config.headers.Authorization =

        `Bearer ${token}`;

    }

    return config;

},

(error)=>Promise.reject(error)

);


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

axios.interceptors.response.use(

(response)=>response,

(error)=>{

    if(

        error.response &&

        error.response.status===401

    ){

        logout(false);

    }

    return Promise.reject(error);

}

);


// ======================================================
// LOGIN CHECK
// ======================================================

document.addEventListener(

"DOMContentLoaded",

async()=>{

    if(!getToken()){

        window.location.href="admin.html";

        return;

    }

    await initializeDashboard();

}

);


// ======================================================
// INITIALIZE DASHBOARD
// ======================================================

async function initializeDashboard(){

    try{

        showLoading(

            "Loading Dashboard..."

        );

        await loadShipments();

        hideLoading();

    }

    catch(error){

        hideLoading();

        console.error(error);

        showError(

            "Unable to load dashboard."

        );

    }

}


// ======================================================
// REFRESH DASHBOARD
// ======================================================

async function refreshDashboard(){

    await loadShipments();

}


// ======================================================
// SHOW DASHBOARD
// ======================================================

function showDashboard(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


// ======================================================
// SHOW CREATE SHIPMENT
// ======================================================

function showCreateShipment(){

    document

    .getElementById(

        "createShipment"

    )

    .scrollIntoView({

        behavior:"smooth"

    });

}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(()=>{

    if(getToken()){

        refreshDashboard();

    }

},60000);


// ======================================================
// END OF PART 1
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// PROFESSIONAL ADMIN DASHBOARD
// dashboard.js
// PART 2
// Load Shipments + Dashboard Cards + Search + Filter
// ======================================================


// ======================================================
// LOAD SHIPMENTS
// ======================================================

async function loadShipments(){

    try{

        showLoading("Loading Shipments...");

        const response = await axios.get(API_URL);

        shipments = response.data.data || [];

        filteredShipments = [...shipments];

        updateDashboardCards();

        applyFilters();

        hideLoading();

    }

    catch(error){

        hideLoading();

        console.error(error);

        if(handleUnauthorized(error)) return;

        showError(

            error.response?.data?.message ||

            "Unable to load shipments."

        );

    }

}


// ======================================================
// DASHBOARD CARDS
// ======================================================

function updateDashboardCards(){

    const total = shipments.length;

    const delivered = shipments.filter(

        s=>s.status==="Delivered"

    ).length;

    const transit = shipments.filter(

        s=>s.status==="In Transit"

    ).length;

    const pending = shipments.filter(

        s=>s.status!=="Delivered"

    ).length;

    document.getElementById(

        "shipmentCount"

    ).textContent = total;

    document.getElementById(

        "transitCount"

    ).textContent = transit;

    document.getElementById(

        "deliveredCount"

    ).textContent = delivered;

    document.getElementById(

        "pendingCount"

    ).textContent = pending;

}


// ======================================================
// SEARCH
// ======================================================

function searchShipments(keyword){

    searchKeyword = keyword.toLowerCase();

    applyFilters();

}


// ======================================================
// FILTER
// ======================================================

function filterShipments(status){

    statusFilter = status;

    applyFilters();

}


// ======================================================
// SORT
// ======================================================

function sortShipments(direction){

    sortDirection = direction;

    applyFilters();

}


// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    filteredShipments = shipments.filter(shipment=>{

        const keywordMatch =

        shipment.trackingNumber

        ?.toLowerCase()

        .includes(searchKeyword)

        ||

        shipment.sender

        ?.toLowerCase()

        .includes(searchKeyword)

        ||

        shipment.receiver

        ?.toLowerCase()

        .includes(searchKeyword)

        ||

        shipment.origin

        ?.toLowerCase()

        .includes(searchKeyword)

        ||

        shipment.destination

        ?.toLowerCase()

        .includes(searchKeyword);

        const statusMatch =

        statusFilter==="All"

        ||

        shipment.status===statusFilter;

        return keywordMatch && statusMatch;

    });

    sortFilteredShipments();

}


// ======================================================
// SORT FILTERED DATA
// ======================================================

function sortFilteredShipments(){

    filteredShipments.sort((a,b)=>{

        if(sortDirection==="oldest"){

            return new Date(a.createdAt)-

            new Date(b.createdAt);

        }

        return new Date(b.createdAt)-

        new Date(a.createdAt);

    });

    currentPage = 1;

    renderShipments();

}


// ======================================================
// SEARCH LISTENER
// ======================================================

const shipmentSearch =

document.getElementById(

    "shipmentSearch"

);

if(shipmentSearch){

    shipmentSearch.addEventListener(

        "input",

        function(){

            searchShipments(

                this.value

            );

        }

    );

}


// ======================================================
// STATUS FILTER LISTENER
// ======================================================

const statusDropdown =

document.getElementById(

    "statusFilter"

);

if(statusDropdown){

    statusDropdown.addEventListener(

        "change",

        function(){

            filterShipments(

                this.value

            );

        }

    );

}


// ======================================================
// SORT LISTENER
// ======================================================

const sortDropdown =

document.getElementById(

    "sortShipments"

);

if(sortDropdown){

    sortDropdown.addEventListener(

        "change",

        function(){

            sortShipments(

                this.value

            );

        }

    );

}


// ======================================================
// END OF PART 2
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// PROFESSIONAL ADMIN DASHBOARD
// dashboard.js
// PART 3
// Render Table + Pagination + View Shipment
// ======================================================


// ======================================================
// RENDER SHIPMENTS
// ======================================================

function renderShipments(){

    const table =

    document.getElementById(

        "shipmentTable"

    );

    if(!table) return;

    table.innerHTML = "";

    if(filteredShipments.length===0){

        table.innerHTML = `

        <tr>

            <td colspan="9"

            style="text-align:center;padding:40px;">

            No Shipments Found

            </td>

        </tr>

        `;

        updatePagination();

        return;

    }

    const start =

    (currentPage-1) * rowsPerPage;

    const end =

    start + rowsPerPage;

    const pageData =

    filteredShipments.slice(

        start,

        end

    );

    pageData.forEach(shipment=>{

        table.innerHTML += `

        <tr>

            <td>

                <b>${shipment.trackingNumber}</b>

            </td>

            <td>${shipment.sender}</td>

            <td>${shipment.receiver}</td>

            <td>${shipment.origin}</td>

            <td>${shipment.currentLocation || "-"}</td>

            <td>${shipment.destination}</td>

            <td>

                <span class="status">

                ${shipment.status}

                </span>

            </td>

            <td>

            ${shipment.progress || 0}%

            </td>

            <td>

                <div class="action-buttons">

                    <button

                    class="view-btn"

                    onclick="viewShipment('${shipment._id}')">

                    <i class="fa fa-eye"></i>

                    </button>

                    <button

                    class="edit-btn"

                    onclick="editShipment('${shipment._id}')">

                    <i class="fa fa-pen"></i>

                    </button>

                    <button

                    class="location-btn"

                    onclick="updateLocation('${shipment._id}')">

                    <i class="fa fa-location-dot"></i>

                    </button>

                    <button

                    class="receipt-btn-small"

                    onclick="getReceipt('${shipment.trackingNumber}')">

                    <i class="fa fa-file-invoice"></i>

                    </button>

                    <button

                    class="delete-btn"

                    onclick="deleteShipment('${shipment._id}')">

                    <i class="fa fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

        `;

    });

    updatePagination();

}


// ======================================================
// UPDATE PAGINATION
// ======================================================

function updatePagination(){

    let holder =

    document.getElementById(

        "pageInfo"

    );

    if(!holder){

        holder =

        document.createElement("div");

        holder.id="pageInfo";

        holder.style.marginTop="20px";

        holder.style.textAlign="center";

        document

        .querySelector(".table-responsive")

        ?.appendChild(holder);

    }

    const totalPages =

    Math.max(

        1,

        Math.ceil(

            filteredShipments.length /

            rowsPerPage

        )

    );

    holder.innerHTML = `

    <button

    onclick="previousPage()"

    ${currentPage===1?"disabled":""}>

    ◀ Previous

    </button>

    &nbsp;

    Page ${currentPage}

    of ${totalPages}

    &nbsp;

    <button

    onclick="nextPage()"

    ${currentPage===totalPages?"disabled":""}>

    Next ▶

    </button>

    `;

}


// ======================================================
// NEXT PAGE
// ======================================================

function nextPage(){

    const totalPages =

    Math.ceil(

        filteredShipments.length /

        rowsPerPage

    );

    if(currentPage<totalPages){

        currentPage++;

        renderShipments();

    }

}


// ======================================================
// PREVIOUS PAGE
// ======================================================

function previousPage(){

    if(currentPage>1){

        currentPage--;

        renderShipments();

    }

}


// ======================================================
// VIEW SHIPMENT
// ======================================================

function viewShipment(id){

    const shipment =

    shipments.find(

        s=>s._id===id

    );

    if(!shipment) return;

    selectedShipment = shipment;

    document.getElementById(

        "shipmentDetails"

    ).innerHTML = `

    <div class="detail-card">

        <h4>Tracking Number</h4>

        <p>${shipment.trackingNumber}</p>

    </div>

    <div class="detail-card">

        <h4>Sender</h4>

        <p>${shipment.sender}</p>

    </div>

    <div class="detail-card">

        <h4>Receiver</h4>

        <p>${shipment.receiver}</p>

    </div>

    <div class="detail-card">

        <h4>Shipment</h4>

        <p>${shipment.shipment}</p>

    </div>

    <div class="detail-card">

        <h4>Origin</h4>

        <p>${shipment.origin}</p>

    </div>

    <div class="detail-card">

        <h4>Current Location</h4>

        <p>${shipment.currentLocation}</p>

    </div>

    <div class="detail-card">

        <h4>Destination</h4>

        <p>${shipment.destination}</p>

    </div>

    <div class="detail-card">

        <h4>Status</h4>

        <p>${shipment.status}</p>

    </div>

    <div class="detail-card">

        <h4>Progress</h4>

        <p>

        ${shipment.progress || 0}%

        </p>

    </div>

    <div class="detail-card">

        <h4>Estimated Arrival</h4>

        <p>

        ${calculateETA(

        shipment.progress || 0

        )}

        </p>

    </div>

    <div class="detail-card">

        <h4>Expected Delivery</h4>

        <p>

        ${shipment.expectedDelivery ?

        new Date(

        shipment.expectedDelivery

        ).toLocaleDateString()

        : "-"}

        </p>

    </div>

    `;

    document.getElementById(

        "shipmentModal"

    ).style.display="flex";

}


// ======================================================
// CLOSE SHIPMENT MODAL
// ======================================================

function closeShipmentModal(){

    document.getElementById(

        "shipmentModal"

    ).style.display="none";

}


// ======================================================
// RECEIPT
// ======================================================

function getReceipt(trackingNumber){

    window.open(

        `receipt.html?tracking=${trackingNumber}`,

        "_blank"

    );

}


// ======================================================
// END OF PART 3
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD.JS
// PART 4A-1
// LEAFLET MAP FUNCTIONS
// ======================================================


// ======================================================
// PICK CURRENT LOCATION
// ======================================================

function pickCurrentLocation(){

    locationTarget = "current";

    openMap();

}


// ======================================================
// PICK DESTINATION
// ======================================================

function pickDestination(){

    locationTarget = "destination";

    openMap();

}


// ======================================================
// OPEN MAP
// ======================================================

function openMap(){

    document.getElementById(

        "mapModal"

    ).style.display = "flex";

    setTimeout(()=>{

        initMap();

    },300);

}


// ======================================================
// CLOSE MAP
// ======================================================

function closeMapModal(){

    document.getElementById(

        "mapModal"

    ).style.display = "none";

}


// ======================================================
// INITIALIZE MAP
// ======================================================

function initMap(){

    if(map){

        map.remove();

    }

    map = L.map(

        "adminMap",

        {

            zoomControl:true

        }

    ).setView([20,0],2);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap",

            maxZoom:19

        }

    ).addTo(map);

    const currentLat = Number(

        document.getElementById(

            "currentLatitude"

        ).value

    );

    const currentLng = Number(

        document.getElementById(

            "currentLongitude"

        ).value

    );

    const destinationLat = Number(

        document.getElementById(

            "destinationLatitude"

        ).value

    );

    const destinationLng = Number(

        document.getElementById(

            "destinationLongitude"

        ).value

    );

    if(currentLat && currentLng){

        marker = L.marker(

            [

                currentLat,

                currentLng

            ]

        ).addTo(map);

        marker.bindPopup(

            "Current Location"

        );

    }

    if(destinationLat && destinationLng){

        destinationMarker = L.marker(

            [

                destinationLat,

                destinationLng

            ]

        ).addTo(map);

        destinationMarker.bindPopup(

            "Destination"

        );

    }

    if(

        currentLat &&

        currentLng &&

        destinationLat &&

        destinationLng

    ){

        const route = [

            [

                currentLat,

                currentLng

            ],

            [

                destinationLat,

                destinationLng

            ]

        ];

        L.polyline(

            route,

            {

                color:"#0d6efd",

                weight:4,

                opacity:0.8

            }

        ).addTo(map);

        map.fitBounds(

            route,

            {

                padding:[50,50]

            }

        );

    }

    map.on(

        "click",

        function(e){

            selectedLatitude =

            e.latlng.lat;

            selectedLongitude =

            e.latlng.lng;

            if(marker){

                map.removeLayer(marker);

            }

            marker = L.marker(

                [

                    selectedLatitude,

                    selectedLongitude

                ]

            ).addTo(map);

            marker.bindPopup(

                "Selected Location"

            ).openPopup();

        }

    );

}


// ======================================================
// SAVE PICKED LOCATION
// ======================================================

function savePickedLocation(){

    if(selectedLatitude===null){

        showError(

            "Please select a location."

        );

        return;

    }

    if(locationTarget==="current"){

        document.getElementById(

            "currentLatitude"

        ).value =

        selectedLatitude.toFixed(6);

        document.getElementById(

            "currentLongitude"

        ).value =

        selectedLongitude.toFixed(6);

    }

    else if(locationTarget==="destination"){

        document.getElementById(

            "destinationLatitude"

        ).value =

        selectedLatitude.toFixed(6);

        document.getElementById(

            "destinationLongitude"

        ).value =

        selectedLongitude.toFixed(6);

    }

    showSuccess(

        "Coordinates selected successfully."

    );

    closeMapModal();

}


// ======================================================
// END OF PART 4A-1
// ======================================================
// ======================================================
// VIEW SHIPMENT
// PART 4A-2
// ======================================================

function viewShipment(id){

    const shipment = shipments.find(

        s => s._id === id

    );

    if(!shipment){

        showError("Shipment not found.");

        return;

    }

    selectedShipment = shipment;

    const progress = shipment.progress || 0;

    const eta = calculateETA(progress);

    document.getElementById(

        "shipmentDetails"

    ).innerHTML = `

    <div class="detail-card">

        <h4>Tracking Number</h4>

        <p>${shipment.trackingNumber}</p>

    </div>

    <div class="detail-card">

        <h4>Sender</h4>

        <p>${shipment.sender}</p>

    </div>

    <div class="detail-card">

        <h4>Receiver</h4>

        <p>${shipment.receiver}</p>

    </div>

    <div class="detail-card">

        <h4>Shipment</h4>

        <p>${shipment.shipment}</p>

    </div>

    <div class="detail-card">

        <h4>Origin</h4>

        <p>${shipment.origin}</p>

    </div>

    <div class="detail-card">

        <h4>Current Location</h4>

        <p>${shipment.currentLocation}</p>

    </div>

    <div class="detail-card">

        <h4>Destination</h4>

        <p>${shipment.destination}</p>

    </div>

    <div class="detail-card">

        <h4>Status</h4>

        <p>${shipment.status}</p>

    </div>

    <div class="detail-card">

        <h4>Expected Delivery</h4>

        <p>

        ${shipment.expectedDelivery ?

        new Date(

        shipment.expectedDelivery

        ).toLocaleDateString()

        : "-"}

        </p>

    </div>

    <div class="detail-card">

        <h4>Progress</h4>

        <p>${progress}%</p>

    </div>

    <div class="detail-card">

        <h4>Estimated Arrival</h4>

        <p>${eta}</p>

    </div>

    <div class="detail-card"

    style="grid-column:1/-1;">

        <h4>Live Route</h4>

        <p>

        ${shipment.origin}

        →

        ${shipment.currentLocation}

        →

        ${shipment.destination}

        </p>

    </div>

    <div class="detail-card"

    style="grid-column:1/-1;">

        <h4>Delivery Progress</h4>

        <div

        style="

        width:100%;

        height:12px;

        background:#ddd;

        border-radius:50px;

        overflow:hidden;

        ">

            <div

            style="

            width:${progress}%;

            height:100%;

            background:#0d6efd;

            transition:.4s;

            ">

            </div>

        </div>

        <small>${progress}% Complete</small>

    </div>

    <div class="detail-card"

    style="grid-column:1/-1;">

        <h4>Route History</h4>

        <div>

        ${

        shipment.route && shipment.route.length

        ?

        shipment.route.map(stop=>`

            <div style="margin-bottom:10px;">

                <b>${stop.location}</b>

                <br>

                ${stop.status}

                <br>

                <small>

                ${new Date(stop.time)

                .toLocaleString()}

                </small>

            </div>

        `).join("")

        :

        "No movement recorded."

        }

        </div>

    </div>

    `;

    document.getElementById(

        "shipmentModal"

    ).style.display = "flex";

    if(

        shipment.currentLatitude &&

        shipment.destinationLatitude

    ){

        setTimeout(()=>{

            startTruckAnimation(

                shipment

            );

        },500);

    }

}
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD
// PART 4B
// PROFESSIONAL VIEW SHIPMENT
// ======================================================

function viewShipment(id){

    const shipment = shipments.find(
        s => s._id === id
    );

    if(!shipment){
        showError("Shipment not found.");
        return;
    }

    selectedShipment = shipment;

    const progress =
        shipment.progress ||
        calculateProgress(
            shipment.currentLatitude || 0,
            shipment.currentLongitude || 0,
            shipment.destinationLatitude || 0,
            shipment.destinationLongitude || 0
        );

    document.getElementById(
        "shipmentDetails"
    ).innerHTML = `

    <div class="detail-card">
        <h4>Tracking Number</h4>
        <p>${shipment.trackingNumber}</p>
    </div>

    <div class="detail-card">
        <h4>Sender</h4>
        <p>${shipment.sender}</p>
    </div>

    <div class="detail-card">
        <h4>Receiver</h4>
        <p>${shipment.receiver}</p>
    </div>

    <div class="detail-card">
        <h4>Shipment</h4>
        <p>${shipment.shipment}</p>
    </div>

    <div class="detail-card">
        <h4>Origin</h4>
        <p>${shipment.origin}</p>
    </div>

    <div class="detail-card">
        <h4>Current Location</h4>
        <p>${shipment.currentLocation}</p>
    </div>

    <div class="detail-card">
        <h4>Destination</h4>
        <p>${shipment.destination}</p>
    </div>

    <div class="detail-card">
        <h4>Status</h4>
        <p>${shipment.status}</p>
    </div>

    <div class="detail-card">
        <h4>Expected Delivery</h4>
        <p>
        ${
            shipment.expectedDelivery
            ?
            new Date(
                shipment.expectedDelivery
            ).toLocaleDateString()
            :
            "-"
        }
        </p>
    </div>

    <div class="detail-card">
        <h4>Progress</h4>
        <p>${progress}%</p>
    </div>

    <div class="detail-card">
        <h4>Estimated Arrival</h4>
        <p>${calculateETA(progress)}</p>
    </div>

    <div style="grid-column:1/-1;margin-top:20px;">

        <h4>Shipment Progress</h4>

        <div style="
            width:100%;
            height:18px;
            background:#e5e5e5;
            border-radius:20px;
            overflow:hidden;
            margin-top:10px;
        ">

            <div style="
                width:${progress}%;
                height:100%;
                background:#0d6efd;
                transition:.5s;
            ">
            </div>

        </div>

        <p style="
            margin-top:10px;
            font-weight:bold;
            color:#0d6efd;
        ">
            ${progress}% Completed
        </p>

    </div>

    <div id="liveRouteContainer"
         style="grid-column:1/-1;height:350px;margin-top:20px;">
    </div>

    <div
        id="routeHistory"
        style="grid-column:1/-1;margin-top:20px;">
    </div>

    `;

    document.getElementById(
        "shipmentModal"
    ).style.display = "flex";

    setTimeout(function(){

        loadShipmentRouteMap(shipment);

        displayRouteHistory(shipment);

        startTruckAnimation(shipment);

    },300);

}
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD
// PART 4C
// LIVE ROUTE MAP + ROUTE HISTORY
// ======================================================

// ======================================================
// LOAD SHIPMENT ROUTE MAP
// ======================================================

function loadShipmentRouteMap(shipment){

    const container =
    document.getElementById(
        "liveRouteContainer"
    );

    if(!container) return;

    container.innerHTML = `
        <div id="liveShipmentMap"
        style="
        width:100%;
        height:350px;
        border-radius:12px;
        overflow:hidden;
        ">
        </div>
    `;

    const liveMap = L.map(
        "liveShipmentMap"
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:"© OpenStreetMap"
        }
    ).addTo(liveMap);

    const current = [

        shipment.currentLatitude || 0,

        shipment.currentLongitude || 0

    ];

    const destination = [

        shipment.destinationLatitude || 0,

        shipment.destinationLongitude || 0

    ];

    const currentMarker =

    L.marker(current)

    .addTo(liveMap)

    .bindPopup("Current Location");

    const destinationMarker =

    L.marker(destination)

    .addTo(liveMap)

    .bindPopup("Destination");

    L.polyline(

        [

            current,

            destination

        ],

        {

            color:"#0d6efd",

            weight:5

        }

    ).addTo(liveMap);

    liveMap.fitBounds(

        [

            current,

            destination

        ],

        {

            padding:[40,40]

        }

    );

}



// ======================================================
// DISPLAY ROUTE HISTORY
// ======================================================

function displayRouteHistory(shipment){

    const container =

    document.getElementById(

        "routeHistory"

    );

    if(!container) return;

    let history =

    shipment.history || [];

    if(history.length===0){

        history=[

            {

                location:

                shipment.origin,

                status:

                "Shipment Created",

                date:

                new Date()

            }

        ];

    }

    let html =

    `

    <h3 style="margin-bottom:15px;">

    Route History

    </h3>

    `;

    history.forEach(item=>{

        html += `

        <div style="

        border-left:4px solid #0d6efd;

        padding-left:15px;

        margin-bottom:18px;

        ">

            <strong>

            ${item.location}

            </strong>

            <br>

            ${item.status}

            <br>

            <small>

            ${new Date(

                item.date

            ).toLocaleString()}

            </small>

        </div>

        `;

    });

    container.innerHTML = html;

}



// ======================================================
// ADD ROUTE HISTORY
// ======================================================

function addRouteHistory(

    shipment,

    location,

    status,

    latitude,

    longitude

){

    if(!shipment.history){

        shipment.history=[];

    }

    shipment.history.push({

        location,

        status,

        latitude,

        longitude,

        date:new Date()

    });

}



// ======================================================
// REFRESH VIEW
// ======================================================

function refreshShipmentView(){

    if(!selectedShipment) return;

    if(typeof selectedShipment==="object"){

        viewShipment(selectedShipment._id);

        return;

    }

    viewShipment(selectedShipment);

}



// ======================================================
// END PART 4C
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD
// PART 5A
// LIVE TRUCK ANIMATION ENGINE
// ======================================================

// ======================================================
// GLOBAL TRUCK VARIABLES
// ======================================================

let truckMarker = null;
let truckRoute = [];
let truckIndex = 0;
let truckTimer = null;

// ======================================================
// GENERATE ROUTE POINTS
// ======================================================

function generateRoutePoints(startLat, startLng, endLat, endLng) {

    const points = [];

    const totalSteps = 120;

    for (let i = 0; i <= totalSteps; i++) {

        const percent = i / totalSteps;

        const lat =
            startLat + ((endLat - startLat) * percent);

        const lng =
            startLng + ((endLng - startLng) * percent);

        points.push([lat, lng]);

    }

    return points;

}

// ======================================================
// START TRUCK ANIMATION
// ======================================================

function startTruckAnimation(shipment) {

    if (!shipment) return;

    if (
        !shipment.currentLatitude ||
        !shipment.currentLongitude ||
        !shipment.destinationLatitude ||
        !shipment.destinationLongitude
    ) {

        showError("Shipment coordinates are missing.");

        return;

    }

    if (truckTimer) {

        clearInterval(truckTimer);

    }

    truckRoute = generateRoutePoints(

        Number(shipment.currentLatitude),
        Number(shipment.currentLongitude),

        Number(shipment.destinationLatitude),
        Number(shipment.destinationLongitude)

    );

    truckIndex = 0;

    if (truckMarker && map) {

        map.removeLayer(truckMarker);

    }

    const truckIcon = L.divIcon({

        className: "",

        html: `

        <i
        class="fa-solid fa-truck-fast"
        style="
            color:#0d6efd;
            font-size:30px;
            text-shadow:0 0 10px rgba(0,0,0,.35);
        ">
        </i>

        `,

        iconSize: [30,30]

    });

    truckMarker = L.marker(

        truckRoute[0],

        {

            icon: truckIcon

        }

    ).addTo(map);

    truckTimer = setInterval(

        moveTruck,

        800

    );

}

// ======================================================
// MOVE TRUCK
// ======================================================

function moveTruck() {

    if (!truckMarker) return;

    truckIndex++;

    if (truckIndex >= truckRoute.length) {

        clearInterval(truckTimer);

        truckTimer = null;

        return;

    }

    truckMarker.setLatLng(

        truckRoute[truckIndex]

    );

}

// ======================================================
// STOP TRUCK
// ======================================================

function stopTruckAnimation() {

    if (truckTimer) {

        clearInterval(truckTimer);

        truckTimer = null;

    }

}

// ======================================================
// RESET TRUCK
// ======================================================

function resetTruckAnimation() {

    stopTruckAnimation();

    if (truckMarker && map) {

        map.removeLayer(truckMarker);

        truckMarker = null;

    }

    truckRoute = [];

    truckIndex = 0;

}

// ======================================================
// END PART 5A
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD
// PART 5B
// LIVE SYNCHRONIZATION
// ======================================================


// ======================================================
// UPDATE SHIPMENT PROGRESS
// ======================================================

function updateShipmentProgress(shipment){

    if(!shipment) return;

    const progress = calculateProgress(

        Number(shipment.currentLatitude),

        Number(shipment.currentLongitude),

        Number(shipment.destinationLatitude),

        Number(shipment.destinationLongitude)

    );

    shipment.progress = progress;

    return progress;

}


// ======================================================
// AUTO UPDATE STATUS
// ======================================================

function autoUpdateStatus(shipment){

    if(!shipment) return;

    const progress = shipment.progress || 0;

    if(progress >= 100){

        shipment.status = "Delivered";

    }

    else if(progress >= 90){

        shipment.status = "Out for Delivery";

    }

    else if(progress >= 70){

        shipment.status = "Arrived at Destination";

    }

    else if(progress >= 50){

        shipment.status = "Customs Clearance";

    }

    else if(progress >= 25){

        shipment.status = "In Transit";

    }

    else if(progress >= 10){

        shipment.status = "Picked Up";

    }

    else{

        shipment.status = "Shipment Created";

    }

}


// ======================================================
// SAVE ROUTE HISTORY
// ======================================================

function appendRouteHistory(shipment){

    if(!shipment) return;

    if(!shipment.route){

        shipment.route = [];

    }

    shipment.route.push({

        location: shipment.currentLocation,

        latitude: shipment.currentLatitude,

        longitude: shipment.currentLongitude,

        status: shipment.status,

        time: new Date().toISOString()

    });

}


// ======================================================
// SYNC TRACKING PAGE
// ======================================================

function syncTrackingPage(){

    localStorage.setItem(

        "shipments",

        JSON.stringify(shipments)

    );

}


// ======================================================
// UPDATE TRUCK POSITION
// ======================================================

function synchronizeTruck(shipment){

    if(!shipment) return;

    if(truckIndex >= truckRoute.length){

        return;

    }

    shipment.currentLatitude =

        truckRoute[truckIndex][0];

    shipment.currentLongitude =

        truckRoute[truckIndex][1];

    updateShipmentProgress(shipment);

    autoUpdateStatus(shipment);

    appendRouteHistory(shipment);

    syncTrackingPage();

}


// ======================================================
// SAVE LIVE POSITION TO SERVER
// ======================================================

async function saveTruckPosition(shipment){

    if(!shipment) return;

    try{

        await axios.put(

            `${API_URL}/${shipment._id}`,

            {

                currentLatitude: shipment.currentLatitude,

                currentLongitude: shipment.currentLongitude,

                currentLocation: shipment.currentLocation,

                progress: shipment.progress,

                status: shipment.status,

                route: shipment.route

            }

        );

    }

    catch(error){

        console.error(

            "Unable to save live position.",

            error

        );

    }

}


// ======================================================
// OVERRIDE TRUCK MOVEMENT
// ======================================================

const originalMoveTruck = moveTruck;

moveTruck = async function(){

    originalMoveTruck();

    if(!selectedShipment) return;

    const shipment = shipments.find(

        s => s._id === selectedShipment ||

             s === selectedShipment

    );

    if(!shipment) return;

    synchronizeTruck(shipment);

    await saveTruckPosition(shipment);

};


// ======================================================
// END PART 5B
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// DASHBOARD
// PART 5C
// DELIVERY COMPLETION & FINAL INITIALIZATION
// ======================================================


// ======================================================
// DELIVERY SUCCESS ALERT
// ======================================================

function celebrateDelivery(shipment){

    Swal.fire({

        icon: "success",

        title: "Shipment Delivered",

        html: `

        <h3>${shipment.trackingNumber}</h3>

        <br>

        <b>The shipment has successfully reached its destination.</b>

        `,

        confirmButtonText: "OK"

    });

}


// ======================================================
// COMPLETE DELIVERY
// ======================================================

async function completeDelivery(shipment){

    if(!shipment) return;

    shipment.progress = 100;

    shipment.status = "Delivered";

    shipment.currentLatitude = shipment.destinationLatitude;

    shipment.currentLongitude = shipment.destinationLongitude;

    shipment.currentLocation = shipment.destination;

    appendRouteHistory(shipment);

    syncTrackingPage();

    try{

        await axios.put(

            `${API_URL}/${shipment._id}`,

            {

                currentLocation: shipment.currentLocation,

                currentLatitude: shipment.currentLatitude,

                currentLongitude: shipment.currentLongitude,

                status: shipment.status,

                progress: shipment.progress,

                route: shipment.route

            }

        );

    }

    catch(error){

        console.error(error);

    }

    celebrateDelivery(shipment);

    renderShipments();

}


// ======================================================
// WATCH TRUCK MOVEMENT
// ======================================================

const previousMoveTruck = moveTruck;

moveTruck = async function(){

    previousMoveTruck();

    if(!selectedShipment) return;

    const shipment = shipments.find(

        s => s._id === selectedShipment ||

             s === selectedShipment

    );

    if(!shipment) return;

    if(truckIndex >= truckRoute.length){

        stopTruckAnimation();

        await completeDelivery(shipment);

    }

};


// ======================================================
// AUTO SAVE LOCAL STORAGE
// ======================================================

setInterval(function(){

    syncTrackingPage();

},3000);


// ======================================================
// REFRESH TRACKING PAGE
// ======================================================

window.addEventListener(

    "storage",

    function(){

        syncTrackingPage();

    }

);


// ======================================================
// DASHBOARD READY
// ======================================================

window.addEventListener(

    "load",

    function(){

        console.log(

            "✅ LinkWorld Express Dashboard Ready"

        );

        syncTrackingPage();

        updateLastRefresh();

    }

);


// ======================================================
// CLEANUP BEFORE EXIT
// ======================================================

window.addEventListener(

    "beforeunload",

    function(){

        stopTruckAnimation();

    }

);


// ======================================================
// FINAL SUCCESS MESSAGE
// ======================================================

console.log(

    "🚚 Live Tracking Engine Loaded Successfully"

);


// ======================================================
// END OF dashboard.js
// ======================================================