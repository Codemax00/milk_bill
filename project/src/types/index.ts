export interface MilkLogEntry {
  sNo: number;
  date?: string;
  morning?: {
    milkInLiters: number;
    fatPercentage: number;
  };
  evening?: {
    milkInLiters: number;
    fatPercentage: number;
  };
  cowMilk?: {
    milkInLiters: number;
    rate: number;
    amount: number;
  };
  totalMilk?: number;
  totalAmount?: number;
}

export interface ProcessedMilkData {
  collectorId: string;
  startDate: string;
  endDate: string;
  totalMilk: number;
  totalAmount: number;
  entries: MilkLogEntry[];
  summary: {
    buffaloMilkTotal: number;
    cowMilkTotal: number;
    averageFat: number;
    totalDays: number;
  };
}

export interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}