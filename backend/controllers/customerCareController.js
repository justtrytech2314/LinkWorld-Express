// ======================================================
// LINKWORLD EXPRESS
// LINKWORLD CARE - CUSTOMER CARE CONTROLLER
// ======================================================

"use strict";

const {
    generateReply,
    getContactCard
} = require("../services/customerCareService");


// ======================================================
// INPUT LIMITS
// ======================================================

const MAX_MESSAGE_LENGTH = 1000;

const MAX_HISTORY_ENTRIES = 16;

const MAX_HISTORY_ENTRY_LENGTH = 2000;


// ======================================================
// SANITIZE CONVERSATION HISTORY FROM THE CLIENT
// The client only ever supplies this session's own chat -
// we still cap it defensively before it goes anywhere near
// the AI call.
// ======================================================

function sanitizeHistory(rawHistory){

    if(!Array.isArray(rawHistory)) return [];

    return rawHistory

        .filter(entry =>
            entry &&
            typeof entry.content === "string" &&
            (entry.role === "user" || entry.role === "assistant")
        )

        .slice(-MAX_HISTORY_ENTRIES)

        .map(entry => ({
            role: entry.role,
            content: entry.content.slice(0, MAX_HISTORY_ENTRY_LENGTH)
        }));

}


// ======================================================
// POST /api/customer-care/chat
// ======================================================

exports.chat = async (req, res) => {

    try{

        const rawMessage = req.body?.message;

        if(typeof rawMessage !== "string" || !rawMessage.trim()){

            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });

        }

        const message = rawMessage.trim().slice(0, MAX_MESSAGE_LENGTH);

        const history = sanitizeHistory(req.body?.history);

        const result = await generateReply({ message, history });

        return res.status(200).json({
            success: true,
            reply: result.reply,
            shipment: result.shipment
        });

    }

    catch(error){

        console.error("LINKWORLD CARE ERROR:", error);

        // A busy AI service is a different problem from a broken one -
        // telling the customer to wait a few seconds is actionable,
        // where a generic connection error just reads as "it's down".
        const status = Number(error?.status ?? error?.code);

        if(status === 429){

            return res.status(503).json({
                success: false,
                message: "I'm getting a lot of questions at the moment. Please wait a few seconds and send that again, or contact LinkWorld Express customer care if it's urgent."
            });

        }

        return res.status(503).json({
            success: false,
            message: "I'm having trouble connecting right now. Please try again in a moment or contact LinkWorld Express customer care."
        });

    }

};


// ======================================================
// GET /api/customer-care/contact
// Deterministic - no AI call, so it can never be wrong.
// ======================================================

exports.contactCard = (req, res) => {

    try{

        return res.status(200).json({
            success: true,
            contact: getContactCard()
        });

    }

    catch(error){

        console.error("LINKWORLD CARE CONTACT CARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load contact information right now."
        });

    }

};
