-- Create conference-specific tables for RSVP system
CREATE SCHEMA IF NOT EXISTS conference;

-- Events table
CREATE TABLE IF NOT EXISTS conference.events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    capacity INTEGER NOT NULL DEFAULT 100,
    current_registrations INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('session', 'workshop', 'competition')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speakers table
CREATE TABLE IF NOT EXISTS conference.speakers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event speakers junction table
CREATE TABLE IF NOT EXISTS conference.event_speakers (
    event_id INTEGER REFERENCES conference.events(id) ON DELETE CASCADE,
    speaker_id INTEGER REFERENCES conference.speakers(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, speaker_id)
);

-- Attendees table
CREATE TABLE IF NOT EXISTS conference.attendees (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    university VARCHAR(255),
    year_of_study VARCHAR(50),
    field_of_study VARCHAR(255),
    dietary_restrictions TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS conference.rsvps (
    id SERIAL PRIMARY KEY,
    attendee_id INTEGER REFERENCES conference.attendees(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES conference.events(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
    qr_code VARCHAR(255),
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendee_id, event_id)
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS conference.sponsors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    tier VARCHAR(50) DEFAULT 'bronze' CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_type ON conference.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON conference.events(date);
CREATE INDEX IF NOT EXISTS idx_rsvps_attendee ON conference.rsvps(attendee_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON conference.rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON conference.rsvps(status);
