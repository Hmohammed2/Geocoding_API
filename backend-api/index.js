const dotenv = require('dotenv')
const express = require('express')
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
    credentials: true,              // Allow cookies and credentials
  };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

const geocodeRoutes = require('./routes/geocode')
const authRoutes = require('./routes/authentication')
const paymentRoutes = require('./routes/payment')
const userRoutes = require('./routes/users')
const apiRoutes = require('./routes/apiusage')

app.use('/api/v1', geocodeRoutes)
app.use('/auth', authRoutes)
app.use("/payment", paymentRoutes)
app.use("/users", userRoutes)
app.use('/api', apiRoutes)

app.listen(PORT, () => {
    console.log(`Server listening at: ${PORT}`)
}) 