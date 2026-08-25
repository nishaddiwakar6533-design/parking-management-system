// =========================
// CURRENT DATE
// =========================

const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent =
    today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });


// =========================
// PARKING SLOTS
// =========================

const totalSlots = 20;

let parkingData = [];

const API_BASE_URL =
    "https://parking-management-system-production-7ce8.up.railway.app";

// =========================
// LOAD PARKING DATA FROM DATABASE
// =========================

async function loadParkingData() {

    try {

        const savedUser =
            localStorage.getItem("parkEaseUser");

        if (!savedUser) {
            console.log("⚠️ User not logged in.");
            return;
        }

        const currentUser =
            JSON.parse(savedUser);

        if (!currentUser.id) {
            console.error("❌ User ID not found.");
            return;
        }

        console.log(
            "👤 Loading parking data for user:",
            currentUser.id
        );

        const response = await fetch(
            `${API_BASE_URL}/api/parking?user_id=${currentUser.id}`
        );

        const result = await response.json();

        if (!result.success) {
            console.error(
                "❌ Failed to load parking data:",
                result.message
            );
            return;
        }

        parkingData = (result.data || []).map(vehicle => ({

            id: vehicle.id,

            receiptId:
                vehicle.receipt_id,

            vehicleNumber:
                vehicle.vehicle_number,

            ownerName:
                vehicle.owner_name,

            vehicleType:
                vehicle.vehicle_type,

            slot:
                vehicle.slot,

            entryTime:
                vehicle.entry_time,

            exitTime:
                vehicle.exit_time,

            duration:
                vehicle.duration,

            parkingFee:
                vehicle.parking_fee,

            status:
                vehicle.status

        }));

        console.log(
            "✅ Parking data loaded from MySQL:",
            parkingData
        );

        displaySlots();
        displayRecentParking();
        loadAvailableSlots();
        updateStats();
        displayHistory();

    } catch (error) {

        console.error(
            "❌ Database connection error:",
            error
        );

    }
}

// =========================
// DISPLAY SLOTS
// =========================

function displaySlots() {

    parkingSlots.innerHTML = "";

    for (let i = 1; i <= totalSlots; i++) {

        const slotNumber =
            "P" + String(i).padStart(2, "0");

        const vehicle =
    parkingData.find(
        item =>
            item.slot === slotNumber &&
            item.status === "Parked"
    );

        const slot =
            document.createElement("div");

        if (vehicle) {

            slot.className =
                "slot occupied";

            slot.innerHTML = `
                <div class="slot-number">
                    ${slotNumber}
                </div>

                <div class="slot-status">
                    🚗 Occupied
                </div>
            `;

        } else {

            slot.className =
                "slot available";

            slot.innerHTML = `
                <div class="slot-number">
                    ${slotNumber}
                </div>

                <div class="slot-status">
                    ✓ Available
                </div>
            `;
        }

        parkingSlots.appendChild(slot);
    }

    updateStats();
}


// =========================
// UPDATE STATISTICS
// =========================

// =========================
// UPDATE DASHBOARD STATS
// =========================

function updateStats() {

    // Occupied slots
    const occupied =
        parkingData.filter(
            item =>
                item.status === "Parked"
        ).length;


    // Available slots
    const available =
        totalSlots - occupied;


    // Total slots
    const totalSlotsElement =
        document.getElementById(
            "totalSlots"
        );

    if (totalSlotsElement) {
        totalSlotsElement.textContent =
            totalSlots;
    }


    // Occupied
    const occupiedElement =
        document.getElementById(
            "occupiedSlots"
        );

    if (occupiedElement) {
        occupiedElement.textContent =
            occupied;
    }


    // Available
    const availableElement =
        document.getElementById(
            "availableSlots"
        );

    if (availableElement) {
        availableElement.textContent =
            available;
    }


    // =========================
    // TODAY'S COLLECTION
    // =========================

    const today =
        new Date();

    const todayDate =
        today.toLocaleDateString(
            "en-IN"
        );


    const todayCollection =
        parkingData
            .filter(item => {

                if (
                    item.status !==
                        "Completed" ||
                    !item.exitTime
                ) {
                    return false;
                }


                const exitDate =
                    new Date(
                        item.exitTime
                    );


                return (
                    exitDate.toLocaleDateString(
                        "en-IN"
                    ) === todayDate
                );

            })
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.parkingFee || 0
                    ),
                0
            );


    const collectionElement =
        document.getElementById(
            "collection"
        );


    if (collectionElement) {

        collectionElement.textContent =
            "₹" + todayCollection;
            

    }
// =========================
// PARKING CAPACITY ALERT
// =========================

const parkingAlert =
    document.getElementById(
        "parkingAlert"
    );


