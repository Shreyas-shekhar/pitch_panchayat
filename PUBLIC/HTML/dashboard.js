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
// HTML ELEMENTS
// ===========================

const table = document.getElementById("registrationTable");

const totalRegistrations =
    document.getElementById("totalRegistrations");

const organizationCount =
    document.getElementById("organizationCount");

const startupCount =
    document.getElementById("startupCount");

const checkedIn =
    document.getElementById("checkedIn");

const pending =
    document.getElementById("pending");

const searchInput =
    document.getElementById("searchInput");

const popup =
    document.getElementById("popup");

const popupDescription =
    document.getElementById("popupDescription");

const closePopup =
    document.getElementById("closePopup");

let registrations = [];


// ===========================
// FIREBASE REGISTRATION LISTENER
// ===========================

const registrationRef =
    collection(db, "registrations");


onSnapshot(
    registrationRef,

    (snapshot) => {

        console.log(
            "Registrations received:",
            snapshot.size
        );

        registrations = [];


        snapshot.forEach((documentSnapshot) => {

            registrations.push({

                id: documentSnapshot.id,

                ...documentSnapshot.data()

            });

        });


        renderTable(registrations);

    },

    (error) => {

        console.error(
            "Firebase loading error:",
            error
        );

        alert(
            "Unable to load registrations: " +
            error.message
        );

    }

);


// ===========================
// RENDER TABLE
// ===========================

function renderTable(data) {

    if (!table) {

        console.error(
            "registrationTable not found in HTML"
        );

        return;

    }


    table.innerHTML = "";


    const organizations = new Set();

    const teams = new Set();

    let checkedInCount = 0;


    data.forEach((student) => {


        // Statistics

        if (student.college) {

            organizations.add(
                student.college
            );

        }


        if (student.teamName) {

            teams.add(
                student.teamName
            );

        }


        if (student.attendance === true) {

            checkedInCount++;

        }


        // Team Members

        const teamMembers =
            student.participants || [];


        // Create Table Row

        table.innerHTML += `

        <tr>

            <td>
                ${student.registrationId || "N/A"}
            </td>

            <td>
                ${student.fullName || "N/A"}
            </td>

            <td>
                ${student.email || "N/A"}
            </td>

            <td>
                ${student.phone || "N/A"}
            </td>

            <td>
                ${student.college || "N/A"}
            </td>

            <td>
                ${student.age || "N/A"}
            </td>

            <td>
                ${student.category || "N/A"}
            </td>

            <td>
                ${student.teamName || student.startup || "N/A"}
            </td>

            <td>
                ${teamMembers.length || 5}
            </td>

            <td>

                <button
                    class="view-btn"
                    data-id="${student.id}"
                >
                    View
                </button>

            </td>

            <td>

                <button
                    class="delete-btn"
                    data-id="${student.id}"
                >
                    Delete
                </button>

            </td>

        </tr>

        `;

    });


    // Update Statistics

    if (totalRegistrations) {

        totalRegistrations.innerText =
            data.length;

    }


    if (organizationCount) {

        organizationCount.innerText =
            organizations.size;

    }


    if (startupCount) {

        startupCount.innerText =
            teams.size;

    }


    if (checkedIn) {

        checkedIn.innerText =
            checkedInCount;

    }


    if (pending) {

        pending.innerText =
            data.length - checkedInCount;

    }


    attachEvents();

}


// ===========================
// BUTTON EVENTS
// ===========================

function attachEvents() {


    // VIEW BUTTON

    document
        .querySelectorAll(".view-btn")
        .forEach((button) => {


            button.addEventListener(
                "click",

                () => {

                    const student =
                        registrations.find(

                            (item) =>
                                item.id ===
                                button.dataset.id

                        );


                    if (!student) {

                        alert(
                            "Registration not found."
                        );

                        return;

                    }


                    showRegistrationDetails(
                        student
                    );

                }

            );

        });


    // DELETE BUTTON

    document
        .querySelectorAll(".delete-btn")
        .forEach((button) => {


            button.addEventListener(
                "click",

                async () => {


                    const registrationDocId =
                        button.dataset.id;


                    if (!registrationDocId) {

                        alert(
                            "Registration ID not found."
                        );

                        return;

                    }


                    const confirmDelete =
                        confirm(

                            "Are you sure you want to permanently delete this registration?"

                        );


                    if (!confirmDelete) {

                        return;

                    }


                    try {


                        console.log(

                            "Deleting:",

                            registrationDocId

                        );


                        await deleteDoc(

                            doc(

                                db,

                                "registrations",

                                registrationDocId

                            )

                        );


                        alert(

                            "Registration deleted successfully."

                        );


                    }

                    catch (error) {


                        console.error(

                            "Delete Error:",

                            error

                        );


                        alert(

                            "Unable to delete registration: " +

                            error.message

                        );


                    }


                }

            );


        });


}


