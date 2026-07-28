// ======================================================
// LINKWORLD EXPRESS
// PROFESSIONAL DASHBOARD
// PART 1
// ======================================================

"use strict";

// ======================================================
// API
// ======================================================

const API_BASE =
"https://linkworld-express2-1.onrender.com";

const API = {

    login:
    `${API_BASE}/api/auth/login`,

    shipments:
    `${API_BASE}/api/shipments`

};

// ======================================================
// TOKEN
// ======================================================

const TOKEN =
localStorage.getItem("adminToken");

if (!TOKEN) {

    window.location.href = "admin.html";

}

// ======================================================
// AXIOS
// ======================================================

axios.defaults.baseURL = API_BASE;

axios.defaults.headers.common.Authorization =
`Bearer ${TOKEN}`;

axios.defaults.timeout = 30000;

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipments = [];

let selectedShipment = null;

let selectedShipmentId = null;

let deleteShipmentId = null;

// ======================================================
// MAP VARIABLES
// ======================================================

let adminMap = null;

let mapMarker = null;

let mapMode = "current";

// ======================================================
// ELEMENTS
// ======================================================

const shipmentTable =
document.getElementById("shipmentTable");

const shipmentCount =
document.getElementById("shipmentCount");

const transitCount =
document.getElementById("transitCount");

const deliveredCount =
document.getElementById("deliveredCount");

const pendingCount =
document.getElementById("pendingCount");

const loadingOverlay =
document.getElementById("loadingOverlay");

const loadingText =
document.getElementById("loadingText");

// ======================================================
// LOADING
// ======================================================

function showLoading(text = "Loading...") {

    if (!loadingOverlay) return;

    loadingOverlay.style.display = "flex";

    if (loadingText) {

        loadingText.innerHTML = text;

    }

}

function hideLoading() {

    if (!loadingOverlay) return;

    loadingOverlay.style.display = "none";

}

// ======================================================
// SUCCESS
// ======================================================

function showSuccess(message) {

    Swal.fire({

        icon: "success",

        title: "Success",

        text: message,

        timer: 1800,

        showConfirmButton: false

    });

}

// ======================================================
// ERROR
// ======================================================

function showError(message) {

    Swal.fire({

        icon: "error",

        title: "Error",

        text: message

    });

}

// ======================================================
// LOGOUT
// ======================================================

function logout() {

    Swal.fire({

        icon: "question",

        title: "Logout",

        text: "Are you sure?",

        showCancelButton: true,

        confirmButtonText: "Logout"

    })

    .then(result => {

        if (!result.isConfirmed) return;

        localStorage.removeItem("adminToken");

        window.location.href = "admin.html";

    });

}

// ======================================================
// NAVIGATION
// ======================================================

function showDashboard() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

function showCreateShipment() {

    document

    .getElementById("createShipment")

    .scrollIntoView({

        behavior: "smooth"

    });

}

// ======================================================
// TRACKING NUMBER
// ======================================================

function generateTrackingNumber() {

    const year = new Date().getFullYear();

    const random = Math.floor(

        100000 + Math.random() * 900000

    );

    return `LWX${year}${random}`;

}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {

    if (!date) return "-";

    return new Date(date)

    .toLocaleDateString("en-US", {

        year: "numeric",

        month: "short",

        day: "numeric"

    });

}

// ======================================================
// PAGE START
// ======================================================

window.addEventListener(

    "load",

    async () => {

        try {

            showLoading(

                "Loading Dashboard..."

            );

            await loadShipments();

            hideLoading();

        }

        catch (err) {

            hideLoading();

            console.error(err);

            showError(

                "Unable to load dashboard."

            );

        }

    }

);

// ======================================================
// END PART 1
// ======================================================
// ======================================================
// PART 2
// LOAD SHIPMENTS
// DASHBOARD CARDS
// SHIPMENT TABLE
// ======================================================

// ======================================================
// LOAD SHIPMENTS
// ======================================================

