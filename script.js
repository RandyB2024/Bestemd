'use strict';

(() => {
  const root = document.documentElement;
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  menu.hidden = false;
  navigation.dataset.enhanced = 'true';

  // A working calculator, kept out of the main narrative until requested.
  const hours = document.querySelector('#hours');
  const saving = document.querySelector('#saving');
  const format = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
  function calculate() {
    const weekly = Number(hours.value) * Number(saving.value) / 100;
    const hoursText = format.format(Number(hours.value)) + ' uur';
    document.querySelector('#hoursText').textContent = hoursText;
    document.querySelector('#savingText').textContent = saving.value + '%';
    hours.setAttribute('aria-valuetext', hoursText + ' per week');
    saving.setAttribute('aria-valuetext', saving.value + ' procent vermindering');
    document.querySelector('#weekly').textContent = format.format(weekly);
    document.querySelector('#monthly').textContent = format.format(weekly * 52 / 12);
    document.querySelector('#yearly').textContent = format.format(weekly * 52);
  }
  hours.addEventListener('input', calculate);
  saving.addEventListener('input', calculate);
  calculate();
  document.querySelector('#year').textContent = new Date().getFullYear();

  // The original video is never fetched until the visitor requests playback.
  const video = document.querySelector('video');
  const playButton = document.querySelector('.film-play');
  const videoStatus = document.querySelector('#video-status');
  playButton.addEventListener('click', async () => {
    videoStatus.textContent = '';
    playButton.disabled = true;
    try {
      await video.play();
      video.focus();
    } catch {
      videoStatus.textContent = 'Afspelen lukte niet. Probeer de bediening van de videospeler opnieuw.';
    } finally {
      playButton.disabled = false;
    }
  });
  video.addEventListener('play', () => { playButton.hidden = true; });
  video.addEventListener('ended', () => { playButton.hidden = false; });
  video.addEventListener('error', () => {
    videoStatus.textContent = 'De film kon niet worden geladen. Probeer het later opnieuw.';
    playButton.hidden = false;
  });
  playButton.hidden = false;

  // Preview only: no transport, secrets, cookies, analytics or persistent storage.
  // The live backend contract is documented in docs/form-integration.md.
  const form = document.querySelector('#aanmelden');
  const status = document.querySelector('#form-status');
  function validate(field) {
    let message = '';
    if (field.id === 'name' && !field.value.trim()) message = 'Vul je naam in.';
    if (field.id === 'email' && !field.validity.valid) message = 'Vul een geldig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.';
    if (field.id === 'permission' && !field.checked) message = 'Vink de toestemming aan om deze formuliercontrole te voltooien.';
    document.getElementById(field.id + '-error').textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }
  const requiredFields = ['name', 'email', 'permission'].map(id => document.getElementById(id));
  requiredFields.forEach(field => field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validate(field);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.elements.website.value) {
      status.textContent = 'Er is niets verstuurd. Dit formulier is een preview.';
      return;
    }
    const invalid = requiredFields.filter(field => !validate(field));
    if (invalid.length) {
      status.textContent = 'Controleer de gemarkeerde velden. Er is niets verstuurd.';
      invalid[0].focus();
      return;
    }
    status.textContent = 'Je invoer is gecontroleerd, maar niet verstuurd of opgeslagen. Je bent nog niet aangemeld. Registratie voor de introductie opent later.';
  });
  document.querySelector('#submit-button').disabled = false;

  // One event-driven animation frame, only for scenes near the viewport.
  // Every visual value is derived from position, never elapsed time or replay state.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pinQuery = matchMedia('(min-width: 901px) and (min-height: 700px)');
  const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
  const words = [...document.querySelectorAll('.story-word')];
  const device = document.querySelector('.device-reveal');
  const motionButton = document.querySelector('#motion-toggle');
  const activeScenes = new Set(scenes);
  let userPaused = false;
  let frame = 0;
  let motionEnabled = !reducedMotion.matches;
  const clamp = value => Math.max(0, Math.min(1, value));

  function renderScroll() {
    frame = 0;
    if (document.hidden) return;
    const viewport = window.innerHeight;
    const pageRange = root.scrollHeight - viewport;
    const reading = pageRange > 0 ? clamp(window.scrollY / pageRange) : 0;
    // Batch layout reads before style writes.
    const states = motionEnabled ? [...activeScenes].map(scene => ({ scene, rect: scene.getBoundingClientRect() })) : [];
    const deviceOffset = motionEnabled ? device.offsetTop : 0;
    root.style.setProperty('--reading', reading.toFixed(4));
    for (const { scene, rect } of states) {
      const progress = clamp((viewport - rect.top) / (viewport + rect.height));
      scene.style.setProperty('--progress', progress.toFixed(4));
      if (scene.id === 'toekomst') {
        scene.style.setProperty('--reveal', clamp((viewport * .95 - rect.top - deviceOffset) / (viewport * .65)).toFixed(4));
      }
      if (scene.id === 'verhaal') {
        const story = pinQuery.matches
          ? clamp((86 - rect.top) / Math.max(1, rect.height - viewport + 86))
          : clamp((viewport * .7 - rect.top) / rect.height);
        words.forEach((word, index) => {
          const emphasis = Math.max(0, 1 - Math.abs(story * 5 - index) / 1.5);
          const color = [155, 171, 180].map((base, i) => Math.round(base + ([244, 241, 234][i] - base) * emphasis));
          const shift = (1 - emphasis) * (pinQuery.matches ? 12 : 4);
          word.style.color = `rgb(${color.join(',')})`;
          word.style.transform = `translateX(${shift.toFixed(2)}px)`;
        });
      }
    }
  }
  function requestRender() {
    if (!frame) frame = requestAnimationFrame(renderScroll);
  }
  function syncMotion() {
    motionEnabled = !reducedMotion.matches && !userPaused;
    root.dataset.motion = motionEnabled ? 'on' : 'off';
    motionButton.setAttribute('aria-pressed', String(!motionEnabled));
    motionButton.disabled = reducedMotion.matches;
    motionButton.textContent = reducedMotion.matches ? 'Beweging uit · systeemvoorkeur' : motionEnabled ? 'Beweging uitzetten' : 'Beweging aanzetten';
    if (!motionEnabled) {
      words.forEach(word => { word.style.removeProperty('color'); word.style.removeProperty('transform'); });
      scenes.forEach(scene => { scene.style.removeProperty('--progress'); scene.style.removeProperty('--reveal'); });
    }
    requestRender();
  }
  motionButton.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  motionButton.hidden = false;
  reducedMotion.addEventListener('change', syncMotion);
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  document.addEventListener('visibilitychange', requestRender);
  document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', requestRender));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeScenes.add(entry.target);
        else activeScenes.delete(entry.target);
      });
      requestRender();
    }, { rootMargin: '150px 0px' });
    scenes.forEach(scene => observer.observe(scene));
  }
  syncMotion();
})();
