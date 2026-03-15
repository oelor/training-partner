'use client'

// Sport silhouette SVG component library
// Each silhouette is a clean, bold, recognizable athletic pose
// All components accept className, color (default: currentColor), and size props

import React from 'react'

interface SilhouetteProps extends React.SVGProps<SVGSVGElement> {
  color?: string
  size?: number
}

// ============================================================
// BJJ — Two figures in ground grappling (guard/mount position)
// ============================================================
export function BJJSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Bottom figure (guard player) lying on back */}
      <ellipse cx="42" cy="118" rx="11" ry="9" />
      <path d="M 52 110 L 108 102 L 110 116 L 52 126 Z" />
      <path d="M 58 126 L 48 138 L 40 148 Q 37 152 40 154 Q 44 152 45 148 L 52 136 L 60 128 Z" />
      <path d="M 73 102 L 64 90 L 58 80 Q 55 76 58 74 Q 62 76 63 80 L 70 92 L 76 102 Z" />
      {/* Bottom figure legs up in guard */}
      <path d="M 108 108 L 122 92 L 136 74 L 144 64 Q 148 59 151 62 L 146 72 L 134 86 L 120 102 L 112 112 Z" />
      <path d="M 106 102 L 126 82 L 144 68 L 156 58 Q 160 54 163 58 L 157 66 L 142 80 L 126 94 L 110 106 Z" />
      {/* Top figure (mount/top position) */}
      <ellipse cx="130" cy="72" rx="10" ry="11" />
      <path d="M 122 82 L 138 82 L 142 98 L 140 112 L 134 116 L 120 116 L 116 112 L 118 98 Z" />
      {/* Top figure arms posting */}
      <path d="M 120 88 L 108 82 L 98 78 Q 94 76 96 73 Q 100 74 104 78 L 114 84 Z" />
      <path d="M 138 88 L 150 84 L 158 80 Q 162 78 163 82 Q 160 84 156 86 L 144 92 Z" />
      {/* Top figure legs straddling */}
      <path d="M 120 116 L 108 128 L 98 142 L 92 154 Q 90 158 94 160 Q 96 158 95 154 L 100 142 L 110 130 L 122 118 Z" />
      <path d="M 134 116 L 146 128 L 156 142 L 162 154 Q 164 158 160 160 Q 158 158 159 154 L 154 142 L 144 130 L 136 118 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const BJJGuardSilhouette = BJJSilhouette

// ============================================================
// Wrestling — Two figures in standing clinch / body lock throw
// ============================================================
export function WrestlingSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Attacker — shooting for body lock */}
      <ellipse cx="70" cy="48" rx="11" ry="13" />
      <path d="M 64 60 L 76 60 L 82 78 L 84 96 L 78 102 L 62 102 L 56 96 L 60 78 Z" />
      {/* Attacker arms wrapping opponent */}
      <path d="M 76 68 L 92 62 L 108 58 L 118 56 Q 122 55 122 59 L 116 61 L 102 66 L 86 74 Z" />
      <path d="M 78 82 L 96 76 L 112 72 L 124 70 Q 128 69 128 73 L 120 76 L 106 80 L 88 88 Z" />
      {/* Attacker legs — wide stance */}
      <path d="M 62 102 L 52 120 L 42 140 L 36 158 Q 34 164 38 166 L 46 166 Q 48 164 44 162 L 40 162 L 46 144 L 56 124 L 66 106 Z" />
      <path d="M 78 102 L 84 120 L 88 138 L 90 154 Q 91 160 87 162 L 80 162 Q 78 160 82 158 L 86 158 L 85 142 L 80 124 L 74 108 Z" />
      {/* Defender — being lifted/clinched */}
      <ellipse cx="125" cy="42" rx="10" ry="12" />
      <path d="M 118 53 L 132 53 L 136 70 L 138 88 L 132 94 L 118 94 L 112 88 L 114 70 Z" />
      {/* Defender arms pushing/framing */}
      <path d="M 118 60 L 106 54 L 96 50 Q 92 48 94 44 Q 98 46 102 50 L 112 56 Z" />
      <path d="M 132 58 L 142 52 L 150 48 Q 154 46 155 50 Q 152 52 148 54 L 138 60 Z" />
      {/* Defender legs — being lifted, one off ground */}
      <path d="M 118 94 L 110 112 L 104 132 L 100 148 Q 98 154 102 156 L 108 156 Q 110 154 106 152 L 104 150 L 108 134 L 114 116 L 120 98 Z" />
      <path d="M 132 94 L 140 108 L 148 120 L 154 130 Q 156 134 153 136 Q 150 134 152 130 L 146 120 L 138 108 L 130 98 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const WrestlerSilhouette = WrestlingSilhouette

