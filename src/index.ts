import { GoogleSheetsORM } from "../src/orm";

// Ambil Spreadsheet ID dan Sheet Name dari environment variable
const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
const SHEET_NAME = process.env.SHEET_NAME!;

// Definisikan tipe data untuk ORM
interface User {
  id: string;
  name: string;
  age: number;
}

const orm = new GoogleSheetsORM<User>(SPREADSHEET_ID, SHEET_NAME);

async function main() {
  // ➕ Insert data baru
  await orm.insert({ id: "1", name: "Alice", age: 25 });

  // 🔍 Cari satu data berdasarkan ID
  const user = await orm.findOne("id", "1");
  console.log("Found User:", user);

  // 📝 Update data
  await orm.update("id", "1", { name: "Alice Updated", age: 26 });

  // 🔄 Ambil semua data dengan pagination (limit: 2, offset: 0)
  const users = await await orm.findAll({ name: "John Updated" }, 10, 0);
  console.log("Users with Pagination:", users);

  // 🗑️ Hapus data berdasarkan ID
  await orm.delete("id", "1");
}

main().catch(console.error);
