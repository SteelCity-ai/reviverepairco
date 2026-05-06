import nodemailer from "nodemailer";
import { randomUUID } from "crypto";

// ── Transport ──────────────────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });
    console.log("[email] Zoho SMTP transport configured");
  } else {
    console.warn(
      "[email] ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD not set — emails will be logged to console",
    );
  }

  return transporter;
}

// ── Core ───────────────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const transport = getTransporter();

  console.log(`[email] TO: ${to} | SUBJECT: ${subject}`);
  console.log(`[email] BODY (first 200 chars): ${html.slice(0, 200)}...`);

  if (transport) {
    try {
      await transport.sendMail({
        from: process.env.ZOHO_SMTP_USER,
        to,
        subject,
        html,
      });
      console.log(`[email] Sent successfully to ${to}`);
    } catch (err) {
      console.error("[email] Send failed:", err);
      // Don't throw — email is non-critical
    }
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

export function inviteTemplate(params: {
  inviteUrl: string;
  projectName?: string;
  role: string;
}): string {
  return `
    <h2>You've been invited to the Revive Roof Repair Portal</h2>
    <p>You've been invited as a <strong>${params.role}</strong>${params.projectName ? ` for project <strong>${params.projectName}</strong>` : ""}.</p>
    <p><a href="${params.inviteUrl}">Click here to accept your invitation</a></p>
    <p>If you have any questions, please contact your project manager.</p>
  `;
}

export function pmReviewTemplate(params: {
  projectName: string;
  mainTaskName: string;
  reviewUrl: string;
}): string {
  return `
    <h2>Main Task Ready for Review</h2>
    <p><strong>${params.mainTaskName}</strong> on project <strong>${params.projectName}</strong> is ready for Project Manager review.</p>
    <p><a href="${params.reviewUrl}">Review task</a></p>
  `;
}

export function clientSignoffTemplate(params: {
  projectName: string;
  mainTaskName: string;
  signoffUrl: string;
}): string {
  return `
    <h2>Work Completed — Ready for Signoff</h2>
    <p><strong>${params.mainTaskName}</strong> on project <strong>${params.projectName}</strong> has been completed and is ready for your review and signoff.</p>
    <p><a href="${params.signoffUrl}">Review & Sign Off</a></p>
  `;
}

export function signoffConfirmationTemplate(params: {
  projectName: string;
  mainTaskName: string;
}): string {
  return `
    <h2>Signoff Confirmed</h2>
    <p>Thank you for signing off on <strong>${params.mainTaskName}</strong> for project <strong>${params.projectName}</strong>.</p>
    <p>A completion document has been generated for your records.</p>
  `;
}

export function dailySummaryTemplate(params: {
  projectName: string;
  date: string;
  tasksCompleted: number;
  tasksInProgress: number;
  photosUploaded: number;
  summaryUrl: string;
}): string {
  return `
    <h2>Daily Summary — ${params.date}</h2>
    <h3>Project: ${params.projectName}</h3>
    <ul>
      <li>Tasks completed: ${params.tasksCompleted}</li>
      <li>Tasks in progress: ${params.tasksInProgress}</li>
      <li>Photos uploaded: ${params.photosUploaded}</li>
    </ul>
    <p><a href="${params.summaryUrl}">View full summary</a></p>
  `;
}

export function changeOrderReviewTemplate(params: {
  projectName: string;
  changeOrderTitle: string;
  costImpact: string;
  reviewUrl: string;
}): string {
  return `
    <h2>Change Order Requires Review</h2>
    <p>A change order <strong>${params.changeOrderTitle}</strong> on project <strong>${params.projectName}</strong> requires your review.</p>
    <p>Cost impact: <strong>${params.costImpact}</strong></p>
    <p><a href="${params.reviewUrl}">Review Change Order</a></p>
  `;
}

export function punchItemAssignedTemplate(params: {
  projectName: string;
  description: string;
  deadline?: string;
  punchUrl: string;
}): string {
  return `
    <h2>Punch Item Assigned</h2>
    <p>A new punch item has been assigned to you on project <strong>${params.projectName}</strong>:</p>
    <blockquote>${params.description}</blockquote>
    ${params.deadline ? `<p>Deadline: <strong>${params.deadline}</strong></p>` : ""}
    <p><a href="${params.punchUrl}">View Punch Item</a></p>
  `;
}

export function selectionDeadlineTemplate(params: {
  projectName: string;
  selectionName: string;
  deadline: string;
  selectionUrl: string;
}): string {
  return `
    <h2>Selection Requires Your Choice</h2>
    <p><strong>${params.selectionName}</strong> on project <strong>${params.projectName}</strong> needs your selection by <strong>${params.deadline}</strong>.</p>
    <p><a href="${params.selectionUrl}">Make Selection</a></p>
  `;
}
