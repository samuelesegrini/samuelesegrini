const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const originalCreatures = [
  { id: 'original-progress-creature', sourceId: 'progress-creature', name: 'Progress Creature', kind: 'original', category: 'originals', slots: 3, accent: '#c7ff9f', verb: 'Stretch', renderer: 'progress', controller: 'progress' },
  { id: 'original-inbox-blob', sourceId: 'inbox-blob', name: 'Inbox Blob', kind: 'original', category: 'originals', slots: 2, accent: '#ffd4b8', verb: 'Swallow', renderer: 'inbox', controller: 'inbox' },
  { id: 'original-pixel-guest', sourceId: 'pixel-guest', name: 'Pixel Guest', kind: 'original', category: 'originals', slots: 1, accent: '#cdefff', verb: 'React', renderer: 'pixel', controller: 'pixel' },
  { id: 'original-mood-tile', sourceId: 'mood-tile', name: 'Mood Tile', kind: 'original', category: 'originals', slots: 1, accent: '#ded1ff', verb: 'Smile', renderer: 'mood', controller: 'mood' },
];

const livingCatalog = [...originalCreatures];
const livingRenderers = Object.create(null);
const livingControllers = Object.create(null);
const root = document.querySelector('#living-library-root');

function setLivingPhase(nodes, state, busy) {
  nodes.forEach((node) => {
    node.dataset.state = state;
    if (busy !== undefined) node.dataset.busy = busy;
  });
}

// `mirror` carries the phase onto sibling controls that share one lock, such as the pager arrows.
function runFiniteMotion(control, { duration, target = control, eventName = 'animationend', mirror = [], onAct, onSettle }) {
  if (control.dataset.busy === 'true') return false;
  const phase = [control, ...mirror];
  const runCount = String(Number(control.dataset.runCount || 0) + 1);
  phase.forEach((node) => { node.dataset.runCount = runCount; });
  setLivingPhase(phase, 'anticipate', 'true');
  onAct?.();
  if (reduceMotion.matches) {
    // Complete synchronously: no CSS or Web Animations start, and the final visible and
    // accessible state is in place before this handler returns.
    setLivingPhase(phase, 'settle');
    onSettle?.();
    setLivingPhase(phase, 'idle', 'false');
    return true;
  }
  let finished = false;
  let fallback;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    target.removeEventListener(eventName, finish);
    setLivingPhase(phase, 'settle');
    onSettle?.();
    requestAnimationFrame(() => setLivingPhase(phase, 'idle', 'false'));
  };
  target.addEventListener(eventName, finish, { once: true });
  fallback = setTimeout(finish, duration + 100);
  requestAnimationFrame(() => setLivingPhase(phase, 'act'));
  return true;
}

function slotClass(slots) {
  return ['', 'one', 'two', 'three', 'four'][slots];
}

function renderCard(entry) {
  const source = entry.kind === 'original'
    ? '<span class="ll-source">Original creature</span>'
    : `<button class="ll-source-link" data-source-id="${entry.sourceId}">Alternative to: ${entry.sourceName}</button>`;
  return `<article class="ll-card" data-living-id="${entry.id}" data-living-category="${entry.category}" data-living-kind="${entry.kind}" data-living-slots="${entry.slots}" style="--accent:${entry.accent}">
    <header><h2>${entry.name}</h2>${source}</header>
    <p>${entry.description ?? `A living ${entry.verb.toLowerCase()} interaction.`}</p>
    <div class="ll-stage"><div class="ll-safe-area">${livingRenderers[entry.renderer](entry)}</div></div>
    <footer><span>${entry.kind === 'original' ? 'Original' : entry.category}</span><span>${entry.slots} ${entry.slots === 1 ? 'slot' : 'slots'}</span><span>${entry.verb}</span></footer>
  </article>`;
}

function renderLibrary() {
  const alternatives = livingCatalog.filter((entry) => entry.kind === 'alternative').length;
  const originals = livingCatalog.length - alternatives;
  const originalCards = livingCatalog.filter((entry) => entry.kind === 'original').map(renderCard).join('');
  const alternativeCards = livingCatalog.filter((entry) => entry.kind === 'alternative').map(renderCard).join('');
  root.innerHTML = `<header class="ll-head"><div><span class="kicker">Motion playground · F</span><h1>A toolbar that feels alive.</h1><p class="intro">Data and actions become anatomy.</p></div><strong class="ll-summary">${alternatives} alternatives · ${originals} original creatures</strong></header>
    <nav class="ll-filters" aria-label="Living component categories">${['all', 'originals', 'actions', 'data', 'navigation', 'personality'].map((filter) => `<button data-living-filter="${filter}" class="${filter === 'all' ? 'active' : ''}">${filter === 'all' ? `All ${livingCatalog.length}` : filter[0].toUpperCase() + filter.slice(1)}</button>`).join('')}</nav>
    <section class="ll-section" data-living-section="originals"><h2 class="ll-section-title">Original Creatures</h2><div class="ll-grid ll-original-grid">${originalCards}</div></section>
    <section class="ll-section" data-living-section="alternatives"><h2 class="ll-section-title">Living Alternatives</h2><div class="ll-grid ll-alternative-grid">${alternativeCards}</div></section>`;
}

function openSource(sourceId) {
  window.showVariant('library');
  document.querySelector('#variant-library [data-filter="all"]')?.click();
  const source = document.querySelector(`#variant-library [data-component="${sourceId}"]`);
  if (!source) return;
  source.setAttribute('tabindex', '-1');
  source.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  source.focus({ preventScroll: true });
  source.addEventListener('blur', () => source.removeAttribute('tabindex'), { once: true });
}

livingRenderers.progress = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-original-progress" data-living-action data-busy="false" data-progress="48" style="--progress:48%" aria-label="48 percent read"><span class="ll-original-progress-tag">Reading</span><span class="ll-original-progress-track"><i class="ll-original-progress-fill" data-motion-part><i class="ll-original-progress-head"><i></i><i></i></i><b data-progress-label>48% read</b></i></span></button>`;

livingRenderers.inbox = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-original-inbox" data-living-action data-busy="false" data-unread="3" style="--blob-scale:1" aria-label="3 unread messages"><span class="ll-original-inbox-copy"><small>Inbox</small><b><span data-unread-label>3</span> unread</b></span><span class="ll-original-inbox-body" data-motion-part><span class="ll-original-inbox-eyes"><i></i><i></i></span><i class="ll-original-inbox-mouth"></i><span class="ll-original-inbox-dots" data-living-dots><i></i><i></i><i></i></span></span></button>`;

