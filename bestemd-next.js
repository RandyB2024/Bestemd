'use strict';
(()=>{
 const toggle=document.querySelector('[data-nav-toggle]'),nav=document.querySelector('[data-nav]');
 if(toggle&&nav){const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')};toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';nav.classList.toggle('is-open',!expanded);toggle.setAttribute('aria-expanded',String(!expanded))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
 const tabs=[...document.querySelectorAll('[data-feature-tab]')],cap=document.querySelector('[data-feature-caption]');
 const messages=['Je bestanden en administratie op één plek.','Inzicht in je cijfers, zonder ingewikkelde taal.','Stel je vraag en houd het contact overzichtelijk.'];
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>{tabs.forEach((t,j)=>{t.setAttribute('aria-selected',String(i===j));t.tabIndex=i===j?0:-1});if(cap)cap.textContent=messages[i]});tab.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const next=(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus()})});
 const year=document.querySelector('[data-year]');if(year)year.textContent=String(new Date().getFullYear());
 const videoButton=document.querySelector('[data-video-open]'),video=document.querySelector('[data-video]');
 if(videoButton&&video){videoButton.addEventListener('click',()=>{video.hidden=false;video.play().catch(()=>{});video.scrollIntoView({behavior:'smooth',block:'center'})})}
})();
