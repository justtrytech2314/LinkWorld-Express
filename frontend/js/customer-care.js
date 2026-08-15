/* ============================================================
   LINKWORLD EXPRESS
   LINKWORLD CARE - FLOATING AI CUSTOMER SUPPORT
   ------------------------------------------------------------
   File:     js/customer-care.js
   Component: customer-care.html
   Styles:   css/customer-care.css
   Backend:  POST /api/customer-care/chat
             GET  /api/customer-care/contact

   Same loading pattern as js/cookies.js: fetches its own
   markup fragment and injects it into whichever real page
   included this script, so nothing needs to be duplicated
   in every HTML file.

   Conversation history is session-only (sessionStorage) -
   nothing is written to a database, and the browser never
   talks to the AI provider or MongoDB directly, only to our
   own backend.
============================================================ */

(function () {

    "use strict";


    /* =========================================================
       CONFIGURATION
    ========================================================== */

    const CONFIG = {

        component: "customer-care.html",

        historyKey: "linkworld_care_history",

        greetingSeenKey: "linkworld_care_greeting_seen",

        greetingDelayMs: 6000,

        greetingAutoHideMs: 12000,

        maxHistoryTurnsSent: 16,

        maxHistoryStored: 40,

        apiBase:
            (typeof LWX_API !== "undefined" ? LWX_API : "/api") +
            "/customer-care"

    };


    const WELCOME_TEXT =
        "👋 Hello! Welcome to LinkWorld Express.\n\n" +
        "I'm LinkWorld Care, your customer-support assistant. How can I help you today?";


    const QUICK_ACTIONS = [

        { icon: "fa-solid fa-box", label: "Track My Shipment", message: "I'd like to track my shipment." },
        { icon: "fa-solid fa-truck", label: "Shipment Help", message: "I need help with my shipment." },
        { icon: "fa-solid fa-sack-dollar", label: "Shipping Quote", message: "I'd like a shipping quote." },
        { icon: "fa-solid fa-earth-americas", label: "Shipping Information", message: "Tell me about your shipping services and destinations." },
        { icon: "fa-solid fa-receipt", label: "Payment / Receipt Help", message: "I need help with payment or my receipt." },
        { icon: "fa-solid fa-headset", label: "Contact Customer Care", contactCard: true }

    ];


    /* =========================================================
       STATE
    ========================================================== */

    let history = [];

    let els = {};

    let greetingTimer = null;

    let greetingHideTimer = null;


    /* =========================================================
       UTILITIES
    ========================================================== */

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value === null || value === undefined ? "" : String(value);

        return div.innerHTML;

    }

    function formatDate(value) {

        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    }

    function formatTime(date) {

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });

    }

    function scrollMessagesToBottom() {

        if (!els.messages) return;

        els.messages.scrollTop = els.messages.scrollHeight;

    }


    /* =========================================================
       SESSION HISTORY (sessionStorage - this tab, this visit)
    ========================================================== */

    function loadStoredHistory() {

        try {

            const raw = sessionStorage.getItem(CONFIG.historyKey);

            const parsed = raw ? JSON.parse(raw) : [];

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {

            return [];

        }

    }

    function persistHistory() {

        try {

            sessionStorage.setItem(
                CONFIG.historyKey,
                JSON.stringify(history.slice(-CONFIG.maxHistoryStored))
            );

        } catch (error) {

            // sessionStorage unavailable (private browsing etc) - the
            // widget still works, it just won't survive a page nav.

        }

    }

    /* `transient` marks a locally-generated notice (a connection error,
       not something the assistant actually said). It still shows in the
       transcript, but it is never sent back to the model as prior
       context - otherwise the AI reads its own error text as a real
       reply and the conversation drifts. */
    function pushMessage(role, content, transient) {

        history.push({ role, content, time: new Date().toISOString(), transient: !!transient });

        if (history.length > CONFIG.maxHistoryStored) {

            history = history.slice(-CONFIG.maxHistoryStored);

        }

        persistHistory();

    }


    /* =========================================================
       RENDER: MESSAGE ROWS
    ========================================================== */

    function appendRow(role, buildInner) {

        const row = document.createElement("div");

        row.className = `lw-care-row ${role}`;

        buildInner(row);

        els.messages.appendChild(row);

        scrollMessagesToBottom();

        return row;

    }

    function appendTextBubble(role, text, time) {

        return appendRow(role, (row) => {

            const bubble = document.createElement("div");

            bubble.className = "lw-care-bubble";

            bubble.textContent = text;

            row.appendChild(bubble);

            const stamp = document.createElement("span");

            stamp.className = "lw-care-timestamp";

            stamp.textContent = formatTime(time ? new Date(time) : new Date());

            row.appendChild(stamp);

        });

    }

    function appendCard(role, html) {

        return appendRow(role, (row) => {

            row.insertAdjacentHTML("beforeend", html);

        });

    }

    function appendQuickActions() {

        appendRow("assistant", (row) => {

            const wrap = document.createElement("div");

            wrap.className = "lw-care-quick-actions";

            QUICK_ACTIONS.forEach((action) => {

                const btn = document.createElement("button");

                btn.type = "button";

                btn.className = "lw-care-quick-btn";

                btn.innerHTML =
                    `<i class="${action.icon}" aria-hidden="true"></i> ${escapeHTML(action.label)}`;

                btn.addEventListener("click", () => handleQuickAction(action));

                wrap.appendChild(btn);

            });

            row.appendChild(wrap);

        });

    }

    function appendTypingIndicator() {

        return appendRow("assistant typing", (row) => {

            const bubble = document.createElement("div");

            bubble.className = "lw-care-bubble";

            bubble.innerHTML =
                '<span class="lw-care-typing-dot"></span>' +
                '<span class="lw-care-typing-dot"></span>' +
                '<span class="lw-care-typing-dot"></span>';

            row.appendChild(bubble);

        });

    }


    /* =========================================================
       RENDER: SHIPMENT CARD
    ========================================================== */

    function buildShipmentCardHTML(shipment) {

        const rows = [
            ["Origin", shipment.origin],
            ["Current Location", shipment.currentLocation],
            ["Destination", shipment.destination],
            ["Expected Delivery", formatDate(shipment.expectedDelivery)],
            ["Payment Status", shipment.paymentStatus]
        ];

        const rowsHTML = rows.map(([label, value]) => `
            <div class="lw-care-shipment-row">
                <span>${escapeHTML(label)}</span>
                <span>${escapeHTML(value || "—")}</span>
            </div>
        `).join("");

        const trackingUrl =
            `tracking-result.html?tracking=${encodeURIComponent(shipment.trackingNumber)}`;

        return `
            <div class="lw-care-shipment-card">
                <div class="lw-care-shipment-head">
                    <span>${escapeHTML(shipment.trackingNumber)}</span>
                    <span class="lw-care-shipment-status">${escapeHTML(shipment.status)}</span>
                </div>
                <div class="lw-care-shipment-body">${rowsHTML}</div>
                <a class="lw-care-shipment-link" href="${escapeHTML(trackingUrl)}">
                    View Full Tracking Details
                </a>
            </div>
        `;

    }


    /* =========================================================
       RENDER: CONTACT CARD
    ========================================================== */

    function buildContactCardHTML(contact) {

        return `
            <div class="lw-care-contact-card">
                <div class="lw-care-contact-row">
                    <i class="fa-solid fa-envelope" aria-hidden="true"></i> ${escapeHTML(contact.email)}
                </div>
                <div class="lw-care-contact-row">
                    <i class="fa-solid fa-phone" aria-hidden="true"></i> ${escapeHTML(contact.phone)}
                </div>
                <div class="lw-care-contact-row">
                    <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHTML(contact.address)}
                </div>
                <a class="lw-care-contact-link" href="${escapeHTML(contact.contactPageUrl)}">
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Go To Contact Page
                </a>
            </div>
        `;

    }


    /* =========================================================
       WELCOME
    ========================================================== */

    function renderWelcome() {

        appendTextBubble("assistant", WELCOME_TEXT, new Date());

        appendQuickActions();

    }

    function replayHistory() {

        history.forEach((entry) => {

            appendTextBubble(entry.role, entry.content, entry.time);

        });

    }


    /* =========================================================
       SEND PIPELINE
    ========================================================== */

    function setInputDisabled(disabled) {

        els.input.disabled = disabled;

        els.send.disabled = disabled;

    }

    async function callChatAPI(message, priorHistory) {

        const response = await fetch(`${CONFIG.apiBase}/chat`, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
                message,
                history: priorHistory
                    .filter((entry) => !entry.transient)
                    .map((entry) => ({
                        role: entry.role,
                        content: entry.content
                    }))
            })

        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data || !data.success) {

            throw new Error((data && data.message) || "Request failed.");

        }

        return data;

    }

    async function handleSend(rawText) {

        const text = (rawText || "").trim();

        if (!text) return;

        hideGreeting(true);

        const priorHistory = history.slice(-CONFIG.maxHistoryTurnsSent);

        pushMessage("user", text);

        appendTextBubble("user", text, new Date());

        els.input.value = "";

        setInputDisabled(true);

        const typingRow = appendTypingIndicator();

        try {

            const data = await callChatAPI(text, priorHistory);

            typingRow.remove();

            pushMessage("assistant", data.reply);

            appendTextBubble("assistant", data.reply, new Date());

            if (data.shipment) {

                appendCard("assistant", buildShipmentCardHTML(data.shipment));

            }

        }

        catch (error) {

            console.error("LinkWorld Care error:", error);

            typingRow.remove();

            const fallback =
                "I'm having trouble connecting right now. Please try again in a moment or contact LinkWorld Express customer care.";

            pushMessage("assistant", fallback, true);

            appendTextBubble("assistant", fallback, new Date());

        }

        finally {

            setInputDisabled(false);

            els.input.focus();

        }

    }

    async function showContactCard() {

        pushMessage("user", "Contact Customer Care");

        appendTextBubble("user", "Contact Customer Care", new Date());

        const typingRow = appendTypingIndicator();

        try {

            const response = await fetch(`${CONFIG.apiBase}/contact`);

            const data = await response.json();

            typingRow.remove();

            if (!data.success) throw new Error("Contact lookup failed.");

            const contact = data.contact;

            pushMessage(
                "assistant",
                `${contact.message} Email: ${contact.email}. Phone: ${contact.phone}.`
            );

            appendTextBubble("assistant", contact.message, new Date());

            appendCard("assistant", buildContactCardHTML(contact));

        }

        catch (error) {

            console.error("LinkWorld Care contact card error:", error);

            typingRow.remove();

            const fallback =
                "I'm having trouble loading our contact details right now. Please try again shortly.";

            pushMessage("assistant", fallback, true);

            appendTextBubble("assistant", fallback, new Date());

        }

    }

    function handleQuickAction(action) {

        if (action.contactCard) {

            showContactCard();

            return;

        }

        handleSend(action.message);

    }


    /* =========================================================
       GREETING BUBBLE
       Shown once per browser session, after a short delay,
       never forced on the visitor more than that.
    ========================================================== */

    function hasSeenGreeting() {

        try {

            return sessionStorage.getItem(CONFIG.greetingSeenKey) === "1";

        } catch (error) {

            return true;

        }

    }

    function markGreetingSeen() {

        try {

            sessionStorage.setItem(CONFIG.greetingSeenKey, "1");

        } catch (error) {

            // ignore

        }

    }

    function showGreeting() {

        if (!els.panel.hidden) return;

        els.greeting.hidden = false;

        markGreetingSeen();

        greetingHideTimer = setTimeout(() => hideGreeting(), CONFIG.greetingAutoHideMs);

    }

    function hideGreeting(immediate) {

        clearTimeout(greetingTimer);

        clearTimeout(greetingHideTimer);

        if (els.greeting) els.greeting.hidden = true;

    }

    function scheduleGreeting() {

        if (hasSeenGreeting()) return;

        greetingTimer = setTimeout(showGreeting, CONFIG.greetingDelayMs);

    }


    /* =========================================================
       PANEL OPEN / CLOSE
    ========================================================== */

    function openPanel() {

        els.panel.hidden = false;

        els.fab.setAttribute("aria-expanded", "true");

        els.fabIconOpen.hidden = true;

        els.fabIconClose.hidden = false;

        hideGreeting();

        scrollMessagesToBottom();

        setTimeout(() => els.input.focus(), 60);

    }

    function closePanel() {

        els.panel.hidden = true;

        els.fab.setAttribute("aria-expanded", "false");

        els.fabIconOpen.hidden = false;

        els.fabIconClose.hidden = true;

    }

    function togglePanel() {

        if (els.panel.hidden) openPanel(); else closePanel();

    }


    /* =========================================================
       INIT
    ========================================================== */

    function initWidget(root) {

        els = {

            widget: root,
            greeting: root.querySelector("#lwCareGreeting"),
            greetingClose: root.querySelector("#lwCareGreetingClose"),
            fab: root.querySelector("#lwCareFab"),
            fabIconOpen: root.querySelector("#lwCareFabIconOpen"),
            fabIconClose: root.querySelector("#lwCareFabIconClose"),
            panel: root.querySelector("#lwCarePanel"),
            minimize: root.querySelector("#lwCareMinimize"),
            close: root.querySelector("#lwCareClose"),
            messages: root.querySelector("#lwCareMessages"),
            form: root.querySelector("#lwCareForm"),
            input: root.querySelector("#lwCareInput"),
            send: root.querySelector("#lwCareSend")

        };

        els.fab.addEventListener("click", togglePanel);

        els.minimize.addEventListener("click", closePanel);

        els.close.addEventListener("click", closePanel);

        els.greetingClose.addEventListener("click", (e) => {

            e.stopPropagation();

            hideGreeting();

        });

        els.greeting.addEventListener("click", () => {

            hideGreeting();

            openPanel();

        });

        els.form.addEventListener("submit", (e) => {

            e.preventDefault();

            handleSend(els.input.value);

        });

        document.addEventListener("keydown", (e) => {

            if (e.key === "Escape" && !els.panel.hidden) closePanel();

        });

        history = loadStoredHistory();

        if (history.length) {

            replayHistory();

        } else {

            renderWelcome();

        }

        scheduleGreeting();

    }

    async function loadWidget() {

        try {

            const response = await fetch(CONFIG.component, {
                method: "GET",
                cache: "no-store"
            });

            if (!response.ok) throw new Error("HTTP " + response.status);

            const html = await response.text();

            const container = document.createElement("div");

            container.innerHTML = html.trim();

            const widget = container.querySelector("#lwCareWidget");

            if (!widget) throw new Error("lwCareWidget was not found in customer-care.html");

            document.body.appendChild(widget);

            initWidget(widget);

        }

        catch (error) {

            console.error("LinkWorld Care failed to load:", error);

        }

    }

    function startCustomerCare() {

        loadWidget();

    }

    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", startCustomerCare);

    } else {

        startCustomerCare();

    }


    /* =========================================================
       OPTIONAL DEVELOPMENT HELPER
       In the console: LinkWorldCare.reset()
    ========================================================== */

    window.LinkWorldCare = {

        reset: function () {

            try {

                sessionStorage.removeItem(CONFIG.historyKey);

                sessionStorage.removeItem(CONFIG.greetingSeenKey);

            } catch (error) {

                // ignore

            }

            window.location.reload();

        }

    };

})();
