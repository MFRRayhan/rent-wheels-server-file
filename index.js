const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");

// index.js
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ===================== FIREBASE TOKEN MIDDLEWARE =====================
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

// ===================== MAIN SERVER FUNCTION =====================
async function run() {
  try {
    await client.connect();
    const db = client.db("rentWheelsDB");

    const usersCollection = db.collection("users");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

    // ===================== USERS =====================
    app.get("/users", verifyFireBaseToken, async (req, res) => {
      const requesterEmail = req.token_email;
      const requester = await usersCollection.findOne({
        email: requesterEmail,
      });

      if (!requester || requester.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const existingUser = await usersCollection.findOne({
        email: newUser.email,
      });
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // ===================== CARS =====================
    app.get("/cars", async (req, res) => {
      const email = req.query.email;
      const query = email ? { providerEmail: email } : {};
      const cars = await carsCollection
        .find(query)
        .sort({ postedAt: 1 })
        .toArray();
      res.send(cars);
    });

    // GET featured cars (latest 6 by postedAt descending)
    app.get("/featured-cars", async (req, res) => {
      const cars = await carsCollection
        .find()
        .sort({ postedAt: 1 })
        .limit(6)
        .toArray();
      res.send(cars);
    });

    // GET single car by id
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const car = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.send(car);
    });

    // POST new car (protected)
    app.post("/cars", verifyFireBaseToken, async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });

    // PATCH update car
    app.patch("/cars/:id", verifyFireBaseToken, async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      try {
        const result = await carsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        if (result.modifiedCount === 0)
          return res
            .status(404)
            .send({ message: "Car not found or no change" });
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // DELETE car (protected)
    app.delete("/cars/:id", verifyFireBaseToken, async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ success: result.deletedCount > 0 });
    });

    // GET cars by provider email
    app.get("/cars/provider/:email", async (req, res) => {
      const email = req.params.email;
      const cars = await carsCollection
        .find({ providerEmail: email })
        .toArray();
      res.send(cars);
    });

    // ===================== BOOKINGS =====================
    // GET bookings (protected - user or provider)
    app.get("/bookings", verifyFireBaseToken, async (req, res) => {
      const email = req.query.email;
      if (!email || email !== req.token_email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { $or: [{ providerEmail: email }, { userEmail: email }] };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    // POST new booking (protected)
    app.post("/bookings", verifyFireBaseToken, async (req, res) => {
      const newBooking = req.body;
      // ensure user can only book for themselves
      if (newBooking.userEmail !== req.token_email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await bookingsCollection.insertOne(newBooking);
      res.send(result);
    });

    // DELETE booking by id
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookingsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send({ success: result.deletedCount > 0 });
    });

    // GET bookings by car (sorted by rentPrice descending)
    app.get("/cars/bookings/:productId", async (req, res) => {
      const productId = req.params.productId;
      const bookings = await bookingsCollection
        .find({ product: productId })
        .sort({ rentPrice: -1 })
        .toArray();
      res.send(bookings);
    });

    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

// Default Route
app.get("/", (req, res) => res.send("Rent Wheels server is running"));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
