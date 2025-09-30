-- Update workshops with realistic prerequisites
UPDATE conference.events 
SET prerequisites = ARRAY['Basic HTML/CSS knowledge', 'Familiarity with JavaScript', 'Code editor (VS Code recommended)']
WHERE name = 'React Fundamentals Workshop' AND event_type = 'workshop';

UPDATE conference.events 
SET prerequisites = ARRAY['JavaScript ES6+ knowledge', 'Understanding of async/await', 'Node.js installed', 'Basic database concepts']
WHERE name = 'Node.js Backend Development' AND event_type = 'workshop';

UPDATE conference.events 
SET prerequisites = ARRAY['Python programming basics', 'Basic statistics knowledge', 'Jupyter Notebook installed', 'Linear algebra fundamentals']
WHERE name = 'Machine Learning with Python' AND event_type = 'workshop';

UPDATE conference.events 
SET prerequisites = ARRAY['Mobile development interest', 'Basic programming knowledge', 'Android Studio or Xcode installed']
WHERE name = 'Mobile App Development' AND event_type = 'workshop';

UPDATE conference.events 
SET prerequisites = ARRAY['Basic programming knowledge', 'Understanding of data structures', 'Git/GitHub familiarity']
WHERE name = 'Open Source Contribution' AND event_type = 'workshop';

UPDATE conference.events 
SET prerequisites = ARRAY['Web development basics', 'JavaScript knowledge', 'Understanding of APIs', 'Basic security awareness']
WHERE name = 'Web Security Fundamentals' AND event_type = 'workshop';

-- Update sessions with lighter prerequisites
UPDATE conference.events 
SET prerequisites = ARRAY['Interest in technology trends', 'Basic understanding of AI concepts']
WHERE event_type = 'session' AND name LIKE '%AI%';

UPDATE conference.events 
SET prerequisites = ARRAY['Curiosity about cloud computing', 'Basic web development knowledge']
WHERE event_type = 'session' AND name LIKE '%Cloud%';

UPDATE conference.events 
SET prerequisites = ARRAY['Interest in career development', 'Basic programming knowledge']
WHERE event_type = 'session' AND (name LIKE '%Career%' OR name LIKE '%Future%');

-- Update competitions with team-based prerequisites
UPDATE conference.events 
SET prerequisites = ARRAY['Team of 2-4 members', 'Problem-solving skills', 'Any programming language', 'Laptop with development environment']
WHERE event_type = 'competition';
