'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLockStore } from '@/store/lockStore';
import { LockButton } from '@/components/tag-entry/LockButton';
import { useAuth } from '@/contexts/AuthContext';
import { tagEntryEventEmitter, TAG_ENTRY_EVENTS } from '@/lib/event-emitter';
import { bulkCreateScrapEntriesAction } from '@/app/actions/consumption-actions';
import { spareParts } from '@/lib/spare-parts';
import { Upload, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkScrapTabProps {
  dcNumbers: string[];
  dcPartCodes: Record<string, string[]>;
}

export function BulkScrapTab({ dcNumbers = [], dcPartCodes = {} }: BulkScrapTabProps) {
  const { isDcLocked } = useLockStore();
  const { toast } = useToast();
  const { user } = useAuth();

  // Form fields
  const [dcNo, setDcNo] = useState('');
  const [partCode, setPartCode] = useState('');
  const [scrapCount, setScrapCount] = useState('');

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    startSrNo: string;
    endSrNo: string;
    count: number;
  } | null>(null);

  // Progress
  const [progress, setProgress] = useState(0);

  const effectiveDcNo = isDcLocked ? useLockStore.getState().lockedDcNo : dcNo;
  const effectivePartCode = isDcLocked ? useLockStore.getState().lockedPartCode : partCode;

  const handleUploadClick = () => {
    // Validate inputs
    if (!effectiveDcNo) {
      toast({
        variant: 'destructive',
        title: 'Missing DC Number',
        description: 'Please select a DC Number before uploading.'
      });
      return;
    }

    if (!effectivePartCode) {
      toast({
        variant: 'destructive',
        title: 'Missing Part Code',
        description: 'Please select a Part Code before uploading.'
      });
      return;
    }

    const count = parseInt(scrapCount);
    if (isNaN(count) || count < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid Count',
        description: 'Please enter a valid number of scrap PCBs (minimum 1).'
      });
      return;
    }

    if (count > 500) {
      toast({
        variant: 'destructive',
        title: 'Too Many Entries',
        description: 'Maximum 500 entries can be uploaded at once.'
      });
      return;
    }

    // Show confirmation dialog
    setIsConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    // Close dialog first
    setIsConfirmOpen(false);
    
    // Small delay to let dialog close before starting async work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsUploading(true);
    setProgress(10);
    setUploadResult(null);

    const count = parseInt(scrapCount);
    const tagEntryBy = user?.name || user?.email || '';

    try {
      setProgress(30);

      // Call server action for bulk creation
      // Auto-lookup product description from spareParts JSON based on part code
      const sparePartMatch = spareParts.find(sp => sp.code === effectivePartCode);
      const productDescription = sparePartMatch?.description || 'NA';

      console.log('Calling bulkCreateScrapEntriesAction with:', { dcNo: effectiveDcNo, partCode: effectivePartCode, count, tagEntryBy, productDescription });
      const result = await bulkCreateScrapEntriesAction(effectiveDcNo, effectivePartCode, count, tagEntryBy, productDescription);
      console.log('bulkCreateScrapEntriesAction result:', result);

      setProgress(80);

      if (result.success) {
        setUploadResult({
          success: true,
          startSrNo: result.startSrNo || '',
          endSrNo: result.endSrNo || '',
          count: count,
        });

        // Emit event to update SR No in Tag Entry via WebSocket
        tagEntryEventEmitter.emit(TAG_ENTRY_EVENTS.ENTRY_SAVED);

        toast({
          title: 'Bulk Upload Successful',
          description: `${count} scrap PCB entries created (SR No ${result.startSrNo} — ${result.endSrNo}).`
        });
      } else {
        console.error('Bulk upload failed:', result.error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: result.error || 'Failed to create scrap entries.'
        });
      }

      setProgress(100);
    } catch (error) {
      console.error('Error during bulk upload:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred during bulk upload.'
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setScrapCount('');
    setUploadResult(null);
    setProgress(0);
  };

  return (
    <div className="bg-white rounded-md shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">📦 Bulk Scrap Upload</h2>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">About Bulk Scrap Upload</h3>
            <p className="text-sm text-amber-700 mt-1">
              This feature creates multiple scrap PCB entries in the database at once.
              Each entry will be assigned a unique SR No and a generated PCB Sr No.
              All other detail fields will be set to &quot;NA&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DC Number */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">DC No.</Label>
            <div className="flex gap-2">
              <Select
                value={effectiveDcNo}
                onValueChange={setDcNo}
                disabled={isDcLocked || isUploading}
              >
                <SelectTrigger className={`flex-1 ${isDcLocked ? 'bg-gray-100' : ''}`}>
                  <SelectValue placeholder="Select DC No." />
                </SelectTrigger>
                <SelectContent>
                  {dcNumbers
                    .filter(dc => dc != null && dc !== '')
                    .map((dc, index) => (
                      <SelectItem key={`${dc}-${index}`} value={dc}>{dc}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <LockButton dcNo={dcNo} partCode={partCode} />
            </div>
          </div>

          {/* Part Code */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Part Code</Label>
            <Select
              value={effectivePartCode}
              onValueChange={setPartCode}
              disabled={isDcLocked || isUploading}
            >
              <SelectTrigger className={`${isDcLocked ? 'bg-gray-100' : ''}`}>
                <SelectValue placeholder="Select Part Code" />
              </SelectTrigger>
              <SelectContent>
                {(dcPartCodes[effectiveDcNo] || [])
                  .filter(code => code != null && code !== '')
                  .map((code, index) => (
                    <SelectItem key={`${code}-${index}`} value={code}>{code}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scrap Count */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">No. of Scrap PCBs</Label>
            <Input
              type="number"
              min="1"
              max="500"
              value={scrapCount}
              onChange={(e) => setScrapCount(e.target.value)}
              className="w-full"
              placeholder="Enter number (e.g. 10)"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Summary before upload */}
        {effectiveDcNo && effectivePartCode && scrapCount && parseInt(scrapCount) > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Summary:</strong> Will create <strong>{scrapCount}</strong> scrap entries
              under DC <strong>{effectiveDcNo}</strong> with Part Code <strong>{effectivePartCode}</strong>.
              All detail fields will be &quot;NA&quot; and PCB Sr Nos will be auto-generated.
            </p>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleUploadClick}
            disabled={isUploading || !effectiveDcNo || !effectivePartCode || !scrapCount}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-8 rounded-lg text-sm flex items-center gap-2 shadow-md"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Scrap Entries'}
          </Button>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">Creating entries... {progress}%</p>
          </div>
        )}
      </div>

      {/* Success Result */}
      {uploadResult?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-green-800">Upload Successful!</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-700">
                  <strong>{uploadResult.count}</strong> scrap PCB entries created successfully.
                </p>
                <p className="text-sm text-green-700">
                  SR No Range: <strong>{uploadResult.startSrNo}</strong> — <strong>{uploadResult.endSrNo}</strong>
                </p>
                <p className="text-sm text-green-700">
                  DC No: <strong>{effectiveDcNo}</strong> | Part Code: <strong>{effectivePartCode}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-3"
              >
                Upload More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!uploadResult && !isUploading && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Bulk Scrap Upload</p>
            <p className="text-sm text-gray-400 mt-1">Select DC No, Part Code, and enter the number of scrap PCBs to create entries</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Upload</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to create <strong>{scrapCount}</strong> scrap PCB entries in the database
              under DC <strong>{effectiveDcNo}</strong> with Part Code <strong>{effectivePartCode}</strong>.
              <br /><br />
              Each entry will consume a sequential SR No and generate a unique PCB Sr No.
              All other fields will be set to &quot;NA&quot;.
              <br /><br />
              <strong>This action cannot be easily undone.</strong> Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleConfirmUpload}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Yes, Create {scrapCount} Entries
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
