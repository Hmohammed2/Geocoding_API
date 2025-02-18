const axios = require('axios');
const express = require('express');
const Geocode = require('../models/Geocode')
const fs = require('fs')
const path = require("path");
const crypto = require('crypto')
const ExcelJS = require('exceljs');
const multer = require('multer');
const csvParser = require('csv-parser');
const { trackApiUsage, trackBatchUsage } = require('../middleware/trackApiUsage')
const verifyApiKey = require("../middleware/verifyApiKey"); // Adjust the path as needed
const enforceApiLimit = require('../middleware/enforceApiLimit');
const checkProOrPremium = require("../middleware/checkProOrPremium")
const Papa = require('papaparse');

// Load the appropriate .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
require('dotenv').config({ path: envFile });  // Make sure this is at the very top

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const backendUrl = process.env.BACK_END
const router = express.Router()

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' });

// Middleware
router.use(express.json())
router.use(verifyApiKey)
router.use(enforceApiLimit)

/**
 * Geocode an address to get its coordinates.
 */
router.post('/geocode', trackApiUsage, async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Address is required.' });
    }

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Google API key not configured.' });
    }

    // Step 1: Normalize the address and create a hash
    const formattedAddress = address.trim().toLowerCase(); // Normalize the address
    addressHash = crypto.createHash('sha256').update(formattedAddress).digest('hex');

    console.log(formattedAddress, addressHash)

    try {
        // Step 2: Check if the address already exists in the database
        const cachedResult = await Geocode.findOne({ addressHash });

        if (cachedResult) {
            return res.status(200).json({
                message: 'Address found in database!',
                address: cachedResult.address,
                latitude: cachedResult.latitude,
                longitude: cachedResult.longitude,
            });
        }

        // Step 3: If not in the database, pull from external API
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

        console.log(response.data.results[0])

        // Step 4: Save the result to the database
        const newGeocode = new Geocode({
            address: response.data.results[0].formatted_address,
            addressHash,
            latitude: location.lat,
            longitude: location.lng,
        });

        await newGeocode.save();

        return res.status(200).json({
            message: 'Address found in external API',
            address: newGeocode.address,
            latitude: newGeocode.latitude,
            longitude: newGeocode.longitude,
        });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error, ensuring addressHash is defined
            try {
                const existingResult = await Geocode.findOne({ address });
                return res.status(409).json({
                    message: 'Address already exists in the database',
                    address: existingResult?.address,
                    latitude: existingResult?.latitude,
                    longitude: existingResult?.longitude,
                });
            } catch (findError) {
                console.error("Error finding existing result:", findError);
            }
        }

        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});
/**
 * Reverse geocode coordinates to get the address.
 */
