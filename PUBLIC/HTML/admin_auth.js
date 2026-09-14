console.log("STEP 1: ADMIN_AUTH.JS FILE LOADED");

import {
    auth,
    signInWithEmailAndPassword
} from "./firebase.js";


console.log("STEP 2: FIREBASE IMPORT SUCCESSFUL");


const form = document.getElementById("adminLoginForm");

const errorText = document.getElementById("error");


console.log("STEP 3: FORM =", form);


if (!form) {

    console.error(
        "ERROR: adminLoginForm NOT FOUND"
    );

}


form.addEventListener("submit", async (e) => {

    e.preventDefault();


    console.log(
        "STEP 4: LOGIN BUTTON CLICKED"
    );


    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    console.log(
        "STEP 5: EMAIL =",
        email
    );


    try {


        console.log(
            "STEP 6: ATTEMPTING FIREBASE LOGIN"
        );


        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "STEP 7: LOGIN SUCCESS"
        );


        console.log(
            userCredential.user
        );


        alert(
            "Firebase Login Successful!"
        );


        window.location.href =
            "./dashboard.html";


    }


    catch (error) {


        console.error(
            "LOGIN ERROR:",
            error
        );


        alert(
            error.code +
            "\n\n" +
            error.message
        );


        if (errorText) {

            errorText.textContent =
                error.message;

        }

    }

});