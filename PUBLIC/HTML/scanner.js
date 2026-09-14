import {

    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp

} from "./firebase.js";


// =====================================
// HTML ELEMENTS
// =====================================

const scanBtn =
document.getElementById("scanBtn");


const stopScannerBtn =
document.getElementById("stopScannerBtn");


const switchCameraBtn =
document.getElementById("switchCameraBtn");


const cameraSelect =
document.getElementById("cameraSelect");


const reader =
document.getElementById("reader");


const scannerStatus =
document.getElementById("scannerStatus");


const participantInfo =
document.getElementById("participantInfo");


// =====================================
// VARIABLES
// =====================================

let html5QrCode = null;

let cameras = [];

let currentCameraIndex = 0;

let scannerRunning = false;


// =====================================
// LOAD CAMERAS
// =====================================

async function loadCameras() {

    try {

        scannerStatus.innerText =
        "Loading cameras...";


        cameras =
        await Html5Qrcode.getCameras();


        cameraSelect.innerHTML = "";


        if (!cameras || cameras.length === 0) {

            cameraSelect.innerHTML = `

                <option>

                    No camera found

                </option>

            `;

            scannerStatus.innerText =
            "No camera detected.";

            return;

        }


        cameras.forEach((camera, index) => {

            const option =
            document.createElement("option");


            option.value =
            camera.id;


            option.text =
            camera.label ||
            `Camera ${index + 1}`;


            cameraSelect.appendChild(option);

        });


        scannerStatus.innerText =
        `${cameras.length} camera(s) detected`;


        if (cameras.length > 1) {

            switchCameraBtn.style.display =
            "inline-block";

        }


    }

    catch (error) {

        console.error(
            "Camera loading error:",
            error
        );


        cameraSelect.innerHTML = `

            <option>

                Camera unavailable

            </option>

        `;


        scannerStatus.innerText =
        "Camera permission required.";

    }

}


// =====================================
// START SCANNER
// =====================================

async function startScanner() {

    try {

        // Stop old scanner first

        if (scannerRunning) {

            await stopScanner();

        }


        scannerStatus.innerText =
        "Starting camera...";


        const selectedCameraId =
        cameraSelect.value;


        if (!selectedCameraId) {

            await loadCameras();

        }


        let cameraId =
        cameraSelect.value;


        // Create scanner

        html5QrCode =
        new Html5Qrcode("reader");


        // Try selected camera

        if (cameraId) {

            await html5QrCode.start(

                cameraId,

                {

                    fps: 10,

                    qrbox: {

                        width: 250,

                        height: 250

                    },

                    aspectRatio: 1

                },

                onScanSuccess,

                onScanFailure

            );

        }

        else {

            // Fallback for mobile

            await html5QrCode.start(

                {

                    facingMode:
                    "environment"

                },

                {

                    fps: 10,

                    qrbox: {

                        width: 250,

                        height: 250

                    }

                },

                onScanSuccess,

                onScanFailure

            );

        }


        scannerRunning = true;


        scanBtn.style.display =
        "none";


        stopScannerBtn.style.display =
        "inline-block";


        scannerStatus.innerText =
        "Camera active. Scan QR code.";


    }

    catch (error) {

        console.error(
            "Scanner start error:",
            error
        );


        scannerStatus.innerText =
        "Unable to start camera. Please allow camera permission.";

    }

}


// =====================================
// STOP SCANNER
// =====================================

async function stopScanner() {

    try {

        if (
            html5QrCode &&
            scannerRunning
        ) {

            await html5QrCode.stop();

            await html5QrCode.clear();

        }


        scannerRunning = false;


        html5QrCode = null;


        reader.innerHTML = "";


        scanBtn.style.display =
        "inline-block";


        stopScannerBtn.style.display =
        "none";


        scannerStatus.innerText =
        "Scanner stopped.";


    }

    catch (error) {

        console.error(
            "Stop scanner error:",
            error
        );

    }

}


// =====================================
// SWITCH CAMERA
// =====================================

async function switchCamera() {

    if (
        cameras.length < 2
    ) {

        alert(
            "Only one camera is available."
        );

        return;

    }


    currentCameraIndex++;


    if (
        currentCameraIndex >=
        cameras.length
    ) {

        currentCameraIndex = 0;

    }


    cameraSelect.value =
    cameras[
        currentCameraIndex
    ].id;


    if (scannerRunning) {

        await stopScanner();

        await startScanner();

    }

}


// =====================================
// QR SCAN SUCCESS
// =====================================

