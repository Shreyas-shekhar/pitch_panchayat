import {
    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from "./firebase.js";


// ======================================================
// HTML ELEMENTS
// ======================================================

const scanBtn =
    document.getElementById("scanBtn");

const cameraSelect =
    document.getElementById("cameraSelect");

const switchCameraBtn =
    document.getElementById("switchCameraBtn");

const stopScannerBtn =
    document.getElementById("stopScannerBtn");

const reader =
    document.getElementById("reader");

const scannerStatus =
    document.getElementById("scannerStatus");

const resultCard =
    document.getElementById("resultCard");

const participantName =
    document.getElementById("participantName");

const participantID =
    document.getElementById("participantID");

const participantCollege =
    document.getElementById("participantCollege");

const status =
    document.getElementById("status");


// ======================================================
// QR SCANNER
// ======================================================

const scanner =
    new Html5Qrcode("reader");


// ======================================================
// VARIABLES
// ======================================================

let cameras = [];

let currentCameraIndex = 0;

let scannerRunning = false;

let processingScan = false;


// ======================================================
// LOAD CAMERAS
// ======================================================

async function loadCameras() {

    try {

        cameras =
            await Html5Qrcode.getCameras();


        if (!cameras.length) {

            cameraSelect.innerHTML =
                `<option value="">
                    No camera found
                </option>`;

            scannerStatus.innerText =
                "No camera detected.";

            return;
        }


        cameraSelect.innerHTML = "";


        cameras.forEach(
            (camera, index) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    camera.id;

                option.textContent =
                    camera.label ||
                    `Camera ${index + 1}`;

                cameraSelect.appendChild(
                    option
                );

            }
        );


        // Try to select rear camera
        const rearCameraIndex =
            cameras.findIndex(
                camera =>
                    /back|rear|environment/i
                        .test(camera.label)
            );


        if (rearCameraIndex !== -1) {

            currentCameraIndex =
                rearCameraIndex;

        }


        cameraSelect.value =
            cameras[currentCameraIndex].id;


        scannerStatus.innerText =
            `${cameras.length} camera(s) detected.`;


        switchCameraBtn.style.display =
            cameras.length > 1
                ? "inline-block"
                : "none";

    }

    catch (error) {

        console.error(
            "Camera loading error:",
            error
        );

        scannerStatus.innerText =
            "Unable to access cameras.";

    }

}


// ======================================================
// START SCANNER
// ======================================================

async function startScanner() {

    if (scannerRunning) return;


    if (!cameras.length) {

        await loadCameras();

    }


    if (!cameras.length) {

        alert(
            "No camera is available."
        );

        return;
    }


    const cameraId =
        cameraSelect.value ||
        cameras[currentCameraIndex].id;


    try {

        scannerStatus.innerText =
            "Starting camera...";


        await scanner.start(

            cameraId,

            {
                fps: 20,

                qrbox: {
                    width: 250,
                    height: 250
                },

                aspectRatio: 1.0

            },

            onScanSuccess,

            onScanFailure

        );


        scannerRunning = true;


        scanBtn.style.display =
            "none";

        stopScannerBtn.style.display =
            "inline-block";


        switchCameraBtn.style.display =
            cameras.length > 1
                ? "inline-block"
                : "none";


        scannerStatus.innerText =
            "🟢 Scanner active — point the camera at the QR code.";

    }

    catch (error) {

        console.error(
            "Scanner start error:",
            error
        );


        scannerStatus.innerText =
            "Unable to start camera.";

        alert(
            "Camera could not be started.\n\n" +
            "Make sure camera permission is allowed."
        );

    }

}


// ======================================================
// STOP SCANNER
// ======================================================

async function stopScanner() {

    if (!scannerRunning) return;


    try {

        await scanner.stop();

        scanner.clear();

    }

    catch (error) {

        console.error(
            "Scanner stop error:",
            error
        );

    }


    scannerRunning = false;


    scanBtn.style.display =
        "inline-block";

    stopScannerBtn.style.display =
        "none";

    switchCameraBtn.style.display =
        cameras.length > 1
            ? "inline-block"
            : "none";


    scannerStatus.innerText =
        "Scanner stopped.";

}


// ======================================================
// SWITCH CAMERA
// ======================================================