// ============================================================
// Boxing — Single figure throwing a cross, gloves up
// ============================================================
export function BoxingSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="105" cy="40" rx="12" ry="14" />
      {/* Neck */}
      <path d="M 100 53 L 110 53 L 112 60 L 98 60 Z" />
      {/* Torso — rotated for cross */}
      <path d="M 95 60 L 115 60 L 118 78 L 120 100 L 115 108 L 92 108 L 88 100 L 90 78 Z" />
      {/* Lead arm extended — throwing cross */}
      <path d="M 92 65 L 78 58 L 62 52 L 48 48 Q 43 46 42 50 Q 44 54 50 53 L 62 55 L 78 62 L 90 68 Z" />
      {/* Lead glove */}
      <ellipse cx="42" cy="50" rx="8" ry="7" />
      {/* Rear arm guard — by chin */}
      <path d="M 115 65 L 120 58 L 118 50 L 115 45 Q 114 42 117 42 Q 120 44 120 48 L 122 55 L 120 62 Z" />
      {/* Rear glove */}
      <ellipse cx="117" cy="42" rx="6" ry="5" />
      {/* Lead leg */}
      <path d="M 95 108 L 90 125 L 85 145 L 82 160 L 80 172 Q 78 178 82 180 L 90 180 Q 92 178 88 176 L 84 176 L 85 168 L 88 155 L 92 138 L 97 120 L 98 108 Z" />
      {/* Rear leg */}
      <path d="M 112 108 L 118 125 L 122 142 L 125 158 L 126 172 Q 127 178 123 180 L 116 180 Q 114 178 118 176 L 122 176 L 122 168 L 120 155 L 116 138 L 112 122 L 108 108 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const BoxerSilhouette = BoxingSilhouette

// ============================================================
// MMA — Fighter in stance, checking kick / ready position
// ============================================================
export function MMASilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="100" cy="38" rx="12" ry="14" />
      {/* Neck */}
      <path d="M 95 51 L 105 51 L 107 58 L 93 58 Z" />
      {/* Torso — athletic crouch */}
      <path d="M 90 58 L 110 58 L 115 75 L 118 95 L 112 105 L 88 105 L 82 95 L 85 75 Z" />
      {/* Left arm — reaching forward */}
      <path d="M 88 65 L 72 58 L 58 52 L 48 48 Q 44 46 42 49 Q 44 52 48 52 L 58 55 L 72 62 L 86 70 Z" />
      {/* Left MMA glove */}
      <path d="M 42 49 Q 38 47 36 50 Q 38 54 42 53 L 46 51 Z" />
      {/* Right arm — guard up */}
      <path d="M 112 65 L 122 58 L 128 50 L 130 44 Q 131 40 134 42 Q 134 46 132 50 L 126 60 L 118 68 Z" />
      {/* Right glove */}
      <path d="M 130 40 Q 132 36 136 38 Q 136 42 133 44 L 130 44 Z" />
      {/* Left leg — wide stance, slightly raised (checking) */}
      <path d="M 88 105 L 72 112 L 60 124 L 52 136 L 48 148 Q 46 152 50 154 L 56 154 Q 58 152 54 150 L 50 150 L 54 140 L 62 128 L 74 116 L 90 108 Z" />
      {/* Left foot */}
      <path d="M 50 154 L 44 156 Q 40 158 42 154 L 48 152 Z" />
      {/* Right leg — planted */}
      <path d="M 112 105 L 128 115 L 142 130 L 152 148 L 158 165 Q 160 170 156 172 L 148 172 Q 146 170 150 168 L 154 168 L 148 152 L 138 135 L 125 120 L 110 108 Z" />
      {/* Right foot */}
      <path d="M 156 172 L 162 174 Q 166 176 164 172 L 158 170 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const MMAFighterSilhouette = MMASilhouette

