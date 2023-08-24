const {
  client_Id,
  client_secret,
  refresh_token,
  pass,
} = require("../config.json");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "sproutlingbot@gmail.com",
    pass: pass,
    clientId: client_Id,
    clientSecret: client_secret,
    refreshToken: refresh_token,
  },
});

module.exports = {
  async send(email, text, subject) {
    let mailOptions = {
      from: "sproutlingbot@gmail.com",
      to: email,
      subject: subject,
      text: text,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("sent");
    } catch (error) {
      console.error(error);
    }
    // await transporter.sendMail(mailOptions, function (err, data) {
    //   if (err) {
    //     console.log("Error " + err);
    //   } else {
    //     console.log("Email sent successfully");
    //   }
    // });
  },
};
