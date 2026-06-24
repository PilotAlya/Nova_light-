import { api } from "./client";

export interface BackupDump {
  [table: string]: any[] | string;
  _exported_at: string;
}

export interface ImportResult {
  restored: string[];
  errors: string[];
}

export async function exportBackup(): Promise<BackupDump> {
  return api.get<BackupDump>("/backup/export");
}

export async function importBackup(dump: BackupDump): Promise<ImportResult> {
  return api.post<ImportResult>("/backup/import", dump);
}
