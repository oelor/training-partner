// Combat sports athlete silhouettes for decorative backgrounds
// Each component renders a simple SVG silhouette in a recognizable combat sports pose

export function WrestlerSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Wrestler shooting a low single leg takedown */}
      <path d="
        M 95 45 Q 100 35 108 38 Q 115 41 112 50 Q 110 55 105 58
        L 100 62 L 95 70 L 88 80
        L 75 88 L 60 95
        L 48 100 L 40 105
        Q 35 108 38 112 L 42 110
        L 55 105 L 65 100
        L 72 98 L 68 115
        L 62 135 L 58 150
        Q 56 155 60 157 Q 64 155 65 150
        L 70 135 L 78 118
        L 85 105 L 95 95
        L 105 88 L 118 82
        L 135 78 L 150 80
        L 160 85 Q 165 88 162 93
        L 155 95 L 145 92
        L 130 88 L 118 90
        L 108 95 L 100 105
        L 95 120 L 92 140
        L 90 155 Q 88 160 92 162 Q 96 160 95 155
        L 97 140 L 100 125
        L 105 110 L 110 100
        Z
      " />
      {/* Lead hand reaching forward */}
      <path d="
        M 40 105 L 32 108 L 25 112 Q 20 115 22 118 Q 26 116 30 112
        L 38 108 Z
      " />
    </svg>
  )
}

export function BJJGuardSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Person on back in open guard — legs up, torso on ground */}
      {/* Head */}
      <ellipse cx="45" cy="120" rx="12" ry="10" />
      {/* Torso lying flat */}
      <path d="
        M 55 110 L 110 100 L 112 115 L 55 128 Z
      " />
      {/* Near arm on ground */}
      <path d="
        M 60 128 L 50 140 L 40 150 Q 36 154 40 156 Q 44 154 46 150
        L 55 138 L 62 130 Z
      " />
      {/* Far arm framing */}
      <path d="
        M 75 100 L 65 88 L 58 78 Q 55 74 58 72 Q 62 74 64 78
        L 72 90 L 78 100 Z
      " />
      {/* Near leg up in guard */}
      <path d="
        M 110 108 L 125 90 L 140 70 L 148 60
        Q 152 55 155 58 L 150 68
        L 138 82 L 125 98 L 115 112 Z
      " />
      {/* Far leg up and hooking */}
      <path d="
        M 108 100 L 130 78 L 148 65 L 160 55
        Q 165 50 168 54 L 162 62
        L 148 75 L 132 90 L 115 105 Z
      " />
      {/* Near foot */}
      <path d="
        M 148 55 L 155 50 L 162 48 Q 166 47 165 52 L 158 54 L 150 58 Z
      " />
      {/* Far foot */}
      <path d="
        M 160 50 L 168 46 L 175 44 Q 178 43 177 48 L 170 50 L 162 55 Z
      " />
    </svg>
  )
}

export function MuayThaiKickSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Fighter throwing a roundhouse kick */}
      {/* Head */}
      <ellipse cx="85" cy="38" rx="11" ry="13" />
      {/* Neck */}
      <path d="M 80 50 L 90 50 L 92 58 L 78 58 Z" />
      {/* Torso leaning back */}
      <path d="
        M 78 58 L 92 58
        L 98 75 L 100 95
        L 95 100 L 72 100
        L 68 95 L 72 75 Z
      " />
      {/* Left arm (guard up) */}
      <path d="
        M 72 62 L 60 55 L 55 48 L 52 42
        Q 50 38 53 37 Q 56 39 56 44
        L 58 50 L 65 58 Z
      " />
      {/* Right arm (guard) */}
      <path d="
        M 92 62 L 98 55 L 100 48 Q 101 44 104 45 Q 105 48 103 52
        L 100 58 L 95 65 Z
      " />
      {/* Standing leg */}
      <path d="
        M 78 100 L 72 120 L 68 140 L 65 155 L 62 168
        Q 60 174 56 175 L 50 176 Q 46 177 46 173 Q 48 172 52 172
        L 56 170 L 58 165 L 62 150 L 66 135 L 72 115 L 76 100 Z
      " />
      {/* Kicking leg — extended roundhouse */}
      <path d="
        M 95 100 L 110 95 L 130 88 L 150 82 L 165 78 L 175 76
        Q 180 75 180 79 Q 178 82 172 82
        L 155 85 L 135 92 L 115 100 L 100 108
        L 95 105 Z
      " />
      {/* Kicking foot */}
      <path d="
        M 175 76 L 182 74 L 188 73 Q 192 72 191 76 Q 188 78 184 78
        L 178 79 Z
      " />
    </svg>
  )
}

