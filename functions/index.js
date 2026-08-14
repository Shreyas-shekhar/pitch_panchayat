const { defineSecret } = require("firebase-functions/params");

const resendApiKey = defineSecret("RESEND_API_KEY");

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions/v2");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const { onRequest } = require("firebase-functions/v2/https");
// const { setGlobalOptions } = require("firebase-functions/v2");

// setGlobalOptions({
//   maxInstances: 10,
// });

// exports.helloWorld = onRequest((req, res) => {
//   res.send("Pitch Panchayat Backend is Working!");
// });

const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { sendWelcomeEmail } = require("./services/emailService");

setGlobalOptions({
  maxInstances: 10,
});

// Test function
exports.helloWorld = onRequest((req, res) => {
  res.send("Pitch Panchayat Backend is Working!");
});

// Registration trigger
exports.onRegistrationCreated = onDocumentCreated(
  {
    document: "registrations/{registrationId}",
    secrets: [resendApiKey],
  },
  async (event) => {
    try {
      const data = event.data.data();

      await sendWelcomeEmail({
        name: data.name,
        email: data.email,
        registrationId: event.params.registrationId,
        startup: data.startup || "Not Provided",
        college: data.college || "Not Provided",
      });

      console.log("Welcome email sent successfully.");
    } catch (err) {
      console.error("Failed to process registration:", err);
    }
  }
);
