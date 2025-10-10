# Email Testing Guide - Nigeria Alumni Network

This guide will help you test the email functionality for the Nigeria Alumni Network platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Test Settings
Before running tests, update the configuration in the test files:

**For `test_email_simple.js`:**
```javascript
const CONFIG = {
  netlifyUrl: 'https://your-site.netlify.app/.netlify/functions/send-email',
  testEmail: 'your-test-email@example.com',
  testName: 'Your Test Name'
};
```

**For `test_email_functionality.js`:**
```javascript
const TEST_CONFIG = {
  testEmail: 'your-test-email@example.com',
  testName: 'Your Test Name',
  netlifyFunctionUrl: 'https://your-site.netlify.app/.netlify/functions/send-email'
};
```

### 3. Set Environment Variables (Optional)
For local SMTP testing, set these environment variables:
```bash
export OFFICE365_EMAIL="your-email@yourdomain.com"
export OFFICE365_PASSWORD="your-app-password"
```

## 📧 Test Files

### 1. `test_email_simple.js` - Basic Email Test
**Purpose:** Quick test of the Netlify function
**Run:** `npm run test-email`

**What it tests:**
- Netlify function connectivity
- Email template generation
- Basic email sending

### 2. `test_email_functionality.js` - Comprehensive Test
**Purpose:** Full email system testing
**Run:** `npm run test-email-full`

**What it tests:**
- SMTP connection (if credentials provided)
- Email template generation
- Netlify function
- All email types (pending, approved, rejected)

### 3. `test_email_browser.html` - Browser Test
**Purpose:** Interactive testing in the browser
**Run:** Open in browser

**What it provides:**
- Interactive form for testing
- Real-time email preview
- Visual feedback
- Easy configuration

## 🔧 Test Scenarios

### Scenario 1: Basic Functionality Test
```bash
# Test if the Netlify function is working
npm run test-email
```

**Expected Output:**
```
🚀 Starting Email Tests...
==========================
Netlify URL: https://your-site.netlify.app/.netlify/functions/send-email
Test Email: test@example.com
Test Name: Test User

📧 Testing pending_registration email...
✅ Success! { success: true, messageId: '...' }

📧 Testing registration_approved email...
✅ Success! { success: true, messageId: '...' }

📧 Testing test email...
✅ Success! { success: true, messageId: '...' }

📊 Test Results Summary:
========================
✅ Pending Registration
✅ Registration Approved
✅ Simple Test

🎯 Overall Result: ✅ ALL TESTS PASSED
```

### Scenario 2: Full System Test
```bash
# Test the complete email system
npm run test-email-full
```

**Expected Output:**
```
🚀 Starting Email Functionality Tests...
=====================================

🔧 Testing SMTP Connection...
✅ SMTP connection verified successfully
✅ Test email sent successfully: <message-id>

📧 Testing Email Templates...
✅ Pending registration template generated
✅ Registration approval template generated

🌐 Testing Netlify Function...
✅ Netlify function test successful

📬 Testing All Email Types...
✅ Pending registration email sent
✅ Registration approval email sent

📊 Test Results Summary:
========================
SMTP Connection: ✅ PASS
Email Templates: ✅ PASS
Netlify Function: ✅ PASS
All Email Types: ✅ PASS

🎯 Overall Result: ✅ ALL TESTS PASSED
```

### Scenario 3: Browser Testing
1. Open `test_email_browser.html` in your browser
2. Update the Netlify URL and test email
3. Click "Test Netlify Function" to verify connectivity
4. Use "Generate Email Template" to preview emails
5. Click "Send Test Email" to send a test email
6. Use "Send All Email Types" to test all templates

## 🐛 Troubleshooting

### Common Issues

#### 1. "Function not found" Error
**Problem:** Netlify function URL is incorrect or function not deployed
**Solution:**
- Verify the Netlify function URL
- Check if the function is deployed
- Ensure the function file exists at `netlify/functions/send-email.js`

#### 2. "Authentication failed" Error
**Problem:** Office 365 credentials are incorrect
**Solution:**
- Check your Office 365 email and app password
- Verify the credentials in Netlify environment variables
- Make sure two-factor authentication is enabled

#### 3. "Connection timeout" Error
**Problem:** SMTP connection issues
**Solution:**
- Check if your Office 365 account allows SMTP
- Verify the email address is correct
- Check firewall settings

#### 4. "CORS error" in Browser
**Problem:** Cross-origin request blocked
**Solution:**
- Make sure the Netlify function has proper CORS headers
- Check if the function is accessible from your domain

### Debug Steps

1. **Check Netlify Function Logs:**
   - Go to Netlify dashboard
   - Navigate to Functions → View logs
   - Look for error messages

2. **Test Function Directly:**
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/send-email \
     -H "Content-Type: application/json" \
     -d '{"toEmail":"test@example.com","toName":"Test","subject":"Test","body":"Test","type":"test"}'
   ```

3. **Verify Environment Variables:**
   - Check Netlify dashboard → Site settings → Environment variables
   - Ensure `OFFICE365_EMAIL` and `OFFICE365_PASSWORD` are set

4. **Test SMTP Connection:**
   - Use the SMTP test in `test_email_functionality.js`
   - Check if you can connect directly to Office 365

## 📋 Email Templates

The system includes these email templates:

### 1. Pending Registration
- **Trigger:** When user registers
- **Purpose:** Inform user that registration is under review
- **Content:** Registration details, next steps, contact info

### 2. Registration Approved
- **Trigger:** When admin approves registration
- **Purpose:** Welcome user and provide login instructions
- **Content:** Approval confirmation, login steps, features overview

### 3. Registration Rejected
- **Trigger:** When admin rejects registration
- **Purpose:** Inform user of rejection and next steps
- **Content:** Rejection reason, appeal process, contact info

## 🔒 Security Notes

- App passwords are more secure than regular passwords
- SMTP credentials are stored as environment variables
- Emails are sent from your Office 365 account
- All email content is logged for debugging

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Netlify function logs
3. Verify Office 365 settings
4. Test with different email addresses
5. Contact support if issues persist

## 🎯 Next Steps

After successful testing:

1. **Deploy to Production:** Ensure all tests pass before deploying
2. **Monitor Logs:** Keep an eye on email sending logs
3. **Test with Real Users:** Try the registration flow with real email addresses
4. **Set up Monitoring:** Consider setting up email delivery monitoring
5. **Backup Plan:** Have a fallback email service ready

---

**Happy Testing! 🚀**

