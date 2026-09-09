import {
    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const scanBtn =
    document.getElementById("scanBtn");

const reader =
    document.getElementById("reader");

const cameraSelect =
    document.getElementById("cameraSelect");

const participantInfo =
    document.getElementById("participantInfo");


// ==========================================
// SCANNER VARIABLES
// ==========================================

let html5QrCode = null;

let cameras = [];

let isScanning = false;

let currentCameraId = null;


// ==========================================
// LOAD AVAILABLE CAMERAS
// ==========================================

async function loadCameras() {

    try {

        cameras =
            await Html5Qrcode.getCameras();


        console.log(
            "Available cameras:",
            cameras
        );


        if (!cameras || cameras.length === 0) {

            alert(
                "No camera found on this device."
            );

            return;

        }


        // Clear old cameras

        cameraSelect.innerHTML = "";


        // Add all available cameras

        cameras.forEach(

            (camera, index) => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    camera.id;


                // Better camera naming

                let cameraName =
                    camera.label ||
                    `Camera ${index + 1}`;


                option.textContent =
                    cameraName;


                cameraSelect.appendChild(
                    option
                );


            }

        );


        // ==================================
        // Choose Rear Camera Automatically
        // ==================================

        const rearCamera =
            cameras.find(

                (camera) =>

                    camera.label
                        .toLowerCase()
                        .includes("back")

                    ||

                    camera.label
                        .toLowerCase()
                        .includes("rear")

                    ||

                    camera.label
                        .toLowerCase()
                        .includes("environment")

            );


        currentCameraId =
            rearCamera

                ? rearCamera.id

                : cameras[0].id;


        cameraSelect.value =
            currentCameraId;


    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        alert(
            "Unable to access cameras. Please allow camera permission."
        );

    }

}


// ==========================================
// START SCANNER
// ==========================================

async function startScanner(cameraId) {

    try {


        // Stop existing scanner first

        if (
            html5QrCode &&
            isScanning
        ) {

            await html5QrCode.stop();

            isScanning = false;

        }


        reader.style.display =
            "block";


        // Create scanner once

        if (!html5QrCode) {

            html5QrCode =
                new Html5Qrcode(
                    "reader"
                );

        }


        currentCameraId =
            cameraId;


        console.log(
            "Starting camera:",
            currentCameraId
        );


        await html5QrCode.start(

            currentCameraId,

            {

                fps: 10,

                qrbox: {

                    width: 250,

                    height: 250

                },

                aspectRatio: 1.7778

            },


            // ==================================
            // QR SUCCESS
            // ==================================

            async (decodedText) => {


                if (!isScanning) {

                    return;

                }


                console.log(
                    "QR Scanned:",
                    decodedText
                );


                // Prevent multiple scans

                isScanning =
                    false;


                try {


                    await html5QrCode.stop();


                    // Parse QR

                    const qrData =
                        JSON.parse(
                            decodedText
                        );


                    const registrationId =
                        qrData.registrationId;


                    if (!registrationId) {

                        throw new Error(
                            "Invalid QR Code."
                        );

                    }


                    console.log(
                        "Registration ID:",
                        registrationId
                    );


                    await loadParticipant(
                        registrationId
                    );


                }

                catch (error) {


                    console.error(
                        "QR Error:",
                        error
                    );


                    alert(
                        "Invalid QR Code."
                    );


                }


            },


            // QR Failure

            () => {

                // Do nothing
                // This runs continuously
                // while searching for QR

            }

        );


        isScanning =
            true;


    }

    catch (error) {


        console.error(
            "Scanner Start Error:",
            error
        );


        alert(
            "Unable to start camera: " +
            error.message
        );


    }

}


// ==========================================
// STOP SCANNER
// ==========================================

async function stopScanner() {

    try {


        if (

            html5QrCode &&

            isScanning

        ) {


            await html5QrCode.stop();


            isScanning =
                false;


        }


        reader.style.display =
            "none";


    }

    catch (error) {


        console.error(
            "Stop Scanner Error:",
            error
        );


    }

}


// ==========================================
// CAMERA SWITCH
// ==========================================

cameraSelect.addEventListener(

    "change",

    async () => {


        const newCameraId =
            cameraSelect.value;


        if (

            newCameraId ===
            currentCameraId

        ) {

            return;

        }


        await stopScanner();


        await startScanner(
            newCameraId
        );


    }

);


