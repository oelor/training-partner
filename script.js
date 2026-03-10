document.documentElement.classList.add('js');

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    }
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
  observer.observe(node);
});


const merchVariants = {
  a: {
    title: 'Variant A: comp-team drop',
    copy: 'Pressure-test a harder comp-team angle against a cleaner gym-lifestyle angle without changing the storefront link.',
    cta: 'Shop the comp-team drop',
    notes: [
      'Wrestling and no-gi first',
      'Competition-room energy',
      'Drive clicks straight to the Printful storefront',
    ],
  },
  b: {
    title: 'Variant B: everyday matwear',
    copy: 'Test a broader combat-sports lifestyle pitch for people who want cleaner daily wear, not only comp-room gear.',
    cta: 'Shop the everyday matwear drop',
    notes: [
      'Cleaner everyday-wear angle',
      'Broader BJJ + combat-sports appeal',
      'Same live storefront, different merchandising story',
    ],
  },
};

function applyMerchVariant() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('merch');
  const stored = window.localStorage.getItem('tp_merch_variant');
  const variantKey = requested && merchVariants[requested] ? requested : (stored && merchVariants[stored] ? stored : 'a');
  window.localStorage.setItem('tp_merch_variant', variantKey);
  const variant = merchVariants[variantKey];
  const title = document.getElementById('merchVariantTitle');
  const copy = document.getElementById('merchVariantCopy');
  const cta = document.getElementById('merchPrimaryCta');
  const badge = document.getElementById('merchVariantBadge');
  const notes = document.getElementById('merchVariantNotes');
  if (title) title.textContent = variant.title;
  if (copy) copy.textContent = variant.copy;
  if (cta) cta.textContent = variant.cta;
  if (badge) badge.textContent = `Variant ${variantKey.toUpperCase()} live`;
  if (notes) notes.innerHTML = variant.notes.map((note) => `<li>${note}</li>`).join('');
}

applyMerchVariant();

document.addEventListener('pointermove', (event) => {
  const x = `${(event.clientX / window.innerWidth) * 100}%`;
  const y = `${(event.clientY / window.innerHeight) * 100}%`;
  document.documentElement.style.setProperty('--pointer-x', x);
  document.documentElement.style.setProperty('--pointer-y', y);
});

const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = `Training Partner, ${new Date().getFullYear()}`;
}

const matchProfiles = [
  {
    name: 'East Bay comp room',
    sport: 'Wrestling',
    level: 'Competitive / elite',
    weight: '156-185 lb',
    gender: 'Open room',
    radius: '0-10 miles',
    city: 'Hayward',
    venue: 'High-intensity wrestling rounds',
    trust: 'Verified room',
    tags: ['Bay Area', 'hard rounds', 'short commute'],
  },
  {
    name: 'Women’s no-gi crew',
    sport: 'Brazilian jiu-jitsu',
    level: 'Intermediate',
    weight: '125-155 lb',
    gender: "Women's room",
    radius: '10-25 miles',
    city: 'Oakland',
    venue: 'Women-led no-gi sessions',
    trust: 'High-trust intro',
    tags: ['no-gi', 'welcoming', 'weekday evenings'],
  },
  {
    name: 'South Bay judo rounds',
    sport: 'Judo',
    level: 'Advanced',
    weight: '156-185 lb',
    gender: 'Open room',
    radius: '25-40 miles',
    city: 'San Jose',
    venue: 'Stand-up focused room',
    trust: 'Coach-introduced',
    tags: ['takedowns', 'competition prep', 'clinic crossover'],
  },
  {
    name: 'Peninsula MMA grapplers',
    sport: 'MMA / grappling',
    level: 'Advanced',
    weight: '186-220 lb',
    gender: "Men's room",
    radius: '25-40 miles',
    city: 'Palo Alto',
    venue: 'Cage-aware grappling rounds',
    trust: 'Gym-hosted session',
    tags: ['MMA', 'durable rounds', 'Friday nights'],
  },
  {
    name: 'Berkeley technical room',
    sport: 'Brazilian jiu-jitsu',
    level: 'Beginner',
    weight: '125-155 lb',
    gender: 'Open room',
    radius: '10-25 miles',
    city: 'Berkeley',
    venue: 'Technique-first room with open mat',
    trust: 'Open mat',
    tags: ['beginners', 'technical', 'Sunday mat'],
  },
  {
    name: 'Walnut Creek heavyweights',
    sport: 'Wrestling',
    level: 'Advanced',
    weight: '220+ lb',
    gender: "Men's room",
    radius: '10-25 miles',
    city: 'Walnut Creek',
    venue: 'Upper-weight live rounds',
    trust: 'Verified athletes',
    tags: ['heavyweights', 'live goes', 'weekend focus'],
  },
];

function makeCard(profile) {
  const tags = profile.tags.map((tag) => `<span>${tag}</span>`).join('');
  return `
    <article class="preview-card">
      <div class="preview-topline">
        <p>${profile.city}</p>
        <span>${profile.trust}</span>
      </div>
      <h3>${profile.name}</h3>
      <p>${profile.venue}</p>
      <ul class="profile-meta">
        <li><strong>Sport</strong><span>${profile.sport}</span></li>
        <li><strong>Level</strong><span>${profile.level}</span></li>
        <li><strong>Band</strong><span>${profile.weight}</span></li>
        <li><strong>Room</strong><span>${profile.gender}</span></li>
      </ul>
      <div class="profile-tags">${tags}</div>
    </article>
  `;
}