livingRenderers.pixel = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-original-pixel" data-living-action data-busy="false" data-reaction="idle" aria-label="Pixel guest is idle"><span class="ll-original-pixel-sprite" data-motion-part data-pixel-sprite="idle" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><b data-pixel-label>Idle</b></button>`;

livingRenderers.mood = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-original-mood" data-living-action data-busy="false" aria-pressed="false" aria-label="Mood tile is neutral"><span class="ll-original-mood-eyes" aria-hidden="true"><i></i><i></i></span><i class="ll-original-mood-mouth" data-motion-part></i></button>`;

livingControllers.progress = (card) => {
  const control = card.querySelector('[data-living-action]');
  const values = [48, 65, 82, 31];
  let index = 0;
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 720,
    onAct: () => {
      index = (index + 1) % values.length;
      const progress = values[index];
      control.dataset.progress = String(progress);
      control.style.setProperty('--progress', `${progress}%`);
      control.querySelector('[data-progress-label]').textContent = `${progress}% read`;
      control.setAttribute('aria-label', `${progress} percent read`);
    },
  }));
};

livingControllers.inbox = (card) => {
  const control = card.querySelector('[data-living-action]');
  const setUnread = (unread) => {
    control.dataset.unread = String(unread);
    control.style.setProperty('--blob-scale', String(1 + (3 - unread) * 0.08));
    control.querySelector('[data-unread-label]').textContent = String(unread);
    control.querySelector('[data-living-dots]').innerHTML = '<i></i>'.repeat(unread);
    control.setAttribute('aria-label', unread ? `${unread} unread messages` : 'No unread messages');
  };
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 780,
    onAct: () => {
      if (reduceMotion.matches) {
        setUnread(0);
        return;
      }
      [2, 1, 0].forEach((unread, index) => window.setTimeout(() => setUnread(unread), index * 260));
    },
  }));
};

livingControllers.pixel = (card) => {
  const control = card.querySelector('[data-living-action]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 700,
    onAct: () => {
      control.dataset.reaction = 'celebrate';
      control.querySelector('[data-pixel-sprite]').dataset.pixelSprite = 'celebrate';
      control.querySelector('[data-pixel-label]').textContent = 'Celebrate';
      control.setAttribute('aria-label', 'Pixel guest celebrates');
    },
    onSettle: () => {
      control.dataset.reaction = 'idle';
      control.querySelector('[data-pixel-sprite]').dataset.pixelSprite = 'idle';
      control.querySelector('[data-pixel-label]').textContent = 'Idle';
      control.setAttribute('aria-label', 'Pixel guest is idle');
    },
  }));
};

livingControllers.mood = (card) => {
  const control = card.querySelector('[data-living-action]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 520,
    onAct: () => {
      const pressed = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(pressed));
      control.setAttribute('aria-label', pressed ? 'Mood tile is smiling' : 'Mood tile is neutral');
    },
  }));
};

const actionCreatures = [
  { id:'courier-moth', sourceId:'plane-send', sourceName:'Plane Send', name:'Courier Moth', kind:'alternative', category:'actions', slots:1, accent:'#ffd4b8', verb:'Launch', description:'Folds paper-like wings, launches, and returns to its perch.', renderer:'courierMoth', controller:'courierMoth' },
  { id:'scout-eye', sourceId:'camera-lens-search', sourceName:'Camera-lens Search', name:'Scout Eye', kind:'alternative', category:'actions', slots:1, accent:'#cdefff', verb:'Focus', description:'Opens its iris to search and refocuses when closed.', renderer:'scoutEye', controller:'scoutEye' },
  { id:'drop-beetle', sourceId:'trapdoor-download', sourceName:'Trapdoor Download', name:'Drop Beetle', kind:'alternative', category:'actions', slots:1, accent:'#c7ff9f', verb:'Drop', description:'Compresses its shell and releases the payload underneath.', renderer:'dropBeetle', controller:'dropBeetle' },
  { id:'echo-jelly', sourceId:'share-ripple', sourceName:'Share Ripple', name:'Echo Jelly', kind:'alternative', category:'actions', slots:1, accent:'#ded1ff', verb:'Echo', description:'Contracts before sending confirmation rings through its body.', renderer:'echoJelly', controller:'echoJelly' },
  { id:'link-twins', sourceId:'copy-link', sourceName:'Copy Link', name:'Link Twins', kind:'alternative', category:'actions', slots:2, accent:'#cdefff', verb:'Connect', description:'Two bodies reach across the slot and snap together.', renderer:'linkTwins', controller:'linkTwins' },
  { id:'key-crab', sourceId:'command-launcher', sourceName:'Command Launcher', name:'Key Crab', kind:'alternative', category:'actions', slots:2, accent:'#ffd4b8', verb:'Press', description:'Raises its claws and presses the command sequence.', renderer:'keyCrab', controller:'keyCrab' },
  { id:'compass-pup', sourceId:'magnet-action', sourceName:'Magnet Action', name:'Compass Pup', kind:'alternative', category:'actions', slots:1, accent:'#c7ff9f', verb:'Attract', description:'Leans toward the pointer with layered body and shadow depth.', renderer:'compassPup', controller:'compassPup' },
];
livingCatalog.push(...actionCreatures);

livingRenderers.courierMoth = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-moth" data-living-action data-busy="false" aria-label="Send email"><i class="ll-moth-shadow" data-motion-part aria-hidden="true"></i><span class="ll-moth-envelope" data-moth-envelope data-motion-part aria-hidden="true"><i class="ll-moth-wing left" data-motion-part></i><i class="ll-moth-wing right" data-motion-part></i><i class="ll-moth-body" data-motion-part></i></span></button>`;

livingRenderers.scoutEye = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-eye" data-living-action data-busy="false" aria-expanded="false" aria-label="Search closed"><span class="ll-eye-iris" data-eye-iris data-motion-part aria-hidden="true"><i class="ll-eye-pupil" data-motion-part></i></span><i class="ll-eye-lid" data-motion-part aria-hidden="true"></i></button>`;

livingRenderers.dropBeetle = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-beetle" data-living-action data-busy="false" aria-label="Download file"><span class="ll-beetle-shell" data-beetle-shell data-motion-part aria-hidden="true"><i></i><i></i></span><i class="ll-beetle-legs" data-motion-part aria-hidden="true"></i><i class="ll-beetle-payload" data-motion-part aria-hidden="true"></i></button>`;

livingRenderers.echoJelly = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-jelly" data-living-action data-busy="false" aria-label="Share page"><i class="ll-jelly-ring" data-motion-part aria-hidden="true"></i><i class="ll-jelly-ring" data-motion-part aria-hidden="true"></i><span class="ll-jelly-body" data-jelly-body data-motion-part aria-hidden="true"><i></i><i></i></span></button>`;

