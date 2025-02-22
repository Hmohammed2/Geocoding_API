const fs = require('fs');
const unzipper = require('unzipper');
const csvParser = require('csv-parser');
const transformRecord = require("./transform")
const Property = require("../models/Property")

// Load your API key from environment variables for security
const API_KEY = process.env.UK_DATA_API_KEY; // e.g., set UK_DATA_API_KEY in your .env file
const BASE_URL = "https://use-land-property-data.service.gov.uk/api/v1"

/**
 * Downloads a dataset file from the Use Land and Property Data API.
 * @param {string} datasetName - The dataset name (e.g., "ccod").
 * @param {string} fileName - The specific file name to download (e.g., "CCOD_FULL_2025_02.zip").
 */
async function downloadDatasetFile(datasetName, fileName) {
  try {
    // Construct the endpoint URL to get the temporary download URL
    const endpoint = `${BASE_URL}/datasets/${datasetName}/${fileName}`;
    const metaResponse = await axios.get(endpoint, {
      headers: {
        'Authorization': API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (metaResponse.data && metaResponse.data.result && metaResponse.data.result.download_url) {
      const downloadUrl = metaResponse.data.result.download_url;
      console.log('Temporary Download URL:', downloadUrl);
      
      // Now, use the download URL to fetch the file
      const fileResponse = await axios.get(downloadUrl, { responseType: 'stream' });
      
      // Save the file to the local filesystem
      const writer = fs.createWriteStream(fileName);
      fileResponse.data.pipe(writer);
      
      // Return a promise that resolves when the file is completely written
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log('File downloaded successfully.');
          resolve();
        });
        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          reject(err);
        });
      });
    } else {
      console.error('Download URL not found in the response.');
    }
  } catch (error) {
    console.error('Error downloading dataset file:', error.message);
  }
}

/**
 * Function to extract and parse CSV files from a ZIP archive
 * @param {string} zipFilePath - The zip filePath that we will be parsing from.
 */
function parseAndStoreZip(zipFilePath) {
  fs.createReadStream(zipFilePath)
    .pipe(unzipper.Parse())
    .on('entry', (entry) => {
      const fileName = entry.path;
      if (entry.type === 'File' && fileName.endsWith('.csv')) {
        console.log(`Processing CSV file: ${fileName}`);
        entry.pipe(csvParser())
          .on('data', async (data) => {
            try {
              const transformed = transformRecord(data);
              const property = new Property(transformed);
              await property.save();
              console.log(`Saved property at: ${transformed.propertyAddress}`);
            } catch (err) {
              console.error('Error saving record:', err);
            }
          })
          .on('end', () => {
            console.log(`Finished processing ${fileName}`);
          });
      } else {
        entry.autodrain();
      }
    })
    .on('error', (err) => {
      console.error('Error reading ZIP file:', err);
    });
}


module.exports = { parseAndStoreZip, downloadDatasetFile }
