import { NextResponse } from "next/server";
import {
  sendEmail,
  sendApprovalRequestEmail,
  sendApprovalResultEmail,
  sendTrainingAssignmentEmail,
  sendCalibrationReminderEmail,
  sendIncidentNotificationEmail,
  isEmailConfigured,
  initEmailService,
} from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    // Check if email service is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, ...params } = body;

    let result: boolean;

    switch (type) {
      case "approval_request":
        result = await sendApprovalRequestEmail(params);
        break;

      case "approval_result":
        result = await sendApprovalResultEmail(params);
        break;

      case "training_assignment":
        result = await sendTrainingAssignmentEmail(params);
        break;

      case "calibration_reminder":
        result = await sendCalibrationReminderEmail(params);
        break;

      case "incident_notification":
        result = await sendIncidentNotificationEmail(params);
        break;

      case "custom":
        result = await sendEmail({
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in email API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return email configuration status (without exposing credentials)
  const configured = isEmailConfigured();
  
  return NextResponse.json({
    configured,
    message: configured
      ? "Email service is configured and ready"
      : "Email service is not configured. Set SMTP_USER and SMTP_PASS environment variables.",
  });
}
