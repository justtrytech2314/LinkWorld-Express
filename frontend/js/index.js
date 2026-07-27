// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 1
// LOADER • AOS • HEADER • SCROLL TOP
// ======================================================


// ======================================================
// WAIT FOR PAGE
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    function(){

        initializeWebsite();

    }

);


// ======================================================
// INITIALIZE WEBSITE
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

}


// ======================================================
// PAGE LOADER
// ======================================================

function initializeLoader(){

    const loader =

    document.querySelector(

        ".page-loader"

    );

    if(!loader) return;

    window.addEventListener(

        "load",

        function(){

            setTimeout(()=>{

                loader.style.opacity="0";

                loader.style.visibility="hidden";

                loader.style.pointerEvents="none";

            },800);

        }

    );

}


// ======================================================
// AOS
// ======================================================

function initializeAOS(){

    if(typeof AOS!=="undefined"){

        AOS.init({

            duration:1000,

            once:true,

            offset:120,

            easing:"ease-in-out"

        });

    }

}


// ======================================================
// STICKY HEADER
// ======================================================

function initializeStickyHeader(){

    const header =

    document.querySelector(

        ".header"

    );

    if(!header) return;

    window.addEventListener(

        "scroll",

        function(){

            if(window.scrollY>60){

                header.classList.add(

                    "sticky"

                );

            }

            else{

                header.classList.remove(

                    "sticky"

                );

            }

        }

    );

}


// ======================================================
// SCROLL TO TOP BUTTON
// ======================================================

