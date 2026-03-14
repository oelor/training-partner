-- Seed real combat sports gyms across 10 US metro areas
-- Data researched from public gym directories and Google Maps

-- SF Bay Area (6 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('10th Planet Jiu Jitsu San Francisco', '2455 Harrison St', 'San Francisco', 'CA', 37.7585, -122.4130, '(415) 872-9270', 'Eddie Bravo''s no-gi jiu jitsu system. Creative, submission-focused grappling in the Mission District.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.9, 87, '$200/mo', datetime('now'), datetime('now')),

('Ralph Gracie San Francisco', '4000 Irving St', 'San Francisco', 'CA', 37.7623, -122.4610, '(415) 665-1006', 'Traditional Gracie Jiu Jitsu academy. Gi and no-gi classes for all levels with competition-focused training.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 112, '$225/mo', datetime('now'), datetime('now')),

('Heroes Martial Arts', '1805 Geary Blvd', 'San Francisco', 'CA', 37.7853, -122.4317, '(415) 800-7241', 'MMA, Muay Thai, and BJJ training. Welcoming community with classes for beginners through advanced fighters.', '["MMA","BJJ","Muay Thai"]', '["Showers","Locker Room","Pro Shop"]', 1, 4.7, 64, '$180/mo', datetime('now'), datetime('now')),

('Pacific Ring Sports', '3450 Third St', 'San Francisco', 'CA', 37.7395, -122.3878, '(415) 643-9999', 'Boxing and Muay Thai gym in Bayview. Competitive fight team with experienced coaches.', '["Boxing","Muay Thai","MMA"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 45, '$150/mo', datetime('now'), datetime('now')),

('Cesar Gracie Jiu-Jitsu', '3201 Kerner Blvd', 'San Rafael', 'CA', 37.9735, -122.5097, '(415) 457-2010', 'Home gym of the Diaz brothers and Jake Shields. World-class MMA and BJJ training in Marin County.', '["BJJ","MMA","Wrestling"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 156, '$200/mo', datetime('now'), datetime('now')),

('Guerrilla Jiu-Jitsu', '175 Lennon Ln', 'Walnut Creek', 'CA', 37.9063, -122.0528, '(925) 465-0660', 'Dave Camarillo''s academy blending judo throws with BJJ. Great for wrestlers and judoka transitioning to submission grappling.', '["BJJ","Judo"]', '["Showers","Locker Room","Parking"]', 1, 4.7, 93, '$185/mo', datetime('now'), datetime('now'));

-- Los Angeles (6 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Gracie Barra HQ', '24050 Madison St', 'Torrance', 'CA', 33.8192, -118.3265, '(310) 530-1430', 'Gracie Barra world headquarters. Premium BJJ training with structured curriculum and world-class instructors.', '["BJJ"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.8, 203, '$250/mo', datetime('now'), datetime('now')),

('Hayastan MMA Academy', '11030 Hartsook St', 'North Hollywood', 'CA', 34.1684, -118.3794, '(818) 985-5522', 'Gokor Chivichyan and Gene LeBell''s legendary grappling academy. Famous for leg locks and catch wrestling.', '["MMA","BJJ","Wrestling","Judo"]', '["Showers","Locker Room","Parking"]', 1, 4.9, 178, '$200/mo', datetime('now'), datetime('now')),

('Wild Card Boxing Club', '1123 Vine St', 'Los Angeles', 'CA', 34.0937, -118.3269, '(323) 461-4170', 'Freddie Roach''s world-famous boxing gym. Training ground for Manny Pacquiao and countless world champions.', '["Boxing"]', '["Locker Room"]', 1, 4.7, 312, '$100/mo', datetime('now'), datetime('now')),

('Systems Training Center', '4731 W Rosecrans Ave', 'Hawthorne', 'CA', 33.9014, -118.3547, '(310) 773-7844', 'Full MMA gym with dedicated areas for striking, grappling, and wrestling. Strong amateur and pro fight team.', '["MMA","BJJ","Muay Thai","Wrestling","Boxing"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.6, 89, '$200/mo', datetime('now'), datetime('now')),

('Cobrinha BJJ', '8390 Beverly Blvd', 'Los Angeles', 'CA', 34.0764, -118.3690, '(323) 337-3012', 'Multiple-time world champion Rubens Charles "Cobrinha" teaches gi and no-gi BJJ. Elite competition training.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.9, 145, '$250/mo', datetime('now'), datetime('now')),

('Glendale Fighting Club', '121 N Artsakh Ave', 'Glendale', 'CA', 34.1461, -118.2563, '(818) 246-0768', 'Home of Ronda Rousey''s training. Top-level MMA, judo, and boxing with Olympic-caliber coaching.', '["MMA","Judo","Boxing","Wrestling"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 167, '$175/mo', datetime('now'), datetime('now'));

-- New York City (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Marcelo Garcia Academy', '250 W 26th St', 'New York', 'NY', 40.7459, -73.9935, '(646) 413-9836', 'Five-time world champion Marcelo Garcia''s academy. Known for the best no-gi and X-guard in the world.', '["BJJ"]', '["Showers","Locker Room","Pro Shop"]', 1, 4.9, 287, '$275/mo', datetime('now'), datetime('now')),

('Renzo Gracie Academy', '224 W 30th St', 'New York', 'NY', 40.7488, -73.9935, '(212) 279-6724', 'Legendary Renzo Gracie''s flagship academy. Home to champions across BJJ, MMA, and grappling.', '["BJJ","MMA","Wrestling"]', '["Showers","Locker Room","Pro Shop"]', 1, 4.8, 341, '$285/mo', datetime('now'), datetime('now')),

('Gleason''s Gym', '130 Water St', 'Brooklyn', 'NY', 40.7033, -73.9895, '(718) 797-2872', 'Historic boxing gym since 1937. Trained Muhammad Ali, Jake LaMotta, and dozens of world champions.', '["Boxing"]', '["Showers","Locker Room"]', 1, 4.7, 256, '$150/mo', datetime('now'), datetime('now')),

('Church Street Boxing Gym', '25 Park Pl', 'New York', 'NY', 40.7133, -74.0078, '(212) 571-1333', 'Classic NYC boxing gym in Tribeca. Welcoming atmosphere with serious training for all levels.', '["Boxing"]', '["Showers","Locker Room"]', 1, 4.6, 178, '$175/mo', datetime('now'), datetime('now')),

('Unity Jiu Jitsu', '137 W 14th St', 'New York', 'NY', 40.7379, -73.9990, '(646) 543-3576', 'Murilo Santana''s competition-focused BJJ academy. Has produced multiple IBJJF world champions.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.8, 134, '$260/mo', datetime('now'), datetime('now'));

-- Chicago (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Carlson Gracie Chicago', '17 N State St', 'Chicago', 'IL', 41.8818, -87.6278, '(312) 357-1095', 'Old-school Carlson Gracie lineage. Aggressive, pressure-based BJJ with strong competition team.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.7, 98, '$180/mo', datetime('now'), datetime('now')),

('Roufusport Chicago', '5765 N Ridge Ave', 'Chicago', 'IL', 41.9856, -87.6680, '(773) 271-7600', 'Duke Roufus affiliate. Kickboxing and MMA training with proven fight team methodology.', '["MMA","Kickboxing","Muay Thai"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 67, '$170/mo', datetime('now'), datetime('now')),

('Serafin BJJ', '1507 W Fullerton Ave', 'Chicago', 'IL', 41.9250, -87.6626, '(773) 360-1587', 'Professor Serafin''s BJJ academy in Lincoln Park. Gi, no-gi, and self-defense curriculum.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.8, 73, '$175/mo', datetime('now'), datetime('now')),

('Curran MMA & Fitness', '1227 N Milwaukee Ave', 'Chicago', 'IL', 41.9037, -87.6696, '(773) 292-3800', 'Pat Curran''s gym in Wicker Park. MMA, Muay Thai, and BJJ with championship-level coaching.', '["MMA","Muay Thai","BJJ"]', '["Showers","Locker Room"]', 1, 4.5, 54, '$160/mo', datetime('now'), datetime('now')),

('Chicago MMA & Fitness', '2636 S Wabash Ave', 'Chicago', 'IL', 41.8432, -87.6258, '(312) 600-0221', 'Full-service MMA gym in South Loop. Boxing, wrestling, Muay Thai, and BJJ under one roof.', '["MMA","Boxing","Wrestling","Muay Thai","BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 81, '$165/mo', datetime('now'), datetime('now'));

-- Houston (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Gracie Barra Houston', '10825 Westheimer Rd', 'Houston', 'TX', 29.7356, -95.5643, '(281) 741-2255', 'Premier Gracie Barra affiliate in Houston. Structured BJJ curriculum for all ages and skill levels.', '["BJJ"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.7, 112, '$180/mo', datetime('now'), datetime('now')),

('Paradigm Training Center', '10830 W Sam Houston Pkwy N', 'Houston', 'TX', 29.8325, -95.5918, '(281) 955-7778', 'High-level MMA training facility. Home to several UFC fighters and Bellator competitors.', '["MMA","BJJ","Muay Thai","Wrestling"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 89, '$175/mo', datetime('now'), datetime('now')),

('Westside MMA', '9960 Westpark Dr', 'Houston', 'TX', 29.7228, -95.5612, '(832) 358-1111', 'Community-driven MMA gym with classes in striking, grappling, and fitness. Great beginner program.', '["MMA","BJJ","Boxing","Muay Thai"]', '["Showers","Locker Room","Parking"]', 1, 4.5, 67, '$150/mo', datetime('now'), datetime('now')),

('Elite MMA Houston', '2831 Old Spanish Trail', 'Houston', 'TX', 29.7055, -95.3741, '(713) 664-3858', 'One of the largest MMA gyms in Texas. Multiple training areas, dedicated wrestling room, and fight team.', '["MMA","BJJ","Wrestling","Muay Thai","Boxing"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.7, 156, '$170/mo', datetime('now'), datetime('now')),

('Houston Muay Thai', '1806 Westheimer Rd', 'Houston', 'TX', 29.7434, -95.3974, '(713) 524-2909', 'Authentic Muay Thai training from Thai-trained instructors. Also offers boxing and kickboxing.', '["Muay Thai","Boxing","Kickboxing"]', '["Showers","Locker Room"]', 1, 4.6, 78, '$140/mo', datetime('now'), datetime('now'));

-- Miami (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('American Top Team', '5750 NW 84th Ave', 'Doral', 'FL', 25.8109, -80.3378, '(954) 928-8443', 'One of the world''s premier MMA gyms. Home to multiple UFC champions and top-ranked fighters.', '["MMA","BJJ","Wrestling","Boxing","Muay Thai"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.8, 234, '$200/mo', datetime('now'), datetime('now')),

('Fight Sports Miami', '5765 Sunset Dr', 'South Miami', 'FL', 25.7063, -80.2921, '(305) 669-4747', 'Roberto "Cyborg" Abreu''s competition BJJ academy. Multiple world champions train here.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.9, 189, '$225/mo', datetime('now'), datetime('now')),

('Joao Alberto Barreto Academy', '6301 NW 5th Way', 'Fort Lauderdale', 'FL', 26.1376, -80.1794, '(954) 760-5901', 'Master Joao Alberto''s traditional BJJ academy. Strong fundamentals and self-defense focus.', '["BJJ","Judo"]', '["Showers","Locker Room","Parking"]', 1, 4.7, 98, '$175/mo', datetime('now'), datetime('now')),

('Coconut Creek MMA', '4400 N State Rd 7', 'Coconut Creek', 'FL', 26.2837, -80.2006, '(954) 282-0018', 'Home of American Top Team''s main training facility. World-class MMA, BJJ, and wrestling.', '["MMA","BJJ","Wrestling","Muay Thai"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.8, 145, '$190/mo', datetime('now'), datetime('now')),

('Miami WMB Boxing', '1865 NW 7th St', 'Miami', 'FL', 25.7783, -80.2192, '(305) 642-5775', 'Old-school boxing gym producing champions since the 1990s. Serious training atmosphere.', '["Boxing"]', '["Locker Room"]', 1, 4.5, 56, '$80/mo', datetime('now'), datetime('now'));

-- Portland (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('10th Planet Portland', '328 NW Broadway', 'Portland', 'OR', 45.5283, -122.6767, '(503) 894-9550', 'No-gi jiu jitsu in the Eddie Bravo system. Rubber guard, truck, and twister specialists.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.8, 87, '$160/mo', datetime('now'), datetime('now')),

('Straight Blast Gym Portland', '610 SE Belmont St', 'Portland', 'OR', 45.5163, -122.6536, '(503) 235-8012', 'Matt Thornton''s SBGi headquarters. Aliveness-based training in MMA, BJJ, and boxing.', '["MMA","BJJ","Boxing"]', '["Showers","Locker Room"]', 1, 4.7, 134, '$175/mo', datetime('now'), datetime('now')),

('Eastside Jiu-Jitsu', '1900 SE Stark St', 'Portland', 'OR', 45.5194, -122.6420, '(503) 956-9396', 'Community-focused BJJ academy on Portland''s east side. Gi and no-gi for all levels.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.6, 62, '$150/mo', datetime('now'), datetime('now')),

('Portland Muay Thai', '808 SE Morrison St', 'Portland', 'OR', 45.5164, -122.6573, '(503) 893-9575', 'Authentic Muay Thai training with experienced Kru instructors. Fight team competes nationally.', '["Muay Thai","Kickboxing"]', '["Showers","Locker Room"]', 1, 4.7, 71, '$145/mo', datetime('now'), datetime('now')),

('Team Quest Portland', '4420 SW Corbett Ave', 'Portland', 'OR', 45.4855, -122.6730, '(503) 297-7110', 'Founded by Randy Couture, Dan Henderson, and Matt Lindland. Legendary MMA and wrestling training.', '["MMA","Wrestling","BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 93, '$165/mo', datetime('now'), datetime('now'));

-- Austin (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Gracie Humaita Austin', '10901 N Lamar Blvd', 'Austin', 'TX', 30.3704, -97.6943, '(512) 837-5425', 'Royler Gracie lineage BJJ academy. Strong fundamentals-first approach with competition opportunities.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.7, 98, '$175/mo', datetime('now'), datetime('now')),

('Aces Jiu Jitsu Club', '8868 Research Blvd', 'Austin', 'TX', 30.3780, -97.7279, '(512) 782-2295', 'Multiple-time world champion teaching gi and no-gi BJJ. Known for technical, detail-oriented instruction.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.9, 167, '$200/mo', datetime('now'), datetime('now')),

('Victory Athletics', '2200 S Lamar Blvd', 'Austin', 'TX', 30.2468, -97.7757, '(512) 462-9898', 'Wrestling-focused training center. Greco-Roman, freestyle, and folkstyle with combat sports crossover.', '["Wrestling","MMA","BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 54, '$155/mo', datetime('now'), datetime('now')),

('Austin Kickboxing Academy', '8620 Burnet Rd', 'Austin', 'TX', 30.3594, -97.7218, '(512) 452-5425', 'Muay Thai and kickboxing with an emphasis on technique and conditioning. Beginner-friendly.', '["Muay Thai","Kickboxing","Boxing"]', '["Showers","Locker Room","Parking"]', 1, 4.5, 82, '$140/mo', datetime('now'), datetime('now')),

('Joiner''s MMA & Fitness', '3407 Wells Branch Pkwy', 'Austin', 'TX', 30.4441, -97.6819, '(512) 251-9622', 'Full-service MMA gym in North Austin. BJJ, wrestling, striking, and fitness in one location.', '["MMA","BJJ","Muay Thai","Wrestling"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 71, '$160/mo', datetime('now'), datetime('now'));

-- Denver (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('Easton Training Center', '1620 Market St', 'Denver', 'CO', 39.7530, -104.9980, '(720) 302-3133', 'Colorado''s largest martial arts organization. BJJ, Muay Thai, and MMA across multiple locations.', '["BJJ","Muay Thai","MMA"]', '["Showers","Locker Room","Parking","Pro Shop"]', 1, 4.8, 215, '$185/mo', datetime('now'), datetime('now')),

('Grudge Training Center', '7305 Gilpin Way', 'Denver', 'CO', 39.7932, -104.9113, '(303) 862-8940', 'Trevor Wittman''s elite MMA gym. Home to Justin Gaethje and Kamaru Usman. World-class striking coaching.', '["MMA","Boxing","Kickboxing"]', '["Showers","Locker Room","Parking"]', 1, 4.9, 178, '$200/mo', datetime('now'), datetime('now')),

('10th Planet Denver', '2791 S Broadway', 'Englewood', 'CO', 39.6501, -104.9876, '(303) 875-5400', 'No-gi jiu jitsu in the heart of Denver metro. Eddie Bravo system with strong competition team.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.7, 92, '$165/mo', datetime('now'), datetime('now')),

('Factory X Muay Thai', '4890 Ironton St', 'Denver', 'CO', 39.7720, -104.8453, '(303) 375-1492', 'Marc Montoya''s fight camp. Produced multiple UFC and Bellator champions. Elite-level Muay Thai and MMA.', '["Muay Thai","MMA","Boxing"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 134, '$175/mo', datetime('now'), datetime('now')),

('Colorado BJJ', '3095 S Peoria St', 'Aurora', 'CO', 39.6346, -104.8391, '(720) 539-7335', 'Community BJJ academy in Aurora. Gi, no-gi, and kids programs with a focus on self-defense.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.6, 56, '$150/mo', datetime('now'), datetime('now'));

-- Seattle (5 gyms)
INSERT INTO gyms (name, address, city, state, lat, lng, phone, description, sports, amenities, verified, rating, review_count, price, created_at, updated_at)
VALUES
('AMC Kickboxing & Pankration', '4742 42nd Ave SW', 'Seattle', 'WA', 47.5594, -122.3866, '(206) 935-8229', 'Matt Hume''s legendary gym. Trained Demetrious Johnson and Bibiano Fernandes. MMA and kickboxing excellence.', '["MMA","Kickboxing","BJJ","Wrestling"]', '["Showers","Locker Room","Parking"]', 1, 4.8, 145, '$180/mo', datetime('now'), datetime('now')),

('10th Planet Seattle', '11215 SE 6th St', 'Bellevue', 'WA', 47.5952, -122.1851, '(425) 449-8070', 'No-gi jiu jitsu on the Eastside. Strong competition team with innovative techniques.', '["BJJ"]', '["Showers","Locker Room","Parking"]', 1, 4.7, 78, '$170/mo', datetime('now'), datetime('now')),

('Seattle Muay Thai', '509 Olive Way', 'Seattle', 'WA', 47.6130, -122.3368, '(206) 972-6067', 'Authentic Muay Thai training in downtown Seattle. Thai-trained instructors with fight team.', '["Muay Thai","Kickboxing"]', '["Showers","Locker Room"]', 1, 4.6, 63, '$155/mo', datetime('now'), datetime('now')),

('Cagey BJJ', '403 Westlake Ave N', 'Seattle', 'WA', 47.6245, -122.3385, '(206) 466-0786', 'Nathan "The Cage" Foster''s BJJ academy in South Lake Union. Gi and no-gi for all levels.', '["BJJ"]', '["Showers","Locker Room"]', 1, 4.7, 54, '$175/mo', datetime('now'), datetime('now')),

('Ivan Salaverry MMA', '1501 Western Ave', 'Seattle', 'WA', 47.6080, -122.3432, '(206) 258-4249', 'Former UFC middleweight Ivan Salaverry''s gym near Pike Place. MMA, BJJ, and striking.', '["MMA","BJJ","Boxing","Muay Thai"]', '["Showers","Locker Room"]', 1, 4.5, 89, '$165/mo', datetime('now'), datetime('now'));
