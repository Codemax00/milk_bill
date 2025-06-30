import { MilkLogEntry, ProcessedMilkData } from '../types';

// Simulated OCR service for demonstration
export class OCRService {
  static async extractTextFromImage(file: File): Promise<string> {
    // Simulated delay for OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR text extraction for Telugu-style table (serial number and CM values)
    return `
      1  18 CM    16 CM
      2  21 CM    19 CM
      3  21 CM    15 CM
      4  21 CM    15 CM
      5  23 CM    16 CM
      6  27 CM    19 CM
      7  23 CM    -
      8  19 CM    18 CM
      9  25 CM    16 CM
      10 28 CM    16 CM
      11 17 CM    18 CM
    `;
  }

  static parseMilkData(ocrText: string, cowRate: number = 32, milkType: 'cow' | 'buffalo' | 'both' = 'both'): ProcessedMilkData {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const entries: MilkLogEntry[] = [];
    let collectorId = 'CUS001';
    let startDate = '';
    let endDate = '';

    // Parse entries for generic table (serial number and CM values)
    lines.forEach((line, index) => {
      // Match: serial number, first value (with or without CM), optional second value (with or without CM)
      const match = line.match(/(\d+)\s+([\d.]+)(?:\s*CM)?(?:\s+(?:-|([\d.]+)(?:\s*CM)?))?/i);
      if (match) {
        const sNo = parseInt(match[1]);
        const cowMilk1 = parseFloat(match[2]);
        const cowMilk2 = match[3] ? parseFloat(match[3]) : undefined;
        const entry: MilkLogEntry = { sNo };
        if (milkType === 'cow' || milkType === 'both') {
          entry.cowMilk = {
            milkInLiters: cowMilk1,
            rate: cowRate,
            amount: cowMilk1 * cowRate
          };
          // Always set totalMilk and totalAmount for UI compatibility
          entry.totalMilk = cowMilk1;
          entry.totalAmount = cowMilk1 * cowRate;
        }
        // Optionally, if you want to store the second value as evening or another field, you can do so here
        entries.push(entry);
      }
    });

    // Calculate summary
    const totalMilk = entries.reduce((sum, entry) => sum + (entry.totalMilk || (entry.cowMilk?.milkInLiters || 0)), 0);
    const totalAmount = entries.reduce((sum, entry) => sum + (entry.totalAmount || (entry.cowMilk?.amount || 0)), 0);
    const cowMilkTotal = entries.reduce((sum, entry) => sum + (entry.cowMilk?.milkInLiters || 0), 0);

    return {
      collectorId,
      startDate,
      endDate,
      totalMilk: Math.round(totalMilk * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      entries,
      summary: {
        buffaloMilkTotal: 0,
        cowMilkTotal: Math.round(cowMilkTotal * 100) / 100,
        averageFat: 0,
        totalDays: entries.length
      }
    };
  }

  private static formatDate(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      let year = parts[2];
      if (year.length === 2) {
        year = '20' + year;
      }
      return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  }
}