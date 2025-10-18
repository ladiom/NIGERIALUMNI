-- Update pending_registrations table to support update requests
-- Add update_data column to store the update information
ALTER TABLE pending_registrations 
ADD COLUMN IF NOT EXISTS update_data JSONB;

-- Update the status check constraint to include 'pending_update'
ALTER TABLE pending_registrations 
DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

ALTER TABLE pending_registrations 
ADD CONSTRAINT pending_registrations_status_check 
CHECK (status IN ('pending', 'sent', 'completed', 'pending_update'));

-- Add an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_pending_reg_status ON pending_registrations(status);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;