function renderMatchPreview() {
  const preview = document.getElementById('matchPreview');
  if (!preview) {
    return;
  }

  const activeChip = document.querySelector('#sportChips .chip.is-active');
  const sport = activeChip ? activeChip.dataset.sport : 'Any';
  const skill = document.getElementById('skillFilter')?.value || 'Any';
  const weight = document.getElementById('weightFilter')?.value || 'Any';
  const gender = document.getElementById('genderFilter')?.value || 'Any';
  const radius = document.getElementById('radiusFilter')?.value || 'Any';

  const filtered = matchProfiles.filter((profile) => {
    const matchesSport = sport === 'Any' || profile.sport === sport;
    const matchesSkill = skill === 'Any' || profile.level === skill;
    const matchesWeight = weight === 'Any' || profile.weight === weight;
    const matchesGender = gender === 'Any' || profile.gender === gender;
    const matchesRadius = radius === 'Any' || profile.radius === radius;
    return matchesSport && matchesSkill && matchesWeight && matchesGender && matchesRadius;
  });

  const ranked = (filtered.length ? filtered : matchProfiles).slice(0, 3);
  preview.innerHTML = ranked.map(makeCard).join('');

  const matchCount = document.getElementById('matchCount');
  const roomCount = document.getElementById('roomCount');
  const trustCount = document.getElementById('trustCount');
  if (matchCount) {
    matchCount.textContent = `${ranked.length} fit${ranked.length === 1 ? '' : 's'}`;
  }
  if (roomCount) {
    roomCount.textContent = `${new Set(ranked.map((profile) => profile.city)).size} rooms`;
  }
  if (trustCount) {
    trustCount.textContent = `${ranked.filter((profile) => profile.trust.toLowerCase().includes('verified') || profile.trust.toLowerCase().includes('high-trust')).length} higher-trust`;
  }
}

document.querySelectorAll('#sportChips .chip').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('#sportChips .chip').forEach((node) => node.classList.remove('is-active'));
    button.classList.add('is-active');
    renderMatchPreview();
  });
});

['skillFilter', 'weightFilter', 'genderFilter', 'radiusFilter'].forEach((id) => {
  const node = document.getElementById(id);
  if (node) {
    node.addEventListener('change', renderMatchPreview);
  }
});

renderMatchPreview();

const foundingTierConfig = {
  athlete: {
    title: 'Founding athlete access selected',
    copy: 'Recommended contribution: 29 USDC on Polygon. This unlocks concierge athlete intake, early access, and higher-priority matching support.',
    confirmHref:
      './contact.html?intent=Crypto%20payment%20confirmation&topic=Training%20Partner%20founding%20athlete%20support&organization=Training%20Partner&notes=Tier%3A%20Athlete%0ATransaction%20hash%3A%20',
    confirmText: 'Confirm athlete payment',
  },
  coach: {
    title: 'Founding coach/private profile selected',
    copy: 'Recommended contribution: 79 USDC on Polygon. This is for coaches and private instructors who want early profile setup and demand routing.',
    confirmHref:
      './contact.html?intent=Crypto%20payment%20confirmation&topic=Training%20Partner%20founding%20coach%20support&organization=Training%20Partner&notes=Tier%3A%20Coach%0ATransaction%20hash%3A%20',
    confirmText: 'Confirm coach payment',
  },
  gym: {
    title: 'Founding gym partner listing selected',
    copy: 'Recommended contribution: 149 USDC on Polygon. This reserves an early gym listing, mat-access visibility, and featured partner priority.',
    confirmHref:
      './contact.html?intent=Crypto%20payment%20confirmation&topic=Training%20Partner%20founding%20gym%20support&organization=Training%20Partner&notes=Tier%3A%20Gym%0ATransaction%20hash%3A%20',
    confirmText: 'Confirm gym payment',
  },
};

function applyFoundingTierSelection() {
  if (!window.location.pathname.endsWith('/crypto.html')) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const selectedTier = params.get('tier');
  const tier = selectedTier && foundingTierConfig[selectedTier] ? foundingTierConfig[selectedTier] : null;
  const title = document.getElementById('cryptoTierTitle');
  const copy = document.getElementById('cryptoTierCopy');
  const confirmLink = document.getElementById('cryptoConfirmLink');
  const tierCards = document.querySelectorAll('.crypto-tier-card');

  tierCards.forEach((card) => {
    card.classList.toggle('is-selected', tier && card.dataset.tierId === selectedTier);
  });

  if (!tier) {
    return;
  }

  if (title) title.textContent = tier.title;
  if (copy) copy.textContent = tier.copy;
  if (confirmLink) {
    confirmLink.href = tier.confirmHref;
    confirmLink.textContent = tier.confirmText;
  }
}

applyFoundingTierSelection();
