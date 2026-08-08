/* ======================================================
LINKWORLD EXPRESS
ADMIN LOGIN JS
PART 1
AUTHENTICATION SYSTEM
====================================================== */


"use strict";



// ======================================================
// API CONFIG
// ======================================================


const API_URL = LWX_API;





// ======================================================
// DOM ELEMENTS
// ======================================================


const loginForm = document.getElementById(
"loginForm"
);


const emailInput = document.getElementById(
"email"
);


const passwordInput = document.getElementById(
"password"
);


const loginButton = document.getElementById(
"loginButton"
);


const errorMessage = document.getElementById(
"errorMessage"
);



const togglePassword = document.getElementById(
"togglePassword"
);





// ======================================================
// PASSWORD TOGGLE
// ======================================================


if(togglePassword){


togglePassword.addEventListener(
"click",
()=>{


if(passwordInput.type === "password"){


passwordInput.type = "text";


togglePassword.innerHTML =

`
<i class="fa-solid fa-eye-slash"></i>
`;


}


else{


passwordInput.type = "password";


togglePassword.innerHTML =

`
<i class="fa-solid fa-eye"></i>
`;


}



});


}








// ======================================================
// LOGIN SUBMIT
// ======================================================


loginForm.addEventListener(

"submit",

async(e)=>{


e.preventDefault();



const email =
emailInput.value.trim();



const password =
passwordInput.value.trim();





if(!email || !password){


showError(
"Please enter email and password."
);


return;


}






loginButton.disabled = true;


loginButton.innerHTML =


`
<i class="fa-solid fa-spinner fa-spin"></i>

Checking...

`;







try{



const response = await fetch(

`${API_URL}/admin/login`,

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({


email,

password


})


}


);






const data = await response.json();








if(!data.success){


throw new Error(
data.message
);


}







// SAVE TOKEN


localStorage.setItem(

"adminToken",

data.token

);





localStorage.setItem(

"admin",

JSON.stringify(
data.admin
)

);





showToast(
"Login successful",
"success"
);






startLoading();






}

catch(error){


console.error(
"LOGIN ERROR:",
error
);



showError(
error.message
);



loginButton.disabled=false;



loginButton.innerHTML =


`
<i class="fa-solid fa-right-to-bracket"></i>

Login

`;



}



});
/* ======================================================
LINKWORLD EXPRESS
ADMIN LOGIN JS
PART 2
LOADING + TOAST SYSTEM
====================================================== */





// ======================================================
// START LAZY LOADING
// ======================================================


function startLoading(){



const loadingScreen =

document.getElementById(
"loadingScreen"
);



const loadingText =

document.getElementById(
"loadingText"
);



const progressBar =

document.getElementById(
"progressBar"
);



const progressPercent =

document.getElementById(
"progressPercent"
);






if(!loadingScreen)

return;






loadingScreen.classList.add(
"active"
);






let progress = 0;





const messages = [


"Connecting to secure server...",


"Verifying administrator account...",


"Loading shipment database...",


"Preparing LinkWorld dashboard...",


"Access granted..."



];






const loader = setInterval(()=>{



progress += 10;






if(progressBar){


progressBar.style.width =
progress + "%";


}






if(progressPercent){


progressPercent.textContent =
progress + "%";


}








if(loadingText){


let index =

Math.floor(progress / 20);



if(index > 4)

index = 4;



loadingText.textContent =

messages[index];



}








if(progress >= 100){



clearInterval(loader);





setTimeout(()=>{


window.location.href =
"dashboard.html";



},700);





}





},300);






}









// ======================================================
// SHOW ERROR MESSAGE
// ======================================================


function showError(message){



if(!errorMessage)

return;




errorMessage.style.display =
"block";



errorMessage.innerHTML =

`

<i class="fa-solid fa-circle-exclamation"></i>

${message}

`;






setTimeout(()=>{


errorMessage.style.display =
"none";


},4000);





}









// ======================================================
// TOAST SYSTEM
// ======================================================


function showToast(
message,
type="success"
){



const toast =

document.getElementById(
"toast"
);



const toastMessage =

document.getElementById(
"toastMessage"
);



const toastIcon =

document.getElementById(
"toastIcon"
);






if(!toast)

return;







if(toastMessage)

toastMessage.textContent =
message;






if(toastIcon){



if(type==="success"){



toastIcon.className =

"fa-solid fa-circle-check";


}

else{


toastIcon.className =

"fa-solid fa-circle-xmark";


}



}







toast.classList.add(
"show"
);






setTimeout(()=>{


toast.classList.remove(
"show"
);


},3000);





}









// ======================================================
// CHECK EXISTING LOGIN
// ======================================================


// If admin already logged in,
// do not force login again


window.addEventListener(

"DOMContentLoaded",

()=>{



const token =

localStorage.getItem(
"adminToken"
);





if(token){



// optional:
// remove this if you want
// login page always visible



// window.location.href="dashboard.html";



}





});









// ======================================================
// YEAR UPDATE
// ======================================================


const year =

document.getElementById(
"year"
);



if(year){


year.textContent =
new Date().getFullYear();


}
