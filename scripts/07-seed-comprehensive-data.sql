-- Adding comprehensive seed data for speakers, events, and relationships
-- Clear existing data
DELETE FROM conference.rsvps;
DELETE FROM conference.event_speakers;
DELETE FROM conference.events;
DELETE FROM conference.speakers;
DELETE FROM conference.sponsors;

-- Insert Speakers
INSERT INTO conference.speakers (name, title, company, bio, image_url, linkedin_url, twitter_url) VALUES
('Dr. Sarah Johnson', 'Senior AI Research Scientist', 'Google DeepMind', 'Dr. Sarah Johnson is a leading researcher in artificial intelligence and machine learning, with over 10 years of experience at Google DeepMind. She has published numerous papers on neural networks and deep learning applications.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/sarahjohnson', 'https://twitter.com/sarahjohnsonai'),
('Ahmed Al-Rashid', 'Full Stack Developer & Tech Lead', 'Microsoft', 'Ahmed is a passionate full-stack developer and tech lead at Microsoft with expertise in cloud computing, web development, and DevOps. He has been building scalable applications for over 8 years.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/ahmedalrashid', 'https://twitter.com/ahmedalrashid'),
('Maria Rodriguez', 'Mobile App Development Expert', 'Meta', 'Maria is a senior mobile developer at Meta, specializing in React Native and Flutter. She has built apps used by millions of users and is passionate about mobile UX design.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/mariarodriguez', 'https://twitter.com/mariarodriguezdev'),
('Dr. Omar Hassan', 'Cybersecurity Specialist', 'IBM Security', 'Dr. Omar Hassan is a cybersecurity expert with a PhD in Computer Security. He leads security research at IBM and has helped organizations protect against advanced cyber threats.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/omarhassan', 'https://twitter.com/omarhassan_sec'),
('Lisa Chen', 'Cloud Architecture Consultant', 'AWS', 'Lisa is a cloud solutions architect at AWS with expertise in designing scalable, secure cloud infrastructures. She helps enterprises migrate to the cloud and optimize their operations.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/lisachen', 'https://twitter.com/lisachen_cloud'),
('Khaled Mahmoud', 'Data Science Manager', 'Netflix', 'Khaled leads the data science team at Netflix, focusing on recommendation algorithms and user behavior analysis. He has a strong background in machine learning and big data analytics.', '/placeholder.svg?height=300&width=300', 'https://linkedin.com/in/khaledmahmoud', 'https://twitter.com/khaledmahmoud_ds');

-- Insert Events (Sessions)
INSERT INTO conference.events (name, description, event_type, date, start_time, end_time, location, capacity, current_registrations, is_active) VALUES
-- Opening & Keynotes
('Opening Ceremony', 'Welcome to Evolve Conference 2025! Join us for an inspiring opening ceremony featuring keynote speakers and conference overview.', 'session', '2025-09-13', '09:00:00', '09:30:00', 'Main Auditorium', 500, 0, true),
('Keynote: The Future of AI in Everyday Life', 'Dr. Sarah Johnson explores how artificial intelligence will transform our daily experiences and the ethical considerations we must address.', 'session', '2025-09-13', '09:30:00', '10:30:00', 'Main Auditorium', 500, 0, true),

-- Morning Sessions
('Building Scalable Web Applications', 'Learn best practices for building web applications that can handle millions of users. Ahmed will share insights from his experience at Microsoft.', 'session', '2025-09-13', '11:00:00', '11:45:00', 'Room A', 150, 0, true),
('Mobile Development Trends 2025', 'Discover the latest trends in mobile development, including new frameworks, design patterns, and performance optimization techniques.', 'session', '2025-09-13', '11:00:00', '11:45:00', 'Room B', 120, 0, true),
('Cybersecurity in the Modern Era', 'Dr. Omar Hassan discusses current cybersecurity threats and how organizations can protect themselves against advanced attacks.', 'session', '2025-09-13', '12:00:00', '12:45:00', 'Room A', 150, 0, true),

-- Afternoon Sessions
('Cloud Architecture Best Practices', 'Lisa Chen shares proven strategies for designing robust, scalable cloud infrastructures that grow with your business.', 'session', '2025-09-13', '14:00:00', '14:45:00', 'Room A', 150, 0, true),
('Data Science for Business Impact', 'Learn how to apply data science techniques to solve real business problems and drive decision-making.', 'session', '2025-09-13', '14:00:00', '14:45:00', 'Room B', 120, 0, true),
('Panel: Tech Industry Career Paths', 'Join our expert panel as they discuss different career paths in technology and share advice for aspiring developers.', 'session', '2025-09-13', '15:00:00', '16:00:00', 'Main Auditorium', 500, 0, true),