async function loadShipments() {

    try {

        const response = await axios.get(API.shipments);

        shipments = response.data.data || [];

        updateDashboardCards();

        renderShipmentTable();

    }

    catch (error) {

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Unable to load shipments."

        );

    }

}

// ======================================================
// DASHBOARD CARDS
// ======================================================

function updateDashboardCards() {

    shipmentCount.textContent = shipments.length;

    transitCount.textContent =

        shipments.filter(

            s => s.status === "In Transit"

        ).length;

    deliveredCount.textContent =

        shipments.filter(

            s => s.status === "Delivered"

        ).length;

    pendingCount.textContent =

        shipments.filter(

            s =>

            s.status !== "Delivered" &&

            s.status !== "Cancelled"

        ).length;

}

// ======================================================
// SHIPMENT TABLE
// ======================================================

function renderShipmentTable() {

    shipmentTable.innerHTML = "";

    if (shipments.length === 0) {

        shipmentTable.innerHTML = `

        <tr>

        <td colspan="9"

        style="text-align:center;padding:40px;">

        <i class="fa-solid fa-box-open"

        style="font-size:45px;color:#999;"></i>

        <br><br>

        No Shipments Available

        </td>

        </tr>

        `;

        return;

    }

    shipments.forEach(shipment => {

        shipmentTable.innerHTML += `

        <tr>

        <td>

        <strong>

        ${shipment.trackingNumber}

        </strong>

        </td>

        <td>

        ${shipment.senderName || "-"}

        </td>

        <td>

        ${shipment.receiverName || "-"}

        </td>

        <td>

        ${shipment.origin || "-"}

        </td>

        <td>

        ${shipment.currentLocation || "-"}

        </td>

        <td>

        ${shipment.destination || "-"}

        </td>

        <td>

        ${statusBadge(shipment.status)}

        </td>

        <td>

        ${formatDate(

            shipment.expectedDelivery

        )}

        </td>

        <td>

        <button

        class="action-btn"

        onclick="viewShipment('${shipment._id}')">

        <i class="fa-solid fa-eye"></i>

        </button>

        <button

        class="action-btn"

        onclick="editShipment('${shipment._id}')">

        <i class="fa-solid fa-pen"></i>

        </button>

        <button

        class="action-btn"

        onclick="updateLocation('${shipment._id}')">

        <i class="fa-solid fa-location-dot"></i>

        </button>

        <button

        class="action-btn"

        onclick="previewReceipt('${shipment._id}')">

        <i class="fa-solid fa-file-invoice"></i>

        </button>

        <button

        class="action-btn delete"

        onclick="deleteShipment('${shipment._id}')">

        <i class="fa-solid fa-trash"></i>

        </button>

        </td>

        </tr>

        `;

    });

}

// ======================================================
// STATUS BADGE
// ======================================================

function statusBadge(status) {

    let color = "#0d6efd";

    switch (status) {

        case "Delivered":

            color = "#198754";

            break;

        case "Cancelled":

            color = "#dc3545";

            break;

        case "On Hold":

            color = "#ffc107";

            break;

        case "Processing":

            color = "#6f42c1";

            break;

        case "Customs Clearance":

            color = "#fd7e14";

            break;

        case "Out for Delivery":

            color = "#20c997";

            break;

        case "In Transit":

            color = "#0d6efd";

            break;

    }

    return `

    <span style="

    background:${color};

    color:#fff;

    padding:6px 12px;

    border-radius:20px;

    font-size:12px;

    font-weight:600;

    display:inline-block;

    ">

    ${status}

    </span>

    `;

}

// ======================================================
// END PART 2
// ======================================================
// ======================================================
// PART 3
// CREATE SHIPMENT
// ======================================================

