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

            loading.classList.add("hide");

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
    setText("issuedDate", formatDateTime(new Date()));
    applyStatusBadge();
    updateProgress();
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

    buildVerificationCodes();

}


// ======================================================
// STATUS BADGE COLOR
// ======================================================

function applyStatusBadge(){

    const el = document.getElementById("shipmentStatus");

    if(!el) return;

    el.classList.remove(
        "status-delivered",
        "status-transit",
        "status-pending",
        "status-cancelled"
    );

    const value = (shipment.status || "").toLowerCase();

    if(value.includes("deliver")){

        el.classList.add("status-delivered");

    }
    else if(value.includes("cancel")){

        el.classList.add("status-cancelled");

    }
    else if(
        value.includes("transit") ||
        value.includes("pickup") ||
        value.includes("picked") ||
        value.includes("facility") ||
        value.includes("out for")
    ){

        el.classList.add("status-transit");

    }
    else{

        el.classList.add("status-pending");

    }

}


// ======================================================
// DELIVERY PROGRESS BAR
// ======================================================

function updateProgress(){

    const bar = document.getElementById("progressBar");

    const text = document.getElementById("progressText");

    const progress = Number(shipment.progress || 0);

    if(bar) bar.style.width = `${progress}%`;

    if(text) text.textContent = `${progress}%`;

}


// ======================================================
// BARCODE + QR VERIFICATION CODES
// Generated from the real tracking number, not static art.
// ======================================================

