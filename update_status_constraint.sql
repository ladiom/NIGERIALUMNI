-- Update pending_registrations status constraint to include 'approved'
ALTER TABLE pending_registrations 
DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

ALTER TABLE pending_registrations 
ADD CONSTRAINT pending_registrations_status_check 
CHECK (status IN ('pending','sent','completed','approved'));

-- Update the existing completed record to approved
UPDATE pending_registrations 
SET status = 'approved' 
WHERE status = 'completed';
