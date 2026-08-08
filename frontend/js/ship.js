/* ======================================================
LINKWORLD EXPRESS
SHIP NOW — SHIPMENT REQUEST FORM
Submits the booking form to the backend, which saves it
as a lead in MongoDB for the logistics team to follow up.
====================================================== */

"use strict";


document.addEventListener("DOMContentLoaded", () => {

    const loading = document.getElementById("loading");

    if(loading){

        setTimeout(()=>{

            loading.style.display = "none";

        },600);

    }

    const form = document.getElementById("shipmentRequestForm");

    if(form){

        form.addEventListener("submit", submitShipmentRequest);

    }

});


function val(id){

    const el = document.getElementById(id);

    return el ? el.value.trim() : "";

}


function checked(id){

    const el = document.getElementById(id);

    return el ? el.checked : false;

}


async function submitShipmentRequest(event){

    event.preventDefault();

    const submitBtn = document.querySelector(".submit-request-btn");

    const payload = {

        sender:{
            name: val("senderName"),
            phone: val("senderPhone"),
            email: val("senderEmail"),
            company: val("senderCompany"),
            address: val("senderAddress")
        },

        receiver:{
            name: val("receiverName"),
            phone: val("receiverPhone"),
            email: val("receiverEmail"),
            country: val("receiverCountry"),
            address: val("receiverAddress")
        },

        shipmentType: val("shipmentType"),

        deliverySpeed: val("deliverySpeed"),

        packageWeight: val("packageWeight"),

        packageValue: val("packageValue"),

        packageQuantity: val("packageQuantity"),

        pickupDate: val("pickupDate"),

        shipmentDescription: val("shipmentDescription"),

        fragile: checked("fragile"),

        insurance: checked("insurance"),

        signatureRequired: checked("signatureRequired"),

        priorityHandling: checked("priorityHandling"),

        specialInstructions: val("specialInstructions")

    };


    if(

        !payload.sender.name ||
        !payload.sender.phone ||
        !payload.sender.address ||
        !payload.receiver.name ||
        !payload.receiver.phone ||
        !payload.receiver.country ||
        !payload.receiver.address ||
        !payload.shipmentType ||
        !payload.shipmentDescription

    ){

        Swal.fire({
            icon:"warning",
            title:"Missing Information",
            text:"Please complete all required fields marked with *."
        });

        return;

    }


    if(submitBtn){

        submitBtn.disabled = true;

        submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    }


    try{

        const response = await fetch(`${LWX_API}/requests`, {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(payload)

        });

        const data = await response.json();

        if(!data.success){

            throw new Error(data.message || "Unable to submit your request.");

        }

        await Swal.fire({
            icon:"success",
            title:"Request Submitted",
            text:`Thank you! Your request number is ${data.request.requestNumber}. Our logistics team will contact you shortly.`,
            confirmButtonColor:"#0b6b43"
        });

        document.getElementById("shipmentRequestForm").reset();

    }

    catch(error){

        console.error("SHIP REQUEST ERROR:", error);

        Swal.fire({
            icon:"error",
            title:"Submission Failed",
            text:error.message || "Unable to connect to LinkWorld Express server."
        });

    }

    finally{

        if(submitBtn){

            submitBtn.disabled = false;

            submitBtn.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Submit Shipment Request';

        }

    }

}