function buildVerificationCodes(){

    const barcodeImg = document.getElementById("barcodeImage");

    if(barcodeImg && typeof JsBarcode !== "undefined"){

        try{

            JsBarcode(barcodeImg, shipment.trackingNumber, {
                format:"CODE128",
                lineColor:"#000000",
                width:2,
                height:60,
                displayValue:true,
                margin:8
            });

        }
        catch(error){

            console.error("BARCODE ERROR:", error);

        }

    }

    const qrImg = document.getElementById("qrCode");

    if(qrImg && typeof qrcode !== "undefined"){

        try{

            const verifyUrl =
                `${window.location.origin}${window.location.pathname.replace("receipt.html","tracking-result.html")}?tracking=${encodeURIComponent(shipment.trackingNumber)}`;

            const qr = qrcode(0, "M");

            qr.addData(verifyUrl);

            qr.make();

            qrImg.src = qr.createDataURL(6, 4);

        }
        catch(error){

            console.error("QR CODE ERROR:", error);

        }

    }

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
// ------------------------------------------------------
// Both buttons build the exact same single-page PDF (via
// html2pdf, sized to the actual content instead of a fixed
// physical page). Download saves it directly. Print opens
// it in a new tab so the browser's own PDF viewer handles
// printing - that respects the PDF's real page count, unlike
// fighting native @page pagination for content this tall.
// ======================================================

function buildReceiptPdf(){

    const container = document.getElementById("receiptContainer");

    if(!container || typeof html2pdf === "undefined"){

        return Promise.reject(new Error("PDF generator unavailable"));

    }

    const fileName =
        `LinkWorld-Express-Receipt-${shipment?.trackingNumber || "shipment"}.pdf`;

    // html2canvas captures relative to the current scroll position -
    // if the page is scrolled down (likely, since these buttons sit
    // at the bottom of a long receipt) the capture comes out with a
    // blank leading page. Snap to the top first.
    window.scrollTo(0,0);

    // html2canvas doesn't resolve the receiptFade keyframe animation
    // correctly and bakes in a faded opacity across the whole
    // capture - it's already played out on load, so strip it.
    container.style.animation = "none";

    // Hide the on-screen-only buttons before measuring, so the page
    // is sized to the real receipt content only, not the button bar.
    const hiddenEls = container.querySelectorAll(".no-print");

    const prevDisplay = Array.from(hiddenEls).map(el => el.style.display);

    hiddenEls.forEach(el => { el.style.display = "none"; });

    const restoreHidden = () => {
        hiddenEls.forEach((el,i) => { el.style.display = prevDisplay[i]; });
    };

    return new Promise((resolve) => {

        requestAnimationFrame(() => requestAnimationFrame(() => {

            const MARGIN_IN = 0.3;

            const PX_TO_IN = 1 / 96;

            const pageWidthIn = (container.scrollWidth * PX_TO_IN) + (MARGIN_IN * 2);

            const pageHeightIn = (container.scrollHeight * PX_TO_IN) + (MARGIN_IN * 2);

            const worker = html2pdf().from(container).set({
                filename:fileName,
                margin:MARGIN_IN,
                image:{ type:"jpeg", quality:0.98 },
                html2canvas:{
                    scale:2,
                    useCORS:true,
                    scrollX:0,
                    scrollY:0
                },
                jsPDF:{ unit:"in", format:[pageWidthIn, pageHeightIn], orientation:"portrait" },
                pagebreak:{ mode:"avoid-all" }
            });

            resolve({ worker, restoreHidden });

        }));

    });

}


document.addEventListener("DOMContentLoaded", () => {

    const printBtn = document.getElementById("printReceipt");

    if(printBtn){

        const defaultPrintLabel = printBtn.innerHTML;

        printBtn.addEventListener("click", () => {

            if(typeof html2pdf === "undefined"){

                // No PDF engine available - plain native print is
                // better than nothing.
                window.print();

                return;

            }

            // Open the tab now, synchronously within the click, so
            // popup blockers don't block it once the PDF is ready
            // a moment later (async work loses the "user gesture").
            const printWindow = window.open("", "_blank");

            if(printWindow){

                printWindow.document.write(
                    "<title>Preparing receipt...</title>" +
                    "<body style=\"font-family:sans-serif;padding:60px;color:#57626C\">Preparing your receipt for printing&hellip;</body>"
                );

            }

            printBtn.disabled = true;

            printBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';

            buildReceiptPdf()
                .then(({ worker, restoreHidden }) =>

                    worker.outputPdf("bloburl")
                        .then((blobUrl) => {

                            restoreHidden();

                            if(printWindow && !printWindow.closed){

                                printWindow.location.href = blobUrl;

                            }
                            else{

                                window.open(blobUrl, "_blank");

                            }

                        })
                        .catch((error) => {

                            restoreHidden();

                            throw error;

                        })

                )
                .catch((error) => {

                    console.error("PRINT PDF ERROR:", error);

                    if(printWindow && !printWindow.closed) printWindow.close();

                    if(typeof Swal !== "undefined"){

                        Swal.fire({
                            icon:"error",
                            title:"Print Failed",
                            text:"Something went wrong preparing your receipt. Please try again."
                        });

                    }

                })
                .finally(() => {

                    printBtn.disabled = false;

                    printBtn.innerHTML = defaultPrintLabel;

                });

        });

    }

    const downloadBtn = document.getElementById("downloadPDF");

    if(downloadBtn){

        const defaultLabel = downloadBtn.innerHTML;

        downloadBtn.addEventListener("click", () => {

            if(typeof html2pdf === "undefined"){

                if(typeof Swal !== "undefined"){

                    Swal.fire({
                        icon:"error",
                        title:"PDF Unavailable",
                        text:"The PDF generator failed to load. Check your connection and try again."
                    });

                }

                return;

            }

            downloadBtn.disabled = true;

            downloadBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';

            buildReceiptPdf()
                .then(({ worker, restoreHidden }) =>

                    worker.save()
                        .then(() => {

                            restoreHidden();

                            downloadBtn.innerHTML =
                                '<i class="fa-solid fa-circle-check"></i> Downloaded';

                            setTimeout(() => {

                                downloadBtn.disabled = false;

                                downloadBtn.innerHTML = defaultLabel;

                            },2000);

                        })
                        .catch((error) => {

                            restoreHidden();

                            throw error;

                        })

                )
                .catch((error) => {

                    console.error("PDF GENERATION ERROR:", error);

                    downloadBtn.disabled = false;

                    downloadBtn.innerHTML = defaultLabel;

                    if(typeof Swal !== "undefined"){

                        Swal.fire({
                            icon:"error",
                            title:"PDF Generation Failed",
                            text:"Something went wrong while creating your PDF. Please try again."
                        });

                    }

                });

        });

    }

});
