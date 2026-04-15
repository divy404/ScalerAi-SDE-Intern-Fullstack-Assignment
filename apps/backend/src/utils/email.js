const nodemailer = require("nodemailer");
const { format } = require("date-fns");
const { toZonedTime } = require("date-fns-tz");

function createTransporter() {
  // For production: use real SMTP credentials from env
  // For development: uses Ethereal (fake SMTP)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

async function sendBookingConfirmation({ booking, eventType, hostName }) {
  const transporter = createTransporter();
  if (!transporter) return; // Skip email if not configured

  const tz = booking.timezone || "UTC";
  const zonedStart = toZonedTime(new Date(booking.startTime), tz);
  const formattedTime = format(zonedStart, "EEEE, MMMM d, yyyy 'at' h:mm a");

  try {
    await transporter.sendMail({
      from: `"${hostName}" <${process.env.SMTP_USER}>`,
      to: booking.inviteeEmail,
      subject: `Confirmed: ${eventType.name} with ${hostName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0069ff;">Your meeting is confirmed!</h2>
          <p>Hi ${booking.inviteeName},</p>
          <p>Your <strong>${eventType.name}</strong> with <strong>${hostName}</strong> has been scheduled.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${formattedTime} (${tz})</p>
            <p><strong>Duration:</strong> ${eventType.duration} minutes</p>
          </div>
          <p>If you need to cancel, please contact ${hostName} directly.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

async function sendCancellationEmail({ booking, eventType, hostName }) {
  const transporter = createTransporter();
  if (!transporter) return;

  const tz = booking.timezone || "UTC";
  const zonedStart = toZonedTime(new Date(booking.startTime), tz);
  const formattedTime = format(zonedStart, "EEEE, MMMM d, yyyy 'at' h:mm a");

  try {
    await transporter.sendMail({
      from: `"${hostName}" <${process.env.SMTP_USER}>`,
      to: booking.inviteeEmail,
      subject: `Cancelled: ${eventType.name} with ${hostName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Your meeting has been cancelled</h2>
          <p>Hi ${booking.inviteeName},</p>
          <p>Your <strong>${eventType.name}</strong> scheduled for <strong>${formattedTime}</strong> has been cancelled.</p>
          ${booking.cancelReason ? `<p><strong>Reason:</strong> ${booking.cancelReason}</p>` : ""}
        </div>
      `,
    });
  } catch (err) {
    console.error("Cancellation email failed:", err.message);
  }
}

module.exports = { sendBookingConfirmation, sendCancellationEmail };
