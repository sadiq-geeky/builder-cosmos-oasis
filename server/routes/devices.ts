import { RequestHandler } from "express";
import { DeviceMapping } from "@shared/api";

// Mock data - in a real app this would come from MySQL database
let mockDevices: DeviceMapping[] = [
  {
    id: '1',
    ip_address: '192.168.1.101',
    device_name: 'Reception Camera',
    created_on: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    ip_address: '192.168.1.102',
    device_name: 'Main Hall Recorder',
    created_on: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    ip_address: '192.168.1.103',
    device_name: 'Security Camera 1',
    created_on: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getDevices: RequestHandler = (req, res) => {
  try {
    const { search } = req.query;
    
    let devices = mockDevices;
    
    if (search) {
      devices = devices.filter(device =>
        device.ip_address.toLowerCase().includes((search as string).toLowerCase()) ||
        device.device_name.toLowerCase().includes((search as string).toLowerCase())
      );
    }

    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
};

export const createDevice: RequestHandler = (req, res) => {
  try {
    const { ip_address, device_name } = req.body;
    
    if (!ip_address || !device_name) {
      return res.status(400).json({ error: 'IP address and device name are required' });
    }

    // Check if IP already exists
    if (mockDevices.find(d => d.ip_address === ip_address)) {
      return res.status(409).json({ error: 'Device with this IP address already exists' });
    }

    const newDevice: DeviceMapping = {
      id: Date.now().toString(),
      ip_address,
      device_name,
      created_on: new Date().toISOString(),
    };

    mockDevices.push(newDevice);
    
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
};

export const updateDevice: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { ip_address, device_name } = req.body;
    
    const deviceIndex = mockDevices.findIndex(d => d.id === id);
    
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check if new IP conflicts with another device
    if (ip_address && mockDevices.find(d => d.ip_address === ip_address && d.id !== id)) {
      return res.status(409).json({ error: 'Another device with this IP address already exists' });
    }

    if (ip_address) mockDevices[deviceIndex].ip_address = ip_address;
    if (device_name) mockDevices[deviceIndex].device_name = device_name;
    
    res.json(mockDevices[deviceIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
};

export const deleteDevice: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const deviceIndex = mockDevices.findIndex(d => d.id === id);
    
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }

    mockDevices.splice(deviceIndex, 1);
    
    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
};
