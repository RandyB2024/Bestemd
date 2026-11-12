'use strict';
/* Progressive enhancement only — website intake, Wize and other scripts are untouched. */
(()=>{
 const header=document.querySelector('.header'),nav=header?.querySelector('.nav');
 if(header&&nav){
   const button=document.createElement('button');
   button.type='button';button.className='bb-mobile-menu';button.setAttribute('aria-controls','bb-main-nav');button.setAttribute('aria-expanded','false');button.textContent='Menu ☰';
   nav.id='bb-main-nav';header.querySelector('.top')?.insertBefore(button,nav);
   function close(){nav.classList.remove('bb-nav-open');button.setAttribute('aria-expanded','false');button.textContent='Menu ☰'}
   button.addEventListener('click',()=>{const open=!nav.classList.contains('bb-nav-open');nav.classList.toggle('bb-nav-open',open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'Sluiten ×':'Menu ☰'});
   nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
   document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
   document.addEventListener('click',e=>{if(!header.contains(e.target))close()});
 }
 const bar=document.createElement('div');bar.className='bb-scroll-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);
 let pending=false;
 function update(){bar.style.width=String(Math.max(0,Math.min(100,(window.scrollY/(document.documentElement.scrollHeight-innerHeight||1))*100)))+'%';pending=false}
 window.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});update();
 const revealSelectors=['.pl-section-head','.pl-service-card','.bb-showcase-intro','.bb-tour','.benefits-heading','.benefits-list','.pl-steps-grid article','.person .split','.mission .values','.fit-section .section-intro','.fit-columns','.film-layout','.ed-social-head','.book-feature','.training-layout','.contact-layout','.newsletter-layout','.bb-faq-grid'];
 if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   const targets=document.querySelectorAll(revealSelectors.join(','));
   targets.forEach(el=>el.setAttribute('data-bb-reveal',''));
   const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.06,rootMargin:'0px 0px 40px 0px'});
   targets.forEach(el=>observer.observe(el));
   // Safety: content remains visible if observer is unavailable or scripts fail.
   document.addEventListener('visibilitychange',()=>{if(document.hidden)return;});
 }
})();
