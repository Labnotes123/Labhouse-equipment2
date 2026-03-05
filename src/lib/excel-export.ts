/**
 * Excel Export utility functions for LabHouse Equipment Management System
 * Client-side only - uses browser APIs for Excel/CSV generation
 */

"use client";

import type { NewDeviceProposal } from "./mockData";

/**
 * Format date to Vietnamese format
 */
function formatDateVN(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Collect all attachments from a proposal as a string
 */
function getAttachmentsString(proposal: NewDeviceProposal): string {
  const attachments: string[] = [];
  
  proposal.deviceRequirements.forEach((req, index) => {
    if (req.attachments && req.attachments.length > 0) {
      req.attachments.forEach((file) => {
        attachments.push(file.name || `Đính kèm ${index + 1}`);
      });
    }
  });
  
  return attachments.join("; ");
}

/**
 * Export proposals to CSV/Excel format
 */
export function exportProposalsToExcel(proposals: NewDeviceProposal[]): void {
  // CSV header
  const headers = [
    "Mã phiếu",
    "Ngày đề xuất",
    "Người đề xuất",
    "Phòng ban",
    "Trạng thái",
    "Sự cần thiết",
    "Tên thiết bị",
    "Số lượng",
    "Tệp đính kèm",
  ];

  // Build CSV rows
  const rows: string[][] = proposals.map((p) => [
    p.proposalCode,
    formatDateVN(p.proposedDate),
    p.proposedBy,
    p.department || "",
    p.status,
    p.necessity || "",
    p.deviceRequirements.map((r) => r.deviceName).join("; "),
    String(p.deviceRequirements.reduce((sum, r) => sum + (r.quantity || 0), 0)),
    getAttachmentsString(p),
  ]);

  // Convert to CSV string
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  // Add BOM for Excel to recognize UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `DS_Phieu_De_Xuat_Thiet_Bi_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
