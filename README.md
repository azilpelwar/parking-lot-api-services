## Requirements

- [Node.js](http://nodejs.org/)

- MongoDB

## Installation

- Update the environment variables in .env file

MONGODB_URI
USERS_COLLECTION
SLOTS_COLLECTION

- Run the following command:

```sh
node generate_parking_spots.js
```

## MongoDB Database Design:

     - parking_slots
            - spotId
            - assignedUser
            - occupied
            - reserveBy
            - checkInTime
            - reservedParking
     - users
            - userName
            - Password
            - MobileNumber
            - Name
            - CarNo
            - reservedParking
            - createDate

## API Endpoints:

"/user"
GET: finds all registered users

"/user/signup"
POST: Register a user

"/user/signin"
POST: Signin a user

"/parking/book"
POST: Provides the parking slot for user

"/parking/occupied"
GET: finds all occupied parking slots

"/parking/free"
GET: finds all free parking slots

"/parking/check-in"
POST: Checks in a parking slot with parking ID

"/parking/check-out"
POST: Check out a parking with parking ID
