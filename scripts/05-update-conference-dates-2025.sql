-- Update all events to September 13, 2025
UPDATE conference.events SET date = '2025-09-13' WHERE date = '2024-03-15';

-- Update event descriptions and details for 2025
UPDATE conference.events SET 
  description = 'Join us for an inspiring keynote about the future of artificial intelligence and its impact on society in 2025.',
  location = 'Al Hussein Technical University - Main Auditorium'
WHERE name = 'Opening Keynote: The Future of AI';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Room A'
WHERE name = 'Web Development with Next.js';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Room B'
WHERE name = 'Mobile App Development';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Lab 1'
WHERE name = 'AI/ML Competition';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Lab 2'
WHERE name = 'Hackathon Finals';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Room C'
WHERE name = 'Cloud Computing Essentials';

UPDATE conference.events SET 
  location = 'Al Hussein Technical University - Main Auditorium'
WHERE name = 'Closing Ceremony';
