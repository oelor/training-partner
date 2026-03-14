-- Profile cover images and gym customization
ALTER TABLE user_profiles ADD COLUMN cover_image_url TEXT DEFAULT '';
ALTER TABLE user_profiles ADD COLUMN gym_affiliation TEXT DEFAULT '';
ALTER TABLE gyms ADD COLUMN banner_image_url TEXT DEFAULT '';
ALTER TABLE gyms ADD COLUMN sport_focus TEXT DEFAULT '';
