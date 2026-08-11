/* ============================================================
   LINKWORLD EXPRESS
   PREMIUM COOKIE CONSENT SYSTEM
   ------------------------------------------------------------
   File:
   js/cookies.js

   Component:
   cookies.html

   Styles:
   css/cookies.css

   FEATURES:
   - Detects a browser with no previous consent
   - Loads cookies.html automatically
   - Shows consent banner for new browser/site visitors
   - Saves cookie preferences
   - Supports Accept All
   - Supports Essential Only
   - Supports Manage Preferences
   - Supports Save Preferences
   - Keeps consent for 180 days
   - Does not show again while valid consent exists
   - Works across the entire website when loaded on each page
============================================================ */

(function () {

    "use strict";


    /* =========================================================
       CONFIGURATION
    ========================================================== */

    const CONFIG = {

        /*
         * Name used to identify the visitor's
         * LinkWorld Express cookie-consent record.
         */

        consentKey:
            "linkworld_express_cookie_consent",


        /*
         * Number of days the consent remains valid.
         */

        consentDays:
            180,


        /*
         * Location of your cookie HTML component.
         */

        component:
            "cookies.html"

    };


    /* =========================================================
       UTILITY:
       GET COOKIE
    ========================================================== */

    function getCookie(name) {

        const cookies =
            document.cookie.split(";");


        for (
            let i = 0;
            i < cookies.length;
            i++
        ) {

            const cookie =
                cookies[i].trim();


            if (
                cookie.indexOf(name + "=") === 0
            ) {

                return decodeURIComponent(
                    cookie.substring(
                        name.length + 1
                    )
                );

            }

        }


        return null;

    }


    /* =========================================================
       UTILITY:
       SET COOKIE
    ========================================================== */

    function setCookie(
        name,
        value,
        days
    ) {

        const expirationDate =
            new Date();


        expirationDate.setTime(
            expirationDate.getTime()
            +
            days *
            24 *
            60 *
            60 *
            1000
        );


        /*
         * SameSite=Lax is appropriate for
         * a normal website consent cookie.
         */

        document.cookie =
            name
            +
            "="
            +
            encodeURIComponent(value)
            +
            ";expires="
            +
            expirationDate.toUTCString()
            +
            ";path=/;SameSite=Lax";

    }


    /* =========================================================
       UTILITY:
       REMOVE COOKIE
    ========================================================== */

    function deleteCookie(name) {

        document.cookie =
            name
            +
            "=;"
            +
            "expires=Thu, 01 Jan 1970 00:00:00 UTC;"
            +
            "path=/;";

    }


    /* =========================================================
       GET SAVED CONSENT
    ========================================================== */

    function getSavedConsent() {

        /*
         * First check the consent cookie.
         */

        const cookieValue =
            getCookie(
                CONFIG.consentKey
            );


        if (cookieValue) {

            try {

                return JSON.parse(
                    cookieValue
                );

            } catch (error) {

                /*
                 * If the cookie is corrupted,
                 * remove it and continue.
                 */

                deleteCookie(
                    CONFIG.consentKey
                );

            }

        }


        /*
         * Also check localStorage.
         *
         * This gives the website a reliable
         * browser-side record.
         */

        try {

            const localValue =
                localStorage.getItem(
                    CONFIG.consentKey
                );


            if (localValue) {

                return JSON.parse(
                    localValue
                );

            }

        } catch (error) {

            console.warn(
                "LinkWorld Express: unable to read localStorage."
            );

        }


        return null;

    }


    /* =========================================================
       CHECK WHETHER CONSENT IS STILL VALID
    ========================================================== */

    function hasValidConsent() {

        const consent =
            getSavedConsent();


        /*
         * No consent exists.
         */

        if (!consent) {

            return false;

        }


        /*
         * Check timestamp.
         */

        if (!consent.timestamp) {

            return false;

        }


        const consentDate =
            new Date(
                consent.timestamp
            );


        /*
         * Invalid timestamp.
         */

        if (
            Number.isNaN(
                consentDate.getTime()
            )
        ) {

            return false;

        }


        const expirationDate =
            new Date(
                consentDate.getTime()
                +
                CONFIG.consentDays *
                24 *
                60 *
                60 *
                1000
            );


        /*
         * Consent has expired.
         */

        if (
            new Date() >=
            expirationDate
        ) {

            removeSavedConsent();

            return false;

        }


        return true;

    }


    /* =========================================================
       SAVE CONSENT
    ========================================================== */

    function saveConsent(
        choice,
        analytics,
        preferences,
        marketing
    ) {

        const consent = {

            essential:
                true,

            analytics:
                Boolean(analytics),

            preferences:
                Boolean(preferences),

            marketing:
                Boolean(marketing),

            choice:
                choice,

            timestamp:
                new Date().toISOString()

        };


        const serializedConsent =
            JSON.stringify(
                consent
            );


        /*
         * Save browser cookie.
         */

        setCookie(

            CONFIG.consentKey,

            serializedConsent,

            CONFIG.consentDays

        );


        /*
         * Save local browser record.
         */

        try {

            localStorage.setItem(

                CONFIG.consentKey,

                serializedConsent

            );

        } catch (error) {

            console.warn(
                "LinkWorld Express: localStorage could not be saved."
            );

        }

    }


    /* =========================================================
       REMOVE SAVED CONSENT
       ---------------------------------------------------------
       Useful for testing during development.
    ========================================================== */

    function removeSavedConsent() {

        deleteCookie(
            CONFIG.consentKey
        );


        try {

            localStorage.removeItem(
                CONFIG.consentKey
            );

        } catch (error) {

            console.warn(
                "LinkWorld Express: unable to clear localStorage."
            );

        }

    }


    /* =========================================================
       LOAD cookies.html
    ========================================================== */

    async function loadCookieComponent() {

        /*
         * If valid consent already exists,
         * do NOT load the cookie banner.
         */

        if (
            hasValidConsent()
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    CONFIG.component,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );

            }


            const html =
                await response.text();


            /*
             * Create temporary container.
             */

            const container =
                document.createElement(
                    "div"
                );


            container.innerHTML =
                html.trim();


            /*
             * Get the actual cookie banner.
             */

            const banner =
                container.querySelector(
                    "#lwCookieBanner"
                );


            if (!banner) {

                throw new Error(
                    "lwCookieBanner was not found in cookies.html"
                );

            }


            /*
             * Add the banner to the page.
             */

            document.body.appendChild(
                banner
            );


            /*
             * Activate all cookie controls.
             */

            initializeCookieBanner();


        } catch (error) {

            console.error(
                "LinkWorld Express Cookie System Error:",
                error
            );

        }

    }


    /* =========================================================
       INITIALIZE COOKIE BANNER
    ========================================================== */

    function initializeCookieBanner() {

        const banner =
            document.getElementById(
                "lwCookieBanner"
            );


        if (!banner) {

            return;

        }


        /*
         * Main controls.
         */

        const manageButton =
            document.getElementById(
                "lwManageCookies"
            );


        const essentialButton =
            document.getElementById(
                "lwEssentialCookies"
            );


        const acceptButton =
            document.getElementById(
                "lwAcceptCookies"
            );


        const savePreferencesButton =
            document.getElementById(
                "lwSavePreferences"
            );


        /*
         * Preference panel.
         */

        const preferencesPanel =
            document.getElementById(
                "lwCookiePreferences"
            );


        /*
         * Preference switches.
         */

        const analytics =
            document.getElementById(
                "lwAnalyticsCookies"
            );


        const preferences =
            document.getElementById(
                "lwPreferenceCookies"
            );


        const marketing =
            document.getElementById(
                "lwMarketingCookies"
            );


        /* =====================================================
           MANAGE PREFERENCES
        ====================================================== */

        if (
            manageButton &&
            preferencesPanel
        ) {

            manageButton.addEventListener(
                "click",
                function () {

                    const isHidden =
                        preferencesPanel.hasAttribute(
                            "hidden"
                        );


                    if (isHidden) {

                        /*
                         * Open preferences.
                         */

                        preferencesPanel.removeAttribute(
                            "hidden"
                        );


                        manageButton.textContent =
                            "Close Preferences";


                    } else {

                        /*
                         * Close preferences.
                         */

                        preferencesPanel.setAttribute(
                            "hidden",
                            ""
                        );


                        manageButton.textContent =
                            "Manage Preferences";

                    }

                }
            );

        }


        /* =====================================================
           ACCEPT ALL
        ====================================================== */

        if (acceptButton) {

            acceptButton.addEventListener(
                "click",
                function () {

                    saveConsent(

                        "accepted",

                        true,

                        true,

                        true

                    );


                    closeBanner();

                }
            );

        }


        /* =====================================================
           ESSENTIAL ONLY
        ====================================================== */

        if (essentialButton) {

            essentialButton.addEventListener(
                "click",
                function () {

                    saveConsent(

                        "essential-only",

                        false,

                        false,

                        false

                    );


                    closeBanner();

                }
            );

        }


        /* =====================================================
           SAVE CUSTOM PREFERENCES
        ====================================================== */

        if (
            savePreferencesButton
        ) {

            savePreferencesButton.addEventListener(
                "click",
                function () {

                    saveConsent(

                        "custom",

                        analytics
                            ? analytics.checked
                            : false,

                        preferences
                            ? preferences.checked
                            : false,

                        marketing
                            ? marketing.checked
                            : false

                    );


                    closeBanner();

                }
            );

        }


        /* =====================================================
           ESCAPE KEY
           -----------------------------------------------------
           We intentionally DO NOT close the banner with Escape.
           The visitor must make an explicit consent choice.
        ====================================================== */

    }


    /* =========================================================
       CLOSE COOKIE BANNER
    ========================================================== */

    function closeBanner() {

        const banner =
            document.getElementById(
                "lwCookieBanner"
            );


        if (!banner) {

            return;

        }


        /*
         * Add closing animation class.
         */

        banner.classList.add(
            "lw-cookie-closing"
        );


        /*
         * Remove after animation.
         */

        setTimeout(
            function () {

                if (
                    banner &&
                    banner.parentNode
                ) {

                    banner.parentNode.removeChild(
                        banner
                    );

                }

            },
            300
        );

    }


    /* =========================================================
       START SYSTEM
    ========================================================== */

    function startCookieSystem() {

        loadCookieComponent();

    }


    /* =========================================================
       WAIT FOR PAGE
    ========================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startCookieSystem
        );

    } else {

        startCookieSystem();

    }


    /* =========================================================
       OPTIONAL DEVELOPMENT HELPER
       ---------------------------------------------------------
       In the browser console you can run:

       LinkWorldCookies.reset()

       to make the banner appear again.

       Remove this section before production if desired.
    ========================================================== */

    window.LinkWorldCookies = {

        reset: function () {

            removeSavedConsent();

            window.location.reload();

        },

        getConsent: function () {

            return getSavedConsent();

        }

    };


})();
