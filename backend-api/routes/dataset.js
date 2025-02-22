const axios = require("axios")
const express = require("express");
const router = express();
const fetchAndProcessData = require('../etl/fetchAndProcessData');
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // TTL = 1 hour (3600 seconds)
const {trackApiUsage} = require('../middleware/trackApiUsage')

// Load your API key from environment variables for security
const API_KEY = process.env.UK_PROPERTY_DATA_KEY; // Ensure this is set in your environment variables
const BASE_URL = 'https://api.propertydata.co.uk/prices';

/**
 * GET /api/datasets
 * Fetch a list of available datasets from the UK Land Registry API.
 */
router.get('/datasets', async (req, res) => {
    try {
      // Make a GET request to the datasets endpoint
      const response = await axios.get(`${BASE_URL}/datasets`, {
        headers: {
          'Authorization': API_KEY,
          'Accept': 'application/json'
        }
      });
      // Return the datasets to the client
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error.message);
      res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  });

/**
 * GET /api/datasets/:datasetName
 * Fetch metadata for a specific dataset (e.g., 'ccod').
 */
router.get('/datasets/:datasetName', async (req, res) => {
    try {
      const datasetName = req.params.datasetName;
      const response = await axios.get(`${BASE_URL}/datasets/${datasetName}`, {
        headers: {
          'Authorization': API_KEY,
          'Accept': 'application/json'
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error(`Error fetching metadata for ${req.params.datasetName}:`, error.message);
      res.status(500).json({ error: 'Failed to fetch dataset metadata' });
    }
  });

/**
 * POST endpoint to fetch and process property data.
 * Expects JSON body with 'datasetName' and 'fileName'.
 */
router.post('/fetch-data', fetchAndProcessData);

/**
 * GET /property-data
 * Fetch property data based on postcode and number of bedrooms.
 * Query parameters:
 *   - postcode: The postcode to search for (required)
 *   - bedrooms: The number of bedrooms (optional)
 *   - radius: The radius in which the search will encompass
 *   - minprice: minimum price filter
 *   - maxprice: maximum price filter
 */
router.get('/property-data/:postcode/:bedrooms/:radius/:minprice/:maxprice', async (req, res) => {
    const { postcode, bedrooms, radius, minprice, maxprice } = req.params;
  
    // Validate required parameters
    if (!postcode || !bedrooms || !radius || !minprice || !maxprice) {
      return res.status(400).json({ error: 'All parameters are required' });
    }
  
    const cacheKey = `${postcode}-${bedrooms}-${radius}-${minprice}-${maxprice}`;
  
    // Check cache first
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return res.status(304).json(cachedData); // Return the cached data
    }
  
    try {
      // Construct the API URL with query parameters
      let apiUrl = `${BASE_URL}?key=${API_KEY}&postcode=${encodeURIComponent(postcode)}&radius=${encodeURIComponent(radius)}&minprice=${encodeURIComponent(minprice)}&maxprice=${encodeURIComponent(maxprice)}`;
  
      if (bedrooms) {
        apiUrl += `&bedrooms=${encodeURIComponent(bedrooms)}`;
      }
  
      // Make the API request
      const response = await axios.get(apiUrl);
  
      // Check if the API response indicates success
      if (response.data.status === 'success') {
        // Cache the response for subsequent requests
        myCache.set(cacheKey, response.data);
  
        // Send the data back to the client
        res.json(response.data);
      } else {
        // Handle API errors
        res.status(500).json({ error: 'Failed to fetch property data' });
      }
    } catch (error) {
      // Handle request errors
      console.error('Error fetching property data:', error.message);
      res.status(500).json({ error: 'An error occurred while fetching property data' });
    }
  });

module.exports = router;

