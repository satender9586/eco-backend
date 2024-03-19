import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined.");
    }

    const connect = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
    });

    console.log(`Connected to MongoDB: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error in MongoDB connection: ${error.stack}`);
    process.exit(1);
  }
};

export default connectDB;