function initializeScrollTop(){

    const button =

    document.querySelector(

        ".scroll-top"

    );

    if(!button) return;

    window.addEventListener(

        "scroll",

        function(){

            if(window.scrollY>500){

                button.classList.add(

                    "active"

                );

            }

            else{

                button.classList.remove(

                    "active"

                );

            }

        }

    );

    button.addEventListener(

        "click",

        function(){

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    );

}


// ======================================================
// END PART 1
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 2
// MOBILE MENU • ACTIVE NAVIGATION • SMOOTH SCROLL
// ======================================================


// ======================================================
// MOBILE MENU
// ======================================================

function initializeMobileMenu(){

    const menuButton = document.getElementById("menuToggle");

    const navbar = document.getElementById("navbar");

    if(!menuButton || !navbar) return;

    menuButton.addEventListener("click",function(){

        navbar.classList.toggle("active");

        const icon = menuButton.querySelector("i");

        if(icon){

            if(navbar.classList.contains("active")){

                icon.classList.remove("fa-bars");

                icon.classList.add("fa-xmark");

            }

            else{

                icon.classList.remove("fa-xmark");

                icon.classList.add("fa-bars");

            }

        }

    });

}


// ======================================================
// ACTIVE NAVIGATION
// ======================================================

function initializeActiveNavigation(){

    const links = document.querySelectorAll(".navbar a");

    const current = window.location.pathname.split("/").pop();

    links.forEach(link=>{

        const href = link.getAttribute("href");

        if(href===current || (current==="" && href==="index.html")){

            link.classList.add("active");

        }

        else{

            link.classList.remove("active");

        }

    });

}


// ======================================================
// SMOOTH SCROLL
// ======================================================

function initializeSmoothScroll(){

    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

        anchor.addEventListener("click",function(e){

            const target=document.querySelector(

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

}


// ======================================================
// UPDATE INITIALIZER
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

    initializeMobileMenu();

    initializeActiveNavigation();

    initializeSmoothScroll();

}
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 3
// TRACKING FORM • COUNTERS • HERO ANIMATIONS
// ======================================================


// ======================================================
// TRACK SHIPMENT
// ======================================================

function initializeTrackingForm(){

    const form = document.getElementById("trackingForm");

    if(!form) return;

    form.addEventListener("submit",function(e){

        e.preventDefault();

        const input = document.getElementById("trackingNumber");

        if(!input) return;

        const trackingNumber = input.value.trim();

        if(trackingNumber===""){

            alert("Please enter a tracking number.");

            input.focus();

            return;

        }

        window.location.href=

        "tracking.html?tracking=" +

        encodeURIComponent(trackingNumber);

    });

}


// ======================================================
// COUNTER ANIMATION
// ======================================================

function initializeCounters(){

    const counters =

    document.querySelectorAll(".counter");

    if(counters.length===0) return;

    const observer = new IntersectionObserver(

        function(entries){

            entries.forEach(entry=>{

                if(!entry.isIntersecting) return;

                const counter = entry.target;

                const target =

                Number(counter.dataset.target);

                let current = 0;

                const increment =

                Math.max(

                    1,

                    Math.ceil(target/100)

                );

                const timer = setInterval(()=>{

                    current += increment;

                    if(current>=target){

                        current=target;

                        clearInterval(timer);

                    }

                    counter.textContent=

                    current.toLocaleString();

                },20);

                observer.unobserve(counter);

            });

        },

        {

            threshold:0.5

        }

    );

    counters.forEach(counter=>{

        observer.observe(counter);

    });

}


// ======================================================
// HERO IMAGE EFFECT
// ======================================================

function initializeHeroAnimation(){

    const image =

    document.querySelector(

        ".hero-right img"

    );

    if(!image) return;

    window.addEventListener(

        "mousemove",

        function(e){

            const x =

            (window.innerWidth/2-e.clientX)

            /40;

            const y =

            (window.innerHeight/2-e.clientY)

            /40;

            image.style.transform=

            `translate(${x}px,${y}px)`;

        }

    );

}


// ======================================================
// UPDATE INITIALIZER
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

    initializeMobileMenu();

    initializeActiveNavigation();

    initializeSmoothScroll();

    initializeTrackingForm();

    initializeCounters();

    initializeHeroAnimation();

}
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 3
// TRACK SHIPMENT
// ======================================================


// ======================================================
// 3.1 INITIALIZE TRACKING
// ======================================================

function initializeTrackingForm(){

    const button = document.getElementById(

        "homeTrackBtn"

    );

    const input = document.getElementById(

        "homeTrackingNumber"

    );

    if(!button || !input){

        return;

    }

    button.addEventListener(

        "click",

        function(){

            submitTrackingNumber();

        }

    );

    input.addEventListener(

        "keypress",

        function(e){

            if(e.key==="Enter"){

                e.preventDefault();

                submitTrackingNumber();

            }

        }

    );

}


// ======================================================
// 3.2 SUBMIT TRACKING NUMBER
// ======================================================

function submitTrackingNumber(){

    const input = document.getElementById(

        "homeTrackingNumber"

    );

    if(!input){

        return;

    }

    const trackingNumber =

    input.value.trim();

    if(

        trackingNumber===""

    ){

        input.focus();

        input.style.borderColor="#dc3545";

        alert(

            "Please enter your tracking number."

        );

        return;

    }

    input.style.borderColor="#28a745";

    redirectToTracking(

        trackingNumber

    );

}


// ======================================================
// 3.3 REDIRECT
// ======================================================

function redirectToTracking(

    trackingNumber

){

    window.location.href=

    "tracking.html?tracking=" +

    encodeURIComponent(

        trackingNumber

    );

}


// ======================================================
// 3.4 CLEAR TRACK BOX
// ======================================================

function clearTrackingInput(){

    const input = document.getElementById(

        "homeTrackingNumber"

    );

    if(input){

        input.value="";

        input.style.borderColor="";

    }

}


// ======================================================
// 3.5 UPDATE INITIALIZER
// Replace your initializeWebsite()
// with this version
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

    initializeMobileMenu();

    initializeActiveNavigation();

    initializeSmoothScroll();

    initializeTrackingForm();

}


// ======================================================
// END PART 3
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 4
// COUNTERS • HERO EFFECT • SCROLL ANIMATIONS
// ======================================================


// ======================================================
// 4.1 ANIMATED COUNTERS
// ======================================================

function initializeCounters(){

    const counters =

    document.querySelectorAll(

        ".counter"

    );

    if(counters.length===0){

        return;

    }

    const observer =

    new IntersectionObserver(

        function(entries){

            entries.forEach(entry=>{

                if(!entry.isIntersecting){

                    return;

                }

                const counter =

                entry.target;

                const target = Number(

                    counter.dataset.target

                );

                let current = 0;

                const speed =

                Math.ceil(target/100);

                const timer =

                setInterval(()=>{

                    current += speed;

                    if(current>=target){

                        current=target;

                        clearInterval(timer);

                    }

                    counter.textContent=

                    current.toLocaleString();

                },20);

                observer.unobserve(counter);

            });

        },

        {

            threshold:0.5

        }

    );

    counters.forEach(counter=>{

        observer.observe(counter);

    });

}


// ======================================================
// 4.2 HERO PARALLAX EFFECT
// ======================================================

function initializeHeroEffect(){

    const heroImage =

    document.querySelector(

        ".hero-right img"

    );

    if(!heroImage){

        return;

    }

    window.addEventListener(

        "mousemove",

        function(e){

            const x =

            (window.innerWidth/2-e.clientX)/50;

            const y =

            (window.innerHeight/2-e.clientY)/50;

            heroImage.style.transform=

            `translate(${x}px,${y}px)`;

        }

    );

}


// ======================================================
// 4.3 FADE ELEMENTS ON SCROLL
// ======================================================

function initializeFadeIn(){

    const elements =

    document.querySelectorAll(

        ".fade-up"

    );

    if(elements.length===0){

        return;

    }

    const observer =

    new IntersectionObserver(

        function(entries){

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    entry.target.classList.add(

                        "show"

                    );

                }

            });

        },

        {

            threshold:0.15

        }

    );

    elements.forEach(element=>{

        observer.observe(element);

    });

}


