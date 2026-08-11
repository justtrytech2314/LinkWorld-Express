// ======================================================
// LINKWORLD EXPRESS
// CONTACT CONTROLLER
// Public contact form submission (contact.html)
// ======================================================

const ContactMessage = require("../models/ContactMessage");


function generateReferenceNumber(){

    return (
        "MSG-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 9000 + 1000)
    );

}


// ======================================================
// SUBMIT CONTACT MESSAGE
// PUBLIC
// POST /api/contact
// ======================================================

exports.submitContactMessage = async (req, res) => {

    try{

        const {

            name,
            email,
            phone,
            subject,
            message

        } = req.body;


        if(

            !name ||
            !email ||
            !subject ||
            !message

        ){

            return res.status(400).json({

                success:false,

                message:"Please complete all required fields."

            });

        }


        const contactMessage = await ContactMessage.create({

            referenceNumber: generateReferenceNumber(),

            name,

            email,

            phone: phone || "",

            subject,

            message

        });


        return res.status(201).json({

            success:true,

            message:"Message sent successfully.",

            contactMessage

        });

    }

    catch(error){

        console.error("CONTACT SUBMIT ERROR:", error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};
