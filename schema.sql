-- ==========================================================
-- OGERE REMO COMMUNITY & ROYAL PORTAL
-- PostgreSQL Database Schema (Compatible with Supabase & Vercel Postgres)
-- ==========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Digital Community ID Cards
CREATE TABLE IF NOT EXISTS id_cards (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(32) NOT NULL DEFAULT 'indigene', -- indigene, diaspora, resident
    dob DATE,
    compound VARCHAR(128),
    quarter VARCHAR(128),
    phone VARCHAR(32),
    email VARCHAR(255),
    address TEXT,
    occupation VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    issued_date DATE,
    expiry_date DATE,
    photo_url TEXT,
    verified_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_id_cards_status ON id_cards(status);
CREATE INDEX IF NOT EXISTS idx_id_cards_quarter ON id_cards(quarter);

-- 2. Royal Audience Appointments (Palace of the Ologere)
CREATE TABLE IF NOT EXISTS royal_audiences (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(32) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    group_size VARCHAR(16) DEFAULT '1',
    id_card VARCHAR(64),
    message TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    palace_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_royal_audiences_date ON royal_audiences(booking_date);
CREATE INDEX IF NOT EXISTS idx_royal_audiences_status ON royal_audiences(status);

-- 3. Digital Land Registry & Dispute Resolution
CREATE TABLE IF NOT EXISTS land_registry (
    id VARCHAR(64) PRIMARY KEY,
    area_quarter VARCHAR(128) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    size_description VARCHAR(128) NOT NULL,
    land_use VARCHAR(64) NOT NULL DEFAULT 'Residential',
    status VARCHAR(32) NOT NULL DEFAULT 'Verified', -- Verified, Pending Survey, Disputed
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    coordinates VARCHAR(128),
    disputes_count INT DEFAULT 0,
    documents_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_land_registry_status ON land_registry(status);
CREATE INDEX IF NOT EXISTS idx_land_registry_area ON land_registry(area_quarter);

-- 4. Community Marketplace Listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    price VARCHAR(64) NOT NULL,
    seller_name VARCHAR(128) NOT NULL,
    quarter VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    icon VARCHAR(16) DEFAULT '🛍️',
    badge VARCHAR(32) DEFAULT 'fresh',
    is_verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_cat ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_quarter ON marketplace_listings(quarter);

-- 5. Business Directory
CREATE TABLE IF NOT EXISTS businesses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    tier VARCHAR(32) DEFAULT 'Standard', -- Standard, Premium
    description TEXT,
    phone VARCHAR(32),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    rating VARCHAR(32),
    image_url TEXT,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_businesses_cat ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_tier ON businesses(tier);

-- 6. Diaspora Giving & Project Endowment
CREATE TABLE IF NOT EXISTS project_donations (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    donor_name VARCHAR(128) DEFAULT 'Anonymous Diaspora Member',
    donor_email VARCHAR(255) NOT NULL,
    amount_naira NUMERIC(12, 2) NOT NULL,
    paystack_reference VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'success', -- success, pending, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_proj ON project_donations(project_id);

-- 7. Scholarships & Educational Grants
CREATE TABLE IF NOT EXISTS scholarship_applications (
    id VARCHAR(64) PRIMARY KEY,
    program_id VARCHAR(32) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    compound VARCHAR(128),
    institution VARCHAR(255) NOT NULL,
    cgpa VARCHAR(32),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    statement TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'under_review', -- under_review, shortlisted, awarded, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Emergency Citizen Incident Reports
CREATE TABLE IF NOT EXISTS incident_reports (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reporter_name VARCHAR(128),
    reporter_phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- open, investigating, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Community Blood Bank & Emergency Donors
CREATE TABLE IF NOT EXISTS blood_donors (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    quarter VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    last_donated DATE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Community Forum Threads & Discussion Posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id BIGINT PRIMARY KEY,
    author_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'general',
    topic VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    likes_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id VARCHAR(64) PRIMARY KEY,
    post_id BIGINT REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_name VARCHAR(128) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Heritage Quiz Leaderboard
CREATE TABLE IF NOT EXISTS quiz_leaderboard (
    id VARCHAR(64) PRIMARY KEY,
    player_name VARCHAR(128) NOT NULL,
    score_percentage INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- SEED DATA INSERTIONS (Initial Portal Data)
-- ==========================================================

INSERT INTO id_cards (id, full_name, card_type, dob, compound, quarter, phone, email, address, occupation, status, issued_date, expiry_date, verified_by)
VALUES 
('OGR-782910', 'Adewale Babatunde Ogunleke', 'indigene', '1992-06-14', 'Kankanbina', 'Oke-Ogere', '08034512345', 'adewale.ogunleke@gmail.com', '14 Palace Way, Oke-Ogere, Ogere Remo', 'Civil Engineer', 'approved', '2024-01-15', '2027-01-15', 'HRH Ologere Palace Office'),
('OGR-D-492019', 'Dr. Folashade Adeyemi-Clark', 'diaspora', '1985-11-22', 'Ejigboye', 'Isale-Ogere', '+44 7911 123456', 'f.adeyemi@nhs.net', 'London, UK / 3 Ejigboye St, Ogere', 'Consultant Surgeon', 'approved', '2024-03-01', '2027-03-01', 'OCDA Diaspora Secretariat')
ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, category, tier, description, phone, website, address, rating)
VALUES
('biz_hephzibah', 'Hephzibah Edutech & Innovation Hub', 'Technology', 'Premium', 'Digital innovation hub offering software bootcamps, AI training, and STEM certification.', '+234 803 892 0110', 'https://hephzibahedutech.com', 'Innovation Campus, Palace Way / Expressway Axis', '5.0★ (Featured)'),
('biz1', 'Ogere Resort & International Convention Centre', 'Hospitality', 'Premium', 'Premier retreat destination with 140+ luxury chalets and conference auditoriums.', '+234 906 247 0474', 'https://ogereresort.com', 'KM 67, Lagos–Ibadan Expressway, Ogere 121107', '4.4★ (558 reviews)'),
('biz2', 'Ositelu Memorial College (OMCOOSA)', 'Education', 'Premium', 'The flagship secondary educational institution of Ogere Remo.', '+234 806 215 8840', NULL, 'Awomosu Agbato Drive, Ogere 121107', '4.8★')
ON CONFLICT (id) DO NOTHING;
