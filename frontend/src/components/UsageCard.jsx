import React from "react";
/**
 * 
 * 
 * @param {string} title: title of the usage card
 * @param {string} value: value shown in currency within the usage card
 * @param {string} description: description of the usage card
 */
const UsageCard = ({ title, value, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mb-2">{value}</p>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default UsageCard;
