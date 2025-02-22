// models/Property.js
const mongoose = require('mongoose');

// Define a schema for each proprietor entry
const ProprietorSchema = new mongoose.Schema({
  name: { type: String },
  companyRegistrationNo: { type: String },
  proprietorshipCategory: { type: String },
  address1: { type: String },
  address2: { type: String },
  address3: { type: String }
}, { _id: false });

// Define the main property schema
const PropertySchema = new mongoose.Schema({
  titleNumber: { type: String },
  tenure: { type: String },
  propertyAddress: { type: String },
  district: { type: String },
  county: { type: String },
  region: { type: String },
  postcode: { type: String },
  multipleAddressIndicator: { type: Boolean },
  pricePaid: { type: Number },
  // Store all proprietor details in an array
  proprietors: [ProprietorSchema],
  dateProprietorAdded: { type: Date },
  additionalProprietorIndicator: { type: Boolean }
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = Property;
