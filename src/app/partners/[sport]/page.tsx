import { Metadata } from 'next'
import Link from 'next/link'
import { Users, MapPin, ArrowRight, Shield, Star, Zap, CheckCircle } from 'lucide-react'

const sports: Record<string, { name: string; description: string; benefits: string[] }> = {
  wrestling: {
    name: 'Wrestling',
    description: 'Find wrestling training partners near you. Whether you practice freestyle, Greco-Roman, or folkstyle, connect with grapplers at your skill level.',
    benefits: ['Drill takedowns and scrambles', 'Prepare for tournaments', 'Find live wrestling partners'],
  },
  mma: {
    name: 'MMA',
    description: 'Connect with MMA training partners in your area. Find sparring partners, drilling partners, and fighters preparing for competition.',
    benefits: ['Full sparring partners', 'Striking and grappling drills', 'Fight camp preparation'],
  },
  bjj: {
    name: 'BJJ',
    description: 'Find Brazilian Jiu-Jitsu training partners near you. Roll with practitioners at your belt level and improve your ground game.',
    benefits: ['Rolling partners at your level', 'Drill submissions and sweeps', 'Competition preparation'],
  },
  boxing: {
    name: 'Boxing',
    description: 'Find boxing sparring partners and training partners in your city. From beginners to competitive fighters.',
    benefits: ['Sparring at your level', 'Pad work partners', 'Conditioning drills'],
  },
  kickboxing: {
    name: 'Kickboxing',
    description: 'Connect with kickboxing training partners. Find sparring partners for Dutch style, K-1, or Muay Thai kickboxing.',
    benefits: ['Technical sparring', 'Pad and bag work partners', 'Cardio kickboxing groups'],
  },
  'muay-thai': {
    name: 'Muay Thai',
    description: 'Find Muay Thai training partners near you. Practice clinch work, elbows, knees, and full Thai boxing sparring.',
    benefits: ['Clinch work partners', 'Pad holders', 'Technical sparring'],
  },
  judo: {
    name: 'Judo',
    description: 'Connect with Judo training partners in your area. Find uchikomi partners, randori partners, and competition prep partners.',
    benefits: ['Randori partners', 'Uchikomi drilling', 'Competition preparation'],
  },
  karate: {
    name: 'Karate',
    description: 'Find Karate training partners near you. Whether Shotokan, Kyokushin, or sport karate, connect with martial artists at your level.',
    benefits: ['Kumite sparring', 'Kata practice partners', 'Point fighting prep'],
  },
  sambo: {
    name: 'Sambo',
    description: 'Find Sambo training partners. Connect with Combat Sambo and Sport Sambo practitioners for grappling and submission work.',
    benefits: ['Throws and takedowns', 'Leg lock drilling', 'Combat sambo sparring'],
  },
}

interface SportContent {
  extendedDescription: string[]
  checklist: string[]
  intensityLevels: {
    light: string
    moderate: string
    hard: string
  }
}

