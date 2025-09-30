-- Add programming experience level column to attendees table
ALTER TABLE conference.attendees 
ADD COLUMN programming_experience_level VARCHAR(50);

-- Optional: Remove unused columns that were removed from the form
-- ALTER TABLE conference.attendees DROP COLUMN IF EXISTS emergency_contact_name;
-- ALTER TABLE conference.attendees DROP COLUMN IF EXISTS emergency_contact_phone;
-- ALTER TABLE conference.attendees DROP COLUMN IF EXISTS dietary_restrictions;
