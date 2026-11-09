// Wize website assistant: public, privacy-isolated, deterministic source-verified responses.
// Deploy as a separate Worker at mijnbestemd.nl/api/wize/*.
// No LLM, no Office API access, no accounting data, no secret system context.
const origins=new Set(['https://mijnbestemd.nl','https://www.mijnbestemd.nl']);
const official=[
 {key:'btw',title:'Belastingdienst — Btw (omzetbelasting)',url:'https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/'},
 {key:'aangifte',title:'Belastingdienst — Btw-aangifte doen en betalen',url:'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/'},
 {key:'boekhouding',title:'KVK — Administratie en boekhouden voor ondernemers',url:'https://www.kvk.nl/geldzaken/administratie-en-boekhouden-voor-ondernemers/'},
 {key:'privacy',title:'Autoriteit Persoonsgegevens — AVG',url:'https://autoriteitpersoonsgegevens.nl/algemene-verordening-gegevensbescherming-avg'}
];
const redFlags=/\b(bsn|burgerservicenummer|iban|rekeningnummer|rekeningstand|wachtwoord|inlogcode|api.?sleutel|geheime|vertrouwelijke|klantnummer|polisnummer|mijn dossier|mijn aangifte|mijn saldo|mijn factuur|welke klant|andere onderneming|interne gegevens|database|supabase|secret|token)\b/i;
function reply(question){
 const q=question.toLowerCase();
 if(redFlags.test(q))return {answer:'Ik heb geen toegang tot klantdossiers, bankgegevens, interne systemen of informatie van andere ondernemingen. Deel hier geen vertrouwelijke gegevens. Voor jouw situatie kun je veilig contact opnemen met BESTEMD via info@mijnbestemd.nl.',sources:[],human:true};
 if(/\b(btw|omzetbelasting)\b/.test(q))return {answer:'Voor btw en omzetbelasting vind je de actuele algemene regels bij de Belastingdienst. Of een regel voor jouw onderneming geldt, moet persoonlijk worden beoordeeld.',sources:[official[0],official[1]],human:false};
 if(/\b(aangifte|belasting|fiscaal|kor)\b/.test(q))return {answer:'Voor algemene informatie over btw-aangifte en belastingregels verwijst Wize naar de Belastingdienst. Voor concrete deadlines of jouw eigen aangifte kijkt een medewerker graag mee.',sources:[official[1],official[0]],human:false};
 if(/\b(administratie|boekhoud|bewaarplicht|bonnetje|facturen|boekhouding)\b/.test(q))return {answer:'Een goede administratie helpt je overzicht te houden. De KVK legt uit hoe je je bedrijfsadministratie opzet en welke basisverplichtingen er zijn.',sources:[official[2]],human:false};
 if(/\b(avg|privacy|persoonsgegevens)\b/.test(q))return {answer:'Voor algemene informatie over privacyregels kun je terecht bij de Autoriteit Persoonsgegevens. Deel geen persoonsgegevens of dossierdetails in deze openbare chat.',sources:[official[3]],human:false};
 if(/\b(contact|afspraak|kennismaken|prijs|kosten|bestemd|boek bestellen|traject|ed)\b/.test(q))return {answer:'BESTEMD helpt ondernemers met boekhouding, aangiften en inzicht in hun cijfers. Voor een offerte, het boek, trajecten of een persoonlijke vraag kun je ons rechtstreeks bereiken via het contactformulier of info@mijnbestemd.nl.',sources:[],human:true};
 return {answer:'Ik kan hier geen betrouwbaar, officieel onderbouwd antwoord op geven. Ik verzin liever niets. Stel je vraag aan BESTEMD via het contactformulier of info@mijnbestemd.nl.',sources:[],human:true};
}
function json(data,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}})}
async function db(env,table,method,body,query=''){
 const url=env.WIZE_SUPABASE_URL+'/rest/v1/'+table+query;
 const response=await fetch(url,{method,headers:{'apikey':env.WIZE_SUPABASE_SERVICE_ROLE_KEY,'Authorization':'Bearer '+env.WIZE_SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json','Prefer':'return=representation'},body:body?JSON.stringify(body):undefined});
 if(!response.ok)throw Error('database unavailable');
 return response.json();
}
async function hash(session){const raw=new TextEncoder().encode(session);const digest=await crypto.subtle.digest('SHA-256',raw);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export default {async fetch(req,env){
 const origin=req.headers.get('Origin')||'',path=new URL(req.url).pathname;
 if(path!=='/api/wize/chat')return new Response('Not found',{status:404});
 if(req.method!=='POST')return json({ok:false,error:'Methode niet toegestaan'},405,origin);
 if(!origins.has(origin))return json({ok:false,error:'Niet toegestaan'},403);
 if(!env.WIZE_SUPABASE_URL||!env.WIZE_SUPABASE_SERVICE_ROLE_KEY||!env.WIZE_TURNSTILE_SECRET)return json({ok:false,error:'Wize is nog niet beschikbaar'},503,origin);
 if(Number(req.headers.get('content-length')||0)>5000)return json({ok:false,error:'Bericht te lang'},413,origin);
 let input;try{input=await req.json()}catch{return json({ok:false,error:'Ongeldig bericht'},400,origin)}
 const message=typeof input.message==='string'?input.message.trim():'';
 const session=typeof input.session==='string'?input.session:'';
 const token=typeof input.turnstileToken==='string'?input.turnstileToken:'';
 if(message.length<2||message.length>900||!/^[0-9a-f-]{36}$/i.test(session)||!token)return json({ok:false,error:'Vul je bericht in en rond de controle af'},400,origin);
 const verify=new URLSearchParams({secret:env.WIZE_TURNSTILE_SECRET,response:token});
 const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:verify}).then(x=>x.json()).catch(()=>({success:false}));
 if(!check.success)return json({ok:false,error:'Beveiligingscontrole mislukt'},403,origin);
 const result=reply(message);
 try{
  const sessionHash=await hash(session);
  const query='?visitor_session_hash=eq.'+sessionHash+'&select=id&limit=1';
  const existing=await db(env,'website_wize_conversations','GET',null,query);
  const conversation=existing.length?existing[0]:(await db(env,'website_wize_conversations','POST',{visitor_session_hash:sessionHash,status:result.human?'needs_human':'open'}))[0];
  if(!conversation?.id)throw Error('conversation unavailable');
  await db(env,'website_wize_messages','POST',{conversation_id:conversation.id,sender:'visitor',body:message,sources:[]});
  await db(env,'website_wize_messages','POST',{conversation_id:conversation.id,sender:'wize',body:result.answer,sources:result.sources});
  if(result.human)await db(env,'website_wize_conversations','PATCH',{status:'needs_human',last_message_at:new Date().toISOString()},'?id=eq.'+conversation.id);
  else await db(env,'website_wize_conversations','PATCH',{last_message_at:new Date().toISOString()},'?id=eq.'+conversation.id);
  return json({ok:true,answer:result.answer,sources:result.sources,needsHuman:result.human},200,origin);
 }catch{return json({ok:false,error:'Het gesprek kon niet veilig worden opgeslagen. Probeer later opnieuw of mail info@mijnbestemd.nl.'},503,origin)}
}};