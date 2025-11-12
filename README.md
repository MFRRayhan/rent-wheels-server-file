# Rent Wheels Server

This is the **backend server** for the _Rent Wheels_ car rental application.
It handles user authentication, car listings, and booking management using **Node.js**, **Express**, **MongoDB**, and **Firebase Authentication**.

---

## 🚀 Features

- Firebase Authentication Integration for secure API access
- Role‑based Access Control (Admin and regular users)
- CRUD operations for Cars (Add, update, delete, and list cars)
- Car Booking System (Create, fetch, and cancel bookings)
- Token verification middleware using Firebase Admin SDK
- Easy to deploy on a Node.js supported hosting

---

## 🛠️ Tech Stack

| Technology         | Description                              |
| ------------------ | ---------------------------------------- |
| Node.js            | JavaScript runtime                       |
| Express.js         | Web framework                            |
| MongoDB            | NoSQL database                           |
| Firebase Admin SDK | Authentication & token verification      |
| dotenv             | Manage environment variables             |
| CORS               | Cross‑Origin Resource Sharing middleware |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory containing:

```
PORT=3000
MONGO_URI=your_mongo_connection_string
```

Also include your Firebase service account credentials file `serviceAccountKey.json`.

---

## 📦 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/MFRRayhan/rent-wheels-server-file.git

# 2. Navigate into project folder
cd rent-wheels-server-file

# 3. Install dependencies
npm install

# 4. Add `.env` and `serviceAccountKey.json`

# 5. Start the server
npm start
```

Server will run at:

```
http://localhost:3000
```

---

## 🔑 Authentication Middleware

```js
const verifyFireBaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    return res.status(401).send({ message: "unauthorized access" });

  const token = authorization.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};
```

---

## 🧭 API Endpoints Overview

### Users

- `GET /users` ‑ Get all users (admin only)
- `POST /users` ‑ Add a new user

### Cars

- `GET /cars` ‑ Get all cars, optional query ?email=providerEmail
- `GET /featured-cars` ‑ Get latest 6 cars
- `GET /cars/:id` ‑ Get a single car by ID
- `POST /cars` ‑ Add new car (protected)
- `PATCH /cars/:id` ‑ Update car info
- `DELETE /cars/:id` ‑ Delete a car
- `GET /cars/provider/:email` ‑ Get cars by provider email

### Bookings

- `GET /bookings?email=userEmail` ‑ Get bookings for user or provider (protected)
- `POST /bookings` ‑ Create a new booking
- `DELETE /bookings/:id` ‑ Delete booking by ID
- `GET /cars/bookings/:productId` ‑ Get bookings for a specific car

---

## 🧠 Error Handling

- `401 Unauthorized` – Token missing or invalid
- `403 Forbidden` – User not authorized for requested resource
- `500 Internal Server Error` – Unexpected server error

---

## 🧩 Project Structure

```
rent-wheels-server/
│
├── serviceAccountKey.json     # Firebase credentials
├── .env                       # Environment variables
├── server.js                  # Main server file
├── package.json               # Dependencies and scripts
└── README.md                  # (this file)
```

---
