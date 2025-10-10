# Deployment Guide - Nigeria Alumni Network

## 🚀 Quick Deployment Steps

### 1. Deploy to Netlify

You have several options to deploy:

#### Option A: Deploy via Netlify CLI (Recommended)
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
netlify deploy --prod
```

#### Option B: Deploy via Git
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Netlify will automatically deploy when you push changes

#### Option C: Deploy via Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder to deploy

### 2. Configure Environment Variables

After deployment, set up your Office 365 credentials:

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   - `OFFICE365_EMAIL` = your-email@yourdomain.com
   - `OFFICE365_PASSWORD` = your-app-password

### 3. Test the Deployment

Once deployed, test your email function:

```bash
# Test the function
npm run test-email

# Or open in browser
# Navigate to: https://your-site.netlify.app/test_email_browser.html
```

## 🔧 Current Status

✅ **Frontend**: Built and ready to deploy
✅ **Netlify Function**: Created and configured
✅ **Email Templates**: Ready to use
✅ **Test Scripts**: Ready to run

❌ **Deployment**: Needs to be deployed to Netlify
❌ **Environment Variables**: Need to be set in Netlify dashboard

## 📧 Email Function URL

Once deployed, your email function will be available at:
```
https://nigeriaalumninetwork.netlify.app/.netlify/functions/send-email
```

## 🧪 Testing Without Deployment

If you want to test the email functionality before deploying, you can:

1. **Test Email Templates**: The templates work independently
2. **Test in Browser**: Open `test_email_browser.html` locally
3. **Mock Function**: The function has fallback mode when credentials aren't set

## 🚨 Important Notes

1. **Office 365 Setup**: You need to set up an Office 365 app password
2. **CORS**: The function includes CORS headers for browser testing
3. **Fallback Mode**: The function will work even without Office 365 credentials (returns success but doesn't send real emails)

## 📞 Next Steps

1. Deploy to Netlify using one of the methods above
2. Set up Office 365 credentials in Netlify dashboard
3. Test the email functionality
4. Verify emails are being sent successfully

---

**Ready to deploy! 🚀**




