-- Insert sample events
INSERT INTO conference.events (name, description, date, start_time, end_time, location, capacity, event_type) VALUES
('Opening Keynote: The Future of AI', 'Join us for an inspiring keynote about the future of artificial intelligence and its impact on society.', '2024-03-15', '09:00', '10:00', 'Main Auditorium', 300, 'session'),
('Web Development with Next.js', 'Learn modern web development techniques using Next.js and React.', '2024-03-15', '10:30', '12:00', 'Room A', 50, 'workshop'),
('Mobile App Development', 'Build your first mobile app using Flutter and Firebase.', '2024-03-15', '10:30', '12:00', 'Room B', 40, 'workshop'),
('AI/ML Competition', 'Compete in our machine learning challenge and win amazing prizes!', '2024-03-15', '13:00', '17:00', 'Lab 1', 30, 'competition'),
('Hackathon Finals', 'Present your innovative solutions in our 24-hour hackathon finale.', '2024-03-15', '13:00', '17:00', 'Lab 2', 25, 'competition'),
('Cloud Computing Essentials', 'Master the fundamentals of cloud computing with Google Cloud Platform.', '2024-03-15', '14:00', '15:30', 'Room C', 60, 'workshop'),
('Closing Ceremony', 'Celebrate achievements and network with fellow developers.', '2024-03-15', '17:30', '18:30', 'Main Auditorium', 300, 'session');

-- Insert sample speakers
INSERT INTO conference.speakers (name, title, company, bio, image_url) VALUES
('Dr. Sarah Johnson', 'AI Research Director', 'Google DeepMind', 'Leading researcher in artificial intelligence with 15+ years of experience in machine learning and neural networks.', '/placeholder.svg?height=300&width=300'),
('Ahmed Al-Rashid', 'Senior Software Engineer', 'Meta', 'Full-stack developer specializing in React, Next.js, and scalable web applications.', '/placeholder.svg?height=300&width=300'),
('Maria Rodriguez', 'Mobile Development Lead', 'Spotify', 'Expert in Flutter and React Native with a passion for creating beautiful user experiences.', '/placeholder.svg?height=300&width=300'),
('David Chen', 'Cloud Solutions Architect', 'Google Cloud', 'Helping organizations migrate to the cloud and build scalable, secure applications.', '/placeholder.svg?height=300&width=300');

-- Link speakers to events
INSERT INTO conference.event_speakers (event_id, speaker_id) VALUES
(1, 1), -- Dr. Sarah Johnson for Opening Keynote
(2, 2), -- Ahmed Al-Rashid for Next.js Workshop
(3, 3), -- Maria Rodriguez for Mobile App Workshop
(6, 4); -- David Chen for Cloud Computing Workshop

-- Insert sample sponsors
INSERT INTO conference.sponsors (name, logo_url, website_url, tier, description) VALUES
('Google', '/placeholder.svg?height=100&width=200', 'https://google.com', 'platinum', 'Leading technology company and main sponsor of GDG events.'),
('Microsoft', '/placeholder.svg?height=100&width=200', 'https://microsoft.com', 'gold', 'Cloud computing and software development solutions.'),
('GitHub', '/placeholder.svg?height=100&width=200', 'https://github.com', 'silver', 'The world''s leading software development platform.'),
('Vercel', '/placeholder.svg?height=100&width=200', 'https://vercel.com', 'bronze', 'The platform for frontend developers.');
