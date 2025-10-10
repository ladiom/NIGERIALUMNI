-- Fix email_outbox table schema
-- Add missing columns for the email notification system

-- First, check if the table exists and what columns it has
-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS email_outbox (
    id BIGSERIAL PRIMARY KEY,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    email_type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add email_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_outbox' AND column_name = 'email_type') THEN
        ALTER TABLE email_outbox ADD COLUMN email_type TEXT DEFAULT 'general';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_outbox' AND column_name = 'status') THEN
        ALTER TABLE email_outbox ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add sent_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_outbox' AND column_name = 'sent_at') THEN
        ALTER TABLE email_outbox ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add error_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'email_outbox' AND column_name = 'error_message') THEN
        ALTER TABLE email_outbox ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- Enable RLS for email_outbox
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_outbox
-- Allow admins to manage all emails
CREATE POLICY "Admins can manage email_outbox" 
ON email_outbox FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

-- Allow authenticated users to insert emails
CREATE POLICY "Authenticated users can insert emails" 
ON email_outbox FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow public to insert emails (for anonymous registrations)
CREATE POLICY "Public can insert emails" 
ON email_outbox FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to read emails
CREATE POLICY "Authenticated users can read emails" 
ON email_outbox FOR SELECT 
TO authenticated 
USING (true);
