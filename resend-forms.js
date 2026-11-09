'use strict';
// Install this in the EXISTING website (not Office). Turnstile widget key is public.
// Set <meta name="bestemd-turnstile-sitekey" content="YOUR_WEBSITE_WIDGET_SITEKEY"> on the website.
const key=document.querySelector('meta[name="bestemd-turnstile-sitekey"]')?.content?.trim()||'';
let scriptPromise=null;
function loadWidget(){
 if(!key||key==='YOUR_WEBSITE_WIDGET_SITEKEY')return Promise.reject(new Error('Verificatie nog niet ingesteld'));
 if(window.turnstile)return Promise.resolve();
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=resolve;script.onerror=()=>reject(new Error('Beveiligingscontrole niet beschikbaar'));document.head.append(script);
 });
 return scriptPromise;
}
document.querySelectorAll('form[data-type]').forEach(form=>{
 let sending=false,widgetId=null,token='',requestKey=crypto.randomUUID();
 const status=form.querySelector('[role="status"]'),submit=form.querySelector('button[type="submit"]');
 const widget=document.createElement('div');widget.className='bestemd-website-turnstile';widget.style.margin='14px 0';
 submit?.insertAdjacentElement('beforebegin',widget);
 loadWidget().then(()=>{
  widgetId=window.turnstile.render(widget,{sitekey:key,appearance:'always',theme:'light',callback:value=>{token=value},'expired-callback':()=>{token=''},'error-callback':()=>{token='';if(status)status.textContent='Beveiligingscontrole kon niet worden geladen.'}});
 }).catch(()=>{if(status)status.textContent='Beveiligingscontrole niet beschikbaar. Probeer later opnieuw.'});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!form.reportValidity())return;
  if(!token){if(status)status.textContent='Bevestig eerst de Cloudflare-beveiligingscontrole.';return;}
  const data={type:form.dataset.type,consent:false,requestKey,turnstileToken:token};
  for(const [name,value]of new FormData(form))data[name]=typeof value==='string'?value.trim():value;
  data.consent=form.querySelector('[name="consent"]')?.checked===true;
  // Newsletter unsubscribe does not need marketing consent; all others maintain original consent setting.
  if(data.website)return;
  sending=true;submit.disabled=true;if(status)status.textContent='Veilig opslaan…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch('/api/website/intake',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(data),signal:controller.signal});
   const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Ontvangst niet bevestigd');
   if(status)status.textContent=result.notice||'Je aanvraag is opgeslagen.';
   requestKey=crypto.randomUUID();form.reset();
  }catch(error){if(status)status.textContent=error.message||'Opslaan niet bevestigd. Probeer opnieuw.';}
  finally{clearTimeout(timer);sending=false;submit.disabled=false;token='';if(widgetId!==null&&window.turnstile)window.turnstile.reset(widgetId)}
 });
});
