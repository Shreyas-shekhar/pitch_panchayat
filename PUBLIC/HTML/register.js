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

    const registrationId = await runTransaction(
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

    return registrationId;
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
                // COLLECT FORM DATA FIRST
                // ==================================================

                const fullName =
                    document.getElementById(
                        "fullName"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "email"
                    ).value.trim();


                const phone =
                    document.getElementById(
                        "phone"
                    ).value.trim();


                const college =
                    document.getElementById(
                        "college"
                    ).value.trim();


                const age =
                    document.getElementById(
                        "age"
                    ).value;


                const idea =
                    document.getElementById(
                        "idea"
                    ).value.trim();


                const teamName =
                    document.getElementById(
                        "teamName"
                    ).value.trim();


                // ==================================================
                // PARTICIPANTS
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


                    participants.push({

                        name:
                            nameInput
                                ? nameInput.value.trim()
                                : "",

                        phone:
                            phoneInput
                                ? phoneInput.value.trim()
                                : ""

                    });

                }


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
                // GENERATE PP ID
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

                await addDoc(
                    collection(
                        db,
                        "registrations"
                    ),
                    {

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

                        participants:
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

                    }
                );


                // ==================================================
                // SAVE ID LOCALLY
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
            document.getElementById(
                "email"
            );


        const nameInput =
            document.getElementById(
                "fullName"
            );


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