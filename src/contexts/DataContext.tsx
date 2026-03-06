"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  Device,
  NewDeviceProposal,
  IncidentReport,
  CalibrationSchedule,
  CalibrationRequest,
  CalibrationResult,
  HistoryLog,
  TrainingPlan,
  TrainingDocument,
  TrainingResult,
} from "@/lib/mockData";

interface DataContextValue {
  // Data
  devices: Device[];
  proposals: NewDeviceProposal[];
  incidents: IncidentReport[];
  schedules: CalibrationSchedule[];
  calibrationRequests: CalibrationRequest[];
  calibrationResults: CalibrationResult[];
  history: HistoryLog[];
  trainingPlans: TrainingPlan[];
  trainingDocuments: TrainingDocument[];
  trainingResults: TrainingResult[];

  // Loading states
  loading: boolean;
  devicesLoading: boolean;
  proposalsLoading: boolean;
  incidentsLoading: boolean;
  schedulesLoading: boolean;
  calibrationRequestsLoading: boolean;
  calibrationResultsLoading: boolean;
  historyLoading: boolean;
  trainingLoading: boolean;

  // Refresh
  refreshData: () => Promise<void>;

  // Device mutations
  addDevice: (device: Omit<Device, "id">) => Promise<Device>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;

  // Proposal mutations
  addProposal: (proposal: Omit<NewDeviceProposal, "id">) => Promise<NewDeviceProposal>;
  updateProposal: (id: string, updates: Partial<NewDeviceProposal>) => Promise<NewDeviceProposal>;
  deleteProposal: (id: string) => Promise<void>;

  // Incident mutations
  addIncident: (incident: Omit<IncidentReport, "id">) => Promise<IncidentReport>;
  updateIncident: (id: string, updates: Partial<IncidentReport>) => Promise<IncidentReport>;
  deleteIncident: (id: string) => Promise<void>;

  // Schedule mutations
  addSchedule: (schedule: Omit<CalibrationSchedule, "id">) => Promise<CalibrationSchedule>;
  updateSchedule: (id: string, updates: Partial<CalibrationSchedule>) => Promise<CalibrationSchedule>;
  deleteSchedule: (id: string) => Promise<void>;

  // Calibration Request mutations
  addCalibrationRequest: (request: Omit<CalibrationRequest, "id">) => Promise<CalibrationRequest>;
  updateCalibrationRequest: (id: string, updates: Partial<CalibrationRequest>) => Promise<CalibrationRequest>;
  deleteCalibrationRequest: (id: string) => Promise<void>;

  // Calibration Result mutations
  addCalibrationResult: (result: Omit<CalibrationResult, "id">) => Promise<CalibrationResult>;
  updateCalibrationResult: (id: string, updates: Partial<CalibrationResult>) => Promise<CalibrationResult>;
  deleteCalibrationResult: (id: string) => Promise<void>;

  // History mutations
  addHistory: (log: Record<string, any>) => Promise<void>;

