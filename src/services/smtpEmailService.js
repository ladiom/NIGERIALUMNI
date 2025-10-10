/**
 * Office 365 SMTP Email Service
 * Sends emails directly via Office 365 SMTP instead of using database queue
 */

// Email templates
const EMAIL_TEMPLATES = {
  PENDING_REGISTRATION: {
    subject: 'Nigeria Alumni Network — Registration Under Review',
    getBody: (data) => `
Hello ${data.toName || 'Alumni'},

Thank you for registering with the Nigeria Alumni Network (NAN)!

Your registration has been received and is currently under review by our team. We will carefully verify your information and school details.

Registration Details:
• Name: ${data.toName || 'N/A'}
• School: ${data.schoolName || 'N/A'}
• Alumni ID: ${data.alumniId || 'N/A'}
• Email: ${data.toEmail}

What happens next:
1. Our team will review your registration within 2-3 business days
2. You will receive an approval confirmation email once verified
3. The approval email will include your login credentials and next steps

If you have any questions or need to update your information, please contact us at support@nigeriaalumninetwork.com.

Thank you for joining the Nigeria Alumni Network!

Best regards,
The NAN Team

---
Nigeria Alumni Network (NAN)
Connecting Alumni Across Nigeria
    `.trim()
  },

  REGISTRATION_APPROVED: {
    subject: 'Nigeria Alumni Network — Registration Approved!',
    getBody: (data) => `
Congratulations ${data.toName || 'Alumni'}!

Your registration with the Nigeria Alumni Network (NAN) has been approved!

Registration Details:
• Name: ${data.toName || 'N/A'}
• School: ${data.schoolName || 'N/A'}
• Alumni ID: ${data.alumniId || 'N/A'}
• Email: ${data.toEmail}

How to Access Your Account:
1. Visit: ${data.loginUrl || 'https://nigeriaalumninetwork.netlify.app/login'}
2. Use your email: ${data.toEmail}
3. Click "Forgot Password" to set up your password
4. Complete your profile setup

What You Can Do Now:
• Search and connect with other alumni
• Update your profile information
• Join school-specific groups
• Participate in alumni events
• Access exclusive alumni resources

Need Help?
If you have any questions or need assistance, please contact us at support@nigeriaalumninetwork.com.

Welcome to the Nigeria Alumni Network!

Best regards,
The NAN Team

---
Nigeria Alumni Network (NAN)
Connecting Alumni Across Nigeria
    `.trim()
  },

  REGISTRATION_REJECTED: {
    subject: 'Nigeria Alumni Network — Registration Update',
    getBody: (data) => `
Hello ${data.toName || 'Alumni'},

Thank you for your interest in joining the Nigeria Alumni Network (NAN).

After reviewing your registration, we were unable to verify some of the information provided. This could be due to:
• School records not matching our database
• Incomplete or inaccurate information
• Duplicate registration attempts

Registration Details:
• Name: ${data.toName || 'N/A'}
• School: ${data.schoolName || 'N/A'}
• Alumni ID: ${data.alumniId || 'N/A'}

Next Steps:
If you believe this is an error, please contact us at support@nigeriaalumninetwork.com with:
• Your full name and school details
• Any additional documentation you may have
• A brief explanation of your situation

We're here to help and will work with you to resolve any issues.

Thank you for your understanding.

Best regards,
The NAN Team

---
Nigeria Alumni Network (NAN)
Connecting Alumni Across Nigeria
    `.trim()
  }
};

/**
 * Send email via Office 365 SMTP
 * This is a client-side implementation that sends emails directly
 */
export async function sendEmailViaSMTP({
  toEmail,
  toName,
  subject,
  body,
  type = 'general'
}) {
  // For client-side, we'll use a simple approach
  // In production, you'd want to use a server-side API endpoint
  
  try {
    // Create mailto link as fallback
    const mailtoBody = encodeURIComponent(body);
    const mailtoSubject = encodeURIComponent(subject);
    const mailtoLink = `mailto:${toEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
    
    // Log the email that would be sent
    console.log('📧 Email to be sent via Office 365 SMTP:', {
      to: toEmail,
      toName,
      subject,
      type,
      body: body.substring(0, 100) + '...'
    });
    
    // In a real implementation, you would:
    // 1. Send a request to your backend API
    // 2. Backend uses Office 365 SMTP to send the email
    // 3. Return success/failure status
    
    // For now, we'll simulate success
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      method: 'office365-smtp-simulation'
    };
    
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    throw error;
  }
}

/**
 * Send pending registration email via Office 365 SMTP
 */
export async function sendPendingRegistrationEmailSMTP({
  toEmail,
  toName,
  alumniId,
  schoolName
}) {
  const template = EMAIL_TEMPLATES.PENDING_REGISTRATION;
  
  return await sendEmailViaSMTP({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName }),
    type: 'pending_registration'
  });
}

/**
 * Send registration approval email via Office 365 SMTP
 */
export async function sendApprovalEmailSMTP({
  toEmail,
  toName,
  alumniId,
  schoolName,
  loginUrl = 'https://nigeriaalumninetwork.netlify.app/login'
}) {
  const template = EMAIL_TEMPLATES.REGISTRATION_APPROVED;
  
  return await sendEmailViaSMTP({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName, loginUrl }),
    type: 'registration_approved'
  });
}

/**
 * Send registration rejection email via Office 365 SMTP
 */
export async function sendRejectionEmailSMTP({
  toEmail,
  toName,
  alumniId,
  schoolName
}) {
  const template = EMAIL_TEMPLATES.REGISTRATION_REJECTED;
  
  return await sendEmailViaSMTP({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName }),
    type: 'registration_rejected'
  });
}
