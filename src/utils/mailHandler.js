const nodemailer = require("nodemailer");


const SENDMAIL = async (email, subject, text) => {
    try {
        let mailTransporter =
            nodemailer.createTransport(
                {
                    service: "Gmail",
                    name: 'gmail.com',
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.USER_PASSWORD,
                    }
                }
            );

        let mailDetails = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text 
        };

        mailTransporter
            .sendMail(mailDetails,
                function (err, data) {
                    if (err) {
                        console.log('Error Occurs');
                    } else {
                        console.log('Email sent successfully');
                    }
                });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = SENDMAIL;