/* ======================================================
LINKWORLD EXPRESS
HOMEPAGE
Animated stat counters + the quick-track redirect.
Page loader, scroll-reveal and mobile nav are handled by
the shared js/reveal.js.
====================================================== */

"use strict";


// ======================================================
// ANIMATED COUNTERS
// ======================================================

(function counters(){

    const counters = document.querySelectorAll(".counter");

    if(!counters.length) return;

    const animate = (el) => {

        const target = Number(el.dataset.target);

        const duration = 1800;

        const start = performance.now();

        const step = (now) => {

            const progress = Math.min((now - start) / duration, 1);

            const value = Math.floor(progress * target);

            el.textContent = value.toLocaleString();

            if(progress < 1){

                requestAnimationFrame(step);

            }
            else{

                el.textContent = target.toLocaleString();

            }

        };

        requestAnimationFrame(step);

    };

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if(!entry.isIntersecting) return;

            animate(entry.target);

            observer.unobserve(entry.target);

        });

    },{

        threshold:0.5

    });

    counters.forEach(el => observer.observe(el));

})();


// ======================================================
// QUICK TRACK
// ======================================================

(function quickTrack(){

    const input = document.getElementById("homeTrackingNumber");

    const button = document.getElementById("homeTrackBtn");

    if(!input || !button) return;

    function go(){

        const trackingNumber = input.value.trim();

        if(!trackingNumber){

            input.focus();

            return;

        }

        button.disabled = true;

        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';

        window.location.href =
            `tracking.html?tracking=${encodeURIComponent(trackingNumber)}`;

    }

    button.addEventListener("click", go);

    input.addEventListener("keydown", (e) => {

        if(e.key === "Enter"){

            e.preventDefault();

            go();

        }

    });

})();
