import {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    runTransaction
} from "./firebase.js";

console.log("register.js loaded");

const registrationId = await generateRegistrationId();

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

const form = document.getElementById("registrationForm");


form.addEventListener("submit", async (e) => {

    e.preventDefault();
    const user = auth.currentUser;

if (!user) {

    alert("Please login first.");

    window.location.href = "main_site.html";

    return;

}
    console.log("Submit button clicked");


    try {

        const existingRegistration = query(
    collection(db, "registrations"),
    where("uid", "==", user.uid)
);

const snapshot = await getDocs(existingRegistration);

if (!snapshot.empty) {

    alert("You have already registered for Pitch Panchayat.");

    return;

}


    const registrationId =
    await generateRegistrationId();


        await addDoc(collection(db, "registrations"), {

    registrationId: registrationId,

    uid: user.uid,

    userEmail: user.email,

    fullName: document.getElementById("fullName").value,

    email: document.getElementById("email").value,

    phone: document.getElementById("phone").value,

    college: document.getElementById("college").value,

    age: document.getElementById("age").value,

    startup: document.getElementById("startup").value,

    category: document.getElementById("category").value,

    idea: document.getElementById("idea").value,

    attendance: false,

    checkInTime: null,

    registeredAt: new Date()

});

        alert("Registration Successful!");

        localStorage.setItem(
    "registrationId",
    registrationId
);

        window.location.href="registration-successful.html";

    } catch (error) {

        console.error(error);

        alert("Registration Failed!");

    }

});

// =======================================
// Auto-fill Logged-in User Information
// =======================================

import {
    onAuthStateChanged
} from "./firebase.js";

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("fullName");

    if (emailInput) {
        emailInput.value = user.email || "";
        emailInput.readOnly = true;
    }

    if (nameInput && user.displayName) {
        nameInput.value = user.displayName;
    }

});