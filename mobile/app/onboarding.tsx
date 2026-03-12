import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/auth';
import { updateProfile } from '../lib/api';
import { colors, spacing, borderRadius, fonts } from '../lib/theme';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const WEIGHT_CLASSES = ['Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'];
const TRAINING_GOALS = ['Competition', 'Fitness', 'Self-Defense', 'Fun', 'Weight Loss', 'Skill Development'];

const STEPS = ['Skill Level', 'Weight Class', 'City', 'Goals', 'Bio'];

export default function OnboardingScreen() {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [skillLevel, setSkillLevel] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [city, setCity] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await updateProfile({
        skill_level: skillLevel,
        weight_class: weightClass,
        city,
        training_goals: goals.join(', '),
        bio,
      });
      await refreshUser();
      router.replace('/(tabs)');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }

  function handleSkip() {
    router.replace('/(tabs)');
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{step + 1} / {STEPS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepLabel}>STEP {step + 1}</Text>
        <Text style={styles.stepTitle}>{STEPS[step].toUpperCase()}</Text>

        {/* Step 0: Skill Level */}
        {step === 0 && (
          <View style={styles.optionsGrid}>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionCard, skillLevel === level && styles.optionCardActive]}
                onPress={() => setSkillLevel(level)}
              >
                <Text style={[styles.optionText, skillLevel === level && styles.optionTextActive]}>
                  {level}
                </Text>
                <Text style={styles.optionDesc}>
                  {level === 'Beginner' ? '0-1 years' :
                   level === 'Intermediate' ? '1-3 years' :
                   level === 'Advanced' ? '3-7 years' : '7+ years / competitor'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 1: Weight Class */}
        {step === 1 && (
          <View style={styles.chipGrid}>
            {WEIGHT_CLASSES.map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.chip, weightClass === w && styles.chipActive]}
                onPress={() => setWeightClass(w)}
              >
                <Text style={[styles.chipText, weightClass === w && styles.chipTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: City */}
        {step === 2 && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>YOUR CITY</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. New York, London, Tokyo"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
            <Text style={styles.inputHint}>This helps us find partners near you</Text>
          </View>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <View style={styles.chipGrid}>
            {TRAINING_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[styles.chip, goals.includes(goal) && styles.chipActive]}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={[styles.chipText, goals.includes(goal) && styles.chipTextActive]}>{goal}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ABOUT YOU</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell potential partners about yourself, your experience, what you're looking for..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, saving && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === STEPS.length - 1 ? 'FINISH' : 'NEXT →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: borderRadius.full },
  progressText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  content: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.text,
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },
  optionsGrid: { gap: spacing.md },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '11' },
  optionText: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, letterSpacing: 1, marginBottom: spacing.xs },
  optionTextActive: { color: colors.primary },
  optionDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary },
  chipTextActive: { color: '#000' },
  inputContainer: {},
  inputLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  inputMultiline: { height: 150, textAlignVertical: 'top' },
  inputHint: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
  charCount: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textAlign: 'right', marginTop: spacing.xs },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextButtonDisabled: { opacity: 0.6 },
  nextButtonText: { fontFamily: fonts.heading, fontSize: 18, color: '#000', letterSpacing: 2 },
});
