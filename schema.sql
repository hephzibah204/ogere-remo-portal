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
    email VARCHAR(255) NOT NULL,
    address TEXT,
    group_size VARCHAR(16) DEFAULT '1',
    id_card VARCHAR(64),
    message TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, confirmed, postponed, declined, completed, cancelled
    palace_chamber VARCHAR(128),
    confirmed_date DATE,
    confirmed_time VARCHAR(32),
    postponed_reason TEXT,
    decline_reason TEXT,
    palace_notes TEXT,
    official_name VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Schema Migration Alterations for existing deployments
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS palace_chamber VARCHAR(128);
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS confirmed_date DATE;
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS confirmed_time VARCHAR(32);
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS postponed_reason TEXT;
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS official_name VARCHAR(128);
ALTER TABLE royal_audiences ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_royal_audiences_date ON royal_audiences(booking_date);
CREATE INDEX IF NOT EXISTS idx_royal_audiences_status ON royal_audiences(status);
CREATE INDEX IF NOT EXISTS idx_royal_audiences_email ON royal_audiences(email);

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

-- 8. Emergency Citizen Incident Reports & Multi-Agency Dispatch
CREATE TABLE IF NOT EXISTS incident_reports (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
    threat_level VARCHAR(32) NOT NULL DEFAULT 'CODE_YELLOW', -- CODE_RED (Robbery/Terrorism/Kidnap), CODE_ORANGE (Tanker/Gas Leak), CODE_YELLOW
    is_silent_panic BOOLEAN DEFAULT FALSE,
    assigned_agency VARCHAR(128) DEFAULT 'All Agencies Broadcast', -- Police, FRSC, So-Safe, Palace Vigilante, Fire Service
    responding_unit VARCHAR(128),
    agency_notes TEXT,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) DEFAULT 6.9371,
    longitude NUMERIC(10, 7) DEFAULT 3.6335,
    description TEXT NOT NULL,
    reporter_name VARCHAR(128),
    reporter_phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- open, dispatched, on_scene, resolved, false_alarm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_incident_threat ON incident_reports(threat_level);
CREATE INDEX IF NOT EXISTS idx_incident_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_agency ON incident_reports(assigned_agency);

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

-- 12. Miss Olipakala Beauty Pageant Registrations
CREATE TABLE IF NOT EXISTS pageant_registrations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    age INT NOT NULL,
    height VARCHAR(32),
    address TEXT,
    occupation VARCHAR(128),
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, shortlisted, approved, rejected
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Mobile & Web Unified Citizens / Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    citizen_type VARCHAR(32) NOT NULL DEFAULT 'indigene', -- indigene, resident, diaspora
    quarter VARCHAR(128),
    compound VARCHAR(128),
    id_card_number VARCHAR(64),
    role VARCHAR(32) NOT NULL DEFAULT 'citizen', -- citizen, leader, admin
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 15. Content Synchronization Version Tracking
CREATE TABLE IF NOT EXISTS content_sync (
    collection_name VARCHAR(64) PRIMARY KEY,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 1
);

-- 16. Community News & Royal Proclamations
CREATE TABLE IF NOT EXISTS news_articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'General',
    author VARCHAR(128) DEFAULT 'Palace Media Secretariat',
    publish_date DATE DEFAULT CURRENT_DATE,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    is_breaking BOOLEAN DEFAULT FALSE,
    read_time VARCHAR(32) DEFAULT '3 min read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news_articles(publish_date);

-- 17. Emergency & Security Incident Reports (With WhatsApp-Style Live Location Tracking)
CREATE TABLE IF NOT EXISTS incident_reports (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(128) NOT NULL DEFAULT 'General Emergency',
    severity VARCHAR(32) NOT NULL DEFAULT 'Critical',
    threat_level VARCHAR(32) NOT NULL DEFAULT 'CODE_YELLOW', -- CODE_RED, CODE_ORANGE, CODE_YELLOW
    is_silent_panic BOOLEAN DEFAULT FALSE,
    is_live_tracking BOOLEAN DEFAULT FALSE,
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    heading NUMERIC(6, 2) DEFAULT NULL,
    speed NUMERIC(6, 2) DEFAULT NULL,
    accuracy NUMERIC(6, 2) DEFAULT NULL,
    assigned_agency VARCHAR(128) DEFAULT 'Unassigned',
    responding_unit VARCHAR(128) DEFAULT NULL,
    agency_notes TEXT DEFAULT NULL,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) DEFAULT 6.9371,
    longitude NUMERIC(10, 7) DEFAULT 3.6335,
    description TEXT,
    reporter_name VARCHAR(128) DEFAULT 'Anonymous Citizen',
    reporter_phone VARCHAR(32),
    status VARCHAR(32) DEFAULT 'open', -- open, dispatched, on_scene, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_incidents_threat ON incident_reports(threat_level);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incidents_live ON incident_reports(is_live_tracking);