async function createShipment() {

    try {

        showLoading("Saving Shipment...");

        const shipmentData = {

            trackingNumber: generateTrackingNumber(),

            senderName:
            document.getElementById("senderName").value.trim(),

            senderPhone:
            document.getElementById("senderPhone").value.trim(),

            senderEmail:
            document.getElementById("senderEmail").value.trim(),

            receiverName:
            document.getElementById("receiverName").value.trim(),

            receiverPhone:
            document.getElementById("receiverPhone").value.trim(),

            receiverEmail:
            document.getElementById("receiverEmail").value.trim(),

            receiverAddress:
            document.getElementById("receiverAddress").value.trim(),

            shipment:
            document.getElementById("shipment").value.trim(),

            origin:
            document.getElementById("origin").value.trim(),

            currentLocation:
            document.getElementById("currentLocation").value.trim(),

            destination:
            document.getElementById("destination").value.trim(),

            currentLatitude:
            parseFloat(
                document.getElementById("currentLatitude").value
            ) || 0,

            currentLongitude:
            parseFloat(
                document.getElementById("currentLongitude").value
            ) || 0,

            destinationLatitude:
            parseFloat(
                document.getElementById("destinationLatitude").value
            ) || 0,

            destinationLongitude:
            parseFloat(
                document.getElementById("destinationLongitude").value
            ) || 0,

            status:
            document.getElementById("status").value,

            expectedDelivery:
            document.getElementById("expectedDelivery").value

        };

        // ==========================================
        // REQUIRED FIELDS
        // ==========================================

        if (

            !shipmentData.senderName ||

            !shipmentData.receiverName ||

            !shipmentData.shipment ||

            !shipmentData.origin ||

            !shipmentData.destination

        ) {

            hideLoading();

            return showError(
                "Please complete all required fields."
            );

        }

        // ==========================================
        // SAVE
        // ==========================================

        await axios.post(

            API.shipments,

            shipmentData

        );

        hideLoading();

        showSuccess(
            "Shipment created successfully."
        );

        clearShipmentForm();

        await loadShipments();

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Unable to save shipment."

        );

    }

}

// ======================================================
// CLEAR FORM
// ======================================================

function clearShipmentForm() {

    const ids = [

        "senderName",

        "senderPhone",

        "senderEmail",

        "receiverName",

        "receiverPhone",

        "receiverEmail",

        "receiverAddress",

        "shipment",

        "origin",

        "currentLocation",

        "destination",

        "currentLatitude",

        "currentLongitude",

        "destinationLatitude",

        "destinationLongitude",

        "expectedDelivery"

    ];

    ids.forEach(id => {

        const el = document.getElementById(id);

        if (el) {

            el.value = "";

        }

    });

    document.getElementById("status").selectedIndex = 0;

}

// ======================================================
// END PART 3
// ======================================================
// ======================================================
// PART 4
// VIEW SHIPMENT
// EDIT SHIPMENT
// ======================================================

// ======================================================
// VIEW SHIPMENT
// ======================================================

function viewShipment(id) {

    const shipment = shipments.find(

        s => s._id === id

    );

    if (!shipment) {

        return showError(

            "Shipment not found."

        );

    }

    selectedShipment = shipment;

    document.getElementById(

        "shipmentDetails"

    ).innerHTML = `

    <div class="detail-card">

        <h3>Tracking Number</h3>

        <p>${shipment.trackingNumber}</p>

    </div>

    <div class="detail-card">

        <h3>Sender</h3>

        <p>${shipment.senderName}</p>

    </div>

    <div class="detail-card">

        <h3>Receiver</h3>

        <p>${shipment.receiverName}</p>

    </div>

    <div class="detail-card">

        <h3>Shipment</h3>

        <p>${shipment.shipment}</p>

    </div>

    <div class="detail-card">

        <h3>Origin</h3>

        <p>${shipment.origin}</p>

    </div>

    <div class="detail-card">

        <h3>Current Location</h3>

        <p>${shipment.currentLocation}</p>

    </div>

    <div class="detail-card">

        <h3>Destination</h3>

        <p>${shipment.destination}</p>

    </div>

    <div class="detail-card">

        <h3>Status</h3>

        <p>${shipment.status}</p>

    </div>

    <div class="detail-card">

        <h3>Expected Delivery</h3>

        <p>${formatDate(

            shipment.expectedDelivery

        )}</p>

    </div>

    `;

    document.getElementById(

        "shipmentModal"

    ).style.display = "flex";

}

