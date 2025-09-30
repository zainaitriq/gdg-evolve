-- Clear existing agenda items first
DELETE FROM conference.agenda_items;

-- Insert events as agenda items with proper type mapping
INSERT INTO conference.agenda_items (
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    type,
    order_index,
    is_active,
    created_at,
    updated_at
)
SELECT 
    e.name as title,
    e.description,
    e.date as event_date,
    e.start_time,
    e.end_time,
    e.location,
    -- Map event types to valid agenda_items type values
    CASE 
        WHEN e.event_type = 'session' THEN 'session'
        WHEN e.event_type = 'workshop' THEN 'session'
        WHEN e.event_type = 'competition' THEN 'session'
        WHEN e.event_type = 'keynote' THEN 'session'
        ELSE 'session'
    END as type,
    -- Generate order_index based on date and time
    ROW_NUMBER() OVER (ORDER BY e.date, e.start_time) as order_index,
    COALESCE(e.is_active, true) as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM conference.events e
WHERE COALESCE(e.is_active, true) = true
ORDER BY e.date, e.start_time;

-- Create trigger function to sync events to agenda_items
CREATE OR REPLACE FUNCTION conference.sync_event_to_agenda()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Insert or update agenda item with proper type mapping
        INSERT INTO conference.agenda_items (
            title, description, event_date, start_time, end_time, 
            location, type, order_index, is_active, created_at, updated_at
        )
        VALUES (
            NEW.name,
            NEW.description,
            NEW.date,
            NEW.start_time,
            NEW.end_time,
            NEW.location,
            'session', -- Always use 'session' as safe default
            (SELECT COALESCE(MAX(order_index), 0) + 1 FROM conference.agenda_items),
            COALESCE(NEW.is_active, true),
            NOW(),
            NOW()
        )
        ON CONFLICT (title, event_date, start_time) 
        DO UPDATE SET
            description = EXCLUDED.description,
            end_time = EXCLUDED.end_time,
            location = EXCLUDED.location,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Delete corresponding agenda item
        DELETE FROM conference.agenda_items 
        WHERE title = OLD.name 
        AND event_date = OLD.date 
        AND start_time = OLD.start_time;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS sync_event_to_agenda_trigger ON conference.events;
CREATE TRIGGER sync_event_to_agenda_trigger
    AFTER INSERT OR UPDATE OR DELETE ON conference.events
    FOR EACH ROW EXECUTE FUNCTION conference.sync_event_to_agenda();

-- Verify the sync worked
SELECT 
    'Events synced to agenda_items' as status,
    COUNT(*) as total_agenda_items
FROM conference.agenda_items;

-- Show sample of synced data
SELECT 
    title,
    event_date,
    start_time,
    type,
    is_active
FROM conference.agenda_items
ORDER BY event_date, start_time
LIMIT 5;