async function switchCamera() {

    if (cameras.length < 2) {

        return;
    }


    const wasRunning =
        scannerRunning;


    if (wasRunning) {

        await stopScanner();

    }


    currentCameraIndex =
        (currentCameraIndex + 1)
        % cameras.length;


    cameraSelect.value =
        cameras[currentCameraIndex].id;


    scannerStatus.innerText =
        `Selected: ${
            cameras[currentCameraIndex].label ||
            `Camera ${currentCameraIndex + 1}`
        }`;


    if (wasRunning) {

        await startScanner();

    }

}


// ======================================================
// CAMERA DROPDOWN
// ======================================================

cameraSelect.addEventListener(
    "change",
    async () => {

        const selectedId =
            cameraSelect.value;


        const index =
            cameras.findIndex(
                camera =>
                    camera.id === selectedId
            );


        if (index !== -1) {

            currentCameraIndex =
                index;

        }


        if (scannerRunning) {

            await stopScanner();

            await startScanner();

        }

    }
);


// ======================================================
// SCAN SUCCESS
// ======================================================

async function onScanSuccess(
    decodedText
) {

    if (processingScan) return;


    processingScan = true;


    console.log(
        "QR Scanned:",
        decodedText
    );


    try {

        // ------------------------------------------
        // PARSE QR DATA
        // ------------------------------------------

        let qrData;


        try {

            qrData =
                JSON.parse(decodedText);

        }

        catch {

            throw new Error(
                "Invalid QR format."
            );

        }


        const registrationId =
            qrData.registrationId;


        if (!registrationId) {

            throw new Error(
                "Registration ID missing."
            );

        }


        console.log(
            "Registration ID:",
            registrationId
        );


        // ------------------------------------------
        // FIND REGISTRATION
        // ------------------------------------------

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

            showError(
                "Participant Not Found"
            );

            return;

        }


        // ------------------------------------------
        // PARTICIPANT
        // ------------------------------------------

        const participant =
            snapshot.docs[0];


        const data =
            participant.data();


        // ------------------------------------------
        // SHOW INFORMATION
        // ------------------------------------------

        participantName.innerText =
            data.fullName ||
            "Unknown";


        participantID.innerText =
            data.registrationId ||
            registrationId;


        participantCollege.innerText =
            data.college ||
            "Not provided";


        resultCard.classList.remove(
            "hidden"
        );


        // ------------------------------------------
        // CHECK ATTENDANCE
        // ------------------------------------------

        if (data.attendance) {

            status.innerText =
                "🔴 ALREADY CHECKED IN";

            status.className =
                "error";


            scannerStatus.innerText =
                "Participant has already checked in.";

        }

        else {

            // --------------------------------------
            // MARK ATTENDANCE
            // --------------------------------------

            await updateDoc(
                participant.ref,
                {

                    attendance: true,

                    checkInTime:
                        serverTimestamp()

                }
            );


            status.innerText =
                "🟢 ENTRY ALLOWED";

            status.className =
                "success";


            scannerStatus.innerText =
                "✅ Attendance marked successfully.";

        }

    }

    catch (error) {

        console.error(
            "QR processing error:",
            error
        );


        showError(
            error.message ||
            "Invalid QR Code"
        );

    }


    // ------------------------------------------
    // ALLOW NEXT SCAN
    // ------------------------------------------

    setTimeout(
        () => {

            resultCard.classList.add(
                "hidden"
            );

            processingScan = false;

            if (scannerRunning) {

                scannerStatus.innerText =
                    "🟢 Ready for next scan.";

            }

        },
        3500
    );

}


// ======================================================
// SCAN FAILURE
// ======================================================

function onScanFailure(errorMessage) {

    // Ignore normal scanning misses.
    // QR scanners call this continuously
    // while searching for a QR code.

}


// ======================================================
// ERROR DISPLAY
// ======================================================

function showError(message) {

    resultCard.classList.remove(
        "hidden"
    );


    participantName.innerText =
        "";


    participantID.innerText =
        "";


    participantCollege.innerText =
        "";


    status.innerText =
        "❌ " + message;


    status.className =
        "error";

}


// ======================================================
// BUTTON EVENTS
// ======================================================

scanBtn.addEventListener(
    "click",
    startScanner
);


switchCameraBtn.addEventListener(
    "click",
    switchCamera
);


stopScannerBtn.addEventListener(
    "click",
    stopScanner
);


// ======================================================
// INITIAL CAMERA DETECTION
// ======================================================

loadCameras();