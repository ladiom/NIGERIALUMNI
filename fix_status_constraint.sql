-- Fix pending_registrations status constraint to include 'rejected' and 'approved'
ALTER TABLE pending_registrations 
DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

ALTER TABLE pending_registrations 
ADD CONSTRAINT pending_registrations_status_check 
CHECK (status IN ('pending','sent','completed','approved','rejected'));

-- Update any existing completed records to approved
UPDATE pending_registrations 
SET status = 'approved' 
WHERE status = 'completed';