if (parkingAlert) {

    parkingAlert.className =
        "parking-alert";


    if (available === 0) {

        parkingAlert.classList.add(
            "full"
        );

        parkingAlert.textContent =
            "🔴 Parking Full! No parking slot is available.";

    }

    else if (available <= 5) {

        parkingAlert.classList.add(
            "warning"
        );

        parkingAlert.textContent =
            `⚠️ Only ${available} parking slots are available.`;

    }

    else {

        parkingAlert.classList.add(
            "normal"
        );

        parkingAlert.textContent =
            `🟢 ${available} parking slots are currently available.`;

    }

}
}
    


// =========================
// RECENT PARKING
// =========================

// =========================
// RECENT PARKING
// =========================

function displayRecentParking() {

    const recentParking =
        document.getElementById(
            "recentParking"
        );


    if (!recentParking) return;


    // Sirf currently parked vehicles
    const activeVehicles =
        parkingData
            .filter(
                item =>
                    item.status === "Parked"
            )
            .slice()
            .reverse()
            .slice(0, 5);


    // Agar koi vehicle parked nahi hai
    if (activeVehicles.length === 0) {

        recentParking.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >
                    No parking records available
                </td>

            </tr>

        `;

        return;
    }


    // Recent vehicles show karo
    recentParking.innerHTML =
        activeVehicles
            .map(vehicle => {

                return `

                    <tr>

                        <td>
                            <strong>
                                ${vehicle.vehicleNumber}
                            </strong>
                        </td>

                        <td>
                            ${vehicle.vehicleType}
                        </td>

                        <td>
                            ${vehicle.slot}
                        </td>

                        <td>
                            ${vehicle.entryTime}
                        </td>

                        <td>

                            <span
                                class="history-status parked"
                            >
                                ● Parked
                            </span>

                        </td>

                    </tr>

                `;

            })
            .join("");
}// =========================
// RECENT PARKING
// =========================

function displayRecentParking() {

    const recentParking =
        document.getElementById(
            "recentParking"
        );


    if (!recentParking) return;


    // Sirf currently parked vehicles
    const activeVehicles =
        parkingData
            .filter(
                item =>
                    item.status === "Parked"
            )
            .slice()
            .reverse()
            .slice(0, 5);


    // Agar koi vehicle parked nahi hai
    if (activeVehicles.length === 0) {

        recentParking.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >
                    No parking records available
                </td>

            </tr>

        `;

        return;
    }


    // Recent vehicles show karo
    recentParking.innerHTML =
        activeVehicles
            .map(vehicle => {

                return `

                    <tr>

                        <td>
                            <strong>
                                ${vehicle.vehicleNumber}
                            </strong>
                        </td>

                        <td>
                            ${vehicle.vehicleType}
                        </td>

                        <td>
                            ${vehicle.slot}
                        </td>

                        <td>
                            ${vehicle.entryTime}
                        </td>

                        <td>

                            <span
                                class="history-status parked"
                            >
                                ● Parked
                            </span>

                        </td>

                    </tr>

                `;

            })
            .join("");
}


// =========================
// LOAD DASHBOARD
// =========================


// =========================
// VEHICLE ENTRY
// =========================

const vehicleEntryForm =
    document.getElementById("vehicleEntryForm");

const parkingSlotSelect =
    document.getElementById("parkingSlot");

const entryTimeInput =
    document.getElementById("entryTime");


// =========================
// SET ENTRY TIME
// =========================

function setEntryTime() {

    const now = new Date();

    entryTimeInput.value =
        now.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
}

setEntryTime();


// =========================
// LOAD AVAILABLE SLOTS
// =========================

function loadAvailableSlots() {

    parkingSlotSelect.innerHTML = `
        <option value="">
            Select available slot
        </option>
    `;

    for (let i = 1; i <= totalSlots; i++) {

        const slotNumber =
            "P" + String(i).padStart(2, "0");

        const occupied =
            parkingData.some(
                item =>
                    item.slot === slotNumber &&
                    item.status === "Parked"
            );

        if (!occupied) {

            const option =
                document.createElement("option");

            option.value = slotNumber;

            option.textContent =
                slotNumber + " - Available";

            parkingSlotSelect.appendChild(option);
        }
    }
}




// =========================
// PARK VEHICLE
// =========================

// =========================
// VEHICLE ENTRY VALIDATION
// =========================

vehicleEntryForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // Get form values
        const vehicleNumber =
            document.getElementById(
                "vehicleNumber"
            )
            .value
            .trim()
            .toUpperCase();
// =========================
// VEHICLE NUMBER VALIDATION
// =========================

// Basic Indian vehicle number format
const vehicleNumberPattern =
    /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/;


