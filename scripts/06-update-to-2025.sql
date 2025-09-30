-- Update all events to September 13, 2025
UPDATE conference.events SET date = '2025-09-13' WHERE date = '2024-03-15';

-- Update any remaining 2024 references in event descriptions
UPDATE conference.events SET 
  description = REPLACE(description, '2024', '2025')
WHERE description LIKE '%2024%';

-- Update QR codes to use 2025 prefix for any existing RSVPs
UPDATE conference.rsvps SET 
  qr_code = REPLACE(qr_code, 'EVOLVE2024', 'EVOLVE2025')
WHERE qr_code LIKE 'EVOLVE2024%';
