# Office 365 SMTP Setup for Nigeria Alumni Network

This guide will help you set up Office 365 SMTP for sending email notifications.

## Prerequisites

- Office 365 account with email access
- Netlify account with environment variables access

## Step 1: Enable App Passwords in Office 365

1. **Sign in to your Office 365 account**
2. **Go to Security settings** (usually at https://account.microsoft.com/security)
3. **Enable two-factor authentication** (if not already enabled)
4. **Create an App Password:**
   - Go to "Security" → "Advanced security options"
   - Click "Create a new app password"
   - Name it "Nigeria Alumni Network SMTP"
   - Copy the generated password (you'll need this)

## Step 2: Configure Netlify Environment Variables

1. **Go to your Netlify dashboard**
2. **Navigate to Site settings → Environment variables**
3. **Add these variables:**

```
OFFICE365_EMAIL=your-email@yourdomain.com
OFFICE365_PASSWORD=your-app-password-here
```

**Important Notes:**
- Use your full Office 365 email address
- Use the app password, NOT your regular password
- Make sure the variables are set for "Production" environment

## Step 3: Test the Setup

1. **Deploy your site** (the Netlify function will be created automatically)
2. **Test registration** - try registering a new alumni
3. **Check the console** for email sending logs
4. **Check your email** to see if the notification was sent

## Step 4: Verify SMTP Settings

The system uses these Office 365 SMTP settings:
- **Host:** smtp.office365.com
- **Port:** 587
- **Security:** STARTTLS
- **Authentication:** Username/Password (app password)

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an app password, not your regular password
   - Verify two-factor authentication is enabled

2. **"Connection timeout"**
   - Check if your Office 365 account allows SMTP
   - Verify the email address is correct

3. **"Function not found"**
   - Make sure the `netlify/functions/send-email.js` file is deployed
   - Check Netlify function logs

### Testing the Function:

You can test the email function directly by visiting:
```
https://your-site.netlify.app/.netlify/functions/send-email
```

## Email Templates

The system includes these email templates:
- **Pending Registration** - Sent when user registers
- **Approval Confirmation** - Sent when admin approves
- **Rejection Notice** - Sent when admin rejects

## Security Notes

- App passwords are more secure than regular passwords
- The SMTP credentials are stored as environment variables
- Emails are sent from your Office 365 account
- All email content is logged for debugging

## Alternative: Use Different Email Service

If Office 365 SMTP doesn't work, you can also use:
- **Resend** (resend.com) - Simple API
- **SendGrid** (sendgrid.com) - Professional service
- **Mailgun** (mailgun.com) - Developer-friendly

Just update the `netlify/functions/send-email.js` file with the appropriate service.
