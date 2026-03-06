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
  mockScopePermissions,
  mockRoleTemplates,
  mockSecurityPolicy,
  mockConfigAuditLogs,
  type UserProfile,
  type Profile,
  type Branch,
  type Position,
  type Supplier,
  type Permission,
  type Department,
  type InstallationLocation,
  type HistoryConfig,
  type DataScopePermission,
  type RoleTemplate,
  type SecurityPolicy,
  type ConfigAuditLog,
  type DetailedPermission,
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
  scopePermissions: DataScopePermission[];
  roleTemplates: RoleTemplate[];
  securityPolicy: SecurityPolicy;
  configAuditLogs: ConfigAuditLog[];
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
  scopePermissions: [...mockScopePermissions],
  roleTemplates: [...mockRoleTemplates],
  securityPolicy: { ...mockSecurityPolicy },
  configAuditLogs: [...mockConfigAuditLogs],
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
        scopePermissions: parsed.scopePermissions ?? DEFAULT_STORE.scopePermissions,
        roleTemplates: parsed.roleTemplates ?? DEFAULT_STORE.roleTemplates,
        securityPolicy: parsed.securityPolicy ?? DEFAULT_STORE.securityPolicy,
        configAuditLogs: parsed.configAuditLogs ?? DEFAULT_STORE.configAuditLogs,
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

function normalizeScopePermission(scope: DataScopePermission): DataScopePermission {
  return {
    ...scope,
    deviceIds: scope.deviceIds ?? [],
    deviceTypes: scope.deviceTypes ?? [],
  };
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getChangedFields(before: unknown, after: unknown): string[] {
  if (!before || !after || typeof before !== "object" || typeof after !== "object") return [];
  const beforeRecord = before as Record<string, unknown>;
  const afterRecord = after as Record<string, unknown>;
  const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]);
  return [...keys].filter((key) => JSON.stringify(beforeRecord[key]) !== JSON.stringify(afterRecord[key]));
}

function addAuditLog(input: {
  actorName?: string;
  action: ConfigAuditLog["action"];
  targetType: ConfigAuditLog["targetType"];
  targetId: string;
  targetName?: string;
  before?: unknown;
  after?: unknown;
}) {
  const store = getStore();
  const log: ConfigAuditLog = {
    id: makeId("audit"),
    actorName: input.actorName || "System",
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: input.targetName,
    before: input.before,
    after: input.after,
    changedFields: getChangedFields(input.before, input.after),
    changedAt: new Date().toISOString(),
  };
  store.configAuditLogs = [log, ...store.configAuditLogs].slice(0, 500);
}

// === USERS ===
export function listUsers(): UserProfile[] {
  return getStore().users;
}

export function findUser(id: string): UserProfile | undefined {
  return getStore().users.find((u) => u.id === id);
}

export function createUser(payload: Partial<UserProfile>, actorName?: string): UserProfile {
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
  addAuditLog({
    actorName,
    action: "create",
    targetType: "user",
    targetId: user.id,
    targetName: user.fullName,
    after: user,
  });
  persist(store);
  return user;
}

export function updateUser(id: string, payload: Partial<UserProfile>, actorName?: string): UserProfile | undefined {
  const store = getStore();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  const before = store.users[index];
  const updated: UserProfile = { ...before, ...payload, updatedAt: new Date().toISOString() };
  store.users[index] = updated;
  addAuditLog({
    actorName,
    action: "update",
    targetType: "user",
    targetId: id,
    targetName: updated.fullName,
    before,
    after: updated,
  });
  persist(store);
  return updated;
}

export function deleteUser(id: string, actorName?: string): boolean {
  const store = getStore();
  const toDelete = store.users.find((u) => u.id === id);
  const sizeBefore = store.users.length;
  store.users = store.users.filter((u) => u.id !== id);
  if (toDelete && store.users.length < sizeBefore) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "user",
      targetId: id,
      targetName: toDelete.fullName,
      before: toDelete,
    });
  }
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

