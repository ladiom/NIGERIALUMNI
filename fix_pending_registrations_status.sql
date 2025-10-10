-- Fix pending_registrations table to allow 'rejected' status
-- This addresses the issue where rejected registrations can't be updated due to CHECK constraint

-- First, drop the existing constraint
ALTER TABLE pending_registrations DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

-- Add the new constraint that includes 'rejected' status
ALTER TABLE pending_registrations ADD CONSTRAINT pending_registrations_status_check 
CHECK (status IN ('pending', 'sent', 'completed', 'rejected'));
