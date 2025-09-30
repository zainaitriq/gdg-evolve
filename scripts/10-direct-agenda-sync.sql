-- Creating direct SQL script to sync events to agenda_items without environment variable dependencies

-- Clear existing agenda items to start fresh
DELETE FROM conference.agenda_items;

-- Removed speaker_name column and fixed column references to match actual schema
-- Insert all active events as agenda items
INSERT INTO conference.agenda_items (
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    type,
    is_active,
    created_at,
    updated_at,
    order_index
)
SELECT 
    e.name as title,
    e.description,
    e.date as event_date,
    e.start_time,
    e.end_time,
    e.location,
    CASE 
        WHEN e.event_type = 'workshop' THEN 'workshop'
        WHEN e.event_type = 'competition' THEN 'competition'
        WHEN e.event_type = 'session' THEN 'session'
        ELSE 'session'
    END as type,
    e.is_active,
    NOW() as created_at,
    NOW() as updated_at,
    ROW_NUMBER() OVER (ORDER BY e.date, e.start_time) as order_index
FROM conference.events e
WHERE e.is_active = true
ORDER BY e.date, e.start_time;

-- Verify the sync worked
SELECT COUNT(*) as synced_agenda_items FROM conference.agenda_items;
SELECT COUNT(*) as total_active_events FROM conference.events WHERE is_active = true;