livingRenderers.linkTwins = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-link" data-living-action data-busy="false" aria-label="Copy link"><span class="ll-link-twin a" data-link-twin data-motion-part aria-hidden="true"></span><i class="ll-link-bridge" data-motion-part aria-hidden="true"></i><span class="ll-link-twin b" data-motion-part aria-hidden="true"></span><b class="ll-link-label" data-link-label>Copy link</b></button>`;

livingRenderers.keyCrab = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-crab" data-living-action data-busy="false" aria-label="Open command menu"><span class="ll-crab-body" data-crab-body data-motion-part aria-hidden="true"><i></i><i></i></span><i class="ll-crab-claw left" data-motion-part aria-hidden="true"></i><i class="ll-crab-claw right" data-motion-part aria-hidden="true"></i><span class="ll-crab-keys" aria-hidden="true"><i class="ll-crab-key" data-crab-key data-pressed="false">⌘</i><i class="ll-crab-key" data-crab-key data-pressed="false">K</i><i class="ll-crab-key" data-crab-key data-pressed="false">↵</i></span></button>`;

livingRenderers.compassPup = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-pup" data-living-action data-busy="false" aria-label="Open external link"><i class="ll-pup-shadow" data-motion-part aria-hidden="true"></i><span class="ll-pup-body" data-pup-body data-motion-part aria-hidden="true"><i class="ll-pup-arrow" data-motion-part>↗</i></span></button>`;

livingControllers.courierMoth = (card) => {
  const control = card.querySelector('[data-living-action]');
  const envelope = control.querySelector('[data-moth-envelope]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 1050,
    target: envelope,
    onAct: () => control.setAttribute('aria-label', 'Sending email'),
    onSettle: () => {
      control.dataset.sent = 'true';
      control.setAttribute('aria-label', 'Email sent');
    },
  }));
};

livingControllers.scoutEye = (card) => {
  const control = card.querySelector('[data-living-action]');
  const iris = control.querySelector('[data-eye-iris]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 650,
    target: iris,
    onAct: () => {
      const open = control.getAttribute('aria-expanded') !== 'true';
      control.setAttribute('aria-expanded', String(open));
      control.setAttribute('aria-label', open ? 'Search open' : 'Search closed');
    },
  }));
};

livingControllers.dropBeetle = (card) => {
  const control = card.querySelector('[data-living-action]');
  const shell = control.querySelector('[data-beetle-shell]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 780,
    target: shell,
    onAct: () => {
      control.dataset.delivered = 'false';
      control.setAttribute('aria-label', 'Downloading file');
    },
    onSettle: () => {
      control.dataset.delivered = 'true';
      control.setAttribute('aria-label', 'Download complete');
    },
  }));
};

livingControllers.echoJelly = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-jelly-body]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 720,
    target: body,
    onAct: () => control.setAttribute('aria-label', 'Sharing page'),
    onSettle: () => {
      control.dataset.shared = 'true';
      control.setAttribute('aria-label', 'Page shared');
    },
  }));
};

livingControllers.linkTwins = (card) => {
  const control = card.querySelector('[data-living-action]');
  const twin = control.querySelector('[data-link-twin]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 680,
    target: twin,
    onSettle: () => {
      control.dataset.connected = 'true';
      control.querySelector('[data-link-label]').textContent = 'Copied';
      control.setAttribute('aria-label', 'Copied');
    },
  }));
};

livingControllers.keyCrab = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-crab-body]');
  const keys = Array.from(control.querySelectorAll('[data-crab-key]'));
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 820,
    target: body,
    onAct: () => {
      if (reduceMotion.matches) return;
      keys.forEach((key, index) => {
        window.setTimeout(() => { key.dataset.pressed = 'true'; }, index * 210);
        window.setTimeout(() => { key.dataset.pressed = 'false'; }, index * 210 + 200);
      });
    },
    onSettle: () => {
      control.dataset.opened = 'true';
      control.setAttribute('aria-label', 'Command menu opened');
    },
  }));
};

livingControllers.compassPup = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-pup-body]');
  const reset = () => {
    control.style.setProperty('--px', '0px');
    control.style.setProperty('--py', '0px');
  };
  reset();
  control.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    const box = control.getBoundingClientRect();
    const clamp = (value) => Math.max(-9, Math.min(9, value));
    control.style.setProperty('--px', `${clamp((event.clientX - box.left - box.width / 2) / 3).toFixed(2)}px`);
    control.style.setProperty('--py', `${clamp((event.clientY - box.top - box.height / 2) / 3).toFixed(2)}px`);
  });
  control.addEventListener('pointerleave', reset);
  control.addEventListener('blur', reset);
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 620,
    target: body,
    onSettle: () => {
      control.dataset.opened = 'true';
      control.setAttribute('aria-label', 'External link opened');
    },
  }));
};