// ============================================================
// Muay Thai — Throwing a high roundhouse kick, arms in guard
// ============================================================
export function MuayThaiSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="85" cy="38" rx="11" ry="13" />
      {/* Neck */}
      <path d="M 80 50 L 90 50 L 92 58 L 78 58 Z" />
      {/* Torso leaning back */}
      <path d="M 78 58 L 92 58 L 98 75 L 100 95 L 95 100 L 72 100 L 68 95 L 72 75 Z" />
      {/* Left arm (guard up) */}
      <path d="M 72 62 L 60 55 L 55 48 L 52 42 Q 50 38 53 37 Q 56 39 56 44 L 58 50 L 65 58 Z" />
      {/* Right arm (guard) */}
      <path d="M 92 62 L 98 55 L 100 48 Q 101 44 104 45 Q 105 48 103 52 L 100 58 L 95 65 Z" />
      {/* Standing leg */}
      <path d="M 78 100 L 72 120 L 68 140 L 65 155 L 62 168 Q 60 174 56 175 L 50 176 Q 46 177 46 173 Q 48 172 52 172 L 56 170 L 58 165 L 62 150 L 66 135 L 72 115 L 76 100 Z" />
      {/* Kicking leg — extended roundhouse */}
      <path d="M 95 100 L 110 95 L 130 88 L 150 82 L 165 78 L 175 76 Q 180 75 180 79 Q 178 82 172 82 L 155 85 L 135 92 L 115 100 L 100 108 L 95 105 Z" />
      {/* Kicking foot */}
      <path d="M 175 76 L 182 74 L 188 73 Q 192 72 191 76 Q 188 78 184 78 L 178 79 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const MuayThaiKickSilhouette = MuayThaiSilhouette

// ============================================================
// Judo — Two figures, one throwing (hip throw / seoi nage)
// ============================================================
export function JudoSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* TORI (thrower) — bent at hips, rotating */}
      <ellipse cx="80" cy="55" rx="10" ry="12" />
      <path d="M 75 66 L 85 66 L 95 80 L 100 95 L 95 100 L 78 100 L 72 95 L 70 80 Z" />
      {/* Tori arm gripping */}
      <path d="M 85 70 L 100 62 L 115 55 L 120 52 Q 124 50 125 54 L 120 58 L 108 65 L 92 75 Z" />
      {/* Tori arm wrapping waist */}
      <path d="M 95 85 L 110 78 L 122 72 L 130 70 Q 134 69 134 73 L 128 75 L 115 82 L 100 90 Z" />
      {/* Tori legs — wide stance */}
      <path d="M 78 100 L 68 118 L 58 140 L 52 158 Q 50 164 54 166 L 60 166 Q 62 164 58 162 L 56 160 L 62 142 L 72 122 L 80 105 Z" />
      <path d="M 92 100 L 98 118 L 105 135 L 108 150 Q 109 156 105 158 L 100 158 Q 98 156 102 154 L 104 152 L 100 138 L 94 120 L 88 105 Z" />
      {/* UKE (being thrown) — airborne */}
      <ellipse cx="138" cy="48" rx="9" ry="11" />
      <path d="M 130 55 L 142 58 L 148 72 L 145 88 L 138 92 L 125 88 L 122 72 Z" />
      {/* Uke legs flying up */}
      <path d="M 140 92 L 152 105 L 162 118 L 168 128 Q 170 132 166 134 Q 163 132 165 128 L 158 118 L 148 105 L 138 95 Z" />
      <path d="M 130 88 L 140 100 L 148 112 L 155 125 Q 157 130 153 131 Q 150 128 152 124 L 145 112 L 136 100 L 128 92 Z" />
    </svg>
  )
}

// Keep backward compat alias
export const JudoThrowSilhouette = JudoSilhouette

