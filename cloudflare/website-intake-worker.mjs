// BESTEMD website API. Durable intake BEFORE Resend; no secrets in frontend.
const origins = new Set(['https://mijnbestemd.nl','https://www.mijnbestemd.nl']);
const schema = {
  book:['name','email','address','postcode','city','quantity','message'],
  training:['name','email','phone','training','message'],
  contact:['name','email','company','message'],
  newsletter_subscribe:['email','name'],newsletter_unsubscribe:['email']
};
const vals={training:['Groepstraject','1-op-1 traject','Vier dagen in Spanje']};
function output(data,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(origins.has(origin)?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}})};
function clean(x,max=2000){return typeof x==='string'?x.trim().slice(0,max):'';}
function encode(hex){return [...new Uint8Array(hex)].map(n=>n.toString(16).padStart(2,'0')).join('');}
async function sha256(value){return encode(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
async function signed(email,secret){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return encode(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(email.toLowerCase())));}
function authHeaders(env){if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('storage configuration missing');return {'apikey':env.SUPABASE_SERVICE_ROLE_KEY,'authorization':'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json'};}
async function rpc(env,procedure,args){const result=await fetch(env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/rpc/'+procedure,{method:'POST',headers:authHeaders(env),body:JSON.stringify(args),signal:AbortSignal.timeout(12000)});if(!result.ok)throw Error('database unavailable ('+result.status+')');return result.json();}
function html(s,status=200){return new Response(s,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-frame-options':'DENY','referrer-policy':'no-referrer'}});}
function confirmPage(title,action,token){return html(`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BESTEMD</title><body style="font:16px system-ui;max-width:34rem;margin:6rem auto;padding:1rem;color:#123957"><h1>${title}</h1><form method="post"><input type="hidden" name="token" value="${token.replace(/[^a-zA-Z0-9_.-]/g,'')}"><button style="background:#155f9b;border:0;color:white;padding:14px 20px;border-radius:9px">${action}</button></form></body></html>`);}
async function verifyTurnstile(token,request,env){
 if(!env.TURNSTILE_SECRET)throw Error('captcha configuration missing');
 if(typeof token!=='string'||token.length>2048||!token) return false;
 const remote=request.headers.get('CF-Connecting-IP')||'';
 const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,...(remote?{remoteip:remote}:{})}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)return false;const j=await r.json();return j.success===true && ['mijnbestemd.nl','www.mijnbestemd.nl'].includes(j.hostname);
}
function requireConfig(env){return !!(env.SUPABASE_URL&&env.SUPABASE_SERVICE_ROLE_KEY&&env.TURNSTILE_SECRET);}
async function intake(request,env,origin){
 if(!origins.has(origin))return output({ok:false,error:'Ongeldige herkomst'},403,origin);
 if(!requireConfig(env))return output({ok:false,error:'Formulier tijdelijk niet beschikbaar'},503,origin);
 if(Number(request.headers.get('content-length')||0)>12000)return output({ok:false,error:'Bericht te lang'},413,origin);
 let input;try{const body=await request.text();if(body.length>12000)return output({ok:false,error:'Bericht te lang'},413,origin);input=JSON.parse(body)}catch{return output({ok:false,error:'Ongeldig formulier'},400,origin)}
 if(!input||typeof input!=='object'||Array.isArray(input))return output({ok:false,error:'Ongeldig formulier'},400,origin);
 const kind=clean(input.type,40);if(!schema[kind])return output({ok:false,error:'Onbekend formulier'},400,origin);
 if(input.website)return output({ok:true,notice:'Ontvangen'},200,origin);
 let key=clean(input.requestKey,36);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key))return output({ok:false,error:'Vernieuw de pagina en probeer opnieuw'},400,origin);
 const fields={};for(const k of schema[kind])fields[k]=clean(input[k],k==='message'?2000:254);
 const email=fields.email.toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return output({ok:false,error:'Ongeldig e-mailadres'},400,origin);
 if(['book','training','contact'].includes(kind)&&fields.name.length<2)return output({ok:false,error:'Naam ontbreekt'},400,origin);
 if(kind==='contact'&&!fields.message)return output({ok:false,error:'Bericht ontbreekt'},400,origin);
 if(kind==='training'&&!vals.training.includes(fields.training))return output({ok:false,error:'Ongeldig traject'},400,origin);
 if(kind==='book'&&(!fields.address||!fields.postcode||!fields.city||!Number.isInteger(+fields.quantity)||+fields.quantity<1||+fields.quantity>20))return output({ok:false,error:'Controleer het afleveradres en het aantal'},400,origin);
 if(kind!=='newsletter_unsubscribe'&&input.consent!==true)return output({ok:false,error:'Toestemming ontbreekt'},400,origin);
 let valid=false;try{valid=await verifyTurnstile(input.turnstileToken,request,env)}catch{return output({ok:false,error:'Beveiligingscontrole tijdelijk niet beschikbaar'},503,origin)}
 if(!valid)return output({ok:false,error:'Cloudflare-verificatie mislukt'},403,origin);
 // A visitor cannot unsubscribe an arbitrary email address from a public unauthenticated form.
 let token=null,hash=null;
 if(kind==='newsletter_subscribe'||kind==='newsletter_unsubscribe'){token=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'');hash=await sha256(token)}
 let id;
 try{id=await rpc(env,'bestemd_website_receive',{p_key:key,p_kind:kind,p_name:fields.name||'',p_email:email,p_payload:fields,p_consent:input.consent===true,p_confirm_hash:hash,p_confirm_token:token});}
 catch{return output({ok:false,error:'De aanvraag is niet opgeslagen. Probeer later opnieuw met dezelfde aanvraag.'},503,origin)}
 return output({ok:true,reference:id,notice:kind==='book'?'Boekaanvraag ontvangen; er is nog niets betaald.':'Aanvraag veilig ontvangen. Je ontvangt een bevestiging per e-mail.'},200,origin);
}
async function newsletterLink(request,env,url){
 const path=url.pathname;const kind=path.endsWith('/confirm')?'confirm':'unsubscribe';
 if(request.method==='GET')return confirmPage(kind==='confirm'?'Bevestig je nieuwsbriefaanmelding':'Meld je af voor de nieuwsbrief',kind==='confirm'?'Aanmelding bevestigen':'Afmelden',url.searchParams.get('token')||'');
 if(request.method!=='POST')return output({ok:false},405);
 const form=await request.formData();const token=clean(form.get('token'),256);
 if(!token)return html('<p>Ongeldige link.</p>',400);
 try{
  if(kind==='confirm'){
   if(!/^[a-f0-9]{64}$/.test(token))return html('<p>Ongeldige link.</p>',400);
   const ok=await rpc(env,'bestemd_website_confirm',{p_token_hash:await sha256(token)});
   return html(ok?'<h1>Bedankt! Je nieuwsbriefaanmelding is bevestigd.</h1>':'<h1>De bevestigingslink is ongeldig of verlopen.</h1>',ok?200:400);
  }
  // A signed campaign link or a one-time verification link from the unsubscribe form.
  if(/^[a-f0-9]{64}$/.test(token)){const ok=await rpc(env,'bestemd_website_unsubscribe_token',{p_token_hash:await sha256(token)});return html(ok?'<h1>Je bent afgemeld voor de BESTEMD-nieuwsbrief.</h1>':'<h1>De afmeldlink is ongeldig of verlopen.</h1>',ok?200:400)}
  // Format: hex(email UTF8) + . + HMAC(email). No secret ever sent to browser.
  const [encoded,signature]=token.split('.');if(!encoded||!signature||!env.NEWSLETTER_LINK_SECRET)return html('<p>Ongeldige link.</p>',400);
  const arr=encoded.match(/.{2}/g)||[];const email=new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(arr.map(x=>parseInt(x,16)))).toLowerCase();
  if(email.length>254||await signed(email,env.NEWSLETTER_LINK_SECRET)!==signature)return html('<p>Ongeldige link.</p>',400);
  await rpc(env,'bestemd_website_unsubscribe',{p_email:email});
  return html('<h1>Je bent afgemeld voor de BESTEMD-nieuwsbrief.</h1>');
 }catch{return html('<h1>Verwerking tijdelijk niet beschikbaar.</h1>',503)}
}
function encodedEmail(email){return [...new TextEncoder().encode(email)].map(x=>x.toString(16).padStart(2,'0')).join('')}
// BESTEMD_RECEIPT_HTML_20261109 — styling applies only to customer acknowledgements.
const receiptTitles={book:'Je boekaanvraag is ontvangen',training:'Je trajectaanmelding is ontvangen',contact:'Bedankt voor je bericht',newsletter_subscribe:'Bevestig je nieuwsbriefaanmelding',newsletter_unsubscribe:'Bevestig je afmelding'};
function escapeReceipt(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
async function receiptIdentity(env,intakeId){
 if(!intakeId)return {kind:'contact',name:''};
 try{
  const endpoint=env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/bestemd_website_intakes?id=eq.'+encodeURIComponent(intakeId)+'&select=name,kind&limit=1';
  const response=await fetch(endpoint,{headers:authHeaders(env),signal:AbortSignal.timeout(8000)});
  if(!response.ok)return {kind:'contact',name:''};
  const rows=await response.json();return rows[0]||{kind:'contact',name:''};
 }catch{return {kind:'contact',name:''};}
}
function receiptHtml(content,identity,id){
 const kind=identity?.kind||'contact';
 const title=receiptTitles[kind]||'We hebben je aanvraag ontvangen';
 const rawName=String(identity?.name||'').trim().slice(0,90);
 const greeting=rawName?'Beste '+escapeReceipt(rawName)+',':'Beste bezoeker,';
 const text=String(content??'');
 const lines=text.split(/\r?\n/).filter(Boolean);
 const main=escapeReceipt(lines[0]||'Bedankt. We hebben je aanvraag ontvangen.');
 const link=(text.match(/https:\/\/[^\s]+/)||[])[0];
 const actionLabel=kind==='newsletter_subscribe'?'Aanmelding bevestigen':'Afmelding bevestigen';
 const action=link&&['newsletter_subscribe','newsletter_unsubscribe'].includes(kind)
  ?'<tr><td style="padding:7px 0 18px"><a href="'+escapeReceipt(link)+'" style="display:inline-block;border-radius:7px;background:#195f95;padding:13px 20px;color:#fff;text-decoration:none;font-weight:700">'+actionLabel+'</a></td></tr>':'';
 const note=kind==='book'?'Let op: dit is een aanvraag. Je bestelling is nog niet definitief en er is nog niets betaald.'
  :kind==='training'?'Je aanmelding is nog niet definitief. We nemen contact op over het vervolg.'
  :kind==='contact'?'Heb je nog iets aan te vullen? Antwoord gerust op deze e-mail.'
  :kind==='newsletter_subscribe'?'Je ontvangt pas nieuwsbrieven nadat je je aanmelding hebt bevestigd.'
  :'Na bevestiging verwerken we je afmelding.';
 const reference=id?'<span style="font-size:11px;line-height:17px;color:#9aabb8">Referentie: '+escapeReceipt(id)+'</span>':'';
 return '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;padding:0;background:#f2f6fa;color:#18384f;font-family:Arial,Helvetica,sans-serif">'+
 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f6fa"><tr><td align="center" style="padding:36px 12px">'+
 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #dfe8f0;border-radius:12px">'+
 '<tr><td style="padding:31px 36px 23px;border-bottom:1px solid #e9f0f5">'+
 '<img src="https://mijnbestemd.nl/assets/logo.webp" width="170" alt="BESTEMD" style="display:block;width:170px;max-width:100%;height:auto;border:0">'+
 '</td></tr><tr><td style="padding:37px 36px 18px">'+
 '<div style="font-size:12px;font-weight:700;letter-spacing:1.6px;color:#237da4;text-transform:uppercase;margin-bottom:12px">Mijn Bestemd</div>'+
 '<h1 style="font-size:26px;line-height:34px;letter-spacing:-0.4px;color:#103856;margin:0 0 23px">'+escapeReceipt(title)+'</h1>'+
 '<p style="font-size:16px;line-height:26px;color:#243e53;margin:0 0 20px">'+greeting+'</p>'+
 '<p style="font-size:16px;line-height:27px;color:#243e53;margin:0 0 20px">'+main+'</p>'+
 '<table role="presentation" cellpadding="0" cellspacing="0"><tr><td>'+action+'</td></tr></table>'+
 '<div style="margin:10px 0 23px;border-left:3px solid #a7d5e6;padding:11px 16px;background:#f5f9fc;color:#4b677a;font-size:14px;line-height:22px">'+escapeReceipt(note)+'</div>'+
 '<p style="font-size:15px;line-height:25px;color:#243e53;margin:0">Met vriendelijke groet,<br><strong>Team BESTEMD</strong></p>'+
 '</td></tr><tr><td style="padding:22px 36px 27px;border-top:1px solid #e9f0f5;background:#fbfdff">'+
 '<a href="mailto:info@mijnbestemd.nl" style="color:#195f95;font-size:14px;text-decoration:none">info@mijnbestemd.nl</a><br>'+reference+
 '</td></tr></table><div style="font-size:12px;line-height:18px;color:#8599a8;margin:15px 12px;text-align:center">BESTEMD · Rust &amp; vertrouwen</div>'+
 '</td></tr></table></body></html>';
}
async function flush(env){
 if(!env.RESEND_API_KEY||!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('outbox configuration missing');
 const jobs=await rpc(env,'bestemd_website_claim_outbox',{p_limit:20});
 let sent=0,failed=0,suppressed=0;
 for(const job of jobs){
  let ok=false,provider=null,error=null;
  try{
   if(job.channel==='campaign'){
    // Re-check suppression immediately before contacting Resend.
    const response=await fetch(env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/bestemd_website_subscribers?email=eq.'+encodeURIComponent(job.recipient)+'&select=status&limit=1',{headers:authHeaders(env)});
    if(!response.ok)throw Error('subscription status unavailable');
    const rows=await response.json();
    if(rows.length!==1||rows[0].status!=='active'){
      suppressed++;
      await rpc(env,'bestemd_website_finish_outbox',{p_id:job.id,p_claim:job.claim_token,p_success:true,p_resend_id:'suppressed'});
      continue;
    }
   }
   const from=env.RESEND_FROM||'BESTEMD <info@mijnbestemd.nl>';
   let content=job.content;
   if(job.channel==='campaign'){
    if(!env.NEWSLETTER_LINK_SECRET)throw Error('newsletter link secret missing');
    const signature=await signed(job.recipient,env.NEWSLETTER_LINK_SECRET);
    const token=encodedEmail(job.recipient)+'.'+signature;
    content+='\n\nAfmelden: https://www.mijnbestemd.nl/api/website/newsletter/unsubscribe?token='+token;
   }
   const identity=job.channel==='receipt'?await receiptIdentity(env,job.intake_id):null;
   const subject=job.channel==='receipt'?('BESTEMD | '+(receiptTitles[identity?.kind]||'Ontvangstbevestiging')):job.subject;
   const message={from,to:[job.recipient],subject,text:content,reply_to:'info@mijnbestemd.nl',tags:[{name:'source',value:'website'},{name:'channel',value:job.channel}]};
   if(job.channel==='receipt')message.html=receiptHtml(content,identity,job.intake_id);
   const reply=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'website-'+job.id},body:JSON.stringify(message)});
   if(!reply.ok)throw Error('Resend status '+reply.status);
   const data=await reply.json();provider=data.id||null;ok=true;sent++;
  }catch(e){error=String(e?.message||e).slice(0,200);failed++}
  try{await rpc(env,'bestemd_website_finish_outbox',{p_id:job.id,p_claim:job.claim_token,p_success:ok,p_resend_id:provider,p_error:error})}
  catch{failed++}
 }
 return {total:jobs.length,sent,failed,suppressed};
}
async function resendWebhook(request,env){
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!env.RESEND_WEBHOOK_SECRET)return new Response('Webhook unavailable',{status:503});
 const id=request.headers.get('svix-id'),stamp=request.headers.get('svix-timestamp'),sig=request.headers.get('svix-signature');
 if(!id||!stamp||!sig||!/^[0-9]+$/.test(stamp)||Math.abs(Date.now()/1000-Number(stamp))>300)return new Response('Invalid signature',{status:401});
 let body;try{body=await request.text();if(body.length>30000)return new Response('Too long',{status:413})}catch{return new Response('Invalid body',{status:400})}
 try{
  const secret=env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/,''),binary=atob(secret.replace(/-/g,'+').replace(/_/g,'/'));
  const key=await crypto.subtle.importKey('raw',Uint8Array.from(binary,c=>c.charCodeAt(0)),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const signedContent=new TextEncoder().encode(id+'.'+stamp+'.'+body);
  let verified=false;
  for(const piece of sig.split(' ')){
   if(!piece.startsWith('v1,'))continue;
   try{const bytes=Uint8Array.from(atob(piece.slice(3)),c=>c.charCodeAt(0));if(await crypto.subtle.verify('HMAC',key,bytes,signedContent))verified=true}catch{}
  }
  if(!verified)return new Response('Invalid signature',{status:401});
  const event=JSON.parse(body);
  if(['email.delivered','email.bounced','email.complained','email.delivery_delayed'].includes(event.type)){
   await rpc(env,'bestemd_website_resend_event',{p_event_id:id,p_resend_id:event.data?.email_id||event.data?.id||'',p_kind:event.type});
  }
  return output({ok:true});
 }catch{return new Response('Webhook unavailable',{status:503})}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin')||'';
  if(url.pathname==='/api/website/resend-webhook')return resendWebhook(request,env);
  if(url.pathname==='/api/website/intake'){
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':origins.has(origin)?origin:'null','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'600','vary':'Origin'}});
   if(request.method!=='POST')return output({ok:false,error:'Methode niet toegestaan'},405,origin);
   return intake(request,env,origin);
  }
  if(url.pathname==='/api/website/newsletter/confirm'||url.pathname==='/api/website/newsletter/unsubscribe')return newsletterLink(request,env,url);
  return new Response('Not found',{status:404});
 },
 async scheduled(_event,env,ctx){ctx.waitUntil((async()=>{const r=await flush(env);console.log('website outbox processed',{total:r.total,sent:r.sent,failed:r.failed,suppressed:r.suppressed});const n=new Date();if(n.getUTCHours()===3&&n.getUTCMinutes()<2)await rpc(env,'bestemd_website_cleanup',{})})().catch(()=>console.error('website outbox unavailable')))}
};
