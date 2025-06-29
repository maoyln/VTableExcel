/**
 * Excel单元格引用和范围计算工具
 */

// 解析单元格引用，如 "A3" -> {col: 0, row: 3}
export function parseCellReference(cellRef: string): {
  col: number;
  row: number;
} {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/i);
  if (!match) {
    throw new Error(`无效的单元格引用: ${cellRef}`);
  }

  const colStr = match[1].toUpperCase();
  const row = parseInt(match[2]);

  // 将列字母转换为数字 (A=0, B=1, ..., Z=25, AA=26, ...)
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  col -= 1; // 调整为0基索引
  return { col, row };
}

// 解析范围引用，如 "B4:B9" -> {start: {col: 1, row: 4}, end: {col: 1, row: 9}}
export function parseRangeReference(rangeRef: string): {
  start: { col: number; row: number };
  end: { col: number; row: number };
} {
  const parts = rangeRef.split(":");
  if (parts.length !== 2) {
    throw new Error(`无效的范围引用: ${rangeRef}`);
  }

  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);

  return { start, end };
}

// 检查是否为单元格引用
export function isCellReference(ref: string): boolean {
  return /^[A-Z]+\d+$/i.test(ref);
}

// 检查是否为范围引用
export function isRangeReference(ref: string): boolean {
  return /^[A-Z]+\d+:[A-Z]+\d+$/i.test(ref);
}

// 生成范围内的所有单元格引用
export function generateCellRange(
  rangeRef: string
): { col: number; row: number }[] {
  const range = parseRangeReference(rangeRef);
  const cells: { col: number; row: number }[] = [];

  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);

  for (let col = minCol; col <= maxCol; col++) {
    for (let row = minRow; row <= maxRow; row++) {
      cells.push({ col, row });
    }
  }

  return cells;
}

// 将列数字转换为字母
export function colToLetter(col: number): string {
  let result = "";
  while (col >= 0) {
    result = String.fromCharCode(65 + (col % 26)) + result;
    col = Math.floor(col / 26) - 1;
  }
  return result;
}

// 将单元格坐标转换为引用字符串
export function cellToReference(col: number, row: number): string {
  return colToLetter(col) + row.toString();
}
