const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter. The transporter is the service that'll send the email .i.e gmail
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'James Bond 007@email.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions); // returns a promise
};

module.exports = sendEmail;
