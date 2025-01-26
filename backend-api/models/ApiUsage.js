const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApiUsageSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true }, // Endpoint accessed, e.g., '/geocode'
    request_method: { type: String, required: true }, // HTTP method, e.g., 'GET', 'POST'
    timestamp: { type: Date, default: Date.now }, // When the request was made
    status_code: { type: Number, required: true }, // Response status, e.g., 200, 404
  },
  { timestamps: true } // Automatically include createdAt and updatedAt
);

module.exports = mongoose.model('ApiUsage', ApiUsageSchema);
