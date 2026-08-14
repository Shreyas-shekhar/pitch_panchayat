import {
    db,
    auth,
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    signOut
} from "./firebase.js";

// ===========================
// HTML Elements
// ===========================

const table = document.getElementById("registrationTable");
const totalRegistrations = document.getElementById("totalRegistrations");
const organizationCount = document.getElementById("organizationCount");
const startupCount = document.getElementById("startupCount");
const checkedIn = document.getElementById("checkedIn");
const pending = document.getElementById("pending");

const searchInput = document.getElementById("searchInput");

const popup = document.getElementById("popup");
const popupDescription = document.getElementById("popupDescription");
const closePopup = document.getElementById("closePopup");

// ===========================

let registrations = [];

// ===========================
// Firebase Listener
// ===========================

const registrationRef = collection(db, "registrations");

onSnapshot(registrationRef, (snapshot) => {

    registrations = [];

    snapshot.forEach((documentSnapshot) => {

        registrations.push({

            id: documentSnapshot.id,

            ...documentSnapshot.data()

        });

    });

    renderTable(registrations);

});

// ===========================
// Render Table
// ===========================

function renderTable(data){

    function attachEvents() {

    document.querySelectorAll(".view-btn").forEach(button => {

        button.onclick = () => {

            popup.classList.remove("hidden");

            popupDescription.innerText =
                button.dataset.description;

        };

    });

}

    table.innerHTML = "";

    const organizations = new Set();

    const startups = new Set();

    let checkedInCount = 0;

    data.forEach(student=>{

        organizations.add(student.organization);

        startups.add(student.startup);

        if(student.attendance){

    checkedInCount++;

}

        table.innerHTML += `

<tr>

<td>${student.fullName}</td>

<td>${student.email}</td>

<td>${student.phone}</td>

<td>${student.college}</td>

<td>${student.startup}</td>

<td>${student.age}</td>

<td>${student.idea}</td>

<td>${student.category}</td>

<td>

<button
class="view-btn"
data-description="${student.idea}">

View

</button>

</td>

<td>

<button
class="delete-btn"
data-id="${student.id}">

Delete

</button>

</td>

</tr>

`;

    });

    totalRegistrations.innerText = data.length;

    organizationCount.innerText = organizations.size;

    startupCount.innerText = startups.size;

    checkedIn.innerText = checkedInCount;

    pending.innerText = data.length - checkedInCount;

    attachEvents();

}

// ===========================
// Search
// ===========================

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase().trim();

    const filtered = registrations.filter(student =>

        (student.fullName || "").toLowerCase().includes(keyword) ||

        (student.college || "").toLowerCase().includes(keyword) ||

        (student.startup || "").toLowerCase().includes(keyword) ||

        (student.email || "").toLowerCase().includes(keyword) ||

        (student.phone || "").toLowerCase().includes(keyword) ||

        (student.category || "").toLowerCase().includes(keyword) ||

        (student.age || "").toLowerCase().includes(keyword) ||

        (student.idea || "").toLowerCase().includes(keyword)

    );

    renderTable(filtered);

});

// ===========================
// View Popup + Delete
// ===========================

function attachEvents() {

    // View Description

    document.querySelectorAll(".view-btn").forEach(button => {

        button.onclick = () => {

            popup.classList.remove("hidden");

            popupDescription.innerText =
                button.dataset.description || "No description available.";

        };

    });

    // Delete Registration

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.onclick = async () => {

            const confirmDelete = confirm(
                "Are you sure you want to delete this registration?"
            );

            if (!confirmDelete) return;

            try {

                await deleteDoc(

                    doc(
                        db,
                        "registrations",
                        button.dataset.id
                    )

                );

                alert("Registration deleted successfully.");

            }

            catch (error) {

                console.error(error);

                alert("Unable to delete registration.");

            }

        };

    });

}

// ===========================
// Close Popup
// ===========================

if (closePopup) {

    closePopup.onclick = () => {

        popup.classList.add("hidden");

    };

}

window.onclick = (event) => {

    if (event.target === popup) {

        popup.classList.add("hidden");

    }

};

// ===========================
// Export CSV
// ===========================

const exportBtn = document.getElementById("exportBtn");

if (exportBtn) {

    exportBtn.onclick = () => {

        let csv =
            "Full Name,Email,Mobile,Organization,Startup,age group,idea,category\n";

        registrations.forEach(student => {

            csv += `"${student.fullName}","${student.email}","${student.phone}","${student.college}","${student.startup}","${student.age}","${student.idea}","${student.category}"\n`;

        });

        const blob = new Blob([csv], {

            type: "text/csv"

        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "Pitch_Panchayat_Registrations.csv";

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    };

}

console.log("✅ Dashboard Connected Successfully.");

closePopup.onclick = () => {

    popup.classList.add("hidden");

};

window.onclick = (e) => {

    if (e.target === popup) {

        popup.classList.add("hidden");

    }

};

const dashboardSection = document.getElementById("dashboardSection");
const participantsSection = document.getElementById("participantsSection");

document.getElementById("navDashboard").addEventListener("click", function(e){

    e.preventDefault();

    dashboardSection.scrollIntoView({
        behavior:"smooth"
    });

});

document.getElementById("navParticipants").addEventListener("click", function(e){

    e.preventDefault();

    participantsSection.scrollIntoView({
        behavior:"smooth"
    });

});

document.getElementById("navStartups").addEventListener("click", function(e){

    e.preventDefault();

    searchInput.value="";

    renderTable(

        registrations.filter(student=>student.startup)

    );

});

document.getElementById("navOrganizations").addEventListener("click", function(e){

    e.preventDefault();

    searchInput.value="";

    renderTable(

        registrations.filter(student=>student.college)

    );

});

document.getElementById("navSettings").addEventListener("click", function(e){

    e.preventDefault();

    alert("Settings page coming soon.");

});

// ==========================================
// Admin Logout
// ==========================================

const logoutBtn = document.getElementById("navLogout");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        try {

            await signOut(auth);

            window.location.href = "main_site.html";

        } catch (error) {

            console.error(error);

            alert("Logout failed.");

        }

    });

}

// ==========================================
// Logout
// ==========================================

// const logoutBtn = document.getElementById("navLogout");

logoutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        window.location.href = "main_site.html";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

});