// ============================================================
// Kickboxing — Single figure throwing a side kick
// ============================================================
export function KickboxingSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="75" cy="42" rx="11" ry="13" />
      {/* Neck */}
      <path d="M 70 54 L 80 54 L 82 60 L 68 60 Z" />
      {/* Torso — leaning away from kick */}
      <path d="M 65 60 L 82 60 L 78 78 L 74 96 L 68 102 L 55 100 L 52 94 L 58 78 Z" />
      {/* Arms in guard */}
      <path d="M 60 66 L 48 60 L 42 54 Q 38 50 41 48 Q 44 50 46 54 L 52 62 L 58 68 Z" />
      <path d="M 78 66 L 84 58 L 86 52 Q 87 48 90 50 Q 90 54 88 58 L 82 66 Z" />
      {/* Standing leg */}
      <path d="M 58 100 L 52 118 L 48 138 L 46 155 L 44 168 Q 42 174 46 176 L 54 176 Q 56 174 52 172 L 48 172 L 50 158 L 52 140 L 56 122 L 60 106 Z" />
      {/* Standing foot */}
      <path d="M 46 176 L 40 178 Q 36 180 38 176 L 44 174 Z" />
      {/* Side kick leg — extended horizontally */}
      <path d="M 68 96 L 88 92 L 110 88 L 132 86 L 150 84 L 164 83 Q 170 82 170 86 Q 168 89 162 88 L 148 89 L 130 90 L 110 94 L 90 98 L 72 104 Z" />
      {/* Kicking foot — blade edge */}
      <path d="M 164 83 L 172 80 L 180 78 Q 184 77 184 81 Q 180 83 176 84 L 168 86 Z" />
    </svg>
  )
}

// ============================================================
// Karate — Single figure in front kick pose (mae geri)
// ============================================================
export function KarateSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="95" cy="32" rx="11" ry="13" />
      {/* Neck */}
      <path d="M 90 44 L 100 44 L 102 50 L 88 50 Z" />
      {/* Torso — slight forward lean */}
      <path d="M 86 50 L 104 50 L 108 68 L 108 88 L 102 94 L 86 94 L 80 88 L 82 68 Z" />
      {/* Lead arm — hikite (pulled back) */}
      <path d="M 86 56 L 76 52 L 70 50 Q 66 48 68 44 Q 72 46 74 50 L 80 54 Z" />
      {/* Rear arm — punching forward with front kick */}
      <path d="M 104 58 L 116 54 L 126 50 Q 130 48 131 52 Q 128 54 124 56 L 112 60 Z" />
      {/* Back leg — planted, strong stance */}
      <path d="M 86 94 L 76 112 L 68 132 L 62 150 L 58 166 Q 56 172 60 174 L 68 174 Q 70 172 66 170 L 62 170 L 66 154 L 72 136 L 80 118 L 88 100 Z" />
      {/* Back foot */}
      <path d="M 60 174 L 54 176 Q 50 178 52 174 L 58 172 Z" />
      {/* Front kick leg — extended upward/forward */}
      <path d="M 102 94 L 112 100 L 124 108 L 136 118 L 148 126 L 158 130 Q 164 132 164 128 Q 162 125 156 126 L 144 120 L 132 110 L 120 100 L 108 92 Z" />
      {/* Kicking foot — ball of foot */}
      <path d="M 158 130 L 166 128 L 172 126 Q 176 124 176 128 Q 174 132 168 132 L 162 132 Z" />
    </svg>
  )
}

