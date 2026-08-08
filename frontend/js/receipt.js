/* ======================================================
LINKWORLD EXPRESS
RECEIPT PAGE
Loads a shipment (from the dashboard hand-off, or by
?tracking= in the URL) and renders the printable receipt.
====================================================== */

"use strict";


// ======================================================
// LOAD SHIPMENT
// ======================================================

let shipment = null;

document.addEventListener("DOMContentLoaded", () => {

    loadReceipt();

});

async function loadReceipt(){

    try{

        // Shipment handed off from the admin dashboard.
        const saved = localStorage.getItem("receiptShipment");

        if(saved){

            shipment = JSON.parse(saved);

            populateReceipt();

            hideLoading();

            return;

        }

        // Fallback: a shareable link, e.g. receipt.html?tracking=LWX...
        const params = new URLSearchParams(window.location.search);

        const trackingNumber =
            (params.get("tracking") || "").trim().toUpperCase();

        if(!trackingNumber){

            Swal.fire({
                icon:"error",
                title:"No Shipment Found",
                text:"Please open the receipt from the Dashboard, or provide a tracking number."
            }).then(()=>{

                window.location.href = "dashboard.html";

            });

            return;

        }

        const response = await fetch(
            `${LWX_API}/shipments/receipt/${trackingNumber}`
        );

        const data = await response.json();

        if(!data.success){

            Swal.fire({
                icon:"error",
                title:"Shipment Not Found",
                text:data.message || "Unable to locate this shipment."
            }).then(()=>{

                window.location.href = "tracking.html";

            });

            return;

        }

        shipment = data.shipment;

        populateReceipt();

        hideLoading();

    }

    catch(error){

        console.error("RECEIPT ERROR:", error);

        Swal.fire({
            icon:"error",
            title:"Connection Error",
            text:"Unable to load this receipt right now."
        });

        hideLoading();

    }

}


function hideLoading(){

    const loading = document.getElementById("loading");

    if(loading){

        setTimeout(()=>{

            loading.style.display = "none";

        },400);

    }

}


// ======================================================
// SAFE TEXT UPDATE
// ======================================================

function setText(id,value){

    const element = document.getElementById(id);

    if(element){

        element.textContent = (value === 0) ? "0" : (value || "-");

    }

}


function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleDateString("en-US",{
        year:"numeric",
        month:"short",
        day:"numeric"
    });

}


function formatDateTime(date){

    if(!date) return "-";

    return new Date(date).toLocaleString("en-US",{
        year:"numeric",
        month:"short",
        day:"numeric",
        hour:"2-digit",
        minute:"2-digit"
    });

}


// ======================================================
// POPULATE RECEIPT
// ======================================================

function populateReceipt(){

    if(!shipment) return;

    setText("trackingNumber", shipment.trackingNumber);
    setText("shipmentStatus", shipment.status);
    setText("shipmentType", shipment.shipmentType);
    setText("paymentStatus", shipment.paymentStatus);
    setText("shipmentDescription", shipment.shipmentDescription);
    setText("packageWeight", shipment.packageWeight != null ? `${shipment.packageWeight} kg` : "-");
    setText("packageValue", shipment.packageValue != null ? `$${shipment.packageValue}` : "-");
    setText("expectedDelivery", formatDate(shipment.expectedDelivery));

    setText("origin", shipment.origin);
    setText("currentLocation", shipment.currentLocation);
    setText("destination", shipment.destination);

    setText("senderName", shipment.sender?.name);
    setText("senderPhone", shipment.sender?.phone);
    setText("senderEmail", shipment.sender?.email);
    setText("senderAddress", shipment.sender?.address);

    setText("receiverName", shipment.receiver?.name);
    setText("receiverPhone", shipment.receiver?.phone);
    setText("receiverEmail", shipment.receiver?.email);
    setText("receiverAddress", shipment.receiver?.address);

    buildHistory();

}


// ======================================================
// SHIPMENT HISTORY
// ======================================================

function buildHistory(){

    const container = document.getElementById("historyContainer");

    if(!container) return;

    container.innerHTML = "";

    const history = shipment.history || [];

    if(history.length === 0){

        container.innerHTML =
        `<div class="timeline-empty">No tracking history yet.</div>`;

        return;

    }

    const sorted = [...history].sort(
        (a,b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    sorted.forEach(item => {

        const row = document.createElement("div");

        row.className = "history-item";

        row.innerHTML = `
            <div class="history-icon">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="history-content">
                <h3>${item.status}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${item.location || "-"}</p>
                <span>${formatDateTime(item.timestamp)}</span>
            </div>
        `;

        container.appendChild(row);

    });

}


// ======================================================
// PRINT / DOWNLOAD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    const printBtn = document.getElementById("printReceipt");

    if(printBtn){

        printBtn.addEventListener("click", () => {

            window.print();

        });

    }

    const downloadBtn = document.getElementById("downloadPDF");

    if(downloadBtn){

        downloadBtn.addEventListener("click", () => {

            const container = document.getElementById("receiptContainer");

            if(!container || typeof html2pdf === "undefined") return;

            const fileName =
                `LinkWorld-Express-Receipt-${shipment?.trackingNumber || "shipment"}.pdf`;

            html2pdf().from(container).set({
                filename:fileName,
                margin:0.3,
                image:{ type:"jpeg", quality:0.98 },
                html2canvas:{ scale:2 },
                jsPDF:{ unit:"in", format:"letter", orientation:"portrait" }
            }).save();

        });

    }

});
