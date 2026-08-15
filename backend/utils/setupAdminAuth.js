// ======================================================
// LINKWORLD EXPRESS
// ADMIN CREDENTIAL SETUP
// ------------------------------------------------------
// Run locally:   npm run setup-admin
//
// Asks for the administrator email and a new password,
// prints a QR code to scan with an authenticator app, and
// outputs the three lines to paste into .env.
//
// Nothing is written to disk and nothing is sent anywhere -
// the password is typed, hashed in memory, and only the
// bcrypt hash is ever displayed. The plain password never
// leaves this terminal.
// ======================================================

"use strict";

const readline = require("readline");

const bcrypt = require("bcryptjs");

const QRCode = require("qrcode");

const { createSecret, buildEnrolmentUri } = require("./totp");


function ask(question){

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {

        rl.question(question, answer => {

            rl.close();

            resolve(answer.trim());

        });

    });

}


// Reads a line without echoing it, so the password is not left
// visible on screen or in the terminal's scrollback.
function askHidden(question){

    return new Promise(resolve => {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const onData = char => {

            // Stop masking once the line is submitted.
            if(["\n", "\r", ""].includes(char.toString())){

                process.stdin.removeListener("data", onData);

                return;

            }

            readline.clearLine(process.stdout, 0);

            readline.cursorTo(process.stdout, 0);

            process.stdout.write(question + "*".repeat(rl.line.length));

        };

        process.stdin.on("data", onData);

        rl.question(question, answer => {

            rl.close();

            process.stdout.write("\n");

            resolve(answer);

        });

    });

}


function fail(message){

    console.error(`\n  ${message}\n`);

    process.exit(1);

}


(async () => {

    console.log("");
    console.log("========================================================");
    console.log("  LINKWORLD EXPRESS - ADMIN CREDENTIAL SETUP");
    console.log("========================================================");
    console.log("");
    console.log("  Generates a new admin login and two-factor secret.");
    console.log("  Nothing is saved or transmitted - you copy the output");
    console.log("  into .env yourself.");
    console.log("");

    const email = (await ask("  Admin email    : ")).toLowerCase();

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){

        fail("That does not look like a valid email address.");

    }

    const password = await askHidden("  New password   : ");

    if(password.length < 12){

        fail("Use at least 12 characters. This is the only thing between the public internet and your shipment database.");

    }

    const confirm = await askHidden("  Confirm        : ");

    if(password !== confirm){

        fail("Passwords did not match. Nothing was changed - run the command again.");

    }

    const hash = await bcrypt.hash(password, 12);

    const secret = createSecret();

    const uri = buildEnrolmentUri(secret, email);

    console.log("");
    console.log("========================================================");
    console.log("  STEP 1 - SCAN THIS WITH YOUR AUTHENTICATOR APP");
    console.log("========================================================");
    console.log("");
    console.log("  Google Authenticator, Authy, 1Password or Microsoft");
    console.log("  Authenticator will all read this.");
    console.log("");

    console.log(await QRCode.toString(uri, { type: "terminal", small: true }));

    console.log("  Can't scan? Enter this key manually instead:");
    console.log("");
    console.log("      " + secret);
    console.log("");

    console.log("========================================================");
    console.log("  STEP 2 - PUT THESE THREE LINES IN backend/.env");
    console.log("========================================================");
    console.log("");
    console.log("ADMIN_EMAIL=" + email);
    console.log("ADMIN_PASSWORD=" + hash);
    console.log("ADMIN_TOTP_SECRET=" + secret);
    console.log("");
    console.log("  Set the same three in your Render dashboard, or the");
    console.log("  live site will keep the old login.");
    console.log("");
    console.log("  Confirm the app shows a code BEFORE you close this");
    console.log("  window - the secret is not stored anywhere and cannot");
    console.log("  be recovered afterwards. Losing it means editing .env");
    console.log("  to get back in.");
    console.log("");

})().catch(error => {

    console.error("\n  Setup failed:", error.message, "\n");

    process.exit(1);

});
