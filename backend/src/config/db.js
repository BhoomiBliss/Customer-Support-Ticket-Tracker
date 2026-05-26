// backend/config/db.js
import mongoose from 'mongoose';

/**
 * Connects the server to the MongoDB instance using ES6 module syntax.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failure: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
