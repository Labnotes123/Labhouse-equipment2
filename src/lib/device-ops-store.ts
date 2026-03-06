import fs from "fs";
import path from "path";
import { nextTicketCode, type TicketCounterState, buildTicketCode } from "@/lib/ticket-code";
import {
  mockProposals,
  mockIncidents,
  mockSchedules,
  mockCalibrationRequests,
  mockCalibrationResults,
  mockTrainingPlans,
  mockTrainingDocuments,
  mockTrainingResults,
  type NewDeviceProposal,
  type IncidentReport,
  type CalibrationSchedule,
  type CalibrationRequest,
  type CalibrationResult,
  type TrainingPlan,
  type TrainingDocument,
  type TrainingResult,
} from "@/lib/mockData";

// Minimal types for new persisted entities (UI currently defines richer shapes locally).
export interface AcceptanceRecord {
  id: string;
  acceptanceCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  recordType: "handover" | "return" | "transport";
  status: string;
  checklist?: Record<string, unknown>;
  returnReason?: string;
  transportPartner?: string;
  transportContact?: string;
  transportDate?: string;
  deliveredBy?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransferProposal {
  id: string;
  transferCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  plannedTransferDate: string;
  requestedBy: string;
  approver: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LiquidationProposal {
  id: string;
  liquidationCode: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  reason: string;
  method: string;
  estimatedValue: string;
  plannedDate: string;
  requestedBy: string;
  approver: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Shared store for device-related operations with simple disk persistence.
type OpsStore = {
  proposals: NewDeviceProposal[];
  incidents: IncidentReport[];
  schedules: CalibrationSchedule[];
  calibrationRequests: CalibrationRequest[];
  calibrationResults: CalibrationResult[];
  acceptanceRecords: AcceptanceRecord[];
  transferProposals: TransferProposal[];
  liquidationProposals: LiquidationProposal[];
  trainingPlans: TrainingPlan[];
  trainingDocuments: TrainingDocument[];
  trainingResults: TrainingResult[];
  ticketCounters: TicketCounterState;
};

const STORE_KEY = "__device_ops_store__";
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "device-ops-store.json");

const defaultAcceptanceRecords: AcceptanceRecord[] = [
  {
    id: "acc_1",
    acceptanceCode: buildTicketCode("TB-001", "PTN", 1, new Date().getFullYear()),
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    recordType: "handover",
    status: "pending",
    checklist: {},
    createdAt: new Date().toISOString(),
  },
];

const defaultTransferProposals: TransferProposal[] = [
  {
    id: "tr1",
    transferCode: buildTicketCode("TB-001", "PDC", 1, new Date().getFullYear()),
    deviceId: "d1",
    deviceCode: "TB-001",
    deviceName: "Máy phân tích huyết học tự động",
    fromLocation: "Phòng hóa sinh – Huyết học",
    toLocation: "Phòng xét nghiệm vệ tinh - Cơ sở 2",
    reason: "Điều phối khối lượng mẫu theo năng lực vận hành.",
    plannedTransferDate: "2026-03-05",
    requestedBy: "Phạm Thị Kỹ Thuật",
    approver: "Lê Văn Trưởng Phòng",
    status: "Chờ duyệt",
    createdAt: "2026-03-01T08:30:00",
  },
];

const defaultLiquidationProposals: LiquidationProposal[] = [
  {
    id: "tl1",
    liquidationCode: buildTicketCode("TB-006", "PTL", 1, new Date().getFullYear()),
    deviceId: "d6",
    deviceCode: "TB-006",
    deviceName: "Tủ an toàn sinh học cấp II",
    reason: "Thiết bị xuống cấp, chi phí sửa chữa vượt ngưỡng đầu tư mới.",
    method: "Thanh lý bán đấu giá",
    estimatedValue: "35000000",
    plannedDate: "2026-03-10",
    requestedBy: "Vũ Thị Thiết Bị",
    approver: "Trần Thị Giám Đốc",
    status: "Chờ duyệt",
    createdAt: "2026-03-01T09:00:00",
  },
];

const DEFAULT_STORE: OpsStore = {
  proposals: [...mockProposals],
  incidents: [...mockIncidents],
  schedules: [...mockSchedules],
  calibrationRequests: [...mockCalibrationRequests],
  calibrationResults: [...mockCalibrationResults],
  acceptanceRecords: [...defaultAcceptanceRecords],
  transferProposals: [...defaultTransferProposals],
  liquidationProposals: [...defaultLiquidationProposals],
  trainingPlans: [...mockTrainingPlans],
  trainingDocuments: [...mockTrainingDocuments],
  trainingResults: [...mockTrainingResults],
  ticketCounters: {} as TicketCounterState,
};

function loadFromDisk(): OpsStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<OpsStore>;
      return {
        ...DEFAULT_STORE,
        ...parsed,
        proposals: parsed.proposals ?? DEFAULT_STORE.proposals,
        incidents: parsed.incidents ?? DEFAULT_STORE.incidents,
        schedules: parsed.schedules ?? DEFAULT_STORE.schedules,
        calibrationRequests: parsed.calibrationRequests ?? DEFAULT_STORE.calibrationRequests,
        calibrationResults: parsed.calibrationResults ?? DEFAULT_STORE.calibrationResults,
        acceptanceRecords: parsed.acceptanceRecords ?? DEFAULT_STORE.acceptanceRecords,
        transferProposals: parsed.transferProposals ?? DEFAULT_STORE.transferProposals,
        liquidationProposals: parsed.liquidationProposals ?? DEFAULT_STORE.liquidationProposals,
        trainingPlans: parsed.trainingPlans ?? DEFAULT_STORE.trainingPlans,
        trainingDocuments: parsed.trainingDocuments ?? DEFAULT_STORE.trainingDocuments,
        trainingResults: parsed.trainingResults ?? DEFAULT_STORE.trainingResults,
        ticketCounters: parsed.ticketCounters ?? DEFAULT_STORE.ticketCounters,
      };
    }
  } catch (err) {
    console.error("Failed to load device-ops-store.json, using defaults", err);
  }
  return { ...DEFAULT_STORE };
}

