const mongoose = require('mongoose');

const geocodeSchema = new mongoose.Schema({
    addressHash: { type: String, required: true, unique: true },
    address: {
        type: String,
        required: true,
        unique: true, // Ensure each address is stored only once
        index: true
    },
    latitude: {
        type: Number,
        required: true,
        index: true
    },
    longitude: {
        type: Number,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now, // Track when the data was added
    },
});

module.exports = mongoose.model('Geocode', geocodeSchema);
