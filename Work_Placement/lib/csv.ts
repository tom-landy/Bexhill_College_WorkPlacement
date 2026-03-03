import { stringify } from "csv-stringify/sync";

export function toCsv(records: Record<string, unknown>[]): string {
  if (records.length === 0) {
    return "";
  }
  const columns = Object.keys(records[0]);
  return stringify(records, { header: true, columns });
}
