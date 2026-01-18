const router = require("express").Router();
const nodemailer = require("nodemailer");

router.post("/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        const transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: process.env.HOST_EMAIL,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: process.env.HOST_EMAIL,
            to: email,
            subject: `Accusé de réception de votre demande "${subject}"`,
            html: `<div style="width:100%; background-color:#f3f9ff; padding:5rem 0;">
                    <div style="max-width:700px; background-color:white; margin:0 auto; border-radius: 15px; box-shadow:2px 2px 2px black;">
                        <div style="max-width:100%; background-color:#FFAB07; padding:20px 0;">
                        <a href="${process.env.CLIENT_DOMAIN}"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlVEc33VlZCxgSudT7c-2ZWiph62N5XeBYtQ&usqp=CAU"
                        style="width:100%; height:70px; object-fit:contain"/>
                        </a>
                        </div>
                        <div style="width:100%; gap:10px; padding:30px 0; display:grid">
                            <p style="font-weight:700; font-size:1.0rem; padding:0 30px">
                            Merci pour votre mail à For happy Days, nous allons vous contacter dans les meilleurs délais</p>
                            <div style="font-size:0.8rem; margin:0 30px">
                            <p>Nom: <b>${name}</b></p>
                            <p>Suject: <b>${subject}</b></p>
                            <p>Message: <b>${message}</b></p>
                            </div>
                         </div>
                        </div> 
                    </div>`
        });
        res.status(200).json({ message: "message sent" });

    } catch (error) {
        console.error("Contact form error:", error);
        // Return more detailed error message
        const errorMessage = error.message || "Failed to send message";
        res.status(400).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
