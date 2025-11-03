# Supabase Setup Guide for ALUMNAIRA Platform

This guide will help you set up and configure Supabase for the ALUMNAIRA Platform.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A new Supabase project

## Setup Instructions

### 1. Configure Environment Variables

1. Create a `.env` file in the root of your project by copying the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase project credentials:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

   You can find these credentials in your Supabase project dashboard under **Settings > API**.

### 2. Create Database Tables

1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Copy and paste the SQL from `supabase_schema.sql` into the editor
4. Click **Run** to create all the necessary tables and sample data

### 3. Enable Row Level Security (RLS)

For security best practices, it's recommended to enable Row Level Security on your tables:

1. In the Supabase dashboard, go to **Authentication** and set up your authentication providers
2. Navigate to **Database > Tables**
3. For each table, click on the **RLS** toggle to enable Row Level Security
4. Create appropriate policies to control access to the data

### 4. Understanding the Database Schema

The database consists of the following tables:

- **schools**: Contains information about educational institutions
- **alumni**: Stores alumni profiles and their information
- **alumni_connections**: Manages connections between alumni
- **events**: Contains information about upcoming events
- **event_registrations**: Tracks alumni registrations for events
- **news**: Stores school news and announcements

### 5. Testing the Integration

To verify that the Supabase integration is working correctly:

1. Start the development server:
   ```bash
  npm run dev
  ```

2. Register a new alumni account through the registration page

3. Check the Supabase dashboard to confirm that the data has been saved in the `alumni` and `schools` tables

4. Try searching for schools or alumni through the search page to ensure the queries are working

## Additional Notes

- The current implementation uses simplified authentication. In a production environment, you should implement proper user authentication using Supabase Auth
- The `supabaseClient.js` file is configured to use environment variables, which helps keep your credentials secure
- Always keep your `.env` file out of version control by ensuring it's listed in `.gitignore`

### 6. Create the First Admin (Admin API)

If email sign-ups are rate-limited or you prefer a CLI, use the Admin API script:

1. Retrieve your `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Settings → API.
2. In a terminal, set the env var and run:
   - PowerShell (Windows):
     ```powershell
     $env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"
     npm run create-admin -- --email you@example.com --password "StrongPass123!"
     ```
   - Bash:
     ```bash
     SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" npm run create-admin -- --email you@example.com --password "StrongPass123!"
     ```
3. The script creates the auth user (confirmed) and upserts `public.users` with `roles=['admin']`.
4. Sign in with that email/password and visit `/admin`.

## Troubleshooting

- If you encounter CORS issues, make sure to configure your Supabase project's allowed origins under **Settings > API**
- If database queries fail, check the browser console for error messages and verify your environment variables are correctly set
- For more information, refer to the [Supabase Documentation](https://supabase.com/docs)