-- Add rules and prerequisites columns to events table for competitions
ALTER TABLE conference.events 
ADD COLUMN IF NOT EXISTS rules TEXT[],
ADD COLUMN IF NOT EXISTS prerequisites TEXT[];

-- Update existing competitions with rules and prerequisites
UPDATE conference.events 
SET 
  rules = ARRAY[
    'Teams must consist of 2-4 participants',
    'All team members must be registered for the conference',
    'Use of external libraries and frameworks is allowed',
    'Projects must be original work created during the competition',
    'Final submission must include source code and demo',
    'Judging criteria: Innovation (30%), Technical Implementation (30%), Presentation (25%), Impact (15%)'
  ],
  prerequisites = ARRAY[
    'Basic programming knowledge in any language',
    'Laptop with development environment setup',
    'GitHub account for code submission'
  ]
WHERE name = 'AI Innovation Challenge' AND event_type = 'competition';

UPDATE conference.events 
SET 
  rules = ARRAY[
    'Individual or team participation (max 2 members)',
    'Problems will be released at competition start',
    'No internet access during competition except for documentation',
    'Solutions must be submitted within time limit',
    'Code must compile and run successfully',
    'Ranking based on number of problems solved and time taken'
  ],
  prerequisites = ARRAY[
    'Strong knowledge of algorithms and data structures',
    'Proficiency in C++, Java, or Python',
    'Experience with competitive programming platforms'
  ]
WHERE name = 'Coding Marathon' AND event_type = 'competition';

UPDATE conference.events 
SET 
  rules = ARRAY[
    'Teams of 3-5 members required',
    'Business plan must address a real-world problem',
    'Presentation time limit: 5 minutes + 2 minutes Q&A',
    'Use of market research and financial projections encouraged',
    'Prototype or MVP demonstration preferred',
    'Judging criteria: Market Opportunity (25%), Solution Viability (25%), Business Model (25%), Presentation (25%)'
  ],
  prerequisites = ARRAY[
    'Basic understanding of business concepts',
    'Team formation skills',
    'Presentation software (PowerPoint, Canva, etc.)'
  ]
WHERE name = 'Startup Pitch Competition' AND event_type = 'competition';

UPDATE conference.events 
SET 
  rules = ARRAY[
    'Individual participation only',
    'Design brief will be provided at start',
    'Use any design tools (Figma, Adobe XD, Sketch, etc.)',
    'Submit final design with brief explanation',
    'Focus on user experience and visual appeal',
    'Judging criteria: Creativity (30%), Usability (30%), Visual Design (25%), Innovation (15%)'
  ],
  prerequisites = ARRAY[
    'Experience with UI/UX design tools',
    'Understanding of design principles',
    'Portfolio of previous design work (recommended)'
  ]
WHERE name = 'UI/UX Design Challenge' AND event_type = 'competition';
