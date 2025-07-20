import { RequestHandler } from "express";
import { RecordingHistory, PaginatedResponse } from "@shared/api";

// Mock data - in a real app this would come from MySQL database
const mockRecordings: RecordingHistory[] = [
  {
    id: 'rec-001',
    cnic: '12345-6789012-3',
    start_time: '2024-01-15T09:30:00Z',
    end_time: '2024-01-15T10:15:00Z',
    file_name: 'recording_20240115_093000.mp4',
    created_on: '2024-01-15T09:30:00Z',
    ip_address: '192.168.1.101',
    duration: 45,
    status: 'completed'
  },
  {
    id: 'rec-002',
    cnic: '98765-4321098-7',
    start_time: '2024-01-15T11:00:00Z',
    end_time: '2024-01-15T11:30:00Z',
    file_name: 'recording_20240115_110000.mp4',
    created_on: '2024-01-15T11:00:00Z',
    ip_address: '192.168.1.102',
    duration: 30,
    status: 'completed'
  },
  {
    id: 'rec-003',
    cnic: '11111-2222233-4',
    start_time: '2024-01-15T14:15:00Z',
    end_time: null,
    file_name: 'recording_20240115_141500.mp4',
    created_on: '2024-01-15T14:15:00Z',
    ip_address: '192.168.1.103',
    duration: null,
    status: 'in_progress'
  },
  {
    id: 'rec-004',
    cnic: '55555-6666677-8',
    start_time: '2024-01-14T16:45:00Z',
    end_time: '2024-01-14T17:20:00Z',
    file_name: 'recording_20240114_164500.mp4',
    created_on: '2024-01-14T16:45:00Z',
    ip_address: '192.168.1.101',
    duration: 35,
    status: 'completed'
  },
  {
    id: 'rec-005',
    cnic: '12345-6789012-3',
    start_time: '2024-01-14T10:00:00Z',
    end_time: '2024-01-14T10:10:00Z',
    file_name: 'recording_20240114_100000.mp4',
    created_on: '2024-01-14T10:00:00Z',
    ip_address: '192.168.1.102',
    duration: 10,
    status: 'failed'
  },
];

export const getRecordings: RequestHandler = (req, res) => {
  try {
    const { page = '1', limit = '10', search } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    // Filter by CNIC search
    let filtered = mockRecordings;
    if (search) {
      filtered = mockRecordings.filter(r => 
        r.cnic?.includes(search as string)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const data = filtered.slice(startIndex, startIndex + limitNum);

    const response: PaginatedResponse<RecordingHistory> = {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
};

export const getRecording: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = mockRecordings.find(r => r.id === id);
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json(recording);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recording' });
  }
};

// Simulate streaming URL for playback
export const getRecordingStream: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = mockRecordings.find(r => r.id === id);
    
    if (!recording || recording.status !== 'completed') {
      return res.status(404).json({ error: 'Recording not available for streaming' });
    }

    // In a real app, this would return a streaming URL or serve the video file
    res.json({
      stream_url: `/api/recordings/${id}/stream`,
      file_name: recording.file_name,
      duration: recording.duration,
      type: 'video/mp4'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recording stream' });
  }
};

// Simulate file download
export const downloadRecording: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = mockRecordings.find(r => r.id === id);
    
    if (!recording || recording.status !== 'completed') {
      return res.status(404).json({ error: 'Recording not available for download' });
    }

    // In a real app, this would serve the actual file
    res.json({
      download_url: `/api/recordings/${id}/download`,
      file_name: recording.file_name,
      file_size: '45.2 MB' // Mock file size
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to download recording' });
  }
};
