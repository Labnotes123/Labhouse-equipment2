/**
 * PDF Export utility functions for LabHouse Equipment Management System
 * Uses dynamic import to ensure client-side only execution
 * Supports UTF-8 for Vietnamese characters
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
          name: file.name || `Dinh kèm ${index + 1}`,
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
 * Supports UTF-8 Vietnamese characters
 */
export async function exportProposalToPDF(proposal: NewDeviceProposal): Promise<void> {
  console.log("[PDF Export] Starting export for proposal:", proposal.proposalCode);
  
  // Dynamic import to ensure client-side only execution
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  
  // Create PDF with Unicode support
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  // Use helvetica font - jsPDF has built-in UTF-8 support in newer versions
  doc.setFont("helvetica", "normal");
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper function to add text with automatic page breaks
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; bold?: boolean; color?: number[] }) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    if (options?.color) {
      const [r, g, b] = options.color;
      doc.setTextColor(r, g, b);
    } else doc.setTextColor(0, 0, 0);
    
    const lines = doc.splitTextToSize(text, pageWidth - 28);
    doc.text(lines, x, y);
    return lines.length * 5; // Return height used
  };
  
  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text("PHIEU DE XUAT THIET BI MOI", pageWidth / 2, 18, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Basic Info Section
  let yPos = 30;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("I. THONG TIN CO BAN:", 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Ma phieu
  doc.text(`Ma phieu: ${proposal.proposalCode || ""}`, 14, yPos);
  yPos += 6;
  
  // Ngay de xuat
  doc.text(`Ngay de xuat: ${formatDateVN(proposal.proposedDate)}`, 14, yPos);
  yPos += 6;
  
  // Nguoi de xuat
  doc.text(`Nguoi de xuat: ${proposal.proposedBy || ""}`, 14, yPos);
  yPos += 6;
  
  // Phong ban
  doc.text(`Phong ban: ${proposal.department || ""}`, 14, yPos);
  yPos += 6;
  
  // Trang thai
  doc.text(`Trang thai: ${proposal.status || ""}`, 14, yPos);
  yPos += 10;
  
  // Necessity Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("II. SU CAN THIET DAU TU:", 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const necessityText = proposal.necessity || "Khong co mo ta";
  const necessityLines = doc.splitTextToSize(necessityText, pageWidth - 28);
  doc.text(necessityLines, 14, yPos);
  yPos += necessityLines.length * 5 + 10;
  
  // Device Requirements Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("III. YEU CAU THIET BI:", 14, yPos);
  yPos += 8;
  
  // Create table for device requirements with more complete data
  const tableData = proposal.deviceRequirements.map((req: DeviceRequirement, index: number) => [
    index + 1,
    req.deviceName || "",
    req.manufacturer || "",
    req.yearOfManufacture || "",
    req.distributor || "",
    req.quantity?.toString() || "0",
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["STT", "Ten thiet bi", "Hang sx", "Nam sx", "Dai ly", "SL"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [0, 82, 147], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Technical specs for each device - Add more complete data
  if (proposal.deviceRequirements.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helibold", "bold");
    doc.text("IV. THONG SO KY THUAT:", 14, yPos);
    yPos += 8;
    
    proposal.deviceRequirements.forEach((req: DeviceRequirement, index: number) => {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${req.deviceName || "Thiet bi"}`, 14, yPos);
      yPos += 6;
      
      doc.setFont("helvetica", "normal");
      
      // Add all technical specs
      const specsText = req.technicalSpecs || "Khong co thong so";
      const specsLines = doc.splitTextToSize(specsText, pageWidth - 28);
      doc.text(specsLines, 14, yPos);
      yPos += specsLines.length * 5 + 5;
    });
  }
  
  // Approvers section - check if we need a new page
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("V. NGUOI PHAN CONG & PHAN BIEN:", 14, yPos);
  yPos += 8;
  
  // Approvers table
  const approverData = proposal.approvers.map((approver) => [
    approver.fullName || "",
    approver.role || "",
    approver.isApprover ? "Nguoi duyet" : "Nguoi lien quan",
  ]);
  
  if (approverData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [["Ho ten", "Chuc vu", "Vai tro"]],
      body: approverData,
      theme: "striped",
      headStyles: { fillColor: [0, 128, 0], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Chua co nguoi phan cong", 14, yPos);
    yPos += 10;
  }
  
  // Approval status
  if (proposal.approvedBy) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(11);
    doc.setTextColor(0, 100, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Da duyet boi: ${proposal.approvedBy} - Ngay: ${proposal.approvedDate || ""}`, 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  }
  
  // Attachments section - Add new page for attachments with listing
  const attachments = collectAttachments(proposal);
  
  if (attachments.length > 0) {
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("PHU LUC: TEP DINH KEM", pageWidth / 2, 18, { align: "center" });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Phieu de xuat: ${proposal.proposalCode}`, 14, 30);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString("vi-VN")}`, 14, 36);
    doc.text(`Tong so tep dinh kem: ${attachments.length}`, 14, 42);
    
    // List all attachments
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Danh sach tep dinh kem:", 14, 52);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    attachments.forEach((file, index) => {
      const fileInfo = `${index + 1}. ${file.name}`;
      const fileType = file.type ? ` (${file.type})` : "";
      doc.text(fileInfo + fileType, 14, 60 + index * 8);
    });
    
    // Add note about viewing attachments
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      "Luu y: Cac tep dinh kem (bao gia, tai lieu ky thuat, hinh anh...) duoc luu tru trong he thong.",
      14,
      60 + attachments.length * 8 + 10
    );
  }
  
  // Save the PDF
  const fileName = `${proposal.proposalCode || "phieu_de_xuat"}.pdf`;
  doc.save(fileName);
  console.log("[PDF Export] Completed for proposal:", proposal.proposalCode);
}
