import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email configuration - can be overridden by environment variables
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

// Default configuration (can be changed via environment variables)
const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  from: process.env.SMTP_FROM || "noreply@labhouse.com",
  fromName: process.env.SMTP_FROM_NAME || "LabHouse Equipment Management",
};

// Create transporter singleton
let transporter: Transporter | null = null;

/**
 * Initialize the email transporter
 */
export function initEmailService(config?: Partial<EmailConfig>): Transporter {
  const finalConfig = { ...defaultConfig, ...config };
  
  transporter = nodemailer.createTransport({
    host: finalConfig.host,
    port: finalConfig.port,
    secure: finalConfig.secure,
    auth: finalConfig.auth,
  });
  
  console.log(`📧 Email service initialized: ${finalConfig.host}:${finalConfig.port}`);
  return transporter;
}

/**
 * Get the current transporter or create a new one
 */
function getTransporter(): Transporter | null {
  if (!transporter) {
    // Try to initialize with environment variables
    if (defaultConfig.auth.user && defaultConfig.auth.pass) {
      return initEmailService();
    }
    console.warn("⚠️ Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.");
    return null;
  }
  return transporter;
}

/**
 * Send an email
 */
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn("⚠️ Cannot send email - transporter not initialized");
    return false;
  }

  try {
    const info = await t.sendMail({
      from: `"${defaultConfig.fromName}" <${defaultConfig.from}>`,
      to: params.to,
      subject: params.subject,
      text: params.text || params.html.replace(/<[^>]*>/g, ""),
      html: params.html,
    });
    
    console.log(`✅ Email sent to ${params.to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
}

/**
 * Send notification email for approval request
 */
interface ApprovalRequestEmailParams {
  to: string;
  recipientName: string;
  requestCode: string;
  requestType: string;
  requesterName: string;
  requestUrl?: string;
}

export async function sendApprovalRequestEmail(params: ApprovalRequestEmailParams): Promise<boolean> {
  const typeLabels: Record<string, string> = {
    proposal: "Đề xuất mua thiết bị mới",
    incident: "Báo cáo sự cố",
    calibration: "Yêu cầu hiệu chuẩn",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📋 Yêu cầu duyệt mới</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Xin chào <strong>${params.recipientName}</strong>,</p>
        <p><strong>${params.requesterName}</strong> đã gửi yêu cầu duyệt mới:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Loại:</strong> ${typeLabels[params.requestType] || params.requestType}</p>
          <p style="margin: 5px 0;"><strong>Mã:</strong> ${params.requestCode}</p>
          <p style="margin: 5px 0;"><strong>Người gửi:</strong> ${params.requesterName}</p>
        </div>
        ${params.requestUrl ? `<p>Vui lòng <a href="${params.requestUrl}" style="color: #2563eb;">click vào đây</a> để xem chi tiết.</p>` : ""}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Đây là email tự động từ hệ thống Quản lý Thiết bị LabHouse. Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `[LabHouse] Yêu cầu duyệt mới - ${params.requestCode}`,
    html,
  });
}

/**
 * Send notification email for approval result
 */
interface ApprovalResultEmailParams {
  to: string;
  recipientName: string;
  requestCode: string;
  requestType: string;
  approverName: string;
  approved: boolean;
  rejectionReason?: string;
  requestUrl?: string;
}

export async function sendApprovalResultEmail(params: ApprovalResultEmailParams): Promise<boolean> {
  const typeLabels: Record<string, string> = {
    proposal: "Đề xuất mua thiết bị mới",
    incident: "Báo cáo sự cố",
    calibration: "Yêu cầu hiệu chuẩn",
  };

  const statusColor = params.approved ? "#16a34a" : "#dc2626";
  const statusText = params.approved ? "Đã được duyệt" : "Đã bị từ chối";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${statusColor}; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${params.approved ? "✅" : "❌"} ${statusText}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Xin chào <strong>${params.recipientName}</strong>,</p>
        <p><strong>${typeLabels[params.requestType] || params.requestType}</strong> của bạn ${statusText.toLowerCase()} bởi <strong>${params.approverName}</strong>.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Mã:</strong> ${params.requestCode}</p>
          <p style="margin: 5px 0;"><strong>Người duyệt:</strong> ${params.approverName}</p>
          ${params.rejectionReason ? `<p style="margin: 5px 0;"><strong>Lý do từ chối:</strong> ${params.rejectionReason}</p>` : ""}
        </div>
        ${params.requestUrl ? `<p>Vui lòng <a href="${params.requestUrl}" style="color: #2563eb;">click vào đây</a> để xem chi tiết.</p>` : ""}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Đây là email tự động từ hệ thống Quản lý Thiết bị LabHouse. Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `[LabHouse] ${statusText} - ${params.requestCode}`,
    html,
  });
}

/**
 * Send training assignment notification
 */
interface TrainingEmailParams {
  to: string;
  recipientName: string;
  trainingCode: string;
  deviceName: string;
  trainerName: string;
  trainingDate?: string;
  trainingUrl?: string;
}

export async function sendTrainingAssignmentEmail(params: TrainingEmailParams): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📚 Lịch đào tạo mới</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Xin chào <strong>${params.recipientName}</strong>,</p>
        <p>Bạn được chỉ định tham gia đào tạo thiết bị mới:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Thiết bị:</strong> ${params.deviceName}</p>
          <p style="margin: 5px 0;"><strong>Mã kế hoạch:</strong> ${params.trainingCode}</p>
          <p style="margin: 5px 0;"><strong>Người đào tạo:</strong> ${params.trainerName}</p>
          ${params.trainingDate ? `<p style="margin: 5px 0;"><strong>Ngày đào tạo:</strong> ${params.trainingDate}</p>` : ""}
        </div>
        ${params.trainingUrl ? `<p>Vui lòng <a href="${params.trainingUrl}" style="color: #2563eb;">click vào đây</a> để xem chi tiết và xác nhận tham gia.</p>` : ""}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Đây là email tự động từ hệ thống Quản lý Thiết bị LabHouse. Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `[LabHouse] Lịch đào tạo mới - ${params.deviceName}`,
    html,
  });
}

/**
 * Send calibration reminder email
 */
interface CalibrationEmailParams {
  to: string;
  recipientName: string;
  deviceName: string;
  deviceCode: string;
  dueDate: string;
  deviceUrl?: string;
}

export async function sendCalibrationReminderEmail(params: CalibrationEmailParams): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">⚠️ Nhắc nhở hiệu chuẩn thiết bị</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Xin chào <strong>${params.recipientName}</strong>,</p>
        <p>Thiết bị sắp đến hạn hiệu chuẩn:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Thiết bị:</strong> ${params.deviceName}</p>
          <p style="margin: 5px 0;"><strong>Mã thiết bị:</strong> ${params.deviceCode}</p>
          <p style="margin: 5px 0;"><strong>Ngày đến hạn:</strong> ${params.dueDate}</p>
        </div>
        ${params.deviceUrl ? `<p>Vui lòng <a href="${params.deviceUrl}" style="color: #2563eb;">click vào đây</a> để xem chi tiết và tạo yêu cầu hiệu chuẩn.</p>` : ""}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Đây là email tự động từ hệ thống Quản lý Thiết bị LabHouse. Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `[LabHouse] Nhắc nhở hiệu chuẩn - ${params.deviceCode}`,
    html,
  });
}

/**
 * Send incident report notification
 */
interface IncidentEmailParams {
  to: string;
  recipientName: string;
  incidentCode: string;
  deviceName: string;
  reporterName: string;
  incidentUrl?: string;
}

export async function sendIncidentNotificationEmail(params: IncidentEmailParams): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🚨 Báo cáo sự cố mới</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p>Xin chào <strong>${params.recipientName}</strong>,</p>
        <p>Có báo cáo sự cố mới cần được xem xét:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Mã sự cố:</strong> ${params.incidentCode}</p>
          <p style="margin: 5px 0;"><strong>Thiết bị:</strong> ${params.deviceName}</p>
          <p style="margin: 5px 0;"><strong>Người báo cáo:</strong> ${params.reporterName}</p>
        </div>
        ${params.incidentUrl ? `<p>Vui lòng <a href="${params.incidentUrl}" style="color: #2563eb;">click vào đây</a> để xem chi tiết và xử lý sự cố.</p>` : ""}
        <p style="color: #dc2626; font-weight: bold; margin-top: 15px;">
          ⚠️ Đây là thông báo quan trọng, vui lòng xem xét ngay!
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Đây là email tự động từ hệ thống Quản lý Thiết bị LabHouse. Vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.to,
    subject: `[LabHouse] 🚨 Báo cáo sự cố mới - ${params.incidentCode}`,
    html,
  });
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(defaultConfig.auth.user && defaultConfig.auth.pass);
}
