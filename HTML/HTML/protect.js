import {
    auth,
    onAuthStateChanged,
    signOut
} from "/firebase.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "main_site.html";
        return;

    }

    await user.reload();

    if (!user.emailVerified) {

        alert("Please verify your email first.");

        window.location.href = "main_site.html";

    }

});

import {
    signOut
} from "/firebase.js";

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        await signOut(auth);

        window.location.href = "main_site.html";

    };

}

onAuthStateChanged(auth, async (user) => {

    // Not logged in
    if (!user) {

        alert("Please login first.");

        window.location.href = "main_site.html";

        return;

    }

    // Refresh user information
    await user.reload();

    // Email not verified
    if (!user.emailVerified) {

        alert("Please verify your email before continuing.");

        await signOut(auth);

        window.location.href = "main_site.html";

        return;

    }

    console.log("Verified User:", user.email);

});