const SPORT_CONTENT: Record<string, SportContent> = {
  wrestling: {
    extendedDescription: [
      'Wrestling is one of the most physically demanding combat sports, and the quality of your training partners directly determines how fast you improve. Unlike striking arts where you can develop timing on a bag, wrestling requires a resisting body in front of you. You need someone to shoot on, someone who sprawls back, someone who chains off your first attack into a second and third. A drilling partner who moves at the right pace lets you build muscle memory for setups, finishes, and chain wrestling sequences that fall apart when practiced solo.',
      'When looking for a wrestling training partner, weight class matters more than in most other sports. A 30-pound weight difference changes the physics of every exchange — underhooks that work against someone your size become useless against a much heavier opponent. Beyond weight, consider what style you train. Folkstyle wrestlers prioritize riding and turns on the mat, freestyle wrestlers need partners comfortable with exposure throws and gut wrenches, and Greco-Roman wrestlers need someone willing to work pummeling, body locks, and upper-body throws without leg attacks.',
      'Safety in wrestling comes down to communication and ego management. Agree on intensity before live goes — whether you are doing flow wrestling, situational work from a specific position, or full live scrambles. Knee and shoulder injuries are the most common in wrestling, so partners should know how to recognize when someone is caught in a bad position and release pressure rather than crank through.',
    ],
    checklist: [
      'Within 15 lbs of your weight class for live wrestling',
      'Trains the same style (folkstyle, freestyle, or Greco-Roman)',
      'Willing to alternate drilling pace — slow reps before full speed',
      'Communicates about injury history and current limitations',
      'Has competition experience at a similar level to yours',
    ],
    intensityLevels: {
      light: 'Chain wrestling at 30-40% resistance. Your partner gives you the first shot and provides light re-attacks. Focus on movement patterns and positioning without fighting for underhooks or sprawling hard. Good for technique days and recovery sessions.',
      moderate: 'Situational wrestling from specific positions — top/bottom on the mat, neutral tie-ups, or front headlock series. Your partner resists at 60-70% and counters your attempts, but does not initiate heavy attacks. Both wrestlers work to improve position without going all-out.',
      hard: 'Full live wrestling rounds, typically 6-minute periods or timed goes. Both partners compete at match intensity. This should only happen with trusted partners who respect tap-outs and know when to let go of a submission or crank.',
    },
  },
  bjj: {
    extendedDescription: [
      'Brazilian Jiu-Jitsu progress is almost entirely built through rolling with other people. Unlike sports where you can improve solo with drills or bag work, BJJ demands a training partner for every meaningful repetition. Whether you are working guard retention, passing sequences, or submission chains, you need a body that reacts, adjusts, and creates the unpredictable pressure that makes techniques work in live training. The right training partner can accelerate your progress by months.',
      'Choosing a BJJ training partner starts with identifying what you need. Belt level is the obvious filter, but training style matters just as much. Some white belts roll with intensity that makes them dangerous, while some purple belts prefer slow, technical exchanges that are perfect for learning. Consider whether you want a gi or no-gi partner — the grips and guard games are different enough that you may want dedicated partners for each. Positional sparring partners (someone who starts in your guard and works to pass, or vice versa) are more valuable than people who only want to do full competition rolls.',
      'Safety in BJJ revolves around ego and submission awareness. Tap early, tap often — this is not just a cliche, it is how you train for decades without wrecked joints. Avoid partners who hold submissions after the tap, crank neck cranks without control, or slam out of triangles. Good training partners apply submissions slowly enough that you have time to defend or tap, and they release immediately when you do.',
    ],
    checklist: [
      'Within one belt level of you for competitive rolls',
      'Specifies gi, no-gi, or both — and has appropriate gear',
      'Open to positional sparring, not just full rolls every session',
      'Respects the tap immediately with zero hesitation',
      'Willing to discuss what they are working on before rolling',
    ],
    intensityLevels: {
      light: 'Flow rolling at 30% effort. No submissions applied with force — you tap to position, not pressure. Focus on movement, transitions, and trying new techniques without worrying about getting swept or submitted. Great for recovery days and skill exploration.',
      moderate: 'Technical sparring at 60-70%. You work your A-game positions but give your partner space to work escapes. Submissions are applied with control and released at the first tap. Both partners try to improve position but are not competing to "win" the roll.',
      hard: 'Competition-pace rolling. Full resistance, fast transitions, and applied submissions. Reserve this for training partners you trust completely and for specific competition prep blocks. Even at full intensity, heel hooks and spinal locks should be applied with control.',
    },
  },
  mma: {
    extendedDescription: [
      'Mixed martial arts training is uniquely complex because you need partners across multiple disciplines. A great MMA training partner might work striking with you on Monday, takedown defense on Wednesday, and cage grappling on Friday. Finding someone who matches your skill gaps and preferred training schedule is harder than in a single-discipline sport, but the payoff is enormous. The best MMA training partners push you in the areas where you are weakest, not just the ones where you are comfortable.',
      'When searching for an MMA training partner, be specific about what you need. A partner for technical striking rounds is different from a partner for full MMA sparring with takedowns. Consider whether you want cage work (which requires a cage or wall) or open-mat MMA. Discuss round length and rules upfront — some partners are fine with elbows on the ground, others are not. If you are preparing for a fight, you need someone who can mimic your opponent\'s style, which means finding partners with specific skill sets rather than generic "MMA" ability.',
      'Safety in MMA sparring is about layering intensity correctly. Hard sparring in MMA — where strikes, takedowns, and ground-and-pound are all live — carries the highest injury risk of any combat sport. Smart MMA partners separate their training: hard striking days with light grappling, hard grappling days with light striking, and only combine full intensity sparring for specific fight camp rounds with headgear, shin guards, and a coach watching.',
    ],
    checklist: [
      'Specifies preferred training focus: striking, grappling, or full MMA',
      'Owns appropriate gear: MMA gloves, shin guards, mouthguard, cup',
      'Comfortable discussing round rules and intensity before each session',
      'Has enough grappling base to be safe during scrambles and transitions',
      'Matches your weight within 20 lbs for full sparring',
    ],
    intensityLevels: {
      light: 'Technical MMA rounds with 20-30% power on strikes. Takedowns are entry only — you shoot and touch the hips, but do not finish the blast double. On the ground, work for position without ground-and-pound. Great for integrating different skill sets and working on transitions.',
      moderate: 'Controlled sparring at 50-60%. Strikes land with moderate contact, takedowns are completed but not slammed, and ground-and-pound is positional with light shots. This is where most of your MMA sparring should live — hard enough to pressure-test techniques, light enough to train again tomorrow.',
      hard: 'Fight simulation rounds at near-competition intensity. This means real takedowns, real ground-and-pound, and hard exchanges on the feet. Full protective gear is mandatory. Limit hard MMA sparring to once a week maximum, ideally with a coach present to stop rounds if needed.',
    },
  },
  boxing: {
    extendedDescription: [
      'Boxing sparring is where you learn to fight, and the quality of your sparring partners shapes your entire development as a boxer. Hitting pads and heavy bags builds your mechanics, but only a live partner teaches you distance management, timing, and how to deal with getting hit. The problem is that bad sparring partners can ruin your development — or worse, give you a concussion. Finding someone who controls their power, matches your rhythm, and pushes you without trying to hurt you is the single most important thing you can do for your boxing.',
      'Weight matching is critical in boxing. Even a 10-pound difference changes how punches land and how effectively you can work inside. Beyond weight, look for partners who match your experience level. Sparring someone far above your level teaches you survival, but sparring someone at your level teaches you how to win exchanges. Ideally, you want both types of partners. Equipment matters too — both partners should have quality gloves (14-16 oz for sparring), headgear if either person wants it, and mouthguards are non-negotiable.',
      'Boxing carries a real concussion risk, so partner selection is a safety issue. Avoid sparring with people who have no power control, who escalate when they get tagged, or who throw full-power shots to the head. Good boxing sparring partners work the body, set up combinations to the guard, and only go to the head with measured shots. If someone consistently rocks you during what was supposed to be a technical round, stop sparring with them.',
    ],
    checklist: [
      'Within 10 lbs of your weight for sparring rounds',
      'Owns proper sparring gloves (14-16 oz) and mouthguard',
      'Demonstrates power control — can throw fast without throwing hard',
      'Does not escalate intensity when caught with a clean shot',
      'Open to body sparring, technical rounds, and controlled head sparring',
    ],
    intensityLevels: {
      light: 'Touch sparring with 20-30% power. Focus on timing, distance, and shot selection. Punches land but do not push your partner back. No headhunting — work the body and practice combinations to the guard. This is where you build ring IQ without accumulating damage.',
      moderate: 'Controlled sparring at 50-60%. Shots land with enough pop to feel but not enough to hurt. Both fighters work their jab, set up power shots, and move defensively. Body shots can be firmer than head shots. This is bread-and-butter sparring for most training camps.',
      hard: 'Competition-intensity rounds at 80-90%. Both boxers fight to win the round. This should be limited to fight camp preparation and done with full gear, a timer, and ideally a coach to stop the action. Even in hard sparring, rabbit punches and intentional headbutts are never acceptable.',
    },
  },
  kickboxing: {
    extendedDescription: [
      'Kickboxing sparring requires partners who understand the specific ruleset you train under, because the differences between styles change everything. K-1 rules allow knees in the clinch but limit clinch time. Dutch-style kickboxing emphasizes heavy low kicks and aggressive boxing combinations. Glory-style kickboxing rewards volume and technical striking over single power shots. If your training partner comes from a different ruleset background, you will spend half your rounds negotiating what is and is not allowed instead of actually improving.',
      'Finding a kickboxing partner means considering both striking and kicking ability. Many kickboxers come from a boxing background and have weak leg kicks, while others come from a taekwondo background and struggle in the pocket. The best training partnership is one where both athletes challenge each other\'s weaknesses. If you need to improve your leg kick checking, find a partner who throws good leg kicks. If you need to sharpen your boxing inside the clinch, find someone comfortable in close range.',
      'Leg kicks are the most common source of injury in kickboxing training, and shin-on-shin contact is painful even with shin guards. Good kickboxing training partners check kicks with the correct part of the shin, throw leg kicks to the thigh rather than the knee, and wear quality shin guards for sparring. Discuss whether you are training with or without head kicks, whether spinning techniques are allowed, and how hard body kicks should land.',
    ],
    checklist: [
      'Trains the same ruleset: K-1, Dutch, Glory, or general kickboxing',
      'Owns quality shin guards, sparring gloves, and mouthguard',
      'Throws leg kicks to the thigh, not the knee or calf (in sparring)',
      'Comfortable with both boxing range and kicking range exchanges',
      'Communicates about intensity before rounds begin',
    ],
    intensityLevels: {
      light: 'Technical sparring at 25-30%. Kicks are thrown with speed but land gently. Focus on combinations, footwork, and reading your partner\'s setups. No hard low kicks or power body kicks. Great for working on timing entries and practicing new combinations.',
      moderate: 'Controlled sparring at 50-65%. Body kicks and leg kicks land with moderate force. Head strikes are lighter than body strikes. Both partners work combinations and counters actively. Shin guards and gloves (14-16 oz) are standard. This is the intensity for most regular training sessions.',
      hard: 'Full-contact rounds simulating competition. Leg kicks land hard, body kicks have real power, and head kicks are live. Full protective gear including headgear is recommended. Hard kickboxing sparring should be infrequent and supervised, especially when head kicks are involved.',
    },
  },
  'muay-thai': {
    extendedDescription: [
      'Muay Thai is the art of eight limbs, and training it requires a partner who is comfortable with the full range of weapons: punches, kicks, elbows, knees, and clinch work. The clinch alone is almost a separate martial art — Muay Thai clinch fighting involves neck wrestling, off-balancing, sweeps, and devastating close-range knees that simply cannot be practiced solo or on a bag. If you are serious about Muay Thai, your training partner\'s clinch ability is as important as their striking.',
      'When choosing a Muay Thai training partner, consider whether you train in a traditional Thai style or a Dutch style. Traditional Thai Muay Thai emphasizes patience, counter-striking, and heavy kicks, while Dutch Muay Thai is more boxing-heavy with aggressive combinations and forward pressure. Training with someone from a different style can be productive, but you should both understand the difference. Also clarify whether elbows are included in your sparring — many gyms and partners exclude elbows from regular sparring due to the high cut risk.',
      'Muay Thai clinch sparring is where most injuries happen outside of competition. Knees to the body can crack ribs if uncontrolled, and neck wrestling puts serious strain on the cervical spine. Good clinch partners apply knees with control, do not yank the neck violently, and know how to dump someone from the clinch without spiking them on their head. If your partner treats the clinch like a strength contest rather than a technical exchange, find a different partner.',
    ],
    checklist: [
      'Comfortable with clinch work, not just striking at range',
      'Clear on elbow rules: included, excluded, or elbows with shin guards only',
      'Trains a compatible style (Thai, Dutch, or general Muay Thai)',
      'Throws teeps and body kicks with control, not just raw power',
      'Understands sweep mechanics and does not resist dumps dangerously',
    ],
    intensityLevels: {
      light: 'Playful Thai sparring at 20-30%. Long-range teeps and light round kicks. Clinch work is about positioning and pummeling, not knees. Focus on reading feints, timing kicks off the jab, and practicing your rhythm. This is where you develop fight IQ and smooth technique.',
      moderate: 'Controlled sparring at 50-60%. Body kicks land with moderate power, knees in the clinch are measured, and punches are technical. Elbows are typically excluded at this intensity. Shin guards are mandatory. Both partners work on combinations and defensive counters.',
      hard: 'Full Muay Thai rounds at competition pace. All weapons are live including clinch knees and possibly elbows (with appropriate gear). This is fight camp sparring — exhausting, realistic, and risky. Reserve for experienced partners only, and limit hard clinch rounds to prevent neck injuries.',
    },
  },
  judo: {
    extendedDescription: [
      'Judo is built around randori — live throwing practice — and the quality of your randori partners determines how quickly you develop as a judoka. Unlike sports where you can drill solo, every judo throw requires a partner who provides realistic grips, movement, and resistance. An uchikomi partner who feeds you the right angle and rhythm helps you perfect your entries, while a good randori partner forces you to set up throws against genuine defensive movement. Finding partners who balance these two needs is essential.',
      'Weight categories matter enormously in judo. The leverage dynamics of judo throws change dramatically across weight classes — techniques that work beautifully against someone your size can be physically impossible against someone 30 kilos heavier. For randori, try to find partners within one weight category of your own. For uchikomi drilling, weight differences are less critical since you are not completing the throw. Also consider your partner\'s grip fighting style: some judoka are very grip-dominant and will shut down your offense if you are not used to hand fighting at that level.',
      'Judo injuries most commonly occur during throws — specifically when uke (the person being thrown) lands incorrectly or resists a throw in a dangerous way. Good judo training partners know how to take ukemi (breakfalls) safely, do not stiff-arm to resist throws (which risks elbow injuries), and understand when to go with a throw rather than fight it at the expense of their joints. In ne-waza (ground work), partners should tap early to chokes and armlocks rather than trying to muscle out of tight positions.',
    ],
    checklist: [
      'Within one weight category for randori',
      'Practices clean ukemi and does not stiff-arm throws dangerously',
      'Willing to do focused uchikomi drilling, not just randori every session',
      'Understands grip fighting etiquette and does not death-grip the lapel',
      'Has a compatible training schedule for consistent practice',
    ],
    intensityLevels: {
      light: 'Moving uchikomi and light randori at 30-40%. Your partner gives you entries and lets you feel the throw without full resistance. On the ground, you work escapes and turnovers at a relaxed pace. This is for building technique, not testing it.',
      moderate: 'Competitive randori at 60-70%. Both judoka fight for grips and attempt throws with real intent, but you are not trying to score ippon every exchange. Failed throw attempts are followed up with transitions rather than muscled corrections. Ground work is active but controlled.',
      hard: 'Full-intensity randori simulating shiai (competition). Grip fighting is aggressive, throws are committed, and ne-waza transitions are explosive. This is where you pressure-test your judo, but it should be done with partners who have solid ukemi and a coach who can monitor for dangerous situations.',
    },
  },
  karate: {
    extendedDescription: [
      'Karate encompasses a wide range of styles, and finding the right training partner depends heavily on which branch of karate you practice. A Kyokushin karateka looking for full-contact body sparring has completely different needs than a WKF sport karate competitor training point fighting. Shotokan practitioners may want a partner for kihon and kata bunkai, while Goju-Ryu stylists might prioritize close-range fighting and takedown defense. Being specific about your style and training goals is the first step to finding a compatible partner.',
      'For point fighting (WKF rules), you need a partner who understands the scoring system and can simulate competitive timing — fast in-and-out attacks, controlled distance, and the ability to throw techniques that score without excessive contact. For full-contact karate (Kyokushin, Ashihara, Enshin), you need someone comfortable absorbing and delivering body kicks and low kicks at real power. These are fundamentally different skill sets, and training with the wrong type of partner wastes both people\'s time.',
      'Safety considerations vary by karate style. In point fighting, the main risk is accidental excessive contact, especially to the face — partners should have reliable distance control and be able to pull techniques. In full-contact styles, the risks are similar to kickboxing: leg kick injuries, body shot impacts, and occasional head kick knockdowns (in styles that allow head kicks). Always wear the protective equipment your style requires, and agree on which techniques are included before you start.',
    ],
    checklist: [
      'Trains the same style or a compatible one (Shotokan, Kyokushin, WKF, etc.)',
      'Understands the relevant competition ruleset and scoring',
      'Has appropriate protective equipment for your style of sparring',
      'Can control distance and pulling power in point fighting',
      'Interested in both kata/kihon drilling and kumite practice',
    ],
    intensityLevels: {
      light: 'Controlled kumite at 20-30%. In point fighting, this means working entries and exits at reduced speed. In full-contact styles, body contact is light and you focus on technique selection and timing. Kata bunkai practice with a partner at slow speed also falls in this category.',
      moderate: 'Active sparring at 50-65%. Point fighters work at near-competition speed with controlled contact. Full-contact karatekas exchange body kicks and low kicks at medium power. Both partners actively attack and defend. Protective gear appropriate to your style is worn.',
      hard: 'Competition simulation at full speed and power (within your style\'s rules). Point fighters work timed rounds with a referee or coach calling points. Full-contact fighters spar at match intensity with full body contact. Head protection is recommended for styles that allow head strikes.',
    },
  },
  sambo: {
    extendedDescription: [
      'Sambo is one of the most technically complete grappling arts, blending judo-style throws with wrestling takedowns and a submissions game that includes the leg locks most other grappling arts restrict. Finding a Sambo training partner can be challenging simply because the sport is less widely practiced than BJJ or wrestling in most Western countries. This makes each training partner you find more valuable — and makes it more important to clearly communicate what type of Sambo training you want.',
      'The first question when finding a Sambo partner is whether you train Sport Sambo or Combat Sambo, because they are practically different sports. Sport Sambo is jacket wrestling with throws, pins, and leg locks but no chokes. Combat Sambo adds strikes, chokes, and ground-and-pound, making it closer to MMA in a jacket. Your training partner needs to know which version you practice, and ideally they train the same one. For Sport Sambo, a partner with a judo or wrestling background adapts quickly. For Combat Sambo, you need someone comfortable with both grappling and striking.',
      'Safety in Sambo training centers on two areas: throws and leg locks. Sambo throws are often explosive and involve lifting your partner, so good ukemi (falling skills) are essential — if your partner cannot breakfall safely, hard randori will injure them. Leg locks, especially knee bars and heel hooks, are a core part of Sambo\'s submission game, and they require careful, controlled application. Partners should apply leg locks with slow, steady pressure and release immediately on the tap. Never train leg locks with someone who cranks fast.',
    ],
    checklist: [
      'Specifies Sport Sambo or Combat Sambo preference',
      'Has a kurtka (sambo jacket) and sambo shoes, or is willing to get them',
      'Comfortable with leg lock exchanges and knows when to tap',
      'Has a throwing base — judo, wrestling, or sambo background',
      'Willing to train both standing and ground phases each session',
    ],
    intensityLevels: {
      light: 'Technical drilling at 30% resistance. Practice throw entries with your partner providing movement but not real defensive grips. On the ground, work leg lock entries and escapes at a slow pace with no cranking. Good for learning new techniques from your coach or video study.',
      moderate: 'Active randori at 60-70%. Standing exchanges involve real grip fighting and committed throw attempts, but neither partner is slamming. Ground work includes leg lock attacks with controlled pressure. Both partners work transitions between standing and ground phases.',
      hard: 'Competition-intensity rounds. Throws are explosive, grip fighting is aggressive, and leg locks are applied with real intent (but still controlled). For Combat Sambo, this includes strikes on the ground and standing. Full protective gear required for Combat Sambo hard rounds.',
    },
  },
}

