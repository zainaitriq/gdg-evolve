-- Adding comprehensive mock agenda data for Evolve Conference 2025

-- Insert mock speakers first
INSERT INTO conference.speakers (name, title, company, bio, image_url, linkedin_url, twitter_url) VALUES
('Sarah Johnson', 'Senior Software Engineer', 'Google', 'Sarah is a passionate developer with 8+ years of experience in full-stack development and cloud architecture.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/sarahjohnson', 'https://twitter.com/sarahjohnson'),
('Ahmed Al-Rashid', 'Tech Lead', 'Microsoft', 'Ahmed specializes in AI and machine learning, leading innovative projects in natural language processing.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/ahmedalrashid', 'https://twitter.com/ahmedalrashid'),
('Maria Garcia', 'Product Manager', 'Meta', 'Maria has extensive experience in product strategy and user experience design for social platforms.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/mariagarcia', 'https://twitter.com/mariagarcia'),
('David Chen', 'DevOps Engineer', 'Amazon', 'David is an expert in cloud infrastructure, containerization, and CI/CD pipelines.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/davidchen', 'https://twitter.com/davidchen'),
('Fatima Al-Zahra', 'UX Designer', 'Apple', 'Fatima creates intuitive and accessible user experiences for mobile and web applications.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/fatimaalzahra', 'https://twitter.com/fatimaalzahra')
ON CONFLICT (id) DO NOTHING;

-- Insert comprehensive mock events for the agenda
INSERT INTO conference.events (
    name, description, event_type, date, start_time, end_time, location, 
    capacity, current_registrations, is_active, requires_team, min_team_size, max_team_size,
    rules, prerequisites
) VALUES
-- Opening Ceremony
('Opening Ceremony', 'Welcome to Evolve Conference 2025! Join us for an inspiring opening ceremony featuring keynote speakers and conference overview.', 'session', '2025-09-13', '09:00:00', '10:00:00', 'Main Auditorium', 500, 0, true, false, 1, 1, '{}', '{}'),

-- Morning Sessions
('The Future of AI in Software Development', 'Explore how artificial intelligence is revolutionizing the way we write, test, and deploy code. Learn about the latest AI tools and their practical applications.', 'session', '2025-09-13', '10:30:00', '11:30:00', 'Main Auditorium', 300, 0, true, false, 1, 1, '{}', '{}'),

('Building Scalable Microservices', 'Deep dive into microservices architecture, best practices for service design, and strategies for managing distributed systems at scale.', 'session', '2025-09-13', '11:45:00', '12:45:00', 'Conference Room A', 150, 0, true, false, 1, 1, '{}', '{}'),

-- Workshops
('Mobile App Development with Flutter', 'Create your first mobile app using Flutter. Learn the fundamentals of cross-platform mobile development in this practical workshop.', 'workshop', '2025-09-13', '14:00:00', '16:00:00', 'Workshop Room 1', 25, 0, true, false, 1, 1, '{"Bring your laptop", "Install Flutter SDK beforehand"}', '{"Basic programming knowledge", "Laptop with development environment"}'),

('Cloud Infrastructure with AWS', 'Hands-on workshop covering AWS services, infrastructure as code, and deployment strategies for modern applications.', 'workshop', '2025-09-13', '14:00:00', '16:00:00', 'Workshop Room 2', 30, 0, true, false, 1, 1, '{"AWS account required", "Bring your laptop"}', '{"Basic cloud knowledge", "AWS account"}'),

('React and Next.js Masterclass', 'Build a complete web application using React and Next.js. This hands-on workshop covers modern development practices and deployment strategies.', 'workshop', '2025-09-13', '16:30:00', '18:30:00', 'Workshop Room 1', 25, 0, true, false, 1, 1, '{"Bring your laptop", "Node.js installed"}', '{"JavaScript knowledge", "Basic React experience"}'),

-- Competitions
('Coding Competition: Algorithm Challenge', 'Test your programming skills in our competitive programming contest. Solve algorithmic problems and compete for the top spot.', 'competition', '2025-09-13', '10:30:00', '12:30:00', 'Computer Lab', 50, 0, true, true, 1, 3, '{"Individual or team participation", "Any programming language allowed", "Internet access provided"}', '{"Programming experience", "Problem-solving skills"}'),

