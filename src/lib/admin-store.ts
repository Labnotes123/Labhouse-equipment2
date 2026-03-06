import fs from "fs";
import path from "path";
import {
  mockUserProfiles,
  mockProfiles,
  mockBranches,
  mockPositions,
  mockSuppliers,
  mockDepartments,
  mockInstallationLocations,
  countries as mockCountries,
  mockHistoryConfig,
  type UserProfile,
  type Profile,
  type Branch,
  type Position,
  type Supplier,
  type Permission,
  type Department,
  type InstallationLocation,
  type HistoryConfig,
} from "@/lib/mockData";

// Shared in-memory store with simple file persistence (data/admin-store.json)
type AdminStore = {
  users: UserProfile[];
  profiles: Profile[];
  branches: Branch[];
  positions: Position[];
  suppliers: Supplier[];
  departments: Department[];
  installationLocations: InstallationLocation[];
  countries: string[];
  historyConfig: HistoryConfig;
};

const STORE_KEY = "__admin_store__";
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-store.json");

const DEFAULT_STORE: AdminStore = {
  users: [...mockUserProfiles],
  profiles: [...mockProfiles],
  branches: [...mockBranches],
  positions: [...mockPositions],
  suppliers: [...mockSuppliers],
  departments: [...mockDepartments],
  installationLocations: [...mockInstallationLocations],
  countries: [...mockCountries],
  historyConfig: { ...mockHistoryConfig },
};

function loadFromDisk(): AdminStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<AdminStore>;
      return {
        ...DEFAULT_STORE,
        ...parsed,
        users: parsed.users ?? DEFAULT_STORE.users,
        profiles: parsed.profiles ?? DEFAULT_STORE.profiles,
        branches: parsed.branches ?? DEFAULT_STORE.branches,
        positions: parsed.positions ?? DEFAULT_STORE.positions,
        suppliers: parsed.suppliers ?? DEFAULT_STORE.suppliers,
        departments: parsed.departments ?? DEFAULT_STORE.departments,
        installationLocations: parsed.installationLocations ?? DEFAULT_STORE.installationLocations,
        countries: parsed.countries ?? DEFAULT_STORE.countries,
        historyConfig: parsed.historyConfig ?? DEFAULT_STORE.historyConfig,
      };
    }
  } catch (err) {
    console.error("Failed to load admin-store.json, using defaults", err);
  }
  return { ...DEFAULT_STORE };
}

function persist(store: AdminStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist admin store", err);
  }
}

function getStore(): AdminStore {
  const globalAny = globalThis as unknown as Record<string, AdminStore | undefined>;
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = loadFromDisk();
  }
  return globalAny[STORE_KEY]!;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// === USERS ===
export function listUsers(): UserProfile[] {
  return getStore().users;
}

