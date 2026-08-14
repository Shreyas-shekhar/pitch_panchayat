console.log("admin auth loaded")

import {
    auth,
    signInWithEmailAndPassword,
    db,
    doc,
    getDoc
} from "/firebase.js";

const form = document.getElementById("adminLoginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("Form Submitted");
    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    try {

        console.log("Attempting login...");

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const uid = userCredential.user.uid;

        const adminDoc =
            await getDoc(
                doc(db, "admin", uid)
            );

        if (!adminDoc.exists()) {

            alert("Access Denied.");

            return;

        }

        window.location.href =
            "./dashboard.html";

    }

    catch(error){

        alert(error.message);

    }

    });

 
