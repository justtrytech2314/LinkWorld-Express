// ======================================================
// LINKWORLD EXPRESS
// SERVER
// PRODUCTION VERSION 10/10
// ======================================================


// ======================================================
// ENVIRONMENT
// ======================================================

require("dotenv").config();




// ======================================================
// IMPORTS
// ======================================================

const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const compression = require("compression");

const morgan = require("morgan");

const connectDB = require("./config/database");





// ======================================================
// APP INITIALIZATION
// ======================================================

const app = express();





// ======================================================
// DATABASE CONNECTION
// ======================================================

connectDB();





// ======================================================
// PROXY TRUST
// ------------------------------------------------------
// Render (like most hosts) terminates TLS at its own proxy
// and forwards the real client address in X-Forwarded-For.
// Without this, req.ip is Render's internal address for
// every visitor, so all of them share a single rate-limit
// bucket: one abusive client would throttle every customer,
// and a stranger's failed logins would lock the
// administrator out of their own dashboard.
//
// The value is 1, not true. "true" trusts the whole chain,
// which lets a client forge X-Forwarded-For and sidestep
// every limit; 1 trusts only Render's own hop.
// ======================================================

app.set("trust proxy", 1);


// ======================================================
// SECURITY / MIDDLEWARE
// ======================================================


app.use(helmet());

app.use(compression());

app.use(morgan(

    process.env.NODE_ENV === "production" ? "combined" : "dev"

));


const PRODUCTION_ORIGINS = [

    "https://linkworldexpress.com",

    "https://www.linkworldexpress.com"

];


app.use(cors({

    origin: (origin, callback) => {

        // No Origin header: curl, server-to-server, or a page
        // opened directly from disk (file://) sends "null".
        if (!origin || origin === "null") {

            return callback(null, true);

        }

        if (PRODUCTION_ORIGINS.includes(origin)) {

            return callback(null, true);

        }

        // Any local dev server, on any port.
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {

            return callback(null, true);

        }

        return callback(new Error("Not allowed by CORS"));

    },

    methods: [

        "GET",

        "POST",

        "PUT",

        "DELETE"

    ],

    allowedHeaders: [

        "Content-Type",

        "Authorization"

    ],

    credentials: true

}));





app.use(express.json({

    limit:"10mb"

}));



app.use(express.urlencoded({

    extended:true,

    limit:"10mb"

}));





// ======================================================
// HEALTH CHECK
// ======================================================


app.get("/", (req,res)=>{


    res.status(200).json({

        success:true,

        message:
        "LinkWorld Express Backend Running",

        environment:
        process.env.NODE_ENV || "development",

        time:
        new Date()

    });


});





// ======================================================
// API ROUTES
// ======================================================


app.use(

    "/api/shipments",

    require("./routes/shipmentRoutes")

);



app.use(

    "/api/admin",

    require("./routes/authRoutes")

);



app.use(

    "/api/requests",

    require("./routes/requestRoutes")

);



app.use(

    "/api/contact",

    require("./routes/contactRoutes")

);



app.use(

    "/api/customer-care",

    require("./routes/customerCareRoutes")

);



app.use(

    "/api/config",

    require("./routes/configRoutes")

);





// ======================================================
// 404 HANDLER
// ======================================================


app.use((req,res)=>{


    res.status(404).json({

        success:false,

        message:
        "Route not found."

    });


});





// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================


app.use((err,req,res,next)=>{


    console.error(

        "SERVER ERROR:",

        err

    );



    res.status(

        err.status || 500

    ).json({


        success:false,


        message:

        err.message ||

        "Internal server error."


    });


});





// ======================================================
// SERVER START
// ======================================================


const PORT = process.env.PORT || 5000;



const server = app.listen(PORT,()=>{


    console.log("========================================");

    console.log(
        `🚀 LinkWorld Express API running on port ${PORT}`
    );

    console.log("========================================");



    // ==================================================
    // AI MODEL WATCHDOG
    // Providers retire models without notice. This checks
    // now and on an interval, so a retired model is
    // replaced before a customer ever reaches it, instead
    // of after their message has already failed.
    // ==================================================

    require("./services/customerCareService").startModelMonitor();

});





// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================


process.on(

"SIGINT",

async()=>{


    console.log(

        "\nStopping server..."

    );


    server.close(()=>{


        console.log(

            "HTTP server closed."

        );


        process.exit(0);


    });


});


process.on(

"SIGTERM",

async()=>{


    console.log(

        "\nSIGTERM received."

    );


    server.close(()=>{


        console.log(

            "Server shutdown complete."

        );


        process.exit(0);


    });


});




// ======================================================
// UNHANDLED ERRORS
// ======================================================


process.on(

"unhandledRejection",

(error)=>{


    console.error(

        "Unhandled Promise Rejection:",

        error

    );


});



process.on(

"uncaughtException",

(error)=>{


    console.error(

        "Uncaught Exception:",

        error

    );


});




// ======================================================
// END OF LINKWORLD EXPRESS SERVER
// ======================================================