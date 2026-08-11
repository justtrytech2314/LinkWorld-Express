/* ======================================================
LINKWORLD EXPRESS
CONTACT PAGE
Submits the contact form to the backend, which saves it
as a message in MongoDB for the support team to follow up.
====================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if(form){

        form.addEventListener("submit", submitContactForm);

    }

});


function val(id){

    const el = document.getElementById(id);

    return el ? el.value.trim() : "";

}


async function submitContactForm(event){

    event.preventDefault();

    const submitBtn = document.getElementById("contactSubmitBtn");

    const payload = {

        name: val("contactName"),
        email: val("contactEmail"),
        phone: val("contactPhone"),
        subject: val("contactSubject"),
        message: val("contactMessage")

    };


    if(!payload.name || !payload.email || !payload.subject || !payload.message){

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
        '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    }


    try{

        const response = await fetch(`${LWX_API}/contact`, {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(payload)

        });

        const data = await response.json();

        if(!data.success){

            throw new Error(data.message || "Unable to send your message.");

        }

        await Swal.fire({
            icon:"success",
            title:"Message Sent",
            text:`Thank you, ${payload.name.split(" ")[0]}. Reference #${data.contactMessage.referenceNumber} — our team will reply shortly.`,
            confirmButtonColor:"#FF5A1F"
        });

        document.getElementById("contactForm").reset();

    }

    catch(error){

        console.error("CONTACT FORM ERROR:", error);

        Swal.fire({
            icon:"error",
            title:"Message Not Sent",
            text:error.message || "Unable to connect to LinkWorld Express server."
        });

    }

    finally{

        if(submitBtn){

            submitBtn.disabled = false;

            submitBtn.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Send Message';

        }

    }

}
