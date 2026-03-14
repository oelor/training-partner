// Shared constants for Training Partner platform

export const ACTIVITIES = [
  // Combat Sports
  'Wrestling', 'MMA', 'Brazilian Jiu-Jitsu', 'Boxing', 'Kickboxing',
  'Judo', 'Muay Thai', 'Karate', 'Sambo', 'Taekwondo', 'Capoeira',
  // Strength & Conditioning
  'Weightlifting', 'Powerlifting', 'CrossFit', 'Calisthenics', 'Strongman',
  // Cardio & Endurance
  'Running', 'Rucking', 'Cycling', 'Swimming', 'Rowing',
  // Flexibility & Movement
  'Yoga', 'Pilates', 'Mobility Training',
  // Outdoor & Adventure
  'Rock Climbing', 'Hiking', 'Trail Running',
  // General
  'General Fitness', 'Personal Training', 'Group Fitness',
] as const;

export type Activity = typeof ACTIVITIES[number];

// Categories for grouped UI display
export const ACTIVITY_CATEGORIES: Record<string, readonly string[]> = {
  'Combat Sports': ACTIVITIES.slice(0, 11),
  'Strength & Conditioning': ACTIVITIES.slice(11, 16),
  'Cardio & Endurance': ACTIVITIES.slice(16, 21),
  'Flexibility & Movement': ACTIVITIES.slice(21, 24),
  'Outdoor & Adventure': ACTIVITIES.slice(24, 27),
  'General': ACTIVITIES.slice(27),
} as const;

// Skill levels (universal across activities)
export const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Pro',
] as const;

// Weight classes (primarily for combat sports, optional for others)
export const WEIGHT_CLASSES = [
  'Flyweight (126 lbs)',
  'Bantamweight (135 lbs)',
  'Featherweight (145 lbs)',
  'Lightweight (155 lbs)',
  'Welterweight (170 lbs)',
  'Middleweight (185 lbs)',
  'Light Heavyweight (205 lbs)',
  'Heavyweight (265 lbs)',
  'Super Heavyweight (265+ lbs)',
] as const;

// Training goals
export const TRAINING_GOALS = [
  'Competition',
  'Fitness',
  'Self-defense',
  'Technique',
  'Sparring',
  'Weight Loss',
  'Strength Building',
  'Social / Gym Buddy',
  'Endurance',
  'Flexibility',
] as const;
