// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 1
// CORE • INITIALIZATION • LOADER • HEADER • NAVIGATION
// ======================================================

// ======================================================
// CONFIGURATION
// ======================================================

const API_BASE_URL =
"https://linkworld-express2-1.onrender.com";

const TRACKING_URL =
"tracking.html?tracking=";

const LOADER_TIME = 1800;


// ======================================================
// DOM ELEMENTS
// ======================================================

const pageLoader =
document.getElementById("pageLoader");

const navbar =
document.getElementById("navbar");

const menuToggle =
document.getElementById("menuToggle");

const header =
document.querySelector(".header");

const homeTrackBtn =
document.getElementById("homeTrackBtn");

const homeTrackingInput =
document.getElementById("homeTrackingNumber");

const counters =
document.querySelectorAll(".counter");


// ======================================================
// APPLICATION
// ======================================================

const App = {

    init(){

        this.initializeLoader();

        this.initializeNavigation();

        this.initializeHeader();

        this.initializeTracking();

        this.initializeCounters();

        this.initializeLazyImages();

    }

};


// ======================================================
// PAGE LOADER
// ======================================================

App.initializeLoader = function(){

    window.addEventListener("load",()=>{

        setTimeout(()=>{

            if(pageLoader){

                pageLoader.style.opacity="0";

                pageLoader.style.visibility="hidden";

                pageLoader.style.pointerEvents="none";

                setTimeout(()=>{

                    pageLoader.remove();

                },700);

            }

        },LOADER_TIME);

    });

};


// ======================================================
// MOBILE MENU
// ======================================================

App.initializeNavigation=function(){

    if(!menuToggle || !navbar) return;

    menuToggle.addEventListener("click",()=>{

        navbar.classList.toggle("active");

        menuToggle.classList.toggle("active");

        const icon =
        menuToggle.querySelector("i");

        if(icon){

            if(navbar.classList.contains("active")){

                icon.className=
                "fa-solid fa-xmark";

            }else{

                icon.className=
                "fa-solid fa-bars";

            }

        }

    });

};


// ======================================================
// CLOSE MENU WHEN LINK CLICKED
// ======================================================

document
.querySelectorAll("#navbar a")
.forEach(link=>{

    link.addEventListener("click",()=>{

        if(navbar){

            navbar.classList.remove("active");

        }

        if(menuToggle){

            menuToggle.classList.remove("active");

            const icon =
            menuToggle.querySelector("i");

            if(icon){

                icon.className=
                "fa-solid fa-bars";

            }

        }

    });

});


// ======================================================
// STICKY HEADER
// ======================================================

App.initializeHeader=function(){

    window.addEventListener("scroll",()=>{

        if(window.scrollY>80){

            header.classList.add("sticky");

        }else{

            header.classList.remove("sticky");

        }

    });

};


// ======================================================
// SMOOTH SCROLL
// ======================================================

document
.querySelectorAll('a[href^="#"]')
.forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        const target=
        document.querySelector(
        this.getAttribute("href")
        );

        if(target){

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        }

    });

});


// ======================================================
// IMAGE LAZY LOADING
// ======================================================

App.initializeLazyImages=function(){

    const images =
    document.querySelectorAll("img");

    images.forEach(image=>{

        image.loading="lazy";

    });

};


// ======================================================
// START APPLICATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        App.init();

    }

);


// ======================================================
// END PART 1
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 2
// QUICK TRACKING • COUNTERS
// ======================================================


// ======================================================
// ANIMATED COUNTERS
// ======================================================

App.initializeCounters = function () {

    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;

            const target = Number(counter.dataset.target);

            const duration = 2000;

            const increment = target / (duration / 16);

            let current = 0;

            const timer = setInterval(() => {

                current += increment;

                if (current >= target) {

                    counter.textContent =
                        target.toLocaleString();

                    clearInterval(timer);

                } else {

                    counter.textContent =
                        Math.floor(current).toLocaleString();

                }

            }, 16);

            observer.unobserve(counter);

        });

    }, {

        threshold: 0.5

    });

    counters.forEach(counter => {

        observer.observe(counter);

    });

};


// ======================================================
// QUICK TRACKING
// ======================================================

App.initializeTracking = function () {

    if (homeTrackBtn) {

        homeTrackBtn.addEventListener(

            "click",

            startTracking

        );

    }

    if (homeTrackingInput) {

        homeTrackingInput.addEventListener(

            "keypress",

            function (e) {

                if (e.key === "Enter") {

                    startTracking();

                }

            }

        );

    }

};


// ======================================================
// TRACK BUTTON FUNCTION
// ======================================================

function startTracking() {

    if (!homeTrackingInput) return;

    const trackingNumber =

        homeTrackingInput.value.trim();

    if (trackingNumber === "") {

        showMessage(

            "Please enter your tracking number.",

            "warning"

        );

        homeTrackingInput.focus();

        return;

    }

    if (trackingNumber.length < 6) {

        showMessage(

            "Invalid tracking number.",

            "error"

        );

        return;

    }

    loadingButton(true);

    setTimeout(() => {

        window.location.href =

            TRACKING_URL +

            encodeURIComponent(trackingNumber);

    }, 700);

}


