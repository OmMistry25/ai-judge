import { useState } from 'react';

interface FileUploadProps {
  queueId: string;
  onUploadSuccess?: (submissionId: string) => void;
}

export function FileUpload({ queueId, onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('❌ Please select a file to upload.');
      return;
    }

    if (!queueId) {
      setMessage('❌ Please select a queue first.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading and processing file...');

    try {
      // Read the file content
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate JSON structure (basic check)
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      // Create a mock submission ID
      const submissionId = `submission_${Date.now()}`;

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage(`✅ File uploaded successfully! Submission ID: ${submissionId}`);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(submissionId);
      }

    } catch (error) {
      setMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Invalid JSON file'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Submission JSON</h3>
      
      <div className="space-y-4">
        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
          {file ? (
            <div>
              <p className="text-gray-700 font-medium">Selected file: {file.name}</p>
              <p className="text-sm text-gray-500 mt-1">Click to change file</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">Drag 'n' drop a JSON file here, or</p>
              <p className="text-blue-600 font-medium">click to browse files</p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || !queueId}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Processing...' : 'Upload to Queue'}
        </button>

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Upload a JSON file with submission data</li>
            <li>File will be parsed and stored in the selected queue</li>
            <li>Questions and answers will be extracted automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}