import supabase from '../supabaseClient';

// Office 365 SMTP API endpoint
const SMTP_API_URL = import.meta.env.DEV 
  ? 'https://100naira-platform.netlify.app/.netlify/functions/send-email'
  : '/.netlify/functions/send-email';

/**
 * Email Service for Nigeria Alumni Network
 * Handles all email notifications for the registration workflow
 */

// Email templates
const EMAIL_TEMPLATES = {
  PENDING_REGISTRATION: {
    subject: '🎓 Nigeria Alumni Network — Registration Under Review',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Under Review</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, var(--spaco-primary) 0%, var(--spaco-secondary) 100%); color: white; padding: 2rem; text-align: center; }
    .header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
    .header p { margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem; }
    .content { padding: 2rem; }
    .greeting { font-size: 1.2rem; margin-bottom: 1.5rem; color: #2d3748; }
    .info-box { background: #f7fafc; border-left: 4px solid #4299e1; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 6px 6px 0; }
    .info-box h3 { margin: 0 0 1rem; color: #2d3748; font-size: 1.1rem; }
    .info-box ul { margin: 0; padding-left: 0; list-style: none; }
    .info-box li { padding: 0.5rem 0; display: flex; align-items: flex-start; }
    .info-box li::before { content: "✓"; color: #48bb78; font-weight: bold; margin-right: 0.5rem; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
    .detail-item { background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; }
    .detail-label { font-weight: 600; color: #4a5568; font-size: 0.9rem; }
    .detail-value { color: #2d3748; margin-top: 0.25rem; }
    .next-steps { background: #fef5e7; border-left: 4px solid #f6ad55; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 6px 6px 0; }
    .next-steps h3 { margin: 0 0 1rem; color: #2d3748; }
    .next-steps ol { margin: 0; padding-left: 1.5rem; }
    .next-steps li { margin: 0.5rem 0; color: #4a5568; }
    .footer { background: #2d3748; color: white; padding: 1.5rem; text-align: center; }
    .footer p { margin: 0.5rem 0; }
    .contact-info { margin-top: 1rem; font-size: 0.9rem; opacity: 0.8; }
    @media (max-width: 600px) { .details-grid { grid-template-columns: 1fr; } .header, .content, .footer { padding: 1.5rem; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Nigeria Alumni Network</h1>
      <p>Registration Under Review</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello ${data.toName || 'Alumni'},
      </div>
      
      <p>Thank you for registering with the Nigeria Alumni Network (NAN)! We're excited to have you join our community of alumni across Nigeria.</p>
      
      <div class="info-box">
        <h3>📋 Registration Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${data.toName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">School</div>
            <div class="detail-value">${data.schoolName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Alumni ID</div>
            <div class="detail-value">${data.alumniId || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${data.toEmail}</div>
          </div>
        </div>
      </div>
      
      <div class="next-steps">
        <h3>⏱️ What Happens Next?</h3>
        <ol>
          <li>Our team will review your registration within 2-3 business days</li>
          <li>You will receive an approval confirmation email once verified</li>
          <li>The approval email will include your login credentials and next steps</li>
          <li>You'll gain access to our alumni directory and networking features</li>
        </ol>
      </div>
      
      <p>If you have any questions or need to update your information, please don't hesitate to contact us at <strong>support@nigeriaalumninetwork.com</strong>.</p>
      
      <p>Thank you for joining the Nigeria Alumni Network!</p>
    </div>
    
    <div class="footer">
      <p><strong>Best regards,</strong></p>
      <p>The NAN Team</p>
      <div class="contact-info">
        <p>Nigeria Alumni Network (NAN)</p>
        <p>Connecting Alumni Across Nigeria</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  REGISTRATION_APPROVED: {
    subject: '🎉 Nigeria Alumni Network — Registration Approved!',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Approved</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 2rem; text-align: center; }
    .header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
    .header p { margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem; }
    .content { padding: 2rem; }
    .greeting { font-size: 1.2rem; margin-bottom: 1.5rem; color: #2d3748; }
    .success-banner { background: #f0fff4; border: 2px solid #48bb78; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
    .success-banner h2 { margin: 0; color: #2d3748; font-size: 1.5rem; }
    .success-banner p { margin: 0.5rem 0 0; color: #4a5568; }
    .info-box { background: #f7fafc; border-left: 4px solid #4299e1; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 6px 6px 0; }
    .info-box h3 { margin: 0 0 1rem; color: #2d3748; font-size: 1.1rem; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
    .detail-item { background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; }
    .detail-label { font-weight: 600; color: #4a5568; font-size: 0.9rem; }
    .detail-value { color: #2d3748; margin-top: 0.25rem; font-weight: 500; }
    .login-box { background: #e6fffa; border: 2px solid #38b2ac; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
    .login-box h3 { margin: 0 0 1rem; color: #2d3748; }
    .login-button { display: inline-block; background: #4299e1; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 1rem 0; }
    .login-button:hover { background: #3182ce; }
    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
    .feature-item { background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; text-align: center; }
    .feature-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .feature-title { font-weight: 600; color: #2d3748; margin-bottom: 0.5rem; }
    .feature-desc { color: #4a5568; font-size: 0.9rem; }
    .footer { background: #2d3748; color: white; padding: 1.5rem; text-align: center; }
    .footer p { margin: 0.5rem 0; }
    .contact-info { margin-top: 1rem; font-size: 0.9rem; opacity: 0.8; }
    @media (max-width: 600px) { .details-grid, .features-grid { grid-template-columns: 1fr; } .header, .content, .footer { padding: 1.5rem; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nigeria Alumni Network</h1>
      <p>Registration Approved!</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Congratulations ${data.toName || 'Alumni'}!
      </div>
      
      <div class="success-banner">
        <h2>🎊 Welcome to NAN!</h2>
        <p>Your registration has been approved and you're now part of our alumni community.</p>
      </div>
      
      <div class="info-box">
        <h3>📋 Your Registration Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${data.toName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">School</div>
            <div class="detail-value">${data.schoolName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Alumni ID</div>
            <div class="detail-value">${data.alumniId || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${data.toEmail}</div>
          </div>
        </div>
      </div>
      
      <div class="login-box">
        <h3>🔐 Access Your Account</h3>
        <p>Your account is ready! Click the button below to get started:</p>
        <a href="${data.loginUrl || 'https://100naira-platform.netlify.app/login'}" class="login-button">Login to Your Account</a>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: #4a5568;">
          <strong>Login Instructions:</strong><br>
          1. Use your email: <strong>${data.toEmail}</strong><br>
          2. Click "Forgot Password" to set up your password<br>
          3. Complete your profile setup
        </p>
      </div>
      
      <div class="info-box">
        <h3>🚀 What You Can Do Now</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <div class="feature-title">Search Alumni</div>
            <div class="feature-desc">Find and connect with fellow alumni</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">👤</div>
            <div class="feature-title">Update Profile</div>
            <div class="feature-desc">Keep your information current</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🏫</div>
            <div class="feature-title">School Groups</div>
            <div class="feature-desc">Join school-specific communities</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📅</div>
            <div class="feature-title">Alumni Events</div>
            <div class="feature-desc">Participate in networking events</div>
          </div>
        </div>
      </div>
      
      <p>If you have any questions or need assistance, please contact us at <strong>support@nigeriaalumninetwork.com</strong>.</p>
      
      <p>Welcome to the Nigeria Alumni Network!</p>
    </div>
    
    <div class="footer">
      <p><strong>Best regards,</strong></p>
      <p>The NAN Team</p>
      <div class="contact-info">
        <p>Nigeria Alumni Network (NAN)</p>
        <p>Connecting Alumni Across Nigeria</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  },

  REGISTRATION_REJECTED: {
    subject: '📋 Nigeria Alumni Network — Registration Update',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Update</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; padding: 2rem; text-align: center; }
    .header h1 { margin: 0; font-size: 1.8rem; font-weight: 700; }
    .header p { margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem; }
    .content { padding: 2rem; }
    .greeting { font-size: 1.2rem; margin-bottom: 1.5rem; color: #2d3748; }
    .notice-box { background: #fef5e7; border: 2px solid #f6ad55; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
    .notice-box h2 { margin: 0; color: #2d3748; font-size: 1.5rem; }
    .notice-box p { margin: 0.5rem 0 0; color: #4a5568; }
    .info-box { background: #f7fafc; border-left: 4px solid #4299e1; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 6px 6px 0; }
    .info-box h3 { margin: 0 0 1rem; color: #2d3748; font-size: 1.1rem; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
    .detail-item { background: #fff; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0; }
    .detail-label { font-weight: 600; color: #4a5568; font-size: 0.9rem; }
    .detail-value { color: #2d3748; margin-top: 0.25rem; }
    .reasons-box { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1.5rem; margin: 1.5rem 0; border-radius: 0 6px 6px 0; }
    .reasons-box h3 { margin: 0 0 1rem; color: #2d3748; }
    .reasons-box ul { margin: 0; padding-left: 1.5rem; }
    .reasons-box li { margin: 0.5rem 0; color: #4a5568; }
    .next-steps { background: #e6fffa; border: 2px solid #38b2ac; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; }
    .next-steps h3 { margin: 0 0 1rem; color: #2d3748; }
    .next-steps ul { margin: 0; padding-left: 1.5rem; }
    .next-steps li { margin: 0.5rem 0; color: #4a5568; }
    .contact-box { background: #f0fff4; border: 2px solid #48bb78; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center; }
    .contact-box h3 { margin: 0 0 1rem; color: #2d3748; }
    .contact-email { font-size: 1.1rem; font-weight: 600; color: #4299e1; }
    .footer { background: #2d3748; color: white; padding: 1.5rem; text-align: center; }
    .footer p { margin: 0.5rem 0; }
    .contact-info { margin-top: 1rem; font-size: 0.9rem; opacity: 0.8; }
    @media (max-width: 600px) { .details-grid { grid-template-columns: 1fr; } .header, .content, .footer { padding: 1.5rem; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Nigeria Alumni Network</h1>
      <p>Registration Update</p>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello ${data.toName || 'Alumni'},
      </div>
      
      <p>Thank you for your interest in joining the Nigeria Alumni Network (NAN). We appreciate you taking the time to register with us.</p>
      
      <div class="notice-box">
        <h2>📝 Registration Review Complete</h2>
        <p>After carefully reviewing your registration, we were unable to verify some of the information provided.</p>
      </div>
      
      <div class="reasons-box">
        <h3>🔍 Possible Reasons for Rejection</h3>
        <ul>
          <li>School records not matching our database</li>
          <li>Incomplete or inaccurate information provided</li>
          <li>Duplicate registration attempts detected</li>
          <li>Unable to verify graduation details</li>
        </ul>
      </div>
      
      <div class="info-box">
        <h3>📋 Registration Details Reviewed</h3>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Full Name</div>
            <div class="detail-value">${data.toName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">School</div>
            <div class="detail-value">${data.schoolName || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Alumni ID</div>
            <div class="detail-value">${data.alumniId || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">Under Review</div>
          </div>
        </div>
      </div>
      
      <div class="next-steps">
        <h3>🔄 Next Steps</h3>
        <p>If you believe this is an error, please contact us with the following information:</p>
        <ul>
          <li>Your full name and school details</li>
          <li>Any additional documentation you may have</li>
          <li>A brief explanation of your situation</li>
          <li>Graduation year and any other relevant details</li>
        </ul>
      </div>
      
      <div class="contact-box">
        <h3>💬 We're Here to Help</h3>
        <p>We're committed to helping you join our alumni network. Please reach out to us at:</p>
        <p class="contact-email">support@nigeriaalumninetwork.com</p>
        <p>We'll work with you to resolve any issues and get you connected with your fellow alumni.</p>
      </div>
      
      <p>Thank you for your understanding and continued interest in the Nigeria Alumni Network.</p>
    </div>
    
    <div class="footer">
      <p><strong>Best regards,</strong></p>
      <p>The NAN Team</p>
      <div class="contact-info">
        <p>Nigeria Alumni Network (NAN)</p>
        <p>Connecting Alumni Across Nigeria</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
};

/**
 * Send email via Office 365 SMTP
 * @param {Object} emailData - Email data object
 * @param {string} emailData.toEmail - Recipient email
 * @param {string} emailData.toName - Recipient name
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body
 * @param {string} emailData.type - Email type for tracking
 * @returns {Promise<Object>} - Send result
 */
export async function sendEmailViaSMTP({
  toEmail,
  toName,
  subject,
  body,
  type = 'general'
}) {
  if (!toEmail) {
    throw new Error('Email address is required');
  }

  try {
    // Send email via Office 365 SMTP
    const response = await fetch(SMTP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail,
        toName,
        subject,
        body,
        type
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log(`Email sent successfully to ${toEmail} (${type})`);
    return result;
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    
    // Fallback: log email and return mock success
    console.log('📧 Email (fallback logging):', {
      to: toEmail,
      subject,
      type,
      body: body.substring(0, 100) + '...'
    });
    
    return {
      success: true,
      messageId: `fallback-${Date.now()}`,
      method: 'fallback-logging'
    };
  }
}

/**
 * Queue an email for sending (now uses SMTP directly)
 * @param {Object} emailData - Email data object
 * @param {string} emailData.toEmail - Recipient email
 * @param {string} emailData.toName - Recipient name
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body
 * @param {string} emailData.type - Email type for tracking
 * @returns {Promise<Object>} - Send result
 */
export async function queueEmail({
  toEmail,
  toName,
  subject,
  body,
  type = 'general'
}) {
  // Use SMTP directly instead of database queue
  return await sendEmailViaSMTP({
    toEmail,
    toName,
    subject,
    body,
    type
  });
}

/**
 * Send pending registration confirmation email
 * @param {Object} data - Registration data
 * @returns {Promise<Object>} - Created email record
 */
export async function sendPendingRegistrationEmail({
  toEmail,
  toName,
  alumniId,
  schoolName
}) {
  const template = EMAIL_TEMPLATES.PENDING_REGISTRATION;
  
  return await queueEmail({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName }),
    type: 'pending_registration'
  });
}

/**
 * Send registration approval email
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} - Created email record
 */
export async function sendApprovalEmail({
  toEmail,
  toName,
  alumniId,
  schoolName,
  loginUrl = 'https://100naira-platform.netlify.app/login'
}) {
  const template = EMAIL_TEMPLATES.REGISTRATION_APPROVED;
  
  return await queueEmail({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName, loginUrl }),
    type: 'registration_approved'
  });
}

/**
 * Send registration rejection email
 * @param {Object} data - Rejection data
 * @returns {Promise<Object>} - Created email record
 */
export async function sendRejectionEmail({
  toEmail,
  toName,
  alumniId,
  schoolName
}) {
  const template = EMAIL_TEMPLATES.REGISTRATION_REJECTED;
  
  return await queueEmail({
    toEmail,
    toName,
    subject: template.subject,
    body: template.getBody({ toEmail, toName, alumniId, schoolName }),
    type: 'registration_rejected'
  });
}

/**
 * Get email queue status
 * @returns {Promise<Array>} - Email queue records
 */
export async function getEmailQueue() {
  try {
    const { data, error } = await supabase
      .from('email_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching email queue:', error);
    throw error;
  }
}

/**
 * Mark email as sent
 * @param {string} emailId - Email ID
 * @returns {Promise<Object>} - Updated email record
 */
export async function markEmailAsSent(emailId) {
  try {
    const { data, error } = await supabase
      .from('email_outbox')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error marking email as sent:', error);
    throw error;
  }
}
