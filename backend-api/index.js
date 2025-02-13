const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const cors = require('cors')

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
// Import and initialize the MongoDB connection
require("./db")

console.log(envFile)

const PORT = process.env.PORT || 3000;
const app = express()

// Middleware
const corsOptions = {
    origin: process.env.FRONT_END, // Replace with your frontend's origin
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'], // Headers needed by your app and Stripe
    credentials: true,  // Allow cookies and credentials
  };

app.use(cors(corsOptions));
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.options('*', cors(corsOptions)); // Handle preflight requests

const geocodeRoutes = require('./routes/geocode')
const authRoutes = require('./routes/authentication')
const paymentRoutes = require('./routes/payment')
const userRoutes = require('./routes/users')
const apiRoutes = require('./routes/apiusage')

app.use("/api/v1", geocodeRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/users", userRoutes)
app.use("/api/usage", apiRoutes)

app.listen(PORT, () => {
    console.log(`Server listening at: ${PORT}`)
}) 