-- 18. WhatsApp-Style Live Location Movement Breadcrumbs Trail
CREATE TABLE IF NOT EXISTS incident_location_pings (
    id BIGSERIAL PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    heading NUMERIC(6, 2),
    speed NUMERIC(6, 2),
    accuracy NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pings_incident ON incident_location_pings(incident_id, created_at DESC);

-- 19. Virtual Safe Escort ("Walk With Me" Journey Watchdog)
CREATE TABLE IF NOT EXISTS virtual_escorts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    destination VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) DEFAULT 'active', -- active, safe_arrival, alarm_triggered, duress_triggered
    safety_pin VARCHAR(64) NOT NULL,
    duress_pin VARCHAR(64) DEFAULT '9999',
    last_latitude NUMERIC(10, 7),
    last_longitude NUMERIC(10, 7),
    incident_id VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_escorts_status ON virtual_escorts(status);
CREATE INDEX IF NOT EXISTS idx_escorts_expires ON virtual_escorts(expires_at);

-- 20. Guardian Family Circles (Emergency Contacts)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    contact_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    relationship VARCHAR(64) DEFAULT 'Family',
    notify_sms BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_user ON emergency_contacts(user_id);

-- 21. Palace Amber Alerts & Community Emergency Broadcasts
CREATE TABLE IF NOT EXISTS community_broadcasts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'CRITICAL', -- CRITICAL, ADVISORY, CURFEW
    target_sector VARCHAR(128) DEFAULT 'All Sectors',
    author_role VARCHAR(64) DEFAULT 'Palace Security Secretariat',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_active ON community_broadcasts(is_active);

-- 22. Private CCTV & Security Camera Registry
CREATE TABLE IF NOT EXISTS cctv_registry (
    id VARCHAR(64) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    coverage_direction VARCHAR(128),
    camera_count INT DEFAULT 1,
    notes TEXT,
    status VARCHAR(32) DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_cctv_coords ON cctv_registry(latitude, longitude);

-- 23. Cryptographic Anonymous Whistleblower Tips
CREATE TABLE IF NOT EXISTS anonymous_tips (
    id VARCHAR(64) PRIMARY KEY,
    tip_token VARCHAR(32) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    sector VARCHAR(128),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(32) DEFAULT 'submitted', -- submitted, reviewing, investigating, resolved
    officer_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tips_token ON anonymous_tips(tip_token);

-- 24. Vigilante Night Patrol Geofenced Check-In Points
CREATE TABLE IF NOT EXISTS patrol_checkins (
    id SERIAL PRIMARY KEY,
    outpost_name VARCHAR(128) NOT NULL,
    officer_name VARCHAR(128) NOT NULL,
    agency VARCHAR(64) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patrol_checked ON patrol_checkins(checked_in_at DESC);

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

INSERT INTO pageant_registrations (id, name, email, phone, age, height, address, occupation, reason, status)
VALUES
('PGN-2026-001', 'Adetoun Kikelomo Solarin', 'adetoun.solarin@gmail.com', '08034567812', 22, '5''7"', 'Isale-Ogere (Living in Lagos)', 'Undergraduate (Mass Comm)', 'Passionate about Yoruba cultural preservation, girl-child education in Remo, and serving as a worthy cultural ambassador for Ogere Remo worldwide.', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cctv_registry (id, business_name, contact_person, phone, location, latitude, longitude, coverage_direction, camera_count, notes)
VALUES
('cctv_01', 'Ogere Resort Gatehouse & Perimeter', 'Security Chief Adeleke', '09062470474', 'KM 67 Lagos-Ibadan Expressway', 6.9388, 3.6437, 'Facing Expressway Northbound & Gate Entry', 6, '4K Night Vision, 30-day loop recording'),
('cctv_02', 'TotalEnergies Expressway Service Station', 'Station Mgr Ibrahim', '08023456781', 'KM 66.5 Tollgate Bypass', 6.9380, 3.6410, 'Facing Forecourt & Highway Inflow', 8, 'Full HD, optical zoom onto expressway lane 1 & 2'),
('cctv_03', 'Ogere Central Trailer Park Logistics Outpost', 'Commander Lawal', '08034681687', 'Trailer Park Inbound Axis', 6.9366, 3.6344, 'Facing Haulage Ingate & Bypass Corridor', 4, 'Infrared night surveillance'),
('cctv_04', 'Palace Square & Aafin Ologere Gate', 'Chief Vigilante Osibogun', '08023456789', 'Palace Way / Aafin Axis', 6.9368, 3.6330, 'Facing Palace Roundabout & King Market Road', 5, 'Monitored 24/7 by Palace Night Watch')
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_broadcasts (id, title, message, severity, target_sector, author_role, is_active, created_at)
VALUES
('bcast_init', 'Expressway Night Visibility Advisory', 'Heavy fog and tanker traffic reported along KM 66-68 Lagos-Ibadan Expressway. Joint patrol units active. Drive cautiously and report suspicious roadside stationary vehicles.', 'ADVISORY', 'Lagos-Ibadan Expressway Corridor', 'Palace Security Secretariat', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

