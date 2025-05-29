
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface FileUploadInputProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  onFileSelect,
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF, Word document, text file, or markdown file");
        return;
      }
      
      setSelectedFile(file);
      onFileSelect(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>📎 Reference Document (Optional)</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Upload a document for the AI to reference when generating content suggestions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.md"
        className="hidden"
        disabled={disabled}
      />
      
      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full h-20 border-dashed border-2 hover:border-primary/50"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload reference document
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, Word, Text, or Markdown (max 10MB)
            </span>
          </div>
        </Button>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
