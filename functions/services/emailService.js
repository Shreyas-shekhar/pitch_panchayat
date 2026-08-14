const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { getResendClient } = require("../config/resend");

async function sendWelcomeEmail(participant) {
  try {
    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../templates/welcomeEmail.html"
    );

    const source = fs.readFileSync(templatePath, "utf8");

    const template = Handlebars.compile(source);

    const html = template({
      name: participant.name,
      registrationId: participant.registrationId,
      startup: participant.startup,
      college: participant.college,
    });
    const resend = getResendClient();

    const response = await resend.emails.send({
      from: "Pitch Panchayat <shekharshreyas22@gmail.com>",
      to: participant.email,
      subject: "Welcome to Pitch Panchayat 🎉",
      html,
    });

    console.log("Email sent:", response);

    return response;
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  
};