// ======================================================
// LINKWORLD EXPRESS
// Dashboard JavaScript
// Part 1
// ======================================================

const API_URL = "https://linkworld-express2-1.onrender.com/api/shipments";

let shipments = [];

let selectedShipment = null;

let map = null;

let marker = null;

let destinationMarker = null;

let selectedLatitude = null;

let selectedLongitude = null;

let locationTarget = null;

// ======================================================
// CHECK LOGIN
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("adminToken");

    if (!token) {

        window.location.href = "admin.html";

        return;

    }

    loadDashboard();

});

// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {

    await loadShipments();

}

// ======================================================
// LOAD SHIPMENTS
// ======================================================

async function loadShipments() {

    try {

        showLoading("Loading shipments...");

        const token = localStorage.getItem("adminToken");

        const response = await axios.get(API_URL, {

            headers: {

                Authorization: `Bearer ${token}`

            }

        });

        shipments = response.data.data || [];

        renderShipments();

        updateDashboardCards();

        hideLoading();

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Unable to load shipments."

        );

    }

}

// ======================================================
// UPDATE DASHBOARD CARDS
// ======================================================

function updateDashboardCards() {

    document.getElementById("shipmentCount").textContent = shipments.length;

    document.getElementById("transitCount").textContent =

        shipments.filter(

            s => s.status === "In Transit"

        ).length;

    document.getElementById("deliveredCount").textContent =

        shipments.filter(

            s => s.status === "Delivered"

        ).length;

    document.getElementById("pendingCount").textContent =

        shipments.filter(

            s => s.status !== "Delivered"

        ).length;

}

// ======================================================
// SHOW CREATE SHIPMENT
// ======================================================

function showCreateShipment() {

    document

    .getElementById("createShipment")

    .scrollIntoView({

        behavior: "smooth"

    });

}

// ======================================================
// SHOW DASHBOARD
// ======================================================

function showDashboard() {

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}
// ======================================================
// CREATE SHIPMENT
// ======================================================

