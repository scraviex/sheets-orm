
# 📜 sheets-orm

📊 **Google Sheets sebagai ORM (Object-Relational Mapping)** menggunakan **Node.js & TypeScript**.  
Memungkinkan Anda **menggunakan Google Sheets sebagai database sederhana** dengan fitur:  
✔ **CRUD (Create, Read, Update, Delete)**  
✔ **Validasi data sebelum insert/update**  
✔ **Query filtering untuk pencarian fleksibel**  
✔ **Pagination (Limit & Offset) untuk findAll()**  
✔ **Hooks Before/After Insert & Update**  

## 🚀 Instalasi
```sh
npm install sheets-orm
# atau dengan yarn
yarn add sheets-orm
```

## 🛠 Konfigurasi
Sebelum menggunakan `sheets-orm`, Anda perlu **mengatur Google Sheets API** dan mendapatkan **Service Account JSON**.  

1️⃣ **Buat project di [Google Cloud Console](https://console.cloud.google.com/)**  
2️⃣ **Aktifkan Google Sheets API**  
3️⃣ **Buat Service Account** dan unduh JSON-nya  
4️⃣ **Bagikan akses edit** ke Service Account (gunakan email dari JSON)  
5️⃣ **Simpan JSON kredensial dan atur variabel lingkungan**  

```sh
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id"
```

## 📌 Cara Menggunakan
### 1️⃣ Import Library
```ts
import { GoogleSheetsORM } from "sheets-orm";
```

### 2️⃣ Konfigurasi ORM
```ts
const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
const SHEET_NAME = "your-sheet-name";

interface User {
  id: string;
  name: string;
  age: number;
}

const orm = new GoogleSheetsORM<User>(SPREADSHEET_ID, SHEET_NAME);
```

## 📍 CRUD Operations
### ➕ Insert Data
```ts
await orm.insert({ id: "1", name: "Alice", age: 25 });
```

### 🔍 Find All Data
```ts
const users = await orm.findAll();
console.log(users);
```

### 🔍 Find with Filtering
```ts
const filteredUsers = await orm.findAll({ name: "Alice" });
console.log(filteredUsers);
```

### 📌 Find with Pagination
```ts
const users = await orm.findAll({}, { limit: 10, offset: 20 });
console.log(users);
```

### 🔍 Find One by Column
```ts
const user = await orm.findOne("id", "1");
console.log(user);
```

### ✏️ Update Data
```ts
await orm.update("id", "1", { name: "Alice Updated", age: 26 });
```

### 🗑 Delete Data
```ts
await orm.delete("id", "1");
```

## 🎯 Hooks (Before/After)
Menjalankan fungsi sebelum dan sesudah operasi **insert** & **update**.  

```ts
orm.beforeInsert = async (data) => {
  console.log("Before Insert:", data);
  return data; // Bisa ubah data sebelum insert
};

orm.afterInsert = async (data) => {
  console.log("After Insert:", data);
};

orm.beforeUpdate = async (data) => {
  console.log("Before Update:", data);
  return data;
};

orm.afterUpdate = async (data) => {
  console.log("After Update:", data);
};
```

## 📌 Struktur Data di Google Sheets
| id | name  | age |
|----|-------|-----|
| 1  | Alice | 25  |
| 2  | Bob   | 30  |

ORM akan membaca/mengubah format seperti ini **secara otomatis**.

## 🎨 Advanced Customization
### 🏷 Custom Sheet Name
Gunakan ORM dengan **berbagai sheet berbeda** dalam satu spreadsheet.

```ts
const usersORM = new GoogleSheetsORM<User>(SPREADSHEET_ID, "Users");
const ordersORM = new GoogleSheetsORM<Order>(SPREADSHEET_ID, "Orders");
```

### 📌 Dynamic Range
Jika Anda ingin menentukan range secara manual:

```ts
await orm.findAll({}, { range: "A1:Z100" });
```

### 🔄 Auto Generate ID
Buat `id` otomatis saat insert:

```ts
orm.beforeInsert = async (data) => {
  return { id: Date.now().toString(), ...data };
};
```

## 💡 Kesimpulan
✅ **CRUD langsung ke Google Sheets sebagai database**  
✅ **Filter dan Pagination mendukung data besar**  
✅ **Hooks untuk proses sebelum/sesudah insert & update**  
✅ **Mudah digunakan dalam proyek TypeScript & JavaScript**  

🚀 **Gunakan `sheets-orm` untuk proyek ringan dengan database berbasis Google Sheets!**
