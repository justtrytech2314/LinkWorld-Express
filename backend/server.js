// ======================================================
// LINKWORLD EXPRESS
// SERVER
// PRODUCTION VERSION 10/10
// ======================================================


const dns = require("dns");


// ======================================================
// FORCE GOOGLE DNS
// Fix MongoDB Atlas SRV DNS issues
// ======================================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);




// ======================================================
// ENVIRONMENT
// ======================================================

require("dotenv").config();




// ======================================================
// IMPORTS
// ======================================================

const express = require("express");

const cors = require("cors");

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
// SECURITY / MIDDLEWARE
// ======================================================


app.use(cors({

    origin: "*",

    methods: [

        "GET",

        "POST",

        "PUT",

        "DELETE"

    ],

    allowedHeaders: [

        "Content-Type",

        "Authorization"

    ]

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