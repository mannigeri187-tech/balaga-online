-- ==============================================================================
-- BALAGA PLATFORM PRODUCTION CONTENT SEED (SCHEMA MATCHED)
-- Seeds authentic foundational data into remote Supabase PostgreSQL
-- Run in the Supabase SQL Editor: https://supabase.com/dashboard/project/idzqiquioioaqpfssqun/sql/new
-- ==============================================================================

DO $$
DECLARE
    v_user1 UUID := '10000000-0000-0000-0000-000000000001';
    v_user2 UUID := '10000000-0000-0000-0000-000000000002';
    v_user3 UUID := '10000000-0000-0000-0000-000000000003';

    v_soc1 UUID := '20000000-0000-0000-0000-000000000001';
    v_soc2 UUID := '20000000-0000-0000-0000-000000000002';
    v_soc3 UUID := '20000000-0000-0000-0000-000000000003';

    v_fnd1 UUID := '30000000-0000-0000-0000-000000000001';
    v_fnd2 UUID := '30000000-0000-0000-0000-000000000002';
    v_fnd3 UUID := '30000000-0000-0000-0000-000000000003';

    v_comm1 UUID := '40000000-0000-0000-0000-000000000001';
    v_comm2 UUID := '40000000-0000-0000-0000-000000000002';
    v_comm3 UUID := '40000000-0000-0000-0000-000000000003';

    v_startup1 UUID := '50000000-0000-0000-0000-000000000001';
    v_startup2 UUID := '50000000-0000-0000-0000-000000000002';
    v_startup3 UUID := '50000000-0000-0000-0000-000000000003';