async function onScanSuccess(
    decodedText
) {

    try {

        // Stop camera immediately

        if (
            html5QrCode &&
            scannerRunning
        ) {

            await html5QrCode.stop();

            scannerRunning = false;

        }


        scannerStatus.innerText =
        "QR Code detected!";


        console.log(
            "QR Data:",
            decodedText
        );


        // Parse QR

        const qrData =
        JSON.parse(decodedText);


        const registrationId =
        qrData.registrationId;


        if (!registrationId) {

            alert(
                "Invalid QR Code."
            );

            return;

        }


        // Search Firestore

        const registrationQuery =
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
        await getDocs(
            registrationQuery
        );


        if (snapshot.empty) {

            alert(
                "Participant not found."
            );

            scannerStatus.innerText =
            "Participant not found.";

            return;

        }


        // Get participant

        snapshot.forEach(
            (participant) => {

                const data =
                participant.data();


                showParticipant(
                    participant,
                    data
                );

            }

        );


    }

    catch (error) {

        console.error(error);


        alert(
            "Invalid QR Code."
        );


        scannerStatus.innerText =
        "Invalid QR Code.";

    }

}


// =====================================
// SCAN FAILURE
// =====================================

function onScanFailure(error) {

    // Don't show errors continuously
    // Normal when QR isn't visible

}


// =====================================
// SHOW PARTICIPANT
// =====================================

function showParticipant(
    participant,
    data
) {

    let attendanceStatus =
    data.attendance
    ? "🟢 Checked In"
    : "🔴 Not Checked In";


    let checkInTime = "";


    if (
        data.attendance &&
        data.checkInTime
    ) {

        try {

            checkInTime =

            `<p>

                <b>
                    Checked In At:
                </b>

                ${data.checkInTime
                    .toDate()
                    .toLocaleString()
                }

            </p>`;

        }

        catch (error) {

            checkInTime = "";

        }

    }


    participantInfo.innerHTML = `

        <div class="participant-card">

            <h2>

                ${data.fullName || "Unknown"}

            </h2>


            <p>

                <b>
                    Registration ID:
                </b>

                ${data.registrationId || "-"}

            </p>


            <p>

                <b>
                    Email:
                </b>

                ${data.email || "-"}

            </p>


            <p>

                <b>
                    Phone:
                </b>

                ${data.phone || "-"}

            </p>


            <p>

                <b>
                    College:
                </b>

                ${data.college || "-"}

            </p>


            <p>

                <b>
                    Category:
                </b>

                ${data.category || "-"}

            </p>


            <p>

                <b>
                    Team Name:
                </b>

                ${data.teamName || "-"}

            </p>


            <p>

                <b>
                    Status:
                </b>

                ${attendanceStatus}

            </p>


            ${checkInTime}


            ${

                !data.attendance

                ?

                `

                <button
                    id="attendanceBtn"
                >

                    ✅ Mark Attendance

                </button>

                `

                :

                `

                <button
                    id="scanAgainBtn"
                >

                    📷 Scan Another

                </button>

                `

            }


        </div>

    `;


    document
    .getElementById(
        "attendanceBtn"
    )
    ?.addEventListener(

        "click",

        async () => {

            try {

                await updateDoc(

                    participant.ref,

                    {

                        attendance: true,

                        checkInTime:
                        serverTimestamp()

                    }

                );


                alert(
                    "Attendance Marked Successfully!"
                );


                scannerStatus.innerText =
                "Participant checked in successfully.";


                showParticipant(

                    participant,

                    {

                        ...data,

                        attendance: true,

                        checkInTime:
                        new Date()

                    }

                );


            }

            catch (error) {

                console.error(error);

                alert(
                    "Unable to mark attendance."
                );

            }

        }

    );


    document
    .getElementById(
        "scanAgainBtn"
    )
    ?.addEventListener(

        "click",

        async () => {

            participantInfo.innerHTML =
            "";

            await startScanner();

        }

    );

}


// =====================================
// BUTTON EVENTS
// =====================================

scanBtn.addEventListener(

    "click",

    startScanner

);


stopScannerBtn.addEventListener(

    "click",

    stopScanner

);


switchCameraBtn.addEventListener(

    "click",

    switchCamera

);


// =====================================
// CAMERA DROPDOWN CHANGE
// =====================================

cameraSelect.addEventListener(

    "change",

    async () => {

        currentCameraIndex =
        cameraSelect.selectedIndex;


        if (scannerRunning) {

            await stopScanner();

            await startScanner();

        }

    }

);


// =====================================
// LOAD CAMERAS WHEN PAGE OPENS
// =====================================

loadCameras();


// =====================================

console.log(
    "Pitch Panchayat QR Scanner Loaded"
);