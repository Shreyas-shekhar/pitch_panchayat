import {
    db,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp
} from "./firebase.js";

const resultCard = document.getElementById("resultCard");

const participantName = document.getElementById("participantName");

const participantID = document.getElementById("participantID");

const participantCollege = document.getElementById("participantCollege");

const status = document.getElementById("status");

const scanner = new Html5Qrcode("reader");

scanner.start(

    { facingMode: "environment" },

    { fps: 10, qrbox: 250 },

    onScanSuccess

);

async function onScanSuccess(decodedText) {

    try {

        const qr = JSON.parse(decodedText);

        const registrationId = qr.registrationId;

        const q = query(

            collection(db, "registrations"),

            where("registrationId", "==", registrationId)

        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            showError("Participant Not Found");

            return;

        }

        snapshot.forEach(async(doc)=>{

            const data = doc.data();

            participantName.innerText = data.fullName;

            participantID.innerText = data.registrationId;

            participantCollege.innerText = data.college;

            resultCard.classList.remove("hidden");

            if(data.attendance){

                status.innerText = "🔴 ALREADY CHECKED IN";

                status.className = "error";

            }

            else{

                await updateDoc(doc.ref,{

                    attendance:true,

                    checkInTime:serverTimestamp()

                });

                status.innerText="🟢 ENTRY ALLOWED";

                status.className="success";

            }

        });

    }

    catch(error){

        showError("Invalid QR Code");

    }

    scanner.pause();

    setTimeout(()=>{

        resultCard.classList.add("hidden");

        scanner.resume();

    },3000);

}

function showError(message){

    resultCard.classList.remove("hidden");

    participantName.innerText="";

    participantID.innerText="";

    participantCollege.innerText="";

    status.innerText=message;

    status.className="error";

}