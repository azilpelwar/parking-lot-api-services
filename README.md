## Requirements

- [Node.js](http://nodejs.org/)

- MongoDB

## Project Details
The office basement has a parking lot of 120 car parking space capacity out of which 20% is reserved for differently-abled and pregnant womensince its closest to the lift.
Reserving a parking space has become a tedious job and consumes a good amount of time, hence management has decided toautomate it based on a first come first serve basis with the following features.

### Requirements:
- Users can book a parking space 15 mins prior to arrival, in which he will get a parking number.
- If the user fails to reach in 30 mins then the allotted space again goes for rebooking (15 mins extra wait time).
- If Reserved space is occupied completely then the reserved users will be allotted general parking space.
- If 50% capacity is utilized, then 15 mins extra wait time will be eliminated (for both reserved and general).
- If there is a clash for the general use and reserved for a general parking spot than the reserved user will be a priority.

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
