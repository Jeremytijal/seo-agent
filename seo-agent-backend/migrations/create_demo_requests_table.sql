-- =============================================================================
-- Table: demo_requests
-- Description: Stocke les demandes de démo du funnel landing page
-- =============================================================================

CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    site_internet VARCHAR(500) NOT NULL,
    telephone VARCHAR(50),
    source VARCHAR(100) DEFAULT 'landing_redacteur',
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contacted_at TIMESTAMP WITH TIME ZONE
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);

-- Index pour filtrer par statut
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_demo_requests_updated_at ON demo_requests;
CREATE TRIGGER trigger_demo_requests_updated_at
    BEFORE UPDATE ON demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_demo_requests_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anonymous users (for form submissions)
CREATE POLICY "Allow anonymous insert" ON demo_requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow authenticated users to read all
CREATE POLICY "Allow authenticated read" ON demo_requests
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON demo_requests
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- COMMENT: Pour exécuter ce script dans Supabase:
-- 1. Allez dans Supabase Dashboard > SQL Editor
-- 2. Collez ce script et exécutez-le
-- =============================================================================

