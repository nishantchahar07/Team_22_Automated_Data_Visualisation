const xlsx = require('xlsx');

function readSheetToAOA(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
}

function normalizeHeader(cell) {
  if (cell == null) return '';
  return String(cell).trim();
}

function aoaToRows(aoa) {
  if (!aoa || aoa.length === 0) return { headers: [], rows: [] };
  const headers = (aoa[0] || []).map(normalizeHeader);
  const rows = [];
  for (let i = 1; i < aoa.length; i++) {
    const row = aoa[i] || [];
    const obj = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      obj[h] = row[idx] == null ? null : row[idx];
    });
    const empty = Object.values(obj).every(v => v == null || v === '');
    if (!empty) rows.push(obj);
  }
  return { headers, rows };
}

function parseBuffer(fileBuffer, mimeType, originalName) {
  try {
    const wb = xlsx.read(fileBuffer, { type: 'buffer', raw: false });
    const aoa = readSheetToAOA(wb);
    return aoaToRows(aoa);
  } catch (err) {
    err.message = `Failed to parse ${originalName || 'file'}: ${err.message}`;
    throw err;
  }
}

module.exports = { parseBuffer };
