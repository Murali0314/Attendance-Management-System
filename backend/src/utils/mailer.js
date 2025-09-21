// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT || '587', 10),
//     secure: false,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

// async function sendEmail(to, subject, text) {
//     if (!process.env.SMTP_HOST) {
//         console.log('[Dev] Email skipped:', { to, subject, text });
//         return;
//     }
//     await transporter.sendMail({ from: process.env.FROM_EMAIL || process.env.SMTP_USER, to, subject, text });
// }

// module.exports = { sendEmail };



const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendEmail(to, subject, text) {
    // Remove the development check to always send emails if SMTP is configured
    console.log("emails sent");
    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to,
            subject,
            text,
        });
        console.log('[Email sent]:', { to, subject });
    } catch (error) {
        console.error('[Email error]:', error);
    }
}

module.exports = { sendEmail };