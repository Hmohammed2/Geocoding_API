const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
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