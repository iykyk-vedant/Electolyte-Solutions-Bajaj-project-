import { TagEntry } from './types';

/**
 * Utility function to export tag entries to Excel format
 * 
 * Sends only the dcNo filter to the API. The server queries the database
 * directly, avoiding request body size limits entirely.
 * 
 * @returns Promise that resolves when the file download is triggered
 */
export async function exportTagEntriesToExcel(dcNo?: string): Promise<void> {
  try {
    // Only send the dcNo filter — the server queries the DB directly
    const response = await fetch('/api/export-excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dcNo: dcNo || null }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate Excel file');
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Filename: {DC_NO}_{date}.xlsx
    const dateStamp = new Date().toISOString().split('T')[0];
    if (dcNo) {
      link.download = `${dcNo}_${dateStamp}.xlsx`;
    } else {
      link.download = `All_Entries_${dateStamp}.xlsx`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}