// ===========================
// SHOW REGISTRATION DETAILS
// ===========================

function showRegistrationDetails(student) {


    if (!popup) {

        alert(
            "Popup element not found."
        );

        return;

    }


    popup.classList.remove(
        "hidden"
    );


    const members =
        student.participants || [];


    let teamHTML = "";


    members.forEach(
        (member, index) => {

            teamHTML += `

                <div class="popup-team-member">

                    <h4>
                        Participant ${index + 1}
                    </h4>

                    <p>
                        <strong>Name:</strong>
                        ${member.name || "N/A"}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${member.phone || "N/A"}
                    </p>

                </div>

            `;

        }
    );


    if (teamHTML === "") {

        teamHTML = `

            <p>
                No team information available.
            </p>

        `;

    }


    if (popupDescription) {

        popupDescription.innerHTML = `

            <h2>
                Registration Details
            </h2>


            <hr>


            <p>
                <strong>Registration ID:</strong>
                ${student.registrationId || "N/A"}
            </p>


            <p>
                <strong>Full Name:</strong>
                ${student.fullName || "N/A"}
            </p>


            <p>
                <strong>Email:</strong>
                ${student.email || "N/A"}
            </p>


            <p>
                <strong>Phone:</strong>
                ${student.phone || "N/A"}
            </p>


            <p>
                <strong>College:</strong>
                ${student.college || "N/A"}
            </p>


            <p>
                <strong>Age:</strong>
                ${student.age || "N/A"}
            </p>


            <p>
                <strong>Category:</strong>
                ${student.category || "N/A"}
            </p>


            <hr>


            <h3>
                Startup Idea
            </h3>


            <p>
                ${student.idea || "No idea provided."}
            </p>


            <hr>


            <h3>
                Team Information
            </h3>


            <p>
                <strong>Team Name:</strong>
                ${student.teamName || "N/A"}
            </p>


            ${teamHTML}


            <hr>


            <p>
                <strong>Attendance:</strong>

                ${

                    student.attendance

                    ? "Checked In"

                    : "Pending"

                }

            </p>

        `;

    }

}


// ===========================
// SEARCH
// ===========================

if (searchInput) {

    searchInput.addEventListener(
        "input",

        () => {


            const keyword =

                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                registrations.filter(
                    (student) => {


                        const members =
                            student.participants || [];


                        const teamMatch =
                            members.some(
                                (member) =>

                                    (
                                        member.name || ""
                                    )
                                        .toLowerCase()
                                        .includes(keyword)

                                    ||

                                    (
                                        member.phone || ""
                                    )
                                        .includes(keyword)

                            );


                        return (

                            (
                                student.registrationId || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.fullName || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.email || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.phone || ""
                            )
                                .includes(keyword)

                            ||

                            (
                                student.college || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.teamName || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.startup || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            (
                                student.category || ""
                            )
                                .toLowerCase()
                                .includes(keyword)

                            ||

                            teamMatch

                        );

                    }

                );


            renderTable(filtered);


        }

    );

}


// ===========================
// CLOSE POPUP
// ===========================

if (closePopup) {

    closePopup.addEventListener(
        "click",

        () => {

            popup.classList.add(
                "hidden"
            );

        }

    );

}


window.addEventListener(
    "click",

    (event) => {

        if (
            popup &&
            event.target === popup
        ) {

            popup.classList.add(
                "hidden"
            );

        }

    }

);


// ===========================
// NAVIGATION
// ===========================

const dashboardSection =
    document.getElementById(
        "dashboardSection"
    );

const participantsSection =
    document.getElementById(
        "participantsSection"
    );


const navDashboard =
    document.getElementById(
        "navDashboard"
    );


if (navDashboard) {

    navDashboard.addEventListener(
        "click",

        (e) => {

            e.preventDefault();

            dashboardSection?.scrollIntoView({

                behavior: "smooth"

            });

        }

    );

}


const navParticipants =
    document.getElementById(
        "navParticipants"
    );


if (navParticipants) {

    navParticipants.addEventListener(
        "click",

        (e) => {

            e.preventDefault();

            participantsSection?.scrollIntoView({

                behavior: "smooth"

            });

        }

    );

}


// ===========================
// LOGOUT
// ===========================

const logoutBtn =
    document.getElementById(
        "navLogout"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",

        async (e) => {

            e.preventDefault();


            if (

                !confirm(
                    "Are you sure you want to logout?"
                )

            ) {

                return;

            }


            try {

                await signOut(auth);

                window.location.href =
                    "main_site.html";

            }

            catch (error) {

                console.error(error);

                alert(
                    "Logout failed: " +
                    error.message
                );

            }

        }

    );

}


console.log(
    "Dashboard JS loaded successfully."
);