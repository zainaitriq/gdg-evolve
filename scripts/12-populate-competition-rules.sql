-- Update competitions with comprehensive rules
UPDATE conference.events 
SET rules = ARRAY[
  'Teams of 2-4 members maximum',
  'Must use provided API endpoints',
  'Code must be original and created during the hackathon',
  'Final submission must include working demo',
  'All team members must be present during presentation',
  'Use of external libraries is allowed',
  'Submission deadline: 6 hours from start time'
]
WHERE name = 'AI Innovation Hackathon';

UPDATE conference.events 
SET rules = ARRAY[
  'Individual participation only',
  'Problems will be revealed at start time',
  'No external help or collaboration allowed',
  'Must solve at least 3 out of 5 problems to qualify',
  'Code must compile and run successfully',
  'Optimal solutions preferred over brute force',
  'Time limit: 2 hours'
]
WHERE name = 'Competitive Programming Challenge';

UPDATE conference.events 
SET rules = ARRAY[
  'Teams of 2-3 members',
  'Must present a complete business plan',
  'Prototype or MVP demonstration required',
  'Pitch presentation limited to 5 minutes',
  'Q&A session with judges for 3 minutes',
  'Focus on scalability and market potential',
  'All materials must be submitted digitally'
]
WHERE name = 'Startup Pitch Competition';

UPDATE conference.events 
SET rules = ARRAY[
  'Individual or team participation (max 4 members)',
  'Must use provided dataset',
  'Model accuracy will be primary judging criteria',
  'Code documentation and explanation required',
  'Jupyter notebook submission mandatory',
  'External datasets not allowed',
  'Final model must be reproducible'
]
WHERE name = 'Data Science Challenge';

UPDATE conference.events 
SET rules = ARRAY[
  'Teams of 2-5 members',
  'Must identify real cybersecurity vulnerabilities',
  'Ethical hacking principles must be followed',
  'Detailed report of findings required',
  'No actual system damage allowed',
  'Use only provided testing environments',
  'Solutions must include remediation steps'
]
WHERE name = 'Cybersecurity CTF';