router.post('/reverse-geocode', trackApiUsage, async (req, res) => {
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
        const addressHash = crypto.createHash('sha256').update(address).digest('hex');

        // Step 3: Save the result to the database
        const newGeocode = new Geocode({
            address,
            addressHash,
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
/**
 * Batch geocode coordinates to get the address. Supports excel workbooks
 */
router.post('/batch-geocode-excel', upload.single('file'), trackBatchUsage, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Excel file is required.' });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const sheet = workbook.worksheets[0];

        const headerRow = sheet.getRow(1);
        const headers = headerRow.values;
        const addressIndex = headers.indexOf("Address");
        const suburbIndex = headers.indexOf("Suburb");
        const stateIndex = headers.indexOf("State");
        const postcodeIndex = headers.indexOf("Postcode");

        if (addressIndex === -1) {
            return res.status(400).json({ error: "Invalid file format. 'Address' column is missing." });
        }

        let latIndex = headers.indexOf("Lat");
        let longIndex = headers.indexOf("Long");

        if (latIndex === -1) {
            latIndex = headers.length;
            headerRow.getCell(latIndex).value = "Lat";
        }
        if (longIndex === -1) {
            longIndex = headers.length + 1;
            headerRow.getCell(longIndex).value = "Long";
        }

        const useFullMapping = suburbIndex !== -1 && stateIndex !== -1 && postcodeIndex !== -1;
        let processedCount = 0;

        const geocodePromises = [];

        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            const addrValue = row.getCell(addressIndex).value;
            if (!addrValue) continue;

            let fullAddress = useFullMapping
                ? `${addrValue}, ${row.getCell(suburbIndex).value}, ${row.getCell(stateIndex).value} ${row.getCell(postcodeIndex).value}, Australia`
                : addrValue;

            const formattedAddress = fullAddress.trim().toLowerCase();
            const addressHash = crypto.createHash('sha256').update(formattedAddress).digest('hex');

            const processRow = async () => {
                try {
                    let geocodeData = await Geocode.findOne({ addressHash });

                    if (!geocodeData) {
                        const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
                            params: { address: fullAddress, key: process.env.GOOGLE_API_KEY },
                        });

                        if (!response.data.results?.length || response.data.status !== "OK") return;

                        const location = response.data.results[0].geometry.location;

                        geocodeData = await Geocode.findOneAndUpdate(
                            { addressHash }, // Search by address hash
                            {
                                $setOnInsert: {
                                    address: response.data.results[0].formatted_address,
                                    latitude: location.lat,
                                    longitude: location.lng,
                                },
                            },
                            { upsert: true, new: true, setDefaultsOnInsert: true }
                        );
                    }

                    row.getCell(latIndex).value = geocodeData.latitude;
                    row.getCell(longIndex).value = geocodeData.longitude;
                    processedCount++;
                } catch (error) {
                    console.error(`Error processing row ${i}:`, error);
                }
            };

            geocodePromises.push(processRow());
        }

        // Wait for all geocode operations to complete, even if some fail
        await Promise.allSettled(geocodePromises);

        const outputPath = path.join(__dirname, "../uploads", `geocoded_${Date.now()}.xlsx`);

        await workbook.xlsx.writeFile(outputPath);

        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting original file:", err);
        });

        req.processedCount = processedCount;

        return res.status(200).json({
            message: "Batch geocoding completed.",
            processedCount,
            download: `${backendUrl}/uploads/${path.basename(outputPath)}`,
        });

    } catch (error) {
        console.error("Error processing Excel file:", error);
        return res.status(500).json({ error: "Server error processing the file." });
    }
});

/**
 * Geocode an address to get the coordinates. Endpoint allows batch process via flat file upload
 */
router.post("/batch-geocode", upload.single("file"), trackBatchUsage, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "CSV file is required." });
    }

    const {
        addressColumn,
        suburbColumn,
        stateColumn,
        postcodeColumn,
    } = req.body;

    const rows = [];
    const errors = [];
    let processedCount = 0;

    // Read CSV File and store rows with BOM removal for header keys
    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csvParser({
                    mapHeaders: ({ header }) => header.replace(/^\ufeff/, '')
                }))
                .on("data", (row) => rows.push(row))
                .on("end", () => {
                    console.log("Parsed CSV Rows:", rows); // 👈 Debugging step
                    resolve();
                })
                .on("error", reject);
        });

        // Build geocoding promises
        const geocodePromises = rows.map(async (row) => {
            try {
                let address = "";

                if (suburbColumn && stateColumn && postcodeColumn) {
                    const addr = row[addressColumn];
                    const suburb = row[suburbColumn];
                    const state = row[stateColumn];
                    const postcode = row[postcodeColumn];

                    if (!addr || !suburb || !state || !postcode) {
                        errors.push({ row, error: "Missing one or more address components." });
                        return null;
                    }
                    address = `${addr}, ${suburb}, ${state} ${postcode}`;
                } else {
                    address = row[addressColumn]
                    if (!address) {
                        errors.push({ row, error: "Address is missing." });
                        return null;
                    }
                }

                // Remove BOM character if it exists
                address = address.replace(/^\ufeff/, '');  // Remove BOM character

                // Make the address case-insensitive and strip unwanted characters
                const formattedAddress = address
                    .trim()               // Remove leading/trailing spaces
                    .toLowerCase()        // Make the address lowercase
                    .replace(/[^a-z0-9\s,]/g, '');  // Remove all non-alphanumeric characters except space and comma

                const addressHash = crypto.createHash("sha256").update(formattedAddress).digest("hex");

                let geocodeData = await Geocode.findOne({ addressHash });

                if (!geocodeData) {
                    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
                        params: { address, key: process.env.GOOGLE_API_KEY },
                    });

                    if (!response.data.results || response.data.results.length === 0 || response.data.status !== "OK") {
                        errors.push({ address, error: `Geocoding failed: ${response.data.status}` });
                        return null;
                    }

                    const location = response.data.results[0].geometry.location;

                    geocodeData = await Geocode.findOneAndUpdate(
                        { addressHash }, // Search by address hash
                        {
                            $setOnInsert: {
                                address: response.data.results[0].formatted_address,
                                latitude: location.lat,
                                longitude: location.lng,
                            },
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                }

                processedCount++;
                return {
                    ...row,
                    latitude: geocodeData.latitude,
                    longitude: geocodeData.longitude,
                    status: geocodeData.status || "cached",
                };
            } catch (error) {
                errors.push({ row, error: "Error processing row." });
                console.error(error);
                return null;
            }
        });

        // Wait for all geocode operations to complete
        const results = (await Promise.all(geocodePromises)).filter(Boolean);

        // Save results as CSV file
        const outputPath = `uploads/geocoded_${Date.now()}.csv`;
        const csvData = Papa.unparse(results);
        fs.writeFileSync(outputPath, csvData);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Attach processed count to request (for API tracking)
        req.processedCount = processedCount;

        return res.status(errors.length > 0 ? 400 : 200).json({
            message: errors.length > 0 ? "Batch geocoding completed with errors." : "Batch geocoding completed successfully.",
            results,
            processedCount,
            errors,
            download: `${backendUrl}/${outputPath}`,
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return res.status(500).json({ error: "Server error processing the file." });
    }
});