export function findUser(id: string): UserProfile | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function createUser(payload: Partial<UserProfile>): UserProfile {
  const user: UserProfile = {
    id: makeId("user"),
    username: payload.username || "",
    password: payload.password || "",
    fullName: payload.fullName || "",
    employeeId: payload.employeeId || "",
    phone: payload.phone || "",
    email: payload.email || "",
    position: payload.position || "",
    department: payload.department || "",
    branch: payload.branch || "",
    profileIds: payload.profileIds || [],
    managedDevices: payload.managedDevices || [],
    signature: payload.signature || "",
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  const store = getStore();
  store.users = [user, ...store.users];
  persist(store);
  return user;
}

export function updateUser(id: string, payload: Partial<UserProfile>): UserProfile | undefined {
  const store = getStore();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  const updated: UserProfile = { ...store.users[index], ...payload, updatedAt: new Date().toISOString() };
  store.users[index] = updated;
  persist(store);
  return updated;
}

export function deleteUser(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.users.length;
  store.users = store.users.filter((u) => u.id !== id);
  persist(store);
  return store.users.length < sizeBefore;
}

// === PROFILES ===
export function listProfiles(): Profile[] {
  return getStore().profiles;
}

export function findProfile(id: string): Profile | undefined {
  return getStore().profiles.find((p) => p.id === id);
}

export function createProfile(payload: Partial<Profile>): Profile {
  const profile: Profile = {
    id: makeId("profile"),
    code: payload.code || `PF-${Date.now()}`,
    name: payload.name || "",
    description: payload.description || "",
    permissions: (payload.permissions as Permission[] | undefined) || [],
    detailedPermissions: payload.detailedPermissions,
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  const store = getStore();
  store.profiles = [profile, ...store.profiles];
  persist(store);
  return profile;
}

export function updateProfile(id: string, payload: Partial<Profile>): Profile | undefined {
  const store = getStore();
  const index = store.profiles.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated: Profile = { ...store.profiles[index], ...payload, updatedAt: new Date().toISOString() };
  store.profiles[index] = updated;
  persist(store);
  return updated;
}

export function deleteProfile(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.profiles.length;
  store.profiles = store.profiles.filter((p) => p.id !== id);
  persist(store);
  return store.profiles.length < sizeBefore;
}

// === BRANCHES ===
export function listBranches(): Branch[] {
  return getStore().branches;
}

export function findBranch(id: string): Branch | undefined {
  return getStore().branches.find((b) => b.id === id);
}

export function createBranch(payload: Partial<Branch>): Branch {
  const branch: Branch = {
    id: makeId("branch"),
    code: payload.code || `CN-${Date.now()}`,
    name: payload.name || "",
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  const store = getStore();
  store.branches = [branch, ...store.branches];
  persist(store);
  return branch;
}

export function updateBranch(id: string, payload: Partial<Branch>): Branch | undefined {
  const store = getStore();
  const index = store.branches.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  const updated: Branch = { ...store.branches[index], ...payload, updatedAt: new Date().toISOString() };
  store.branches[index] = updated;
  persist(store);
  return updated;
}

export function deleteBranch(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.branches.length;
  store.branches = store.branches.filter((b) => b.id !== id);
  persist(store);
  return store.branches.length < sizeBefore;
}

// === POSITIONS ===
export function listPositions(): Position[] {
  return getStore().positions;
}

export function findPosition(id: string): Position | undefined {
  return getStore().positions.find((p) => p.id === id);
}

export function createPosition(payload: Partial<Position>): Position {
  const store = getStore();
  const department = payload.departmentId ? store.departments.find((d) => d.id === payload.departmentId) : undefined;
  const branchId = payload.branchId || department?.branchId || "";
  const branchName = payload.branchName || department?.branchName || "";
  const position: Position = {
    id: makeId("position"),
    code: payload.code || `CV-${Date.now()}`,
    name: payload.name || "",
    description: payload.description || "",
    departmentId: payload.departmentId || "",
    departmentName: payload.departmentName || department?.name || "",
    branchId,
    branchName,
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  store.positions = [position, ...store.positions];
  persist(store);
  return position;
}

export function updatePosition(id: string, payload: Partial<Position>): Position | undefined {
  const store = getStore();
  const index = store.positions.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const base = store.positions[index];
  const departmentId = payload.departmentId ?? base.departmentId;
  const department = departmentId ? store.departments.find((d) => d.id === departmentId) : undefined;
  const updated: Position = {
    ...base,
    ...payload,
    departmentId,
    departmentName: payload.departmentName ?? department?.name ?? base.departmentName,
    branchId: payload.branchId ?? department?.branchId ?? base.branchId,
    branchName: payload.branchName ?? department?.branchName ?? base.branchName,
    updatedAt: new Date().toISOString(),
  };
  store.positions[index] = updated;
  persist(store);
  return updated;
}

export function deletePosition(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.positions.length;
  store.positions = store.positions.filter((p) => p.id !== id);
  persist(store);
  return store.positions.length < sizeBefore;
}

// === SUPPLIERS ===
export function listSuppliers(): Supplier[] {
  return getStore().suppliers;
}

export function findSupplier(id: string): Supplier | undefined {
  return getStore().suppliers.find((s) => s.id === id);
}

export function createSupplier(payload: Partial<Supplier>): Supplier {
  const supplier: Supplier = {
    id: makeId("supplier"),
    code: payload.code || `NCC-${Date.now()}`,
    name: payload.name || "",
    address: payload.address || "",
    phone: payload.phone || "",
    email: payload.email || "",
    contactPerson: payload.contactPerson || "",
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  const store = getStore();
  store.suppliers = [supplier, ...store.suppliers];
  persist(store);
  return supplier;
}

export function updateSupplier(id: string, payload: Partial<Supplier>): Supplier | undefined {
  const store = getStore();
  const index = store.suppliers.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  const updated: Supplier = { ...store.suppliers[index], ...payload, updatedAt: new Date().toISOString() };
  store.suppliers[index] = updated;
  persist(store);
  return updated;
}

export function deleteSupplier(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.suppliers.length;
  store.suppliers = store.suppliers.filter((s) => s.id !== id);
  persist(store);
  return store.suppliers.length < sizeBefore;
}

// === DEPARTMENTS ===
export function listDepartments(): Department[] {
  return getStore().departments;
}

export function findDepartment(id: string): Department | undefined {
  return getStore().departments.find((d) => d.id === id);
}

export function createDepartment(payload: Partial<Department>): Department {
  const store = getStore();
  const branch = payload.branchId ? store.branches.find((b) => b.id === payload.branchId) : undefined;
  const department: Department = {
    id: makeId("dept"),
    code: payload.code || `KP-${Date.now()}`,
    name: payload.name || "",
    branchId: payload.branchId || "",
    branchName: payload.branchName || branch?.name || "",
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
  };
  store.departments = [department, ...store.departments];
  persist(store);
  return department;
}

export function updateDepartment(id: string, payload: Partial<Department>): Department | undefined {
  const store = getStore();
  const index = store.departments.findIndex((d) => d.id === id);
  if (index === -1) return undefined;
  const branchId = payload.branchId ?? store.departments[index].branchId;
  const branch = branchId ? store.branches.find((b) => b.id === branchId) : undefined;
  const updated: Department = {
    ...store.departments[index],
    ...payload,
    branchId,
    branchName: payload.branchName ?? branch?.name ?? store.departments[index].branchName,
    updatedAt: new Date().toISOString(),
  } as Department;
  store.departments[index] = updated;
  persist(store);
  return updated;
}

export function deleteDepartment(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.departments.length;
  store.departments = store.departments.filter((d) => d.id !== id);
  persist(store);
  return store.departments.length < sizeBefore;
}

// === INSTALLATION LOCATIONS ===
export function listInstallationLocations(): InstallationLocation[] {
  return getStore().installationLocations;
}

export function findInstallationLocation(id: string): InstallationLocation | undefined {
  return getStore().installationLocations.find((l) => l.id === id);
}

export function createInstallationLocation(payload: Partial<InstallationLocation>): InstallationLocation {
  const store = getStore();
  const department = payload.departmentId ? store.departments.find((d) => d.id === payload.departmentId) : undefined;
  const branchId = payload.branchId || department?.branchId || "";
  const branchName = payload.branchName || department?.branchName || "";
  const location: InstallationLocation = {
    id: makeId("loc"),
    code: payload.code || `VT-${Date.now()}`,
    name: payload.name || "",
    departmentId: payload.departmentId || "",
    departmentName: payload.departmentName || department?.name || "",
    branchId,
    branchName,
    isActive: payload.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  store.installationLocations = [location, ...store.installationLocations];
  persist(store);
  return location;
}

export function updateInstallationLocation(id: string, payload: Partial<InstallationLocation>): InstallationLocation | undefined {
  const store = getStore();
  const index = store.installationLocations.findIndex((l) => l.id === id);
  if (index === -1) return undefined;
  const base = store.installationLocations[index];
  const departmentId = payload.departmentId ?? base.departmentId;
  const department = departmentId ? store.departments.find((d) => d.id === departmentId) : undefined;
  const updated: InstallationLocation = {
    ...base,
    ...payload,
    departmentId,
    departmentName: payload.departmentName ?? department?.name ?? base.departmentName,
    branchId: payload.branchId ?? department?.branchId ?? base.branchId,
    branchName: payload.branchName ?? department?.branchName ?? base.branchName,
    updatedAt: new Date().toISOString(),
  };
  store.installationLocations[index] = updated;
  persist(store);
  return updated;
}

export function deleteInstallationLocation(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.installationLocations.length;
  store.installationLocations = store.installationLocations.filter((l) => l.id !== id);
  persist(store);
  return store.installationLocations.length < sizeBefore;
}

// === COUNTRIES ===
export function listCountries(): string[] {
  return getStore().countries;
}

export function addCountry(name: string): string[] {
  const store = getStore();
  const trimmed = name.trim();
  if (!trimmed) return store.countries;
  if (!store.countries.includes(trimmed)) {
    store.countries = [...store.countries, trimmed];
    persist(store);
  }
  return store.countries;
}

export function deleteCountry(name: string): string[] {
  const store = getStore();
  const before = store.countries.length;
  store.countries = store.countries.filter((c) => c !== name);
  if (store.countries.length !== before) {
    persist(store);
  }
  return store.countries;
}

// === HISTORY CONFIG ===
export function getHistoryConfig(): HistoryConfig {
  return getStore().historyConfig;
}

export function updateHistoryConfig(payload: Partial<HistoryConfig>): HistoryConfig {
  const store = getStore();
  store.historyConfig = {
    ...store.historyConfig,
    ...payload,
    lastAutoDelete: payload.lastAutoDelete ?? store.historyConfig.lastAutoDelete,
  };
  persist(store);
  return store.historyConfig;
}
