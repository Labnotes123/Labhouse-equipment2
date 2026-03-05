/**
 * PDF Export utility functions for LabHouse Equipment Management System
 * Uses dynamic import to ensure client-side only execution
 */

import type { NewDeviceProposal, DeviceRequirement, AttachedFile } from "./mockData";

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
 * Collect all attachments from a proposal
 */
function collectAttachments(proposal: NewDeviceProposal): { name: string; url: string; type: string }[] {
  const attachments: { name: string; url: string; type: string }[] = [];
  
  // Add attachments from device requirements
  proposal.deviceRequirements.forEach((req: DeviceRequirement, index: number) => {
    if (req.attachments && req.attachments.length > 0) {
      req.attachments.forEach((file: AttachedFile) => {
        attachments.push({
          name: file.name || `Đính kèm ${index + 1}`,
          url: file.url,
          type: file.type || "application/octet-stream",
        });
      });
    }
  });
  
  return attachments;
}

/**
 * Export proposal to PDF - uses dynamic import for jsPDF
 */
export async function exportProposalToPDF(proposal: NewDeviceProposal): Promise<void> {
  console.log("[PDF Export] Starting export for proposal:", proposal.proposalCode);
  
  // Dynamic import to ensure client-side only execution
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PHIẾU ĐỀ XUẤT THIẾT BỊ MỚI", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Mã phiếu: ${proposal.proposalCode}`, 14, 32);
  doc.text(`Ngày đề xuất: ${formatDateVN(proposal.proposedDate)}`, 14, 38);
  doc.text(`Người đề xuất: ${proposal.proposedBy}`, 14, 44);
  doc.text(`Phòng ban: ${proposal.department || ""}`, 14, 50);
  doc.text(`Trạng thái: ${proposal.status}`, 14, 56);
  
  // Necessity
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("I. Sự cần thiết đầu tư:", 14, 66);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const necessityLines = doc.splitTextToSize(proposal.necessity || "", pageWidth - 28);
  doc.text(necessityLines, 14, 72);
  
  // Device Requirements
  let yPos = 72 + necessityLines.length * 5 + 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("II. Yêu cầu thiết bị:", 14, yPos);
  yPos += 6;
  
  // Create table for device requirements
  const tableData = proposal.deviceRequirements.map((req: DeviceRequirement, index: number) => [
    index + 1,
    req.deviceName,
    req.manufacturer,
    req.yearOfManufacture,
    req.distributor,
    req.quantity.toString(),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["STT", "Tên thiết bị", "Hãng sx", "Năm sx", "Đại lý", "SL"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 135, 245] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });
  
  // Get the final Y position after table
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Technical specs for each device
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("III. Thông số kỹ thuật:", 14, yPos);
  yPos += 6;
  
  proposal.deviceRequirements.forEach((req: DeviceRequirement, index: number) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${req.deviceName}:`, 14, yPos);
    yPos += 5;
    
    doc.setFont("helvetica", "normal");
    const specsLines = doc.splitTextToSize(req.technicalSpecs || "", pageWidth - 28);
    doc.text(specsLines, 14, yPos);
    yPos += specsLines.length * 5 + 3;
  });
  
  // Approvers section - check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 5;
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("IV. Lịch sử phê duyệt:", 14, yPos);
  yPos += 6;
  
  // Approvers table
  const approverData = proposal.approvers.map((approver) => [
    approver.fullName,
    approver.role,
    approver.isApprover ? "Người phê duyệt" : "Người liên quan",
  ]);
  
  if (approverData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Họ tên", "Chức vụ", "Vai trò"]],
      body: approverData,
      theme: "striped",
      headStyles: { fillColor: [66, 135, 245] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Attachments section - add new page for attachments
  const attachments = collectAttachments(proposal);
  
  if (attachments.length > 0) {
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PHỤ LỤC: TỆP ĐÍNH KÈM", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(11);
    doc.text(`Phiếu đề xuất: ${proposal.proposalCode}`, 14, 32);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 38);
    doc.text(`Tổng số tệp đính kèm: ${attachments.length}`, 14, 44);
    
    // List all attachments
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Danh sách tệp đính kèm:", 14, 54);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    attachments.forEach((file, index) => {
      const fileInfo = `${index + 1}. ${file.name}`;
      const fileType = file.type ? ` (${file.type})` : "";
      doc.text(fileInfo + fileType, 14, 62 + index * 8);
    });
    
    // Add note about viewing attachments
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      "Lưu ý: Các tệp đính kèm (báo giá, tài liệu kỹ thuật, hình ảnh...) được lưu trữ trong hệ thống.",
      14,
      62 + attachments.length * 8 + 10
    );
  }
  
  // Save the PDF
  doc.save(`${proposal.proposalCode}.pdf`);
  console.log("[PDF Export] Completed for proposal:", proposal.proposalCode);
}
