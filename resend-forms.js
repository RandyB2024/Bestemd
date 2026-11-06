'use strict';
document.querySelectorAll('form[data-type]').forEach(form=>{
  let sending=false;
  const status=form.querySelector('[role="status"]');
  const submit=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(sending||!form.reportValidity())return;
    const data={type:form.dataset.type,consent:false};
    for(const [key,value] of new FormData(form))data[key]=typeof value==='string'?value.trim():value;
    data.consent=form.querySelector('[name="consent"]')?.checked===true;
    if(data.website)return;
    sending=true;submit.disabled=true;status.textContent='Versturen…';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch('/api/website/intake',{
        method:'POST',headers:{'Content-Type':'application/json'},
        credentials:'omit',body:JSON.stringify(data),signal:controller.signal
      });
      const result=await response.json();
      if(!response.ok||!result.ok)throw new Error(result.error||'Verzenden is niet bevestigd');
      status.textContent=result.notice||'Bedankt. Je aanvraag is ontvangen.';
      form.reset();
    }catch(err){
      status.textContent='Versturen is nog niet beschikbaar of niet bevestigd. Mail naar info@mijnbestemd.nl. Stuur niet opnieuw voordat je je e-mail hebt gecontroleerd.';
    }finally{clearTimeout(timer);sending=false;submit.disabled=false;}
  });
});