export function createProfile(payload: Partial<Profile>, actorName?: string): Profile {
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
  addAuditLog({
    actorName,
    action: "create",
    targetType: "profile",
    targetId: profile.id,
    targetName: profile.name,
    after: profile,
  });
  persist(store);
  return profile;
}

export function updateProfile(id: string, payload: Partial<Profile>, actorName?: string): Profile | undefined {
  const store = getStore();
  const index = store.profiles.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const before = store.profiles[index];
  const updated: Profile = { ...before, ...payload, updatedAt: new Date().toISOString() };
  store.profiles[index] = updated;
  addAuditLog({
    actorName,
    action: "update",
    targetType: "profile",
    targetId: id,
    targetName: updated.name,
    before,
    after: updated,
  });
  persist(store);
  return updated;
}

export function deleteProfile(id: string, actorName?: string): boolean {
  const store = getStore();
  const toDelete = store.profiles.find((p) => p.id === id);
  const sizeBefore = store.profiles.length;
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (toDelete && store.profiles.length < sizeBefore) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "profile",
      targetId: id,
      targetName: toDelete.name,
      before: toDelete,
    });
  }
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

export function createBranch(payload: Partial<Branch>, actorName?: string): Branch {
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
  addAuditLog({
    actorName,
    action: "create",
    targetType: "branch",
    targetId: branch.id,
    targetName: branch.name,
    after: branch,
  });
  persist(store);
  return branch;
}

export function updateBranch(id: string, payload: Partial<Branch>, actorName?: string): Branch | undefined {
  const store = getStore();
  const index = store.branches.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  const before = store.branches[index];
  const updated: Branch = { ...before, ...payload, updatedAt: new Date().toISOString() };
  store.branches[index] = updated;
  addAuditLog({
    actorName,
    action: "update",
    targetType: "branch",
    targetId: id,
    targetName: updated.name,
    before,
    after: updated,
  });
  persist(store);
  return updated;
}

export function deleteBranch(id: string, actorName?: string): boolean {
  const store = getStore();
  const toDelete = store.branches.find((b) => b.id === id);
  const sizeBefore = store.branches.length;
  store.branches = store.branches.filter((b) => b.id !== id);
  if (toDelete && store.branches.length < sizeBefore) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "branch",
      targetId: id,
      targetName: toDelete.name,
      before: toDelete,
    });
  }
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

export function createSupplier(payload: Partial<Supplier>, actorName?: string): Supplier {
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
  addAuditLog({
    actorName,
    action: "create",
    targetType: "supplier",
    targetId: supplier.id,
    targetName: supplier.name,
    after: supplier,
  });
  persist(store);
  return supplier;
}

export function updateSupplier(id: string, payload: Partial<Supplier>, actorName?: string): Supplier | undefined {
  const store = getStore();
  const index = store.suppliers.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  const before = store.suppliers[index];
  const updated: Supplier = { ...before, ...payload, updatedAt: new Date().toISOString() };
  store.suppliers[index] = updated;
  addAuditLog({
    actorName,
    action: "update",
    targetType: "supplier",
    targetId: id,
    targetName: updated.name,
    before,
    after: updated,
  });
  persist(store);
  return updated;
}

export function deleteSupplier(id: string, actorName?: string): boolean {
  const store = getStore();
  const toDelete = store.suppliers.find((s) => s.id === id);
  const sizeBefore = store.suppliers.length;
  store.suppliers = store.suppliers.filter((s) => s.id !== id);
  if (toDelete && store.suppliers.length < sizeBefore) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "supplier",
      targetId: id,
      targetName: toDelete.name,
      before: toDelete,
    });
  }
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

export function updateHistoryConfig(payload: Partial<HistoryConfig>, actorName?: string): HistoryConfig {
  const store = getStore();
  const before = { ...store.historyConfig };
  store.historyConfig = {
    ...store.historyConfig,
    ...payload,
    lastAutoDelete: payload.lastAutoDelete ?? store.historyConfig.lastAutoDelete,
  };
  addAuditLog({
    actorName,
    action: "update",
    targetType: "history_config",
    targetId: "history-config",
    targetName: "Cấu hình lịch sử",
    before,
    after: store.historyConfig,
  });
  persist(store);
  return store.historyConfig;
}

