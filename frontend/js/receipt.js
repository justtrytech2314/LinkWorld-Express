/* ======================================================
LINKWORLD EXPRESS
RECEIPT JS
PART 1
LOAD SHIPMENT FROM LOCAL STORAGE
====================================================== */

"use strict";


// ======================================================
// GLOBAL
// ======================================================

let shipment = null;


// ======================================================
// PAGE READY
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    loadReceipt();

});


// ======================================================
// LOAD RECEIPT
// ======================================================

function loadReceipt(){

    // Read shipment saved by dashboard
    const savedShipment =
    localStorage.getItem("receiptShipment");


    if(!savedShipment){

        alert(
            "No shipment found.\nPlease open the receipt from the Dashboard."
        );

        window.location.href = "dashboard.html";

        return;

    }


    shipment = JSON.parse(savedShipment);


    // Fill receipt
    populateReceipt();


    // Hide loading screen
    const loading =
    document.getElementById("loading");

    if(loading){

        setTimeout(()=>{

            loading.style.display="none";

        },600);

    }

}


// ======================================================
// POPULATE RECEIPT
// ======================================================

function populateReceipt(){

    if(!shipment) return;

    // Receipt Date
    document.getElementById("receiptDate").textContent =
    new Date().toLocaleString();

    // Tracking Number
    document.getElementById("trackingNumber").textContent =
    shipment.trackingNumber || "-";

    // Status
    document.getElementById("shipmentStatus").textContent =
    shipment.status || "-";

}
// ======================================================
// PART 2
// FILL SENDER & RECEIVER INFORMATION
// ======================================================

function populateReceipt(){

    if(!shipment) return;

    // =====================================
    // HEADER
    // =====================================

    document.getElementById("receiptDate").textContent =
    new Date().toLocaleString();

    document.getElementById("trackingNumber").textContent =
    shipment.trackingNumber || "-";

    document.getElementById("shipmentStatus").textContent =
    shipment.status || "-";


    // =====================================
    // SENDER
    // =====================================

    document.getElementById("senderName").textContent =
    shipment.sender?.name || "-";

    document.getElementById("senderPhone").textContent =
    shipment.sender?.phone || "-";

    document.getElementById("senderEmail").textContent =
    shipment.sender?.email || "-";


    // =====================================
    // RECEIVER
    // =====================================

    document.getElementById("receiverName").textContent =
    shipment.receiver?.name || "-";

    document.getElementById("receiverPhone").textContent =
    shipment.receiver?.phone || "-";

    document.getElementById("receiverEmail").textContent =
    shipment.receiver?.email || "-";

    document.getElementById("receiverAddress").textContent =
    shipment.receiver?.address || "-";

}
    // =====================================
    // SHIPMENT INFORMATION
    // =====================================

    document.getElementById("shipmentType").textContent =
    shipment.shipmentType || "-";

    document.getElementById("origin").textContent =
    shipment.origin || "-";

    document.getElementById("currentLocation").textContent =
    shipment.currentLocation || "-";

    document.getElementById("destination").textContent =
    shipment.destination || "-";

    document.getElementById("deliveryDate").textContent =
    shipment.expectedDelivery
        ? new Date(shipment.expectedDelivery).toLocaleDateString()
        : "-";

    document.getElementById("paymentStatus").textContent =
    shipment.paymentStatus || "Pending";


    // =====================================
    // GPS INFORMATION
    // =====================================

    document.getElementById("currentLatitude").textContent =
    shipment.currentLatitude ?? "-";

    document.getElementById("currentLongitude").textContent =
    shipment.currentLongitude ?? "-";

    document.getElementById("destinationLatitude").textContent =
    shipment.destinationLatitude ?? "-";

    document.getElementById("destinationLongitude").textContent =
    shipment.destinationLongitude ?? "-";


    // =====================================
    // DELIVERY PROGRESS
    // =====================================

    const progress =
    Number(shipment.progress || 0);

    document.getElementById("progressFill").style.width =
    progress + "%";

    document.getElementById("progressText").textContent =
    progress;


    // =====================================
    // BARCODE
    // =====================================

    document.getElementById("barcodeNumber").textContent =
    shipment.trackingNumber || "-";
        // =====================================
    // ROUTE HISTORY
    // =====================================

    const routeBody =
    document.getElementById("routeHistory");

    routeBody.innerHTML = "";

    const today =
    new Date().toLocaleString();

    const history = [

        {
            date: today,
            location: shipment.origin || "-",
            status: "Shipment Created",
            coordinates:
            `${shipment.currentLatitude ?? "-"}, ${shipment.currentLongitude ?? "-"}`
        },

        {
            date: today,
            location: shipment.currentLocation || "-",
            status: shipment.status || "In Transit",
            coordinates:
            `${shipment.currentLatitude ?? "-"}, ${shipment.currentLongitude ?? "-"}`
        },

        {
            date: shipment.expectedDelivery
                ? new Date(shipment.expectedDelivery).toLocaleDateString()
                : "-",
            location: shipment.destination || "-",
            status: "Expected Destination",
            coordinates:
            `${shipment.destinationLatitude ?? "-"}, ${shipment.destinationLongitude ?? "-"}`
        }

    ];



    history.forEach(item=>{

        routeBody.innerHTML += `

        <tr>

            <td>${item.date}</td>

            <td>${item.location}</td>

            <td>${item.status}</td>

            <td>${item.coordinates}</td>

        </tr>

        `;

    });


    // ======================================================
