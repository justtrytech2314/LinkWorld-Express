/* ============================================================
   LinkWorld Express — mock logistics data engine
   No backend exists yet, so this simulates a real tracking API:
   - deterministic route generation per tracking ID (seeded)
   - a package's position is derived from real elapsed time,
     so it genuinely advances each hour without any server
   ============================================================ */

const HUBS = [
    { code: "JFK", city: "New York",    country: "USA",           lat: 40.6413, lng: -73.7781 },
    { code: "LHR", city: "London",      country: "UK",            lat: 51.4700, lng: -0.4543 },
    { code: "CDG", city: "Paris",       country: "France",        lat: 49.0097, lng: 2.5479 },
    { code: "DXB", city: "Dubai",       country: "UAE",           lat: 25.2532, lng: 55.3657 },
    { code: "SIN", city: "Singapore",   country: "Singapore",     lat: 1.3644,  lng: 103.9915 },
    { code: "HKG", city: "Hong Kong",   country: "China",         lat: 22.3080, lng: 113.9185 },
    { code: "NRT", city: "Tokyo",       country: "Japan",         lat: 35.7720, lng: 140.3929 },
    { code: "SYD", city: "Sydney",      country: "Australia",     lat: -33.9399,lng: 151.1753 },
    { code: "GRU", city: "São Paulo",   country: "Brazil",        lat: -23.4356,lng: -46.4731 },
    { code: "JNB", city: "Johannesburg",country: "South Africa",  lat: -26.1367,lng: 28.2411 },
    { code: "FRA", city: "Frankfurt",   country: "Germany",       lat: 50.0379, lng: 8.5622 },
    { code: "LOS", city: "Lagos",       country: "Nigeria",       lat: 6.5774,  lng: 3.3212 },
    { code: "DEL", city: "New Delhi",   country: "India",         lat: 28.5562, lng: 77.1000 },
    { code: "YYZ", city: "Toronto",     country: "Canada",        lat: 43.6777, lng: -79.6248 },
];

const STORAGE_PREFIX = "lw_pkg_";