const dataCreatures = [
  { id:'counter-caterpillar', sourceId:'split-metric', sourceName:'Split Metric', name:'Counter Caterpillar', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Count', description:'Digit segments form its body; only the changed segment travels.', renderer:'counterCaterpillar', controller:'counterCaterpillar' },
  { id:'number-owl', sourceId:'departure-metric', sourceName:'Departure Metric', name:'Number Owl', kind:'alternative', category:'data', slots:2, accent:'#ded1ff', verb:'Blink', description:'Split-flap eyes turn only when their digit changes.', renderer:'numberOwl', controller:'numberOwl' },
  { id:'clock-bug', sourceId:'local-clock', sourceName:'Local Clock', name:'Clock Bug', kind:'alternative', category:'data', slots:2, accent:'#cdefff', verb:'Tick', description:'Carries local time while an antenna marks the blinking colon.', renderer:'clockBug', controller:'clockBug' },
  { id:'pulse-eel', sourceId:'activity-signal', sourceName:'Activity Signal', name:'Pulse Eel', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Pulse', description:'Recent activity travels along a waveform spine.', renderer:'pulseEel', controller:'pulseEel' },
  { id:'radar-snail', sourceId:'availability-sensor', sourceName:'Availability Sensor', name:'Radar Snail', kind:'alternative', category:'data', slots:1, accent:'#ded1ff', verb:'Scan', description:'A feeler emits a radar pulse and reports availability.', renderer:'radarSnail', controller:'radarSnail' },
  { id:'weather-puff', sourceId:'pixel-weather', sourceName:'Pixel Weather', name:'Weather Puff', kind:'alternative', category:'data', slots:1, accent:'#cdefff', verb:'Forecast', description:'Its body becomes sun, cloud, or rain with the conditions.', renderer:'weatherPuff', controller:'weatherPuff' },
  { id:'peek-sprout', sourceId:'signal-peg', sourceName:'Signal Peg', name:'Peek Sprout', kind:'alternative', category:'data', slots:1, accent:'#c7ff9f', verb:'Emerge', description:'Emerges, wobbles, and settles to show availability.', renderer:'peekSprout', controller:'peekSprout' },
  { id:'shell-knock', sourceId:'knock-notice', sourceName:'Knock Notice', name:'Shell Knock', kind:'alternative', category:'data', slots:1, accent:'#ffd4b8', verb:'Knock', description:'A notification taps the shell before it is revealed or cleared.', renderer:'shellKnock', controller:'shellKnock' },
];
livingCatalog.push(...dataCreatures);

livingRenderers.counterCaterpillar = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-caterpillar" data-living-action data-busy="false" data-value="12" aria-label="12 published posts"><span class="ll-caterpillar-body" aria-hidden="true"><i class="ll-caterpillar-segment" data-segment><b class="ll-caterpillar-glyph">1</b></i><i class="ll-caterpillar-segment" data-segment><b class="ll-caterpillar-glyph">2</b></i><i class="ll-caterpillar-head" data-motion-part><i></i><i></i></i></span><small class="ll-caterpillar-tag" aria-hidden="true">Posts</small></button>`;

livingRenderers.numberOwl = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-owl" data-living-action data-busy="false" data-value="24" aria-label="24 case studies"><span class="ll-owl-face" aria-hidden="true"><i class="ll-owl-eye" data-owl-eye><b class="ll-owl-digit">2</b></i><i class="ll-owl-beak" data-motion-part></i><i class="ll-owl-eye" data-owl-eye><b class="ll-owl-digit">4</b></i></span><small class="ll-owl-tag" aria-hidden="true">Case studies</small></button>`;

livingRenderers.clockBug = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-clock" data-living-action data-busy="false" aria-label="Local time"><i class="ll-clock-antenna" data-clock-antenna data-motion-part aria-hidden="true"></i><span class="ll-clock-body" aria-hidden="true"><strong class="ll-clock-value" data-clock-value>--<i>:</i>--</strong><small class="ll-clock-zone" data-clock-zone>Local</small></span></button>`;

livingRenderers.pulseEel = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-eel" data-living-action data-busy="false" data-level="1" aria-label="Activity level 1"><span class="ll-eel-spine" data-eel-spine aria-hidden="true"><i style="--h:30%"></i><i style="--h:52%"></i><i style="--h:38%"></i><i style="--h:64%"></i></span><i class="ll-eel-head" data-motion-part aria-hidden="true"></i></button>`;

livingRenderers.radarSnail = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-snail" data-living-action data-busy="false" aria-pressed="false" aria-label="Availability: away"><i class="ll-snail-ring" data-motion-part aria-hidden="true"></i><i class="ll-snail-ring" data-motion-part aria-hidden="true"></i><span class="ll-snail-shell" data-motion-part aria-hidden="true"></span><i class="ll-snail-feeler" data-snail-feeler data-motion-part aria-hidden="true"></i><small class="ll-snail-state" data-snail-state aria-hidden="true">Away</small></button>`;

livingRenderers.weatherPuff = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-puff" data-living-action data-busy="false" data-weather="sun" aria-label="Weather: sun"><span class="ll-puff-body" data-puff-body aria-hidden="true"><i class="ll-puff-sun" data-motion-part></i><i class="ll-puff-cloud" data-motion-part></i><span class="ll-puff-rain" data-motion-part><i></i><i></i><i></i></span></span><small class="ll-puff-label" data-puff-label aria-hidden="true">Sun</small></button>`;

livingRenderers.peekSprout = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-sprout" data-living-action data-busy="false" aria-pressed="false" aria-label="Sprout is hidden in its pot"><span class="ll-sprout-bed" aria-hidden="true"><span class="ll-sprout-stem" data-sprout-stem data-motion-part><i class="ll-sprout-leaf left"></i><i class="ll-sprout-leaf right"></i><span class="ll-sprout-eyes"><i></i><i></i></span></span></span><i class="ll-sprout-pot" aria-hidden="true"></i><small class="ll-sprout-state" data-sprout-state aria-hidden="true">Away</small></button>`;

livingRenderers.shellKnock = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-knock" data-living-action data-busy="false" data-notices="2" aria-label="2 unread notices"><span class="ll-knock-shell" data-knock-shell aria-hidden="true"><i class="ll-knock-inner"><i></i><i></i></i></span><i class="ll-knock-count" data-knock-count aria-hidden="true">2</i></button>`;

livingControllers.counterCaterpillar = (card) => {
  const control = card.querySelector('[data-living-action]');
  const segments = Array.from(control.querySelectorAll('[data-segment]'));
  control.addEventListener('click', () => {
    const previous = control.dataset.value;
    const next = String((Number(previous) + 1) % 100).padStart(2, '0');
    const changed = segments.filter((segment, index) => previous[index] !== next[index]);
    runFiniteMotion(control, {
      duration: 520,
      target: changed[changed.length - 1],
      onAct: () => {
        control.dataset.value = next;
        control.setAttribute('aria-label', `${Number(next)} published posts`);
        changed.forEach((segment, index) => {
          const position = segments.indexOf(segment);
          segment.dataset.changing = 'true';
          segment.innerHTML = `<b class="ll-caterpillar-glyph"><span>${previous[position]}</span><span>${next[position]}</span></b>`;
        });
      },
      onSettle: () => changed.forEach((segment) => {
        const position = segments.indexOf(segment);
        segment.removeAttribute('data-changing');
        segment.innerHTML = `<b class="ll-caterpillar-glyph">${next[position]}</b>`;
      }),
    });
  });
};

livingControllers.numberOwl = (card) => {
  const control = card.querySelector('[data-living-action]');
  const eyes = Array.from(control.querySelectorAll('[data-owl-eye]'));
  const setDigit = (eye, digit) => { eye.querySelector('.ll-owl-digit').textContent = digit; };
  control.addEventListener('click', () => {
    const previous = control.dataset.value;
    const next = String((Number(previous) + 1) % 100).padStart(2, '0');
    const changed = eyes.filter((eye, index) => previous[index] !== next[index]);
    runFiniteMotion(control, {
      duration: 640,
      target: changed[changed.length - 1],
      onAct: () => {
        control.dataset.value = next;
        control.setAttribute('aria-label', `${Number(next)} case studies`);
        changed.forEach((eye) => { eye.dataset.changing = 'true'; });
        const swap = () => changed.forEach((eye) => setDigit(eye, next[eyes.indexOf(eye)]));
        if (reduceMotion.matches) swap();
        else window.setTimeout(swap, 300);
      },
      onSettle: () => changed.forEach((eye) => eye.removeAttribute('data-changing')),
    });
  });
};

let clockBugTimer = null;

livingControllers.clockBug = (card) => {
  const control = card.querySelector('[data-living-action]');
  const value = control.querySelector('[data-clock-value]');
  const antenna = control.querySelector('[data-clock-antenna]');
  const zone = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local').split('/').pop().replace(/_/g, ' ');
  control.querySelector('[data-clock-zone]').textContent = zone;
  const render = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    value.innerHTML = `${hours}<i>:</i>${minutes}`;
    control.setAttribute('aria-label', `Local time ${hours}:${minutes} in ${zone}`);
  };
  render();
  if (clockBugTimer) window.clearInterval(clockBugTimer);
  clockBugTimer = window.setInterval(render, 30000);
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 480,
    target: antenna,
    onAct: render,
  }));
};

