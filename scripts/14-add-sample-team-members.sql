-- Add sample team members to the database
INSERT INTO team_members (name, role, bio, order_index, is_active, linkedin_url, github_url, twitter_url) VALUES
('Ahmad Hassan', 'Chapter Lead', 'Computer Science student passionate about AI and machine learning.', 1, true, 'https://linkedin.com/in/ahmad-hassan', 'https://github.com/ahmad-hassan', 'https://twitter.com/ahmad_hassan'),
('Sara Mohammad', 'Technical Lead', 'Software Engineering student specializing in web development and cloud technologies.', 2, true, 'https://linkedin.com/in/sara-mohammad', 'https://github.com/sara-mohammad', 'https://twitter.com/sara_mohammad'),
('Omar Khalil', 'Events Coordinator', 'Information Technology student with expertise in mobile app development.', 3, true, 'https://linkedin.com/in/omar-khalil', 'https://github.com/omar-khalil', 'https://twitter.com/omar_khalil'),
('Lina Ahmad', 'Marketing Lead', 'Business Informatics student focused on digital marketing and community building.', 4, true, 'https://linkedin.com/in/lina-ahmad', 'https://github.com/lina-ahmad', 'https://twitter.com/lina_ahmad'),
('Mohammad Rashid', 'Workshop Coordinator', 'Cybersecurity student passionate about ethical hacking and security research.', 5, true, 'https://linkedin.com/in/mohammad-rashid', 'https://github.com/mohammad-rashid', 'https://twitter.com/mohammad_rashid'),
('Rana Nasser', 'Community Manager', 'Data Science student interested in machine learning and data analytics.', 6, true, 'https://linkedin.com/in/rana-nasser', 'https://github.com/rana-nasser', 'https://twitter.com/rana_nasser')
ON CONFLICT (name) DO NOTHING;