if (!vehicleNumberPattern.test(vehicleNumber)) {

    showEntryMessage(
        "Please enter a valid vehicle number. Example: UP61AB4924",
        "error"
    );

    return;
}

        const ownerName =
            document.getElementById(
                "ownerName"
            )
            .value
            .trim();


        const vehicleType =
            document.getElementById(
                "vehicleType"
            ).value;


        const slot =
            parkingSlotSelect.value;
            // =========================
// CHECK PARKING CAPACITY
// =========================

const availableSlots =
    totalSlots -
    parkingData.filter(
        item => item.status === "Parked"
    ).length;




if (availableSlots <= 0) {

    showEntryMessage(
        "🔴 Parking is full. No slot is available.",
        "error"
    );

    return;
}
if (!slot) {

    showEntryMessage(
        "Please select a parking slot.",
        "error"
    );

    return;
}


        const entryTime =
            entryTimeInput.value;


        // =========================
        // BASIC VALIDATION
        // =========================

        if (
            vehicleNumber === "" ||
            ownerName === "" ||
            vehicleType === "" ||
            slot === ""
        ) {

            showEntryMessage(
                "Please fill all the fields.",
                "error"
            );

            return;
        }


        // =========================
        // VEHICLE NUMBER VALIDATION
        // =========================

        const vehiclePattern =
            /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;


        const cleanVehicleNumber =
            vehicleNumber.replace(
                /[\s-]/g,
                ""
            );


        if (
            !vehiclePattern.test(
                cleanVehicleNumber
            )
        ) {

            showEntryMessage(
                "Please enter a valid vehicle number.",
                "error"
            );

            return;
        }


        // =========================
        // DUPLICATE VEHICLE CHECK
        // =========================

        const alreadyParked =
            parkingData.some(
                item =>
                    item.vehicleNumber
                        .replace(
                            /[\s-]/g,
                            ""
                        ) ===
                    cleanVehicleNumber
                    &&
                    item.status ===
                        "Parked"
            );
            if (alreadyParked) {

    showEntryMessage(
        "⚠️ This vehicle is already parked.",
        "error"
    );

    return;
}


        if (alreadyParked) {

            showEntryMessage(
                "This vehicle is already parked.",
                "error"
            );

            return;
        }


        // =========================
        // PARKING FULL CHECK
        // =========================

        const occupiedSlots =
            parkingData.filter(
                item =>
                    item.status ===
                    "Parked"
            ).length;


        if (
            occupiedSlots >=
            totalSlots
        ) {

            showEntryMessage(
                "Parking is full. No slot is available.",
                "error"
            );

            loadAvailableSlots();

            return;
        }


        // =========================
        // SLOT VALIDATION
        // =========================

        const slotAlreadyOccupied =
            parkingData.some(
                item =>
                    item.slot === slot &&
                    item.status === "Parked"
            );


        if (slotAlreadyOccupied) {

            showEntryMessage(
                `${slot} is already occupied. Please select another slot.`,
                "error"
            );

            loadAvailableSlots();

            return;
        }


        // =========================
        // CREATE VEHICLE RECORD
        // =========================

        const newVehicle = {

            id: Date.now(),

            vehicleNumber:
                vehicleNumber,

            ownerName:
                ownerName,

            vehicleType:
                vehicleType,

            slot:
                slot,

            entryTime:
                entryTime,

            exitTime:
                "",

            duration:
                "",

            parkingFee:
                0,

            status:
                "Parked"

        };


        // =========================
        // SAVE DATA
        // =========================

        parkingData.push(
            newVehicle
        );


        localStorage.setItem(
            "parkingData",
            JSON.stringify(
                parkingData
            )
        );
        // =========================
// SAVE TO DATABASE
// =========================

const savedUser =
    localStorage.getItem("parkEaseUser");

if (!savedUser) {

    console.error("❌ User not logged in.");

} else {

    const currentUser =
        JSON.parse(savedUser);

    fetch(`${API_BASE_URL}/api/parking`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            user_id: currentUser.id,

            receipt_id:
                "REC-" + newVehicle.id,

            vehicle_number:
                newVehicle.vehicleNumber,

            owner_name:
                newVehicle.ownerName,

            vehicle_type:
                newVehicle.vehicleType,

            slot:
                newVehicle.slot,

            entry_time:
                newVehicle.entryTime,

            exit_time:
                null,

            duration:
                "",

            parking_fee:
                0,

            status:
                "Parked"

        })

    })

    .then(async response => {
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Vehicle could not be saved");
        }

        return data;
    })

    .then(data => {

        // Use the MySQL record ID for later vehicle-exit updates.
        newVehicle.id = data.id;

        localStorage.setItem(
            "parkingData",
            JSON.stringify(parkingData)
        );

        console.log(
            "✅ Database response:",
            data
        );

    })

    .catch(error => {

        console.error(
            "❌ Database error:",
            error
        );

    });

}


        // =========================
        // SUCCESS
        // =========================

        showEntryMessage(
            `Vehicle ${vehicleNumber} successfully parked in ${slot}.`,
            "success"
        );
        // =========================
