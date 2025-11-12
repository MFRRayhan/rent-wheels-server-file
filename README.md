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
