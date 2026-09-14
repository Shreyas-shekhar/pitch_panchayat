import {
    auth,
    googleProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "./firebase.js";


console.log("AUTH.JS LOADED");


// ==========================================
// GET ELEMENTS
// ==========================================

const authOverlay = document.getElementById("authOverlay");

const openRegister = document.getElementById("openRegister");
const openAuth = document.getElementById("openAuth");

const closeAuth = document.getElementById("closeAuth");

const googleButton = document.getElementById("googleSignIn");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

const forgotPassword = document.getElementById("forgotPassword");


// ==========================================
// OPEN POPUP
// ==========================================

function openPopup() {

    if (!authOverlay) return;

    authOverlay.hidden = false;

    document.body.style.overflow = "hidden";

}


// ==========================================
// CLOSE POPUP
// ==========================================

function closePopup() {

    if (!authOverlay) return;

    authOverlay.hidden = true;

    document.body.style.overflow = "";

}


// ==========================================
// OPEN REGISTER BUTTON
// ==========================================

if (openRegister) {

    openRegister.addEventListener("click", (e) => {

        e.preventDefault();

        openPopup();

    });

}


// ==========================================
// OPEN AUTH BUTTON
// ==========================================

if (openAuth) {

    openAuth.addEventListener("click", (e) => {

        e.preventDefault();

        openPopup();

    });

}


// ==========================================
// CLOSE BUTTON
// ==========================================

if (closeAuth) {

    closeAuth.addEventListener("click", () => {

        closePopup();

    });

}


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

if (authOverlay) {

    authOverlay.addEventListener("click", (event) => {

        if (event.target === authOverlay) {

            closePopup();

        }

    });

}


// ==========================================
// SWITCH TO LOGIN
// ==========================================

if (showLogin) {

    showLogin.addEventListener("click", () => {

        if (signupForm) {

            signupForm.classList.add(
                "auth-form-hidden"
            );

        }

        if (loginForm) {

            loginForm.classList.remove(
                "auth-form-hidden"
            );

        }

    });

}


// ==========================================
// SWITCH TO SIGNUP
// ==========================================

if (showSignup) {

    showSignup.addEventListener("click", () => {

        if (loginForm) {

            loginForm.classList.add(
                "auth-form-hidden"
            );

        }

        if (signupForm) {

            signupForm.classList.remove(
                "auth-form-hidden"
            );

        }

    });

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async () => {

            const loginEmail =
                document.getElementById(
                    "loginEmail"
                );

            if (!loginEmail) {

                alert(
                    "Email field not found."
                );

                return;

            }


            const email =
                loginEmail.value.trim();


            if (!email) {

                alert(
                    "Enter your email first."
                );

                return;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                alert(
                    "Password reset email sent."
                );

            }

            catch (error) {

                console.error(error);

                alert(
                    error.message
                );

            }

        }
    );

}


// ==========================================
// GOOGLE SIGN IN
// ==========================================

if (googleButton) {

    googleButton.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();

            try {

                const result =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );


                const user =
                    result.user;


                console.log(
                    "Google Login:",
                    user
                );


                window.location.href =
                    "registration-panel.html";

            }

            catch (error) {

                console.error(
                    "GOOGLE LOGIN ERROR:",
                    error
                );


                alert(
                    "Google Sign-In Failed:\n\n" +
                    error.message
                );

            }

        }
    );

}


// ==========================================
// SIGN UP
// ==========================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            console.log(
                "SIGNUP SUBMITTED"
            );


            const emailInput =
                document.getElementById(
                    "signupEmail"
                );


            const passwordInput =
                document.getElementById(
                    "signupPassword"
                );


            const confirmPasswordInput =
                document.getElementById(
                    "confirmPassword"
                );


            if (
                !emailInput ||
                !passwordInput ||
                !confirmPasswordInput
            ) {

                alert(
                    "Signup form fields not found."
                );

                return;

            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;


            // PASSWORD CHECK

            if (
                password !== confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            try {

                console.log(
                    "Creating account..."
                );


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "ACCOUNT CREATED:",
                    user.uid
                );


                // SEND VERIFICATION EMAIL

                await sendEmailVerification(
                    user
                );


                alert(

                    "Account created successfully!\n\n" +

                    "A verification email has been sent to:\n" +

                    email +

                    "\n\nPlease verify your email and then login."

                );


                // SIGN OUT

                await signOut(auth);


                // RESET FORM

                signupForm.reset();


                // SHOW LOGIN FORM

                signupForm.classList.add(
                    "auth-form-hidden"
                );


                if (loginForm) {

                    loginForm.classList.remove(
                        "auth-form-hidden"
                    );

                }


            }

            catch (error) {

                console.error(
                    "SIGNUP ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    alert(
                        "An account already exists with this email."
                    );

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    alert(
                        "Password is too weak."
                    );

                }

                else {

                    alert(
                        "Account creation failed:\n\n" +
                        error.message
                    );

                }

            }

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                alert(
                    "Login form fields not found."
                );

                return;

            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                // REFRESH USER DATA

                await user.reload();


                if (
                    !user.emailVerified
                ) {

                    alert(
                        "Please verify your email first."
                    );


                    await signOut(auth);

                    return;

                }


                console.log(
                    "LOGIN SUCCESS:",
                    user.uid
                );


                window.location.href =
                    "registration-panel.html";


            }

            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                alert(
                    "Login Failed:\n\n" +
                    error.message
                );

            }

        }
    );

}


console.log(
    "AUTH.JS FULLY LOADED"
);