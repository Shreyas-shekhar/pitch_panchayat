import {
    auth,
    onAuthStateChanged,
    db,
    doc,
    getDoc
} from "./firebase.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "main_site.html";

        return;

    }

    const adminDoc = await getDoc(
            doc(db, "admin", user.uid)
        );
    
    if (!adminDoc.exists()) {

        alert("Access Denied.");

        window.location.href =
            "main_site.html";

        return;

    }
});