
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
        const keywordData: KeywordData[] = [];
        
        for (const row of jsonData as Record<string, any>[]) {
          // Extract and normalize the trend value
          const rawTrend = String(row.Trend || row.trend || 'neutral').toLowerCase().trim();
          
          // Determine the normalized trend value
          let normalizedTrend: "up" | "neutral" | "down" = "neutral";
          
          if (["up", "increasing", "growth", "positive", "+", "increase", "rising", "higher"].includes(rawTrend)) {
            normalizedTrend = "up";
          } else if (["down", "decreasing", "decline", "negative", "-", "decrease", "falling", "lower"].includes(rawTrend)) {
            normalizedTrend = "down";
          }
          
          // Create the keyword data object
          const keywordItem: KeywordData = {
            keyword: String(row.Keyword || row.keyword || ''),
            volume: parseInt(String(row.Volume || row.volume || '0'), 10),
            difficulty: parseInt(String(row.Difficulty || row.difficulty || '0'), 10),
            cpc: parseFloat(String(row.CPC || row.cpc || '0')),
            trend: normalizedTrend
          };
          
          keywordData.push(keywordItem);
        }
        
        resolve(keywordData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast({
          title: "Import Error",
          description: "Failed to process the Excel file. Please check the format.",
          variant: "destructive",
        });
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      toast({
        title: "Import Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};
