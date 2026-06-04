'use client';

import { useState, useEffect } from 'react';
import { searchConsolidatedDataEntriesByPcb, updateConsolidatedDataEntryByProductSrNoAction } from '@/app/actions/consumption-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLockStore } from '@/store/lockStore';
import { LockButton } from '@/components/tag-entry/LockButton';
import { getPcbNumberForDc } from '@/lib/pcb-utils';
import { Search, RotateCcw, Pencil, Save, X } from 'lucide-react';

interface SearchPCBTabProps {
  dcNumbers: string[];
  dcPartCodes: Record<string, string[]>;
}

interface PCBDetails {
  id?: string;
  srNo: string;
  dcNo: string;
  dcDate: string;
  branch: string;
  bccdName: string;
  productDescription: string;
  productSrNo: string;
  dateOfPurchase: string;
  complaintNo: string;
  partCode: string;
  natureOfDefect: string;
  visitingTechName: string;
  mfgMonthYear: string;
  repairDate: string;
  testing: string;
  failure: string;
  status: string;
  pcbSrNo: string;
  analysis: string;
  componentChange: string;
  enggName: string;
  validationResult: string;
  dispatchDate: string;
  dispatchEntryBy: string;
  tagEntryBy: string;
  consumptionEntryBy: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// Fields that are NOT editable (per user requirement)
const NON_EDITABLE_FIELDS = new Set([
  'srNo', 'dcNo', 'productDescription', 'partCode', 'pcbSrNo', 'tagEntryBy', 'consumptionEntryBy',
  'id', 'createdAt', 'updatedAt',
]);

// Helper to format a date value to display string
function formatDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    // If it's already a short date, return as-is
    if (val.length <= 10) return val;
    // Try to parse and format
    try {
      return new Date(val).toISOString().split('T')[0];
    } catch { return val; }
  }
  if (typeof val === 'object' && 'toISOString' in val) {
    return (val as Date).toISOString().split('T')[0];
  }
  try { return new Date(val).toISOString().split('T')[0]; }
  catch { return String(val); }
}

function mapEntryToDetails(entry: any): PCBDetails {
  return {
    id: entry.id,
    srNo: entry.sr_no || '',
    dcNo: entry.dc_no || '',
    dcDate: formatDate(entry.dc_date),
    branch: entry.branch || '',
    bccdName: entry.bccd_name || '',
    productDescription: entry.product_description || '',
    productSrNo: entry.product_sr_no || '',
    dateOfPurchase: formatDate(entry.date_of_purchase),
    complaintNo: entry.complaint_no || '',
    partCode: entry.part_code || '',
    natureOfDefect: entry.nature_of_defect || entry.defect || '',
    visitingTechName: entry.visiting_tech_name || '',
    mfgMonthYear: entry.mfg_month_year || '',
    repairDate: formatDate(entry.repair_date),
    testing: entry.testing || '',
    failure: entry.failure || '',
    status: entry.status || '',
    pcbSrNo: entry.pcb_sr_no || '',
    analysis: entry.analysis || '',
    componentChange: entry.component_change || '',
    enggName: entry.engg_name || '',
    validationResult: entry.validation_result || '',
    dispatchDate: formatDate(entry.dispatch_date),
    dispatchEntryBy: entry.dispatch_entry_by || '',
    tagEntryBy: entry.tag_entry_by || '',
    consumptionEntryBy: entry.consumption_entry_by || '',
    remark: entry.remark || '',
    createdAt: formatDate(entry.created_at),
    updatedAt: formatDate(entry.updated_at),
  };
}

