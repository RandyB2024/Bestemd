'use strict';
(()=>{
 const widget=document.querySelector('#wize-public-widget');
 if(!widget)return;
 const openBtn=widget.querySelector('[data-wize-open]'),panel=widget.querySelector('[data-wize-panel]'),close=widget.querySelector('[data-wize-close]'),form=widget.querySelector('form'),messages=widget.querySelector('[data-wize-messages]'),status=widget.querySelector('[data-wize-status]'),submit=form.querySelector('button[type=submit]'),input=form.querySelector('textarea'),turnstileBox=widget.querySelector('[data-wize-turnstile]');
 const key=document.querySelector('meta[name=bestemd-turnstile-sitekey]')?.content?.trim();
 const session=crypto.randomUUID();let token='',widgetId=null,busy=false,loaded=false;
 function msg(role,body,sources=[]){const item=document.createElement('div');item.className='wize-msg '+(role==='visitor'?'wize-msg-user':'wize-msg-bot');const p=document.createElement('p');p.textContent=body;item.append(p);if(sources.length){const links=document.createElement('div');links.className='wize-sources';const label=document.createElement('strong');label.textContent='Officiële bronnen';links.append(label);sources.forEach(source=>{if(!/^https:\/\/(www\.)?(belastingdienst\.nl|rijksoverheid\.nl|kvk\.nl|autoriteitpersoonsgegevens\.nl)\//i.test(source.url))return;const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=source.title;links.append(a)});item.append(links)}messages.append(item);messages.scrollTop=messages.scrollHeight}
 function open(){panel.hidden=false;openBtn.setAttribute('aria-expanded','true');if(!loaded){loaded=true;setupTurnstile()}input.focus()}
 function close(){panel.hidden=true;openBtn.setAttribute('aria-expanded','false');openBtn.focus()}
 openBtn.addEventListener('click',()=>panel.hidden?open():close());closeBtn.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
 async function setupTurnstile(){
  if(!key){status.textContent='De beveiliging wordt nog ingesteld. Stel je vraag via info@mijnbestemd.nl.';return}
  try{
   if(!window.turnstile)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.onload=resolve;s.onerror=reject;document.head.append(s)});
   widgetId=window.turnstile.render(turnstileBox,{sitekey:key,theme:'light',appearance:'always',callback:v=>{token=v;status.textContent=''},'expired-callback':()=>token='','error-callback':()=>{token='';status.textContent='Verificatie is niet beschikbaar.'}});
  }catch{status.textContent='De veiligheidscontrole kon niet worden geladen.'}
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;
  const question=input.value.trim();if(question.length<2||question.length>900){status.textContent='Typ een vraag van maximaal 900 tekens.';return}
  if(!token){status.textContent='Rond eerst de beveiligingscontrole af.';return}
  busy=true;submit.disabled=true;status.textContent='Wize controleert je vraag…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch('/api/wize/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,session,turnstileToken:token}),credentials:'omit',signal:controller.signal});
   const data=await response.json();if(!response.ok||!data.ok)throw Error(data.error||'Wize is tijdelijk niet bereikbaar.');
   msg('visitor',question);msg('wize',data.answer,data.sources);input.value='';status.textContent='';
  }catch(err){status.textContent=err.message||'Wize is momenteel niet beschikbaar. Mail naar info@mijnbestemd.nl.'}
  finally{clearTimeout(timer);busy=false;submit.disabled=false;token='';if(widgetId!==null&&window.turnstile)window.turnstile.reset(widgetId)}
 });
})();
