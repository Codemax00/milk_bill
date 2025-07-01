import { MilkLogEntry, ProcessedMilkData } from '../types';

// Simulated OCR service for demonstration
export class OCRService {
  static async extractTextFromImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('https://milkbill.netlify.app/ocr', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`OCR API error: ${await response.text()}`);
    }
    const data = await response.json();
    return data.text || '';
  }

  static parseMilkData(ocrText: string, cowRate: number = 32, milkType: 'cow' | 'buffalo' | 'both' = 'both'): ProcessedMilkData {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const entries: MilkLogEntry[] = [];
    let collectorId = 'CUS001';
    let startDate = '2025-06-01';
    let endDate = '2025-06-15';

    // Extract collector ID
    const collectorMatch = ocrText.match(/Customer ID:\s*(\w+)/i);
    if (collectorMatch) {
      collectorId = collectorMatch[1];
    }

    // Extract date range
    const dateRangeMatch = ocrText.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
    if (dateRangeMatch) {
      startDate = this.formatDate(dateRangeMatch[1]);
      endDate = this.formatDate(dateRangeMatch[2]);
    }

    // Parse entries
    let lastDate: string | undefined = undefined;
    lines.forEach((line, index) => {
      const sNoMatch = line.match(/^\s*(\d+)/);
      if (sNoMatch) {
        const sNo = parseInt(sNoMatch[1]);
        const entry: MilkLogEntry = { sNo };

        // Parse date
        const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/);
        if (dateMatch) {
          entry.date = this.formatDate(dateMatch[1]);
          lastDate = entry.date; // Update last seen date
        } else if (lastDate) {
          entry.date = lastDate; // Use last seen date if not present
        }

        // Parse morning session (buffalo milk) - only if buffalo or both
        if (milkType === 'buffalo' || milkType === 'both') {
          const morningMatch = line.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
          if (morningMatch) {
            entry.morning = {
              milkInLiters: parseFloat(morningMatch[1]),
              fatPercentage: parseFloat(morningMatch[2])
            };
          }
        }

        // Parse evening session (buffalo milk) - only if buffalo or both
        if (milkType === 'buffalo' || milkType === 'both') {
          const eveningMatches = line.match(/(\d+\.?\d*)-(\d+\.?\d*)/g);
          if (eveningMatches && eveningMatches.length > 1) {
            const eveningParts = eveningMatches[1].split('-');
            entry.evening = {
              milkInLiters: parseFloat(eveningParts[0]),
              fatPercentage: parseFloat(eveningParts[1])
            };
          }
        }

        // Parse cow milk - only if cow or both
        if (milkType === 'cow' || milkType === 'both') {
          const cowMilkMatch = line.match(/\|(\d+\.?\d*)\|/) || line.match(/cow milk:\s*(\d+\.?\d*)/i);
          if (cowMilkMatch) {
            const milkAmount = parseFloat(cowMilkMatch[1]);
            entry.cowMilk = {
              milkInLiters: milkAmount,
              rate: cowRate,
              amount: milkAmount * cowRate
            };
          }
        }

        // Calculate totals for this entry
        let totalMilk = 0;
        let totalAmount = 0;

        if (entry.morning) {
          totalMilk += entry.morning.milkInLiters;
          totalAmount += entry.morning.milkInLiters * entry.morning.fatPercentage * 5; // Assuming rate calculation
        }
        if (entry.evening) {
          totalMilk += entry.evening.milkInLiters;
          totalAmount += entry.evening.milkInLiters * entry.evening.fatPercentage * 5;
        }
        if (entry.cowMilk) {
          totalMilk += entry.cowMilk.milkInLiters;
          totalAmount += entry.cowMilk.amount;
        }

        entry.totalMilk = totalMilk;
        entry.totalAmount = totalAmount;

        entries.push(entry);
      }
    });

    // Calculate summary
    const totalMilk = entries.reduce((sum, entry) => sum + (entry.totalMilk || 0), 0);
    const totalAmount = entries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    
    const buffaloMilkTotal = entries.reduce((sum, entry) => {
      let buffalo = 0;
      if (entry.morning) buffalo += entry.morning.milkInLiters;
      if (entry.evening) buffalo += entry.evening.milkInLiters;
      return sum + buffalo;
    }, 0);

    const cowMilkTotal = entries.reduce((sum, entry) => {
      return sum + (entry.cowMilk?.milkInLiters || 0);
    }, 0);

    const fatEntries = entries.filter(entry => entry.morning || entry.evening);
    const averageFat = fatEntries.length > 0 
      ? fatEntries.reduce((sum, entry) => {
          let fatSum = 0;
          let count = 0;
          if (entry.morning) { fatSum += entry.morning.fatPercentage; count++; }
          if (entry.evening) { fatSum += entry.evening.fatPercentage; count++; }
          return sum + (count > 0 ? fatSum / count : 0);
        }, 0) / fatEntries.length
      : 0;

    return {
      collectorId,
      startDate,
      endDate,
      totalMilk: Math.round(totalMilk * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      entries,
      summary: {
        buffaloMilkTotal: Math.round(buffaloMilkTotal * 100) / 100,
        cowMilkTotal: Math.round(cowMilkTotal * 100) / 100,
        averageFat: Math.round(averageFat * 100) / 100,
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