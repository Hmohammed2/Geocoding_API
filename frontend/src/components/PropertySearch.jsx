import React, { useState } from "react";
import PropertyMap from "./PropertyMap";

const PropertySearch = () => {
  const [postcode, setPostcode] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [radius, setRadius] = useState(0.17); // Default radius in miles
  const [priceRange, setPriceRange] = useState([0, 3000000]); // Default range: 0 to 3 million

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Search Property Prices
      </h2>

      {/* Postcode and Bedrooms Inputs */}
      <div className="flex flex-col space-y-4 mb-6">
        <input
          type="text"
          placeholder="Enter postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className="p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
        </select>
      </div>

      {/* Price Range Slider */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-700">Price Range: £{priceRange[0].toLocaleString()} - £{priceRange[1].toLocaleString()}</p>
        <input
          type="range"
          min="0"
          max="3000000"
          value={priceRange[0]}
          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
          className="w-full"
        />
        <input
          type="range"
          min="0"
          max="3000000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full"
        />
      </div>

      {/* Radius Slider */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-700">Radius: {radius} miles</p>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      {/* Property Map */}
      <PropertyMap
        postcode={postcode}
        bedrooms={bedrooms}
        radius={radius}
        priceRange={priceRange}
      />
    </div>
  );
};

export default PropertySearch;
