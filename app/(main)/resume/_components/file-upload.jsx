"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FileUpload({ onFileSelect, selectedFile, onClear }) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSelectFile = useCallback((file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        validateAndSelectFile(file);
      }
    },
    [validateAndSelectFile]
  );

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("file-upload")?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50",
          selectedFile && "bg-muted/30"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragging ? "text-primary" : "text-muted-foreground"
              )}
            />
          </div>

          {!selectedFile ? (
            <>
              <div>
                <p className="text-lg font-medium mb-1">
                  Drop your resume here, or click the button below
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF and DOCX files (Max 10MB)
                </p>
              </div>
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileInput}
              />
            </>
          ) : (
            <div className="w-full max-w-md">
              <div className="flex items-center gap-3 p-4 bg-background border rounded-lg">
                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
