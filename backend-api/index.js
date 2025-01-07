require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

// Import and initialize the MongoDB connection
require("./db")

const PORT = process.env.PORT || 3000;
const app = express()

// Middleware
const corsOptions = {
    origin: process.env.FRONT_END, // Replace with your frontend's origin
    credentials: true,              // Allow cookies and credentials
  };

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.options('*', cors(corsOptions)); // Handle preflight requests

const geocodeRoutes = require('./routes/geocode')
const authRoutes = require('./routes/authentication')
const paymentRoutes = require('./routes/payment')

app.use('/api/v1', geocodeRoutes)
app.use('/auth', authRoutes)
app.use("/payment", paymentRoutes)

app.listen(PORT, () => {
    console.log(`Server listening at: ${PORT}`)
}) 