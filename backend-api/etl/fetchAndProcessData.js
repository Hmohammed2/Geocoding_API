const path = require('path');
const { downloadDatasetFile, parseAndStoreZip } = require('./parseZipFile');

/**
 * Controller to handle the download and processing of property data.
 */
async function fetchAndProcessData(req, res) {
    const { datasetName, fileName } = req.body;
  
    if (!datasetName || !fileName) {
      return res.status(400).json({ error: 'datasetName and fileName are required.' });
    }
  
    const filePath = path.join(__dirname, '..', 'downloads', fileName);
  
    try {
      await downloadDatasetFile(datasetName, filePath);
      const results = await parseAndStoreZip(filePath);
      res.status(200).json({ message: 'Data processed successfully.', data: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
module.exports = fetchAndProcessData