import { getSheets } from "./googleSheets";

export class GoogleSheetsORM<T extends Record<string, any>> {
  private async getSheets() {
    return await getSheets();
  }
  private spreadsheetId: string;
  private sheetName: string;

  // 🟢 Hook Before/After Insert & Update
  private beforeInsertHook?: (data: Partial<T>) => Promise<void>;
  private afterInsertHook?: (data: Partial<T>) => Promise<void>;
  private beforeUpdateHook?: (data: Partial<T>) => Promise<void>;
  private afterUpdateHook?: (data: Partial<T>) => Promise<void>;

  constructor(spreadsheetId: string, sheetName: string) {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
  }

  /** 🟢 Register Hooks */
  onBeforeInsert(hook: (data: Partial<T>) => Promise<void>) {
    this.beforeInsertHook = hook;
  }

  onAfterInsert(hook: (data: Partial<T>) => Promise<void>) {
    this.afterInsertHook = hook;
  }

  onBeforeUpdate(hook: (data: Partial<T>) => Promise<void>) {
    this.beforeUpdateHook = hook;
  }

  onAfterUpdate(hook: (data: Partial<T>) => Promise<void>) {
    this.afterUpdateHook = hook;
  }

  /** 🟢 Get all records with optional filtering & pagination */
  async findAll(
    filter?: Partial<T>,
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    const sheets = await this.getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: this.sheetName,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0]; // First row is header
    let records = rows
      .slice(1)
      .map((row) =>
        Object.fromEntries(
          headers.map((key, index) => [key, row[index] || null])
        )
      ) as T[];

    // 🟢 Filter Data if avaible!
    if (filter) {
      records = records.filter((record) =>
        Object.entries(filter).every(
          ([key, value]) => record[key as keyof T] === value
        )
      );
    }

    // 🔢 Pagination (Limit & Offset)
    if (offset !== undefined) records = records.slice(offset);
    if (limit !== undefined) records = records.slice(0, limit);

    return records;
  }

  /** 🔍 Find a single record by column */
  async findOne(column: keyof T, value: string): Promise<T | null> {
    const records = await this.findAll();
    return records.find((record) => record[column] === value) || null;
  }

  /** ➕ Insert new data with validation & hook */
  async insert(data: Partial<T>): Promise<void> {
    if (!data.id || !data.name || data.age === undefined) {
      throw new Error(
        "Invalid data format: 'id', 'name', and 'age' are required"
      );
    }

    if (this.beforeInsertHook) await this.beforeInsertHook(data);

    const sheets = await this.getSheets();
    const existingRecords = await this.findAll();

    const headers =
      existingRecords.length > 0
        ? Object.keys(existingRecords[0])
        : Object.keys(data);
    const newRow = headers.map((header) => (data as any)[header] || "");

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: this.sheetName,
      valueInputOption: "RAW",
      requestBody: {
        values: [newRow],
      },
    });

    if (this.afterInsertHook) await this.afterInsertHook(data);
  }

  /** ✏️ Update record by column with validation & hook */
  async update(
    column: keyof T,
    value: string,
    newData: Partial<T>
  ): Promise<boolean> {
    if (this.beforeUpdateHook) await this.beforeUpdateHook(newData);

    const sheets = await this.getSheets();
    const records = await this.findAll();
    const headers = Object.keys(records[0]);
    const index = records.findIndex((record) => record[column] === value);

    if (index === -1) return false;

    Object.assign(records[index], newData);

    const updatedRows = [
      headers,
      ...records.map((record) => headers.map((header) => record[header] || "")),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: this.sheetName,
      valueInputOption: "RAW",
      requestBody: {
        values: updatedRows,
      },
    });

    if (this.afterUpdateHook) await this.afterUpdateHook(newData);
    return true;
  }

  /** 🗑️ Delete record by column */
  async delete(column: keyof T, value: string): Promise<boolean> {
    const sheets = await this.getSheets();
    const records = await this.findAll();
    const headers = Object.keys(records[0]);
    const filteredRecords = records.filter(
      (record) => record[column] !== value
    );

    if (filteredRecords.length === records.length) return false;

    const updatedRows = [
      headers,
      ...filteredRecords.map((record) =>
        headers.map((header) => record[header] || "")
      ),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: this.sheetName,
      valueInputOption: "RAW",
      requestBody: {
        values: updatedRows,
      },
    });

    return true;
  }
}