// ======================================================
// CLOSE VIEW MODAL
// ======================================================

function closeShipmentModal() {

    document.getElementById(

        "shipmentModal"

    ).style.display = "none";

}

// ======================================================
// EDIT SHIPMENT
// ======================================================

function editShipment(id) {

    const shipment = shipments.find(

        s => s._id === id

    );

    if (!shipment) {

        return showError(

            "Shipment not found."

        );

    }

    selectedShipmentId = id;

    document.getElementById("senderName").value =
    shipment.senderName || "";

    document.getElementById("senderPhone").value =
    shipment.senderPhone || "";

    document.getElementById("senderEmail").value =
    shipment.senderEmail || "";

    document.getElementById("receiverName").value =
    shipment.receiverName || "";

    document.getElementById("receiverPhone").value =
    shipment.receiverPhone || "";

    document.getElementById("receiverEmail").value =
    shipment.receiverEmail || "";

    document.getElementById("receiverAddress").value =
    shipment.receiverAddress || "";

    document.getElementById("shipment").value =
    shipment.shipment || "";

    document.getElementById("origin").value =
    shipment.origin || "";

    document.getElementById("currentLocation").value =
    shipment.currentLocation || "";

    document.getElementById("destination").value =
    shipment.destination || "";

    document.getElementById("currentLatitude").value =
    shipment.currentLatitude || "";

    document.getElementById("currentLongitude").value =
    shipment.currentLongitude || "";

    document.getElementById("destinationLatitude").value =
    shipment.destinationLatitude || "";

    document.getElementById("destinationLongitude").value =
    shipment.destinationLongitude || "";

    document.getElementById("status").value =
    shipment.status || "Shipment Created";

    document.getElementById("expectedDelivery").value =
    shipment.expectedDelivery
    ? shipment.expectedDelivery.substring(0, 10)
    : "";

    document.getElementById(

        "createShipment"

    ).scrollIntoView({

        behavior: "smooth"

    });

    showSuccess(

        "Shipment loaded for editing."

    );

}

// ======================================================
// END PART 4
// ======================================================
// ======================================================
// PART 5
// DELETE SHIPMENT
// UPDATE LOCATION
// ======================================================

// ======================================================
// DELETE SHIPMENT
// ======================================================

function deleteShipment(id) {

    deleteShipmentId = id;

    document.getElementById(

        "deleteModal"

    ).style.display = "flex";

}

// ======================================================
// CLOSE DELETE MODAL
// ======================================================

function closeDeleteModal() {

    deleteShipmentId = null;

    document.getElementById(

        "deleteModal"

    ).style.display = "none";

}

// ======================================================
// CONFIRM DELETE
// ======================================================

document.getElementById(

    "confirmDelete"

).addEventListener(

    "click",

    async function () {

        if (!deleteShipmentId) return;

        try {

            showLoading(

                "Deleting Shipment..."

            );

            await axios.delete(

                `${API.shipments}/${deleteShipmentId}`

            );

            hideLoading();

            closeDeleteModal();

            showSuccess(

                "Shipment deleted successfully."

            );

            await loadShipments();

        }

        catch (error) {

            hideLoading();

            console.error(error);

            showError(

                error.response?.data?.message ||

                "Unable to delete shipment."

            );

        }

    }

);

// ======================================================
// UPDATE LOCATION
// ======================================================

