'use server';

import fs from 'fs';
import path from 'path';

const SPARE_PARTS_PATH = path.join(process.cwd(), 'src', 'lib', 'spare-parts.json');

interface SparePart {
  code: string;
  description: string;
}

function readSparePartsFile(): { spareParts: SparePart[] } {
  const raw = fs.readFileSync(SPARE_PARTS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeSparePartsFile(data: { spareParts: SparePart[] }) {
  fs.writeFileSync(SPARE_PARTS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// Get all part codes
export async function getPartCodesAction() {
  try {
    const data = readSparePartsFile();
    return {
      success: true,
      data: data.spareParts,
    };
  } catch (error) {
    console.error('Error reading spare-parts.json:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read spare parts file',
      data: [],
    };
  }
}

// Add a new part code
export async function addPartCodeAction(code: string, description: string) {
  try {
    if (!code || !code.trim()) {
      return { success: false, error: 'Part code is required' };
    }
    if (!description || !description.trim()) {
      return { success: false, error: 'Product description is required' };
    }

    const data = readSparePartsFile();

    // Check for duplicate
    const existing = data.spareParts.find(
      (sp) => sp.code.trim().toLowerCase() === code.trim().toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        error: `Part code "${code}" already exists with description: "${existing.description}"`,
      };
    }

    // Add the new entry
    data.spareParts.push({
      code: code.trim(),
      description: description.trim().toUpperCase(),
    });

    writeSparePartsFile(data);

    return {
      success: true,
      data: data.spareParts,
    };
  } catch (error) {
    console.error('Error adding part code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add part code',
    };
  }
}

// Delete a part code
export async function deletePartCodeAction(code: string) {
  try {
    const data = readSparePartsFile();

    const index = data.spareParts.findIndex(
      (sp) => sp.code.trim() === code.trim()
    );

    if (index === -1) {
      return { success: false, error: `Part code "${code}" not found` };
    }

    data.spareParts.splice(index, 1);
    writeSparePartsFile(data);

    return {
      success: true,
      data: data.spareParts,
    };
  } catch (error) {
    console.error('Error deleting part code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete part code',
    };
  }
}