// ======================================================
// 4.4 UPDATE INITIALIZER
// Replace initializeWebsite()
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

    initializeMobileMenu();

    initializeActiveNavigation();

    initializeSmoothScroll();

    initializeTrackingForm();

    initializeCounters();

    initializeHeroEffect();

    initializeFadeIn();

}


// ======================================================
// END PART 4
// ======================================================
// ======================================================
// LINKWORLD EXPRESS
// index.js
// PART 5
// NEWSLETTER • CONTACT • UTILITIES • FINAL SETUP
// ======================================================


// ======================================================
// 5.1 NEWSLETTER SUBSCRIPTION
// ======================================================

function initializeNewsletter(){

    const form = document.getElementById(

        "newsletterForm"

    );

    if(!form){

        return;

    }

    form.addEventListener(

        "submit",

        function(e){

            e.preventDefault();

            const email = document.getElementById(

                "newsletterEmail"

            );

            if(!email){

                return;

            }

            if(email.value.trim()===""){

                alert(

                    "Please enter your email address."

                );

                email.focus();

                return;

            }

            alert(

                "Thank you for subscribing to LinkWorld Express."

            );

            form.reset();

        }

    );

}


// ======================================================
// 5.2 CONTACT FORM
// ======================================================

function initializeContactForm(){

    const form = document.getElementById(

        "contactForm"

    );

    if(!form){

        return;

    }

    form.addEventListener(

        "submit",

        function(e){

            e.preventDefault();

            alert(

                "Your message has been sent successfully."

            );

            form.reset();

        }

    );

}


// ======================================================
// 5.3 CURRENT YEAR
// ======================================================

function updateFooterYear(){

    const year = document.getElementById(

        "currentYear"

    );

    if(year){

        year.textContent =

        new Date().getFullYear();

    }

}


// ======================================================
// 5.4 PRELOAD IMAGES
// ======================================================

function preloadImages(){

    const images = document.images;

    for(let i=0;i<images.length;i++){

        const img = new Image();

        img.src = images[i].src;

    }

}


// ======================================================
// 5.5 CONSOLE MESSAGE
// ======================================================

function showDeveloperMessage(){

    console.log(

        "%cLinkWorld Express",

        "color:#0d6efd;font-size:22px;font-weight:bold;"

    );

    console.log(

        "%cWebsite Loaded Successfully.",

        "color:#28a745;font-size:14px;"

    );

}


// ======================================================
// 5.6 UPDATE INITIALIZER
// Replace initializeWebsite()
// ======================================================

function initializeWebsite(){

    initializeLoader();

    initializeAOS();

    initializeStickyHeader();

    initializeScrollTop();

    initializeMobileMenu();

    initializeActiveNavigation();

    initializeSmoothScroll();

    initializeTrackingForm();

    initializeCounters();

    initializeHeroEffect();

    initializeFadeIn();

    initializeNewsletter();

    initializeContactForm();

    updateFooterYear();

    preloadImages();

    showDeveloperMessage();

}


// ======================================================
// END PART 5
// ======================================================