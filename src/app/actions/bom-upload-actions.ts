'use server';

import ExcelJS from 'exceljs';

// Sanitize text — same helper used in bom-import.ts
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/[•●■◆♪★♠♣♥♦]/g, '*')
    .replace(/[✓✔]/g, 'Y')
    .replace(/[✗✘]/g, 'N')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\u0000-\u007F]/g, '?');
}

export async function uploadBomExcelAction(formData: FormData): Promise<{
  success: boolean;
  summary?: {
    totalRows: number;
    insertedRows: number;
    skippedRows: number;
    invalidRows: number;
  };
  error?: string;
}> {
  try {
    const file = formData.get('file') as File | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      return { success: false, error: 'Invalid file type. Only .xlsx files are accepted.' };
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large. Maximum size is 10 MB.' };
    }

    // Convert File to Buffer and read with ExcelJS
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workbook = new ExcelJS.Workbook();
    await (workbook.xlsx as any).load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return { success: false, error: 'Excel file does not contain any worksheets.' };
    }

    // Parse rows — columns A (1), B (2), C (3) — skip header row 1
    const validEntries: { partCode: string; location: string; description: string }[] = [];
    let invalidRows = 0;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rawPartCode = row.getCell(1).text;
      const rawLocation = row.getCell(2).text;
      const rawDescription = row.getCell(3).text || '';

      const partCode = sanitizeText(rawPartCode).trim();
      const location = sanitizeText(rawLocation).trim();
      const description = sanitizeText(rawDescription).trim();

      // Skip completely empty rows
      if (!partCode && !location && !description) {
        continue;
      }

      // Validate: partCode and location are required
      if (!partCode || !location) {
        invalidRows++;
        continue;
      }

      validEntries.push({ partCode, location, description });
    }

    const totalRows = validEntries.length + invalidRows;

    if (validEntries.length === 0 && invalidRows === 0) {
      return { success: false, error: 'Excel file contains no data rows (only a header or is empty).' };
    }

    // Bulk insert into bom table
    const { bulkInsertBomEntries } = await import('@/lib/pg-db');
    const result = await bulkInsertBomEntries(validEntries);

    return {
      success: true,
      summary: {
        totalRows,
        insertedRows: result.inserted,
        skippedRows: result.skipped,
        invalidRows,
      },
    };
  } catch (error) {
    console.error('Error in uploadBomExcelAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred during upload.',
    };
  }
}
