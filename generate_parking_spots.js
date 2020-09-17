const mongodb = require("mongodb");
require("dotenv").config();
const ObjectID = mongodb.ObjectID;

const { MONGODB_URI, SLOTS_COLLECTION } = process.env;
let db = "";
mongoConn = mongodb.MongoClient.connect(MONGODB_URI, (err, database) => {
  if (err) {
    console.log("Error connecting to DB:", err);
    process.exit(1);
  }
  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
  const reservedParkingSpots = [
    7,
    8,
    9,
    10,
    11,
    12,
    21,
    26,
    27,
    28,
    38,
    39,
    40,
    41,
    42,
    77,
    79,
    80,
    81,
    82,
    89,
    90,
    91,
    115,
  ];
  for (spotId = 1; spotId <= 120; spotId++) {
    let parkingSpot = {
      spotId: spotId,
      assignedUser: "",   // If this is empty, this is free spot
      occupied: false,   // whether the user has checked-in or not
      reserveBy: new Date(0), // expiry time for check-in
      checkInTime: new Date(0),
      reservedParking: false,
    };
    if (reservedParkingSpots.includes(spotId)) {
      parkingSpot.reservedParking = true;
    }

    db.collection(SLOTS_COLLECTION).insertOne(parkingSpot, (err, doc) => {
      if (err) {
        console.log("Error adding parking spot");
      } else {
        console.log("Added parking spotId.");
      }
    });
  }
  db.close();
});
