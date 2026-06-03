'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Search } from 'lucide-react';
import { getPartCodesAction, addPartCodeAction, deletePartCodeAction } from '@/app/actions/partcode-actions';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SparePart {
  code: string;
  description: string;
}

export function PartcodeAddTab() {
  const { toast } = useToast();

  const [partCode, setPartCode] = useState('');
  const [description, setDescription] = useState('');
  const [partCodes, setPartCodes] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Load part codes on mount
  useEffect(() => {
    loadPartCodes();
  }, []);

  const loadPartCodes = async () => {
    setIsLoading(true);
    try {
      const result = await getPartCodesAction();
      if (result.success) {
        setPartCodes(result.data || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to load part codes',
        });
      }
    } catch (error) {
      console.error('Error loading part codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!partCode.trim()) {
      toast({ variant: 'destructive', title: 'Missing Part Code', description: 'Please enter a part code.' });
      return;
    }
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Missing Description', description: 'Please enter a product description.' });
      return;
    }

    setIsAdding(true);
    try {
      const result = await addPartCodeAction(partCode, description);
      if (result.success) {
        setPartCodes(result.data || []);
        setPartCode('');
        setDescription('');
        toast({
          title: 'Part Code Added',
          description: `Part code "${partCode}" has been added successfully.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Add',
          description: result.error || 'Failed to add part code.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      const result = await deletePartCodeAction(code);
      if (result.success) {
        setPartCodes(result.data || []);
        toast({
          title: 'Part Code Deleted',
          description: `Part code "${code}" has been removed.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Delete',
          description: result.error || 'Failed to delete part code.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPartCodes = partCodes.filter(
    (pc) =>
      pc.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pc.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-white rounded-md shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">🔧 Partcode Details Add</h2>
        <span className="text-sm text-gray-500">{partCodes.length} part codes</span>
      </div>

      {/* Add New Part Code Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Add New Part Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Part Code</Label>
            <Input
              type="text"
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              placeholder="e.g. 974267"
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Product Description</Label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. MAIN PCB MAJESTY SLIM INDUCTION COOKER"
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAdd}
              disabled={isAdding || !partCode.trim() || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm flex items-center gap-2 shadow-md w-full"
            >
              <Plus className="h-4 w-4" />
              {isAdding ? 'Adding...' : 'Add Part Code'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search part codes..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Part Codes Table */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Description</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading part codes...
                  </td>
                </tr>
              ) : filteredPartCodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    {searchFilter ? 'No part codes match your search.' : 'No part codes found.'}
                  </td>
                </tr>
              ) : (
                filteredPartCodes.map((pc, idx) => (
                  <tr key={pc.code} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono font-medium text-gray-800">{pc.code}</td>
                    <td className="px-4 py-2 text-gray-700">{pc.description}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(pc.code)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state when no data at all */}
      {!isLoading && partCodes.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500 mt-4">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No Part Codes</p>
            <p className="text-sm text-gray-400 mt-1">Add your first part code using the form above</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete part code <strong>{deleteTarget}</strong>?
              This will remove it from the spare-parts.json file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