// SHOW PARKING RECEIPT
// =========================

const receiptModal =
    document.getElementById(
        "parkingReceiptModal"
    );

const receiptContent =
    document.getElementById(
        "parkingReceiptContent"
    );


if (
    receiptModal &&
    receiptContent
) {

    receiptContent.innerHTML = `

        <div class="receipt-content">

            <div class="receipt-title">

                <h3>🚗 ParkEase</h3>

                <p>Parking Entry Receipt</p>

            </div>


            <div class="receipt-row">
                <span>Vehicle Number</span>
                <strong>
                    ${vehicleNumber}
                </strong>
            </div>


            <div class="receipt-row">
                <span>Owner Name</span>
                <strong>
                    ${ownerName}
                </strong>
            </div>


            <div class="receipt-row">
                <span>Vehicle Type</span>
                <strong>
                    ${vehicleType}
                </strong>
            </div>


            <div class="receipt-row">
                <span>Parking Slot</span>
                <strong>
                    ${slot}
                </strong>
            </div>


            <div class="receipt-row">
                <span>Entry Time</span>
                <strong>
                    ${entryTime}
                </strong>
            </div>


            <div class="receipt-row">
                <span>Parking Rate</span>
                <strong>
                    ${
                        vehicleType === "Car"
                            ? "₹40/hour"
                            : vehicleType === "Auto"
                                ? "₹30/hour"
                                : "₹20/hour"
                    }
                </strong>
            </div>


            <div class="receipt-status">
                🟢 Parking Status: Parked
            </div>


            <div class="receipt-payment">
                💰 Payment Status: Paid
            </div>

        </div>

    `;


    receiptModal.style.display =
        "flex";

}


        // Reset form
        vehicleEntryForm.reset();

        setEntryTime();


        // Update everything
        
        loadAvailableSlots();

        displaySlots();

        displayRecentParking();

        updateStats();

        displayHistory();

    }
);


// =========================
// MESSAGE
// =========================

function showEntryMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "entryMessage"
        );

    messageBox.textContent = message;

    messageBox.className =
        type === "success"
            ? "success-message"
            : "error-message";
}

// =========================
// VEHICLE EXIT
// =========================

let selectedVehicle = null;


// Search button

const searchVehicleBtn =
    document.getElementById(
        "searchVehicleBtn"
    );


searchVehicleBtn.addEventListener(
    "click",
    searchVehicle
);


// =========================
// SEARCH VEHICLE
// =========================

function searchVehicle() {

    const vehicleNumber =
        document.getElementById(
            "exitVehicleNumber"
        )
        .value
        .trim()
        .toUpperCase();


    if (!vehicleNumber) {

        showExitMessage(
            "Please enter vehicle number.",
            "error"
        );

        return;
    }


    // Find parked vehicle

    const vehicle =
        parkingData.find(
            item =>
                item.vehicleNumber ===
                    vehicleNumber &&
                item.status === "Parked"
        );


    if (!vehicle) {

        document.getElementById(
            "exitDetails"
        ).style.display = "none";


        showExitMessage(
            "Vehicle not found in parking.",
            "error"
        );

        selectedVehicle = null;

        return;
    }


    selectedVehicle = vehicle;


    // Current exit time

    const now = new Date();


    // Display details

    document.getElementById(
        "exitVehicleNo"
    ).textContent =
        vehicle.vehicleNumber;


    document.getElementById(
        "exitOwnerName"
    ).textContent =
        vehicle.ownerName;


    document.getElementById(
        "exitVehicleType"
    ).textContent =
        vehicle.vehicleType;


    document.getElementById(
        "exitSlot"
    ).textContent =
        vehicle.slot;


    document.getElementById(
        "exitEntryTime"
    ).textContent =
        vehicle.entryTime;


    document.getElementById(
        "exitTime"
    ).textContent =
        now.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // Calculate duration

    const entryDate =
        parseEntryTime(
            vehicle.entryTime
        );


    const duration =
        calculateDuration(
            entryDate,
            now
        );


    document.getElementById(
        "parkingDuration"
    ).textContent =
        duration.text;


    // Calculate fee

    // Calculate fee

const fee =
    calculateParkingFee(
        duration.hours,
        vehicle.vehicleType
    );


    document.getElementById(
        "parkingFee"
    ).textContent =
        "₹" + fee;


    // Show details

    document.getElementById(
        "exitDetails"
    ).style.display = "block";


    document.getElementById(
        "exitMessage"
    ).textContent = "";

}


