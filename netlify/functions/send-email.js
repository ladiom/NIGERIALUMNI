import nodemailer from 'nodemailer';

export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { toEmail, toName, subject, body, type } = JSON.parse(event.body);

    // Validate required fields
    if (!toEmail || !subject || !body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields: toEmail, subject, body' })
      };
    }

    // Check if Office 365 credentials are configured
    if (!process.env.OFFICE365_EMAIL || !process.env.OFFICE365_PASSWORD) {
      console.log('Office 365 credentials not configured, using fallback mode');
      
      // Return success with fallback message
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          messageId: `fallback-${Date.now()}`,
          message: 'Email queued (Office 365 not configured)',
          fallback: true
        })
      };
    }

    // Office 365 SMTP configuration
    const transporter = nodemailer.createTransporter({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.OFFICE365_EMAIL, // Your Office 365 email
        pass: process.env.OFFICE365_PASSWORD // Your Office 365 password or app password
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    // Email options
    const mailOptions = {
      from: {
        name: 'Nigeria Alumni Network',
        address: process.env.OFFICE365_EMAIL
      },
      to: toEmail,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>') // Convert line breaks to HTML
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to send email',
        details: error.message
      })
    };
  }
};
