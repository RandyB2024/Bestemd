'use strict';
// Only visual interactions. Resend, Turnstile, Wize and Office logic are unchanged.
(()=>{
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.getElementById('site-nav');
  if(toggle&&nav){
    const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu'};
    toggle.addEventListener('click',()=>{
      const open=!nav.classList.contains('is-open');
      nav.classList.toggle('is-open',open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.textContent=open?'Sluiten':'Menu';
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.addEventListener('click',e=>{if(!toggle.contains(e.target)&&!nav.contains(e.target))close()});
  }
  const tabs=[...document.querySelectorAll('.portal-tab')];
  const panel=document.getElementById('portal-panel');
  const title=document.getElementById('portal-title');
  const description=document.getElementById('portal-description');
  const content=[
    {title:'Je documenten bij elkaar.',description:'Lever stukken aan en vind je documenten terug.'},
    {title:'Je cijfers duidelijk.',description:'Zie hoe je onderneming ervoor staat en stel vragen waar nodig.'},
    {title:'Snel contact met ons.',description:'Berichten en vragen op een overzichtelijke plek.'}
  ];
  if(tabs.length===3&&panel&&title&&description){
    function select(i,focus=false){
      tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===i));tab.tabIndex=n===i?0:-1});
      title.textContent=content[i].title;
      description.textContent=content[i].description;
      panel.setAttribute('aria-labelledby',tabs[i].id);
      if(focus)tabs[i].focus();
    }
    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>select(i));
      tab.addEventListener('keydown',e=>{
        if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
        e.preventDefault();
        select(e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length,true);
      });
    });
  }
})();