const popularCities = [
  'new-york', 'los-angeles', 'chicago', 'houston', 'phoenix',
  'san-antonio', 'san-diego', 'dallas', 'san-francisco', 'austin',
  'miami', 'denver', 'seattle', 'portland', 'las-vegas',
  'atlanta', 'boston', 'philadelphia', 'san-jose', 'nashville',
]

function citySlugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateStaticParams() {
  return Object.keys(sports).map(sport => ({ sport }))
}

export async function generateMetadata({ params }: { params: Promise<{ sport: string }> }): Promise<Metadata> {
  const { sport } = await params
  const info = sports[sport]
  if (!info) return { title: 'Training Partners | Training Partner' }

  return {
    title: `Find ${info.name} Training Partners | Training Partner`,
    description: info.description,
    alternates: {
      canonical: `https://trainingpartner.app/partners/${sport}`,
    },
    openGraph: {
      title: `Find ${info.name} Training Partners Near You`,
      description: info.description,
      type: 'website',
    },
  }
}

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params
  const info = sports[sport]
  const content = SPORT_CONTENT[sport]

  const jsonLd = info ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Find ${info.name} Training Partners`,
    description: info.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'}/partners/${sport}`,
    isPartOf: { '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trainingpartner.app'}/#website` },
    about: {
      '@type': 'SportsOrganization',
      name: `${info.name} Training Partners`,
      sport: info.name,
    },
  } : null

  if (!info) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white mb-4">SPORT NOT FOUND</h1>
          <Link href="/" className="text-primary hover:underline">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Hero */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl text-white">TRAINING PARTNER</span>
          </Link>
          <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Sign Up Free
          </Link>
        </div>
      </header>

      <main>
        <section className="py-16 lg:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-4xl lg:text-6xl text-white mb-6">
              FIND {info.name.toUpperCase()} TRAINING PARTNERS
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              {info.description}
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-6 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">WHY USE TRAINING PARTNER FOR {info.name.toUpperCase()}?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {info.benefits.map((benefit, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {i === 0 ? <Shield className="w-6 h-6 text-primary" /> : i === 1 ? <Star className="w-6 h-6 text-primary" /> : <Zap className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-white font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extended Sport Content */}
        {content && (
          <>
            <section className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading text-2xl text-white mb-8">
                  FINDING THE RIGHT {info.name.toUpperCase()} TRAINING PARTNER
                </h2>
                <div className="space-y-4">
                  {content.extendedDescription.map((paragraph, i) => (
                    <p key={i} className="text-text-secondary leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16 px-6 bg-surface border-y border-border">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading text-2xl text-white mb-8">
                  WHAT TO LOOK FOR IN A {info.name.toUpperCase()} PARTNER
                </h2>
                <ul className="space-y-4">
                  {content.checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="font-heading text-2xl text-white mb-8">
                  {info.name.toUpperCase()} TRAINING INTENSITY LEVELS
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="font-heading text-lg text-white mb-3">LIGHT</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {content.intensityLevels.light}
                    </p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="font-heading text-lg text-white mb-3">MODERATE</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {content.intensityLevels.moderate}
                    </p>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="font-heading text-lg text-white mb-3">HARD</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {content.intensityLevels.hard}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* City Links */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl text-white mb-8 text-center">
              FIND {info.name.toUpperCase()} PARTNERS BY CITY
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularCities.map(city => (
                <Link
                  key={city}
                  href={`/partners/${sport}/${city}`}
                  className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-3 text-text-secondary hover:text-white hover:border-primary transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  {citySlugToName(city)}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/10 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl text-white mb-4">READY TO FIND YOUR NEXT TRAINING PARTNER?</h2>
            <p className="text-text-secondary mb-8">
              Join thousands of {info.name.toLowerCase()} athletes already connected on Training Partner.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} Training Partner. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
