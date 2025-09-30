-- Create trigger to automatically sync events with agenda_items table
-- This ensures that when an event is created or updated, it reflects in the agenda

-- First, let's create a function to sync events to agenda_items
CREATE OR REPLACE FUNCTION sync_event_to_agenda()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Remove existing agenda item first, then insert new one to avoid conflicts
        DELETE FROM conference.agenda_items 
        WHERE title = NEW.name 
        AND event_date = NEW.date 
        AND start_time = NEW.start_time;
        
        -- Insert the corresponding agenda_item
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
            CASE 
                WHEN NEW.event_type = 'workshop' THEN 'workshop'
                WHEN NEW.event_type = 'competition' THEN 'competition'
                WHEN NEW.event_type = 'session' THEN 'session'
                ELSE 'session'
            END,
            -- Calculate order based on time
            EXTRACT(HOUR FROM NEW.start_time) * 60 + EXTRACT(MINUTE FROM NEW.start_time),
            NEW.is_active,
            NOW(),
            NOW()
        );
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        DELETE FROM conference.agenda_items 
        WHERE title = OLD.name 
        AND event_date = OLD.date 
        AND start_time = OLD.start_time;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_events_to_agenda ON conference.events;
CREATE TRIGGER sync_events_to_agenda
    AFTER INSERT OR UPDATE OR DELETE ON conference.events
    FOR EACH ROW
    EXECUTE FUNCTION sync_event_to_agenda();

-- Clear existing agenda items and sync all events fresh
DELETE FROM conference.agenda_items;

-- Sync existing events to agenda_items
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
    e.name,
    e.description,
    e.date,
    e.start_time,
    e.end_time,
    e.location,
    CASE 
        WHEN e.event_type = 'workshop' THEN 'workshop'
        WHEN e.event_type = 'competition' THEN 'competition'
        WHEN e.event_type = 'session' THEN 'session'
        ELSE 'session'
    END as type,
    EXTRACT(HOUR FROM e.start_time) * 60 + EXTRACT(MINUTE FROM e.start_time) as order_index,
    e.is_active,
    NOW(),
    NOW()
FROM conference.events e
WHERE e.is_active = true;

-- Update all existing events to ensure they are active and will appear in agenda
UPDATE conference.events 
SET is_active = true, updated_at = NOW()
WHERE is_active IS NULL OR is_active = false;
