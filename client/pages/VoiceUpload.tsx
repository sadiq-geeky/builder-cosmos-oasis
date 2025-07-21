import { useState } from 'react';
import { Upload, Mic, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceUpload() {
  const [formData, setFormData] = useState({
    ip_address: '192.168.1.101',
    start_time: '',
    end_time: '',
    cnic: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.toLowerCase().endsWith('.mp3') && 
          !selectedFile.name.toLowerCase().endsWith('.wav')) {
        setError('Only MP3 and WAV files are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploadResult(null);

    // Validate form
    if (!formData.ip_address || !formData.start_time || !formData.end_time || !formData.cnic || !file) {
      setError('All fields are required');
      return;
    }

    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('ip_address', formData.ip_address);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      formDataToSend.append('cnic', formData.cnic);
      formDataToSend.append('mp3', file);

      const response = await fetch('/api/voice/upload', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result);
        setFormData({
          ip_address: '192.168.1.101',
          start_time: '',
          end_time: '',
          cnic: ''
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      setError('Network error: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const playUploadedAudio = () => {
    if (uploadResult?.playback_url) {
      const audio = new Audio(uploadResult.playback_url);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Error playing uploaded audio');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voice Upload Test</h1>
        <p className="text-gray-600">Test the voice/audio upload functionality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio Recording</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IP Address
              </label>
              <input
                type="text"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="192.168.1.xxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="12345-6789012-3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File (MP3/WAV)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Mic className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> audio file
                    </p>
                    <p className="text-xs text-gray-500">MP3 or WAV (MAX 50MB)</p>
                    {file && (
                      <p className="mt-2 text-sm text-primary font-medium">{file.name}</p>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".mp3,.wav,audio/mp3,audio/mpeg,audio/wav"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className={cn(
                "w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="h-4 w-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload Audio'}</span>
            </button>
          </form>
        </div>

        {/* Upload Result */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Result</h2>
          
          {uploadResult ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">Upload successful!</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">UUID:</span>
                  <span className="ml-2 text-gray-600 font-mono">{uploadResult.uuid}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">File Path:</span>
                  <span className="ml-2 text-gray-600">{uploadResult.file_path}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Playback URL:</span>
                  <span className="ml-2 text-gray-600">{uploadResult.playback_url}</span>
                </div>
              </div>

              <button
                onClick={playUploadedAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Play Uploaded Audio</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upload yet</h3>
              <p className="mt-1 text-sm text-gray-500">Upload an audio file to see the result here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