// ============================================================
// Taekwondo — Spinning back kick
// ============================================================
export function TaekwondoSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head — looking over shoulder */}
      <ellipse cx="112" cy="50" rx="10" ry="12" />
      {/* Neck */}
      <path d="M 106 60 L 116 62 L 114 68 L 102 66 Z" />
      {/* Torso — rotated, showing back */}
      <path d="M 100 66 L 116 68 L 120 84 L 118 100 L 112 106 L 96 104 L 92 98 L 96 82 Z" />
      {/* Arms — guard position during spin */}
      <path d="M 100 72 L 88 66 L 80 62 Q 76 60 78 56 Q 82 58 84 62 L 92 68 Z" />
      <path d="M 116 74 L 126 70 L 132 66 Q 136 64 137 68 Q 134 70 130 72 L 122 76 Z" />
      {/* Plant leg — pivoting */}
      <path d="M 96 104 L 88 120 L 82 138 L 78 155 L 76 168 Q 74 174 78 176 L 86 176 Q 88 174 84 172 L 80 172 L 82 158 L 86 142 L 92 124 L 98 108 Z" />
      {/* Plant foot */}
      <path d="M 78 176 L 72 178 Q 68 180 70 176 L 76 174 Z" />
      {/* Back kick leg — extended behind/through */}
      <path d="M 112 100 L 128 96 L 146 90 L 162 84 L 174 80 Q 180 78 180 82 Q 178 85 172 84 L 158 88 L 142 94 L 126 100 L 114 106 Z" />
      {/* Kicking heel */}
      <path d="M 174 80 L 182 77 L 188 75 Q 192 74 192 78 Q 189 80 186 80 L 178 82 Z" />
    </svg>
  )
}

// ============================================================
// General Fitness — Dynamic explosive stance (burpee/plyo)
// ============================================================
export function GeneralFitnessSilhouette({ color = 'currentColor', size, className, ...props }: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <ellipse cx="100" cy="34" rx="12" ry="13" />
      {/* Neck */}
      <path d="M 95 46 L 105 46 L 107 52 L 93 52 Z" />
      {/* Torso — upright, dynamic */}
      <path d="M 90 52 L 110 52 L 114 70 L 116 90 L 110 96 L 90 96 L 84 90 L 86 70 Z" />
      {/* Left arm — thrown up high */}
      <path d="M 90 58 L 78 48 L 68 36 L 62 26 Q 60 22 63 20 Q 66 22 65 28 L 70 38 L 80 50 L 88 60 Z" />
      {/* Left hand */}
      <path d="M 62 26 L 58 20 Q 56 16 60 16 Q 63 18 62 22 Z" />
      {/* Right arm — thrown up high */}
      <path d="M 110 58 L 122 48 L 132 36 L 138 26 Q 140 22 137 20 Q 134 22 135 28 L 130 38 L 120 50 L 112 60 Z" />
      {/* Right hand */}
      <path d="M 138 26 L 142 20 Q 144 16 140 16 Q 137 18 138 22 Z" />
      {/* Left leg — dynamic landing / split stance */}
      <path d="M 90 96 L 74 108 L 60 124 L 50 142 L 44 158 Q 42 164 46 166 L 54 166 Q 56 164 52 162 L 48 162 L 54 146 L 64 128 L 78 112 L 92 100 Z" />
      {/* Left foot */}
      <path d="M 46 166 L 40 168 Q 36 170 38 166 L 44 164 Z" />
      {/* Right leg — explosive push off */}
      <path d="M 110 96 L 124 108 L 136 124 L 146 142 L 152 158 Q 154 164 150 166 L 142 166 Q 140 164 144 162 L 148 162 L 142 146 L 132 128 L 120 112 L 108 100 Z" />
      {/* Right foot */}
      <path d="M 150 166 L 156 168 Q 160 170 158 166 L 152 164 Z" />
    </svg>
  )
}

// ============================================================
// Sport Silhouette Mapper
// ============================================================

const silhouetteMap: Record<string, React.FC<SilhouetteProps>> = {
  bjj: BJJSilhouette,
  brazilian_jiu_jitsu: BJJSilhouette,
  jiu_jitsu: BJJSilhouette,
  wrestling: WrestlingSilhouette,
  boxing: BoxingSilhouette,
  mma: MMASilhouette,
  muay_thai: MuayThaiSilhouette,
  judo: JudoSilhouette,
  kickboxing: KickboxingSilhouette,
  karate: KarateSilhouette,
  taekwondo: TaekwondoSilhouette,
  default: GeneralFitnessSilhouette,
}

export function SportSilhouette({ sport, ...props }: { sport: string } & SilhouetteProps) {
  const normalized = sport.toLowerCase().replace(/[\s-]/g, '_')
  const Component = silhouetteMap[normalized] || silhouetteMap.default
  return <Component {...props} />
}
