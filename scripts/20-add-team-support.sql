-- Add team support for competitions
CREATE TABLE IF NOT EXISTS conference.competition_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_id INTEGER REFERENCES conference.events(id) ON DELETE CASCADE,
    team_leader_id INTEGER REFERENCES conference.attendees(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 4,
    current_members INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conference.competition_team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES conference.competition_teams(id) ON DELETE CASCADE,
    attendee_id INTEGER REFERENCES conference.attendees(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, attendee_id)
);

-- Add team requirements to events
ALTER TABLE conference.events 
ADD COLUMN IF NOT EXISTS requires_team BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 4;

-- Update competitions to require teams
UPDATE conference.events 
SET requires_team = true, min_team_size = 2, max_team_size = 4 
WHERE event_type = 'competition';

-- Add team_id to rsvps table to link RSVPs to teams
ALTER TABLE conference.rsvps 
ADD COLUMN IF NOT EXISTS competition_team_id INTEGER REFERENCES conference.competition_teams(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competition_teams_event ON conference.competition_teams(event_id);
CREATE INDEX IF NOT EXISTS idx_competition_team_members_team ON conference.competition_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_competition_team_members_attendee ON conference.competition_team_members(attendee_id);
