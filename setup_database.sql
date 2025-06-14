-- Create the scores table
CREATE TABLE public.scores (
    id BIGSERIAL PRIMARY KEY,
    player_name TEXT NOT NULL,
    email TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT valid_score CHECK (score >= 0),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create an index for faster leaderboard queries
CREATE INDEX scores_score_idx ON public.scores (score DESC);

-- Set up row level security (RLS)
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.scores
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.scores
    FOR INSERT WITH CHECK (true);

-- Grant access to authenticated and anon users
GRANT SELECT, INSERT ON public.scores TO anon, authenticated; 