// ==========================================
// SCAN BUTTON
// ==========================================

scanBtn.addEventListener(

    "click",

    async () => {


        participantInfo.innerHTML =
            "";


        // Load cameras first

        if (

            cameras.length === 0

        ) {

            await loadCameras();

        }


        if (

            !currentCameraId

        ) {

            alert(
                "No camera available."
            );

            return;

        }


        // Start scanning

        await startScanner(
            currentCameraId
        );


    }

);


// ==========================================
// LOAD PARTICIPANT
// ==========================================

async function loadParticipant(registrationId) {

    try {


        const q =
            query(

                collection(
                    db,
                    "registrations"
                ),

                where(

                    "registrationId",

                    "==",

                    registrationId

                )

            );


        const snapshot =
            await getDocs(q);


        if (

            snapshot.empty

        ) {


            participantInfo.innerHTML =
                `

                <div class="participant-card error-card">

                    <h2>
                        Participant Not Found
                    </h2>

                    <p>
                        Registration ID:
                        ${registrationId}
                    </p>

                </div>

                `;


            return;

        }


        snapshot.forEach(

            (participant) => {


                const data =
                    participant.data();


                // ==================================
                // Participant Details
                // ==================================

                participantInfo.innerHTML =
                    `

                    <div class="participant-card">

                        <h2>
                            ${data.fullName || "N/A"}
                        </h2>


                        <p>

                            <b>
                                Registration ID:
                            </b>

                            ${data.registrationId || "N/A"}

                        </p>


                        <p>

                            <b>
                                College:
                            </b>

                            ${data.college || "N/A"}

                        </p>


                        <p>

                            <b>
                                Category:
                            </b>

                            ${data.category || "N/A"}

                        </p>


                        <p>

                            <b>
                                Team:
                            </b>

                            ${data.teamName || data.startup || "N/A"}

                        </p>


                        <p>

                            <b>
                                Status:
                            </b>

                            ${

                                data.attendance

                                    ? "🟢 Checked In"

                                    : "🔴 Not Checked In"

                            }

                        </p>


                        ${

                            data.attendance

                                ?

                                `

                                <p>

                                    <b>
                                        Checked In At:
                                    </b>

                                    ${

                                        data.checkInTime

                                            ?

                                            data.checkInTime
                                                .toDate()
                                                .toLocaleString()

                                            :

                                            "Unknown"

                                    }

                                </p>

                                `

                                :

                                `

                                <button
                                    id="attendanceBtn"
                                >

                                    ✅ Mark Attendance

                                </button>

                                `

                        }


                    </div>

                    `;


                // ==================================
                // ATTENDANCE BUTTON
                // ==================================

                const attendanceBtn =
                    document.getElementById(
                        "attendanceBtn"
                    );


                if (attendanceBtn) {


                    attendanceBtn.addEventListener(

                        "click",

                        async () => {


                            try {


                                attendanceBtn.disabled =
                                    true;


                                attendanceBtn.innerText =
                                    "Marking Attendance...";


                                await updateDoc(

                                    participant.ref,

                                    {

                                        attendance:
                                            true,


                                        checkInTime:
                                            serverTimestamp()

                                    }

                                );


                                alert(
                                    "Attendance Marked Successfully!"
                                );


                                // Reload participant
                                // details

                                await loadParticipant(
                                    registrationId
                                );


                            }

                            catch (error) {


                                console.error(
                                    "Attendance Error:",
                                    error
                                );


                                alert(
                                    "Unable to mark attendance."
                                );


                                attendanceBtn.disabled =
                                    false;


                                attendanceBtn.innerText =
                                    "✅ Mark Attendance";


                            }


                        }

                    );


                }


            }

        );


    }

    catch (error) {


        console.error(
            "Participant Load Error:",
            error
        );


        alert(
            "Unable to load participant information."
        );


    }

}


// ==========================================
// PAGE CLEANUP
// ==========================================

window.addEventListener(

    "beforeunload",

    async () => {


        await stopScanner();


    }

);


// ==========================================
// STARTUP
// ==========================================

reader.style.display =
    "none";


console.log(
    "QR Scanner ready."
);
