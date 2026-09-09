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


// =======================================
// Generate Registration ID
// =======================================

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
                    "Registration counter not found."
                );

            }

            const current =
                counterDoc.data().current;

            const next = current + 1;


            transaction.update(counterRef, {

                current: next

            });


            return `PP2026-${String(next).padStart(4, "0")}`;

        }
    );

    return registrationId;

}


// =======================================
// Registration Form
// =======================================

const form =
    document.getElementById("registrationForm");


form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const user = auth.currentUser;


    if (!user) {

        alert("Please login first.");

        window.location.href =
            "main_site.html";

        return;

    }


    console.log(
        "Submit button clicked"
    );


    try {


        // =======================================
        // Check Existing Registration
        // =======================================

        const existingRegistration = query(

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


        // =======================================
        // Generate Registration ID
        // =======================================

        const registrationId =
            await generateRegistrationId();


        // =======================================
        // Team Information
        // =======================================

        const teamMembers = [

            {

                name:
                    document.getElementById(
                        "participant1Name"
                    ).value,

                phone:
                    document.getElementById(
                        "participant1Phone"
                    ).value

            },


            {

                name:
                    document.getElementById(
                        "participant2Name"
                    ).value,

                phone:
                    document.getElementById(
                        "participant2Phone"
                    ).value

            },


            {

                name:
                    document.getElementById(
                        "participant3Name"
                    ).value,

                phone:
                    document.getElementById(
                        "participant3Phone"
                    ).value

            },


            {

                name:
                    document.getElementById(
                        "participant4Name"
                    ).value,

                phone:
                    document.getElementById(
                        "participant4Phone"
                    ).value

            },


            {

                name:
                    document.getElementById(
                        "participant5Name"
                    ).value,

                phone:
                    document.getElementById(
                        "participant5Phone"
                    ).value

            }

        ];


        // =======================================
        // Save Registration
        // =======================================

        await addDoc(
            collection(
                db,
                "registrations"
            ),

            {

                // Registration Information

                registrationId:
                    registrationId,


                uid:
                    user.uid,


                userEmail:
                    user.email,


                // Personal Information

                fullName:
                    document.getElementById(
                        "fullName"
                    ).value,


                email:
                    document.getElementById(
                        "email"
                    ).value,


                phone:
                    document.getElementById(
                        "phone"
                    ).value,


                college:
                    document.getElementById(
                        "college"
                    ).value,


                age:
                    document.getElementById(
                        "age"
                    ).value,


                // Startup Information

                category:
                    document.getElementById(
                        "category"
                    ).value,


                idea:
                    document.getElementById(
                        "idea"
                    ).value,


                // Team Information

                teamName:
                    document.getElementById(
                        "teamName"
                    ).value,


                teamMembers:
                    teamMembers,


                // Event Information

                attendance:
                    false,


                checkInTime:
                    null,


                // Registration Date

                registeredAt:
                    new Date()

            }

        );


        // =======================================
        // Save Registration ID Locally
        // =======================================

        localStorage.setItem(

            "registrationId",

            registrationId

        );


        alert(
            "Registration Successful!"
        );


        // =======================================
        // Redirect
        // =======================================

        window.location.href =
            "registration-successful.html";


    } catch (error) {


        console.error(error);


        alert(
            "Registration Failed! Please try again."
        );

    }

});


// =======================================
// Auto-fill Logged-in User Information
// =======================================

onAuthStateChanged(auth, (user) => {


    if (!user) {

        return;

    }


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

});