-- Optional: Add metadata columns to recording_history table for better performance
-- This eliminates the need to calculate duration on every query

USE setcrmuis;

-- Add metadata columns (run these if you want to store pre-calculated metadata)
ALTER TABLE recording_history 
ADD COLUMN duration_seconds INT DEFAULT NULL COMMENT 'Duration in seconds for audio/video files',
ADD COLUMN file_size_bytes BIGINT DEFAULT NULL COMMENT 'File size in bytes',
ADD COLUMN audio_bitrate INT DEFAULT NULL COMMENT 'Audio bitrate in kbps',
ADD COLUMN sample_rate INT DEFAULT NULL COMMENT 'Audio sample rate in Hz',
ADD COLUMN audio_format VARCHAR(10) DEFAULT NULL COMMENT 'Audio format (mp3, wav, etc)';

-- Example of how to update existing records with calculated duration
-- UPDATE recording_history 
-- SET duration_seconds = TIMESTAMPDIFF(SECOND, start_time, end_time)
-- WHERE end_time IS NOT NULL AND duration_seconds IS NULL;

-- Index for faster queries
CREATE INDEX idx_recording_history_duration ON recording_history(duration_seconds);
CREATE INDEX idx_recording_history_file_format ON recording_history(audio_format);

-- Example of how to insert with metadata when uploading files
-- INSERT INTO recording_history 
-- (id, cnic, start_time, end_time, file_name, CREATED_ON, ip_address, duration_seconds, file_size_bytes, audio_format) 
-- VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?);
