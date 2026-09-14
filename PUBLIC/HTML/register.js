import {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    onAuthStateChanged,
    serverTimestamp
} from "./firebase.js";


console.log("REGISTER.JS LOADED");


const form = document.getElementById("registrationForm");

let currentUser = null;


// =====================================
// AUTH CHECK
// =====================================

onAuthStateChanged(auth, (user) => {

    currentUser = user;

    console.log("AUTH USER:", user);

    if (!user) {

        alert("Please login first.");

        window.location.href = "./index.html";

        return;
    }


    // AUTO-FILL EMAIL

    const emailInput = document.getElementById("email");

    if (emailInput) {

        emailInput.value = user.email || "";

        emailInput.readOnly = true;

    }


    // AUTO-FILL NAME

    const nameInput = document.getElementById("fullName");

    if (nameInput && user.displayName) {

        nameInput.value = user.displayName;

    }

});


// =====================================
// FORM SUBMISSION
// =====================================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        const user = auth.currentUser;


        if (!user) {

            alert("Please login first.");

            return;

        }


        const submitButton =
            form.querySelector('button[type="submit"]');


        try {


            // =====================================
            // DISABLE BUTTON
            // =====================================

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerText =
                    "Checking Registration...";

            }


            // =====================================
            // CHECK IF ALREADY REGISTERED
            // =====================================

            console.log(
                "Checking existing registration..."
            );


            const registrationQuery = query(

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


            const registrationSnapshot =
                await getDocs(
                    registrationQuery
                );


            // USER ALREADY REGISTERED

            if (!registrationSnapshot.empty) {

                alert(
                    "You have already registered for Pitch Bazaar!"
                );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerText =
                        "Register Now →";

                }


                return;

            }


            // =====================================
            // SAVE REGISTRATION
            // =====================================

            console.log(
                "Saving registration..."
            );


            if (submitButton) {

                submitButton.innerText =
                    "Saving Registration...";

            }


            const teamMembers = [

                {
                    name:
                        document.getElementById(
                            "participant1Name"
                        )?.value || "",

                    phone:
                        document.getElementById(
                            "participant1Phone"
                        )?.value || ""
                },


                {
                    name:
                        document.getElementById(
                            "participant2Name"
                        )?.value || "",

                    phone:
                        document.getElementById(
                            "participant2Phone"
                        )?.value || ""
                },


                {
                    name:
                        document.getElementById(
                            "participant3Name"
                        )?.value || "",

                    phone:
                        document.getElementById(
                            "participant3Phone"
                        )?.value || ""
                },


                {
                    name:
                        document.getElementById(
                            "participant4Name"
                        )?.value || "",

                    phone:
                        document.getElementById(
                            "participant4Phone"
                        )?.value || ""
                },


                {
                    name:
                        document.getElementById(
                            "participant5Name"
                        )?.value || "",

                    phone:
                        document.getElementById(
                            "participant5Phone"
                        )?.value || ""
                }

            ];


            // =====================================
            // ADD TO FIRESTORE
            // =====================================

            const docRef = await addDoc(

                collection(
                    db,
                    "registrations"
                ),

                {

                    // USER

                    uid:
                        user.uid,


                    userEmail:
                        user.email,


                    // PERSONAL DETAILS

                    fullName:
                        document.getElementById(
                            "fullName"
                        )?.value || "",


                    email:
                        document.getElementById(
                            "email"
                        )?.value || "",


                    phone:
                        document.getElementById(
                            "phone"
                        )?.value || "",


                    college:
                        document.getElementById(
                            "college"
                        )?.value || "",


                    age:
                        document.getElementById(
                            "age"
                        )?.value || "",


                    // STARTUP

                    category:
                        document.getElementById(
                            "category"
                        )?.value || "",


                    idea:
                        document.getElementById(
                            "idea"
                        )?.value || "",


                    teamName:
                        document.getElementById(
                            "teamName"
                        )?.value || "",


                    // TEAM

                    teamMembers:
                        teamMembers,


                    // EVENT

                    attendance:
                        false,


                    checkInTime:
                        null,


                    // DATE

                    registeredAt:
                        serverTimestamp()

                }

            );


            console.log(
                "REGISTRATION SAVED:",
                docRef.id
            );


            // =====================================
            // SAVE LOCAL REGISTRATION ID
            // =====================================

            localStorage.setItem(

                "registrationId",

                docRef.id

            );


            alert(
                "Registration Successful!"
            );


            // =====================================
            // REDIRECT
            // =====================================

            window.location.href =
                "./registration-successful.html";


        }


        catch (error) {


            console.error(
                "REGISTRATION ERROR:",
                error
            );


            alert(
                "Registration Failed!\n\n" +
                error.message
            );


            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerText =
                    "Register Now →";

            }

        }

    });

}