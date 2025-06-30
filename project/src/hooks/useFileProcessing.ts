import { useState, useCallback } from 'react';
import { ProcessedMilkData, UploadedFile } from '../types';
import { OCRService } from '../services/ocrService';

export const useFileProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [processedData, setProcessedData] = useState<ProcessedMilkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: UploadedFile[], milkType: 'cow' | 'buffalo' | 'both' = 'both') => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setCurrentStep(`Starting OCR text extraction for ${milkType} milk...`);

    try {
      // Simulate processing steps
      const file = files[0].file;
      
      setCurrentStep(`Extracting ${milkType} milk data from image using OCR...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const extractedText = await OCRService.extractTextFromImage(file);
      
      setCurrentStep(`Processing ${milkType} milk data with AI algorithms...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStep('Structuring and formatting data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const processedData = OCRService.parseMilkData(extractedText, 32, milkType);
      
      setCurrentStep('Processing complete!');
      setProcessedData(processedData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  }, []);

  const exportData = useCallback(() => {
    if (!processedData) return;
    
    const dataStr = JSON.stringify(processedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `milk-log-${processedData.collectorId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processedData]);

  const reset = useCallback(() => {
    setProcessedData(null);
    setError(null);
    setIsProcessing(false);
    setCurrentStep('');
  }, []);

  return {
    isProcessing,
    currentStep,
    processedData,
    error,
    processFiles,
    exportData,
    reset
  };
};