// ======================================================
// LINKWORLD EXPRESS
// TIME-BASED ONE-TIME PASSWORD (TOTP)
// ------------------------------------------------------
// RFC 6238 two-factor codes, compatible with Google
// Authenticator, Authy, 1Password and similar apps.
//
// The shared secret lives only in ADMIN_TOTP_SECRET in the
// environment - never in this repository, and never in the
// database.
// ======================================================

"use strict";

const { generateSecret, generateURI, verify } = require("otplib");


// Authenticator codes are always exactly six digits.
const TOKEN_PATTERN = /^\d{6}$/;


// otplib defaults to zero tolerance, meaning a code is only
// accepted inside its exact 30-second step. That rejects
// honest logins whenever the phone's clock differs slightly
// from the server's, or the step rolls over mid-typing.
// One step either side is the usual compromise: it costs a
// negligible amount of security and removes a whole class of
// "my code doesn't work" failures.
const TOLERANCE_SECONDS = 30;


// ======================================================
// VERIFY A CODE
// Returns a plain boolean and never throws - otplib rejects
// malformed input with an exception, which on a public login
// endpoint would turn a typo into a 500.
// ======================================================

async function verifyToken(secret, token){

    if(!secret) return false;

    // Authenticator apps display codes as "123 456".
    const cleaned = String(token == null ? "" : token).replace(/\s+/g, "");

    if(!TOKEN_PATTERN.test(cleaned)) return false;

    try{

        const result = await verify({

            secret,

            token: cleaned,

            epochTolerance: TOLERANCE_SECONDS

        });

        return result?.valid === true;

    }
    catch(error){

        // A malformed secret or unexpected library error must fail
        // closed, never fall through as authenticated.
        console.error("TOTP verification error:", error.message);

        return false;

    }

}


// ======================================================
// ENROLMENT HELPERS
// Used only by the setup script, never at request time.
// ======================================================

function createSecret(){

    return generateSecret();

}


function buildEnrolmentUri(secret, accountLabel){

    return generateURI({

        secret,

        label: accountLabel,

        issuer: "LinkWorld Express"

    });

}


module.exports = {
    verifyToken,
    createSecret,
    buildEnrolmentUri,
    TOKEN_PATTERN
};
