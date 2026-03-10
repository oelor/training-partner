const DEFAULT_CONFIG = {
  mode: 'mailto',
  fallback_email: 'elor.orry@gmail.com',
  submit_url: '',
  public_form_url: '',
  submit_method: 'POST',
  payload_format: 'mailto',
  hidden_fields: {},
  field_map: {
    intent: 'entry.intent',
    name: 'entry.name',
    email: 'entry.email',
    organization: 'entry.organization',
    city: 'entry.city',
    topic: 'entry.topic',
    role: 'entry.role',
    sport: 'entry.sport',
    level: 'entry.level',
    weight: 'entry.weight',
    age_band: 'entry.age_band',
    gender: 'entry.gender',
    travel_radius: 'entry.travel_radius',
    size_style: 'entry.size_style',
    need: 'entry.need',
    trust_interest: 'entry.trust_interest',
    support_interest: 'entry.support_interest',
    availability: 'entry.availability',
    notes: 'entry.notes',
  },
  success_message: 'Thanks. Your intake is queued.',
};

let captureConfigPromise = null;

function setStatus(message) {
  const node = document.getElementById('waitlistStatus');
  if (node) {
    node.textContent = message;
  }
}

function buildIntakePayload(form) {
  const data = new FormData(form);
  const value = (key) => String(data.get(key) || '').trim();
  return {
    name: value('name'),
    email: value('email'),
    city: value('city'),
    role: value('role'),
    sport: value('sport'),
    level: value('level'),
    weight: value('weight'),
    age_band: value('age_band'),
    gender: value('gender'),
    travel_radius: value('travel_radius'),
    size_style: value('size_style'),
    need: value('need'),
    trust_interest: value('trust_interest'),
    support_interest: value('support_interest'),
    availability: value('availability'),
    notes: value('notes'),
  };
}

function buildIntakeSummary(payload) {
  return {
    subject: `[Training Partner Alpha] ${payload.role || 'Lead'} | ${payload.name || 'Unknown'} | ${payload.city || 'Unknown city'}`,
    body: [
      'Training Partner Combat Alpha Intake',
      '',
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `City: ${payload.city}`,
      `Role: ${payload.role}`,
      `Sport: ${payload.sport}`,
      `Experience level: ${payload.level}`,
      `Approximate weight / class: ${payload.weight}`,
      `Age band: ${payload.age_band}`,
      `Partner pool / gender preference: ${payload.gender}`,
      `Travel radius: ${payload.travel_radius}`,
      `Preferred style / room feel: ${payload.size_style}`,
      `Primary need: ${payload.need}`,
      `Trust / premium interest: ${payload.trust_interest}`,
      `Sponsor / donation interest: ${payload.support_interest}`,
      `Availability / constraints: ${payload.availability}`,
      `Notes: ${payload.notes}`,
    ].join('\n'),
  };
}

async function loadCaptureConfig() {
  if (!captureConfigPromise) {
    captureConfigPromise = fetch('./lead-capture-config.json', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : DEFAULT_CONFIG))
      .catch(() => DEFAULT_CONFIG);
  }
  const config = await captureConfigPromise;
  return {
    ...DEFAULT_CONFIG,
    ...config,
    field_map: {
      ...DEFAULT_CONFIG.field_map,
      ...(config.field_map || {}),
    },
    hidden_fields: {
      ...DEFAULT_CONFIG.hidden_fields,
      ...(config.hidden_fields || {}),
    },
  };
}

async function copySummary(summary) {
  const text = `${summary.subject}\n\n${summary.body}`;
  await navigator.clipboard.writeText(text);
  setStatus('Structured intake copied. You can paste it into email if fallback is needed.');
}

function buildGoogleFormPayload(payload, config) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    const entryKey = config.field_map[key];
    if (entryKey) {
      params.append(entryKey, value);
    }
  });
  return params;
}

async function submitToGoogleForm(payload, config) {
  if (!config.submit_url) {
    throw new Error('google_form_submit_url_missing');
  }
  await fetch(config.submit_url, {
    method: config.submit_method || 'POST',
    mode: 'no-cors',
    body: buildGoogleFormPayload(payload, config),
  });
}

async function submitToJsonApi(payload, config) {
  if (!config.submit_url) {
    throw new Error('api_submit_url_missing');
  }
  const response = await fetch(config.submit_url, {
    method: config.submit_method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`api_submit_failed:${response.status}`);
  }
}

async function submitToFormSubmit(payload, config) {
  if (!config.submit_url) {
    throw new Error('formsubmit_submit_url_missing');
  }
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => body.append(key, value));
  Object.entries(config.hidden_fields || {}).forEach(([key, value]) => body.append(key, value));
  const response = await fetch(config.submit_url, {
    method: config.submit_method || 'POST',
    headers: { Accept: 'application/json' },
    body,
  });
  if (!response.ok) {
    throw new Error(`formsubmit_failed:${response.status}`);
  }
}

async function fallbackToMailto(summary, config) {
  const target = config.fallback_email || DEFAULT_CONFIG.fallback_email;
  const mailto = `mailto:${target}?subject=${encodeURIComponent(summary.subject)}&body=${encodeURIComponent(summary.body)}`;
  window.location.href = mailto;
}

async function submitLead(payload) {
  const config = await loadCaptureConfig();
  const summary = buildIntakeSummary(payload);
  try {
    if (config.mode === 'google_form') {
      await submitToGoogleForm(payload, config);
      await copySummary(summary);
      setStatus(config.success_message || 'Thanks. Your intake is queued.');
      return;
    }
    if (config.mode === 'api') {
      await submitToJsonApi(payload, config);
      setStatus(config.success_message || 'Thanks. Your intake is queued.');
      return;
    }
    if (config.mode === 'formsubmit') {
      await submitToFormSubmit(payload, config);
      setStatus(config.success_message || 'Thanks. Your intake is queued.');
      return;
    }
    await fallbackToMailto(summary, config);
    await copySummary(summary);
  } catch (_error) {
    await copySummary(summary);
    await fallbackToMailto(summary, config);
  }
}

const form = document.getElementById('waitlistForm');
const copyButton = document.getElementById('copyIntake');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus('Fill out the required fields first.');
      return;
    }
    setStatus('Submitting structured intake...');
    await submitLead(buildIntakePayload(form));
  });
}

if (copyButton && form) {
  copyButton.addEventListener('click', async () => {
    if (!form.reportValidity()) {
      setStatus('Fill out the required fields first.');
      return;
    }
    await copySummary(buildIntakeSummary(buildIntakePayload(form)));
  });
}
