import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined.");
    }

    let retries = 5;
    while (retries > 0) {
      try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 30000, // Set timeout to 30 seconds
        });

        console.log(`Connected to MongoDB: ${connect.connection.host}`);
        return; // If connection successful, exit the loop
      } catch (error) {
        console.error(`Error in MongoDB connection: ${error.stack}`);
        console.log(`Retrying connection. ${retries} retries left.`);
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Retry after 5 seconds
      }
    }

    console.error("Failed to connect to MongoDB after retries.");
    process.exit(1);
  } catch (error) {
    console.error(`Error in MongoDB connection: ${error.stack}`);
    process.exit(1);
  }
};

export default connectDB;
