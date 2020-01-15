import XLSX from 'xlsx';
import concat from 'concat-stream';
import { isValidUrl } from './isValidUrl';
import { isString } from '.';

export const parseStream = (
  stream: NodeJS.ReadableStream,
): Promise<XLSX.WorkBook> => {
  return new Promise((resolve, reject) => {
    const concatStream = concat(buffer => {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      resolve(workbook);
    });

    stream.pipe(concatStream);
    stream.on('error', reject);
  });
};

export const sheetToArray = (
  sheet: XLSX.WorkSheet,
): (XLSX.CellObject | undefined)[][] => {
  const rangeString = sheet['!ref'];
  if (!rangeString) return [];

  const result: (XLSX.CellObject | undefined)[][] = [];
  const range = XLSX.utils.decode_range(rangeString);

  for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
    const row = [];

    for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
      const cellKey = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
      const cell: XLSX.CellObject | undefined = sheet[cellKey];
      row.push(cell);
    }

    result.push(row);
  }

  return result;
};

export const extractUrls = (workbook: XLSX.WorkBook) => {
  const links: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const sheetArray = sheetToArray(sheet);

    for (let row of sheetArray) {
      for (let cell of row) {
        if (!cell) continue;

        if (isString(cell.v) && isValidUrl(cell.v)) {
          links.push(cell.v);
          continue;
        }

        if (cell.l && isValidUrl(cell.l.Target)) {
          links.push(cell.l.Target);
        }
      }
    }
  }

  return links;
};
