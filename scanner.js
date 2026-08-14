import {
    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from "./firebase.js";

const scanBtn = document.getElementById("scanBtn");
const reader = document.getElementById("reader");

scanBtn.onclick = () => {

    reader.style.display = "block";

    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        // async (decodedText) => {

        //     html5QrCode.stop();

        //     const data = JSON.parse(decodedText);

        //     const registrationId = data.registrationId;

        //     console.log(registrationId);

        //     // Firestore code comes next
        // }

        async (decodedText) => {

    await html5QrCode.stop();

   const data = JSON.parse(decodedText);

const registrationId = data.registrationId;

    console.log("Scanned Registration ID:", registrationId);

    const q = query(

        collection(db, "registrations"),

        where("registrationId", "==", registrationId)

    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

        alert("Participant not found.");

        return;

    }

   snapshot.forEach((participant) => {

    const data = participant.data();

    document.getElementById("participantInfo").innerHTML = `
        <div class="participant-card">

            <h2>${data.fullName}</h2>

            <p><b>Registration ID:</b> ${data.registrationId}</p>

            <p><b>College:</b> ${data.college}</p>

            <p><b>Category:</b> ${data.category}</p>

            <p><b>Startup:</b> ${data.startup}</p>

            <p><b>Status:</b>
    ${
        data.attendance
        ? "🟢 Checked In"
        : "🔴 Not Checked In"
    }
</p>

${
    data.attendance
    ? `<p><b>Checked In At:</b>
        ${
            data.checkInTime
            ? data.checkInTime.toDate().toLocaleString()
            : "Unknown"
        }
       </p>`
    : `<button id="attendanceBtn">
            ✅ Mark Attendance
       </button>`
}

        </div>
    `;

   const attendanceBtn = document.getElementById("attendanceBtn");

if (attendanceBtn) {

    attendanceBtn.onclick = async () => {

        await updateDoc(participant.ref, {

            attendance: true,
            checkInTime: serverTimestamp()

        });

        alert("Attendance Marked Successfully!");

        location.reload();

    };

}

})},)};