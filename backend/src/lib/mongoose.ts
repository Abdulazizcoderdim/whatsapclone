import mongoose, { ConnectOptions } from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "whatsapp-clone",
  appName: "whatsapp-clone",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, clientOptions);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    console.log("Disconnected from the database.");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    console.error("Error disconnecting form the database.", error);
  }
};
