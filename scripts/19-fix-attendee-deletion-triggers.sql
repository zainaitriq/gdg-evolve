-- Create triggers to properly update current_registrations when attendees are deleted

-- Function to update current_registrations when RSVPs are deleted
CREATE OR REPLACE FUNCTION update_event_registrations()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_registrations count when RSVP is deleted
    IF TG_OP = 'DELETE' THEN
        UPDATE conference.events 
        SET current_registrations = GREATEST(0, current_registrations - 1)
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    
    -- Update current_registrations count when RSVP is inserted
    IF TG_OP = 'INSERT' THEN
        UPDATE conference.events 
        SET current_registrations = current_registrations + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for RSVP changes
DROP TRIGGER IF EXISTS rsvp_registration_trigger ON conference.rsvps;
CREATE TRIGGER rsvp_registration_trigger
    AFTER INSERT OR DELETE ON conference.rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_event_registrations();

-- Function to handle attendee deletion and cascade to RSVPs
CREATE OR REPLACE FUNCTION handle_attendee_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all RSVPs for this attendee (this will trigger the registration count update)
    DELETE FROM conference.rsvps WHERE attendee_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for attendee deletion
DROP TRIGGER IF EXISTS attendee_deletion_trigger ON conference.attendees;
CREATE TRIGGER attendee_deletion_trigger
    BEFORE DELETE ON conference.attendees
    FOR EACH ROW
    EXECUTE FUNCTION handle_attendee_deletion();

-- Fix any existing inconsistencies in current_registrations
UPDATE conference.events 
SET current_registrations = (
    SELECT COUNT(*) 
    FROM conference.rsvps 
    WHERE event_id = conference.events.id
);
