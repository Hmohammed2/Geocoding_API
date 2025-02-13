import React, { useState } from "react";
import CSVPreviewAndMapping from "../components/CSVPreviewAndMapping";
import ExcelPreviewAndMapping from "../components/ExcelPreviewAndMapping";

const FilePreviewToggle = () => {
  // State to track which file type the user wants to preview
  const [fileType, setFileType] = useState("csv");

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Select File Type to Preview</h2>
      
      {/* Radio buttons to toggle between CSV and Excel */}
      <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            value="csv"
            checked={fileType === "csv"}
            onChange={() => setFileType("csv")}
            className="mr-2"
          />
          CSV (Flat File)
        </label>
        <label>
          <input
            type="radio"
            value="excel"
            checked={fileType === "excel"}
            onChange={() => setFileType("excel")}
            className="mr-2"
          />
          Excel
        </label>
      </div>

      {/* Render the corresponding component based on selection */}
      {fileType === "csv" ? <CSVPreviewAndMapping /> : <ExcelPreviewAndMapping />}
    </div>
  );
};

export default FilePreviewToggle;
