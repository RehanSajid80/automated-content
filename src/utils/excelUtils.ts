
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
    console.log("Processing file:", file.name, file.type);
    
    // More thorough file type validation
    const validExcelMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream',  // Some browsers may use this for Excel files
      'application/wps-office.xlsx', // WPS Office Excel files
      'text/csv'  // CSV files
    ];
    
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    const validExcelExtensions = ['xlsx', 'xls', 'csv'];
    
    const isValidExtension = validExcelExtensions.includes(fileExtension);
    const isValidMimeType = validExcelMimeTypes.includes(file.type) || file.type === '';
    
    console.log("File validation:", { 
      name: fileName,
      type: file.type,
      extension: fileExtension,
      isValidExtension,
      isValidMimeType
    });
    
    if (!isValidExtension) {
      const error = `Invalid file extension: .${fileExtension}. Please use .xlsx, .xls, or .csv files.`;
      console.error(error);
      toast.error("Invalid File Format", {
        description: error,
      });
      reject(new Error(error));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file data");
        }
        
        console.log("File read successful, converting to array buffer");
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        
        // Try to read the workbook - this will fail if it's not a proper Excel file
        console.log("Parsing Excel data with XLSX library");
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Check if there are any sheets
        if (workbook.SheetNames.length === 0) {
          throw new Error("The Excel file doesn't contain any sheets");
        }
        
        // Assume first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Check if we have any data
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error("No data found in the Excel file");
        }

        console.log("Raw Excel Data:", jsonData);
        
        // Transform to match our keyword data structure
        const keywordData: KeywordData[] = [];
        
        for (const row of jsonData as Record<string, any>[]) {
          console.log("Processing row:", row);
          
          // Extract keyword (required field)
          const keyword = String(row.Keyword || row.keyword || '').trim();
          if (!keyword) {
            console.warn("Skipping row with empty keyword:", row);
            continue; // Skip rows without keywords
          }
          
          // Extract and normalize the trend value
          let rawTrend = '';
          
          // Check multiple possible column names for trend
          if (row.Trend !== undefined) rawTrend = String(row.Trend);
          else if (row.trend !== undefined) rawTrend = String(row.trend);
          else if (row.TREND !== undefined) rawTrend = String(row.TREND);
          else if (row.Direction !== undefined) rawTrend = String(row.Direction);
          else if (row.direction !== undefined) rawTrend = String(row.direction);
          else rawTrend = 'neutral'; // Default value
          
          rawTrend = rawTrend.toLowerCase().trim();
          console.log("Raw trend value:", rawTrend);
          
          // Determine the normalized trend value
          let normalizedTrend: "up" | "neutral" | "down" = "neutral";
          
          // Expanded list of possible trend indicators
          const upTrends = ["up", "increasing", "growth", "positive", "+", "increase", "rising", "higher", "upward", "growing", "improved", "better", "good"];
          const downTrends = ["down", "decreasing", "decline", "negative", "-", "decrease", "falling", "lower", "downward", "dropping", "reduced", "worse", "bad"];
          
          if (upTrends.includes(rawTrend)) {
            normalizedTrend = "up";
          } else if (downTrends.includes(rawTrend)) {
            normalizedTrend = "down";
          }
          
          console.log("Normalized trend:", normalizedTrend);
          
          // Parse numeric values safely with expanded column name options
          const volume = parseInt(String(row.Volume || row.volume || row.VOLUME || '0'), 10);
          
          // Look for difficulty in all possible column names from SEMRush
          let difficulty = 0;
          if (row['Keyword Difficulty'] !== undefined) {
            difficulty = parseInt(String(row['Keyword Difficulty']), 10);
          } else if (row['Personal Keyword Difficulty'] !== undefined) {
            difficulty = parseInt(String(row['Personal Keyword Difficulty']), 10);
          } else if (row.Difficulty !== undefined) {
            difficulty = parseInt(String(row.Difficulty), 10);
          } else if (row.difficulty !== undefined) {
            difficulty = parseInt(String(row.difficulty), 10);
          } else if (row.DIFFICULTY !== undefined) {
            difficulty = parseInt(String(row.DIFFICULTY), 10);
          }
          
          console.log("Parsed difficulty:", difficulty);
          
          // Parse CPC with expanded options
          const cpc = parseFloat(String(row.CPC || row['CPC (USD)'] || row.cpc || row.Cost || row.cost || '0'));
          
          // Create the keyword data object
          const keywordItem: KeywordData = {
            keyword,
            volume: isNaN(volume) ? 0 : volume,
            difficulty: isNaN(difficulty) ? 0 : difficulty,
            cpc: isNaN(cpc) ? 0 : cpc,
            trend: normalizedTrend
          };
          
          console.log("Created keyword item:", keywordItem);
          keywordData.push(keywordItem);
        }
        
        console.log("Final processed data:", keywordData);
        
        if (keywordData.length === 0) {
          throw new Error("No valid keyword data found in the Excel file");
        }
        
        resolve(keywordData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast.error("Import Error", {
          description: error instanceof Error ? error.message : "Failed to process the Excel file. Please check the format.",
        });
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      toast.error("Import Error", {
        description: "Failed to read the file.",
      });
      reject(error);
    };
    
    // Start reading the file
    reader.readAsArrayBuffer(file);
  });
};