/* ---------- seeded RNG so the same ID always produces the same route ---------- */
function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function normalizeId(raw) {
    return (raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

function isValidId(id) {
    // Accept 6-15 alphanumeric characters — permissive, this is a demo, not a carrier's real format.
    return /^[A-Z0-9]{6,15}$/.test(id);
}

/* ---------- build (or load) a package record ---------- */
function getOrCreatePackage(rawId) {
    const id = normalizeId(rawId);
    if (!isValidId(id)) return null;

    const key = STORAGE_PREFIX + id;
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const rand = mulberry32(hashSeed(id));

    const originIdx = Math.floor(rand() * HUBS.length);
    let destIdx = Math.floor(rand() * HUBS.length);
    while (destIdx === originIdx) destIdx = Math.floor(rand() * HUBS.length);

    // 1 or 2 transit hubs between origin and destination
    const hopCount = 1 + Math.floor(rand() * 2);
    const usedIdx = new Set([originIdx, destIdx]);
    const transitHubs = [];
    for (let i = 0; i < hopCount; i++) {
        let idx = Math.floor(rand() * HUBS.length);
        let attempts = 0;
        while (usedIdx.has(idx) && attempts < 20) {
            idx = Math.floor(rand() * HUBS.length);
            attempts++;
        }
        usedIdx.add(idx);
        transitHubs.push(idx);
    }

    const routeIdx = [originIdx, ...transitHubs, destIdx];

    // each hop takes 5-26 hours
    const hopHours = routeIdx.slice(0, -1).map(() => 5 + Math.floor(rand() * 21));

    const carriers = ["LinkWorld Air Cargo", "LinkWorld Ground Fleet", "LinkWorld Express Freighter"];
    const hopCarrier = hopHours.map(() => carriers[Math.floor(rand() * carriers.length)]);

    const weightKg = (0.4 + rand() * 14).toFixed(1);
    const service = rand() > 0.5 ? "Priority Express" : "Standard International";

    // shipped "now minus" a random point so different IDs land in different states
    const totalHours = hopHours.reduce((a, b) => a + b, 0);
    const elapsedFraction = rand(); // where in the journey this package "already is" the first time it's looked up
    const shippedAt = Date.now() - Math.floor(elapsedFraction * totalHours * 1.35) * 3600 * 1000;

    const pkg = {
        id,
        routeIdx,
        hopHours,
        hopCarrier,
        weightKg,
        service,
        shippedAt,
        demoOffsetHours: 0, // used only by the on-page "advance time" demo control
    };

    localStorage.setItem(key, JSON.stringify(pkg));
    return pkg;
}

function advanceDemoHours(id, hours) {
    const key = STORAGE_PREFIX + normalizeId(id);
    const pkg = JSON.parse(localStorage.getItem(key));
    if (!pkg) return null;
    pkg.demoOffsetHours = (pkg.demoOffsetHours || 0) + hours;
    localStorage.setItem(key, JSON.stringify(pkg));
    return pkg;
}

/* ---------- derive live status from a package record ---------- */
function computeStatus(pkg) {
    const totalHours = pkg.hopHours.reduce((a, b) => a + b, 0);
    const now = Date.now() + (pkg.demoOffsetHours || 0) * 3600 * 1000;
    const elapsedHours = Math.max(0, (now - pkg.shippedAt) / 3600000);
    const progressHours = Math.min(elapsedHours, totalHours);

    const route = pkg.routeIdx.map(i => HUBS[i]);
    const cumulative = [0];
    pkg.hopHours.forEach(h => cumulative.push(cumulative[cumulative.length - 1] + h));

    let hopIndex = pkg.hopHours.length - 1;
    for (let i = 0; i < pkg.hopHours.length; i++) {
        if (progressHours <= cumulative[i + 1]) { hopIndex = i; break; }
    }

    const hopStart = cumulative[hopIndex];
    const hopEnd = cumulative[hopIndex + 1];
    const hopFraction = hopEnd > hopStart ? (progressHours - hopStart) / (hopEnd - hopStart) : 1;

    const from = route[hopIndex];
    const to = route[hopIndex + 1];
    const lat = from.lat + (to.lat - from.lat) * hopFraction;
    const lng = from.lng + (to.lng - from.lng) * hopFraction;

    const delivered = elapsedHours >= totalHours;
    const eta = new Date(pkg.shippedAt + totalHours * 3600000);

    // timeline events: pickup, each intermediate arrival, delivery
    const events = [];
    events.push({
        label: `Picked up · ${route[0].city}, ${route[0].country}`,
        time: new Date(pkg.shippedAt),
        state: "done",
    });
    for (let i = 1; i < route.length - 1; i++) {
        const t = new Date(pkg.shippedAt + cumulative[i] * 3600000);
        events.push({
            label: `Arrived at hub · ${route[i].city}, ${route[i].country}`,
            time: t,
            state: elapsedHours >= cumulative[i] ? "done" : "pending",
        });
    }
    events.push({
        label: `Delivered · ${route[route.length - 1].city}, ${route[route.length - 1].country}`,
        time: eta,
        state: delivered ? "done" : "pending",
    });
    // mark current in-flight leg
    if (!delivered) {
        const inTransitLabel = `In transit · ${from.city} → ${to.city}`;
        events.splice(hopIndex + 1, 0, {
            label: inTransitLabel,
            time: null,
            state: "active",
            carrier: pkg.hopCarrier[hopIndex],
        });
    }

    return {
        lat, lng,
        currentCity: delivered ? to.city : `${from.city} → ${to.city}`,
        delivered,
        eta,
        progressPercent: Math.min(100, Math.round((progressHours / totalHours) * 100)),
        route,
        events,
        carrier: pkg.hopCarrier[Math.min(hopIndex, pkg.hopCarrier.length - 1)],
    };
}