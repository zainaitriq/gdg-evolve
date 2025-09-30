-- Add prerequisites column to events table
ALTER TABLE conference.events 
ADD COLUMN prerequisites TEXT[];

-- Update existing workshops with sample prerequisites
UPDATE conference.events 
SET prerequisites = ARRAY['Basic understanding of web development', 'Familiarity with HTML/CSS', 'Text editor installed']
WHERE name = 'Building Modern Web Apps with React';

UPDATE conference.events 
SET prerequisites = ARRAY['Basic programming knowledge', 'Understanding of databases', 'Node.js installed']
WHERE name = 'API Development with Node.js';

UPDATE conference.events 
SET prerequisites = ARRAY['Basic JavaScript knowledge', 'Understanding of web development', 'Code editor setup']
WHERE name = 'Introduction to TypeScript';

UPDATE conference.events 
SET prerequisites = ARRAY['Programming experience in any language', 'Basic understanding of software development', 'Docker installed (optional)']
WHERE name = 'DevOps Fundamentals';

UPDATE conference.events 
SET prerequisites = ARRAY['Basic programming knowledge', 'Understanding of data structures', 'Python installed']
WHERE name = 'Machine Learning Basics';

UPDATE conference.events 
SET prerequisites = ARRAY['Mobile development interest', 'Basic programming knowledge', 'Android Studio or Xcode installed']
WHERE name = 'Mobile App Development';
