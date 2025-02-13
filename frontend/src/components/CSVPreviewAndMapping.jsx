// src/components/CSVPreviewAndMapping.jsx
import React, { useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import { useAuth } from "./contexts/AuthContext";

const CSVPreviewAndMapping = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    address: "",
    suburb: "",
    state: "",
    postcode: "",
  });
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      preview: 5, // preview first 5 rows
      complete: (results) => {
        setData(results.data);
        setHeaders(results.meta.fields);
      },
      error: (err) => {
        console.error(err);
      }
    });
  };

  const handleMappingChange = (field, value) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate mapping selections here
    if (!mapping.address) {
      setMessage("Please select a column for the address.");
      return;
    }
    // Build FormData to send to the backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("addressColumn", mapping.address);
    if (mapping.suburb) formData.append("suburbColumn", mapping.suburb);
    if (mapping.state) formData.append("stateColumn", mapping.state);
    if (mapping.postcode) formData.append("postcodeColumn", mapping.postcode);

    setLoading(true);
    try {
      const { data: resData } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/batch-geocode`, formData, {
        headers: { "Content-Type": "multipart/form-data", "x-api-key": user.apiKey },
      });
      setMessage("Batch geocoding completed!");
      setDownloadLink(resData.download);
    } catch (err) {
      console.error(err);

      // Extract response data if available
      if (err.response) {
        setMessage(err.response.data.message || "Error during batch geocoding.");

        // Check if there is a download link in the error response
        if (err.response.data.download) {
          setDownloadLink(err.response.data.download);
        }
      } else {
        setMessage("Error during batch geocoding.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Upload & Preview CSV File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} className="mt-2 p-2 border rounded" />

      {headers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Data Preview (first 5 rows):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full mt-2 border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  {headers.map((header, index) => (
                    <th key={index} className="border px-4 py-2 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border">
                    {headers.map((header, colIndex) => (
                      <td key={colIndex} className="border px-4 py-2">{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6">Select Columns for Geocoding</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {["address", "suburb", "state", "postcode"].map((key) => (
              <div key={key}>
                <label className="block font-medium capitalize">{key}</label>
                <select
                  value={mapping[key]}
                  onChange={(e) => handleMappingChange(key, e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">{`Select ${key} Column${key !== "address" ? " (optional)" : ""}`}</option>
                  {headers.map((header, idx) => (
                    <option key={idx} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}

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

export default CSVPreviewAndMapping;
