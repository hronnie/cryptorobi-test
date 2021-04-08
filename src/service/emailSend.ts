require('dotenv').config();
const nodemailer = require("nodemailer");

const gmailAddress = process.env.GMAIL_ADDRESS || '';
const gmailPassword = process.env.GMAIL_APP_PASSWORD || '';

function createMailMessage(subject: string, body: string) {
    return {
        from: 'cryptorobi_info@gmail.com',
        to: gmailAddress,
        subject,
        text: body,
        body,
    }
}

const mailTransport = nodemailer.createTransport(

    `smtps://${encodeURIComponent(gmailAddress)}:${encodeURIComponent(gmailPassword)}@smtp.gmail.com`
)

export function sendEmail(message: string) {
    console.log('gmailAddress', gmailAddress);
    console.log('gmailPassword', gmailPassword);
    let fullEmail: any;
    fullEmail = createMailMessage("### Crypto Robi Message ### ", message)

    return mailTransport
        .sendMail(fullEmail)
        .catch((error: any) => {
            console.error(
                "There was an error while sending the email ... trying again...", error
            )
        })
}