function updateLocation(id) {

    const shipment = shipments.find(

        s => s._id === id

    );

    if (!shipment) {

        return showError(

            "Shipment not found."

        );

    }

    selectedShipment = shipment;

    document.getElementById(

        "newLocation"

    ).value = shipment.currentLocation || "";

    document.getElementById(

        "newLatitude"

    ).value = shipment.currentLatitude || "";

    document.getElementById(

        "newLongitude"

    ).value = shipment.currentLongitude || "";

    document.getElementById(

        "newStatus"

    ).value = shipment.status || "Shipment Created";

    document.getElementById(

        "locationModal"

    ).style.display = "flex";

}

// ======================================================
// CLOSE LOCATION MODAL
// ======================================================

function closeLocationModal() {

    document.getElementById(

        "locationModal"

    ).style.display = "none";

}

// ======================================================
// SAVE LOCATION UPDATE
// ======================================================

async function saveLocationUpdate() {

    if (!selectedShipment) {

        return;

    }

    try {

        showLoading(

            "Updating Shipment..."

        );

        await axios.put(

            `${API.shipments}/${selectedShipment._id}`,

            {

                currentLocation:

                document.getElementById(

                    "newLocation"

                ).value.trim(),

                currentLatitude:

                Number(

                    document.getElementById(

                        "newLatitude"

                    ).value

                ),

                currentLongitude:

                Number(

                    document.getElementById(

                        "newLongitude"

                    ).value

                ),

                status:

                document.getElementById(

                    "newStatus"

                ).value

            }

        );

        hideLoading();

        closeLocationModal();

        showSuccess(

            "Shipment updated successfully."

        );

        await loadShipments();

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Unable to update shipment."

        );

    }

}

// ======================================================
// END PART 5
// ======================================================
// ======================================================
// PART 6
// LEAFLET MAP
// LOCATION PICKER
// ======================================================

// ======================================================
// OPEN MAP
// ======================================================

function openMap(mode) {

    mapMode = mode;

    document.getElementById(

        "mapModal"

    ).style.display = "flex";

    setTimeout(initMap, 200);

}

// ======================================================
// CURRENT LOCATION
// ======================================================

function pickCurrentLocation() {

    openMap("current");

}

// ======================================================
// DESTINATION
// ======================================================

function pickDestination() {

    openMap("destination");

}

// ======================================================
// UPDATE LOCATION
// ======================================================

function pickUpdateLocation() {

    openMap("update");

}

// ======================================================
// CLOSE MAP
// ======================================================

function closeMapModal() {

    document.getElementById(

        "mapModal"

    ).style.display = "none";

    if (adminMap) {

        adminMap.remove();

        adminMap = null;

        mapMarker = null;

    }

}

// ======================================================
// INITIALIZE MAP
// ======================================================

function initMap() {

    if (adminMap) {

        adminMap.remove();

    }

    adminMap = L.map("adminMap").setView(

        [20, 0],

        2

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:

            "&copy; OpenStreetMap",

            maxZoom: 19

        }

    ).addTo(adminMap);

    adminMap.on("click", function (e) {

        if (mapMarker) {

            adminMap.removeLayer(

                mapMarker

            );

        }

        mapMarker = L.marker(

            e.latlng

        ).addTo(adminMap);

    });

}

// ======================================================
// SAVE LOCATION
// ======================================================

function savePickedLocation() {

    if (!mapMarker) {

        return showError(

            "Please select a location."

        );

    }

    const lat =

    mapMarker.getLatLng().lat.toFixed(6);

    const lng =

    mapMarker.getLatLng().lng.toFixed(6);

    if (mapMode === "current") {

        document.getElementById(

            "currentLatitude"

        ).value = lat;

        document.getElementById(

            "currentLongitude"

        ).value = lng;

    }

    else if (mapMode === "destination") {

        document.getElementById(

            "destinationLatitude"

        ).value = lat;

        document.getElementById(

            "destinationLongitude"

        ).value = lng;

    }

    else {

        document.getElementById(

            "newLatitude"

        ).value = lat;

        document.getElementById(

            "newLongitude"

        ).value = lng;

    }

    showSuccess(

        "Coordinates selected."

    );

    closeMapModal();

}