livingControllers.pulseEel = (card) => {
  const control = card.querySelector('[data-living-action]');
  const spine = control.querySelector('[data-eel-spine]');
  const nodes = Array.from(spine.children);
  const levels = { 1: [30, 52, 38, 64], 2: [54, 74, 60, 86], 3: [72, 92, 80, 98] };
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 680,
    target: spine,
    onAct: () => {
      const level = (Number(control.dataset.level) % 3) + 1;
      control.dataset.level = String(level);
      levels[level].forEach((height, index) => nodes[index].style.setProperty('--h', `${height}%`));
      control.setAttribute('aria-label', `Activity level ${level}`);
    },
  }));
};

livingControllers.radarSnail = (card) => {
  const control = card.querySelector('[data-living-action]');
  const feeler = control.querySelector('[data-snail-feeler]');
  const state = control.querySelector('[data-snail-state]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 720,
    target: feeler,
    onAct: () => {
      const available = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(available));
      control.setAttribute('aria-label', available ? 'Availability: available' : 'Availability: away');
      state.textContent = available ? 'Available' : 'Away';
    },
  }));
};

livingControllers.weatherPuff = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-puff-body]');
  const label = control.querySelector('[data-puff-label]');
  const order = ['sun', 'rain', 'cloud'];
  const names = { sun: 'Sun', rain: 'Rain', cloud: 'Cloud' };
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 780,
    target: body,
    onAct: () => {
      const weather = order[(order.indexOf(control.dataset.weather) + 1) % order.length];
      control.dataset.weather = weather;
      label.textContent = names[weather];
      control.setAttribute('aria-label', `Weather: ${weather}`);
    },
  }));
};

livingControllers.peekSprout = (card) => {
  const control = card.querySelector('[data-living-action]');
  const stem = control.querySelector('[data-sprout-stem]');
  const state = control.querySelector('[data-sprout-state]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 660,
    target: stem,
    onAct: () => {
      const emerged = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(emerged));
      control.setAttribute('aria-label', emerged ? 'Sprout has emerged and is available' : 'Sprout is hidden in its pot');
      state.textContent = emerged ? 'Available' : 'Away';
    },
  }));
};

livingControllers.shellKnock = (card) => {
  const control = card.querySelector('[data-living-action]');
  const shell = control.querySelector('[data-knock-shell]');
  const count = control.querySelector('[data-knock-count]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 740,
    target: shell,
    onSettle: () => {
      const notices = control.dataset.notices === '0' ? 2 : 0;
      control.dataset.notices = String(notices);
      count.textContent = String(notices);
      control.setAttribute('aria-label', notices ? `${notices} unread notices` : 'No unread notices');
    },
  }));
};

const navigationCreatures = [
  { id:'project-caterpillar', sourceId:'conveyor-pager', sourceName:'Conveyor Pager', name:'Project Caterpillar', kind:'alternative', category:'navigation', slots:4, accent:'#c7ff9f', verb:'Carry', description:'Carries the current project away and brings the next one in.', renderer:'projectCaterpillar', controller:'projectCaterpillar' },
  { id:'stepper-bug', sourceId:'section-checkpoints', sourceName:'Section Checkpoints', name:'Stepper Bug', kind:'alternative', category:'navigation', slots:2, accent:'#ffd4b8', verb:'Hop', description:'Hops between article sections in reading order.', renderer:'stepperBug', controller:'stepperBug' },
  { id:'trail-snail', sourceId:'breadcrumb-cards', sourceName:'Breadcrumb Cards', name:'Trail Snail', kind:'alternative', category:'navigation', slots:3, accent:'#cdefff', verb:'Trail', description:'Leaves and retrieves breadcrumbs as hierarchy changes.', renderer:'trailSnail', controller:'trailSnail' },
  { id:'turnover-turtle', sourceId:'view-flip', sourceName:'View Flip', name:'Turnover Turtle', kind:'alternative', category:'navigation', slots:1, accent:'#ded1ff', verb:'Turn', description:'Turns its shell to expose grid or list view.', renderer:'turnoverTurtle', controller:'turnoverTurtle' },
  { id:'fan-bird', sourceId:'filter-deck', sourceName:'Filter Deck', name:'Fan Bird', kind:'alternative', category:'navigation', slots:2, accent:'#ffd4b8', verb:'Fan', description:'Spreads labelled feathers to reveal filters.', renderer:'fanBird', controller:'fanBird' },
  { id:'dial-snail', sourceId:'twist-dial', sourceName:'Twist Dial', name:'Dial Snail', kind:'alternative', category:'navigation', slots:1, accent:'#c7ff9f', verb:'Twist', description:'Rotates its shell between language detents.', renderer:'dialSnail', controller:'dialSnail' },
  { id:'shy-sticker', sourceId:'peel-tab', sourceName:'Peel Tab', name:'Shy Sticker', kind:'alternative', category:'navigation', slots:1, accent:'#cdefff', verb:'Peel', description:'Peels back its cover to reveal the selected route.', renderer:'shySticker', controller:'shySticker' },
  { id:'label-chameleon', sourceId:'card-shuffle-label', sourceName:'Card-shuffle Label', name:'Label Chameleon', kind:'alternative', category:'navigation', slots:2, accent:'#ded1ff', verb:'Change', description:'Exchanges stacked labels through a changing skin.', renderer:'labelChameleon', controller:'labelChameleon' },
];
livingCatalog.push(...navigationCreatures);

const livingProjects = ['EasyManager', 'Galaxy Trucker', 'SpinGO', 'Service Pulse'];
const projectSlug = (position) => `<small>Project ${String(position + 1).padStart(2, '0')} / 04</small><b>${livingProjects[position]}</b>`;