// PRINT RECEIPT
// ======================================================

function printReceipt(){

    window.print();

}



// ======================================================
// DOWNLOAD RECEIPT
// ======================================================

function downloadReceipt(){

    window.print();

}
/* ======================================================
LINKWORLD EXPRESS
RECEIPT JS
PART 5
PREMIUM FINISHING
====================================================== */



// ======================================================
// STATUS COLOR
// ======================================================

document.addEventListener("DOMContentLoaded",()=>{

    setTimeout(()=>{

        const status=document.getElementById("shipmentStatus");

        if(!status) return;

        const value=status.textContent.toLowerCase();

        status.style.padding="8px 18px";
        status.style.borderRadius="30px";
        status.style.fontWeight="700";
        status.style.display="inline-block";

        if(value.includes("deliver")){

            status.style.background="#dcfce7";
            status.style.color="#15803d";

        }

        else if(

            value.includes("transit") ||

            value.includes("picked") ||

            value.includes("pickup")

        ){

            status.style.background="#dbeafe";
            status.style.color="#2563eb";

        }

        else if(value.includes("hold")){

            status.style.background="#fee2e2";
            status.style.color="#dc2626";

        }

        else{

            status.style.background="#fef3c7";
            status.style.color="#b45309";

        }

    },500);

});




// ======================================================
// PROGRESS ANIMATION
// ======================================================

window.addEventListener("load",()=>{

    const fill=document.getElementById("progressFill");

    const text=document.getElementById("progressText");

    if(!fill||!shipment) return;

    let current=0;

    const target=Number(shipment.progress||0);

    fill.style.width="0%";

    const timer=setInterval(()=>{

        current++;

        fill.style.width=current+"%";

        text.textContent=current;

        if(current>=target){

            clearInterval(timer);

        }

    },20);

});




// ======================================================
// BARCODE STYLE
// ======================================================

window.addEventListener("load",()=>{

    const barcode=document.querySelector(".barcode-lines");

    if(!barcode) return;

    barcode.innerHTML="";

    let code="";

    for(let i=0;i<120;i++){

        code+=Math.random()>0.5 ? "|" : "||";

    }

    barcode.textContent=code;

});




// ======================================================
// AUTO FOOTER YEAR
// ======================================================

window.addEventListener("load",()=>{

    const footer=document.querySelector(".receipt-footer");

    if(!footer) return;

    const year=new Date().getFullYear();

    footer.insertAdjacentHTML(

        "beforeend",

        `

        <div style="margin-top:25px;font-size:13px;color:#666;text-align:center;width:100%;">

        © ${year} LinkWorld Express. All Rights Reserved.

        </div>

        `

    );

});




// ======================================================
// AUTO PRINT TITLE
// ======================================================

window.addEventListener("load",()=>{

    if(shipment){

        document.title=

        `Receipt - ${shipment.trackingNumber}`;

    }

});




// ======================================================
// RECEIPT GENERATED TIME
// ======================================================

window.addEventListener("load",()=>{

    console.log(

        "Receipt Generated:",

        new Date().toLocaleString()

    );

});
