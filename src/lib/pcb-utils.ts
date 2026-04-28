// Utility functions for PCB serial number generation

const PCB_COUNTER_KEY = 'pcb-serial-counter';

// Returns month code letter (A-L) for a given month index (0-based)
export const getMonthCode = (monthIndex: number) => {
  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  return codes[monthIndex] ?? 'A';
};

// Parse mfgMonthYear from various formats and return { monthCode, yearStr }
// Supported formats:
//   - "A26"      → month code letter + 2-digit year  (A=Jan, B=Feb, …, L=Dec)
//   - "MM/YYYY"  → e.g. "01/2026"
//   - "YYYY-MM"  → e.g. "2026-01"
// Falls back to current date if parsing fails or value is empty.
function parseMfgMonthYear(mfgMonthYear?: string): { monthCode: string; yearStr: string } {
  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  if (mfgMonthYear && mfgMonthYear.trim() !== '') {
    const trimmed = mfgMonthYear.trim().toUpperCase();

    // Format 1: Letter + 2-digit year, e.g. "A26", "D26"
    const letterYearMatch = trimmed.match(/^([A-L])(\d{2})$/);
    if (letterYearMatch) {
      return { monthCode: letterYearMatch[1], yearStr: letterYearMatch[2] };
    }

    // Format 2: MM/YYYY, e.g. "01/2026"
    const mmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
    if (mmyyyyMatch) {
      const monthIndex = parseInt(mmyyyyMatch[1], 10) - 1; // 0-based
      if (monthIndex >= 0 && monthIndex < 12) {
        return { monthCode: codes[monthIndex], yearStr: mmyyyyMatch[2].slice(-2) };
      }
    }

    // Format 3: YYYY-MM, e.g. "2026-01"
    const yyyymmMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
    if (yyyymmMatch) {
      const monthIndex = parseInt(yyyymmMatch[2], 10) - 1; // 0-based
      if (monthIndex >= 0 && monthIndex < 12) {
        return { monthCode: codes[monthIndex], yearStr: yyyymmMatch[1].slice(-2) };
      }
    }
  }

  // Fallback: use current date
  const dateObj = new Date();
  return {
    monthCode: codes[dateObj.getMonth()] ?? 'A',
    yearStr: String(dateObj.getFullYear()).slice(-2),
  };
}


// Generates PCB number using provided Part Code, SR No, and Mfg Month/Year
export const generatePcbNumber = (partCode: string, srNo?: string, mfgMonthYear?: string) => {
  if (!partCode) throw new Error('Please provide a Part Code before generating PCB number');

  // Extract the part code (first 7 characters, or pad with zeros if shorter)
  const cleanPartCode = partCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const partCodeSegment = cleanPartCode.substring(0, 7).padEnd(7, '0');

  // Always use today's month and year (hardcoded to current date)
  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const dateObj = new Date();
  const monthCode = codes[dateObj.getMonth()] ?? 'A';
  const yearStr = String(dateObj.getFullYear()).slice(-2);

  // Use SR number if provided, otherwise use counter (default 1)
  let identifier;
  if (srNo) {
    const srNum = parseInt(srNo, 10);
    identifier = isNaN(srNum) ? '0001' : String(srNum).padStart(4, '0'); // 4 digits
  } else {
    identifier = '0001';
  }

  // Base format: ES + partcode + monthCode + yearStr + identifier
  const baseString = `ES${partCodeSegment}${monthCode}${yearStr}${identifier}`;

  // Final format: baseString + checkDigit
  return `${baseString}R`;
};

// Get current date in MM/YYYY format for display purposes
export const getCurrentDateFormatted = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}/${year}`;
};

// Get the PCB number that would be generated for a specific Part Code without incrementing the counter
export const getPcbNumberForDc = (partCode: string, srNo?: string, mfgMonthYear?: string) => {
  if (!partCode) throw new Error('Please provide a Part Code.');

  // Extract the part code (first 7 characters, or pad with zeros if shorter)
  const cleanPartCode = partCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const partCodeSegment = cleanPartCode.substring(0, 7).padEnd(7, '0');

  // Parse month/year from provided mfgMonthYear, fallback to current date
  const { monthCode, yearStr } = parseMfgMonthYear(mfgMonthYear);

  // Use SR number if provided, otherwise default to "0001"
  let identifier;
  if (srNo) {
    const srNum = parseInt(srNo, 10);
    identifier = isNaN(srNum) ? '0001' : String(srNum).padStart(4, '0'); // 4 digits
  } else {
    identifier = '0001';
  }

  // Base format: ES + partcode + monthCode + yearStr + identifier
  const baseString = `ES${partCodeSegment}${monthCode}${yearStr}${identifier}`;

  // Final format: baseString + checkDigit
  return `${baseString}R`;
};