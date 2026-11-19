import * as XLSX from "xlsx";

export function parseExcelSheets(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });

  return workbook.SheetNames.map((name, index) => ({
    name,
    id: String(index),
    order: index,
    celldata: XLSX.utils
      .sheet_to_json(workbook.Sheets[name], {
        header: 1,
        defval: "",
      })
      .flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => ({
          r: rowIndex,
          c: columnIndex,
          v: { v: value, m: String(value ?? "") },
        })),
      ),
  }));
}
