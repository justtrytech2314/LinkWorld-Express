/* ======================================================
LINKWORLD EXPRESS
SHARED PAGE LOADER + SCROLL-REVEAL
Fades out #pageLoader once the page has loaded (with a
minimum display time so it doesn't just flash), then fades
in any [data-reveal] element as it scrolls into view.
====================================================== */

"use strict";

(function pageLoader(){

    const loader = document.getElementById("pageLoader");

    if(!loader) return;

    const MIN_VISIBLE_MS = 900;

    const shownAt = Date.now();

    function hide(){

        const elapsed = Date.now() - shownAt;

        const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

        setTimeout(() => {

            loader.classList.add("is-hidden");

            setTimeout(() => loader.remove(), 700);

        }, wait);

    }

    if(document.readyState === "complete"){

        hide();

    }
    else{

        window.addEventListener("load", hide);

    }

})();


(function mobileNav(){

    const toggle = document.getElementById("menuToggle");

    const navbar = document.querySelector(".navbar");

    if(!toggle || !navbar) return;

    toggle.addEventListener("click", () => {

        const isOpen = navbar.classList.toggle("is-open");

        const icon = toggle.querySelector("i");

        if(icon){

            icon.className = isOpen ?
                "fa-solid fa-xmark" :
                "fa-solid fa-bars";

        }

    });

    navbar.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("is-open");

            const icon = toggle.querySelector("i");

            if(icon) icon.className = "fa-solid fa-bars";

        });

    });

})();


(function scrollReveal(){

    const targets = document.querySelectorAll("[data-reveal]");

    if(!targets.length) return;

    if(!("IntersectionObserver" in window)){

        targets.forEach(el => el.classList.add("is-visible"));

        return;

    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if(!entry.isIntersecting) return;

            const el = entry.target;

            const delay = el.getAttribute("data-reveal-delay");

            if(delay){

                el.style.transitionDelay = `${delay}ms`;

            }

            el.classList.add("is-visible");

            observer.unobserve(el);

        });

    },{

        threshold:0.15,
        rootMargin:"0px 0px -60px 0px"

    });

    targets.forEach(el => observer.observe(el));

})();
