// Utility functions for PCB serial number generation

const PCB_COUNTER_KEY = 'pcb-serial-counter';

// Returns month code letter (A-L) for a given month index (0-based)
export const getMonthCode = (monthIndex: number) => {
  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  return codes[monthIndex] ?? 'A';
};

// Calculate a simple check digit (Modulo 36)
const calculateCheckDigit = (input: string): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    sum += charCode;
  }
  return chars[sum % 36];
};

// Generates PCB number using provided Part Code and an incrementing counter, always using current month and year
export const generatePcbNumber = (partCode: string, srNo?: string, mfgMonthYear?: string) => {
  if (!partCode) throw new Error('Please provide a Part Code before generating PCB number');

  // Extract the part code (first 7 characters, or pad with zeros if shorter)
  const cleanPartCode = partCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const partCodeSegment = cleanPartCode.substring(0, 7).padEnd(7, '0');

  // Determine month and year
  let dateObj = new Date();
  if (mfgMonthYear) {
    // Parse mfgMonthYear if provided
    if (mfgMonthYear.includes('-')) {
      const parts = mfgMonthYear.split('-');
      if (parts.length >= 2) dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
    } else if (mfgMonthYear.includes('/')) {
      const parts = mfgMonthYear.split('/');
      if (parts.length >= 2) dateObj = new Date(parseInt(parts[1]), parseInt(parts[0]) - 1);
    } else {
      const parsed = new Date(mfgMonthYear);
      if (!isNaN(parsed.getTime())) dateObj = parsed;
    }
  }

  const monthCode = getMonthCode(dateObj.getMonth());
  const yearStr = String(dateObj.getFullYear()).slice(-2);

  // Use SR number if provided, otherwise use counter (default 1)
  let identifier;
  if (srNo) {
    const srNum = parseInt(srNo, 10);
    identifier = isNaN(srNum) ? '0001' : String(srNum).padStart(4, '0'); // 4 digits
  } else {
    identifier = '0001';
  }

  // Base format: ES + partcode + 0 + monthCode + yearStr + identifier
  const baseString = `ES${partCodeSegment}0${monthCode}${yearStr}${identifier}`;

  // Calculate check digit
  const checkDigit = calculateCheckDigit(baseString);

  // Final format: baseString + checkDigit
  return `${baseString}${checkDigit}`;
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

  // Determine month and year from mfgMonthYear input or use current date
  let dateObj = new Date();
  if (mfgMonthYear) {
    // Check if it's a date string like "2024-01" (YYYY-MM) or "01/2024" (MM/YYYY)
    if (mfgMonthYear.includes('-')) {
      const parts = mfgMonthYear.split('-');
      if (parts.length >= 2) {
        // Assuming YYYY-MM
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // 0-indexed
        dateObj = new Date(year, month);
      }
    } else if (mfgMonthYear.includes('/')) {
      const parts = mfgMonthYear.split('/');
      if (parts.length >= 2) {
        // Assuming MM/YYYY
        const month = parseInt(parts[0]) - 1; // 0-indexed
        const year = parseInt(parts[1]);
        dateObj = new Date(year, month);
      }
    } else {
      // Try parsing as normal date string
      const parsed = new Date(mfgMonthYear);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      }
    }
  }

  const monthCode = getMonthCode(dateObj.getMonth());
  const yearStr = String(dateObj.getFullYear()).slice(-2);

  // Use SR number if provided, otherwise default to "0001"
  let identifier;
  if (srNo) {
    const srNum = parseInt(srNo, 10);
    identifier = isNaN(srNum) ? '0001' : String(srNum).padStart(4, '0'); // 4 digits
  } else {
    identifier = '0001';
  }

  // Base format: ES + partcode + 0 + monthCode + yearStr + identifier
  const baseString = `ES${partCodeSegment}0${monthCode}${yearStr}${identifier}`;

  // Calculate check digit
  const checkDigit = calculateCheckDigit(baseString);

  // Final format: baseString + checkDigit
  return `${baseString}${checkDigit}`;
};