-- Workshops
('Hands-on: React & Next.js Development', 'Build a complete web application using React and Next.js. This hands-on workshop covers modern development practices and deployment strategies.', 'workshop', '2025-09-13', '10:00:00', '12:00:00', 'Workshop Room 1', 30, 0, true),
('Mobile App Development with Flutter', 'Create your first mobile app using Flutter. Learn the fundamentals of cross-platform mobile development in this practical workshop.', 'workshop', '2025-09-13', '10:00:00', '12:00:00', 'Workshop Room 2', 25, 0, true),
('AI/ML Workshop: Building Your First Model', 'Get hands-on experience with machine learning by building and training your first AI model using Python and popular ML libraries.', 'workshop', '2025-09-13', '13:00:00', '15:00:00', 'Workshop Room 1', 30, 0, true),
('Cybersecurity Lab: Ethical Hacking', 'Learn ethical hacking techniques and how to identify vulnerabilities in web applications. Hands-on security testing workshop.', 'workshop', '2025-09-13', '13:00:00', '15:00:00', 'Workshop Room 2', 20, 0, true),
('Cloud Deployment Workshop', 'Deploy applications to the cloud using AWS, Azure, and Google Cloud Platform. Learn containerization with Docker and Kubernetes.', 'workshop', '2025-09-13', '15:30:00', '17:30:00', 'Workshop Room 1', 25, 0, true),

-- Competitions
('Hackathon: Innovation Challenge', 'Join our 6-hour hackathon and build innovative solutions to real-world problems. Teams of 2-4 participants will compete for amazing prizes.', 'competition', '2025-09-13', '10:00:00', '16:00:00', 'Innovation Lab', 80, 0, true),
('Coding Competition: Algorithm Challenge', 'Test your programming skills in our competitive programming contest. Solve algorithmic problems and compete for the top spot.', 'competition', '2025-09-13', '11:00:00', '13:00:00', 'Computer Lab', 50, 0, true),
('UI/UX Design Challenge', 'Design the user interface and experience for a mobile app. Showcase your creativity and design thinking skills.', 'competition', '2025-09-13', '14:00:00', '16:00:00', 'Design Studio', 40, 0, true),

-- Closing
('Closing Ceremony & Awards', 'Join us for the closing ceremony where we will announce competition winners and wrap up an amazing day of learning and networking.', 'session', '2025-09-13', '17:00:00', '18:00:00', 'Main Auditorium', 500, 0, true);

-- Link speakers to events
INSERT INTO conference.event_speakers (event_id, speaker_id) VALUES
-- Keynote
(2, 1), -- Dr. Sarah Johnson - AI Keynote
-- Morning Sessions
(3, 2), -- Ahmed - Web Applications
(4, 3), -- Maria - Mobile Development
(5, 4), -- Dr. Omar - Cybersecurity
-- Afternoon Sessions
(6, 5), -- Lisa - Cloud Architecture
(7, 6), -- Khaled - Data Science
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), -- Panel - All speakers
-- Workshops
(9, 2), -- Ahmed - React Workshop
(10, 3), -- Maria - Flutter Workshop
(11, 1), -- Dr. Sarah - AI Workshop
(12, 4), -- Dr. Omar - Security Workshop
(13, 5); -- Lisa - Cloud Workshop

-- Insert Sponsors
INSERT INTO conference.sponsors (name, description, tier, logo_url, website_url, is_active) VALUES
('Google', 'Google is a multinational technology company that specializes in Internet-related services and products.', 'platinum', '/placeholder.svg?height=100&width=200', 'https://google.com', true),
('Microsoft', 'Microsoft is a multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software.', 'platinum', '/placeholder.svg?height=100&width=200', 'https://microsoft.com', true),
('Meta', 'Meta builds technologies that help people connect, find communities, and grow businesses.', 'gold', '/placeholder.svg?height=100&width=200', 'https://meta.com', true),
('Amazon Web Services', 'AWS is a subsidiary of Amazon providing on-demand cloud computing platforms and APIs.', 'gold', '/placeholder.svg?height=100&width=200', 'https://aws.amazon.com', true),
('Netflix', 'Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies and documentaries.', 'silver', '/placeholder.svg?height=100&width=200', 'https://netflix.com', true),
('IBM', 'IBM is a multinational technology corporation that produces and sells computer hardware, middleware and software.', 'silver', '/placeholder.svg?height=100&width=200', 'https://ibm.com', true),
('GitHub', 'GitHub is a provider of Internet hosting for software development and version control using Git.', 'bronze', '/placeholder.svg?height=100&width=200', 'https://github.com', true),
('Stack Overflow', 'Stack Overflow is a question and answer site for professional and enthusiast programmers.', 'bronze', '/placeholder.svg?height=100&width=200', 'https://stackoverflow.com', true);