export function BoxerSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Boxer in orthodox stance with guard up */}
      {/* Head */}
      <ellipse cx="105" cy="40" rx="12" ry="14" />
      {/* Neck */}
      <path d="M 100 53 L 110 53 L 112 60 L 98 60 Z" />
      {/* Torso — slight angle */}
      <path d="
        M 95 60 L 115 60
        L 118 78 L 120 100
        L 115 108 L 92 108
        L 88 100 L 90 78 Z
      " />
      {/* Lead arm (jab position — left arm extended slightly) */}
      <path d="
        M 92 65 L 78 60 L 65 55 L 55 52
        Q 50 50 48 53 Q 50 56 55 56
        L 65 58 L 78 62 L 90 68 Z
      " />
      {/* Lead glove */}
      <ellipse cx="48" cy="53" rx="7" ry="6" />
      {/* Rear arm (guard up by chin) */}
      <path d="
        M 115 65 L 120 58 L 118 50 L 115 45
        Q 114 42 117 42 Q 120 44 120 48
        L 122 55 L 120 62 Z
      " />
      {/* Rear glove by chin */}
      <ellipse cx="117" cy="42" rx="6" ry="5" />
      {/* Lead leg (front) */}
      <path d="
        M 95 108 L 90 125 L 85 145 L 82 160 L 80 172
        Q 78 178 82 180 L 90 180 Q 92 178 88 176
        L 84 176 L 85 168 L 88 155 L 92 138 L 97 120 L 98 108 Z
      " />
      {/* Rear leg */}
      <path d="
        M 112 108 L 118 125 L 122 142 L 125 158 L 126 172
        Q 127 178 123 180 L 116 180 Q 114 178 118 176
        L 122 176 L 122 168 L 120 155 L 116 138 L 112 122 L 108 108 Z
      " />
    </svg>
  )
}

export function JudoThrowSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Two figures — tori executing hip throw (ogoshi), uke being thrown */}
      {/* TORI (thrower) — bent at hips, rotating */}
      {/* Tori head */}
      <ellipse cx="80" cy="55" rx="10" ry="12" />
      {/* Tori torso bent forward */}
      <path d="
        M 75 66 L 85 66
        L 95 80 L 100 95
        L 95 100 L 78 100
        L 72 95 L 70 80 Z
      " />
      {/* Tori arm gripping uke */}
      <path d="
        M 85 70 L 100 62 L 115 55 L 120 52
        Q 124 50 125 54 L 120 58 L 108 65 L 92 75 Z
      " />
      {/* Tori other arm wrapping uke's waist */}
      <path d="
        M 95 85 L 110 78 L 122 72 L 130 70
        Q 134 69 134 73 L 128 75 L 115 82 L 100 90 Z
      " />
      {/* Tori legs — wide stance */}
      <path d="
        M 78 100 L 68 118 L 58 140 L 52 158
        Q 50 164 54 166 L 60 166 Q 62 164 58 162
        L 56 160 L 62 142 L 72 122 L 80 105 Z
      " />
      <path d="
        M 92 100 L 98 118 L 105 135 L 108 150
        Q 109 156 105 158 L 100 158 Q 98 156 102 154
        L 104 152 L 100 138 L 94 120 L 88 105 Z
      " />

      {/* UKE (being thrown) — airborne, inverted */}
      {/* Uke head (upside down, being thrown over) */}
      <ellipse cx="138" cy="48" rx="9" ry="11" />
      {/* Uke torso — arcing over */}
      <path d="
        M 130 55 L 142 58
        L 148 72 L 145 88
        L 138 92 L 125 88
        L 122 72 Z
      " />
      {/* Uke legs flying up */}
      <path d="
        M 140 92 L 152 105 L 162 118 L 168 128
        Q 170 132 166 134 Q 163 132 165 128
        L 158 118 L 148 105 L 138 95 Z
      " />
      <path d="
        M 130 88 L 140 100 L 148 112 L 155 125
        Q 157 130 153 131 Q 150 128 152 124
        L 145 112 L 136 100 L 128 92 Z
      " />
    </svg>
  )
}

export function MMAFighterSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* MMA fighter in wide fighting stance / slight sprawl ready position */}
      {/* Head */}
      <ellipse cx="100" cy="38" rx="12" ry="14" />
      {/* Neck */}
      <path d="M 95 51 L 105 51 L 107 58 L 93 58 Z" />
      {/* Torso — athletic crouch */}
      <path d="
        M 90 58 L 110 58
        L 115 75 L 118 95
        L 112 105 L 88 105
        L 82 95 L 85 75 Z
      " />
      {/* Left arm — reaching forward, MMA glove */}
      <path d="
        M 88 65 L 72 58 L 58 52 L 48 48
        Q 44 46 42 49 Q 44 52 48 52
        L 58 55 L 72 62 L 86 70 Z
      " />
      {/* Left glove */}
      <path d="
        M 42 49 Q 38 47 36 50 Q 38 54 42 53 L 46 51 Z
      " />
      {/* Right arm — guard up */}
      <path d="
        M 112 65 L 122 58 L 128 50 L 130 44
        Q 131 40 134 42 Q 134 46 132 50
        L 126 60 L 118 68 Z
      " />
      {/* Right glove */}
      <path d="
        M 130 40 Q 132 36 136 38 Q 136 42 133 44 L 130 44 Z
      " />
      {/* Left leg — wide stance */}
      <path d="
        M 88 105 L 72 115 L 58 130 L 48 148 L 42 165
        Q 40 170 44 172 L 52 172 Q 54 170 50 168
        L 46 168 L 52 152 L 62 135 L 75 120 L 90 108 Z
      " />
      {/* Left foot */}
      <path d="
        M 44 172 L 38 174 Q 34 176 36 172 L 42 170 Z
      " />
      {/* Right leg — wide stance */}
      <path d="
        M 112 105 L 128 115 L 142 130 L 152 148 L 158 165
        Q 160 170 156 172 L 148 172 Q 146 170 150 168
        L 154 168 L 148 152 L 138 135 L 125 120 L 110 108 Z
      " />
      {/* Right foot */}
      <path d="
        M 156 172 L 162 174 Q 166 176 164 172 L 158 170 Z
      " />
    </svg>
  )
}
