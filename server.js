const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const isEmpty = require("lodash/isEmpty");

require("dotenv").config();
const ObjectID = mongodb.ObjectID;
const { MONGODB_URI, USERS_COLLECTION, SLOTS_COLLECTION } = process.env;
const {
  user_sign_up,
  user_sign_in,
  parking_book,
  check_in,
  check_out,
} = require("./schemas");
const app = express();

app.use(bodyParser.json());

// Database connection variable
let db = "";

// Connection to the database

mongoConn = mongodb.MongoClient.connect(MONGODB_URI, (err, database) => {
  if (err) {
    console.log("Error connecting to DB:", err);
    process.exit(1);
  }
  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ error: reason });
}

/*  "/user"
 *    GET: finds all registered users
 *
 *  "/user/signup"
 *    POST: Register a user
 *
 *  "/user/signin"
 *    POST: Signin a user
 */

app.get("/user", (req, res) => {
  try {
    db.collection(USERS_COLLECTION)
      .find({})
      .project({
        _id: 0,
        Password: 0,
        createDate: 0,
      })
      .toArray(function (err, docs) {
        if (err) {
          handleError(res, err.message, "Failed to fetch users.");
        } else {
          res.status(200).json(docs);
        }
      });
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.post("/user/signup", (req, res) => {
  try {
    const newUser = req.body;
    newUser.createDate = new Date();

    const { error: joiError } = user_sign_up.validate(newUser);

    if (!isEmpty(joiError)) {
      handleError(res, joiError, 400);
    } else {
      db.collection(USERS_COLLECTION)
        .insertOne(newUser)
        .then((doc) => {
          res.status(201).json({ success: "User successfully created" });
        })
        .catch((err) => {
          handleError(res, err.message, "Failed to create new user.");
        });
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.post("/user/signin", (req, res) => {
  try {
    const User = req.body;

    const { error: joiError } = user_sign_in.validate(User);

    // {  userName: , Password:  }
    if (!isEmpty(joiError)) {
      handleError(res, joiError, 400);
    } else {
      db.collection(USERS_COLLECTION)
        .findOne({ userName: User.userName, Password: User.Password })
        .then((doc) => {
          if (doc != null) {
            res.status(201).json({ id: doc._id });
          } else {
            handleError(res, "Invalid crentials", "Invalid crdentials.");
          }
        })
        .catch((err) => {
          handleError(res, err.message, "Invalid crdentials.");
        });
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

/*  "/parking/book"
 *  POST: Provides the parking slot for user
 *
 *  "/parking/occupied"
 *    GET: finds all occupied parking slots
 *
 *  "/parking/free"
 *    GET: finds all free parking slots
 *
 *  "/parking/check-in"
 *    POST: Checks in a parking slot with parking ID
 *
 *  "/parking/check-out"
 *    POST: Check out a parking with parking ID
 */

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

app.post("/parking/book", (req, res) => {
  try {
    const userId = req.body;

    const { error: joiError } = parking_book.validate(userId);
    if (!isEmpty(joiError)) {
      handleError(res, joiError, 400);
    } else {
      db.collection(USERS_COLLECTION)
        .findOne({ _id: ObjectID(userId.userId) })
        .then((user) => {
          if (user != null) {
            let arrivalTimeIn = 30;
            db.collection(SLOTS_COLLECTION)
              .count({ occupied: true })
              .then((occupiedCount) => {
                // Checking the parking lot occupancy
                if (occupiedCount >= 60) {
                  arrivalTimeIn = 15;
                }
                if (user.reservedParking) {
                  const currentTime = new Date();
                  //Find the reserved slot for user
                  db.collection(SLOTS_COLLECTION)
                    .findOne({
                      reserveBy: { $lt: currentTime },
                      occupied: false,
                      reservedParking: true,
                    })
                    .then((spot) => {
                      if (spot) {
                        //Found reserved spot
                        let spotAssigned = spot;
                        spotAssigned.assignedUser = ObjectID(user._id);
                        spotAssigned.reserveBy = addMinutes(
                          new Date(),
                          arrivalTimeIn
                        );
                        spotAssigned.occupied = false;
                        db.collection(SLOTS_COLLECTION)
                          .updateOne({ spotId: spot.spotId }, spotAssigned)
                          .then((doc) => {
                            res.status(201).json(spotAssigned);
                          })
                          .catch((err) => {
                            handleError(
                              res,
                              err.message,
                              "Internal server error"
                            );
                          });
                      } else {
                        // Did not find reserved parking
                        // Find general parking
                        db.collection(SLOTS_COLLECTION)
                          .findOne({
                            reserveBy: { $lt: currentTime },
                            occupied: false,
                            reservedParking: false,
                          })
                          .then((spot) => {
                            if (spot == null) {
                              handleError(res, "Sorry! Parking is Full", 400);
                            }
                            let spotAssigned = spot;
                            spotAssigned.assignedUser = ObjectID(user._id);
                            spotAssigned.reserveBy = addMinutes(
                              new Date(),
                              arrivalTimeIn
                            );
                            spotAssigned.occupied = false;
                            db.collection(SLOTS_COLLECTION)
                              .updateOne({ spotId: spot.spotId }, spotAssigned)
                              .then((doc) => {
                                res.status(201).json({
                                  spotId: spotAssigned.spotId,
                                  reserveBy: spotAssigned.reserveBy,
                                  reservedParking: spotAssigned.reservedParking,
                                });
                              });
                          })
                          .catch((err) => {
                            handleError(
                              res,
                              err.message,
                              "Internal server error"
                            );
                          });
                      }
                    })
                    .catch((err) => {
                      handleError(res, err.message, "Internal server error");
                    });
                } else {
                  //General parkings
                  const currentTime = new Date();
                  //Find the general slot for user
                  db.collection(SLOTS_COLLECTION)
                    .findOne({
                      reserveBy: { $lt: currentTime },
                      occupied: false,
                      reservedParking: false,
                    })
                    .then((spot) => {
                      if (spot == null) {
                        handleError(res, "Sorry! Parking is Full", 400);
                      }
                      let spotAssigned = spot;
                      spotAssigned.assignedUser = ObjectID(user._id);
                      spotAssigned.reserveBy = addMinutes(
                        new Date(),
                        arrivalTimeIn
                      );
                      spotAssigned.occupied = false;
                      db.collection(SLOTS_COLLECTION)
                        .updateOne({ spotId: spot.spotId }, spotAssigned)
                        .then((doc) => {
                          res.status(201).json({
                            spotId: spotAssigned.spotId,
                            reserveBy: spotAssigned.reserveBy,
                            reservedParking: spotAssigned.reservedParking,
                          });
                        });
                    })
                    .catch((err) => {
                      handleError(res, err.message, "Internal server error");
                    });
                }
              });
          }
        });
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.post("/parking/check-in", (req, res) => {
  try {
    const userCheckin = req.body;

    const { error: joiError } = check_in.validate(userCheckin);
    if (!isEmpty(joiError)) {
      handleError(res, joiError, 400);
    } else {
      const currentTime = new Date();
      db.collection(USERS_COLLECTION)
        .findOne({ _id: ObjectID(userCheckin.userId) })
        .then((user) => {
          if (user != null) {
            db.collection(SLOTS_COLLECTION)
              .findOne({
                assignedUser: ObjectID(userCheckin.userId),
                reserveBy: { $gt: currentTime },
                occupied: false,
              })
              .then((spot) => {
                if (spot == null) {
                  handleError(
                    res,
                    "Your parking time expired or booking not found",
                    400
                  );
                } else {
                  db.collection(SLOTS_COLLECTION)
                    .updateOne(
                      { spotId: spot.spotId },
                      {
                        $set: {
                          checkInTime: new Date(),
                          occupied: true,
                        },
                      }
                    )
                    .then((doc) => {
                      res.status(201).json({
                        success: "Check In successful",
                        spotId: spot.spotId,
                      });
                    });
                }
              });
          }
        });
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.post("/parking/check-out", (req, res) => {
  try {
    const userCheckout = req.body;

    const { error: joiError } = check_out.validate(userCheckout);
    if (!isEmpty(joiError)) {
      handleError(res, joiError, 400);
    } else {
      db.collection(USERS_COLLECTION)
        .findOne({ _id: ObjectID(userCheckout.userId) })
        .then((user) => {
          db.collection(SLOTS_COLLECTION)
            .updateOne(
              {
                spotId: userCheckout.spotId,
                assignedUser: ObjectID(userCheckout.userId),
              },
              {
                $set: {
                  assignedUser: "",
                  reserveBy: new Date(0),
                  checkInTime: new Date(0),
                  occupied: false,
                },
              }
            )
            .then((doc) => {
              if (doc.modifiedCount > 0) {
                res.status(201).json({ success: "Check out successful" });
              } else {
                handleError(
                  res,
                  "Invalid parking number for User or spot already checked out",
                  400
                );
              }
            });
        });
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.get("/parking/occupied", (req, res) => {
  try {
    const currentTime = new Date();
    db.collection(SLOTS_COLLECTION)
      .find({ occupied: true })
      .project({ spotId: 1, _id: 0 })
      .toArray(function (err, docs) {
        if (err) {
          handleError(res, err.message, "Failed to fetch occupied parking.");
        } else {
          res.status(200).json(docs);
        }
      });
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

app.get("/parking/free", (req, res) => {
  try {
    const currentTime = new Date();
    db.collection(SLOTS_COLLECTION)
      .find({ occupied: false, reserveBy: { $lt: currentTime } })
      .project({ spotId: 1, _id: 0 })
      .toArray(function (err, docs) {
        if (err) {
          handleError(res, err.message, "Failed to fetch free parking slot.");
        } else {
          res.status(200).json(docs);
        }
      });
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});
