import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { DataVisualization } from './components/DataVisualization';
import { useFileProcessing } from './hooks/useFileProcessing';
import { UploadedFile } from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

function App() {
  const {
    isProcessing,
    currentStep,
    processedData,
    error,
    processFiles,
    exportData,
    reset
  } = useFileProcessing();

  const handleFileUpload = (files: UploadedFile[], milkType?: 'cow' | 'buffalo' | 'both') => {
    processFiles(files, milkType);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Transform Your Milk Collection Logs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload images of your milk collection logs and let our AI automatically extract, 
              process, and structure the data into organized JSON format.
            </p>
          </div>

          {/* Upload Section */}
          {!processedData && !isProcessing && (
            <div className="max-w-2xl mx-auto">
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="max-w-2xl mx-auto">
              <ProcessingStatus isProcessing={isProcessing} currentStep={currentStep} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {processedData && !error && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Extracted Data</h2>
                <button
                  onClick={reset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Process New File</span>
                </button>
              </div>
              <DataVisualization data={processedData} onExport={exportData} />
            </div>
          )}

          {/* Features Section */}
          {!processedData && !isProcessing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered OCR</h3>
                <p className="text-sm text-gray-600">
                  Advanced optical character recognition with intelligent data parsing
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Instant Processing</h3>
                <p className="text-sm text-gray-600">
                  Get structured JSON data in seconds, not hours of manual entry
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Smart Analytics</h3>
                <p className="text-sm text-gray-600">
                  Automatic calculations for totals, averages, and financial summaries
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;