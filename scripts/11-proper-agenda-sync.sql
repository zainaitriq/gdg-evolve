-- Creating proper sync between events and agenda_items tables with correct column mapping
-- Clear existing agenda items first
DELETE FROM conference.agenda_items;

-- Insert all active events into agenda_items with proper column mapping
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
    e.event_type as type,
    ROW_NUMBER() OVER (PARTITION BY e.date ORDER BY e.start_time) as order_index,
    e.is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM conference.events e
WHERE e.is_active = true
ORDER BY e.date, e.start_time;

-- Create a trigger function to automatically sync when events are created/updated
CREATE OR REPLACE FUNCTION conference.sync_event_to_agenda()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Delete existing agenda item for this event if it exists
        DELETE FROM conference.agenda_items 
        WHERE title = NEW.name AND event_date = NEW.date AND start_time = NEW.start_time;
        
        -- Insert new agenda item if event is active
        IF NEW.is_active = true THEN
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
            ) VALUES (
                NEW.name,
                NEW.description,
                NEW.date,
                NEW.start_time,
                NEW.end_time,
                NEW.location,
                NEW.event_type,
                (SELECT COALESCE(MAX(order_index), 0) + 1 
                 FROM conference.agenda_items 
                 WHERE event_date = NEW.date),
                NEW.is_active,
                NOW(),
                NOW()
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        DELETE FROM conference.agenda_items 
        WHERE title = OLD.name AND event_date = OLD.date AND start_time = OLD.start_time;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_event_to_agenda_trigger ON conference.events;

-- Create the trigger
CREATE TRIGGER sync_event_to_agenda_trigger
    AFTER INSERT OR UPDATE OR DELETE ON conference.events
    FOR EACH ROW
    EXECUTE FUNCTION conference.sync_event_to_agenda();

-- Verify the sync worked
SELECT 
    'Events synced to agenda_items' as status,
    COUNT(*) as total_agenda_items
FROM conference.agenda_items;

-- Show the synced agenda items
SELECT 
    title,
    event_date,
    start_time,
    end_time,
    location,
    type,
    order_index
FROM conference.agenda_items
ORDER BY event_date, start_time;