livingRenderers.projectCaterpillar = (entry) => `<div class="ll-control ${slotClass(entry.slots)} ll-project" data-project-group data-busy="false" data-state="idle" data-direction="forward" role="group" aria-label="Project 1 of 4: EasyManager" style="--direction:1"><button class="ll-project-arrow" data-living-action data-busy="false" data-state="idle" data-project-dir="-1" aria-label="Previous project">←</button><span class="ll-project-window"><span class="ll-project-copy ll-project-current">${projectSlug(0)}</span><span class="ll-project-copy ll-project-next" aria-hidden="true">${projectSlug(1)}</span></span><button class="ll-project-arrow" data-living-action data-busy="false" data-state="idle" data-project-dir="1" aria-label="Next project">→</button><span class="ll-project-creature" data-motion-part aria-hidden="true"><i class="ll-project-seg"></i><i class="ll-project-seg"></i><i class="ll-project-seg"></i><i class="ll-project-head"><i></i><i></i></i></span></div>`;

livingRenderers.stepperBug = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-stepper" data-living-action data-busy="false" data-step="1" style="--step:1" aria-label="Section 1 of 5"><span class="ll-stepper-track" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><i class="ll-stepper-bug" data-stepper-bug data-motion-part aria-hidden="true"><i></i><i></i></i><small class="ll-stepper-tag" data-stepper-tag aria-hidden="true">Section 1 of 5</small></button>`;

livingRenderers.trailSnail = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-trail" data-living-action data-busy="false" data-depth="2" aria-label="Location: Work, EasyManager"><span class="ll-trail-crumbs" aria-hidden="true"><i class="ll-trail-crumb">Work</i><i class="ll-trail-crumb deep">EasyManager</i></span><span class="ll-trail-snail" data-trail-body data-motion-part aria-hidden="true"><i class="ll-trail-shell"></i><i class="ll-trail-foot"></i><i class="ll-trail-horn"></i></span><span class="ll-trail-dots" aria-hidden="true"><i></i><i></i><i></i></span></button>`;

livingRenderers.turnoverTurtle = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-turtle" data-living-action data-busy="false" aria-pressed="false" aria-label="Grid view"><span class="ll-turtle-shell" data-turtle-shell data-motion-part aria-hidden="true"><i class="ll-turtle-side front">Grid</i><i class="ll-turtle-side back">List</i></span><i class="ll-turtle-head" aria-hidden="true"><i></i><i></i></i></button>`;

livingRenderers.fanBird = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-bird" data-living-action data-busy="false" aria-expanded="false" aria-label="Show filters"><span class="ll-bird-feathers" aria-hidden="true"><i class="ll-bird-feather">Swift</i><i class="ll-bird-feather">Design</i><i class="ll-bird-feather">All</i></span><span class="ll-bird-body" data-bird-body data-motion-part aria-hidden="true"><i class="ll-bird-beak"></i><i class="ll-bird-eye"></i></span></button>`;

livingRenderers.dialSnail = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-dial" data-living-action data-busy="false" role="switch" aria-checked="false" aria-label="Language: Italian"><i class="ll-dial-foot" aria-hidden="true"></i><span class="ll-dial-shell" data-dial-shell data-motion-part aria-hidden="true"><i class="ll-dial-pointer"></i></span><span class="ll-dial-value">IT</span></button>`;

livingRenderers.shySticker = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-sticker" data-living-action data-busy="false" aria-pressed="false" aria-label="Projects route hidden"><span class="ll-sticker-reveal" aria-hidden="true"><i class="ll-sticker-eye"></i><i class="ll-sticker-eye"></i><b>Projects</b></span><span class="ll-sticker-cover" data-sticker-cover data-motion-part aria-hidden="true"><b>Current</b><i class="ll-sticker-corner"></i></span></button>`;

livingRenderers.labelChameleon = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-chameleon" data-living-action data-busy="false" aria-pressed="false" aria-label="Filter: All projects"><span class="ll-chameleon-body" data-chameleon-body data-motion-part aria-hidden="true"><span class="ll-chameleon-skin a"><small>Filter active</small><b>All projects</b></span><span class="ll-chameleon-skin b"><small>Filter active</small><b>Swift / iOS</b></span><i class="ll-chameleon-eye"></i></span></button>`;

livingControllers.projectCaterpillar = (card) => {
  const group = card.querySelector('[data-project-group]');
  const current = group.querySelector('.ll-project-current');
  const next = group.querySelector('.ll-project-next');
  const arrows = Array.from(group.querySelectorAll('[data-project-dir]'));
  let index = 0;
  arrows.forEach((button) => button.addEventListener('click', () => {
    const direction = Number(button.dataset.projectDir);
    const destination = (index + direction + livingProjects.length) % livingProjects.length;
    runFiniteMotion(group, {
      duration: 900,
      target: current,
      mirror: arrows,
      onAct: () => {
        group.dataset.direction = direction > 0 ? 'forward' : 'backward';
        group.style.setProperty('--direction', String(direction));
        next.innerHTML = projectSlug(destination);
      },
      onSettle: () => {
        index = destination;
        current.innerHTML = projectSlug(index);
        next.innerHTML = projectSlug((index + 1) % livingProjects.length);
        group.setAttribute('aria-label', `Project ${index + 1} of 4: ${livingProjects[index]}`);
      },
    });
  }));
};

livingControllers.stepperBug = (card) => {
  const control = card.querySelector('[data-living-action]');
  const bug = control.querySelector('[data-stepper-bug]');
  const tag = control.querySelector('[data-stepper-tag]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 620,
    target: bug,
    onAct: () => {
      const step = (Number(control.dataset.step) % 5) + 1;
      control.dataset.step = String(step);
      control.style.setProperty('--step', String(step));
      control.setAttribute('aria-label', `Section ${step} of 5`);
      tag.textContent = `Section ${step} of 5`;
    },
  }));
};

livingControllers.trailSnail = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-trail-body]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 760,
    target: body,
    onAct: () => {
      const depth = control.dataset.depth === '2' ? 1 : 2;
      control.dataset.depth = String(depth);
      control.setAttribute('aria-label', depth === 2 ? 'Location: Work, EasyManager' : 'Location: Work');
    },
  }));
};

livingControllers.turnoverTurtle = (card) => {
  const control = card.querySelector('[data-living-action]');
  const shell = control.querySelector('[data-turtle-shell]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 680,
    target: shell,
    onAct: () => {
      const list = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(list));
      control.setAttribute('aria-label', list ? 'List view' : 'Grid view');
    },
  }));
};

livingControllers.fanBird = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-bird-body]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 760,
    target: body,
    onAct: () => {
      const expanded = control.getAttribute('aria-expanded') !== 'true';
      control.setAttribute('aria-expanded', String(expanded));
      control.setAttribute('aria-label', expanded ? 'Hide filters' : 'Show filters');
    },
  }));
};

