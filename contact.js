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
    notes: 'entry.notes',
  },
  success_message: 'Thanks. Training Partner queued your message.',
};

let captureConfigPromise = null;

function setStatus(message) {
  const node = document.getElementById('contactStatus');
  if (node) {
    node.textContent = message;
  }
}

function buildPayload(form) {
  const data = new FormData(form);
  const value = (key) => String(data.get(key) || '').trim();
  return {
    intent: value('intent'),
    name: value('name'),
    email: value('email'),
    organization: value('organization'),
    city: value('city'),
    topic: value('topic'),
    notes: value('notes'),
  };
}

function buildSummary(payload) {
  return {
    subject: `[Training Partner] ${payload.intent || 'Contact'} | ${payload.name || 'Unknown'} | ${payload.organization || 'Independent'}`,
    body: [
      'Training Partner Contact Intake',
      '',
      `Intent: ${payload.intent}`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Organization: ${payload.organization}`,
      `City: ${payload.city}`,
      `Topic: ${payload.topic}`,
      `Notes: ${payload.notes}`,
    ].join('\n'),
  };
}

function applyQueryPrefill(form) {
  const params = new URLSearchParams(window.location.search);
  const mappings = ['intent', 'name', 'email', 'organization', 'city', 'topic', 'notes'];
  for (const key of mappings) {
    const value = params.get(key);
    if (!value) {
      continue;
    }
    const field = form.elements.namedItem(key);
    if (!field) {
      continue;
    }
    field.value = value;
  }
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
  setStatus('Structured contact copied. You can paste it into email if fallback is needed.');
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
  const summary = buildSummary(payload);
  try {
    if (config.mode === 'google_form') {
      await submitToGoogleForm(payload, config);
      await copySummary(summary);
      setStatus(config.success_message || 'Thanks. Training Partner queued your message.');
      return;
    }
    if (config.mode === 'api') {
      await submitToJsonApi(payload, config);
      setStatus(config.success_message || 'Thanks. Training Partner queued your message.');
      return;
    }
    if (config.mode === 'formsubmit') {
      await submitToFormSubmit(payload, config);
      setStatus(config.success_message || 'Thanks. Training Partner queued your message.');
      return;
    }
    await fallbackToMailto(summary, config);
    await copySummary(summary);
  } catch (_error) {
    await copySummary(summary);
    await fallbackToMailto(summary, config);
  }
}

const form = document.getElementById('contactForm');
const copyButton = document.getElementById('copyContact');

if (form) {
  applyQueryPrefill(form);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      setStatus('Fill out the required fields first.');
      return;
    }
    setStatus('Submitting structured contact...');
    await submitLead(buildPayload(form));
  });
}

if (copyButton && form) {
  copyButton.addEventListener('click', async () => {
    if (!form.reportValidity()) {
      setStatus('Fill out the required fields first.');
      return;
    }
    await copySummary(buildSummary(buildPayload(form)));
  });
}