// =========================
// PARSE ENTRY TIME
// =========================

function parseEntryTime(
    entryTime
) {

    /*
       entryTime hamare system se
       is format mein save hota hai:

       12 Aug 2026, 10:30 pm
    */

    const parts =
        entryTime.match(
            /(\d{2})\s(\w{3})\s(\d{4}),\s(\d{1,2}):(\d{2})\s(AM|PM)/i
        );


    if (!parts) {

        // Fallback
        return new Date();
    }


    const day =
        parseInt(parts[1]);

    const monthText =
        parts[2];

    const year =
        parseInt(parts[3]);

    let hour =
        parseInt(parts[4]);

    const minute =
        parseInt(parts[5]);

    const ampm =
        parts[6].toUpperCase();


    const months = {

        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11

    };


    if (ampm === "PM" && hour !== 12) {
        hour += 12;
    }

    if (ampm === "AM" && hour === 12) {
        hour = 0;
    }


    return new Date(
        year,
        months[monthText],
        day,
        hour,
        minute
    );
}


// =========================
// CALCULATE DURATION
// =========================

function calculateDuration(
    entryDate,
    exitDate
) {

    let difference =
        exitDate.getTime() -
        entryDate.getTime();


    if (difference < 0) {
        difference = 0;
    }


    const totalMinutes =
        Math.ceil(
            difference / (1000 * 60)
        );


    let hours =
        Math.ceil(
            totalMinutes / 60
        );


    // Minimum 1 hour

    if (hours < 1) {
        hours = 1;
    }


    const days =
        Math.floor(
            hours / 24
        );


    const remainingHours =
        hours % 24;


    let text = "";


    if (days > 0) {

        text +=
            days +
            (days === 1
                ? " Day "
                : " Days ");

    }


    if (remainingHours > 0) {

        text +=
            remainingHours +
            (remainingHours === 1
                ? " Hour"
                : " Hours");

    }


    return {

        hours: hours,

        text: text.trim()

    };

}


// =========================
// PARKING FEE
// =========================

// =========================
// PARKING FEE
// =========================

function calculateParkingFee(hours, vehicleType) {

    let rate = 20;



    if (vehicleType === "Bike") {
        rate = 20;
    }

    else if (vehicleType === "Car") {
        rate = 40;
    }

    else if (vehicleType === "Auto") {
        rate = 30;
    }

    else if (vehicleType === "Other") {
        rate = 20;
    }


    // Minimum 1 hour
    if (hours < 1) {
        hours = 1;
    }


    return hours * rate;
}


// =========================
// COMPLETE EXIT
// =========================

const completeExitBtn =
    document.getElementById(
        "completeExitBtn"
    );


completeExitBtn.addEventListener(
    "click",
    completeVehicleExit
);


async function completeVehicleExit() {

    if (!selectedVehicle) {
        showExitMessage(
            "Please search a vehicle first.",
            "error"
        );
        return;
    }

    const exitDate = new Date();

    const entryDate = parseEntryTime(
        selectedVehicle.entryTime
    );

    const duration = calculateDuration(
        entryDate,
        exitDate
    );

    const fee = calculateParkingFee(
        duration.hours,
        selectedVehicle.vehicleType
    );

    // MySQL DATETIME format
    const mysqlExitTime =
        exitDate.toISOString()
            .slice(0, 19)
            .replace("T", " ");

    // =========================
    // UPDATE MYSQL DATABASE
    // =========================

    try {

        const savedUser = localStorage.getItem("parkEaseUser");

if (!savedUser) {
    throw new Error("User login information not found.");
}

const currentUser = JSON.parse(savedUser);

if (!currentUser.id) {
    throw new Error("User ID not found.");
}

const response = await fetch(
    `${API_BASE_URL}/api/parking/${selectedVehicle.id}`,
    {
        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: currentUser.id,
            exit_time: mysqlExitTime,
            duration: duration.text,
            parking_fee: fee,
            status: "Completed"
        })
    }
);

const updateResult = await response.json();

