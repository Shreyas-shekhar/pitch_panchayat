import {

    auth,

    googleProvider,

    signInWithPopup,

    createUserWithEmailAndPassword,

    sendEmailVerification,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,
    
    signOut

} from "/firebase.js";

console.log("AUTH.JS LOADED");



const authOverlay = document.getElementById("authOverlay");

const openRegister = document.getElementById("openRegister");

const openAuth = document.getElementById("openAuth");

const closeAuth = document.getElementById("closeAuth");

const googleButton = document.getElementById("googleSignIn");

const signupForm = document.getElementById("signupForm");

const loginForm = document.getElementById("loginForm");

const showLogin = document.getElementById("showLogin");

const showSignup = document.getElementById("showSignup");



function openPopup() {

    authOverlay.hidden = false;

    document.body.style.overflow = "hidden";
}



function closePopup() {

    authOverlay.hidden = true;

    document.body.style.overflow = "";
}



if(openRegister){

    openRegister.onclick = (e)=>{

        e.preventDefault();

        openPopup();

    };

}

if(openAuth){

    openAuth.onclick = (e)=>{

        e.preventDefault();

        openPopup();

    };

}

if(closeAuth){

    closeAuth.onclick = ()=>{

        closePopup();

    };

}



window.addEventListener("click",(event)=>{

    if(event.target===authOverlay){

        closePopup();

    }

});


showLogin.onclick = () => {

    signupForm.classList.add("auth-form-hidden");
    loginForm.classList.remove("auth-form-hidden");

};

showSignup.onclick = () => {

    loginForm.classList.add("auth-form-hidden");
    signupForm.classList.remove("auth-form-hidden");

};

const forgotPassword=document.getElementById("forgotPassword");

forgotPassword.onclick = async()=>{

    const email=document
        .getElementById("loginEmail")
        .value
        .trim();

    if(!email){

        alert("Enter your email first.");

        return;

    }

    try{

        await sendPasswordResetEmail(auth,email);

        alert("Password reset email sent.");

    }

    catch(error){

        alert(error.message);

    }

};

googleButton.onclick = async()=>{

    try{

        const result = await signInWithPopup(

            auth,

            googleProvider

        );

        const user = result.user;

        alert(

            "Welcome " +

            user.displayName

        );

        window.location.href =

        "registration-panel.html";

    }

    catch(error){

        console.error(error);

        alert(

            error.message

        );

    }

};

console.log(

"Authentication Part 1 Loaded."

);

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("SIGNUP SUBMITTED");


    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    console.log("Email:", email);


    /* PASSWORD CHECK */

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;
    }


    /* CREATE ACCOUNT */

    try {

        console.log("Creating Firebase account...");


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        console.log(
            "ACCOUNT CREATED:",
            user.uid
        );


        /* SEND VERIFICATION EMAIL */

        console.log("Sending verification email...");


        await sendEmailVerification(user);


        console.log(
            "VERIFICATION EMAIL SENT"
        );


        alert(
            "Account created successfully!\n\n" +
            "A verification email has been sent to:\n" +
            email +
            "\n\n" +
            "Please verify your email and then login."
        );


        /* SIGN OUT */

        console.log("Signing out...");

        await signOut(auth);


        console.log(
            "SIGNED OUT"
        );


        /* CLEAR FORM */

        signupForm.reset();


        /* SWITCH TO LOGIN */

        signupForm.classList.add("auth-form-hidden");

        loginForm.classList.remove("auth-form-hidden");


        console.log(
            "Switched to login form."
        );


    }

    catch (error) {

        console.error(
            "SIGNUP ERROR:",
            error
        );


        switch (error.code) {

            case "auth/email-already-in-use":

                alert(
                    "An account already exists with this email."
                );

                break;


            case "auth/invalid-email":

                alert(
                    "Please enter a valid email address."
                );

                break;


            case "auth/weak-password":

                alert(
                    "Password is too weak."
                );

                break;


            default:

                alert(
                    "Account creation failed:\n\n" +
                    error.message
                );

        }

    }

});

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try{

        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        await userCredential.user.reload();

        if(!userCredential.user.emailVerified){

            alert("Please verify your email first.");

            await signOut(auth);

            return;

        }

        alert("Login Successful!");

        window.location.href="registration-panel.html";

    }

    catch(error){

        alert(error.message);
        console.error(error);

    }

});

// const authOverlay = document.getElementById("authOverlay");
// const closeAuth = document.getElementById("closeAuth");

// closeAuth.addEventListener("click", () => {

//     authOverlay.classList.add("hidden");

//     document.body.style.overflow = "auto";

// });

// const openRegister = document.getElementById("openRegister");

// openRegister.addEventListener("click", (e) => {

//     e.preventDefault();

//     authOverlay.classList.remove("hidden");

//     document.body.style.overflow = "hidden";

// });





// window.addEventListener("load", () => {
//     authOverlay.classList.add("hidden");
//     document.body.style.overflow = "auto";
// });