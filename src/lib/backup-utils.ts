/**
 * Backup utility functions for LabHouse Equipment Management System
 * These functions can be used without React hooks
 */

export interface BackupData {
  version: string;
  createdAt: string;
  createdBy: string;
  totalRecords: number;
  data: {
    devices?: any[];
    schedules?: any[];
    incidents?: any[];
    proposals?: any[];
    calibrationRequests?: any[];
    calibrationResults?: any[];
    users?: any[];
    branches?: any[];
    positions?: any[];
    suppliers?: any[];
  };
}

export interface BackupMetadata {
  id: string;
  createdAt: string;
  createdBy: string;
  size: number;
  recordCount: number;
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  autoBackupFrequency: "daily" | "weekly" | "monthly";
  autoBackupTime: string;
  maxBackupsToKeep: number;
}

/**
 * Create a backup of all data
 */
export async function createBackup(
  data: {
    devices?: any[];
    schedules?: any[];
    incidents?: any[];
    proposals?: any[];
    calibrationRequests?: any[];
    calibrationResults?: any[];
    users?: any[];
    branches?: any[];
    positions?: any[];
    suppliers?: any[];
  },
  userName: string
): Promise<{ blob: Blob; data: BackupData }> {
  const allData = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    createdBy: userName,
    totalRecords:
      (data.devices?.length || 0) +
      (data.schedules?.length || 0) +
      (data.incidents?.length || 0) +
      (data.proposals?.length || 0) +
      (data.calibrationRequests?.length || 0) +
      (data.calibrationResults?.length || 0) +
      (data.users?.length || 0) +
      (data.branches?.length || 0) +
      (data.positions?.length || 0) +
      (data.suppliers?.length || 0),
    data: data,
  };

  const jsonString = JSON.stringify(allData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  return { blob, data: allData };
}

/**
 * Download backup file
 */
export function downloadBackup(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  link.href = url;
  link.download = filename || `labhouse_backup_${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate backup file
 */
export function validateBackupFile(file: File): Promise<{
  valid: boolean;
  error?: string;
  data?: BackupData;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.version) {
          resolve({ valid: false, error: "File sao lưu không có phiên bản" });
          return;
        }
        
        if (!data.data) {
          resolve({ valid: false, error: "File sao lưu không có dữ liệu" });
          return;
        }
        
        resolve({ valid: true, data });
      } catch (err) {
        resolve({ valid: false, error: "File không đọc được" });
      }
    };
    reader.onerror = () => {
      resolve({ valid: false, error: "Lỗi đọc file" });
    };
    reader.readAsText(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/**
 * Save backup config to localStorage
 */
export function saveBackupConfig(config: BackupConfig): void {
  localStorage.setItem("backup_config", JSON.stringify(config));
}

/**
 * Load backup config from localStorage
 */
export function loadBackupConfig(): BackupConfig | null {
  const saved = localStorage.getItem("backup_config");
  if (!saved) return null;
  try {
    return JSON.parse(saved) as BackupConfig;
  } catch {
    return null;
  }
}

/**
 * Save backup history to localStorage
 */
export function saveBackupHistory(history: BackupMetadata[]): void {
  localStorage.setItem("backup_history", JSON.stringify(history));
}

/**
 * Load backup history from localStorage
 */
export function loadBackupHistory(): BackupMetadata[] {
  const saved = localStorage.getItem("backup_history");
  if (!saved) return [];
  try {
    return JSON.parse(saved) as BackupMetadata[];
  } catch {
    return [];
  }
}
