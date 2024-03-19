import nodemailer from "nodemailer"



export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    service: 'gmail',
    auth: {
        user: 'sksatenderkumar59@gmail.com',
        pass: 'nlfggpdqwoojbdoe',
    },
});

export function generatresendotp() {
    let otp = ''
    const digit = "1234567890"

    for (let i = 0; i <= 5; i++) {
        const rendomdigit = Math.floor(Math.random() * digit.length)
        otp += rendomdigit;
    }
    return otp;
}

