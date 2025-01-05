require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

// Import and initialize the MongoDB connection
require("./db")

const PORT = process.env.PORT || 3000;
const app = express()

app.use(cors());
app.use(bodyParser.json());

const geocodeRoutes = require('./routes/geocode')
app.use('/api/v1', geocodeRoutes)

app.get('/', (req, res) => {
    res.send("hello World")
})

app.listen(PORT, () => {
    console.log(`Server listening at: ${PORT}`)
}) 