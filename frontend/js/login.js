// ======================================================
// LINKWORLD EXPRESS
// ADMIN LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const errorMessage = document.getElementById("errorMessage");

const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

const togglePassword = document.getElementById("togglePassword");

// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

// ======================================================
// LOGIN
// ======================================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    errorMessage.style.display = "none";

    const email = emailInput.value.trim();

    const password = passwordInput.value.trim();

    try {

        const response = await fetch("http://localhost:5000/api/auth/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,
                password

            })

        });

        const data = await response.json();

        if (!response.ok) {

            errorMessage.style.display = "block";

            errorMessage.innerHTML =

                data.message || "Invalid Email or Password.";

            return;

        }

        localStorage.setItem("adminToken", data.token);

        startLoading();

    }

    catch (err) {

        errorMessage.style.display = "block";

        errorMessage.innerHTML =

            "Unable to connect to the server.";

    }

});

// ======================================================
// LOADING ANIMATION
// ======================================================

function startLoading() {

    loadingScreen.style.display = "flex";

    const steps = [

        {
            percent:20,
            text:"Connecting to LinkWorld Server..."
        },

        {
            percent:40,
            text:"Verifying Administrator..."
        },

        {
            percent:60,
            text:"Loading Dashboard..."
        },

        {
            percent:80,
            text:"Preparing Workspace..."
        },

        {
            percent:100,
            text:"Login Successful..."
        }

    ];

    let index = 0;

    const timer = setInterval(() => {

        progressBar.style.width =

            steps[index].percent + "%";

        progressPercent.innerHTML =

            steps[index].percent + "%";

        loadingText.innerHTML =

            steps[index].text;

        index++;

        if(index===steps.length){

            clearInterval(timer);

            setTimeout(()=>{

                window.location.href="dashboard.html";

            },800);

        }

    },700);

}