// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - APPROVED COMPANY KNOWLEDGE
// ------------------------------------------------------
// This is the ONLY source of company facts the AI is
// allowed to draw from (besides live shipment data looked
// up per-request). Every line below was pulled from the
// live site (about.html, services.html, faq.html,
// contact.html) - nothing here is invented.
//
// If you update real content on the site (prices, hours,
// contact details, services), update it here too so the
// assistant stays accurate.
// ======================================================

"use strict";

const CONTACT = {

    email: "linkworldexpresslogistics@gmail.com",
    emailNote: "Replies within 2 hours",

    phone: "+44 7874 351 899",

    address: "Business Innovation Centre, Sardis Road, Pontypridd CF37 1DL, Wales, United Kingdom",

    hours: "24 hours a day, every day",

    contactPageUrl: "contact.html"

};

const SHIPMENT_STATUSES = [
    "Shipment Created",
    "Processing",
    "Picked Up",
    "In Transit",
    "At Facility",
    "Out For Delivery",
    "Delivered",
    "Cancelled"
];

const SERVICES = [
    { name: "Air Freight", description: "Fast, priority air cargo for time-sensitive shipments crossing international borders." },
    { name: "Ocean Freight", description: "Cost-effective sea freight for large-volume commercial cargo and international imports." },
    { name: "Road Transport", description: "Reliable domestic and regional trucking with scheduled pickup and delivery windows." },
    { name: "Express Delivery", description: "Priority courier service for urgent documents and time-critical packages." },
    { name: "Warehousing", description: "Secure storage facilities with inventory management and cargo handling support." },
    { name: "Customs Clearance", description: "Professional documentation and customs processing for international shipments." }
];

// Plain-text knowledge block handed to the model as grounding.
// Kept as prose (not raw JSON) since it reads more naturally to the model.
const KNOWLEDGE_TEXT = `
COMPANY
LinkWorld Express is a global logistics company providing international courier, freight forwarding and logistics solutions, built around real-time shipment tracking. Company values: Integrity, Reliability, Innovation, Customer First.

SERVICES (six service lines, all run on the same tracked logistics network with one tracking number regardless of how the shipment moves):
${SERVICES.map(s => `- ${s.name}: ${s.description}`).join("\n")}

HOW BOOKING WORKS
1. Request - customer submits a shipment request on the "Ship Now" page with sender, receiver and package details.
2. Confirm - the LinkWorld Express team reviews and confirms the request (this is a request for review, not an instant automatic booking).
3. Process - pickup, freight handling or warehousing begins.
4. Deliver - the customer can track it live until it reaches its destination.

DELIVERY TIMES
Express shipments typically arrive within 2-5 business days. Standard delivery typically takes 5-10 business days. Exact timing depends on destination and the service selected - never state a specific delivery date unless it came from a real shipment lookup.

WHAT CAN BE SHIPPED
Documents, personal parcels, electronics, commercial goods, medical supplies, furniture and personal effects. Restricted or hazardous items may require extra documentation - tell the customer to contact support if unsure. Oversized or heavy commercial cargo is handled through Air and Ocean Freight. Professional packaging and special handling is available for fragile or valuable items when booking.

TRACKING
Every shipment gets a unique tracking number (format: LWX followed by the year and a code, e.g. LWX2026A8F4C9D2) and can be tracked in real time from pickup to delivery. Status updates are logged as the shipment reaches each hub, so there can be a normal gap between physical movement and the next scan. If there has been no change in over 24 hours, tell the customer to contact support.

SHIPMENT STATUSES, IN ORDER
${SHIPMENT_STATUSES.join(" -> ")}

PRICING AND PAYMENT
LinkWorld Express does NOT have a fixed public rate card. Cost depends on weight, dimensions, destination and delivery speed. After a shipment request is submitted, the team reviews it and confirms final pricing directly with the customer, and confirms available payment methods for their region and shipment type at that time. NEVER invent a price, rate, fee or payment method - if asked for a quote or a payment method list, say that pricing/payment is confirmed directly by the team after a request is submitted, and offer to help them start a request or direct them to customer care.

CANCELLATIONS AND REFUNDS
Cancellations made before pickup are generally eligible for a refund. Direct the customer to contact support with their tracking number so the team can review it.

CUSTOMS
Most international shipments require a commercial invoice and an accurate description of contents. The Customs Clearance service handles documentation and duty calculation. Prohibited and restricted items vary by destination country - if something unusual is being shipped, tell the customer to contact support before booking.

INSURANCE
Optional shipment insurance is available for valuable cargo, documents and commercial goods, selected at booking time.

RECEIPTS
Customers can view and download an official PDF shipment receipt using their tracking number, showing shipment status, route, and a verification barcode/QR code.

BUSINESS / PARTNERSHIP ACCOUNTS
Available - customers shipping regularly or with a partnership enquiry should select "Partnership Enquiry" on the Contact page form.

PRIVACY
LinkWorld Express has a Privacy Policy and a Cookie Policy, linked in the site footer and the cookie consent banner.

CUSTOMER SUPPORT
Available ${CONTACT.hours}, by phone and email.
Email: ${CONTACT.email} (${CONTACT.emailNote})
Phone: ${CONTACT.phone}
Head Office: ${CONTACT.address}
Contact page: ${CONTACT.contactPageUrl}
`.trim();

module.exports = {
    CONTACT,
    SHIPMENT_STATUSES,
    SERVICES,
    KNOWLEDGE_TEXT
};
