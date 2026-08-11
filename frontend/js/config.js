/* ======================================================
LINKWORLD EXPRESS
SHARED FRONTEND CONFIG
Single source of truth for the API base URL.
Include this BEFORE any other page script.
====================================================== */

"use strict";

const LWX_API =
(function () {

    const host = window.location.hostname;

    const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "";

    if (isLocal) {

        return "http://localhost:5000/api";

    }

    return "https://linkworld-express-kchx.onrender.com/api";

})();

// Root of the API server, no "/api" suffix (health check use).
const LWX_API_ROOT =
LWX_API.replace(/\/api$/, "");