// ======================================================
// USE CURRENT LOCATION
// ======================================================

function useCurrentLocation() {

    if (!navigator.geolocation) {

        return showError(

            "Geolocation is not supported."

        );

    }

    showLoading(

        "Detecting your location..."

    );

    navigator.geolocation.getCurrentPosition(

        function (position) {

            hideLoading();

            document.getElementById(

                "currentLatitude"

            ).value =

            position.coords.latitude.toFixed(6);

            document.getElementById(

                "currentLongitude"

            ).value =

            position.coords.longitude.toFixed(6);

            showSuccess(

                "Current location detected."

            );

        },

        function () {

            hideLoading();

            showError(

                "Unable to detect location."

            );

        }

    );

}

// ======================================================
// USE CURRENT LOCATION (UPDATE)
// ======================================================

function useCurrentLocationUpdate() {

    if (!navigator.geolocation) {

        return showError(

            "Geolocation is not supported."

        );

    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            document.getElementById(

                "newLatitude"

            ).value =

            position.coords.latitude.toFixed(6);

            document.getElementById(

                "newLongitude"

            ).value =

            position.coords.longitude.toFixed(6);

            showSuccess(

                "Location updated."

            );

        },

        function () {

            showError(

                "Unable to detect location."

            );

        }

    );

}

// ======================================================
// END PART 6
// ======================================================
// ======================================================
// PART 7
// RECEIPT SYSTEM
// ======================================================

// ======================================================
// PREVIEW RECEIPT
// ======================================================

function previewReceipt(id = null) {

    let shipment;

    if (id) {

        shipment = shipments.find(

            s => s._id === id

        );

    } else {

        shipment = {

            trackingNumber:
            generateTrackingNumber(),

            senderName:
            document.getElementById("senderName").value,

            senderPhone:
            document.getElementById("senderPhone").value,

            senderEmail:
            document.getElementById("senderEmail").value,

            receiverName:
            document.getElementById("receiverName").value,

            receiverPhone:
            document.getElementById("receiverPhone").value,

            receiverEmail:
            document.getElementById("receiverEmail").value,

            receiverAddress:
            document.getElementById("receiverAddress").value,

            shipment:
            document.getElementById("shipment").value,

            origin:
            document.getElementById("origin").value,

            destination:
            document.getElementById("destination").value,

            status:
            document.getElementById("status").value,

            expectedDelivery:
            document.getElementById("expectedDelivery").value

        };

    }

    if (!shipment) {

        return showError(

            "Shipment not found."

        );

    }

    selectedShipment = shipment;

    document.getElementById(

        "receiptContent"

    ).innerHTML = `

<table class="receipt-table">

<tr>

<td><strong>Tracking Number</strong></td>

<td>${shipment.trackingNumber}</td>

</tr>

<tr>

<td><strong>Sender</strong></td>

<td>${shipment.senderName}</td>

</tr>

<tr>

<td><strong>Sender Phone</strong></td>

<td>${shipment.senderPhone}</td>

</tr>

<tr>

<td><strong>Sender Email</strong></td>

<td>${shipment.senderEmail}</td>

</tr>

<tr>

<td><strong>Receiver</strong></td>

<td>${shipment.receiverName}</td>

</tr>

<tr>

<td><strong>Receiver Phone</strong></td>

<td>${shipment.receiverPhone}</td>

</tr>

<tr>

<td><strong>Receiver Email</strong></td>

<td>${shipment.receiverEmail}</td>

</tr>

<tr>

<td><strong>Receiver Address</strong></td>

<td>${shipment.receiverAddress}</td>

</tr>

<tr>

<td><strong>Shipment</strong></td>

<td>${shipment.shipment}</td>

</tr>

<tr>

<td><strong>Origin</strong></td>

<td>${shipment.origin}</td>

</tr>

<tr>

<td><strong>Destination</strong></td>

<td>${shipment.destination}</td>

</tr>

<tr>

<td><strong>Status</strong></td>

<td>${shipment.status}</td>

</tr>

<tr>

<td><strong>Expected Delivery</strong></td>

<td>${formatDate(

shipment.expectedDelivery

)}</td>

</tr>

</table>

<br>

<div
id="barcode"
style="text-align:center;">
</div>

<br>

<div
id="qrcode"
style="display:flex;
justify-content:center;">
</div>

`;

    document.getElementById(

        "receiptModal"

    ).style.display = "flex";

    document.getElementById(

        "barcode"

    ).innerHTML =

    `<svg id="barcodeSVG"></svg>`;

    JsBarcode(

        "#barcodeSVG",

        shipment.trackingNumber,

        {

            format: "CODE128",

            width: 2,

            height: 60,

            displayValue: true

        }

    );

    document.getElementById(

        "qrcode"

    ).innerHTML = "";

    new QRCode(

        document.getElementById(

            "qrcode"

        ),

        {

            text: shipment.trackingNumber,

            width: 140,

            height: 140

        }

    );

}

