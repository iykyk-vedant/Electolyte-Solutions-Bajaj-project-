'use server';

import ExcelJS from 'exceljs';

// Column name mappings: friendly name -> DB column name
const COLUMN_MAP: Record<string, string> = {
  'sr no': 'sr_no',
  'sr. no': 'sr_no',
  'sr. no.': 'sr_no',
  'serial no': 'sr_no',
  'dc no': 'dc_no',
  'dc no.': 'dc_no',
  'dc number': 'dc_no',
  'dc date': 'dc_date',
  'branch': 'branch',
  'bccd name': 'bccd_name',
  'product description': 'product_description',
  'product desc': 'product_description',
  'product sr no': 'product_sr_no',
  'product sr no.': 'product_sr_no',
  'product serial no': 'product_sr_no',
  'date of purchase': 'date_of_purchase',
  'complaint no': 'complaint_no',
  'complaint no.': 'complaint_no',
  'part code': 'part_code',
  'nature of defect': 'defect',
  'defect': 'defect',
  'visiting tech name': 'visiting_tech_name',
  'visiting tech': 'visiting_tech_name',
  'mfg month year': 'mfg_month_year',
  'mfg month/year': 'mfg_month_year',
  'repair date': 'repair_date',
  'testing': 'testing',
  'failure': 'failure',
  'status': 'status',
  'pcb sr no': 'pcb_sr_no',
  'pcb sr no.': 'pcb_sr_no',
  'pcb serial no': 'pcb_sr_no',
  'analysis': 'analysis',
  'component change': 'component_change',
  'engg name': 'engg_name',
  'engineer name': 'engg_name',
  'engineer': 'engg_name',
  'tag entry by': 'tag_entry_by',
  'consumption entry by': 'consumption_entry_by',
  'dispatch entry by': 'dispatch_entry_by',
  'dispatch date': 'dispatch_date',
  'remark': 'remark',
  // DB column names (snake_case) - map to themselves
  'sr_no': 'sr_no',
  'dc_no': 'dc_no',
  'dc_date': 'dc_date',
  'bccd_name': 'bccd_name',
  'product_description': 'product_description',
  'product_sr_no': 'product_sr_no',
  'date_of_purchase': 'date_of_purchase',
  'complaint_no': 'complaint_no',
  'part_code': 'part_code',
  'visiting_tech_name': 'visiting_tech_name',
  'mfg_month_year': 'mfg_month_year',
  'repair_date': 'repair_date',
  'pcb_sr_no': 'pcb_sr_no',
  'component_change': 'component_change',
  'engg_name': 'engg_name',
  'tag_entry_by': 'tag_entry_by',
  'consumption_entry_by': 'consumption_entry_by',
  'dispatch_entry_by': 'dispatch_entry_by',
  'dispatch_date': 'dispatch_date',
};

function normalizeColumnName(header: string): string | null {
  const cleaned = header.trim().toLowerCase().replace(/[_\s]+/g, ' ').replace(/[.:]/g, '');
  if (COLUMN_MAP[cleaned]) return COLUMN_MAP[cleaned];
  for (const [key, value] of Object.entries(COLUMN_MAP)) {
    const cleanKey = key.replace(/[.:]/g, '');
    if (cleanKey === cleaned) return value;
  }
  return null;
}

function formatCellValue(cell: ExcelJS.CellValue): string {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) {
    return cell.toISOString().split('T')[0];
  }
  if (typeof cell === 'object' && 'result' in cell) {
    // Formula cell - use the result
    return formatCellValue((cell as any).result);
  }
  if (typeof cell === 'object' && 'richText' in cell) {
    return (cell as any).richText.map((rt: any) => rt.text).join('');
  }
  return String(cell);
}

// Parse Excel file and return preview data
export async function parseExcelFileAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided', rows: [], headers: [], mapping: {}, unmapped: [] };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await (workbook.xlsx as any).load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return { success: false, error: 'No worksheet found', rows: [], headers: [], mapping: {}, unmapped: [] };
    }

    // Get headers from row 1
    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    const mapping: Record<number, string> = {};
    const unmapped: string[] = [];

    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const headerText = formatCellValue(cell.value).trim();
      headers.push(headerText);
      const dbCol = normalizeColumnName(headerText);
      if (dbCol) {
        mapping[colNumber] = dbCol;
      } else if (headerText) {
        unmapped.push(headerText);
      }
    });

    // Parse data rows
    const rows: any[] = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const obj: any = {};
      let hasData = false;

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const dbCol = mapping[colNumber];
        if (dbCol) {
          const val = formatCellValue(cell.value);
          if (val) {
            obj[dbCol] = val;
            hasData = true;
          }
        }
      });

      if (hasData) {
        rows.push(obj);
      }
    });

    // Detect entry type
    const dbCols = new Set(Object.values(mapping));
    const hasTagFields = dbCols.has('dc_no') || dbCols.has('product_sr_no') || dbCols.has('complaint_no');
    const hasConsumptionFields = dbCols.has('repair_date') || dbCols.has('testing') || dbCols.has('failure') || dbCols.has('analysis');
    let entryType = 'Unknown';
    if (hasTagFields && hasConsumptionFields) entryType = 'Tag Entry + Consumption';
    else if (hasConsumptionFields) entryType = 'Consumption';
    else if (hasTagFields) entryType = 'Tag Entry';

    return {
      success: true,
      rows,
      headers,
      mappedCount: Object.keys(mapping).length,
      unmapped,
      entryType,
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse Excel file',
      rows: [],
      headers: [],
      mapping: {},
      unmapped: [],
    };
  }
}

// Bulk insert parsed rows into DB
export async function bulkInsertConsolidatedDataAction(rows: any[]) {
  try {
    console.log(`=== BULK INSERT FROM EXCEL: ${rows.length} rows ===`);

    const { bulkInsertConsolidatedDataEntries } = await import('@/lib/pg-db');
    const result = await bulkInsertConsolidatedDataEntries(rows);

    if (result.success) {
      try {
        const wsPort = process.env.WS_PORT || '3002';
        await fetch(`http://localhost:${wsPort}/broadcast`, { method: 'POST' });
      } catch (broadcastErr) {
        console.warn('WebSocket broadcast failed (non-critical):', broadcastErr);
      }

      return {
        success: true,
        insertedCount: result.insertedCount,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to insert entries into database',
      };
    }
  } catch (error) {
    console.error('Error in bulkInsertConsolidatedDataAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