/**
 * Geocode an address to get the coordinates. Endpoint allows batch process via json
 */
router.post('/batch-geocode-json', checkProOrPremium, trackApiUsage, async (req, res) => {
    const { addresses } = req.body; // Expecting an array of address strings

    if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ error: 'A non-empty array of addresses is required.' });
    }

    const processAddress = async (address) => {
        if (!address) return { address, error: 'Address is missing.' };

        const formattedAddress = address.trim().toLowerCase();
        const addressHash = crypto.createHash('sha256').update(formattedAddress).digest('hex');

        try {
            // Check if the address exists in the database
            const cachedResult = await Geocode.findOne({ addressHash });
            if (cachedResult) {
                return {
                    address: cachedResult.address,
                    latitude: cachedResult.latitude,
                    longitude: cachedResult.longitude,
                    status: 'cached',
                };
            }

            // Fetch from Google API if not in the database
            const url = `https://maps.googleapis.com/maps/api/geocode/json`;
            const response = await axios.get(url, {
                params: { address, key: GOOGLE_API_KEY },
            });

            if (!response.data.results || response.data.results.length === 0) {
                return { address, error: 'No results found.' };
            }

            if (response.data.status !== 'OK') {
                return { address, error: `Geocoding failed: ${response.data.status}` };
            }

            const location = response.data.results[0].geometry.location;

            // Save to database
            const newGeocode = new Geocode({
                address: response.data.results[0].formatted_address,
                addressHash,
                latitude: location.lat,
                longitude: location.lng,
            });
            await newGeocode.save();

            return {
                address: newGeocode.address,
                latitude: newGeocode.latitude,
                longitude: newGeocode.longitude,
                status: 'new',
            };
        } catch (error) {
            return { address, error: 'Server error during geocoding.' };
        }
    };

    try {
        // Run all address requests in parallel
        const results = await Promise.all(addresses.map(processAddress));

        return res.status(200).json({
            message: 'Batch geocoding completed.',
            results,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

/**
 * Get Points of Interest (POI) near a given location.
 * This endpoint accepts the following JSON body parameters:
 *   - lat: Latitude (required)
 *   - lng: Longitude (required)
 *   - radius: Search radius in meters (optional, default: 500)
 *   - type: Place type/category (optional, default: "restaurant")
 */
router.post('/poi', checkProOrPremium, trackApiUsage, async (req, res) => {
    const { lat, lng, radius, type } = req.body;

    // Validate required fields
    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    // Use default values if not provided
    const poiRadius = radius || 500; // default radius of 500 meters
    const poiType = type || "restaurant"; // default type

    // Check that the API key is available
    if (!GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: "Google API key not configured." });
    }

    const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

    try {
        // Call the Google Places API Nearby Search endpoint
        const response = await axios.get(url, {
            params: {
                location: `${lat},${lng}`,
                radius: poiRadius,
                type: poiType,
                key: GOOGLE_MAPS_API_KEY
            }
        });

        // Check the API response status
        if (response.data.status !== "OK") {
            return res.status(400).json({ 
                error: `POI search failed: ${response.data.status}`, 
                details: response.data.error_message 
            });
        }

        // Return the list of POIs to the client
        return res.status(200).json({
            message: "POI search completed.",
            results: response.data.results,
        });
    } catch (error) {
        console.error("Error fetching POIs:", error);
        return res.status(500).json({ error: "Server error during POI search." });
    }
});

module.exports = router;