BEGIN
    -- 1. Ensure auth.users entries exist for foreign keys
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES
        (v_user1, 'aarav@balaga.online', crypt('BalagaPass2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Aarav Sharma"}', NOW(), NOW(), 'authenticated', 'authenticated'),
        (v_user2, 'priya@balaga.online', crypt('BalagaPass2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Priya Nair"}', NOW(), NOW(), 'authenticated', 'authenticated'),
        (v_user3, 'kabir@balaga.online', crypt('BalagaPass2026!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"display_name":"Kabir Menon"}', NOW(), NOW(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Accounts (using schema columns: id, email, phone, is_18_plus_verified, is_suspended, created_at, updated_at)
    INSERT INTO public.accounts (id, email, phone, is_18_plus_verified, is_suspended, created_at, updated_at)
    VALUES
        (v_user1, 'aarav@balaga.online', '+919876543210', TRUE, FALSE, NOW(), NOW()),
        (v_user2, 'priya@balaga.online', '+919876543211', TRUE, FALSE, NOW(), NOW()),
        (v_user3, 'kabir@balaga.online', '+919876543212', TRUE, FALSE, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

    -- 3. Social Profiles
    INSERT INTO public.social_profiles (id, account_id, username, display_name, bio, avatar_url, cover_url, interests, hobbies, languages, broad_location, is_private, created_at, updated_at)
    VALUES
        (v_soc1, v_user1, 'aarav_social', 'Aarav Sharma', 'Digital craftsman, weekend cyclist, and street photographer in Bengaluru.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', ARRAY['cycling', 'photography', 'coffee', 'rust'], ARRAY['street photography', 'filter coffee'], ARRAY['Kannada', 'English', 'Hindi'], 'Bengaluru, India', FALSE, NOW(), NOW()),
        (v_soc2, v_user2, 'priya_art', 'Priya Nair', 'Visual artist & water-colorist documenting the historic flora of Lalbagh & Cubbon.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80', ARRAY['watercolors', 'botany', 'plein air'], ARRAY['sketching', 'gardening'], ARRAY['Malayalam', 'English', 'Kannada'], 'Bengaluru, India', FALSE, NOW(), NOW()),
        (v_soc3, v_user3, 'kabir_rides', 'Kabir Menon', 'Endurance cyclist & mechanical hobbyist. 200km brevet finisher.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80', ARRAY['cycling', 'gravel', 'coffee', 'brevet'], ARRAY['road biking', 'cafe hopping'], ARRAY['English', 'Hindi'], 'Bengaluru, India', FALSE, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

    -- 4. Founder Profiles
    INSERT INTO public.founder_profiles (id, account_id, username, display_name, headline, bio, avatar_url, cover_url, broad_location, skills, roles, availability, work_preference, created_at, updated_at)
    VALUES
        (v_fnd1, v_user1, 'aarav_builds', 'Aarav Sharma', 'Founder & CEO @ PulseEngine AI (YC W24) | Building Vernacular Telemetry Mesh', '10+ years engineering high-throughput fintech infrastructure across India. Ex-Razorpay Senior Staff Engineer.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80', 'Bengaluru, India', ARRAY['Distributed Systems', 'Go', 'Fintech', 'UPI Rails', 'Telemetry'], ARRAY['Founder', 'CEO', 'Architect'], 'full_time', 'hybrid', NOW(), NOW()),
        (v_fnd2, v_user2, 'priya_design', 'Priya Nair', 'Founder @ Studio Kala | Human-Centric AI Canvas for Indian Vernacular Creators', 'Design technologist with 8 years building creative tools for vernacular crafts and cultural archiving.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', 'Bengaluru, India', ARRAY['Design Systems', 'Generative UI', 'Creative Direction', 'Flutter'], ARRAY['Founder', 'Design Lead'], 'full_time', 'remote', NOW(), NOW()),
        (v_fnd3, v_user3, 'kabir_mobility', 'Kabir Menon', 'Founder & CTO @ RidePulse | Real-Time Micro-Mobility Telemetry & Fleet Mesh', 'Hardware and firmware specialist scaling connected battery analytics across 4,000+ two-wheelers.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', 'Bengaluru, India', ARRAY['IoT Firmware', 'Rust', 'Battery Analytics', 'C/C++', 'CAN bus'], ARRAY['Founder', 'CTO'], 'full_time', 'in_person', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

    -- 5. Social Communities
    INSERT INTO public.social_communities (id, creator_id, name, slug, description, avatar_url, cover_url, category, is_private, rules, members_count, created_at, updated_at)
    VALUES
        (v_comm1, v_soc1, 'Bengaluru Plein Air Painters', 'blr-painters', 'Weekly open-air watercolor sketching meetups at Lalbagh, Cubbon Park, and Malleshwaram heritage lanes.', '🎨', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80', 'Art & Design', FALSE, ARRAY['Be respectful of public heritage spaces', 'Bring your own supplies', 'Share constructive feedback'], 184, NOW(), NOW()),
        (v_comm2, v_soc2, 'Indiranagar Book & Philosophy Salon', 'indiranagar-books', 'Bi-weekly Sunday evening discussions on Indian philosophy, Booker winners, and translated regional classics.', '📚', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', 'Literature', FALSE, ARRAY['Read chapters prior to sync', 'Diverse viewpoints encouraged'], 142, NOW(), NOW()),
        (v_comm3, v_soc3, 'Cubbon Weekend Runners & Cycling', 'cubbon-cyclists', 'Dawn rides to Nandi Hills and twilight intervals around Cubbon Park loop. Zero fees, all skill levels welcome.', '🚴', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80', 'Fitness', FALSE, ARRAY['Helmets mandatory on highway runs', 'Leave no litter behind'], 276, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET members_count = EXCLUDED.members_count;

    -- 6. Social Events
    INSERT INTO public.social_events (id, organizer_id, title, description, cover_url, category, venue_name, city, is_online, start_time, end_time, public_safety_guidance, is_attendee_list_visible, status, created_at, updated_at)
    VALUES
        ('60000000-0000-0000-0000-000000000001', v_soc2, 'Cubbon Park Bamboo Grove Watercolor Walk', 'Meet at the North Gate of Cubbon Park at 7:30 AM. Bring cold-press paper and water brushes. Filter coffee at Airlines Hotel afterwards!', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80', 'Art & Culture', 'Cubbon Park, Bamboo Grove', 'Bengaluru', FALSE, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'Stay on designated park pathways. Keep water bottles handy.', TRUE, 'active', NOW(), NOW()),
        ('60000000-0000-0000-0000-000000000002', v_soc3, '60km Dawn Ride to Nandi Foothills', 'Roll out from Esteem Mall Hebbal at 5:15 AM sharp. Steady 24-26 km/h pace. Breakfast stop at Nandi Upachar.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=80', 'Sports & Fitness', 'Esteem Mall, Hebbal', 'Bengaluru', FALSE, NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 4 hours', 'Helmets and front/rear safety lights mandatory for highway riding.', TRUE, 'active', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 7. Startups
    INSERT INTO public.startups (id, creator_id, name, slug, one_liner, description, logo_url, banner_url, industry, stage, team_size, location, website_url, seeking_cofounder, seeking_funding, seeking_talent, seeking_collabs, verification_badge, is_verified, followers_count, views_count, created_at, updated_at)
    VALUES
        (v_startup1, v_fnd1, 'PulseEngine AI', 'pulseengine', 'Vernacular telemetry and settlement infrastructure for emerging market payment rails.', 'PulseEngine AI provides sub-millisecond telemetry, settlement mesh routing, and automated dispute resolution across India''s domestic UPI and debit networks.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80', 'Fintech', 'early_traction', 8, 'Bengaluru, India', 'https://pulseengine.online', TRUE, TRUE, TRUE, TRUE, 'teal_business', TRUE, 420, 1850, NOW(), NOW()),
        (v_startup2, v_fnd2, 'Studio Kala', 'studiokala', 'Generative creative workspace celebrating traditional Indian typography and motifs.', 'Studio Kala bridges cultural heritage with generative design systems, enabling vernacular publishers and craft businesses to publish print and digital media seamlessly.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80', 'Design & AI', 'prototype', 4, 'Bengaluru, India', 'https://studiokala.online', TRUE, TRUE, TRUE, FALSE, 'blue_project', TRUE, 260, 980, NOW(), NOW()),
        (v_startup3, v_fnd3, 'RidePulse', 'ridepulse', 'Connected IoT battery health and fleet telemetry for two-wheeler logistics fleets.', 'RidePulse reduces battery degradation and unexpected fleet downtime using high-rate telemetry algorithms running on ultra-low-power CAN bus edge sensors.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', 'Mobility & IoT', 'scaling', 14, 'Bengaluru, India', 'https://ridepulse.online', FALSE, TRUE, TRUE, TRUE, 'teal_business', TRUE, 610, 3420, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

    -- 8. Launchpad Products
    INSERT INTO public.products (id, maker_id, startup_id, name, slug, tagline, description, logo_url, website_url, category, pricing_model, status, created_at, updated_at)
    VALUES
        ('70000000-0000-0000-0000-000000000001', v_fnd1, v_startup1, 'PulseTelemetry Mesh 2.0', 'pulse-mesh-2', 'Self-hosted microsecond transaction monitor for high-load payment gateways.', 'Drop-in Go agent delivering distributed transaction tracing, zero-copy ring buffer parsing, and instant alerts on bank gateway degradation.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80', 'https://demo.pulseengine.online', 'Fintech Infrastructure', 'freemium', 'live', NOW(), NOW()),
        ('70000000-0000-0000-0000-000000000002', v_fnd2, v_startup2, 'KalaCanvas Vernacular Studio', 'kalacanvas-studio', 'Dynamic layout engine for Kannada, Malayalam, Tamil, and Devanagari typography.', 'Design posters, packaging, and digital banners with typographically sound ligature rendering and heritage colour palettes.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', 'https://canvas.studiokala.online', 'Design Systems', 'free', 'beta', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 9. Social Feed Posts
    INSERT INTO public.social_posts (id, author_id, content, post_type, media_urls, likes_count, comments_count, shares_count, is_archived, created_at, updated_at)
    VALUES
        ('80000000-0000-0000-0000-000000000001', v_soc2, 'First light at Lalbagh Glass House this morning. Painted the mist rising off the lotus pond with cold-press sheets. Bengaluru winters hit different! 🎨✨ #PleinAir #NammaBengaluru', 'image', ARRAY['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80'], 142, 18, 9, FALSE, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
        ('80000000-0000-0000-0000-000000000002', v_soc3, '60km dawn ride to Nandi Hills completed before breakfast! Perfect misty morning on the highway 🚴‍♂️🌅 Shoutout to the morning bunch.', 'image', ARRAY['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80'], 215, 29, 14, FALSE, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours')
    ON CONFLICT (id) DO NOTHING;

END $$;
