import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SubmissionSchema, type Submission } from '@app/shared';

interface FileUploadProps {
  onSuccess?: (submission: Submission) => void;
  onError?: (error: string) => void;
}

export function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate the JSON against our schema
      const submission = SubmissionSchema.parse(jsonData);
      
      // Insert into database
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          id: submission.id,
          queue_id: submission.queueId,
          labeling_task_id: submission.labelingTaskId,
          created_at_ms: submission.createdAt,
          raw: jsonData, // Store the original JSON data
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { submission, dbData: data };
    },
    onSuccess: (result) => {
      setIsUploading(false);
      onSuccess?.(result.submission);
    },
    onError: (error) => {
      setIsUploading(false);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    },
  });

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      onError?.('Please upload a JSON file');
      return;
    }

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Processing submission...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload submission JSON
              </p>
              <p className="text-gray-600">
                Drag and drop your JSON file here, or{' '}
                <button
                  onClick={openFileDialog}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  browse files
                </button>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Only JSON files are accepted
            </p>
          </div>
        )}
      </div>

      {uploadMutation.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>Error:</strong> {uploadMutation.error.message}
          </p>
        </div>
      )}

      {uploadMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            <strong>Success!</strong> Submission uploaded and validated.
          </p>
        </div>
      )}
    </div>
  );
}
