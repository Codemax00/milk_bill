import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileUpload: (files: UploadedFile[], milkType?: 'cow' | 'buffalo' | 'both') => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showMilkTypeSelection, setShowMilkTypeSelection] = useState(false);
  const [selectedMilkType, setSelectedMilkType] = useState<'cow' | 'buffalo' | 'both'>('both');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((uploadedFile, index) => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === uploadedFile.file 
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          );
          // Show milk type selection after upload completes
          setShowMilkTypeSelection(true);
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === uploadedFile.file 
                ? { ...f, progress }
                : f
            )
          );
        }
      }, 200);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    disabled: isProcessing
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.file !== fileToRemove);
      URL.revokeObjectURL(prev.find(f => f.file === fileToRemove)?.preview || '');
      if (updated.length === 0) {
        setShowMilkTypeSelection(false);
      }
      return updated;
    });
  };

  const handleProcessFiles = () => {
    onFileUpload(uploadedFiles, selectedMilkType);
    setShowMilkTypeSelection(false);
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-primary-400 bg-primary-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary-600" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop your files here!' : 'Upload milk log images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop your images or PDF files, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports: JPEG, PNG, PDF • Max file size: 10MB
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {uploadedFile.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 text-primary-600 animate-spin" />
                )}
                {uploadedFile.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <button
                onClick={() => removeFile(uploadedFile.file)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showMilkTypeSelection && !isProcessing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Milk Type to Extract</h3>
          <p className="text-sm text-gray-600 mb-6">
            Choose which type of milk data you want to extract from your uploaded images.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              onClick={() => setSelectedMilkType('cow')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedMilkType === 'cow'
                  ? 'border-accent-500 bg-accent-50'
                  : 'border-gray-200 hover:border-accent-300 hover:bg-accent-25'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🐄</div>
                <h4 className="font-semibold text-gray-900">Cow Milk Only</h4>
                <p className="text-xs text-gray-600">Extract only cow milk entries</p>
              </div>
            </div>

            <div
              onClick={() => setSelectedMilkType('buffalo')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedMilkType === 'buffalo'
                  ? 'border-secondary-500 bg-secondary-50'
                  : 'border-gray-200 hover:border-secondary-300 hover:bg-secondary-25'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🐃</div>
                <h4 className="font-semibold text-gray-900">Buffalo Milk Only</h4>
                <p className="text-xs text-gray-600">Extract only buffalo milk entries</p>
              </div>
            </div>

            <div
              onClick={() => setSelectedMilkType('both')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedMilkType === 'both'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-25'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">🥛</div>
                <h4 className="font-semibold text-gray-900">Both Types</h4>
                <p className="text-xs text-gray-600">Extract all milk data</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowMilkTypeSelection(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessFiles}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Process Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
};