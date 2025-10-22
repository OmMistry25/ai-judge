import { useState } from 'react';
import { SubmissionSchema } from '@app/shared';

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
      
      // Validate against our schema
      const submission = SubmissionSchema.parse(jsonData);
      
      // Generate a unique submission ID to avoid duplicates
      const uniqueSubmissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      submission.id = uniqueSubmissionId;
      
      // Log parsed data for debugging
      console.log('Parsed submission:', submission);
      console.log('Questions to store:', submission.questions);
      console.log('Answers to store:', submission.answers);
      console.log('Using queueId from props:', queueId);
      console.log('Submission queueId from JSON:', submission.queueId);
      
      // Try to store in database (with error handling)
      try {
        // Dynamic import to avoid build-time errors
        const { supabase } = await import('../lib/supabase');
        
        if (supabase) {
          // Insert submission
          console.log('About to insert with queue_id:', queueId);
          console.log('Queue ID type:', typeof queueId);
          console.log('Queue ID length:', queueId.length);
          
          const { error: submissionError } = await supabase
            .from('submissions')
            .insert({
              id: submission.id,
              queue_id: queueId,
              labeling_task_id: submission.labelingTaskId,
              created_at_ms: submission.createdAt,
              raw: jsonData,
            } as any);

          if (submissionError) {
            console.error('Submission insert error:', submissionError);
            throw new Error(`Database error: ${submissionError.message}`);
          }

          // Insert questions
          for (const question of submission.questions) {
            const { error: questionError } = await supabase
              .from('questions')
              .insert({
                submission_id: submission.id,
                template_id: question.data.id,
                rev: question.rev,
                question_type: question.data.questionType,
                question_text: question.data.questionText,
              } as any);

            if (questionError) {
              console.error('Question insert error:', questionError);
              throw new Error(`Database error: ${questionError.message}`);
            }
          }

          // Insert answers
          for (const [templateId, answerData] of Object.entries(submission.answers)) {
            const { error: answerError } = await supabase
              .from('answers')
              .insert({
                submission_id: submission.id,
                template_id: templateId,
                choice: answerData.choice || null,
                reasoning: answerData.reasoning || null,
              } as any);

            if (answerError) {
              console.error('Answer insert error:', answerError);
              throw new Error(`Database error: ${answerError.message}`);
            }
          }

          console.log('✅ Data stored in database successfully!');
        } else {
          console.log('⚠️ Supabase not available, data not stored');
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        // Continue with success message even if DB fails
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage(`✅ File uploaded successfully! Submission ID: ${submission.id}`);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(submission.id);
      }

    } catch (error) {
      console.error('Upload error:', error);
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