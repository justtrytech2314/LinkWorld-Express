/* ============================================================
   LINKWORLD EXPRESS
   STREET VIEW (Mapillary)
   ------------------------------------------------------------
   Lazily loads mapillary-js (only when the customer actually
   clicks "Explore Street View") and shows real, crowd-sourced
   street-level imagery centered on the shipment's current
   coordinates, with a clean fallback when no imagery exists
   near that location.

   The Mapillary access token used here is a client token,
   meant to be used in browser code - it's fetched from our own
   backend (GET /api/config/maps-key) so it isn't hardcoded into
   source control, but it is expected to be visible in the
   browser once loaded. That's how Mapillary's client-side
   integration model works.
============================================================ */

(function () {

    "use strict";

    const CONFIG = {

        keyEndpoint:
            (typeof LWX_API !== "undefined" ? LWX_API : "/api") + "/config/maps-key",

        libraryJsUrl:
            "https://unpkg.com/mapillary-js@4.1.2/dist/mapillary.js",

        libraryCssUrl:
            "https://unpkg.com/mapillary-js@4.1.2/dist/mapillary.css",

        graphApiUrl:
            "https://graph.mapillary.com/images",

        // Search a small box first, then a slightly wider one if
        // nothing turned up close by - real coverage nearby is
        // still meaningfully representative of "this location".
        searchOffsets: [0.001, 0.005]

    };


    let accessToken = null;

    let libraryLoadPromise = null;

    let viewer = null;


    function fetchAccessToken(){

        return fetch(CONFIG.keyEndpoint)
            .then(res => res.json())
            .then(data => data.mapillaryAccessToken || "");

    }


    function loadStylesheet(href){

        if(document.querySelector('link[href="' + href + '"]')) return;

        const link = document.createElement("link");

        link.rel = "stylesheet";

        link.href = href;

        document.head.appendChild(link);

    }


    function loadMapillaryLibrary(){

        if(libraryLoadPromise) return libraryLoadPromise;

        libraryLoadPromise = new Promise((resolve, reject) => {

            loadStylesheet(CONFIG.libraryCssUrl);

            if(window.mapillary && window.mapillary.Viewer){

                resolve();

                return;

            }

            const script = document.createElement("script");

            script.src = CONFIG.libraryJsUrl;

            script.async = true;

            script.onload = () => resolve();

            script.onerror = () => reject(new Error("Failed to load Street View library."));

            document.head.appendChild(script);

        });

        return libraryLoadPromise;

    }


    function buildBoundingBox(lat, lng, offset){

        return [

            lng - offset,
            lat - offset,
            lng + offset,
            lat + offset

        ].join(",");

    }


    async function findNearestImageId(lat, lng, token){

        for(const offset of CONFIG.searchOffsets){

            const bbox = buildBoundingBox(lat, lng, offset);

            const url =
                CONFIG.graphApiUrl +
                "?access_token=" + encodeURIComponent(token) +
                "&fields=id&bbox=" + bbox + "&limit=1";

            const response = await fetch(url);

            if(!response.ok) continue;

            const data = await response.json();

            if(data && Array.isArray(data.data) && data.data.length){

                return data.data[0].id;

            }

        }

        return null;

    }


    function getModalElements(){

        return {

            modal: document.getElementById("streetViewModal"),
            closeBtn: document.getElementById("streetViewClose"),
            locationName: document.getElementById("streetViewLocationName"),
            loading: document.getElementById("streetViewLoading"),
            panoramaEl: document.getElementById("streetViewPanorama"),
            unavailable: document.getElementById("streetViewUnavailable"),
            unavailableText: document.getElementById("streetViewUnavailableText")

        };

    }


    function showState(els, state, message){

        els.loading.hidden = state !== "loading";

        els.panoramaEl.hidden = state !== "ready";

        els.unavailable.hidden = state !== "unavailable";

        if(state === "unavailable" && message && els.unavailableText){

            els.unavailableText.textContent = message;

        }

    }


    function destroyViewer(){

        if(!viewer) return;

        try{

            viewer.remove();

        }
        catch(error){

            // already torn down - nothing to do

        }

        viewer = null;

    }


    async function open(lat, lng, locationName){

        const els = getModalElements();

        if(!els.modal) return;

        els.modal.hidden = false;

        els.locationName.textContent = locationName || "-";

        showState(els, "loading");

        try{

            if(accessToken === null){

                accessToken = await fetchAccessToken();

            }

            if(!accessToken){

                showState(

                    els,

                    "unavailable",

                    "Street View isn't configured for this site yet. Please contact LinkWorld Express customer care."

                );

                return;

            }

            const imageId = await findNearestImageId(Number(lat), Number(lng), accessToken);

            if(!imageId){

                showState(

                    els,

                    "unavailable",

                    "Street View is not available at this location."

                );

                return;

            }

            await loadMapillaryLibrary();

            destroyViewer();

            els.panoramaEl.innerHTML = "";

            showState(els, "ready");

            viewer = new mapillary.Viewer({

                accessToken: accessToken,
                container: els.panoramaEl,
                imageId: imageId,

                // Skip the click-to-play cover thumbnail - drop
                // straight into the interactive panorama, matching
                // how the "Explore Street View" button reads.
                component: { cover: false }

            });

        }

        catch(error){

            console.error("Street View error:", error);

            showState(

                els,

                "unavailable",

                "Street View couldn't be loaded right now. Please try again in a moment."

            );

        }

    }


    function close(){

        const els = getModalElements();

        if(!els.modal) return;

        els.modal.hidden = true;

        destroyViewer();

    }


    function initModalControls(){

        const els = getModalElements();

        if(!els.modal) return;

        if(els.closeBtn){

            els.closeBtn.addEventListener("click", close);

        }

        els.modal.addEventListener("click", (e) => {

            if(e.target === els.modal) close();

        });

        document.addEventListener("keydown", (e) => {

            if(e.key === "Escape" && !els.modal.hidden) close();

        });

    }


    if(document.readyState === "loading"){

        document.addEventListener("DOMContentLoaded", initModalControls);

    }
    else{

        initModalControls();

    }


    window.LinkWorldStreetView = { open, close };

})();
