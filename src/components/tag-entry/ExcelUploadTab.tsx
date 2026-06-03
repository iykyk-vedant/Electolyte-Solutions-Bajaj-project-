'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Save, Trash2, AlertTriangle, CheckCircle2, UploadCloud } from 'lucide-react';
import { parseExcelFileAction, bulkInsertConsolidatedDataAction } from '@/app/actions/excel-upload-actions';
import { tagEntryEventEmitter, TAG_ENTRY_EVENTS } from '@/lib/event-emitter';

// Display headers for preview table
const DISPLAY_COLUMNS = [
  { key: 'dc_no', label: 'DC No' },
  { key: 'branch', label: 'Branch' },
  { key: 'product_description', label: 'Product Desc' },
  { key: 'product_sr_no', label: 'Product Sr No' },
  { key: 'complaint_no', label: 'Complaint No' },
  { key: 'part_code', label: 'Part Code' },
  { key: 'defect', label: 'Defect' },
  { key: 'visiting_tech_name', label: 'Visiting Tech' },
  { key: 'mfg_month_year', label: 'Mfg Month/Year' },
  { key: 'repair_date', label: 'Repair Date' },
  { key: 'testing', label: 'Testing' },
  { key: 'failure', label: 'Failure' },
  { key: 'status', label: 'Status' },
  { key: 'pcb_sr_no', label: 'PCB Sr No' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'component_change', label: 'Component Change' },
  { key: 'engg_name', label: 'Engg Name' },
  { key: 'tag_entry_by', label: 'Tag Entry By' },
  { key: 'consumption_entry_by', label: 'Consumption Entry By' },
  { key: 'remark', label: 'Remark' },
];

export function ExcelUploadTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; count: number } | null>(null);
  const [entryType, setEntryType] = useState<string>('');
  const [mappedCount, setMappedCount] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaveResult(null);
    setFileName(file.name);
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await parseExcelFileAction(formData);

      if (result.success) {
        setParsedRows(result.rows || []);
        setEntryType(result.entryType || '');
        setMappedCount(result.mappedCount || 0);

        if ((result.unmapped || []).length > 0) {
          toast({
            title: 'Some Columns Not Recognized',
            description: `Skipped: ${(result.unmapped || []).join(', ')}`,
          });
        }

        toast({
          title: 'File Parsed Successfully',
          description: `Found ${(result.rows || []).length} data rows with ${result.mappedCount} mapped columns.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Parse Error',
          description: result.error || 'Failed to parse the Excel file.',
        });
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast({
        variant: 'destructive',
        title: 'Parse Error',
        description: error instanceof Error ? error.message : 'Failed to parse the Excel file.',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = async () => {
    if (parsedRows.length === 0) return;

    setIsSaving(true);
    setSaveResult(null);

    try {
      const result = await bulkInsertConsolidatedDataAction(parsedRows);

      if (result.success) {
        setSaveResult({ success: true, count: result.insertedCount || 0 });
        tagEntryEventEmitter.emit(TAG_ENTRY_EVENTS.ENTRY_SAVED);
        toast({
          title: 'Upload Successful',
          description: `${result.insertedCount} entries saved to database.`,
        });
      } else {
        setSaveResult({ success: false, count: 0 });
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: result.error || 'Failed to save entries.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setParsedRows([]);
    setFileName('');
    setSaveResult(null);
    setEntryType('');
    setMappedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">📊 Excel Upload</h2>
        {parsedRows.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-1 text-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">About Excel Upload</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload an Excel file (.xlsx) with columns matching the database schema.
              Both friendly column names (e.g. &quot;DC No&quot;, &quot;Part Code&quot;) and DB column names
              (e.g. &quot;dc_no&quot;, &quot;part_code&quot;) are auto-detected. Entries can be tag entry, consumption, or both.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isParsing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {parsedRows.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={isSaving || saveResult?.success === true}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm flex items-center gap-2 shadow-md whitespace-nowrap"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save to DB'}
            </Button>
          )}
        </div>

        {/* Parsing indicator */}
        {isParsing && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Parsing Excel file...
          </div>
        )}

        {/* File Info */}
        {fileName && !isParsing && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              <strong>File:</strong> {fileName}
            </span>
            <span className="text-gray-600">
              <strong>Rows:</strong> {parsedRows.length}
            </span>
            <span className="text-gray-600">
              <strong>Columns:</strong> {mappedCount}
            </span>
            {entryType && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {entryType}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Save Result */}
      {saveResult && (
        <div className={`border rounded-lg p-4 mb-4 ${saveResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex gap-3">
            {saveResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <p className={`text-sm font-medium ${saveResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {saveResult.success
                ? `Successfully saved ${saveResult.count} entries to the database.`
                : 'Failed to save entries. Check console for details.'}
            </p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {parsedRows.length > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Preview ({parsedRows.length} rows)
          </h3>
          <div className="overflow-auto flex-1 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  {DISPLAY_COLUMNS.filter(col => parsedRows.some(row => row[col.key])).map(col => (
                    <th key={col.key} className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedRows.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-500 text-xs">{idx + 1}</td>
                    {DISPLAY_COLUMNS.filter(col => parsedRows.some(r => r[col.key])).map(col => (
                      <td key={col.key} className="px-2 py-1 whitespace-nowrap text-sm text-gray-800 max-w-[200px] truncate">
                        {row[col.key] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedRows.length > 100 && (
              <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 border-t">
                Showing first 100 of {parsedRows.length} rows
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {parsedRows.length === 0 && !fileName && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <UploadCloud className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Upload an Excel File</p>
            <p className="text-sm text-gray-400 mt-1">Select an .xlsx file to preview and import data</p>
          </div>
        </div>
      )}
    </div>
  );
}
