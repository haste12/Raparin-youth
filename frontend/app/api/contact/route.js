import { NextResponse } from 'next/server';
import { sanitizeContactForm, escapeHtml } from '@/lib/sanitize';

/**
 * POST /api/contact
 * Sanitizes all inputs before using them. Sends via Gmail App Password when
 * EMAIL_USER / EMAIL_PASS are configured; otherwise logs to console.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // ── Sanitize & validate ────────────────────────────────────────────────
    const { ok, errors, data } = sanitizeContactForm(body);
    if (!ok) {
      return NextResponse.json({ success: false, message: errors[0] }, { status: 400 });
    }

    const { name, email, subject, message } = data;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gmail App Password
        },
      });

      await transporter.sendMail({
        from:    `"Raparin Youth Website" <${process.env.EMAIL_USER}>`,
        replyTo: `"${escapeHtml(name)}" <${email}>`,
        to:      process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: subject
          ? `[Contact] ${escapeHtml(subject)}`
          : `[Contact] New message from ${escapeHtml(name)}`,
        // ⬇ Escape all user content before embedding in HTML
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#0D3461">New Contact Form Submission</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px;font-weight:bold;width:100px">Name</td>
                  <td style="padding:8px">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Email</td>
                  <td style="padding:8px"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold">Subject</td>
                  <td style="padding:8px">${escapeHtml(subject || 'General Inquiry')}</td></tr>
            </table>
            <h3 style="color:#0D3461">Message</h3>
            <p style="white-space:pre-wrap;background:#f5f5f5;padding:16px;border-radius:8px">${escapeHtml(message)}</p>
          </div>
        `,
        // Plain-text fallback (also escaped)
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'General Inquiry'}\n\nMessage:\n${message}`,
      });
    } else {
      // Email not configured — log to server console
      console.log('[contact-form]', { name, email, subject, message: message.slice(0, 100) + '…' });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('[contact-form] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