livingControllers.dialSnail = (card) => {
  const control = card.querySelector('[data-living-action]');
  const shell = control.querySelector('[data-dial-shell]');
  const value = control.querySelector('.ll-dial-value');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 660,
    target: shell,
    onAct: () => {
      const english = control.getAttribute('aria-checked') !== 'true';
      control.setAttribute('aria-checked', String(english));
      control.setAttribute('aria-label', english ? 'Language: English' : 'Language: Italian');
      value.textContent = english ? 'EN' : 'IT';
    },
  }));
};

livingControllers.shySticker = (card) => {
  const control = card.querySelector('[data-living-action]');
  const cover = control.querySelector('[data-sticker-cover]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 700,
    target: cover,
    onAct: () => {
      const revealed = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(revealed));
      control.setAttribute('aria-label', revealed ? 'Projects route selected' : 'Projects route hidden');
    },
  }));
};

livingControllers.labelChameleon = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-chameleon-body]');
  // Two skins can carry any number of entries: the hidden one is always loaded with the next,
  // so the creature cycles a list while keeping its two-skin anatomy.
  const skins = Array.from(control.querySelectorAll('.ll-chameleon-skin'));
  const vocabulary = control.dataset.vocabulary ? JSON.parse(control.dataset.vocabulary) : null;
  const write = (skin, entry) => {
    skin.querySelector('small').textContent = entry.kicker;
    skin.querySelector('b').textContent = entry.value;
  };
  const announce = (entry) => control.setAttribute('aria-label', `${entry.kicker}: ${entry.value}`);
  let index = 0;
  if (vocabulary) {
    write(skins[0], vocabulary[0]);
    write(skins[1], vocabulary[1 % vocabulary.length]);
    announce(vocabulary[0]);
  }
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 720,
    target: body,
    onAct: () => {
      const swift = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(swift));
      if (!vocabulary) {
        control.setAttribute('aria-label', swift ? 'Filter: Swift / iOS' : 'Filter: All projects');
        return;
      }
      index = (index + 1) % vocabulary.length;
      announce(vocabulary[index]);
    },
    onSettle: () => {
      if (!vocabulary) return;
      // aria-pressed true shows skin B, so the other one is free to load the next entry
      const hidden = control.getAttribute('aria-pressed') === 'true' ? skins[0] : skins[1];
      write(hidden, vocabulary[(index + 1) % vocabulary.length]);
    },
  }));
};

const personalityCreatures = [
  { id:'letter-worm', sourceId:'magnetic-word', sourceName:'Magnetic Word', name:'Letter Worm', kind:'alternative', category:'personality', slots:2, accent:'#c7ff9f', verb:'Reconnect', description:'Letter segments resist, scatter, and reconnect in order.', renderer:'letterWorm', controller:'letterWorm' },
  { id:'orbit-pet', sourceId:'timezone-orbit', sourceName:'Timezone Orbit', name:'Orbit Pet', kind:'alternative', category:'personality', slots:1, accent:'#cdefff', verb:'Orbit', description:'A satellite circles a body representing place and local time.', renderer:'orbitPet', controller:'orbitPet' },
  { id:'sticker-slug', sourceId:'pasted-tag', sourceName:'Pasted Tag', name:'Sticker Slug', kind:'alternative', category:'personality', slots:2, accent:'#ffd4b8', verb:'Lift', description:'Lifts and peels the selected-work label carried on its back.', renderer:'stickerSlug', controller:'stickerSlug' },
  { id:'dice-armadillo', sourceId:'discovery-die', sourceName:'Discovery Die', name:'Dice Armadillo', kind:'alternative', category:'personality', slots:1, accent:'#ded1ff', verb:'Roll', description:'Curls into a die, rolls, and unfolds on a new route.', renderer:'diceArmadillo', controller:'diceArmadillo' },
];
livingCatalog.push(...personalityCreatures);

// Deterministic per-segment scatter, bounded so the worm stays inside its two-slot safe area.
const wormScatter = [[-11, -13, -14], [9, 12, 11], [-7, 14, -9], [12, -11, 13], [0, 9, 0], [-12, 11, -12], [8, -14, 10], [-9, 13, -8]];

livingRenderers.letterWorm = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-worm" data-living-action data-busy="false" aria-label="Status: Open now"><span class="ll-worm-body" aria-hidden="true">${Array.from('OPEN NOW').map((letter, index) => `<i class="ll-worm-seg${letter === ' ' ? ' gap' : ''}" data-worm-seg style="--scatter-x:${wormScatter[index][0]}px;--scatter-y:${wormScatter[index][1]}px;--scatter-r:${wormScatter[index][2]}deg">${letter === ' ' ? '' : letter}</i>`).join('')}</span><small class="ll-worm-tag" data-worm-tag aria-hidden="true">Status</small></button>`;

livingRenderers.orbitPet = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-orbit" data-living-action data-busy="false" aria-label="Italy, CET local system"><i class="ll-orbit-ring" aria-hidden="true"></i><span class="ll-orbit-body" aria-hidden="true"><i></i><i></i><i class="ll-orbit-mouth"></i></span><span class="ll-orbit-track" data-orbit-track data-motion-part aria-hidden="true"><i class="ll-orbit-satellite"></i></span><small class="ll-orbit-zone" aria-hidden="true">Italy · CET</small></button>`;

livingRenderers.stickerSlug = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-slug" data-living-action data-busy="false" aria-pressed="false" aria-label="Selected work label lowered"><span class="ll-slug-body" data-slug-body data-motion-part aria-hidden="true"><i class="ll-slug-stalk left"></i><i class="ll-slug-stalk right"></i></span><span class="ll-slug-label" aria-hidden="true">Selected work</span></button>`;

livingRenderers.diceArmadillo = (entry) => `<button class="ll-control ${slotClass(entry.slots)} ll-armadillo" data-living-action data-busy="false" data-face="5" aria-label="Random project 5"><i class="ll-armadillo-head" aria-hidden="true"><i></i><i></i></i><i class="ll-armadillo-feet" aria-hidden="true"></i><span class="ll-armadillo-shell" data-armadillo-shell data-motion-part aria-hidden="true">${'<i class="ll-armadillo-pip"></i>'.repeat(9)}</span></button>`;

livingControllers.letterWorm = (card) => {
  const control = card.querySelector('[data-living-action]');
  const segments = Array.from(control.querySelectorAll('[data-worm-seg]'));
  const tag = control.querySelector('[data-worm-tag]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 820,
    target: segments[segments.length - 1],
    onAct: () => {
      control.dataset.scattered = 'true';
      control.setAttribute('aria-label', 'Status scattering');
    },
    onSettle: () => {
      control.dataset.scattered = 'false';
      tag.textContent = 'Reassembled';
      control.setAttribute('aria-label', 'Status reassembled');
    },
  }));
};

