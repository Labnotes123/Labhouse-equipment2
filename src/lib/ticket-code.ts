export type TicketTypeCode = "PTN" | "PSC" | "PHC" | "PTL" | "PBD" | "PDT" | "PDC";

export type TicketCounterState = Record<TicketTypeCode, { year: number; seq: number }>;

export function buildTicketCode(deviceCode: string, type: TicketTypeCode, seq: number, year = new Date().getFullYear()): string {
  const devicePart = (deviceCode || "NO-CODE").trim() || "NO-CODE";
  return `${devicePart}-${type}-${year}-${String(seq).padStart(3, "0")}`;
}

export function nextTicketCode(deviceCode: string, type: TicketTypeCode, counters: TicketCounterState = {} as TicketCounterState): { code: string; counters: TicketCounterState } {
  const currentYear = new Date().getFullYear();
  const existing = counters[type];
  const seq = existing && existing.year === currentYear ? existing.seq + 1 : 1;
  const code = buildTicketCode(deviceCode, type, seq, currentYear);
  return {
    code,
    counters: { ...counters, [type]: { year: currentYear, seq } },
  };
}

export function previewTicketCode(deviceCode: string, type: TicketTypeCode, existingCodes: string[], year = new Date().getFullYear()): string {
  const nextSeq = existingCodes.filter((code) => code && code.includes(`-${type}-${year}-`)).length + 1;
  return buildTicketCode(deviceCode, type, nextSeq, year);
}
