'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadBomExcelAction } from '@/app/actions/bom-upload-actions';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UploadCloud,
  RotateCcw,
} from 'lucide-react';

interface UploadSummary {
  totalRows: number;
  insertedRows: number;
  skippedRows: number;
  invalidRows: number;
}

export function BomUploadTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Client-side validation
    if (!file.name.endsWith('.xlsx')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an Excel file (.xlsx) only.',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Maximum file size is 10 MB.',
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(10);
    setUploadResult(null);
    setUploadError(null);

    try {
      setProgress(30);

      const formData = new FormData();
      formData.append('file', selectedFile);

      setProgress(50);

      const result = await uploadBomExcelAction(formData);

      setProgress(90);

      if (result.success && result.summary) {
        setUploadResult(result.summary);
        toast({
          title: 'Upload Successful',
          description: `${result.summary.insertedRows} new BOM entries inserted, ${result.summary.skippedRows} duplicates skipped.`,
        });
      } else {
        setUploadError(result.error || 'Upload failed.');
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: result.error || 'An error occurred during upload.',
        });
      }

      setProgress(100);
    } catch (error) {
      console.error('Error uploading BOM file:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setUploadError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-md shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">📋 BOM Upload</h2>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">About BOM Upload</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload an Excel (.xlsx) file with BOM data. The file should have three columns:
              <strong> Column A</strong> (Part Code), <strong>Column B</strong> (Location),
              <strong> Column C</strong> (Description). The first row is treated as a header and skipped.
              Duplicate entries (same part code + location + description) will be automatically skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleInputChange}
          className="hidden"
          id="bom-file-input"
        />

        {/* Drag & Drop Zone */}
        {!selectedFile && !uploadResult && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${isDragOver
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-100'
              }
            `}
          >
            <UploadCloud className={`h-12 w-12 mx-auto mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-base font-medium text-gray-700">
              {isDragOver ? 'Drop your file here' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-400 mt-3">.xlsx files only · Max 10 MB</p>
          </div>
        )}

        {/* Selected File Info */}
        {selectedFile && !uploadResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
              <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isUploading}
                className="text-gray-400 hover:text-red-500"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg text-sm flex items-center gap-2 shadow-md"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload & Import BOM'}
              </Button>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-gray-500 mt-1">Processing... {progress}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <div className="flex gap-3">
            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-3"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-green-800">Upload Successful!</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Rows</p>
                  <p className="text-xl font-bold text-gray-800">{uploadResult.totalRows}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Inserted</p>
                  <p className="text-xl font-bold text-green-600">{uploadResult.insertedRows}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Skipped (Duplicates)</p>
                  <p className="text-xl font-bold text-amber-600">{uploadResult.skippedRows}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Invalid Rows</p>
                  <p className="text-xl font-bold text-red-600">{uploadResult.invalidRows}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-4"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Upload Another
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedFile && !uploadResult && !uploadError && !isUploading && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">BOM Upload</p>
            <p className="text-sm text-gray-400 mt-1">Upload an Excel file to import BOM data into the database</p>
          </div>
        </div>
      )}
    </div>
  );
}