  // Training mutations
  addTrainingDocument: (doc: Partial<TrainingDocument>) => Promise<TrainingDocument>;
  updateTrainingDocument: (id: string, updates: Partial<TrainingDocument>) => Promise<TrainingDocument>;
  addTrainingResult: (result: Partial<TrainingResult>) => Promise<TrainingResult>;
  updateTrainingResult: (id: string, updates: Partial<TrainingResult>) => Promise<TrainingResult>;
  updateTrainingPlan: (id: string, updates: Partial<TrainingPlan>) => Promise<TrainingPlan>;
  deleteTrainingDocument: (id: string) => Promise<void>;
  deleteTrainingResult: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [proposals, setProposals] = useState<NewDeviceProposal[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [schedules, setSchedules] = useState<CalibrationSchedule[]>([]);
  const [calibrationRequests, setCalibrationRequests] = useState<CalibrationRequest[]>([]);
  const [calibrationResults, setCalibrationResults] = useState<CalibrationResult[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [trainingDocuments, setTrainingDocuments] = useState<TrainingDocument[]>([]);
  const [trainingResults, setTrainingResults] = useState<TrainingResult[]>([]);

  const [devicesLoading, setDevicesLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [calibrationRequestsLoading, setCalibrationRequestsLoading] = useState(true);
  const [calibrationResultsLoading, setCalibrationResultsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [trainingLoading, setTrainingLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const data = await apiFetch<Device[]>("/api/devices");
      setDevices(data);
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const fetchProposals = useCallback(async () => {
    setProposalsLoading(true);
    try {
      const data = await apiFetch<NewDeviceProposal[]>("/api/proposals");
      setProposals(data);
    } catch (e) {
      console.error("Failed to fetch proposals", e);
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    try {
      // Use pagination-friendly API to avoid loading unbounded datasets
      const params = new URLSearchParams({ page: "1", pageSize: "200" });
      const data = await apiFetch<IncidentReport[]>(`/api/incidents?${params.toString()}`);
      setIncidents(data);
    } catch (e) {
      console.error("Failed to fetch incidents", e);
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    try {
      const data = await apiFetch<CalibrationSchedule[]>("/api/schedules");
      setSchedules(data);
    } catch (e) {
      console.error("Failed to fetch schedules", e);
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  const fetchCalibrationRequests = useCallback(async () => {
    setCalibrationRequestsLoading(true);
    try {
      const data = await apiFetch<CalibrationRequest[]>("/api/calibration-requests");
      setCalibrationRequests(data);
    } catch (e) {
      console.error("Failed to fetch calibration requests", e);
    } finally {
      setCalibrationRequestsLoading(false);
    }
  }, []);

  const fetchCalibrationResults = useCallback(async () => {
    setCalibrationResultsLoading(true);
    try {
      const data = await apiFetch<CalibrationResult[]>("/api/calibration-results");
      setCalibrationResults(data);
    } catch (e) {
      console.error("Failed to fetch calibration results", e);
    } finally {
      setCalibrationResultsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await apiFetch<HistoryLog[]>("/api/history");
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchTrainingData = useCallback(async () => {
    setTrainingLoading(true);
    try {
      const [plans, documents, results] = await Promise.all([
        apiFetch<TrainingPlan[]>("/api/training/plans"),
        apiFetch<TrainingDocument[]>("/api/training/documents"),
        apiFetch<TrainingResult[]>("/api/training/results"),
      ]);
      setTrainingPlans(plans);
      setTrainingDocuments(documents);
      setTrainingResults(results);
    } catch (e) {
      console.error("Failed to fetch training data", e);
    } finally {
      setTrainingLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDevices(),
      fetchProposals(),
      fetchIncidents(),
      fetchSchedules(),
      fetchCalibrationRequests(),
      fetchCalibrationResults(),
      fetchHistory(),
      fetchTrainingData(),
    ]);
  }, [fetchDevices, fetchProposals, fetchIncidents, fetchSchedules, fetchCalibrationRequests, fetchCalibrationResults, fetchHistory, fetchTrainingData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const loading =
    devicesLoading || proposalsLoading || incidentsLoading || schedulesLoading || 
    calibrationRequestsLoading || calibrationResultsLoading || historyLoading || trainingLoading;

  // Device mutations
  const addDevice = useCallback(async (device: Omit<Device, "id">) => {
    const created = await apiFetch<Device>("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(device),
    });
    setDevices((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDevice = useCallback(async (id: string, updates: Partial<Device>) => {
    const updated = await apiFetch<Device>(`/api/devices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDevice = useCallback(async (id: string) => {
    await apiFetch(`/api/devices/${id}`, { method: "DELETE" });
    setDevices((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Proposal mutations
  const addProposal = useCallback(async (proposal: Omit<NewDeviceProposal, "id">) => {
    const created = await apiFetch<NewDeviceProposal>("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });
    setProposals((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProposal = useCallback(async (id: string, updates: Partial<NewDeviceProposal>) => {
    const updated = await apiFetch<NewDeviceProposal>(`/api/proposals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProposal = useCallback(async (id: string) => {
    await apiFetch(`/api/proposals/${id}`, { method: "DELETE" });
    setProposals((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Incident mutations
  const addIncident = useCallback(async (incident: Omit<IncidentReport, "id">) => {
    const created = await apiFetch<IncidentReport>("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    setIncidents((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateIncident = useCallback(async (id: string, updates: Partial<IncidentReport>) => {
    const updated = await apiFetch<IncidentReport>(`/api/incidents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);

  const deleteIncident = useCallback(async (id: string) => {
    await apiFetch(`/api/incidents/${id}`, { method: "DELETE" });
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Schedule mutations
  const addSchedule = useCallback(async (schedule: Omit<CalibrationSchedule, "id">) => {
    const created = await apiFetch<CalibrationSchedule>("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    setSchedules((prev) => [...prev, created]);
    return created;
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<CalibrationSchedule>) => {
    const updated = await apiFetch<CalibrationSchedule>(`/api/schedules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    await apiFetch(`/api/schedules/${id}`, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Calibration Request mutations
  const addCalibrationRequest = useCallback(async (request: Omit<CalibrationRequest, "id">) => {
    const created = await apiFetch<CalibrationRequest>("/api/calibration-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    setCalibrationRequests((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCalibrationRequest = useCallback(async (id: string, updates: Partial<CalibrationRequest>) => {
    const updated = await apiFetch<CalibrationRequest>(`/api/calibration-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setCalibrationRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const deleteCalibrationRequest = useCallback(async (id: string) => {
    await apiFetch(`/api/calibration-requests/${id}`, { method: "DELETE" });
    setCalibrationRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Calibration Result mutations
  const addCalibrationResult = useCallback(async (result: Omit<CalibrationResult, "id">) => {
    const created = await apiFetch<CalibrationResult>("/api/calibration-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    setCalibrationResults((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCalibrationResult = useCallback(async (id: string, updates: Partial<CalibrationResult>) => {
    const updated = await apiFetch<CalibrationResult>(`/api/calibration-results/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setCalibrationResults((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const deleteCalibrationResult = useCallback(async (id: string) => {
    await apiFetch(`/api/calibration-results/${id}`, { method: "DELETE" });
    setCalibrationResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // History mutations
  const addHistory = useCallback(async (log: Record<string, any>) => {
    await apiFetch<HistoryLog>("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
  }, []);

  // Training mutations
  const addTrainingDocument = useCallback(async (doc: Partial<TrainingDocument>) => {
    const created = await apiFetch<TrainingDocument>("/api/training/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    setTrainingDocuments((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTrainingDocument = useCallback(async (id: string, updates: Partial<TrainingDocument>) => {
    const updated = await apiFetch<TrainingDocument>(`/api/training/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setTrainingDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const addTrainingResult = useCallback(async (result: Partial<TrainingResult>) => {
    const created = await apiFetch<TrainingResult>("/api/training/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    setTrainingResults((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTrainingResult = useCallback(async (id: string, updates: Partial<TrainingResult>) => {
    const updated = await apiFetch<TrainingResult>(`/api/training/results/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setTrainingResults((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const updateTrainingPlan = useCallback(async (id: string, updates: Partial<TrainingPlan>) => {
    const updated = await apiFetch<TrainingPlan>(`/api/training/plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setTrainingPlans(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteTrainingDocument = useCallback(async (id: string) => {
    await apiFetch(`/api/training/documents/${id}`, { method: "DELETE" });
    setTrainingDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const deleteTrainingResult = useCallback(async (id: string) => {
    await apiFetch(`/api/training/results/${id}`, { method: "DELETE" });
    setTrainingResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        devices,
        proposals,
        incidents,
        schedules,
        calibrationRequests,
        calibrationResults,
        history,
        trainingPlans,
        trainingDocuments,
        trainingResults,
        loading,
        devicesLoading,
        proposalsLoading,
        incidentsLoading,
        schedulesLoading,
        calibrationRequestsLoading,
        calibrationResultsLoading,
        historyLoading,
        trainingLoading,
        refreshData,
        addDevice,
        updateDevice,
        deleteDevice,
        addProposal,
        updateProposal,
        deleteProposal,
        addIncident,
        updateIncident,
        deleteIncident,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addCalibrationRequest,
        updateCalibrationRequest,
        deleteCalibrationRequest,
        addCalibrationResult,
        updateCalibrationResult,
        deleteCalibrationResult,
        addHistory,
        addTrainingDocument,
        updateTrainingDocument,
        addTrainingResult,
        updateTrainingResult,
        updateTrainingPlan,
        deleteTrainingDocument,
        deleteTrainingResult,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
