import React from 'react';
import { Loader2, Eye, Brain, FileText, CheckCircle } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  currentStep?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  isProcessing, 
  currentStep = 'Initializing...' 
}) => {
  const steps = [
    { id: 'ocr', label: 'OCR Text Extraction', icon: Eye },
    { id: 'ai', label: 'AI Data Processing', icon: Brain },
    { id: 'structure', label: 'Data Structuring', icon: FileText },
    { id: 'complete', label: 'Processing Complete', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (currentStep.includes('OCR') || currentStep.includes('extracting')) return 0;
    if (currentStep.includes('AI') || currentStep.includes('parsing')) return 1;
    if (currentStep.includes('structuring') || currentStep.includes('formatting')) return 2;
    if (currentStep.includes('complete')) return 3;
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  if (!isProcessing) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900">Processing Your Files</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-primary-50 border border-primary-200' :
                isCompleted ? 'bg-green-50 border border-green-200' :
                'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-full ${
                isActive ? 'bg-primary-100' :
                isCompleted ? 'bg-green-100' :
                'bg-gray-200'
              }`}>
                {isActive ? (
                  <Loader2 className="h-4 w-4 text-primary-600 animate-spin" />
                ) : (
                  <Icon className={`h-4 w-4 ${
                    isCompleted ? 'text-green-600' :
                    isActive ? 'text-primary-600' :
                    'text-gray-400'
                  }`} />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isActive ? 'text-primary-900' :
                  isCompleted ? 'text-green-900' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-primary-600 animate-pulse-gentle">
                    {currentStep}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};