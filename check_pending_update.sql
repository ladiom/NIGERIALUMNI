-- Check if pending update requests exist in the database
SELECT 
    id,
    alumni_id,
    email,
    status,
    created_at,
    update_data
FROM pending_registrations 
WHERE status IN ('pending', 'pending_update')
ORDER BY created_at DESC;

-- Check total count
SELECT 
    status,
    COUNT(*) as count
FROM pending_registrations 
GROUP BY status
ORDER BY status;
