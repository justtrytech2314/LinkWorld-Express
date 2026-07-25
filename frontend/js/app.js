// ======================================================
// LINKWORLD EXPRESS
// CUSTOMER TRACKING SYSTEM
// app.js
// ======================================================


const API_URL = "http://localhost:5000/api/shipments";


// ======================================================
// ELEMENTS
// ======================================================


const trackBtn = document.getElementById("trackBtn");

const trackInput = document.getElementById("trackInput");

const errorBox = document.getElementById("error");


// ADMIN STYLE LOADING ELEMENTS

const loadingScreen =
document.getElementById("loadingScreen");


const loadingText =
document.getElementById("loadingText");


const progressBar =
document.getElementById("progressBar");


const progressPercent =
document.getElementById("progressPercent");





// ======================================================
// TRACK BUTTON
// ======================================================


if(trackBtn){


    trackBtn.addEventListener(
        "click",
        trackPackage
    );


}






// ======================================================
// TRACK SHIPMENT
// ======================================================


async function trackPackage(){



    const trackingNumber =
    trackInput.value.trim();





    if(!trackingNumber){


        errorBox.innerHTML =
        "Please enter your tracking number.";


        return;


    }





    errorBox.innerHTML = "";





    try{



        showLoading();





        // CHECK DATABASE

        const response =
        await fetch(
            `${API_URL}/track/${trackingNumber}`
        );




        const result =
        await response.json();







        if(!result.success){



            hideLoading();



            errorBox.innerHTML =
            "Tracking number not found.";



            return;


        }







        // SAVE REAL SHIPMENT DATA


        localStorage.setItem(

            "shipment",

            JSON.stringify(result.data)

        );






        // COMPLETE LOADING


        runLoading(()=>{


            window.location.href =
            "tracking.html";


        });





    }

    catch(error){



        console.log(error);



        hideLoading();



        errorBox.innerHTML =
        "Unable to connect to server.";



    }




}









// ======================================================
// ADMIN STYLE LOADING ANIMATION
// ======================================================


function showLoading(){


    loadingScreen.style.display =
    "flex";


    progressBar.style.width =
    "0%";


    progressPercent.innerHTML =
    "0%";


}






function hideLoading(){


    loadingScreen.style.display =
    "none";


}






function runLoading(callback){



    const steps = [


        {
            percent:20,
            text:"Connecting to LinkWorld Server..."
        },


        {
            percent:40,
            text:"Searching Shipment Database..."
        },


        {
            percent:60,
            text:"Verifying Tracking Number..."
        },


        {
            percent:80,
            text:"Preparing Live Shipment Map..."
        },


        {
            percent:100,
            text:"Shipment Located Successfully..."
        }



    ];





    let index = 0;





    const timer =
    setInterval(()=>{





        progressBar.style.width =
        steps[index].percent + "%";




        progressPercent.innerHTML =
        steps[index].percent + "%";





        loadingText.innerHTML =
        steps[index].text;






        index++;





        if(index === steps.length){



            clearInterval(timer);




            setTimeout(()=>{


                callback();



            },800);



        }





    },700);





}









// ======================================================
// DEMO TRACKING NUMBER
// ======================================================


function fillExample(){



    trackInput.value =
    "LWX260724DDG58K";


}