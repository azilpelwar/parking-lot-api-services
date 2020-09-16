const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const isEmpty = require("lodash/isEmpty");
require("dotenv").config();
const ObjectID = mongodb.ObjectID;
const { MONGODB_URI, USERS_COLLECTION, SLOTS_COLLECTION } = process.env;
const { user_sign_up, user_sign_in } = require("./schemas");
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
      db.collection(USERS_COLLECTION).insertOne(newUser, (err, doc) => {
        if (err) {
          handleError(res, err.message, "Failed to create new user.");
        } else {
          res.status(201).json(doc.ops[0].ObjectID);
        }
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
      db.collection(USERS_COLLECTION).findOne(
        { userName: User.userName, Password: User.Password },
        (err, doc) => {
          if (err) {
            handleError(res, err.message, "Invalid crdentials.");
          } else {
            if(doc != null){
              res.status(201).json(doc._id);
            }
            else{
              handleError(res, "Invalid crentials", "Invalid crdentials.");
            }
            
          }
        }
      );
    }
  } catch (e) {
    handleError(res, e, "Something went wrong");
  }
});

/*  "/parking/occupied"
 *    GET: finds all occupied parking slots
 *
 *  "/parking/free"
 *    GET: finds all free parking slots
 *
 *  "/parking/check-in"
 *    POST: Checks in a parking slot
 */

 