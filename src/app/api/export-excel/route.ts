import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

/**
 * API Route: /api/export-excel
 *
 * Exports consolidated_data entries to Excel.
 * The Excel columns match the DB schema exactly — no renaming, no mapping.
 * Entries are sorted by part_code ASC, then sr_no ASC (numeric).
 */

// DB columns in the exact order they appear in the consolidated_data table
const DB_COLUMNS = [
  'id',
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
  'dispatch_entry_by',
  'dispatch_date',
  'created_at',
  'updated_at',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries, dcNo } = body;

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No entries to export' }, { status: 400 });
    }

    // Sort: part_code ASC, then sr_no ASC (numeric)
    const sortedEntries = [...entries].sort((a: any, b: any) => {
      const partA = (a.part_code || '').toString().toLowerCase();
      const partB = (b.part_code || '').toString().toLowerCase();
      if (partA < partB) return -1;
      if (partA > partB) return 1;
      const srA = parseInt(a.sr_no || '0', 10);
      const srB = parseInt(b.sr_no || '0', 10);
      return srA - srB;
    });

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('consolidated_data');

    // Header row — exact DB column names
    const headerRow = worksheet.addRow(DB_COLUMNS);
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

    // Data rows — write each DB column value as-is
    sortedEntries.forEach((entry: any) => {
      const rowValues = DB_COLUMNS.map((col) => {
        const val = entry[col];
        if (val === null || val === undefined) return '';
        // Format Date objects to readable string
        if (val instanceof Date) {
          return val.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        // If it looks like a date string from Postgres (with T and timezone), trim it
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
      worksheet.autoFilter = `A1:${String.fromCharCode(64 + DB_COLUMNS.length)}${sortedEntries.length + 1}`;
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
