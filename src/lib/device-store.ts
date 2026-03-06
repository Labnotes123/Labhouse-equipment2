import fs from "fs";
import path from "path";
import { mockDevices, type Device } from "@/lib/mockData";

// Simple shared store with disk persistence (data/device-store.json)
type DeviceStore = {
  devices: Device[];
  statusHistory: DeviceStatusHistoryEntry[];
  permissionLogs: DevicePermissionLog[];
};

export interface DeviceStatusHistoryEntry {
  id: string;
  deviceId: string;
  deviceCode: string;
  fromStatus: Device["status"];
  toStatus: Device["status"];
  reason?: string;
  actor?: string;
  changedAt: string;
}

export interface DevicePermissionLog {
  id: string;
  deviceId: string;
  deviceCode: string;
  userId: string;
  userName: string;
  action: string;
  performedAt: string;
}

const STORE_KEY = "__device_store__";
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "device-store.json");

const DEFAULT_STORE: DeviceStore = {
  devices: [...mockDevices],
  statusHistory: [],
  permissionLogs: [],
};

function loadFromDisk(): DeviceStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<DeviceStore>;
      return {
        ...DEFAULT_STORE,
        ...parsed,
        devices: parsed.devices ?? DEFAULT_STORE.devices,
        statusHistory: parsed.statusHistory ?? DEFAULT_STORE.statusHistory,
        permissionLogs: parsed.permissionLogs ?? DEFAULT_STORE.permissionLogs,
      };
    }
  } catch (err) {
    console.error("Failed to load device-store.json, using defaults", err);
  }
  return { ...DEFAULT_STORE };
}

function persist(store: DeviceStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist device store", err);
  }
}

function getStore(): DeviceStore {
  const globalAny = globalThis as Record<string, DeviceStore | undefined>;
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = loadFromDisk();
  }
  return globalAny[STORE_KEY]!;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listDevices(status?: string): Device[] {
  const devices = [...getStore().devices];
  if (status) {
    return devices.filter((d) => d.status === status);
  }
  return devices;
}

export function findDevice(id: string): Device | undefined {
  return getStore().devices.find((d) => d.id === id);
}

export function createDevice(payload: Partial<Device>): Device {
  const now = new Date().toISOString();
  const device: Device = {
    id: payload.id || makeId("device"),
    code: payload.code || `TB-${Date.now()}`,
    name: payload.name || "",
    specialty: payload.specialty || "",
    category: payload.category || "",
    deviceType: payload.deviceType || "",
    model: payload.model || "",
    serial: payload.serial || "",
    location: payload.location || "",
    manufacturer: payload.manufacturer || "",
    countryOfOrigin: payload.countryOfOrigin || "",
    yearOfManufacture: payload.yearOfManufacture || "",
    distributor: payload.distributor || "",
    managerHistory: payload.managerHistory || [],
    users: payload.users || [],
    usageStartDate: payload.usageStartDate || now,
    usageTime: payload.usageTime || "",
    installationLocation: payload.installationLocation || "",
    accessories: payload.accessories || [],
    contacts: payload.contacts || [],
    imageUrl: payload.imageUrl,
    status: payload.status || "Đăng ký mới",
    conditionOnReceive: payload.conditionOnReceive || "Máy mới",
    calibrationRequired: payload.calibrationRequired ?? false,
    calibrationFrequency: payload.calibrationFrequency,
    maintenanceRequired: payload.maintenanceRequired ?? false,
    maintenanceFrequency: payload.maintenanceFrequency,
    inspectionRequired: payload.inspectionRequired ?? false,
    inspectionFrequency: payload.inspectionFrequency,
    lastCalibration: payload.lastCalibration,
    nextCalibration: payload.nextCalibration,
    lastMaintenance: payload.lastMaintenance,
    nextMaintenance: payload.nextMaintenance,
    description: payload.description,
  };

  const store = getStore();
  store.devices = [device, ...store.devices];
  persist(store);
  return device;
}

export function updateDevice(id: string, payload: Partial<Device>): Device | undefined {
  const store = getStore();
  const index = store.devices.findIndex((d) => d.id === id);
  if (index === -1) return undefined;

  const updated: Device = {
    ...store.devices[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  } as Device;

  store.devices[index] = updated;
  persist(store);
  return updated;
}

export function deleteDevice(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.devices.length;
  store.devices = store.devices.filter((d) => d.id !== id);
  persist(store);
  return store.devices.length < sizeBefore;
}

export function addDeviceStatusHistory(entry: Omit<DeviceStatusHistoryEntry, "id">): DeviceStatusHistoryEntry {
  const store = getStore();
  const historyEntry: DeviceStatusHistoryEntry = { ...entry, id: makeId("status") };
  store.statusHistory = [historyEntry, ...store.statusHistory];
  persist(store);
  return historyEntry;
}

export function listDeviceStatusHistory(deviceId?: string): DeviceStatusHistoryEntry[] {
  const store = getStore();
  if (deviceId) return store.statusHistory.filter((h) => h.deviceId === deviceId);
  return [...store.statusHistory];
}

export function addDevicePermissionLog(entry: Omit<DevicePermissionLog, "id">): DevicePermissionLog {
  const store = getStore();
  const log: DevicePermissionLog = { ...entry, id: makeId("perm") };
  store.permissionLogs = [log, ...store.permissionLogs];
  persist(store);
  return log;
}

export function listDevicePermissionLogs(deviceId?: string): DevicePermissionLog[] {
  const store = getStore();
  if (deviceId) return store.permissionLogs.filter((l) => l.deviceId === deviceId);
  return [...store.permissionLogs];
}