if (!response.ok || !updateResult.success) {
    throw new Error(
        updateResult.message || "Vehicle exit could not be saved"
    );
}
        

        // =========================
        // UPDATE LOCAL RECORD
        // =========================

        selectedVehicle.exitTime =
            exitDate.toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        selectedVehicle.duration =
            duration.text;

        selectedVehicle.parkingFee =
            fee;

        selectedVehicle.status =
            "Completed";

        localStorage.setItem(
            "parkingData",
            JSON.stringify(parkingData)
        );

        // =========================
        // REFRESH DASHBOARD
        // =========================

        displaySlots();
        displayRecentParking();
        
        updateStats();
        displayHistory();

        // Hide details
        document.getElementById(
            "exitDetails"
        ).style.display = "none";

        document.getElementById(
            "exitVehicleNumber"
        ).value = "";

        selectedVehicle = null;

        showExitMessage(
            `Vehicle exit completed successfully. Parking Fee: ₹${fee}`,
            "success"
        );

    } catch (error) {

        console.error(
            "❌ Exit database error:",
            error
        );

        showExitMessage(
            "Vehicle exit failed. Database update nahi hua.",
            "error"
        );
    }
}
// =========================
// EXIT MESSAGE
// =========================

function showExitMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "exitMessage"
        );


    messageBox.textContent =
        message;


    if (type === "success") {

        messageBox.style.color =
            "#16a34a";

    } else {

        messageBox.style.color =
            "#dc2626";

    }

}
// =========================
// =========================
// SIDEBAR NAVIGATION
// =========================

const navLinks =
    document.querySelectorAll(".nav-link");

const sections = [
    "dashboardSection",
    "entrySection",
    "exitSection",
    "slotSection",
    "historySection"
];


function showSection(sectionId) {

    // Hide all sections
    sections.forEach(function(id) {

        const section =
            document.getElementById(id);

        if (section) {
            section.classList.remove(
                "active-section"
            );
        }

    });


    // Show selected section
    const selectedSection =
        document.getElementById(sectionId);

    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    // Active sidebar button
    navLinks.forEach(function(link) {

        link.classList.remove("active");

        if (
            link.dataset.section ===
            sectionId
        ) {

            link.classList.add("active");

        }

    });


    // Slot Status update
    if (sectionId === "slotSection") {

        if (
            typeof displayFullSlots ===
            "function"
        ) {
            displayFullSlots();
        }

    }


    // Parking History update
    if (sectionId === "historySection") {

        if (
            typeof displayHistory ===
            "function"
        ) {
            displayHistory();
        }

    }

}


// Sidebar click events
navLinks.forEach(function(link) {

    link.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const sectionId =
                this.dataset.section;

            showSection(sectionId);

        }
    );

});


// Open Dashboard by default
showSection("dashboardSection");
// =========================
// PARKING HISTORY
// =========================

const historyTableBody =
    document.getElementById(
        "historyTableBody"
    );

const historySearch =
    document.getElementById(
        "historySearch"
    );
    const statusFilter =
    document.getElementById(
        "historyStatusFilter"
    );


// =========================
// DISPLAY HISTORY
// =========================

// =========================
// DISPLAY PARKING HISTORY
// =========================

