const nodemailer = require("nodemailer");

require("dotenv").config();

// OPTIONAL DEBUG LOGS
console.log(
  "EMAIL_HOST:",
  process.env.EMAIL_HOST
);

console.log(
  "EMAIL_PORT:",
  process.env.EMAIL_PORT
);

console.log(
  "SENDER_EMAIL:",
  process.env.SENDER_EMAIL
);

// CREATE SMTP TRANSPORTER
const transporter =
  nodemailer.createTransport({

    host:
      process.env.EMAIL_HOST,

    port:
      Number(
        process.env.EMAIL_PORT
      ) || 587,

    secure:
      Number(
        process.env.EMAIL_PORT
      ) === 465,

    auth: {

      user:
        process.env.SENDER_EMAIL,

      pass:
        process.env.EMAIL_PASSWORD,
    },
  });

// OPTIONAL SMTP VERIFY
transporter.verify(
  (error, success) => {

    if (error) {

      console.error(
        "SMTP Verification Failed:",
        error.message
      );

    } else {

      console.log(
        "SMTP Server Ready"
      );
    }
  }
);

// SEND EMAIL FUNCTION
const sendEmail =
  async ({
    to,
    subject,
    text,
    html,
  }) => {

    try {

      const info =
        await transporter.sendMail({

          from:
            process.env.SENDER_EMAIL,

          to,

          subject,

          text,

          html,
        });

      console.log(
        "Email sent:",
        info.messageId
      );

      return info;

    } catch (error) {

      console.error(
        "Email sending failed:",
        error.message
      );

      // PREVENT APP CRASH
      return null;
    }
  };

module.exports =
  sendEmail;