// ======================================================
// BUTTON LOADING
// ======================================================

function loadingButton(status) {

    if (!homeTrackBtn) return;

    if (status) {

        homeTrackBtn.disabled = true;

        homeTrackBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Searching...

        `;

    } else {

        homeTrackBtn.disabled = false;

        homeTrackBtn.innerHTML = `

            <i class="fa-solid fa-magnifying-glass"></i>

            Track Now

        `;

    }

}


// ======================================================
// ALERTS
// ======================================================

function showMessage(message, icon = "info") {

    Swal.fire({

        icon,

        text: message,

        confirmButtonColor: "#0b6b43",

        timer: 2500,

        timerProgressBar: true,

        showConfirmButton: false

    });

}


// ======================================================
// RESET TRACK BUTTON WHEN RETURNING
// ======================================================

window.addEventListener("pageshow", () => {

    loadingButton(false);

});


// ======================================================
// END PART 2
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 3
// PREMIUM HOMEPAGE EFFECTS
// ======================================================


// ======================================================
// HERO FLOATING IMAGE
// ======================================================

App.initializeHeroAnimation = function(){

    const heroImage =
    document.querySelector(".hero-right img");

    if(!heroImage) return;

    let direction = 1;
    let position = 0;

    setInterval(()=>{

        position += 0.4 * direction;

        if(position >= 15){

            direction = -1;

        }

        if(position <= -15){

            direction = 1;

        }

        heroImage.style.transform =
        `translateY(${position}px)`;

    },30);

};


// ======================================================
// PARALLAX HERO
// ======================================================

App.initializeParallax = function(){

    const hero =
    document.querySelector(".hero");

    if(!hero) return;

    window.addEventListener("scroll",()=>{

        const scroll =
        window.pageYOffset;

        hero.style.backgroundPositionY =
        `${scroll * 0.35}px`;

    });

};


// ======================================================
// SERVICE CARD EFFECT
// ======================================================

App.initializeServiceCards = function(){

    const cards =
    document.querySelectorAll(".service-card");

    cards.forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform =
            "translateY(-12px) scale(1.03)";

            card.style.transition =
            ".35s ease";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform =
            "translateY(0) scale(1)";

        });

    });

};


// ======================================================
// TESTIMONIAL AUTO SLIDER
// ======================================================

App.initializeTestimonials = function(){

    const cards =
    document.querySelectorAll(".testimonial-card");

    if(cards.length <= 1) return;

    let current = 0;

    setInterval(()=>{

        cards.forEach(card=>{

            card.classList.remove("active");

        });

        cards[current].classList.add("active");

        current++;

        if(current >= cards.length){

            current = 0;

        }

    },5000);

};


// ======================================================
// SECTION REVEAL
// ======================================================

App.initializeReveal = function(){

    const sections =
    document.querySelectorAll("section");

    const observer =
    new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("show-section");

            }

        });

    },{

        threshold:0.15

    });

    sections.forEach(section=>{

        observer.observe(section);

    });

};


// ======================================================
// SCROLL OPTIMIZATION
// ======================================================

let ticking = false;

window.addEventListener("scroll",()=>{

    if(!ticking){

        window.requestAnimationFrame(()=>{

            ticking = false;

        });

        ticking = true;

    }

});


// ======================================================
// START PREMIUM EFFECTS
// ======================================================

document.addEventListener("DOMContentLoaded",()=>{

    App.initializeHeroAnimation();

    App.initializeParallax();

    App.initializeServiceCards();

    App.initializeTestimonials();

    App.initializeReveal();

});


// ======================================================
// END PART 3
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 4
// PREMIUM UI INTERACTIONS
// ======================================================


// ======================================================
// SCROLL PROGRESS BAR
// ======================================================

App.initializeScrollProgress = function(){

    let progress =
    document.getElementById("scrollProgress");

    if(!progress){

        progress =
        document.createElement("div");

        progress.id = "scrollProgress";

        progress.style.position = "fixed";
        progress.style.top = "0";
        progress.style.left = "0";
        progress.style.width = "0%";
        progress.style.height = "4px";
        progress.style.zIndex = "99999";
        progress.style.background =
        "linear-gradient(90deg,#2E7D32,#66BB6A)";
        progress.style.transition =
        "width .15s linear";

        document.body.appendChild(progress);

    }

    window.addEventListener("scroll",()=>{

        const totalHeight =

            document.documentElement.scrollHeight -

            window.innerHeight;

        const percent =

            (window.pageYOffset / totalHeight) * 100;

        progress.style.width = percent + "%";

    });

};


// ======================================================
// ACTIVE NAVIGATION
// ======================================================

App.initializeActiveNav = function(){

    const sections =
    document.querySelectorAll("section");

    const navLinks =
    document.querySelectorAll("#navbar a");

    window.addEventListener("scroll",()=>{

        let current = "";

        sections.forEach(section=>{

            const top =
            section.offsetTop - 150;

            if(window.pageYOffset >= top){

                current = section.getAttribute("id");

            }

        });

        navLinks.forEach(link=>{

            link.classList.remove("active");

            const href =

            link.getAttribute("href");

            if(

                href === "#" + current ||

                (href==="index.html" && current==="")

            ){

                link.classList.add("active");

            }

        });

    });

};


// ======================================================
// RIPPLE BUTTON EFFECT
// ======================================================

App.initializeButtons = function(){

    const buttons =
    document.querySelectorAll(

        ".primary-btn,.secondary-btn,.track-btn"

    );

    buttons.forEach(button=>{

        button.addEventListener("click",function(e){

            const ripple =
            document.createElement("span");

            ripple.className = "ripple";

            const rect =
            button.getBoundingClientRect();

            ripple.style.left =
            (e.clientX-rect.left)+"px";

            ripple.style.top =
            (e.clientY-rect.top)+"px";

            button.appendChild(ripple);

            setTimeout(()=>{

                ripple.remove();

            },600);

        });

    });

};


// ======================================================
// BACK TO TOP
// ======================================================

App.initializeBackToTop = function(){

    const topButton =
    document.getElementById("backToTop");

    if(!topButton) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>500){

            topButton.classList.add("show");

        }

        else{

            topButton.classList.remove("show");

        }

    });

    topButton.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

};


// ======================================================
// CONNECTION STATUS
// ======================================================

App.initializeConnection = function(){

    window.addEventListener("offline",()=>{

        showMessage(

            "Internet connection lost.",

            "warning"

        );

    });

    window.addEventListener("online",()=>{

        showMessage(

            "Connection restored.",

            "success"

        );

    });

};


// ======================================================
// PERFORMANCE
// ======================================================

App.initializePerformance = function(){

    window.addEventListener("pageshow",()=>{

        document.body.classList.add("page-ready");

    });

};


// ======================================================
// START PREMIUM FEATURES
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        App.initializeScrollProgress();

        App.initializeActiveNav();

        App.initializeButtons();

        App.initializeBackToTop();

        App.initializeConnection();

        App.initializePerformance();

    }

);


// ======================================================
// END PART 4
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 5
// FINAL PREMIUM FEATURES
// ======================================================


// ======================================================
// PREMIUM MOUSE GLOW
// ======================================================

App.initializeMouseGlow = function(){

    const glow =
    document.createElement("div");

    glow.id = "mouseGlow";

    glow.style.position = "fixed";
    glow.style.width = "18px";
    glow.style.height = "18px";
    glow.style.borderRadius = "50%";
    glow.style.pointerEvents = "none";
    glow.style.background =
    "rgba(76,175,80,.25)";
    glow.style.backdropFilter = "blur(3px)";
    glow.style.transform =
    "translate(-50%,-50%)";
    glow.style.transition =
    "transform .08s linear";
    glow.style.zIndex = "999999";

    document.body.appendChild(glow);

    document.addEventListener("mousemove",(e)=>{

        glow.style.left =
        e.clientX + "px";

        glow.style.top =
        e.clientY + "px";

    });

};


// ======================================================
// IMAGE REVEAL EFFECT
// ======================================================

App.initializeImageReveal = function(){

    const images =
    document.querySelectorAll("img");

    const observer =
    new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                "translateY(0)";

            }

        });

    },{

        threshold:0.2

    });

    images.forEach(image=>{

        image.style.opacity = "0";

        image.style.transform =
        "translateY(40px)";

        image.style.transition =
        "all .8s ease";

        observer.observe(image);

    });

};


// ======================================================
// RENDER SERVER CHECK
// ======================================================

App.checkServer = async function(){

    try{

        await axios.get(API_BASE_URL);

        console.log(

            "✅ Render Server Connected"

        );

    }

    catch(error){

        console.warn(

            "⚠ Backend Offline"

        );

    }

};


// ======================================================
// AUTO YEAR
// ======================================================

App.initializeYear = function(){

    const year =
    document.getElementById("currentYear");

    if(year){

        year.textContent =
        new Date().getFullYear();

    }

};


// ======================================================
// DEVELOPER SHORTCUT
// CTRL + SHIFT + L
// ======================================================

document.addEventListener(

    "keydown",

    function(e){

        if(

            e.ctrlKey &&

            e.shiftKey &&

            e.key.toLowerCase()==="l"

        ){

            console.clear();

            console.log(

                "%cLINKWORLD EXPRESS",

                "color:#2E7D32;font-size:20px;font-weight:bold"

            );

        }

    }

);


// ======================================================
// FINAL INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        App.initializeMouseGlow();

        App.initializeImageReveal();

        App.initializeYear();

        App.checkServer();

        console.log(

            "🚚 LinkWorld Express Premium Homepage Ready"

        );

    }

);


// ======================================================
// END OF FILE
// ======================================================