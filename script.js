'use strict';
(() => {
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  menu.hidden = false;
  navigation.dataset.enhanced = 'true';
  const closeMenu = () => { navigation.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('is-open', open); });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);
  const hours = document.querySelector('#hours');
  const saving = document.querySelector('#saving');
  const format = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 1 });
  function calculate() {
    const weekly = Number(hours.value) * Number(saving.value) / 100;
    document.querySelector('#hoursText').textContent = format.format(Number(hours.value)) + ' uur';
    document.querySelector('#savingText').textContent = saving.value + '%';
    hours.setAttribute('aria-valuetext', format.format(Number(hours.value)) + ' uur per week');
    saving.setAttribute('aria-valuetext', saving.value + ' procent vermindering');
    document.querySelector('#weekly').textContent = format.format(weekly);
    document.querySelector('#monthly').textContent = format.format(weekly * 52 / 12);
    document.querySelector('#yearly').textContent = format.format(weekly * 52);
  }
  hours.addEventListener('input', calculate);
  saving.addEventListener('input', calculate);
  calculate();
  document.querySelector('#year').textContent = new Date().getFullYear();
  // No transport or storage in preview. See docs/form-integration.md.
  const form = document.querySelector('#aanmelden');
  const status = document.querySelector('#form-status');
  document.querySelector('#submit-button').disabled = false;
  function validate(field) {
    let message = '';
    if (field.id === 'name' && !field.value.trim()) message = 'Vul je naam in.';
    if (field.id === 'email' && !field.validity.valid) message = 'Vul een geldig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.';
    if (field.id === 'permission' && !field.checked) message = 'Vink de toestemming aan om deze formuliercontrole te voltooien.';
    document.querySelector('#' + field.id + '-error').textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }
  const requiredFields = ['name', 'email', 'permission'].map(id => document.getElementById(id));
  requiredFields.forEach(field => field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.elements.website.value) { status.textContent = 'Er is niets verstuurd. Dit formulier is een preview.'; return; }
    const invalid = requiredFields.filter(field => !validate(field));
    if (invalid.length) { status.textContent = 'Controleer de gemarkeerde velden. Er is niets verstuurd.'; invalid[0].focus(); return; }
    status.textContent = 'Je invoer is gecontroleerd, maar niet verstuurd of opgeslagen. Aanmelden is nog niet beschikbaar. Je hoeft nu niets te doen.';
  });
  // Content remains visible without JS; each optional animation runs once.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('reveal-enter'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .principle').forEach(item => observer.observe(item));
  }
})();
