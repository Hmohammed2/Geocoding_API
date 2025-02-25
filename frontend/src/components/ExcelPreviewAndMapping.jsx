// src/components/ExcelPreviewAndMapping.jsx
import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import axios from "axios";
import { useAuth } from "./contexts/AuthContext";

const ExcelPreviewAndMapping = () => {
  // States to hold the file, parsed data, headers, and selected mappings
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);         // full data (array of rows)
  const [headers, setHeaders] = useState([]);     // header row
  const [selectedMapping, setSelectedMapping] = useState({
    address: "",
    suburb: "",
    state: "",
    postcode: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const { user } = useAuth()

  // Handle file upload and parse it using read-excel-file
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    // Parse the file—readXlsxFile returns a promise resolving to an array of rows.
    readXlsxFile(uploadedFile)
      .then((rows) => {
        setData(rows);
        if (rows.length > 0) {
          setHeaders(rows[0]); // Assume first row contains headers.
        }
      })
      .catch((error) => {
        console.error(error);
        setMessage("Error reading the file.");
      });
  };

  // Update mapping selections when user changes a dropdown
  const handleMappingChange = (field, value) => {
    setSelectedMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle submission: send the file and mapping selections to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the user has selected all required fields
    const { address, suburb, state, postcode } = selectedMapping;
    // Validate that the user has selected an address field
    if (!address) {
      setMessage("Please select a column for the address component.");
      return;
    }

    // Build FormData and include the mapping selections as extra fields.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("addressColumn", address);
    formData.append("suburbColumn", suburb);
    formData.append("stateColumn", state);
    formData.append("postcodeColumn", postcode);

    setLoading(true);
    setMessage("");
    setDownloadLink("");

    try {
      // Use axios to send the file and column mapping to the API endpoint
      const { data: resData } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batch-geocode-excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": user.apiKey
        },
      });
      setMessage("Batch geocoding completed!");
      setDownloadLink(resData.download); // assuming the backend returns a download URL
    } catch (error) {
      console.error("Error during batch geocoding:", error);
      setMessage("Error during batch geocoding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload & Preview Excel File</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />

      {headers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Data Preview (first 5 rows):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full mt-2 border-collapse">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="border px-4 py-2 text-left bg-gray-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((_, colIndex) => (
                      <td key={colIndex} className="border px-4 py-2">
                        {row[colIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mt-6">Select Columns for Geocoding</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block font-medium">Address*</label>
              <select
                value={selectedMapping.address}
                onChange={(e) => handleMappingChange("address", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Address Column</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Suburb/Locality/Town</label>
              <select
                value={selectedMapping.suburb}
                onChange={(e) => handleMappingChange("suburb", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Suburb Column (optional)</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">State/City</label>
              <select
                value={selectedMapping.state}
                onChange={(e) => handleMappingChange("state", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select State Column (optional)</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium">Postcode/ZIP code</label>
              <select
                value={selectedMapping.postcode}
                onChange={(e) => handleMappingChange("postcode", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Postcode Column (optional)</option>
                {headers.map((header, idx) => (
                  <option key={idx} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Processing..." : "Process Batch Geocode"}
            </button>
          </form>

          {message && <p className="mt-4">{message}</p>}
          {downloadLink && (
            <p className="mt-2">
              <a href={downloadLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Download updated file
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelPreviewAndMapping;
