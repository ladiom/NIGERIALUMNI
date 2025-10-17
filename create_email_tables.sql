-- Create email-related tables for Nigeria Alumni Platform
-- Run this in Supabase SQL Editor

-- Create email_outbox table
CREATE TABLE IF NOT EXISTS email_outbox (
  id BIGSERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | sent | failed
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON email_outbox(status);

-- Create pending_registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
  id BIGSERIAL PRIMARY KEY,
  alumni_id VARCHAR(20) REFERENCES alumni(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (alumni_id, email)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pending_reg_alumni_id ON pending_registrations(alumni_id);

-- Verify tables were created
SELECT 'email_outbox' as table_name, COUNT(*) as record_count FROM email_outbox
UNION ALL
SELECT 'pending_registrations' as table_name, COUNT(*) as record_count FROM pending_registrations;
