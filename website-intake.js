'use strict';
/* Website intake v1. EmailJS is een tijdelijke e-mailroute; Office-opslag en afmeldmutatie volgen server-side. */
(() => {
  const service = 'service_j8pr0cj';
  const template = 'template_w90ddwo';
  const publicKey = 'f81KMSvhtpl0TUM-6';
  const types = { book:'Boekbestelling', training:'Trajectaanmelding', contact:'Contactbericht', unsubscribe:'Nieuwsbrief afmeldverzoek' };
  document.querySelectorAll('form[data-bestemd-form]').forEach(form => {
    const button=form.querySelector('button[type=submit]');
    const status=form.querySelector('[role=status]');
    let busy=false;
    form.addEventListener('submit', async event=>{
      event.preventDefault();
      if(busy) return;
      if(!form.reportValidity()) return;
      const fd=new FormData(form);
      if(String(fd.get('website')||'').trim()) return;
      const type=form.dataset.bestemdForm;
      if(!types[type]) return;
      const fields=[...fd.entries()].filter(([k])=>!['website','consent'].includes(k));
      const email=String(fd.get('email')||'').trim();
      const name=String(fd.get('name')||'').trim()||'Nieuwsbrief';
      const readable=fields.map(([k,v])=>k+': '+String(v).trim()).join('\n').slice(0,3500);
      const subject='BESTEMD website | '+types[type];
      const payload={
        service_id:service, template_id:template, user_id:publicKey,
        template_params:{
          to_email:'info@mijnbestemd.nl',
          from_email:email, reply_to:email, email,
          name, from_name:name,
          company: (String(fd.get('company')||'')+' | '+subject).slice(0,150),
          source:subject, subject, message:readable, details:readable,
          permission:type==='unsubscribe'?'Verzoek tot afmelden': 'Toestemming voor verwerking van de aanvraag: ja'
        }
      };
      busy=true;button.disabled=true;form.setAttribute('aria-busy','true');
      status.textContent='Versturen…';
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),15000);
      try{
        const res=await fetch('https://api.emailjs.com/api/v1.0/email/send',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload),signal:controller.signal,credentials:'omit'
        });
        const responseBody=await res.text();
        if(res.ok && responseBody.trim()==='OK'){
          status.textContent=type==='unsubscribe'
            ?'Je afmeldverzoek is verstuurd. We verwerken dit zo spoedig mogelijk.'
            :type==='book'
              ?'Je aanvraag is verstuurd. Dit is nog geen betaalde of bevestigde bestelling; we nemen contact op.'
              :'Je bericht is verstuurd. We nemen contact met je op.';
          form.reset();
        }else{
          status.textContent='Versturen is niet bevestigd. Mail ons op info@mijnbestemd.nl.';
        }
      }catch{
        status.textContent='We konden de verzending niet bevestigen. Controleer je e-mail voordat je opnieuw verstuurt, om dubbele aanvragen te voorkomen.';
      }finally{
        clearTimeout(timeout);busy=false;button.disabled=false;form.removeAttribute('aria-busy');
      }
    });
  });
})();
