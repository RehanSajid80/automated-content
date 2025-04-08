
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

export interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  trend: "up" | "neutral" | "down";
}

/**
 * Process Excel file and convert it to keyword data
 */
export const processExcelFile = (file: File): Promise<KeywordData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform to match our keyword data structure
        const keywordData = jsonData.map((row: any) => {
          // Extract trend value and normalize it
          const rawTrend = String(row.Trend || row.trend || 'neutral').toLowerCase();
          
          // Ensure trend is one of the allowed values
          let normalizedTrend: "up" | "neutral" | "down" = "neutral";
          if (rawTrend === "up" || rawTrend === "increasing" || rawTrend === "growth" || rawTrend === "positive") {
            normalizedTrend = "up";
          } else if (rawTrend === "down" || rawTrend === "decreasing" || rawTrend === "decline" || rawTrend === "negative") {
            normalizedTrend = "down";
          }
          
          // Map Excel columns to our data structure
          return {
            keyword: String(row.Keyword || row.keyword || ''),
            volume: parseInt(String(row.Volume || row.volume || '0'), 10),
            difficulty: parseInt(String(row.Difficulty || row.difficulty || '0'), 10),
            cpc: parseFloat(String(row.CPC || row.cpc || '0')),
            trend: normalizedTrend
          } as KeywordData; // Add explicit type assertion here
        });
        
        resolve(keywordData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
