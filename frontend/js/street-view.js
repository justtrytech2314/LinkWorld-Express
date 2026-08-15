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

        // Widening ladder of search boxes, in degrees, smallest first.
        //
        // It has to start this tight: Mapillary answers a box that
        // contains too many photos with HTTP 500 ("reduce the amount of
        // data you're asking for"), so in a well-covered city centre the
        // wide boxes fail outright. Dense places match on the first rung
        // and never reach them; sparse places need the wide rungs but
        // hold few enough photos to answer them fine.
        searchOffsets: [0.0002, 0.0005, 0.001, 0.003, 0.005],

        // Enough candidates to choose the closest from. A limit of 1 is
        // NOT equivalent - Mapillary will hand back an empty page for
        // limit=1 at locations that demonstrably do have coverage.
        searchLimit: 25,

        // Give up waiting for the panorama to paint and show it anyway.
        viewerReadyTimeoutMs: 12000

    };


    let accessToken = "";

    let libraryLoadPromise = null;

    let viewer = null;

    // Incremented on every open() so an in-flight load can tell that it
    // has been superseded. See the isStale() guard below.
    let openRequestId = 0;


    function fetchAccessToken(){

        return fetch(CONFIG.keyEndpoint)
            .then(res => res.ok ? res.json() : null)
            .then(data => (data && data.mapillaryAccessToken) || "")
            .catch(() => "");

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


    // Great-circle distance in metres, used to rank candidates.
    function distanceMetres(latA, lngA, latB, lngB){

        const earthRadius = 6371000;

        const toRad = Math.PI / 180;

        const dLat = (latB - latA) * toRad;

        const dLng = (lngB - lngA) * toRad;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latA * toRad) * Math.cos(latB * toRad) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        return 2 * earthRadius * Math.asin(Math.sqrt(a));

    }


    // Returns { imageId, distance } for the closest photo we can find,
    // or null when the area genuinely has no coverage. Throws only when
    // Mapillary itself is unreachable, so the caller can tell "nothing
    // here" apart from "the service is down" and say the right thing.
    async function findNearestImage(lat, lng, token){

        let sawServiceError = false;

        for(const offset of CONFIG.searchOffsets){

            const bbox = buildBoundingBox(lat, lng, offset);

            const url =
                CONFIG.graphApiUrl +
                "?access_token=" + encodeURIComponent(token) +
                "&fields=id,computed_geometry" +
                "&bbox=" + bbox +
                "&limit=" + CONFIG.searchLimit;

            let response;

            try{

                response = await fetch(url);

            }
            catch(networkError){

                sawServiceError = true;

                continue;

            }

            if(!response.ok){

                // Every wider box holds strictly more photos, so once one
                // is refused as too large the rest will be too.
                if(response.status >= 500) break;

                sawServiceError = true;

                continue;

            }

            const data = await response.json().catch(() => null);

            const candidates = (data && Array.isArray(data.data) ? data.data : [])
                .filter(item => item && item.id && item.computed_geometry &&
                    Array.isArray(item.computed_geometry.coordinates));

            if(!candidates.length) continue;

            let best = null;

            let bestDistance = Infinity;

            candidates.forEach(item => {

                const coords = item.computed_geometry.coordinates;

                const metres = distanceMetres(lat, lng, coords[1], coords[0]);

                if(metres < bestDistance){

                    bestDistance = metres;

                    best = item;

                }

            });

            if(best) return { imageId: best.id, distance: Math.round(bestDistance) };

        }

        if(sawServiceError){

            throw new Error("Mapillary imagery search is unavailable.");

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


    // Resolves once the panorama has actually painted, so the spinner
    // stays up until there is something to look at instead of handing
    // the customer an empty black box. Falls through on a timeout - a
    // late panorama still beats a stuck spinner.
    function waitForViewerReady(instance){

        return new Promise(resolve => {

            let settled = false;

            const finish = () => {

                if(settled) return;

                settled = true;

                resolve();

            };

            ["image", "load"].forEach(eventName => {

                try{

                    instance.on(eventName, finish);

                }
                catch(error){

                    // event not supported on this build - the timeout covers us

                }

            });

            setTimeout(finish, CONFIG.viewerReadyTimeoutMs);

        });

    }


    async function open(lat, lng, locationName){

        const els = getModalElements();

        if(!els.modal) return;

        const latitude = Number(lat);

        const longitude = Number(lng);

        if(!Number.isFinite(latitude) || !Number.isFinite(longitude)){

            els.modal.hidden = false;

            els.locationName.textContent = locationName || "-";

            showState(

                els,

                "unavailable",

                "This shipment doesn't have usable GPS coordinates yet, so Street View isn't available."

            );

            return;

        }

        // Every open gets a ticket. If the customer closes the modal or
        // opens another location while this one is still loading, the
        // stale run bails out instead of painting over the new view.
        openRequestId += 1;

        const requestId = openRequestId;

        const isStale = () => requestId !== openRequestId || els.modal.hidden;

        els.modal.hidden = false;

        els.locationName.textContent = locationName || "-";

        showState(els, "loading");

        try{

            // Only a real token is worth caching - caching an empty one
            // would leave Street View permanently "not configured" after
            // a single hiccup on the config request.
            if(!accessToken){

                accessToken = await fetchAccessToken();

            }

            if(isStale()) return;

            if(!accessToken){

                showState(

                    els,

                    "unavailable",

                    "Street View isn't configured for this site yet. Please contact LinkWorld Express customer care."

                );

                return;

            }

            const nearest = await findNearestImage(latitude, longitude, accessToken);

            if(isStale()) return;

            if(!nearest){

                showState(

                    els,

                    "unavailable",

                    "No street-level imagery has been captured near this location yet."

                );

                return;

            }

            await loadMapillaryLibrary();

            if(isStale()) return;

            destroyViewer();

            els.panoramaEl.innerHTML = "";

            // The container must be visible and laid out before the
            // viewer measures it, but keep the spinner on top until the
            // panorama has actually painted.
            els.panoramaEl.hidden = false;

            const instance = new mapillary.Viewer({

                accessToken: accessToken,
                container: els.panoramaEl,
                imageId: nearest.imageId,

                // Skip the click-to-play cover thumbnail - drop
                // straight into the interactive panorama, matching
                // how the "Explore Street View" button reads.
                component: { cover: false }

            });

            viewer = instance;

            await waitForViewerReady(instance);

            if(isStale()){

                // Closed while the panorama was loading - don't leak it.
                if(viewer === instance) destroyViewer();

                return;

            }

            showState(els, "ready");

            // Mapillary sizes itself from the container, which was hidden
            // when the modal first opened - nudge it now that it isn't.
            try{

                instance.resize();

            }
            catch(error){

                // older builds size themselves - nothing to do

            }

        }

        catch(error){

            console.error("Street View error:", error);

            if(isStale()) return;

            destroyViewer();

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

        // Supersede anything still loading so it can't paint into a
        // modal the customer has already dismissed.
        openRequestId += 1;

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
