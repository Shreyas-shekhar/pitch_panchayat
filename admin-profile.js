import {
    auth,
    db,
    doc,
    getDoc,
    onAuthStateChanged
} from "./firebase.js";

onAuthStateChanged(auth, async(user)=>{

    if(!user) return;

    const adminDoc =
        await getDoc(
            doc(db,"admin",user.uid)
        );

    if(!adminDoc.exists()) return;

    const admin =
        adminDoc.data();

    document.getElementById("adminName").innerText =
        admin.name;

    document.getElementById("adminRole").innerText =
        admin.role;

});