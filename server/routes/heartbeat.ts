import { RequestHandler } from "express";
import { HeartbeatRecord } from "@shared/api";

// Mock data - in a real app this would come from MySQL database
const generateMockHeartbeats = (): HeartbeatRecord[] => {
  const devices = [
    { uuid: 'device-001', ip: '192.168.1.101' },
    { uuid: 'device-002', ip: '192.168.1.102' },
    { uuid: 'device-003', ip: '192.168.1.103' },
    { uuid: 'device-004', ip: '192.168.1.104' },
    { uuid: 'device-005', ip: '192.168.1.105' },
    { uuid: 'device-006', ip: '192.168.1.106' },
  ];

  return devices.map((device, index) => {
    const now = new Date();
    const minutesAgo = index === 0 ? 2 : index === 1 ? 8 : index === 2 ? 17 : index === 3 ? 25 : index === 4 ? 3 : 6;
    const lastSeen = new Date(now.getTime() - minutesAgo * 60000);
    
    let status: 'online' | 'problematic' | 'offline';
    if (minutesAgo <= 5) status = 'online';
    else if (minutesAgo <= 15) status = 'problematic';
    else status = 'offline';

    return {
      uuid: device.uuid,
      ip_address: device.ip,
      created_on: lastSeen.toISOString(),
      last_seen: lastSeen.toISOString(),
      status
    };
  });
};

export const getHeartbeats: RequestHandler = (req, res) => {
  try {
    const heartbeats = generateMockHeartbeats();
    res.json(heartbeats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heartbeats' });
  }
};

// Simulate receiving heartbeat from device
export const postHeartbeat: RequestHandler = (req, res) => {
  try {
    const { uuid, ip_address } = req.body;
    
    if (!uuid || !ip_address) {
      return res.status(400).json({ error: 'UUID and IP address are required' });
    }

    // In a real app, you would insert into MySQL:
    // INSERT INTO setcrmuis.recording_heartbeat (uuid, ip_address, created_on) VALUES (?, ?, NOW())
    
    res.json({ 
      success: true, 
      message: 'Heartbeat recorded',
      uuid,
      ip_address,
      created_on: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record heartbeat' });
  }
};
