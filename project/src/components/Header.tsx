import React from 'react';
import { Milk, Brain, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Milk className="h-8 w-8 text-primary-600" />
              <Brain className="h-4 w-4 text-accent-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AI OCR Milk Log Extractor
              </h1>
              <p className="text-sm text-gray-500">
                Autonomous data extraction & processing
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-accent-500" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};