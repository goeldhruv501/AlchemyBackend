const nodemailer = require("nodemailer")
require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.UserNamenodemailer,
        pass: process.env.password
    }
});

exports.OTPSender = async (userName, name, randomOtp) => {

    const info = await transporter.sendMail({
        from: '"SPECS Support" <support@lenskart.com>',
        to: userName,
        subject: "Your OTP for Login Verification",
        
        html: `
        <div style="background-color:#f4f4f4;padding:20px;font-family:Arial, sans-serif;border-radius:10px;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;padding:20px;border-radius:8px;box-shadow:0px 0px 10px rgba(0,0,0,0.1);">
                <h2 style="color:#0072CE;text-align:center;">SPECS</h2>
                <hr style="border:1px solid #0072CE;">
                <p style="font-size:16px;color:#333;">Dear ${name},</p>
                <p style="font-size:16px;color:#333;">Your One-Time Password (OTP) for login verification is:</p>
                <div style="background-color:#0072CE;color:#ffffff;font-size:24px;font-weight:bold;text-align:center;padding:10px;margin:20px 0;border-radius:5px;">
                    ${randomOtp}
                </div>
                <p style="font-size:16px;color:#333;">This OTP is valid for 5 minutes. Please do not share it with anyone for security reasons.</p>
                <br>
                <p style="font-size:14px;color:#555;">Best Regards,</p>
                <p style="font-size:14px;color:#555;">Team SPECS</p>
            </div>
        </div>
        `,
    });
    

    console.log("Message sent: %s", info.messageId);

}