// === DATA SCOPE PERMISSIONS ===
export function listScopePermissions(): DataScopePermission[] {
  return getStore().scopePermissions.map(normalizeScopePermission);
}

export function upsertScopePermission(payload: Partial<DataScopePermission>, actorName?: string): DataScopePermission {
  const store = getStore();
  const now = new Date().toISOString();
  const profile = payload.profileId ? store.profiles.find((p) => p.id === payload.profileId) : undefined;
  const existingIndex = payload.id ? store.scopePermissions.findIndex((s) => s.id === payload.id) : -1;

  if (existingIndex >= 0) {
    const before = store.scopePermissions[existingIndex];
    const updated: DataScopePermission = {
      ...before,
      ...payload,
      profileName: payload.profileName ?? profile?.name ?? before.profileName,
      branchIds: payload.branchIds ?? before.branchIds,
      departmentIds: payload.departmentIds ?? before.departmentIds,
      deviceIds: payload.deviceIds ?? before.deviceIds ?? [],
      deviceTypes: payload.deviceTypes ?? before.deviceTypes,
      updatedAt: now,
    };
    store.scopePermissions[existingIndex] = updated;
    addAuditLog({
      actorName,
      action: "update",
      targetType: "scope_permission",
      targetId: updated.id,
      targetName: updated.profileName,
      before,
      after: updated,
    });
    persist(store);
    return updated;
  }

  const created: DataScopePermission = {
    id: makeId("scope"),
    profileId: payload.profileId || "",
    profileName: payload.profileName ?? profile?.name ?? "",
    branchIds: payload.branchIds || [],
    departmentIds: payload.departmentIds || [],
    deviceIds: payload.deviceIds || [],
    deviceTypes: payload.deviceTypes || [],
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: payload.updatedAt,
  };
  store.scopePermissions = [created, ...store.scopePermissions.filter((s) => s.profileId !== created.profileId)];
  addAuditLog({
    actorName,
    action: "create",
    targetType: "scope_permission",
    targetId: created.id,
    targetName: created.profileName,
    after: created,
  });
  persist(store);
  return created;
}

export function deleteScopePermission(id: string, actorName?: string): boolean {
  const store = getStore();
  const before = store.scopePermissions.find((s) => s.id === id);
  const beforeLen = store.scopePermissions.length;
  store.scopePermissions = store.scopePermissions.filter((s) => s.id !== id);
  if (before && store.scopePermissions.length < beforeLen) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "scope_permission",
      targetId: id,
      targetName: before.profileName,
      before,
    });
  }
  persist(store);
  return store.scopePermissions.length < beforeLen;
}

// === ROLE TEMPLATES ===
export function listRoleTemplates(): RoleTemplate[] {
  return getStore().roleTemplates;
}

export function findRoleTemplate(id: string): RoleTemplate | undefined {
  return getStore().roleTemplates.find((t) => t.id === id);
}

export function createRoleTemplate(payload: Partial<RoleTemplate>, actorName?: string): RoleTemplate {
  const store = getStore();
  const now = new Date().toISOString();
  const created: RoleTemplate = {
    id: makeId("template"),
    code: payload.code || `TPL-${Date.now()}`,
    name: payload.name || "",
    description: payload.description || "",
    profileIds: payload.profileIds || [],
    defaultScope: payload.defaultScope || { branchIds: [], departmentIds: [], deviceTypes: [] },
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: payload.updatedAt,
  };
  store.roleTemplates = [created, ...store.roleTemplates];
  addAuditLog({
    actorName,
    action: "create",
    targetType: "role_template",
    targetId: created.id,
    targetName: created.name,
    after: created,
  });
  persist(store);
  return created;
}

