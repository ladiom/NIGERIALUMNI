-- SQL script to update adm_year column from admission_date
-- Run this in Supabase SQL Editor

-- First, let's check how many records need updating
SELECT COUNT(*) as records_to_update
FROM alumni 
WHERE admission_date IS NOT NULL 
AND adm_year IS NULL;

-- Update the adm_year column by extracting the year from admission_date
UPDATE alumni 
SET adm_year = EXTRACT(YEAR FROM admission_date)::INTEGER 
WHERE admission_date IS NOT NULL 
AND adm_year IS NULL;

-- Verify the update by checking a few sample records
SELECT id, admission_date, adm_year 
FROM alumni 
WHERE admission_date IS NOT NULL 
AND adm_year IS NOT NULL
LIMIT 10;

-- Count how many records now have adm_year populated
SELECT COUNT(*) as records_with_adm_year
FROM alumni 
WHERE adm_year IS NOT NULL;
