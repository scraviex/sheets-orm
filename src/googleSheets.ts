import { google, sheets_v4, Auth } from "googleapis";
import { readFileSync } from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config(); 

const getAuth = async (): Promise<Auth.JWT> => {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!keyPath) throw new Error("GOOGLE_SERVICE_ACCOUNT not found");

  const fullPath = path.resolve(process.cwd(), keyPath);
  const credentials = JSON.parse(readFileSync(fullPath, "utf8"));

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
};

export const getSheets = async (): Promise<sheets_v4.Sheets> => {
  const auth = await getAuth();
  return google.sheets({ version: "v4", auth });
};
