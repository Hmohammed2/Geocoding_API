require('dotenv').config();
const axios = require('axios');
const express = require('express');
const Geocode = require('../models/Geocode')
const crypto = require('crypto')

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const router = express.Router()

/**
 * Geocode an address to get its coordinates.
 */
router.post('/geocode', async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Address is required.' });
    }

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Google API key not configured.' });
    }

    try {
        // Step 1: Normalize the address and create a hash
        const formattedAddress = address.trim().toLowerCase(); // Normalize the address
        const addressHash = crypto.createHash('sha256').update(formattedAddress).digest('hex');
        // step 2 check if the address already exists within the database
        const cachedResult = await Geocode.findOne({ addressHash })

        if (cachedResult) {
            return res.status(200).json({
                message: 'Address found in database!',
                address: cachedResult.address,
                latitude: cachedResult.latitude,
                longitude: cachedResult.longitude,
            })
        }

        // step 3 if not in database then pull from external api
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios.get(url, {
            params: { address, key: GOOGLE_API_KEY },
        });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(400).json({ error: 'No results found for the given address.' });
        }

        if (response.data.status !== 'OK') {
            return res.status(400).json({ error: `Geocoding failed: ${response.data.status}` });
        }

        const location = response.data.results[0].geometry.location;

        const newGeocode = new Geocode({
            address: response.data.results[0].formatted_address,
            addressHash,
            latitude: location.lat,
            longitude: location.lng,
        })
        await newGeocode.save()

        return res.status(200).json({
            message: 'Address found in external API',
            address: newGeocode.address,
            latitude: newGeocode.latitude,
            longitude: newGeocode.longitude,
        });

    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            const existingResult = await Geocode.findOne({ addressHash });
            return res.status(409).json({
                message: 'Address already exists in the database',
                address: existingResult.address,
                latitude: existingResult.latitude,
                longitude: existingResult.longitude,
            });
        }
        console.log(error)
        return res.status(500).json({ error: 'Server error. Please try again later.' });

    }

})
/**
 * Reverse geocode coordinates to get the address.
 */
router.post('/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Google API key not configured.' });
    }

    try {
        // Step 1: Check the database for cached results
        const cachedResult = await Geocode.findOne({ latitude: lat, longitude: lng });

        if (cachedResult) {
            return res.status(200).json({
                message: 'Coordinates found in database',
                address: cachedResult.address,
            });
        }
        // Step 2: If not in database, fetch from external API
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios.get(url, {
            params: { latlng: `${lat},${lng}`, key: GOOGLE_API_KEY },
        });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(400).json({ error: 'No results found for the given coordinates.' });
        }

        if (response.data.status !== 'OK') {
            return res.status(400).json({ error: `Reverse Geocoding failed: ${response.data.status}` });
        }

        const address = response.data.results[0].formatted_address;

        // Step 3: Save the result to the database
        const newGeocode = new Geocode({
            address,
            latitude: lat,
            longitude: lng,
        });

        await newGeocode.save();

        return res.status(200).json({
            message: 'Coordinates fetched from external API',
            address: newGeocode.address,
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

router.get('/data', async (req, res) => {
    try {
        const allData = await Geocode.find({});
        res.json(allData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Geocode.findByIdAndDelete(id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Entry deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;
