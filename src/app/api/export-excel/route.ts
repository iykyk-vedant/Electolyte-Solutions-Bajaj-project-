import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getAllConsolidatedDataEntries, getConsolidatedDataEntriesByDcNo } from '@/lib/pg-db';

/**
 * API Route: /api/export-excel
 *
 * Exports consolidated_data entries to Excel.
 * Queries the database directly on the server side to avoid body size limits.
 *
 * Column order (29 columns):
 *   sheet_number (row index), sr_no, dc_no, dc_date, branch, bccd_name,
 *   product_description, product_sr_no, date_of_purchase, complaint_no,
 *   part_code, defect, visiting_tech_name, mfg_month_year, tag_entry_date,
 *   repair_date, testing, failure, status, pcb_sr_no, analysis,
 *   component_change, engg_name, tag_entry_by, consumption_entry_by,
 *   remark, consumption_date, dispatch_entry_by, dispatch_date
 *
 * Entries are sorted by pcb_sr_no ASC.
 */

// Excel column headers in the desired order
const EXCEL_HEADERS = [
  'sheet_number',
  'sr_no',
  'dc_no',
  'dc_date',
  'branch',
  'bccd_name',
  'product_description',
  'product_sr_no',
  'date_of_purchase',
  'complaint_no',
  'part_code',
  'defect',
  'visiting_tech_name',
  'mfg_month_year',
  'tag_entry_date',
  'repair_date',
  'testing',
  'failure',
  'status',
  'pcb_sr_no',
  'analysis',
  'component_change',
  'engg_name',
  'tag_entry_by',
  'consumption_entry_by',
  'remark',
  'consumption_date',
  'dispatch_entry_by',
  'dispatch_date',
];

// Mapping from Excel header → actual DB column name (only for renamed/computed columns)
const HEADER_TO_DB: Record<string, string> = {
  tag_entry_date: 'created_at',
  consumption_date: 'updated_at',
};

/** Format a value that might be a Date or ISO string to YYYY-MM-DD */
function formatDateValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) return val.split('T')[0];
  return String(val);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dcNo } = body;

    // Query database directly on the server
    let entries: any[];
    if (dcNo) {
      entries = await getConsolidatedDataEntriesByDcNo(dcNo);
    } else {
      entries = await getAllConsolidatedDataEntries();
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries to export' }, { status: 400 });
    }

    // Sort by pcb_sr_no ascending (string sort)
    const sortedEntries = [...entries].sort((a: any, b: any) => {
      const pcbA = (a.pcb_sr_no || '').toString();
      const pcbB = (b.pcb_sr_no || '').toString();
      return pcbA.localeCompare(pcbB);
    });

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('consolidated_data');

    // Header row
    const headerRow = worksheet.addRow(EXCEL_HEADERS);
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9D9D9' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Date columns that need formatting
    const DATE_COLUMNS = new Set([
      'dc_date', 'date_of_purchase', 'repair_date', 'dispatch_date',
      'tag_entry_date', 'consumption_date',
    ]);

    // Data rows
    sortedEntries.forEach((entry: any, index: number) => {
      const rowValues = EXCEL_HEADERS.map((header) => {
        // sheet_number is just the 1-based row index
        if (header === 'sheet_number') return index + 1;

        // Resolve the actual DB column name
        const dbCol = HEADER_TO_DB[header] || header;
        const val = entry[dbCol];

        if (val === null || val === undefined) return '';

        // Format dates
        if (DATE_COLUMNS.has(header)) return formatDateValue(val);

        // If it looks like a date string from Postgres, trim it
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
          return val.split('T')[0];
        }

        return val;
      });

      const row = worksheet.addRow(rowValues);
      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Auto-size columns
    worksheet.columns.forEach((column) => {
      if (column && column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });

    // AutoFilter
    if (sortedEntries.length > 0) {
      const lastColLetter = String.fromCharCode(64 + EXCEL_HEADERS.length);
      worksheet.autoFilter = `A1:${lastColLetter}${sortedEntries.length + 1}`;
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Filename: {DC_NO}_{date}.xlsx
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = dcNo ? `${dcNo}_${dateStamp}.xlsx` : `All_Entries_${dateStamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel export', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