export function updateRoleTemplate(id: string, payload: Partial<RoleTemplate>, actorName?: string): RoleTemplate | undefined {
  const store = getStore();
  const index = store.roleTemplates.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const before = store.roleTemplates[index];
  const updated: RoleTemplate = {
    ...before,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  store.roleTemplates[index] = updated;
  addAuditLog({
    actorName,
    action: "update",
    targetType: "role_template",
    targetId: updated.id,
    targetName: updated.name,
    before,
    after: updated,
  });
  persist(store);
  return updated;
}

export function deleteRoleTemplate(id: string, actorName?: string): boolean {
  const store = getStore();
  const before = store.roleTemplates.find((t) => t.id === id);
  const beforeLen = store.roleTemplates.length;
  store.roleTemplates = store.roleTemplates.filter((t) => t.id !== id);
  if (before && store.roleTemplates.length < beforeLen) {
    addAuditLog({
      actorName,
      action: "delete",
      targetType: "role_template",
      targetId: id,
      targetName: before.name,
      before,
    });
  }
  persist(store);
  return store.roleTemplates.length < beforeLen;
}

// === SECURITY POLICY ===
export function getSecurityPolicy(): SecurityPolicy {
  return getStore().securityPolicy;
}

export function updateSecurityPolicy(payload: Partial<SecurityPolicy>, actorName?: string): SecurityPolicy {
  const store = getStore();
  const before = { ...store.securityPolicy };
  store.securityPolicy = {
    ...store.securityPolicy,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  addAuditLog({
    actorName,
    action: "update",
    targetType: "security_policy",
    targetId: "security-policy",
    targetName: "Chinh sach bao mat",
    before,
    after: store.securityPolicy,
  });
  persist(store);
  return store.securityPolicy;
}

export function terminateAllSessions(actorName?: string): { forceLogoutVersion: number } {
  const store = getStore();
  const before = { ...store.securityPolicy };
  store.securityPolicy = {
    ...store.securityPolicy,
    forceLogoutVersion: store.securityPolicy.forceLogoutVersion + 1,
    updatedAt: new Date().toISOString(),
  };
  addAuditLog({
    actorName,
    action: "update",
    targetType: "security_policy",
    targetId: "security-policy",
    targetName: "Dang xuat tat ca thiet bi",
    before,
    after: store.securityPolicy,
  });
  persist(store);
  return { forceLogoutVersion: store.securityPolicy.forceLogoutVersion };
}

// === PERMISSION DIFF ===
type PermissionDiffItem = {
  permissionId: string;
  permissionName: string;
  module: string;
  leftEnabled: boolean;
  rightEnabled: boolean;
};

export function compareProfilePermissions(leftProfileId: string, rightProfileId: string): { leftProfile?: Profile; rightProfile?: Profile; diffs: PermissionDiffItem[] } {
  const store = getStore();
  const leftProfile = store.profiles.find((p) => p.id === leftProfileId);
  const rightProfile = store.profiles.find((p) => p.id === rightProfileId);
  if (!leftProfile || !rightProfile) {
    return { leftProfile, rightProfile, diffs: [] };
  }

  const leftPerms = (leftProfile.detailedPermissions || []) as DetailedPermission[];
  const rightPerms = (rightProfile.detailedPermissions || []) as DetailedPermission[];
  const allIds = new Set([...leftPerms.map((p) => p.id), ...rightPerms.map((p) => p.id)]);

  const diffs: PermissionDiffItem[] = [...allIds]
    .map((id) => {
      const left = leftPerms.find((p) => p.id === id);
      const right = rightPerms.find((p) => p.id === id);
      return {
        permissionId: id,
        permissionName: left?.name || right?.name || id,
        module: left?.module || right?.module || "unknown",
        leftEnabled: !!left?.enabled,
        rightEnabled: !!right?.enabled,
      };
    })
    .filter((item) => item.leftEnabled !== item.rightEnabled);

  return { leftProfile, rightProfile, diffs };
}

// === CONFIG AUDIT ===
export function listConfigAuditLogs(limit = 100): ConfigAuditLog[] {
  return getStore().configAuditLogs.slice(0, Math.max(1, limit));
}
