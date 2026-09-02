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

function runFiniteMotion(control, { duration, target = control, eventName = 'animationend', onAct, onSettle }) {
  if (control.dataset.busy === 'true') return false;
  let finished = false;
  let fallback;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    target.removeEventListener(eventName, finish);
    control.dataset.state = 'settle';
    onSettle?.();
    requestAnimationFrame(() => {
      control.dataset.state = 'idle';
      control.dataset.busy = 'false';
    });
  };
  control.dataset.busy = 'true';
  control.dataset.state = 'anticipate';
  onAct?.();
  if (reduceMotion.matches) {
    finish();
    return true;
  }
  target.addEventListener(eventName, finish, { once: true });
  fallback = setTimeout(finish, duration + 100);
  requestAnimationFrame(() => { control.dataset.state = 'act'; });
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
  livingCatalog.forEach((entry) => {
    const card = root.querySelector(`[data-living-id="${entry.id}"]`);
    livingControllers[entry.controller]?.(card, entry);
  });
}

mountLivingLibrary();
