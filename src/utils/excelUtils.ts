
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
        const keywordData: KeywordData[] = jsonData.map((row: any) => {
          // Map Excel columns to our data structure
          // Adjust these mappings based on your Excel file structure
          return {
            keyword: row.Keyword || row.keyword || '',
            volume: parseInt(row.Volume || row.volume || '0', 10),
            difficulty: parseInt(row.Difficulty || row.difficulty || '0', 10),
            cpc: parseFloat(row.CPC || row.cpc || '0'),
            // Default to neutral if trend isn't specified
            trend: (row.Trend || row.trend || 'neutral').toLowerCase() as "up" | "neutral" | "down"
          };
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
