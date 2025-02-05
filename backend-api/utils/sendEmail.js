const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, textContent, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.privateemail.com",
            port: 465, // or 587 if you prefer STARTTLS
            secure: true, // Set to true for 465 (SSL), false for 587 (STARTTLS)
            auth: {
                user: process.env.EMAIL_USER, // Your PrivateEmail email address
                pass: process.env.EMAIL_PASS, // Your PrivateEmail password
            },
            logger: true,  // Enable debugging logs
            debug: true,
        });

        await transporter.sendMail({
            from: '"SimpleGeoAPI" <info@simplegeoapi.com>', // Ensure this matches your domain
            to,
            subject,
            text: textContent,
            html: htmlContent
        });

        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
};

module.exports = sendEmail;