async function createShipment() {

    try {

        const token = localStorage.getItem("adminToken");

        const shipmentData = {

            sender: document.getElementById("senderName").value.trim(),

            receiver: document.getElementById("receiverName").value.trim(),

            senderPhone: document.getElementById("senderPhone").value.trim(),

            senderEmail: document.getElementById("senderEmail").value.trim(),

            receiverPhone: document.getElementById("receiverPhone").value.trim(),

            receiverEmail: document.getElementById("receiverEmail").value.trim(),

            receiverAddress: document.getElementById("receiverAddress").value.trim(),

            shipment: document.getElementById("shipment").value.trim(),

            origin: document.getElementById("origin").value.trim(),

            currentLocation: document.getElementById("currentLocation").value.trim(),

            destination: document.getElementById("destination").value.trim(),

            currentLatitude: Number(

                document.getElementById("currentLatitude").value

            ) || 0,

            currentLongitude: Number(

                document.getElementById("currentLongitude").value

            ) || 0,

            destinationLatitude: Number(

                document.getElementById("destinationLatitude").value

            ) || 0,

            destinationLongitude: Number(

                document.getElementById("destinationLongitude").value

            ) || 0,

            status: document.getElementById("status").value,

            expectedDelivery:

                document.getElementById("expectedDelivery").value

        };

        if (

            shipmentData.sender === "" ||

            shipmentData.receiver === "" ||

            shipmentData.origin === "" ||

            shipmentData.destination === ""

        ) {

            showError(

                "Please complete all required fields."

            );

            return;

        }

        showLoading(

            "Creating shipment..."

        );

        const response = await axios.post(

            API_URL,

            shipmentData,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        hideLoading();

        showSuccess(

            "Shipment created successfully."

        );

        Swal.fire({

            icon:"success",

            title:"Shipment Created",

            html:`

            <b>Tracking Number</b>

            <br><br>

            <h2 style="color:#0d6efd;">

            ${response.data.trackingNumber}

            </h2>

            `

        });

        clearShipmentForm();

        loadShipments();

    }

    catch(error){

        hideLoading();

        console.error(error);

        showError(

            error.response?.data?.message ||

            "Unable to create shipment."

        );

    }

}

// ======================================================
// CLEAR FORM
// ======================================================

function clearShipmentForm(){

    document.getElementById("senderName").value="";

    document.getElementById("senderPhone").value="";

    document.getElementById("senderEmail").value="";

    document.getElementById("receiverName").value="";

    document.getElementById("receiverPhone").value="";

    document.getElementById("receiverEmail").value="";

    document.getElementById("receiverAddress").value="";

    document.getElementById("shipment").value="";

    document.getElementById("origin").value="";

    document.getElementById("currentLocation").value="";

    document.getElementById("destination").value="";

    document.getElementById("currentLatitude").value="";

    document.getElementById("currentLongitude").value="";

    document.getElementById("destinationLatitude").value="";

    document.getElementById("destinationLongitude").value="";

    document.getElementById("status").selectedIndex=0;

    document.getElementById("expectedDelivery").value="";

}

// ======================================================
// PREVIEW RECEIPT
// ======================================================

function previewReceipt(){

    showSuccess(

        "Save the shipment first before generating a receipt."

    );

}

// ======================================================
// LOGOUT
// ======================================================

function logout(){

    Swal.fire({

        title:"Logout?",

        text:"Do you want to logout?",

        icon:"question",

        showCancelButton:true,

        confirmButtonText:"Logout"

    }).then(result=>{

        if(result.isConfirmed){

            localStorage.removeItem("adminToken");

            window.location.href="admin.html";

        }

    });

}
// ======================================================
// RENDER SHIPMENTS
// ======================================================

function renderShipments() {

    const table = document.getElementById("shipmentTable");

    if (!shipments.length) {

        table.innerHTML = `

        <tr>

            <td colspan="9" style="text-align:center;padding:40px;">

                No Shipments Found

            </td>

        </tr>

        `;

        return;

    }

    table.innerHTML = "";

    shipments.forEach(shipment => {

        table.innerHTML += `

        <tr>

            <td>${shipment.trackingNumber}</td>

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

                ${shipment.expectedDelivery ?

                new Date(

                shipment.expectedDelivery

                ).toLocaleDateString()

                : "-"}

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

}

// ======================================================
// VIEW SHIPMENT
// ======================================================

function viewShipment(id){

    const shipment = shipments.find(

        s => s._id === id

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
// GET RECEIPT
// ======================================================

function getReceipt(trackingNumber){

    window.location.href=

    `receipt.html?tracking=${trackingNumber}`;

}

// ======================================================
// EDIT SHIPMENT
// ======================================================

function editShipment(id){

    const shipment=shipments.find(

        s=>s._id===id

    );

    if(!shipment) return;

    showCreateShipment();

    document.getElementById("senderName").value=shipment.sender;

    document.getElementById("receiverName").value=shipment.receiver;

    document.getElementById("shipment").value=shipment.shipment;

    document.getElementById("origin").value=shipment.origin;

    document.getElementById("currentLocation").value=shipment.currentLocation;

    document.getElementById("destination").value=shipment.destination;

    document.getElementById("status").value=shipment.status;

    document.getElementById("expectedDelivery").value=

    shipment.expectedDelivery ?

    shipment.expectedDelivery.substring(0,10)

    : "";

    selectedShipment=id;

}

// ======================================================
// DELETE SHIPMENT
// ======================================================

async function deleteShipment(id){

    const result=await Swal.fire({

        title:"Delete Shipment?",

        text:"This cannot be undone.",

        icon:"warning",

        showCancelButton:true,

        confirmButtonColor:"#dc3545",

        confirmButtonText:"Delete"

    });

    if(!result.isConfirmed) return;

    try{

        showLoading(

            "Deleting shipment..."

        );

        const token=

        localStorage.getItem("adminToken");

        await axios.delete(

            `${API_URL}/${id}`,

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        hideLoading();

        showSuccess(

            "Shipment deleted."

        );

        loadShipments();

    }

    catch(error){

        hideLoading();

        showError(

            "Unable to delete shipment."

        );

    }

}
// ======================================================
// UPDATE SHIPMENT
// ======================================================

async function updateShipment() {

    if (!selectedShipment) {

        createShipment();

        return;

    }

    try {

        const token = localStorage.getItem("adminToken");

        const shipmentData = {

            sender: document.getElementById("senderName").value.trim(),

            receiver: document.getElementById("receiverName").value.trim(),

            senderPhone: document.getElementById("senderPhone").value.trim(),

            senderEmail: document.getElementById("senderEmail").value.trim(),

            receiverPhone: document.getElementById("receiverPhone").value.trim(),

            receiverEmail: document.getElementById("receiverEmail").value.trim(),

            receiverAddress: document.getElementById("receiverAddress").value.trim(),

            shipment: document.getElementById("shipment").value.trim(),

            origin: document.getElementById("origin").value.trim(),

            currentLocation: document.getElementById("currentLocation").value.trim(),

            destination: document.getElementById("destination").value.trim(),

            currentLatitude: Number(document.getElementById("currentLatitude").value),

            currentLongitude: Number(document.getElementById("currentLongitude").value),

            destinationLatitude: Number(document.getElementById("destinationLatitude").value),

            destinationLongitude: Number(document.getElementById("destinationLongitude").value),

            status: document.getElementById("status").value,

            expectedDelivery: document.getElementById("expectedDelivery").value

        };

        showLoading("Updating shipment...");

        const tokenHeader = {

            headers: {

                Authorization: `Bearer ${token}`

            }

        };

        await axios.put(

            `${API_URL}/${selectedShipment}`,

            shipmentData,

            tokenHeader

        );

        hideLoading();

        showSuccess("Shipment updated successfully.");

        selectedShipment = null;

        clearShipmentForm();

        loadShipments();

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
// UPDATE LOCATION
// ======================================================

function updateLocation(id){

    selectedShipment = id;

    document

    .getElementById("locationModal")

    .style.display="flex";

}

// ======================================================
// CLOSE LOCATION MODAL
// ======================================================

function closeLocationModal(){

    document

    .getElementById("locationModal")

    .style.display="none";

}

// ======================================================
// SAVE LOCATION UPDATE
// ======================================================

async function saveLocationUpdate(){

    if(!selectedShipment) return;

    try{

        const token=

        localStorage.getItem("adminToken");

        showLoading(

            "Updating location..."

        );

        await axios.put(

            `${API_URL}/${selectedShipment}`,

            {

                currentLocation:

                document.getElementById("newLocation").value,

                currentLatitude:Number(

                document.getElementById("newLatitude").value

                ),

                currentLongitude:Number(

                document.getElementById("newLongitude").value

                ),

                status:

                document.getElementById("newStatus").value

            },

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        hideLoading();

        closeLocationModal();

        showSuccess(

            "Shipment location updated."

        );

        loadShipments();

    }

    catch(error){

        hideLoading();

        console.error(error);

        showError(

            "Unable to update location."

        );

    }

}

// ======================================================
// LOADING
// ======================================================

function showLoading(text){

    document.getElementById(

        "loadingOverlay"

    ).style.display="flex";

    document.getElementById(

        "loadingText"

    ).textContent=text;

}

function hideLoading(){

    document.getElementById(

        "loadingOverlay"

    ).style.display="none";

}

// ======================================================
// SUCCESS
// ======================================================

function showSuccess(message){

    const toast=

    document.getElementById("successToast");

    document.getElementById(

        "successMessage"

    ).textContent=message;

    toast.style.display="flex";

    setTimeout(()=>{

        toast.style.display="none";

    },3000);

}

// ======================================================
// ERROR
// ======================================================

function showError(message){

    const toast=

    document.getElementById("errorToast");

    document.getElementById(

        "errorMessage"

    ).textContent=message;

    toast.style.display="flex";

    setTimeout(()=>{

        toast.style.display="none";

    },4000);

}
// ======================================================
// LINKWORLD EXPRESS
// Dashboard JavaScript
// Part 5
// ======================================================

// ======================================================
// PICK CURRENT LOCATION
// ======================================================

function pickCurrentLocation(){

    locationTarget="current";

    openMap();

}

// ======================================================
// PICK DESTINATION
// ======================================================

function pickDestination(){

    locationTarget="destination";

    openMap();

}

// ======================================================
// OPEN MAP
// ======================================================

function openMap(){

    document.getElementById(

        "mapModal"

    ).style.display="flex";

    setTimeout(initMap,300);

}

// ======================================================
// CLOSE MAP
// ======================================================

function closeMapModal(){

    document.getElementById(

        "mapModal"

    ).style.display="none";

}

// ======================================================
// INIT LEAFLET MAP
// ======================================================

function initMap(){

    if(map){

        map.remove();

    }

    map=L.map("adminMap").setView([20,0],2);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap"

        }

    ).addTo(map);

    map.on("click",function(e){

        selectedLatitude=e.latlng.lat;

        selectedLongitude=e.latlng.lng;

        if(marker){

            map.removeLayer(marker);

        }

        marker=L.marker([

            selectedLatitude,

            selectedLongitude

        ]).addTo(map);

    });

}

// ======================================================
// SAVE PICKED LOCATION
// ======================================================

function savePickedLocation(){

    if(selectedLatitude===null) return;

    if(locationTarget==="current"){

        document.getElementById(

            "currentLatitude"

        ).value=selectedLatitude.toFixed(6);

        document.getElementById(

            "currentLongitude"

        ).value=selectedLongitude.toFixed(6);

    }

    if(locationTarget==="destination"){

        document.getElementById(

            "destinationLatitude"

        ).value=selectedLatitude.toFixed(6);

        document.getElementById(

            "destinationLongitude"

        ).value=selectedLongitude.toFixed(6);

    }

    closeMapModal();

}

// ======================================================
// USE BROWSER LOCATION
// ======================================================

function useCurrentLocation(){

    if(!navigator.geolocation){

        showError(

            "Geolocation not supported."

        );

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            document.getElementById(

                "currentLatitude"

            ).value=

            position.coords.latitude.toFixed(6);

            document.getElementById(

                "currentLongitude"

            ).value=

            position.coords.longitude.toFixed(6);

            showSuccess(

                "Current location detected."

            );

        },

        function(){

            showError(

                "Unable to retrieve your location."

            );

        }

    );

}

// ======================================================
// UPDATE LOCATION USING BROWSER
// ======================================================

function useCurrentLocationUpdate(){

    if(!navigator.geolocation){

        return;

    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            document.getElementById(

                "newLatitude"

            ).value=

            position.coords.latitude.toFixed(6);

            document.getElementById(

                "newLongitude"

            ).value=

            position.coords.longitude.toFixed(6);

        }

    );

}

// ======================================================
// OPEN RECEIPT PAGE
// ======================================================

function openReceiptPage(){

    if(!selectedShipment){

        showError(

            "No shipment selected."

        );

        return;

    }

    const shipment=shipments.find(

        s=>s._id===selectedShipment ||

        s===selectedShipment

    );

    if(!shipment) return;

    window.open(

        `receipt.html?tracking=${shipment.trackingNumber}`,

        "_blank"

    );

}

// ======================================================
// PRINT RECEIPT
// ======================================================

function printReceipt(){

    window.print();

}

// ======================================================
// CLOSE RECEIPT
// ======================================================

function closeReceiptModal(){

    document.getElementById(

        "receiptModal"

    ).style.display="none";

}

// ======================================================
// CLOSE DELETE MODAL
// ======================================================

function closeDeleteModal(){

    document.getElementById(

        "deleteModal"

    ).style.display="none";

}

// ======================================================
// CLOSE MODALS
// ======================================================

window.onclick=function(event){

    document

    .querySelectorAll(".modal")

    .forEach(function(modal){

        if(event.target===modal){

            modal.style.display="none";

        }

    });

};

// ======================================================
// ESC KEY
// ======================================================

document.addEventListener(

    "keydown",

    function(e){

        if(e.key==="Escape"){

            document

            .querySelectorAll(".modal")

            .forEach(function(modal){

                modal.style.display="none";

            });

        }

    }

);

// ======================================================
// END
// ======================================================