('Hackathon: Build for Good', 'Create innovative solutions for social impact in this intensive hackathon. Teams will develop applications addressing real-world challenges.', 'competition', '2025-09-13', '19:00:00', '23:00:00', 'Innovation Lab', 60, 0, true, true, 2, 4, '{"Teams of 2-4 members", "Present final solution", "Focus on social impact"}', '{"Development experience", "Team collaboration skills"}'),

('UI/UX Design Challenge', 'Design the perfect user experience for a mobile application. Teams will create wireframes, prototypes, and present their design solutions.', 'competition', '2025-09-13', '16:30:00', '18:30:00', 'Design Studio', 40, 0, true, true, 2, 3, '{"Teams of 2-3 members", "Design tools provided", "Present to judges"}', '{"Design thinking", "Prototyping experience"}'),

-- Afternoon Sessions
('DevOps Best Practices', 'Learn modern DevOps practices including CI/CD pipelines, containerization with Docker, and infrastructure automation.', 'session', '2025-09-13', '16:30:00', '17:30:00', 'Conference Room B', 200, 0, true, false, 1, 1, '{}', '{}'),

('Product Management in Tech', 'Insights into product strategy, user research, and agile development from experienced product managers in leading tech companies.', 'session', '2025-09-13', '17:45:00', '18:45:00', 'Conference Room A', 150, 0, true, false, 1, 1, '{}', '{}'),

-- Closing
('Closing Ceremony & Awards', 'Join us for the closing ceremony where we will announce competition winners and celebrate the achievements of all participants.', 'session', '2025-09-13', '19:00:00', '20:00:00', 'Main Auditorium', 500, 0, true, false, 1, 1, '{}', '{}')

ON CONFLICT (id) DO NOTHING;

-- Link speakers to events
INSERT INTO conference.event_speakers (event_id, speaker_id)
SELECT e.id, s.id FROM conference.events e, conference.speakers s
WHERE (e.name = 'The Future of AI in Software Development' AND s.name = 'Ahmed Al-Rashid')
   OR (e.name = 'Building Scalable Microservices' AND s.name = 'David Chen')
   OR (e.name = 'Mobile App Development with Flutter' AND s.name = 'Sarah Johnson')
   OR (e.name = 'Cloud Infrastructure with AWS' AND s.name = 'David Chen')
   OR (e.name = 'React and Next.js Masterclass' AND s.name = 'Sarah Johnson')
   OR (e.name = 'Product Management in Tech' AND s.name = 'Maria Garcia')
   OR (e.name = 'UI/UX Design Challenge' AND s.name = 'Fatima Al-Zahra')
   OR (e.name = 'Opening Ceremony' AND s.name IN ('Sarah Johnson', 'Ahmed Al-Rashid'))
   OR (e.name = 'Closing Ceremony & Awards' AND s.name IN ('Maria Garcia', 'David Chen'))
ON CONFLICT DO NOTHING;

-- Add agenda breaks
INSERT INTO conference.agenda_breaks (name, description, date, start_time, end_time, location) VALUES
('Coffee Break', 'Networking break with refreshments', '2025-09-13', '10:00:00', '10:30:00', 'Main Lobby'),
('Lunch Break', 'Lunch and networking opportunity', '2025-09-13', '12:45:00', '14:00:00', 'Cafeteria'),
('Afternoon Break', 'Coffee and snacks', '2025-09-13', '16:00:00', '16:30:00', 'Main Lobby')
ON CONFLICT (id) DO NOTHING;

-- Add specific agenda items for better organization
INSERT INTO conference.agenda_items (title, description, type, event_date, start_time, end_time, location, order_index, is_active) VALUES
('Registration & Check-in', 'Conference registration and welcome package distribution', 'logistics', '2025-09-13', '08:00:00', '09:00:00', 'Main Entrance', 1, true),
('Welcome Reception', 'Evening networking reception with light refreshments', 'networking', '2025-09-13', '20:00:00', '21:30:00', 'Main Lobby', 99, true)
ON CONFLICT (id) DO NOTHING;