function displayHistory(searchText = "") {

    if (!historyTableBody) return;


    // Get all records
    let records =
        [...parkingData].reverse();


    // =========================
    // SEARCH FILTER
    // =========================

    const search =
        searchText
            .trim()
            .toLowerCase();


    if (search !== "") {

        records =
            records.filter(vehicle => {

                const vehicleNumber =
                    String(
                        vehicle.vehicleNumber || ""
                    ).toLowerCase();


                const ownerName =
                    String(
                        vehicle.ownerName || ""
                    ).toLowerCase();


                return (
                    vehicleNumber.includes(search) ||
                    ownerName.includes(search)
                );

            });

    }


    // =========================
    // STATUS FILTER
    // =========================

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    if (
        selectedStatus !== "All"
    ) {

        records =
            records.filter(
                vehicle =>
                    vehicle.status ===
                    selectedStatus
            );

    }


    // =========================
    // NO RECORDS
    // =========================

    if (records.length === 0) {

        historyTableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty"
                >
                    No parking history found
                </td>

            </tr>

        `;

        return;
    }


    // =========================
    // DISPLAY RECORDS
    // =========================

    historyTableBody.innerHTML =
        records
            .map(vehicle => {

                const statusClass =
                    vehicle.status === "Parked"
                        ? "parked"
                        : "completed";


                return `

                    <tr>

                        <td>
                            <strong>
                                ${
                                    vehicle.vehicleNumber ||
                                    "-"
                                }
                            </strong>
                        </td>

                        <td>
                            ${
                                vehicle.ownerName ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                vehicle.vehicleType ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                vehicle.slot ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                vehicle.entryTime ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                vehicle.exitTime ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                vehicle.duration ||
                                "-"
                            }
                        </td>

                        <td>
                            ₹${
                                vehicle.parkingFee ||
                                0
                            }
                        </td>

                        <td>

                            <span
                                class="history-status ${statusClass}"
                            >
                                ${
                                    vehicle.status ===
                                    "Parked"
                                        ? "Parked"
                                        : "Completed"
                                }
                            </span>

                        </td>
                        <td>
    <button
        type="button"
        class="view-details-btn"
        data-id="${vehicle.id}"
    >
        View Details
    </button>
</td>

                    </tr>

                `;

            })
            .join("");
}


// =========================
// SEARCH HISTORY
// =========================

if (historySearch) {

    historySearch.addEventListener(
        "input",
        function() {

            displayHistory(
                this.value
            );

        }
    );

}


// =========================
// UPDATE HISTORY WHEN OPENED
// =========================

navLinks.forEach(link => {

    link.addEventListener(
        "click",
        function() {

            if (
                this.dataset.section ===
                "historySection"
            ) {

                displayHistory();

            }

        }
    );

});
// =========================
// CLEAR PARKING HISTORY
// =========================

const clearHistoryBtn =
    document.getElementById(
        "clearHistoryBtn"
    );

if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(
        "click",
        function () {

            if (parkingData.length === 0) {

                alert(
                    "Parking history is already empty."
                );

                return;
            }


            const confirmClear =
                confirm(
                    "Are you sure you want to clear all parking history?"
                );


            if (!confirmClear) {
                return;
            }


            // Clear data
            parkingData.length = 0;


            localStorage.setItem(
                "parkingData",
                JSON.stringify(
                    parkingData
                )
            );


            // Update everything
            displayHistory();

            displaySlots();

            displayRecentParking();

            loadAvailableSlots();

            updateStats();


            alert(
                "Parking history cleared successfully."
            );

        }
    );

}


// =========================
// LOGOUT
// =========================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmLogout) {
                return;
            }

            // Remove login session
            localStorage.removeItem(
                "parkEaseLoggedIn"
            );

            localStorage.removeItem(
                "parkEaseUser"
            );

            // Go back to login page
            window.location.href =
                "login.html";
        }
    );

}

// =========================
// QUICK ACTIONS
// =========================

const quickButtons =
    document.querySelectorAll(
        ".quick-btn"
    );


quickButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const sectionId =
                    this.dataset.goSection;

                showSection(
                    sectionId
                );

            }
        );

    }
);
// =========================
// VEHICLE DETAILS MODAL
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const vehicleDetailsModal =
        document.getElementById(
            "vehicleDetailsModal"
        );

    const vehicleDetailsContent =
        document.getElementById(
            "vehicleDetailsContent"
        );

    const closeVehicleModal =
        document.getElementById(
            "closeVehicleModal"
        );

    const closeVehicleModalBottom =
        document.getElementById(
            "closeVehicleModalBottom"
        );


    // Open modal
    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".view-details-btn"
                );

            if (!button) return;


            const vehicleId =
                button.dataset.id;


            const vehicle =
                parkingData.find(
                    item =>
                        String(item.id) ===
                        String(vehicleId)
                );


            if (!vehicle) return;


            vehicleDetailsContent.innerHTML = `

                <div class="vehicle-detail-item">
                    <span>Vehicle Number</span>
                    <strong>
                        ${vehicle.vehicleNumber || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Owner Name</span>
                    <strong>
                        ${vehicle.ownerName || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Vehicle Type</span>
                    <strong>
                        ${vehicle.vehicleType || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Parking Slot</span>
                    <strong>
                        ${vehicle.slot || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Entry Time</span>
                    <strong>
                        ${vehicle.entryTime || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Exit Time</span>
                    <strong>
                        ${vehicle.exitTime || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Duration</span>
                    <strong>
                        ${vehicle.duration || "-"}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
                    <span>Parking Fee</span>
                    <strong>
                        ₹${vehicle.parkingFee || 0}
                    </strong>
                </div>

                <div class="vehicle-detail-item">
    <span>Status</span>

    <strong class="${
        vehicle.status === "Parked"
            ? "detail-status-parked"
            : "detail-status-completed"
    }">

        ${
            vehicle.status === "Parked"
                ? "🟢 Parked"
                : "✅ Completed"
        }

    </strong>
</div>

            `;


            vehicleDetailsModal.style.display =
                "flex";

        }
    );


    // Close modal
    function closeVehicleDetailsModal() {

        vehicleDetailsModal.style.display =
            "none";

    }


    closeVehicleModal.addEventListener(
        "click",
        closeVehicleDetailsModal
    );


    closeVehicleModalBottom.addEventListener(
        "click",
        closeVehicleDetailsModal
    );


    // Click outside modal
    vehicleDetailsModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                vehicleDetailsModal
            ) {

                closeVehicleDetailsModal();

            }

        }
    );

});
// =========================
// PRINT PARKING RECEIPT
// =========================

document.addEventListener("click", function (event) {

    if (
        !event.target.closest("#printReceiptBtn")
    ) {
        return;
    }

    const receiptContent =
        document.getElementById(
            "parkingReceiptContent"
        );

    if (!receiptContent) {
        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=600,height=700"
        );


    if (!printWindow) {
        alert(
            "Please allow pop-ups to print the receipt."
        );
        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Parking Receipt</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #111827;
                }

                .receipt-content {
                    max-width: 450px;
                    margin: auto;
                    border: 1px dashed #999;
                    padding: 25px;
                }

                .receipt-title {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .receipt-title h3 {
                    margin: 0;
                    font-size: 22px;
                }

                .receipt-title p {
                    color: #666;
                    font-size: 13px;
                }

                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 9px 0;
                    border-bottom: 1px solid #ddd;
                    font-size: 13px;
                }

                .receipt-status {
                    margin-top: 15px;
                    padding: 10px;
                    text-align: center;
                    background: #f0fdf4;
                    font-weight: bold;
                }

                .receipt-payment {
                    margin-top: 10px;
                    padding: 10px;
                    text-align: center;
                    background: #fff7ed;
                    font-weight: bold;
                }

            </style>

        </head>

        <body>

            ${receiptContent.innerHTML}

        </body>

        </html>

    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(function () {

        printWindow.print();

    }, 300);

});

// =========================
// CLOSE PARKING RECEIPT
// =========================

document.addEventListener("click", function (event) {

    // Cross button
    if (
        event.target.closest("#closeReceiptModal")
    ) {

        closeParkingReceipt();

        return;
    }


    // Close button
    if (
        event.target.closest("#closeReceiptBtn")
    ) {

        closeParkingReceipt();

        return;
    }

});


function closeParkingReceipt() {

    const receiptModal =
        document.getElementById(
            "parkingReceiptModal"
        );

    if (!receiptModal) {
        return;
    }


    receiptModal.style.display =
        "none";

}
function closeWelcomePopup() {
    const popup = document.getElementById("welcomePopup");

    popup.classList.add("hide");

    setTimeout(() => {
        popup.style.display = "none";
    }, 400);
}
/* ===== Scroll Reveal ===== */

const revealElements = document.querySelectorAll(
    "section, .card, .parking-card, .feature-card, .stat-card, .info-card, .content-card"
);

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                
                
                // Small delay so animation starts smoothly
                setTimeout(() => {
                    entry.target.classList.add("show");
                }, 50);

                // Ek baar animation ke baad dobara nahi chalega
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element) => {
    // Login aur popup ko scroll animation se exclude karo
    if (
        !element.closest(".login-screen") &&
        !element.closest(".welcome-overlay")
    ) {
        element.classList.add("scroll-reveal");
        revealObserver.observe(element);
    }
});
/* ===== Statistics Number Animation ===== */

const statsSection = document.querySelector(".stats");
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {

    if (entries[0].isIntersecting && !statsAnimated) {

        statsAnimated = true;

        document.querySelectorAll(".counter").forEach(counter => {

            const target = parseInt(counter.dataset.target);
            let current = 0;

            const duration = 1000;
            const steps = 40;
            const increment = target / steps;
            const interval = duration / steps;

            const timer = setInterval(() => {

                current += increment;

                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }

            }, interval);

        });

        statsObserver.disconnect();
    }

}, {
    threshold: 0.3
});

if (statsSection) {
    statsObserver.observe(statsSection);
}
// =========================
// INITIALIZE DATABASE DATA
// =========================

loadParkingData();
// =========================
// AUTO SYNC DATABASE
// =========================
// =========================
// AUTO SYNC FROM MYSQL
// =========================

setInterval(async () => {
    try {
        const savedUser = localStorage.getItem("parkEaseUser");

        if (!savedUser) return;

        const currentUser = JSON.parse(savedUser);

        const response = await fetch(
            `${API_BASE_URL}/api/parking?user_id=${currentUser.id}`
        );

        const result = await response.json();

        if (!result.success) return;

        parkingData = (result.data || []).map(vehicle => ({
            id: vehicle.id,
            receiptId: vehicle.receipt_id,
            vehicleNumber: vehicle.vehicle_number,
            ownerName: vehicle.owner_name,
            vehicleType: vehicle.vehicle_type,
            slot: vehicle.slot,
            entryTime: vehicle.entry_time,
            exitTime: vehicle.exit_time,
            duration: vehicle.duration,
            parkingFee: vehicle.parking_fee,
            status: vehicle.status
        }));

        // Screen update only
        displaySlots();
        displayRecentParking();
        updateStats();
        displayHistory();

    } catch (error) {
        console.error("Auto sync error:", error);
    }
}, 5000);
