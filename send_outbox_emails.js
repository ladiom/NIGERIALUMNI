// Send queued notification emails from email_outbox via SMTP
// Usage: set env vars and run `node send_outbox_emails.js`
// Required env:
// - SMTP_HOST (e.g., smtp.office365.com)
// - SMTP_PORT (e.g., 587)
// - SMTP_USER
// - SMTP_PASS
// - SMTP_FROM_EMAIL (sender email)
// - SMTP_FROM_NAME (sender display name)
// - REACT_APP_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (preferred) or REACT_APP_SUPABASE_ANON_KEY (if RLS allows)

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // STARTTLS on 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendPendingEmails(batchSize = 50) {
  console.log('Fetching pending emails from email_outbox...');
  const { data: pending, error } = await supabase
    .from('email_outbox')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error('Error fetching outbox:', error.message);
    process.exit(1);
  }

  if (!pending || pending.length === 0) {
    console.log('No pending emails to send.');
    return;
  }

  console.log(`Sending ${pending.length} emails...`);
  for (const item of pending) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Admin';
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: item.to_email,
        subject: item.subject,
        text: item.body
      });

      await supabase
        .from('email_outbox')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error: null })
        .eq('id', item.id);

      console.log(`Sent to ${item.to_email} (id=${item.id})`);
    } catch (err) {
      console.error(`Failed to send to ${item.to_email} (id=${item.id}):`, err.message);
      await supabase
        .from('email_outbox')
        .update({ status: 'failed', error: err.message })
        .eq('id', item.id);
    }
  }
}

sendPendingEmails().then(() => {
  console.log('Outbox processing completed.');
}).catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});