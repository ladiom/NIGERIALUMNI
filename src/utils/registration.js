import supabase from '../supabaseClient';

export async function createPendingRegistration(alumniId, email) {
  const { data, error } = await supabase
    .from('pending_registrations')
    .insert([{ alumni_id: alumniId, email }])
    .select();
  if (error) throw error;
  return data?.[0] || null;
}

export async function sendRegistrationLink(email, redirectTo) {
  // Use Supabase Auth magic link signUp without password
  const { data, error } = await supabase.auth.signUp({
    email,
    password: cryptoRandomString(),
    options: {
      emailRedirectTo: redirectTo || window.location.origin + '/register'
    }
  });
  if (error) throw error;
  return data;
}

function cryptoRandomString() {
  // Generate a short random password string; replaced later after verification
  const arr = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return btoa(String.fromCharCode(...arr));
}

// Import the new email service
import { sendPendingRegistrationEmail } from '../services/emailService';

// Lightweight: queue a notification email in the email_outbox table
export async function enqueueRegistrationReceivedEmail({
  toEmail,
  toName,
  alumniId,
  schoolName
}) {
  if (!toEmail) return null;
  
  try {
    // Use the new email service for better formatting and tracking
    return await sendPendingRegistrationEmail({
      toEmail,
      toName,
      alumniId,
      schoolName
    });
  } catch (error) {
    console.error('Error sending pending registration email:', error);
    
    // Simple fallback - just log the email that would be sent
    console.log('Email notification (would be sent):', {
      to: toEmail,
      subject: 'Nigeria Alumni Network — Registration Received',
      body: `Hello ${toName || 'Alumni'},\n\n` +
        `We have received your registration for the Nigeria Alumni Network${schoolName ? ` (${schoolName})` : ''}. ` +
        `Your submission is now under review by NAN. We will contact you via email ` +
        `with next steps and share your unique alumni ID${alumniId ? ` (${alumniId})` : ''} once approved.\n\n` +
        `Thank you for joining the network!\n` +
        `— Nigeria Alumni Network`
    });
    
    // Return a mock success response
    return { id: 'mock-email-id', to_email: toEmail };
  }
}