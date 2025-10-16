# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one if you don't have one)
3. **Go to Settings > API**
4. **Copy the following values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Create Environment Variables File

Create a file named `.env` in your project root with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the values with your actual Supabase credentials.**

## Step 3: Update Database Schema

Run the updated schema in your Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase_schema.sql`
3. Run the SQL to update your database schema

## Step 4: Import the New Data

Once you have the `.env` file set up, run:

```bash
node import_spaco_data.js
```

This will import all 11,283+ alumni records from `SpacoRegistryTo_databse.txt`.

## Step 5: Verify the Import

Check your Supabase dashboard to see the imported data in the `alumni` table.

## Troubleshooting

- **"Invalid supabaseUrl" error**: Make sure your `.env` file has the correct URL format
- **"Invalid API key" error**: Make sure you're using the anon/public key, not the service role key
- **Import fails**: Check that the database schema has been updated first
