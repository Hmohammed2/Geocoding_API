const mongoose = require("mongoose");
const MONGO_URI = `mongodb://mongo-geocode:27017/GeocodeDatabase`;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { 
    });
    console.log("Connected to MongoDB Database!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

// Call the function to establish the connection 
connectToDatabase();

// Export the mongoose connection
module.exports = mongoose.connection;