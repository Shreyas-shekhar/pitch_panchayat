const { Resend } = require("resend");

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

module.exports = { getResendClient };