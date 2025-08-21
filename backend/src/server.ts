import authRoute from "@/routes/auth.route";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import { connectDB, disconnectFromDatabase } from "./lib/mongoose";
config();

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  try {
    await connectDB();

    app.use("/api/auth", authRoute);

    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database", error);

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();

    console.warn("Server is shutting down");
    process.exit(0);
  } catch (error) {
    console.error("Failed to disconnect from database", error);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