// ======================================================
// CLOSE RECEIPT
// ======================================================

function closeReceiptModal() {

    document.getElementById(

        "receiptModal"

    ).style.display = "none";

}

// ======================================================
// PRINT RECEIPT
// ======================================================

function printReceipt() {

    const printWindow =

    window.open("", "PRINT");

    printWindow.document.write(`

<html>

<head>

<title>

Shipment Receipt

</title>

<style>

body{

font-family:Poppins,sans-serif;

padding:40px;

}

table{

width:100%;

border-collapse:collapse;

}

td{

border:1px solid #ddd;

padding:10px;

}

h2{

color:#0d6efd;

}

</style>

</head>

<body>

${document.getElementById(

"receiptPreview"

).innerHTML}

</body>

</html>

`);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

    printWindow.close();

}

// ======================================================
// OPEN RECEIPT PAGE
// ======================================================

function openReceiptPage() {

    if (!selectedShipment) {

        return showError(

            "Please select a shipment."

        );

    }

    window.open(

        `receipt.html?tracking=${selectedShipment.trackingNumber}`,

        "_blank"

    );

}

// ======================================================
// RECEIPT HISTORY
// ======================================================

function showReceiptHistory() {

    Swal.fire({

        icon: "info",

        title: "Receipt History",

        text:

        "Receipt history will be available in a future update."

    });

}

// ======================================================
// END PART 7
// ======================================================
// ======================================================
// PART 8
// FINAL UTILITIES
// ======================================================

// ======================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ======================================================

window.onclick = function (event) {

    const modals = [

        "shipmentModal",

        "mapModal",

        "receiptModal",

        "deleteModal",

        "locationModal"

    ];

    modals.forEach(id => {

        const modal = document.getElementById(id);

        if (

            modal &&

            event.target === modal

        ) {

            modal.style.display = "none";

        }

    });

};

// ======================================================
// ESC KEY CLOSE
// ======================================================

document.addEventListener(

    "keydown",

    function (e) {

        if (e.key !== "Escape") return;

        closeShipmentModal();

        closeMapModal();

        closeReceiptModal();

        closeDeleteModal();

        closeLocationModal();

    }

);

// ======================================================
// AUTO SCROLL TO TOP
// ======================================================

function scrollTopSmooth() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ======================================================
// RESET SELECTIONS
// ======================================================

function resetSelections() {

    selectedShipment = null;

    selectedShipmentId = null;

    deleteShipmentId = null;

}

// ======================================================
// PAGE EXIT
// ======================================================

window.addEventListener(

    "beforeunload",

    function () {

        if (adminMap) {

            adminMap.remove();

            adminMap = null;

        }

    }

);

// ======================================================
// DASHBOARD READY
// ======================================================

console.log(

    "✅ LinkWorld Express Dashboard Ready"

);

// ======================================================
// END OF DASHBOARD.JS
// ======================================================
