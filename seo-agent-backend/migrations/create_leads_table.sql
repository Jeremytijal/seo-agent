-- Table pour stocker les leads du funnel Meta Ads
-- À exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    source TEXT DEFAULT 'meta',
    variant TEXT DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    converted BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Index pour recherche par source et variant
CREATE INDEX IF NOT EXISTS idx_leads_source_variant ON leads(source, variant);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Contrainte unique sur email pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_unique ON leads(email);

-- RLS (Row Level Security) - Optionnel
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Leads are viewable by service role" ON leads FOR SELECT USING (true);
-- CREATE POLICY "Leads are insertable by service role" ON leads FOR INSERT WITH CHECK (true);