function persist(store: OpsStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist device ops store", err);
  }
}

function getStore(): OpsStore {
  const globalAny = globalThis as unknown as Record<string, OpsStore | undefined>;
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = loadFromDisk();
  }
  if (!globalAny[STORE_KEY]!.ticketCounters || Object.keys(globalAny[STORE_KEY]!.ticketCounters).length === 0) {
    globalAny[STORE_KEY]!.ticketCounters = rebuildTicketCounters(globalAny[STORE_KEY]!);
  }
  return globalAny[STORE_KEY]!;
}

function takeTicketCode(store: OpsStore, deviceCode: string, type: Parameters<typeof nextTicketCode>[1]): string {
  const { code, counters } = nextTicketCode(deviceCode || "NO-CODE", type, store.ticketCounters);
  store.ticketCounters = counters;
  return code;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rebuildTicketCounters(store: OpsStore): TicketCounterState {
  const counters: Partial<TicketCounterState> = {};
  const bump = (type: keyof TicketCounterState, code?: string) => {
    if (!code) return;
    const match = code.match(/^(.*)-([A-Z]{3})-(\d{4})-(\d{3})$/);
    if (!match) return;
    const [, , codeType, yearStr, seqStr] = match;
    if (codeType !== type) return;
    const year = Number(yearStr);
    const seq = Number(seqStr);
    const existing = counters[type];
    if (!existing || year > existing.year || (year === existing.year && seq > existing.seq)) {
      counters[type] = { year, seq } as TicketCounterState[keyof TicketCounterState];
    }
  };

  store.acceptanceRecords.forEach((r) => bump("PTN", r.acceptanceCode));
  store.incidents.forEach((i) => bump("PSC", i.reportCode));
  store.calibrationRequests.forEach((r) => bump("PHC", (r as any).requestCode));
  store.liquidationProposals.forEach((l) => bump("PTL", l.liquidationCode));
  store.transferProposals.forEach((t) => bump("PDC", t.transferCode));
  store.trainingPlans.forEach((p) => bump("PDT", p.planCode));

  // Ensure defaults exist for all ticket types
  const nowYear = new Date().getFullYear();
  const types: (keyof TicketCounterState)[] = ["PTN", "PSC", "PHC", "PTL", "PBD", "PDT", "PDC"];
  types.forEach((t) => {
    if (!counters[t]) counters[t] = { year: nowYear, seq: 0 } as TicketCounterState[keyof TicketCounterState];
  });
  return counters as TicketCounterState;
}

// === Proposals ===
export function listProposals(): NewDeviceProposal[] {
  return [...getStore().proposals];
}

export function findProposal(id: string): NewDeviceProposal | undefined {
  return getStore().proposals.find((p) => p.id === id);
}

export function createProposal(payload: Partial<NewDeviceProposal>): NewDeviceProposal {
  const now = new Date().toISOString();
  const proposal: NewDeviceProposal = {
    id: payload.id || makeId("proposal"),
    proposalCode: payload.proposalCode || payload.code || `PDX-${Date.now()}`,
    necessity: payload.necessity || payload.description || "Đề xuất thiết bị mới",
    deviceRequirements: payload.deviceRequirements || [],
    proposedBy: payload.proposedBy || payload.requester || "Hệ thống",
    proposedById: payload.proposedById || "system",
    proposedDate: payload.proposedDate || payload.createdDate || now,
    createdDate: payload.createdDate || now,
    status: payload.status || "Bản nháp",
    approvers: payload.approvers || [],
    approvedBy: payload.approvedBy,
    approvedDate: payload.approvedDate,
    rejectedBy: payload.rejectedBy,
    rejectedDate: payload.rejectedDate,
    rejectionReason: payload.rejectionReason,
    registeredToSystem: payload.registeredToSystem ?? false,
    department: payload.department || "",
    updatedAt: payload.updatedAt,
    title: payload.title,
    budget: payload.budget,
    requester: payload.requester,
    description: payload.description,
    attachments: payload.attachments,
    code: payload.code,
  };

  const store = getStore();
  store.proposals = [proposal, ...store.proposals];
  persist(store);
  return proposal;
}

export function updateProposal(id: string, payload: Partial<NewDeviceProposal>): NewDeviceProposal | undefined {
  const store = getStore();
  const index = store.proposals.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated: NewDeviceProposal = {
    ...store.proposals[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  store.proposals[index] = updated;
  persist(store);
  return updated;
}

export function deleteProposal(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.proposals.length;
  store.proposals = store.proposals.filter((p) => p.id !== id);
  persist(store);
  return store.proposals.length < sizeBefore;
}

// === Incidents ===
export function listIncidents(): IncidentReport[] {
  return [...getStore().incidents];
}

export function findIncident(id: string): IncidentReport | undefined {
  return getStore().incidents.find((i) => i.id === id);
}

export function createIncident(payload: Partial<IncidentReport>): IncidentReport {
  const store = getStore();
  const reportCode = payload.reportCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PSC");
  const incident: IncidentReport = {
    id: payload.id || makeId("incident"),
    reportCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    specialty: payload.specialty || "",
    severity: payload.severity || "medium",
    incidentDateTime: payload.incidentDateTime || new Date().toISOString(),
    discoveredBy: payload.discoveredBy || payload.reportedBy || "",
    discoveredByRole: payload.discoveredByRole || "",
    supplier: payload.supplier || "",
    description: payload.description || "",
    immediateAction: payload.immediateAction || "",
    supplierAction: payload.supplierAction || "",
    attachments: payload.attachments || [],
    affectsPatientResult: !!payload.affectsPatientResult,
    affectedPatientSid: payload.affectedPatientSid,
    howAffected: payload.howAffected,
    requiresDeviceStop: !!payload.requiresDeviceStop,
    stopFrom: payload.stopFrom,
    stopTo: payload.stopTo,
    hasProposal: !!payload.hasProposal,
    proposal: payload.proposal,
    reportedBy: payload.reportedBy || payload.discoveredBy || "",
    deviceManager: payload.deviceManager || "",
    relatedUsers: payload.relatedUsers || [],
    assigneeId: payload.assigneeId,
    assigneeName: payload.assigneeName,
    status: (payload.status as IncidentReport["status"]) || "Nháp",
    conclusion: payload.conclusion,
    resolvedBy: payload.resolvedBy,
    resolvedByType: payload.resolvedByType,
    linkedWorkOrderCode: payload.linkedWorkOrderCode,
    completionDateTime: payload.completionDateTime,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt,
    approvedBy: payload.approvedBy,
    approvedDate: payload.approvedDate,
    rejectedBy: payload.rejectedBy,
    rejectedReason: payload.rejectedReason,
    workOrders: payload.workOrders || [],
  } as IncidentReport;

  store.incidents = [incident, ...store.incidents];
  persist(store);
  return incident;
}

export function updateIncident(id: string, payload: Partial<IncidentReport>): IncidentReport | undefined {
  const store = getStore();
  const index = store.incidents.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  const updated: IncidentReport = {
    ...store.incidents[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  store.incidents[index] = updated;
  persist(store);
  return updated;
}

export function deleteIncident(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.incidents.length;
  store.incidents = store.incidents.filter((i) => i.id !== id);
  persist(store);
  return store.incidents.length < sizeBefore;
}

// === Calibration schedules ===
export function listSchedules(filters?: { type?: string; deviceId?: string }): CalibrationSchedule[] {
  let result = [...getStore().schedules];
  if (filters?.type) result = result.filter((s) => s.type === filters.type);
  if (filters?.deviceId) result = result.filter((s) => s.deviceId === filters.deviceId);
  return result;
}

export function findSchedule(id: string): CalibrationSchedule | undefined {
  return getStore().schedules.find((s) => s.id === id);
}

export function createSchedule(payload: Partial<CalibrationSchedule>): CalibrationSchedule {
  const schedule: CalibrationSchedule = {
    id: payload.id || makeId("schedule"),
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    type: payload.type || "Hiệu chuẩn",
    scheduledDate: payload.scheduledDate || new Date().toISOString(),
    status: payload.status || "Chờ thực hiện",
    assignedTo: payload.assignedTo || "",
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt,
    notes: payload.notes,
    attachments: payload.attachments,
  };

  const store = getStore();
  store.schedules = [...store.schedules, schedule];
  persist(store);
  return schedule;
}

export function updateSchedule(id: string, payload: Partial<CalibrationSchedule>): CalibrationSchedule | undefined {
  const store = getStore();
  const index = store.schedules.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  const updated: CalibrationSchedule = {
    ...store.schedules[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  store.schedules[index] = updated;
  persist(store);
  return updated;
}

export function deleteSchedule(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.schedules.length;
  store.schedules = store.schedules.filter((s) => s.id !== id);
  persist(store);
  return store.schedules.length < sizeBefore;
}

// === Calibration requests ===
export function listCalibrationRequests(filters?: { deviceId?: string; status?: string }): CalibrationRequest[] {
  let result = [...getStore().calibrationRequests];
  if (filters?.deviceId) result = result.filter((r) => r.deviceId === filters.deviceId);
  if (filters?.status) result = result.filter((r) => r.status === filters.status);
  return result;
}

export function findCalibrationRequest(id: string): CalibrationRequest | undefined {
  return getStore().calibrationRequests.find((r) => r.id === id);
}

export function createCalibrationRequest(payload: Partial<CalibrationRequest>): CalibrationRequest {
  const store = getStore();
  const now = new Date().toISOString();
  const requestCode = payload.requestCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PHC");
  const request: CalibrationRequest = {
    id: payload.id || makeId("phc"),
    requestCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    serial: payload.serial || "",
    quantity: payload.quantity ?? 1,
    expectedDate: payload.expectedDate || now,
    content: payload.content || "Yêu cầu hiệu chuẩn thiết bị",
    notes: payload.notes || "",
    attachments: payload.attachments || [],
    proposedBy: payload.proposedBy || "Hệ thống",
    proposedById: payload.proposedById || "system",
    department: payload.department || "",
    position: payload.position || "",
    approver: payload.approver || "",
    relatedUsers: payload.relatedUsers || [],
    status: payload.status || "Bản nháp",
    approvedBy: payload.approvedBy,
    approvedDate: payload.approvedDate,
    rejectedBy: payload.rejectedBy,
    rejectedDate: payload.rejectedDate,
    rejectionReason: payload.rejectionReason,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt,
  };

  store.calibrationRequests = [request, ...store.calibrationRequests];
  persist(store);
  return request;
}

export function updateCalibrationRequest(id: string, payload: Partial<CalibrationRequest>): CalibrationRequest | undefined {
  const store = getStore();
  const index = store.calibrationRequests.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated: CalibrationRequest = {
    ...store.calibrationRequests[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  } as CalibrationRequest;
  store.calibrationRequests[index] = updated;
  persist(store);
  return updated;
}

export function deleteCalibrationRequest(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.calibrationRequests.length;
  store.calibrationRequests = store.calibrationRequests.filter((r) => r.id !== id);
  persist(store);
  return store.calibrationRequests.length < sizeBefore;
}

// === Calibration results ===
export function listCalibrationResults(filters?: { deviceId?: string; requestId?: string; status?: string }): CalibrationResult[] {
  let result = [...getStore().calibrationResults];
  if (filters?.deviceId) result = result.filter((r) => r.deviceId === filters.deviceId);
  if (filters?.requestId) result = result.filter((r) => r.requestId === filters.requestId);
  if (filters?.status) result = result.filter((r) => r.status === filters.status);
  return result;
}

export function findCalibrationResult(id: string): CalibrationResult | undefined {
  return getStore().calibrationResults.find((r) => r.id === id);
}

export function createCalibrationResult(payload: Partial<CalibrationResult>): CalibrationResult {
  const now = new Date().toISOString();
  const result: CalibrationResult = {
    id: payload.id || makeId("ketqua_hc"),
    resultCode: payload.resultCode || `KQHC-${Date.now()}`,
    requestId: payload.requestId || "",
    deviceId: payload.deviceId || "",
    deviceName: payload.deviceName || "",
    deviceCode: payload.deviceCode || "",
    serial: payload.serial || "",
    executionDate: payload.executionDate || now,
    content: payload.content || "Kết quả hiệu chuẩn",
    executionUnit: payload.executionUnit || "Nội bộ",
    calibrationResult: payload.calibrationResult || "Đạt",
    standard: payload.standard || "ISO 15189",
    attachments: payload.attachments || [],
    conclusion: payload.conclusion || "Đạt",
    notes: payload.notes || "",
    status: payload.status || "Bản nháp",
    createdBy: payload.createdBy || "system",
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt,
  };

  const store = getStore();
  store.calibrationResults = [result, ...store.calibrationResults];
  persist(store);
  return result;
}

export function updateCalibrationResult(id: string, payload: Partial<CalibrationResult>): CalibrationResult | undefined {
  const store = getStore();
  const index = store.calibrationResults.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated: CalibrationResult = {
    ...store.calibrationResults[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  } as CalibrationResult;
  store.calibrationResults[index] = updated;
  persist(store);
  return updated;
}

export function deleteCalibrationResult(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.calibrationResults.length;
  store.calibrationResults = store.calibrationResults.filter((r) => r.id !== id);
  persist(store);
  return store.calibrationResults.length < sizeBefore;
}

// === Acceptance records ===
export function listAcceptanceRecords(): AcceptanceRecord[] {
  return [...getStore().acceptanceRecords];
}

export function findAcceptanceRecord(id: string): AcceptanceRecord | undefined {
  return getStore().acceptanceRecords.find((a) => a.id === id);
}

export function createAcceptanceRecord(payload: Partial<AcceptanceRecord>): AcceptanceRecord {
  const store = getStore();
  const acceptanceCode = payload.acceptanceCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PTN");
  const record: AcceptanceRecord = {
    id: payload.id || makeId("acc"),
    acceptanceCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    recordType: payload.recordType || "handover",
    status: payload.status || "pending",
    checklist: payload.checklist || {},
    returnReason: payload.returnReason,
    transportPartner: payload.transportPartner,
    transportContact: payload.transportContact,
    transportDate: payload.transportDate,
    deliveredBy: payload.deliveredBy,
    receivedBy: payload.receivedBy,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  store.acceptanceRecords = [record, ...store.acceptanceRecords];
  persist(store);
  return record;
}

export function updateAcceptanceRecord(id: string, payload: Partial<AcceptanceRecord>): AcceptanceRecord | undefined {
  const store = getStore();
  const index = store.acceptanceRecords.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  const updated: AcceptanceRecord = { ...store.acceptanceRecords[index], ...payload, updatedAt: new Date().toISOString() };
  store.acceptanceRecords[index] = updated;
  persist(store);
  return updated;
}

export function deleteAcceptanceRecord(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.acceptanceRecords.length;
  store.acceptanceRecords = store.acceptanceRecords.filter((a) => a.id !== id);
  persist(store);
  return store.acceptanceRecords.length < sizeBefore;
}

// === Transfer proposals ===
export function listTransferProposals(): TransferProposal[] {
  return [...getStore().transferProposals];
}

export function findTransferProposal(id: string): TransferProposal | undefined {
  return getStore().transferProposals.find((t) => t.id === id);
}

export function createTransferProposal(payload: Partial<TransferProposal>): TransferProposal {
  const store = getStore();
  const transferCode = payload.transferCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PDC");
  const proposal: TransferProposal = {
    id: payload.id || makeId("tr"),
    transferCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    fromLocation: payload.fromLocation || "",
    toLocation: payload.toLocation || "",
    reason: payload.reason || "",
    plannedTransferDate: payload.plannedTransferDate || "",
    requestedBy: payload.requestedBy || "",
    approver: payload.approver || "",
    status: payload.status || "Nháp",
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  store.transferProposals = [proposal, ...store.transferProposals];
  persist(store);
  return proposal;
}

export function updateTransferProposal(id: string, payload: Partial<TransferProposal>): TransferProposal | undefined {
  const store = getStore();
  const index = store.transferProposals.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  const updated: TransferProposal = { ...store.transferProposals[index], ...payload, updatedAt: new Date().toISOString() };
  store.transferProposals[index] = updated;
  persist(store);
  return updated;
}

export function deleteTransferProposal(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.transferProposals.length;
  store.transferProposals = store.transferProposals.filter((t) => t.id !== id);
  persist(store);
  return store.transferProposals.length < sizeBefore;
}

// === Liquidation proposals ===
export function listLiquidationProposals(): LiquidationProposal[] {
  return [...getStore().liquidationProposals];
}

export function findLiquidationProposal(id: string): LiquidationProposal | undefined {
  return getStore().liquidationProposals.find((l) => l.id === id);
}

export function createLiquidationProposal(payload: Partial<LiquidationProposal>): LiquidationProposal {
  const store = getStore();
  const liquidationCode = payload.liquidationCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PTL");
  const proposal: LiquidationProposal = {
    id: payload.id || makeId("tl"),
    liquidationCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    reason: payload.reason || "",
    method: payload.method || "",
    estimatedValue: payload.estimatedValue || "0",
    plannedDate: payload.plannedDate || "",
    requestedBy: payload.requestedBy || "",
    approver: payload.approver || "",
    status: payload.status || "Nháp",
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt,
  };
  store.liquidationProposals = [proposal, ...store.liquidationProposals];
  persist(store);
  return proposal;
}

export function updateLiquidationProposal(id: string, payload: Partial<LiquidationProposal>): LiquidationProposal | undefined {
  const store = getStore();
  const index = store.liquidationProposals.findIndex((l) => l.id === id);
  if (index === -1) return undefined;
  const updated: LiquidationProposal = { ...store.liquidationProposals[index], ...payload, updatedAt: new Date().toISOString() };
  store.liquidationProposals[index] = updated;
  persist(store);
  return updated;
}

export function deleteLiquidationProposal(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.liquidationProposals.length;
  store.liquidationProposals = store.liquidationProposals.filter((l) => l.id !== id);
  persist(store);
  return store.liquidationProposals.length < sizeBefore;
}

// === Training ===
export function listTrainingPlans(): TrainingPlan[] {
  return [...getStore().trainingPlans];
}

export function findTrainingPlan(id: string): TrainingPlan | undefined {
  return getStore().trainingPlans.find((p) => p.id === id);
}

export function createTrainingPlan(payload: Partial<TrainingPlan>): TrainingPlan {
  const store = getStore();
  const now = new Date().toISOString();
  const planCode = payload.planCode || takeTicketCode(store, payload.deviceCode || payload.deviceId || "", "PDT");
  const plan: TrainingPlan = {
    id: payload.id || makeId("train_plan"),
    planCode,
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    topic: payload.topic || "Đào tạo thiết bị",
    instructorType: payload.instructorType || "Nội bộ",
    instructorName: payload.instructorName || "Giảng viên nội bộ",
    trainingDate: payload.trainingDate || now,
    trainingTime: payload.trainingTime || "08:00",
    location: payload.location || "Phòng đào tạo",
    trainees: payload.trainees || [],
    approver: payload.approver || "Quản trị",
    status: payload.status || "Chờ duyệt",
    notes: payload.notes,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt,
    createdBy: payload.createdBy || "system",
  };
  store.trainingPlans = [plan, ...store.trainingPlans];
  persist(store);
  return plan;
}

export function updateTrainingPlanStore(id: string, payload: Partial<TrainingPlan>): TrainingPlan | undefined {
  const store = getStore();
  const index = store.trainingPlans.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated: TrainingPlan = { ...store.trainingPlans[index], ...payload, updatedAt: new Date().toISOString() };
  store.trainingPlans[index] = updated;
  persist(store);
  return updated;
}

export function deleteTrainingPlan(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.trainingPlans.length;
  store.trainingPlans = store.trainingPlans.filter((p) => p.id !== id);
  persist(store);
  return store.trainingPlans.length < sizeBefore;
}

export function listTrainingDocuments(): TrainingDocument[] {
  return [...getStore().trainingDocuments];
}

export function listTrainingResults(): TrainingResult[] {
  return [...getStore().trainingResults];
}

export function createTrainingDocument(payload: Partial<TrainingDocument>): TrainingDocument {
  const now = new Date().toISOString();
  const doc: TrainingDocument = {
    id: payload.id || makeId("train_doc"),
    deviceId: payload.deviceId || "",
    documentCode: payload.documentCode || payload.id || makeId("doc_code"),
    documentName: payload.documentName || "Tài liệu đào tạo",
    documentType: (payload.documentType as TrainingDocument["documentType"]) || (payload as any).type || "Khác",
    description: payload.description || "",
    file: payload.file || {
      name: payload.documentName || "file",
      url: (payload as any).url || "",
      type: (payload as any).file?.type || "",
      size: (payload as any).file?.size || 0,
    },
    uploadedBy: payload.uploadedBy || "system",
    uploadedAt: payload.uploadedAt || now,
  } as TrainingDocument;
  const store = getStore();
  store.trainingDocuments = [doc, ...store.trainingDocuments];
  persist(store);
  return doc;
}

export function updateTrainingDocument(id: string, payload: Partial<TrainingDocument>): TrainingDocument | undefined {
  const store = getStore();
  const index = store.trainingDocuments.findIndex((d) => d.id === id);
  if (index === -1) return undefined;
  const updated: TrainingDocument = {
    ...store.trainingDocuments[index],
    ...payload,
    uploadedAt: store.trainingDocuments[index].uploadedAt,
  };
  store.trainingDocuments[index] = updated;
  persist(store);
  return updated;
}

export function deleteTrainingDocument(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.trainingDocuments.length;
  store.trainingDocuments = store.trainingDocuments.filter((d) => d.id !== id);
  persist(store);
  return store.trainingDocuments.length < sizeBefore;
}

export function createTrainingResult(payload: Partial<TrainingResult>): TrainingResult {
  const now = new Date().toISOString();
  const result: TrainingResult = {
    id: payload.id || makeId("train_res"),
    planId: payload.planId || "",
    planCode: payload.planCode || "",
    deviceId: payload.deviceId || "",
    deviceCode: payload.deviceCode || "",
    deviceName: payload.deviceName || "",
    trainingDate: payload.trainingDate || "",
    instructorName: payload.instructorName || "",
    location: payload.location || "",
    attendees: payload.attendees || [],
    attendanceFile: payload.attendanceFile,
    certificateFile: payload.certificateFile,
    notes: payload.notes,
    recordedBy: payload.recordedBy || "system",
    recordedAt: payload.recordedAt || now,
  } as TrainingResult;
  const store = getStore();
  store.trainingResults = [result, ...store.trainingResults];
  persist(store);
  return result;
}

export function updateTrainingResult(id: string, payload: Partial<TrainingResult>): TrainingResult | undefined {
  const store = getStore();
  const index = store.trainingResults.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated: TrainingResult = {
    ...store.trainingResults[index],
    ...payload,
    recordedAt: payload.recordedAt || store.trainingResults[index].recordedAt,
  };
  store.trainingResults[index] = updated;
  persist(store);
  return updated;
}

export function deleteTrainingResult(id: string): boolean {
  const store = getStore();
  const sizeBefore = store.trainingResults.length;
  store.trainingResults = store.trainingResults.filter((r) => r.id !== id);
  persist(store);
  return store.trainingResults.length < sizeBefore;
}
