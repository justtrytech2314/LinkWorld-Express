/* =====================================================
   LINKWORLD EXPRESS
   PREMIUM TRACKING PAGE
===================================================== */

"use strict";


// =====================================================
// API
// =====================================================

const API_URL = LWX_API;


// =====================================================
// ELEMENTS
// =====================================================

const trackingForm = document.getElementById("trackingForm");
const trackingInput = document.getElementById("trackingNumber");
const trackingError = document.getElementById("trackingError");

const loadingScreen = document.getElementById("loadingScreen");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

const loadingTitle = document.getElementById("loadingTitle");
const loadingMessage = document.getElementById("loadingMessage");

const truck = document.getElementById("truck");
const trackButton = document.getElementById("trackButton");


// =====================================================
// LOADING STEPS
// =====================================================

const loadingSteps = [

    {
        percent:10,
        title:"Connecting To LinkWorld Express...",
        message:"Establishing secure encrypted connection..."
    },

    {
        percent:25,
        title:"Searching Shipment...",
        message:"Locating shipment in our database..."
    },

    {
        percent:45,
        title:"Loading Shipment History...",
        message:"Retrieving shipment information..."
    },

    {
        percent:65,
        title:"Connecting GPS...",
        message:"Fetching latest shipment location..."
    },

    {
        percent:85,
        title:"Preparing Live Tracking...",
        message:"Almost finished..."
    },

    {
        percent:100,
        title:"Opening Shipment...",
        message:"Redirecting..."
    }

];


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message){

    trackingError.textContent = message;

    trackingInput.focus();

}


// =====================================================
// CLEAR ERROR
// =====================================================

function clearError(){

    trackingError.textContent = "";

}


// =====================================================
// LOADING ANIMATION
// =====================================================

function startLoading(trackingNumber){

    loadingScreen.style.display="flex";

    let progress=0;

    const interval=setInterval(()=>{

        progress++;

        progressBar.style.width=progress+"%";

        progressPercent.textContent=progress+"%";


        // Vehicle animation

        if(progress<35){

            truck.textContent="🚚";

        }

        else if(progress<70){

            truck.textContent="✈️";

        }

        else{

            truck.textContent="🚢";

        }


        loadingSteps.forEach(step=>{

            if(progress===step.percent){

                loadingTitle.textContent=step.title;

                loadingMessage.textContent=step.message;

            }

        });


        if(progress>=100){

            clearInterval(interval);

            setTimeout(()=>{

                window.location.href=
                `tracking-result.html?tracking=${encodeURIComponent(trackingNumber)}`;

            },800);

        }

    },35);

}



// =====================================================
// TRACK SHIPMENT
// =====================================================

async function trackShipment(trackingNumber){

    clearError();

    if(!trackingNumber){

        showError("Please enter your tracking number.");

        return;

    }


    trackButton.disabled=true;

    trackButton.innerHTML=
    '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';


    try{

        const response=await axios.get(

            `${API_URL}/shipments/track/${trackingNumber}`

        );


        if(response.data.success){

            startLoading(trackingNumber);

        }

        else{

            showError(

                response.data.message ||

                "Tracking number not found."

            );

        }


    }

    catch(error){

        console.error(error);

        if(error.response){

            showError(

                error.response.data.message ||

                "Tracking number not found."

            );

        }

        else{

            showError(

                "Unable to connect to LinkWorld Express server."

            );

        }

    }

    finally{

        trackButton.disabled=false;

        trackButton.innerHTML=
        '<i class="fa-solid fa-location-crosshairs"></i> Track Shipment';

    }

}


trackingForm.addEventListener("submit",function(e){

    e.preventDefault();

    trackShipment(trackingInput.value.trim().toUpperCase());

});


// =====================================================
// AUTO-TRACK FROM URL
// Supports links like tracking.html?tracking=LWX...
// (used by the homepage quick-track box)
// =====================================================

(function autoTrackFromURL(){

    const params = new URLSearchParams(window.location.search);

    const trackingNumber =
        (params.get("tracking") || params.get("trackingNumber") || "")
        .trim()
        .toUpperCase();

    if(trackingNumber){

        trackingInput.value = trackingNumber;

        trackShipment(trackingNumber);

    }

})();


// =====================================================
// ENTER KEY
// =====================================================

trackingInput.addEventListener("keydown",function(e){

    if(e.key==="Enter"){

        e.preventDefault();

        trackingForm.requestSubmit();

    }

});


// =====================================================
// AUTO UPPERCASE
// =====================================================

trackingInput.addEventListener("input",function(){

    this.value=this.value.toUpperCase();

});