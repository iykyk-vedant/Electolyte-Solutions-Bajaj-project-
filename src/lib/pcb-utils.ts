// Utility functions for PCB serial number generation

const PCB_COUNTER_KEY = 'pcb-serial-counter';

// Returns month code letter (A-L) for a given month index (0-based)
export const getMonthCode = (monthIndex: number) => {
  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  return codes[monthIndex] ?? 'A';
};



// Generates PCB number using provided Part Code and an incrementing counter, always using current month and year
export const generatePcbNumber = (partCode: string, srNo?: string, mfgMonthYear?: string) => {
  if (!partCode) throw new Error('Please provide a Part Code before generating PCB number');

  // Extract the part code (first 7 characters, or pad with zeros if shorter)
  const cleanPartCode = partCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const partCodeSegment = cleanPartCode.substring(0, 7).padEnd(7, '0');

  // Always use today's date for month and year (mfgMonthYear is ignored)
  const dateObj = new Date();

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

  // Always use today's date for month and year (mfgMonthYear is ignored)
  const dateObj = new Date();

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
  const baseString = `ES${partCodeSegment}${monthCode}${yearStr}${identifier}`;

  // Final format: baseString + checkDigit
  return `${baseString}R`;
};