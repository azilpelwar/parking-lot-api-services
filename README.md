## Requirements

- [Node.js](http://nodejs.org/)

- MongoDB

## Installation

- Update the environment variables in .env file
    - MONGODB_URI
    - USERS_COLLECTION
    - SLOTS_COLLECTION

- Run the following command:
```sh
node generate_parking_spots.js
```

## MongoDB Databases:

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

### GET /user
    - finds all registered users

### POST /user/signup
    - Register a user

### POST /user/signin
    - Signin a user

### POST /parking/book
    - Provides the parking slot for user

### GET /parking/occupied
    - Finds all occupied parking slots

### GET /parking/free
    - finds all free parking slots

### POST /parking/check-in
    - Checks in a parking slot with parking ID

### POST /parking/check-out
    - Check out a parking with parking ID
