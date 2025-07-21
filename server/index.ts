import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initializeDatabase } from "./config/database";

// Import mock routes (default)
import { getHeartbeats, postHeartbeat } from "./routes/heartbeat";
import { getDevices, createDevice, updateDevice, deleteDevice } from "./routes/devices";
import { getRecordings, getRecording, getRecordingStream, downloadRecording } from "./routes/recordings";

// Import database routes (uncomment to use real MySQL)
// import { getHeartbeats, postHeartbeat } from "./routes/heartbeat-db";
// import { getDevices, createDevice, updateDevice, deleteDevice } from "./routes/devices-db";
// import { getRecordings, getRecording, createRecording, updateRecording } from "./routes/recordings-db";

// Import the PHP-equivalent heartbeat submit route
import { submitHeartbeat } from "./routes/heartbeat-submit";

export function createServer() {
  const app = express();

  // Initialize database connection
  initializeDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from CRM Dashboard server!" });
  });

  app.get("/api/demo", handleDemo);

  // Heartbeat routes
  app.get("/api/heartbeats", getHeartbeats);
  app.post("/api/heartbeats", postHeartbeat);

  // Device management routes
  app.get("/api/devices", getDevices);
  app.post("/api/devices", createDevice);
  app.put("/api/devices/:id", updateDevice);
  app.delete("/api/devices/:id", deleteDevice);

  // Recording routes
  app.get("/api/recordings", getRecordings);
  app.get("/api/recordings/:id", getRecording);
  app.get("/api/recordings/:id/stream", getRecordingStream);
  app.get("/api/recordings/:id/download", downloadRecording);

  return app;
}
