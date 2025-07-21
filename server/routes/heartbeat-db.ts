import { RequestHandler } from "express";
import { HeartbeatRecord } from "@shared/api";
import { executeQuery } from "../config/database";

// Get heartbeats with status calculation
export const getHeartbeats: RequestHandler = async (req, res) => {
  try {
    // Query the actual heartbeat table
    const query = `
      SELECT 
        uuid,
        ip_address,
        created_on,
        created_on as last_seen,
        CASE 
          WHEN TIMESTAMPDIFF(MINUTE, created_on, NOW()) <= 5 THEN 'online'
          WHEN TIMESTAMPDIFF(MINUTE, created_on, NOW()) <= 15 THEN 'problematic'
          ELSE 'offline'
        END as status
      FROM setcrmuis.recording_heartbeat 
      ORDER BY created_on DESC
    `;

    const heartbeats = await executeQuery<HeartbeatRecord>(query);
    res.json(heartbeats);
  } catch (error) {
    console.error("Error fetching heartbeats:", error);
    res.status(500).json({ error: "Failed to fetch heartbeats" });
  }
};

// Receive heartbeat from device
export const postHeartbeat: RequestHandler = async (req, res) => {
  try {
    const { uuid, ip_address } = req.body;

    if (!uuid || !ip_address) {
      return res
        .status(400)
        .json({ error: "UUID and IP address are required" });
    }

    // Insert heartbeat into database
    const query = `
      INSERT INTO setcrmuis.recording_heartbeat (uuid, ip_address, created_on) 
      VALUES (?, ?, NOW())
    `;

    await executeQuery(query, [uuid, ip_address]);

    res.json({
      success: true,
      message: "Heartbeat recorded",
      uuid,
      ip_address,
      created_on: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error recording heartbeat:", error);
    res.status(500).json({ error: "Failed to record heartbeat" });
  }
};

// Get device status summary
export const getDeviceStatus: RequestHandler = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN TIMESTAMPDIFF(MINUTE, created_on, NOW()) <= 5 THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN TIMESTAMPDIFF(MINUTE, created_on, NOW()) BETWEEN 6 AND 15 THEN 1 ELSE 0 END) as problematic,
        SUM(CASE WHEN TIMESTAMPDIFF(MINUTE, created_on, NOW()) > 15 THEN 1 ELSE 0 END) as offline
      FROM (
        SELECT uuid, MAX(created_on) as created_on
        FROM setcrmuis.recording_heartbeat 
        GROUP BY uuid
      ) latest_heartbeats
    `;

    const [status] = await executeQuery(query);
    res.json(status);
  } catch (error) {
    console.error("Error fetching device status:", error);
    res.status(500).json({ error: "Failed to fetch device status" });
  }
};