// Standalone DetailRow component — defined outside SearchPCBTab to prevent
// React from re-creating the component on every parent render, which would
// unmount/remount inputs and break typing in edit mode.
function DetailRow({
  label,
  field,
  value,
  type = 'text',
  isEditing,
  editData,
  onEditChange,
}: {
  label: string;
  field: keyof PCBDetails;
  value: string;
  type?: string;
  isEditing: boolean;
  editData: PCBDetails | null;
  onEditChange: (field: keyof PCBDetails, value: string) => void;
}) {
  const isFieldEditable = isEditing && !NON_EDITABLE_FIELDS.has(field);
  const currentValue = isEditing && editData ? editData[field] : value;

  return (
    <div className="flex border-b border-gray-100 last:border-b-0">
      <div className="w-2/5 py-2.5 px-4 bg-gray-50 text-sm font-medium text-gray-600 border-r border-gray-100">
        {label}
      </div>
      <div className="w-3/5 py-2.5 px-4 text-sm text-gray-900">
        {isFieldEditable ? (
          type === 'select-status' ? (
            <select
              value={currentValue || ''}
              onChange={(e) => onEditChange(field, e.target.value)}
              className="w-full p-1 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="OK">OK</option>
              <option value="NFF">NFF</option>
              <option value="SCRAP">SCRAP</option>
              <option value="CRITICAL ISSUE">CRITICAL ISSUE</option>
              <option value="PRODUCT PENDING">PRODUCT PENDING</option>
            </select>
          ) : type === 'select-testing' ? (
            <select
              value={currentValue || ''}
              onChange={(e) => onEditChange(field, e.target.value)}
              className="w-full p-1 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </select>
          ) : type === 'textarea' ? (
            <textarea
              value={currentValue || ''}
              onChange={(e) => onEditChange(field, e.target.value)}
              rows={2}
              className="w-full p-1 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={currentValue || ''}
              onChange={(e) => onEditChange(field, e.target.value)}
              className="w-full p-1 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => onEditChange(field, e.target.value)}
              className="w-full p-1 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )
        ) : (
          currentValue || <span className="text-gray-400 italic">—</span>
        )}
      </div>
    </div>
  );
}

export function SearchPCBTab({ dcNumbers = [], dcPartCodes = {} }: SearchPCBTabProps) {
  const { isDcLocked } = useLockStore();
  const { toast } = useToast();

  // Search fields
  const [dcNo, setDcNo] = useState('');
  const [partCode, setPartCode] = useState('');
  const [mfgMonthYear, setMfgMonthYear] = useState('');
  const [srNo, setSrNo] = useState('');

  // Results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<PCBDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PCBDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSrNoIncrement = () => {
    const currentSrNo = parseInt(srNo || '0');
    if (!isNaN(currentSrNo)) {
      setSrNo(String(currentSrNo + 1).padStart(3, '0'));
    }
  };

  const handleSrNoDecrement = () => {
    const currentSrNo = parseInt(srNo || '0');
    if (!isNaN(currentSrNo) && currentSrNo > 1) {
      setSrNo(String(currentSrNo - 1).padStart(3, '0'));
    }
  };

  const handleFind = async () => {
    if (!partCode || !mfgMonthYear || !srNo) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all search fields: Part Code, Mfg Month/Year, and Serial No.'
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setIsEditing(false);
    setEditData(null);

    try {
      // Generate PCB Sr No (same as consumption tab)
      const pcbSrNo = getPcbNumberForDc(partCode, srNo, mfgMonthYear);
      console.log('Search PCB Tab - Generated PCB Sr No:', pcbSrNo);

      const result = await searchConsolidatedDataEntriesByPcb('', partCode, pcbSrNo);

      if (result.success) {
        const entries = result.data || [];

        if (entries.length === 0) {
          toast({
            variant: 'destructive',
            title: 'No Results',
            description: 'No PCB found matching the provided search criteria.'
          });
          setSearchResults([]);
          setSelectedDetails(null);
        } else if (entries.length === 1) {
          setSearchResults(entries);
          setSelectedDetails(mapEntryToDetails(entries[0]));
          toast({
            title: 'PCB Found',
            description: 'PCB details loaded successfully.'
          });
        } else {
          setSearchResults(entries);
          setSelectedDetails(null);
          toast({
            title: 'Multiple Results Found',
            description: `Found ${entries.length} PCBs matching your criteria. Click one to view details.`
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Search Failed',
          description: result.error || 'Failed to search for PCB'
        });
      }
    } catch (error) {
      console.error('Error searching for PCB:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'An error occurred while searching for PCB'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (entry: any) => {
    setSelectedDetails(mapEntryToDetails(entry));
    setIsEditing(false);
    setEditData(null);
  };

  const handleClear = () => {
    setPartCode('');
    setMfgMonthYear('');
    setSrNo('');
    setSearchResults([]);
    setSelectedDetails(null);
    setHasSearched(false);
    setIsEditing(false);
    setEditData(null);
  };

  // Edit mode handlers
  const handleStartEdit = () => {
    if (selectedDetails) {
      setEditData({ ...selectedDetails });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleEditChange = (field: keyof PCBDetails, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!editData || !editData.productSrNo) {
      toast({ variant: 'destructive', title: 'Error', description: 'No entry to save.' });
      return;
    }

    setIsSaving(true);
    try {
      const updateResult = await updateConsolidatedDataEntryByProductSrNoAction(editData.productSrNo, {
        srNo: editData.srNo,
        dcNo: editData.dcNo,
        dcDate: editData.dcDate,
        branch: editData.branch,
        bccdName: editData.bccdName,
        productDescription: editData.productDescription,
        productSrNo: editData.productSrNo,
        dateOfPurchase: editData.dateOfPurchase,
        complaintNo: editData.complaintNo,
        partCode: editData.partCode,
        natureOfDefect: editData.natureOfDefect,
        visitingTechName: editData.visitingTechName,
        mfgMonthYear: editData.mfgMonthYear,
        pcbSrNo: editData.pcbSrNo,
        repairDate: editData.repairDate,
        testing: editData.testing,
        failure: editData.failure,
        status: editData.status,
        analysis: editData.analysis,
        componentChange: editData.componentChange,
        enggName: editData.enggName,
        dispatchDate: editData.dispatchDate,
        dispatchEntryBy: editData.dispatchEntryBy,
        tagEntryBy: editData.tagEntryBy,
        consumptionEntryBy: editData.consumptionEntryBy,
        remark: editData.remark,
      });

      if (updateResult.success) {
        setSelectedDetails({ ...editData });
        setIsEditing(false);
        setEditData(null);
        toast({ title: 'Saved', description: 'PCB entry updated successfully.' });
      } else {
        toast({ variant: 'destructive', title: 'Save Failed', description: updateResult.error || 'Failed to save changes.' });
      }
    } catch (error) {
      console.error('Error saving PCB entry:', error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset selection when search params change
  useEffect(() => {
    if (partCode || mfgMonthYear || srNo) {
      setSelectedDetails(null);
      setSearchResults([]);
      setHasSearched(false);
      setIsEditing(false);
      setEditData(null);
    }
  }, [partCode, mfgMonthYear, srNo]);

  return (
    <div className="bg-white rounded-md shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold text-gray-800">🔍 Search PCB</h2>
        <div className="flex gap-2">
          {selectedDetails && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="flex items-center gap-1 text-sm text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 text-sm text-green-600 border-green-300 hover:bg-green-50"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-sm text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </>
          )}
          {hasSearched && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-1 text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Search
            </Button>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DC No.</label>
            <div className="flex gap-2">
              <Select
                value={isDcLocked ? useLockStore.getState().lockedDcNo : dcNo}
                onValueChange={setDcNo}
                disabled={isDcLocked || !!selectedDetails}
              >
                <SelectTrigger className={`flex-1 ${isDcLocked || selectedDetails ? 'bg-gray-100' : ''}`}>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Part Code</label>
            <Select
              value={isDcLocked ? useLockStore.getState().lockedPartCode : partCode}
              onValueChange={setPartCode}
              disabled={isDcLocked || !!selectedDetails}
            >
              <SelectTrigger className={`${isDcLocked || selectedDetails ? 'bg-gray-100' : ''}`}>
                <SelectValue placeholder="Select Part Code" />
              </SelectTrigger>
              <SelectContent>
                {(dcPartCodes[dcNo] || [])
                  .filter(code => code != null && code !== '')
                  .map((code, index) => (
                    <SelectItem key={`${code}-${index}`} value={code}>{code}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mfg Month/Year (MM/YYYY)</label>
            <Input
              type="text"
              value={mfgMonthYear}
              onChange={(e) => setMfgMonthYear(e.target.value)}
              className="w-full"
              placeholder="MM/YYYY"
              disabled={!!selectedDetails}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Serial No.</label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={handleSrNoIncrement}
                  className="text-gray-700 hover:text-gray-900 px-1"
                  disabled={!!selectedDetails}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleSrNoDecrement}
                  className="text-gray-700 hover:text-gray-900 px-1"
                  disabled={!!selectedDetails}
                >
                  -
                </button>
              </div>
            </div>
            <Input
              type="text"
              value={srNo}
              onChange={(e) => setSrNo(e.target.value)}
              className="w-full"
              placeholder="Enter Serial No."
              disabled={!!selectedDetails}
            />
          </div>
          <div className="mt-4 flex justify-center md:col-span-4">
            <Button
              onClick={handleFind}
              disabled={isSearching || !!selectedDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded text-sm flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Find PCB'}
            </Button>
          </div>
        </div>
      </div>

      {/* Multiple Search Results */}
      {searchResults.length > 1 && !selectedDetails && (
        <div className="mb-4 bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Search Results ({searchResults.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {searchResults.map((entry, index) => (
              <div
                key={entry.id || index}
                className="p-2 border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => handleSelectResult(entry)}
              >
                <div className="flex justify-between">
                  <span className="text-sm">DC: {entry.dc_no} | Part: {entry.part_code} | PCB: {entry.pcb_sr_no}</span>
                  <span className="text-xs text-gray-500">Click to view</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Mode Banner */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <strong>Edit Mode:</strong> Modify the fields below and click <strong>Save</strong> to persist changes.
            Fields in gray are read-only.
          </p>
        </div>
      )}

      {/* PCB Details - Vertical Card Layout */}
      {selectedDetails && (
        <div className="flex-1 overflow-auto text-sm">
          {/* Tag Entry Section */}
          <div className="mb-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-md font-semibold text-sm">
              📋 Tag Entry Information
            </div>
            <div className="border border-gray-200 rounded-b-md overflow-hidden">
              <DetailRow label="Sr No" field="srNo" value={selectedDetails.srNo} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="DC No" field="dcNo" value={selectedDetails.dcNo} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="DC Date" field="dcDate" value={selectedDetails.dcDate} type="date" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Branch" field="branch" value={selectedDetails.branch} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="BCCD Name" field="bccdName" value={selectedDetails.bccdName} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Product Description" field="productDescription" value={selectedDetails.productDescription} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Product Sr No" field="productSrNo" value={selectedDetails.productSrNo} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Date of Purchase" field="dateOfPurchase" value={selectedDetails.dateOfPurchase} type="date" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Complaint No" field="complaintNo" value={selectedDetails.complaintNo} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Part Code" field="partCode" value={selectedDetails.partCode} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Nature of Defect" field="natureOfDefect" value={selectedDetails.natureOfDefect} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Visiting Tech Name" field="visitingTechName" value={selectedDetails.visitingTechName} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Mfg Month/Year" field="mfgMonthYear" value={selectedDetails.mfgMonthYear} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
            </div>
          </div>

          {/* Consumption Section */}
          <div className="mb-4">
            <div className="bg-amber-600 text-white px-4 py-2 rounded-t-md font-semibold text-sm">
              🔧 Consumption Information
            </div>
            <div className="border border-gray-200 rounded-b-md overflow-hidden">
              <DetailRow label="Repair Date" field="repairDate" value={selectedDetails.repairDate} type="date" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Testing" field="testing" value={selectedDetails.testing} type="select-testing" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Failure" field="failure" value={selectedDetails.failure} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Status" field="status" value={selectedDetails.status} type="select-status" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="PCB Sr No" field="pcbSrNo" value={selectedDetails.pcbSrNo} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Analysis" field="analysis" value={selectedDetails.analysis} type="textarea" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Component Change" field="componentChange" value={selectedDetails.componentChange} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Engineer Name" field="enggName" value={selectedDetails.enggName} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Remark" field="remark" value={selectedDetails.remark} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
            </div>
          </div>

          {/* Dispatch Section */}
          <div className="mb-4">
            <div className="bg-green-600 text-white px-4 py-2 rounded-t-md font-semibold text-sm">
              📦 Dispatch Information
            </div>
            <div className="border border-gray-200 rounded-b-md overflow-hidden">
              <DetailRow label="Dispatch Date" field="dispatchDate" value={selectedDetails.dispatchDate} type="date" isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Dispatch Entry By" field="dispatchEntryBy" value={selectedDetails.dispatchEntryBy} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="mb-4">
            <div className="bg-gray-600 text-white px-4 py-2 rounded-t-md font-semibold text-sm">
              ℹ️ Entry Metadata
            </div>
            <div className="border border-gray-200 rounded-b-md overflow-hidden">
              <DetailRow label="Tag Entry By" field="tagEntryBy" value={selectedDetails.tagEntryBy} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Consumption Entry By" field="consumptionEntryBy" value={selectedDetails.consumptionEntryBy} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Created At" field="createdAt" value={selectedDetails.createdAt} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
              <DetailRow label="Updated At" field="updatedAt" value={selectedDetails.updatedAt} isEditing={isEditing} editData={editData} onEditChange={handleEditChange} />
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedDetails && searchResults.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">Search for a PCB</p>
            <p className="text-sm text-gray-400 mt-1">Enter Part Code, Mfg Month/Year, and Serial No to look up PCB details</p>
          </div>
        </div>
      )}
    </div>
  );
}
