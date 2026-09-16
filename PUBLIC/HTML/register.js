import {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    runTransaction,
    onAuthStateChanged
} from "./firebase.js";

console.log("register.js loaded");


// ======================================================
// GENERATE REGISTRATION ID
// ======================================================

async function generateRegistrationId() {

    const counterRef = doc(
        db,
        "counters",
        "registrationCounter"
    );

    return await runTransaction(
        db,
        async (transaction) => {

            const counterDoc =
                await transaction.get(counterRef);

            if (!counterDoc.exists()) {
                throw new Error(
                    "Registration counter not found in Firestore."
                );
            }

            const current =
                Number(counterDoc.data().current || 0);

            const next = current + 1;

            transaction.update(
                counterRef,
                {
                    current: next
                }
            );

            return `PP2026-${String(next).padStart(4, "0")}`;
        }
    );
}


// ======================================================
// FORM
// ======================================================

const form =
    document.getElementById("registrationForm");


if (form) {

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            console.log("Submit button clicked");


            // ==================================================
            // CHECK LOGIN
            // ==================================================

            const user = auth.currentUser;

            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "main_site.html";

                return;
            }


            try {

                // ==================================================
                // MAIN FORM DATA
                // ==================================================

                const fullName =
                    document.getElementById("fullName")
                        ?.value.trim() || "";

                const email =
                    document.getElementById("email")
                        ?.value.trim() || "";

                const phone =
                    document.getElementById("phone")
                        ?.value.trim() || "";

                const college =
                    document.getElementById("college")
                        ?.value.trim() || "";

                const age =
                    document.getElementById("age")
                        ?.value || "";

                const idea =
                    document.getElementById("idea")
                        ?.value.trim() || "";

                const teamName =
                    document.getElementById("teamName")
                        ?.value.trim() || "";


                // ==================================================
                // COLLECT PARTICIPANTS
                // ==================================================

                const participants = [];

                for (let i = 1; i <= 5; i++) {

                    const nameInput =
                        document.getElementById(
                            `participant${i}Name`
                        );

                    const phoneInput =
                        document.getElementById(
                            `participant${i}Phone`
                        );


                    const participantName =
                        nameInput?.value.trim() || "";

                    const participantPhone =
                        phoneInput?.value.trim() || "";


                    // Only save actual participants
                    if (
                        participantName ||
                        participantPhone
                    ) {

                        participants.push({
                            name: participantName,
                            phone: participantPhone
                        });

                    }
                }


                // ==================================================
                // DEBUG
                // ==================================================

                console.log(
                    "Team Name:",
                    teamName
                );

                console.log(
                    "Participants:",
                    participants
                );

                console.log(
                    "Participant Count:",
                    participants.length
                );


                // ==================================================
                // PREVENT DUPLICATE REGISTRATION
                // ==================================================

                const existingRegistration =
                    query(
                        collection(
                            db,
                            "registrations"
                        ),
                        where(
                            "uid",
                            "==",
                            user.uid
                        )
                    );


                const snapshot =
                    await getDocs(
                        existingRegistration
                    );


                if (!snapshot.empty) {

                    alert(
                        "You have already registered for Pitch Panchayat."
                    );

                    return;
                }


                // ==================================================
                // GENERATE REGISTRATION ID
                // ==================================================

                const registrationId =
                    await generateRegistrationId();


                console.log(
                    "Generated Registration ID:",
                    registrationId
                );


                // ==================================================
                // SAVE TO FIRESTORE
                // ==================================================

                const registrationData = {

                    // -----------------------------
                    // REGISTRATION
                    // -----------------------------

                    registrationId:
                        registrationId,

                    uid:
                        user.uid,

                    userEmail:
                        user.email || email,


                    // -----------------------------
                    // MAIN PARTICIPANT
                    // -----------------------------

                    fullName:
                        fullName,

                    email:
                        email,

                    phone:
                        phone,

                    college:
                        college,

                    age:
                        age,

                    idea:
                        idea,


                    // -----------------------------
                    // TEAM
                    // -----------------------------

                    teamName:
                        teamName,

                    // NEW / CORRECT FIELD
                    participants:
                        participants,

                    // COMPATIBILITY WITH OLD DASHBOARD
                    teamMembers:
                        participants,


                    // -----------------------------
                    // ATTENDANCE
                    // -----------------------------

                    attendance:
                        false,

                    checkInTime:
                        null,


                    // -----------------------------
                    // TIMESTAMP
                    // -----------------------------

                    registeredAt:
                        new Date()

                };


                console.log(
                    "Saving registration:",
                    registrationData
                );


                await addDoc(
                    collection(
                        db,
                        "registrations"
                    ),
                    registrationData
                );


                console.log(
                    "Registration successfully saved to Firestore."
                );


                // ==================================================
                // SAVE LOCALLY
                // ==================================================

                localStorage.setItem(
                    "registrationId",
                    registrationId
                );

                localStorage.setItem(
                    "registrationEmail",
                    email
                );


                // ==================================================
                // SUCCESS
                // ==================================================

                alert(
                    `Registration Successful!\n\nYour Registration ID is:\n${registrationId}`
                );


                window.location.href =
                    "registration-successful.html";


            }

            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                alert(
                    "Registration Failed!\n\n" +
                    error.message
                );

            }

        }
    );

}


// ======================================================
// AUTO-FILL LOGGED-IN USER
// ======================================================

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) return;


        const emailInput =
            document.getElementById("email");

        const nameInput =
            document.getElementById("fullName");


        if (emailInput) {

            emailInput.value =
                user.email || "";

            emailInput.readOnly =
                true;
        }


        if (
            nameInput &&
            user.displayName
        ) {

            nameInput.value =
                user.displayName;
        }

    }
);

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            console.error("Logout error:", error);

            alert("Unable to logout. Please try again.");

        }

    });

}