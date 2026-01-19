const router = require("express").Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Veuillez remplir tous les champs." });
    }

    try {
        // Create transporter with Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.HOST_EMAIL,
                pass: process.env.EMAIL_PASS, // Gmail App Password
            }
        });

        // 1️⃣ Email to User (Confirmation)
        await transporter.sendMail({
            from: process.env.HOST_EMAIL,
            to: email,
            subject: `Merci pour votre message - "${subject}"`,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmation de réception</title>
                </head>
                <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                        <!-- Header -->
                        <div style="background: linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%); padding: 40px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                            </div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Message Reçu !</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">For Happy Days vous remercie</p>
                        </div>

                        <!-- Content -->
                        <div style="padding: 50px 40px;">
                            <h2 style="color: #333; margin: 0 0 25px; font-size: 24px; font-weight: 600;">
                                Bonjour <span style="color: #FF6B6B;">${name}</span>,
                            </h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                                Nous avons bien reçu votre message concernant <strong>"${subject}"</strong> 
                                et nous vous en remercions. Notre équipe prend en charge votre demande 
                                et vous répondra dans les plus brefs délais.
                            </p>

                            <!-- Message Card -->
                            <div style="background: #f8f9fa; border-left: 4px solid #4ECDC4; padding: 25px; border-radius: 12px; margin: 30px 0;">
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                                        </svg>
                                    </div>
                                    <h3 style="color: #333; margin: 0; font-size: 18px;">Votre message :</h3>
                                </div>
                                <div style="color: #555; line-height: 1.7; background: white; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea;">
                                    ${message}
                                </div>
                            </div>

                            <!-- Timeline -->
                            <div style="margin: 40px 0 30px;">
                                <h3 style="color: #333; margin-bottom: 20px; font-size: 18px; display: flex; align-items: center;">
                                    <span style="background: #FFD93D; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-right: 10px;">⏱</span>
                                    Ce que vous pouvez attendre :
                                </h3>
                                <div style="display: flex; flex-direction: column; gap: 20px;">
                                    <div style="display: flex; align-items: start;">
                                        <div style="width: 24px; height: 24px; background: #6BCF63; border-radius: 50%; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                        </div>
                                        <div>
                                            <p style="color: #333; margin: 0 0 5px; font-weight: 600;">Réponse sous 24-48h</p>
                                            <p style="color: #666; margin: 0; font-size: 14px;">Notre équipe vous répondra par email</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: start;">
                                        <div style="width: 24px; height: 24px; background: #FFA726; border-radius: 50%; margin-right: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                        </div>
                                        <div>
                                            <p style="color: #333; margin: 0 0 5px; font-weight: 600;">Support personnalisé</p>
                                            <p style="color: #666; margin: 0; font-size: 14px;">Une solution adaptée à votre demande</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="border-top: 2px dashed #eaeaea; padding-top: 30px; text-align: center;">
                                <p style="color: #888; margin-bottom: 25px; font-size: 14px;">
                                    Si vous avez besoin d'une réponse urgente, vous pouvez nous contacter directement au :
                                </p>
                                <a href="tel:${encodeURIComponent(process.env.CLIENT_PHONE)}" style="display: inline-block; background: linear-gradient(90deg, #36D1DC 0%, #5B86E5 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; margin-bottom: 25px;">
                                    📞 ${process.env.CLIENT_PHONE}
                                </a>
                                <p style="color: #999; font-size: 13px; margin: 30px 0 0;">
                                    Avec toute notre gratitude,<br>
                                    <strong style="color: #FF6B6B;">L'équipe For Happy Days</strong>
                                </p>
                            </div>
                        </div>

                        <!-- Bottom Banner -->
                        <div style="background: #2D3436; padding: 20px; text-align: center;">
                            <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 15px;">
                                <a href="${process.env.CLIENT_DOMAIN}" style="color: #74B9FF; text-decoration: none; font-size: 13px;">Site Web</a>
                                <a href="${process.env.CLIENT_DOMAIN}/contact" style="color: #74B9FF; text-decoration: none; font-size: 13px;">Contact</a>
                                <a href="${process.env.CLIENT_DOMAIN}/confidentialite" style="color: #74B9FF; text-decoration: none; font-size: 13px;">Confidentialité</a>
                            </div>
                            <p style="color: #999; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} For Happy Days. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        // 2️⃣ Email to Admin (Notification)
        await transporter.sendMail({
            from: process.env.HOST_EMAIL,
            to: process.env.HOST_EMAIL, // your admin email
            replyTo: email,             // reply goes to user
            subject: `Nouvelle demande de contact: "${subject}"`,
            html: `
                <div style="width:100%; background-color:#f3f9ff; padding:50px 0; font-family:sans-serif;">
                    <div style="max-width:700px; margin:0 auto; background:white; border-radius:15px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <div style="background:#FFAB07; padding:20px; text-align:center;">
                            <h2 style="color:white; margin:0;">Nouvelle demande de contact</h2>
                        </div>
                        <div style="padding:30px; color:#333;">
                            <p><b>Nom:</b> ${name}</p>
                            <p><b>Email:</b> ${email}</p>
                            <p><b>Sujet:</b> ${subject}</p>
                            <p><b>Message:</b></p>
                            <p style="background:#f3f3f3; padding:15px; border-radius:8px;">${message}</p>
                        </div>
                    </div>
                </div>
            `
        });

        // Respond to frontend
        res.status(200).json({ message: "Message envoyé avec succès !" });

    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({
            message: error.message || "Erreur lors de l'envoi du message",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;