livingControllers.orbitPet = (card) => {
  const control = card.querySelector('[data-living-action]');
  const track = control.querySelector('[data-orbit-track]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 900,
    target: track,
    onAct: () => control.setAttribute('aria-label', 'Italy, CET local system orbiting'),
    onSettle: () => control.setAttribute('aria-label', 'Italy, CET local system'),
  }));
};

livingControllers.stickerSlug = (card) => {
  const control = card.querySelector('[data-living-action]');
  const body = control.querySelector('[data-slug-body]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 720,
    target: body,
    onAct: () => {
      const raised = control.getAttribute('aria-pressed') !== 'true';
      control.setAttribute('aria-pressed', String(raised));
      control.setAttribute('aria-label', raised ? 'Selected work label raised' : 'Selected work label lowered');
    },
  }));
};

livingControllers.diceArmadillo = (card) => {
  const control = card.querySelector('[data-living-action]');
  const shell = control.querySelector('[data-armadillo-shell]');
  control.addEventListener('click', () => runFiniteMotion(control, {
    duration: 880,
    target: shell,
    onAct: () => {
      const current = Number(control.dataset.face);
      const roll = 1 + Math.floor(Math.random() * 5);
      const next = roll >= current ? roll + 1 : roll;
      control.dataset.face = String(next);
      control.setAttribute('aria-label', `Random project ${next}`);
    },
  }));
};

const forcedFailure = new URL(location.href).searchParams.get('failLiving');

// Measured moments of peak anatomical travel, used by the safe-area regression test.
const livingPeakMs = { 'courier-moth': 400, 'counter-caterpillar': 250, 'project-caterpillar': 420, 'dice-armadillo': 390 };

function mountController(card, entry) {
  card.querySelectorAll('[data-living-action]').forEach((node) => {
    if (!node.dataset.state) node.dataset.state = 'idle';
    if (!node.dataset.busy) node.dataset.busy = 'false';
    if (livingPeakMs[entry.id]) node.dataset.peakMs = String(livingPeakMs[entry.id]);
  });
  try {
    if (entry.id === forcedFailure) throw new Error(`Forced controller failure: ${entry.id}`);
    livingControllers[entry.controller]?.(card, entry);
  } catch (error) {
    card.dataset.controllerError = 'true';
    card.querySelector('[data-living-action]')?.setAttribute('aria-disabled', 'true');
    console.warn('[Living Library] controller failed', entry.id, error);
  }
}

function mountLivingLibrary() {
  if (!root) return;
  renderLibrary();
  root.querySelectorAll('[data-living-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.livingFilter;
    root.querySelectorAll('[data-living-filter]').forEach((item) => item.classList.toggle('active', item === button));
    root.querySelectorAll('.ll-card').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.livingCategory !== filter;
    });
    root.querySelectorAll('[data-living-section]').forEach((section) => {
      section.hidden = !section.querySelector('.ll-card:not([hidden])');
    });
  }));
  root.querySelectorAll('.ll-source-link').forEach((button) => button.addEventListener('click', () => openSource(button.dataset.sourceId)));
  livingCatalog.forEach((entry) => mountController(root.querySelector(`[data-living-id="${entry.id}"]`), entry));
}

mountLivingLibrary();

// --- Reuse outside the catalogue page -------------------------------------
// The catalogue mounts itself above when #living-library-root exists. These exports let
// another page (the toolbar page maps) place individual creatures into its own layout.

// Overridable copy slots, by semantic role. Only text a creature does NOT rewrite at runtime
// appears here: anything a controller owns (project names, unread counts, section numbers,
// availability wording, IT/EN, weather) stays the creature's own vocabulary by design.
const livingCopy = {
  'original-progress-creature': { kicker: '.ll-original-progress-tag' },
  'original-inbox-blob': { kicker: '.ll-original-inbox-copy small' },
  'link-twins': { value: '[data-link-label]' },
  'key-crab': { options: '[data-crab-key]' },
  'counter-caterpillar': { kicker: '.ll-caterpillar-tag' },
  'number-owl': { kicker: '.ll-owl-tag' },
  'clock-bug': { kicker: '[data-clock-zone]' },
  'trail-snail': { options: '.ll-trail-crumb' },
  'turnover-turtle': { options: '.ll-turtle-side' },
  'fan-bird': { options: '.ll-bird-feather' },
  'shy-sticker': { value: '.ll-sticker-cover b', alt: '.ll-sticker-reveal b' },
  'label-chameleon': { kicker: '.ll-chameleon-skin.a small', value: '.ll-chameleon-skin.a b', altKicker: '.ll-chameleon-skin.b small', alt: '.ll-chameleon-skin.b b' },
  'orbit-pet': { kicker: '.ll-orbit-zone' },
  'sticker-slug': { value: '.ll-slug-label' },
  'letter-worm': { options: '[data-worm-seg]' },
};

function applyLivingCopy(host, entry, copy) {
  const slots = livingCopy[entry.id];
  Object.entries(copy).forEach(([role, text]) => {
    const selector = slots?.[role];
    if (!selector) throw new Error(`${entry.id} has no overridable copy slot "${role}"`);
    const nodes = host.querySelectorAll(selector);
    if (!nodes.length) throw new Error(`${entry.id} copy slot "${role}" matched no element`);
    if (Array.isArray(text)) text.forEach((value, index) => { if (nodes[index]) nodes[index].textContent = value; });
    else nodes[0].textContent = text;
  });
}

// Renders one creature into `host` and wires its controller. `host` supplies the box; the
// creature keeps its own anatomy, states and motion. `copy` retitles its static text slots
// and `label` sets the resting accessible name — both applied after the controller mounts,
// so they win over any copy the controller writes on mount.
function mountLivingComponent(host, id, options = {}) {
  const entry = livingCatalog.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown living component: ${id}`);
  host.dataset.livingId = entry.id;
  host.style.setProperty('--accent', options.accent || entry.accent);
  host.innerHTML = livingRenderers[entry.renderer](entry);
  // set before mounting: a controller reads its vocabulary while wiring itself
  if (options.vocabulary) {
    const action = host.querySelector('[data-living-action]');
    if (action) action.dataset.vocabulary = JSON.stringify(options.vocabulary);
  }
  mountController(host, entry);
  if (options.copy) applyLivingCopy(host, entry, options.copy);
  if (options.label) host.querySelector('[data-living-action]')?.setAttribute('aria-label', options.label);
  return entry;
}

export { livingCatalog, livingCopy, livingRenderers, livingControllers, runFiniteMotion, mountController, mountLivingComponent };
