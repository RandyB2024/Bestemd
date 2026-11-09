// Cloudflare Worker: public BESTEMD website -> Resend notifications.
// Store RESEND_API_KEY using wrangler secret put. Never place it in static frontend files.
const allowedOrigins = new Set(['https://mijnbestemd.nl','https://www.mijnbestemd.nl']);
const schemas = {
  book: ['name','email','address','postcode','city','quantity','message'],
  training: ['name','email','phone','training','message'],
  contact: ['name','email','company','message'],
  newsletter_subscribe: ['email','name'],
  newsletter_unsubscribe: ['email']
};
const labels = {
  book:'Nieuwe boekaanvraag',training:'Nieuwe trajectaanmelding',
  contact:'Nieuw contactbericht',newsletter_subscribe:'Nieuwsbrief: aanmeldverzoek',
  newsletter_unsubscribe:'Nieuwsbrief: afmeldverzoek'
};
function json(payload,status=200,origin=''){
  return new Response(JSON.stringify(payload),{
    status,headers:{'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',...(allowedOrigins.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}
  });
}
function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function clean(v,max=2000){return typeof v==='string'?v.trim().slice(0,max):'';}
export default {
  async fetch(request,env){
    const url=new URL(request.url),origin=request.headers.get('Origin')||'';
    if(url.pathname!=='/api/website/intake')return new Response('Not found',{status:404});
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':allowedOrigins.has(origin)?origin:'null',
      'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type',
      'Access-Control-Max-Age':'600','Vary':'Origin'
    }});
    if(request.method!=='POST')return json({ok:false,error:'Methode niet toegestaan'},405,origin);
    if(!allowedOrigins.has(origin))return json({ok:false,error:'Ongeldige herkomst'},403);
    if(!env.RESEND_API_KEY)return json({ok:false,error:'Formulier tijdelijk niet beschikbaar'},503,origin);
    if(Number(request.headers.get('Content-Length')||0)>12000)return json({ok:false,error:'Bericht te lang'},413,origin);
    let input;
    try{input=await request.json();}catch{return json({ok:false,error:'Ongeldig formulier'},400,origin);}
    if(!input||typeof input!=='object'||Array.isArray(input))return json({ok:false,error:'Ongeldig formulier'},400,origin);
    const type=clean(input.type,40);
    if(!schemas[type])return json({ok:false,error:'Onbekend formulier'},400,origin);
    if(clean(input.website,120))return json({ok:true},200,origin); // bot trap
    const fields={};
    for(const k of schemas[type])fields[k]=clean(input[k],k==='message'?2000:254);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email||''))return json({ok:false,error:'Vul een geldig e-mailadres in'},400,origin);
    if(['book','training','contact'].includes(type)&&(!fields.name||fields.name.length<2))
      return json({ok:false,error:'Vul je naam in'},400,origin);
    if(type==='contact'&&!fields.message)return json({ok:false,error:'Vul een bericht in'},400,origin);
    if(type==='training'&&!['Groepstraject','1-op-1 traject','Vier dagen in Spanje'].includes(fields.training))
      return json({ok:false,error:'Kies een traject'},400,origin);
    if(type==='book'){
      if(!fields.address||!fields.postcode||!fields.city)return json({ok:false,error:'Vul je adres in'},400,origin);
      const qty=Number(fields.quantity);
      if(!Number.isInteger(qty)||qty<1||qty>20)return json({ok:false,error:'Ongeldig aantal'},400,origin);
    }
    if(type!=='newsletter_unsubscribe'&&input.consent!==true)return json({ok:false,error:'Toestemming ontbreekt'},400,origin);
    // NOTE: newsletter opt-in / opt-out events are notifications only.
    // Office must store consent and manage subscription state server-side.
    const id=crypto.randomUUID();
    const detail=Object.entries(fields).filter(([,v])=>v).map(([k,v])=>'<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ddd">'+esc(k)+'</th><td style="padding:8px;border-bottom:1px solid #ddd">'+esc(v)+'</td></tr>').join('');
    const subject='BESTEMD website | '+labels[type]+' | '+id.slice(0,8);
    const body='<h2>'+esc(labels[type])+'</h2><p>Referentie: '+esc(id)+'</p><table>'+detail+'</table><p>Bron: mijnbestemd.nl</p><p>'+(
      type==='book'?'Let op: dit is geen betaalde of bevestigde boekbestelling.':
      type.startsWith('newsletter')?'Let op: deze nieuwsbriefstatus is nog niet automatisch verwerkt.':
      'Aanvraag ontvangen via website.')+'</p>';
    let res;
    try{
      res=await fetch('https://api.resend.com/emails',{
        method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          from:env.RESEND_FROM||'BESTEMD <website@mijnbestemd.nl>',
          to:[env.NOTIFY_TO||'info@mijnbestemd.nl'],
          reply_to:fields.email,
          subject,html:body,
          tags:[{name:'source',value:'website'},{name:'kind',value:type}]
        })
      });
    }catch{return json({ok:false,error:'Verzenden is niet bevestigd'},502,origin);}
    if(!res.ok)return json({ok:false,error:'Verzenden is niet bevestigd'},502,origin);
    // Only send customer acknowledgements after the office notification is accepted.
    // No payment, booking confirmation or newsletter subscription is implied.
    const messageByType={
      book:'We hebben je aanvraag voor het boek Kompas voor een rijker leven ontvangen. Dit is nog geen definitieve bestelling en er is niets betaald. We nemen contact met je op.',
      training:'Bedankt voor je aanmelding voor een traject bij BESTEMD. We nemen contact met je op over de mogelijkheden. Er is nog geen definitieve boeking.',
      contact:'Bedankt voor je bericht. We hebben het ontvangen en nemen contact met je op.',
      newsletter_subscribe:'We hebben je verzoek om je aan te melden voor de BESTEMD-nieuwsbrief ontvangen. De inschrijving wordt nog verwerkt.',
      newsletter_unsubscribe:'We hebben je afmeldverzoek voor de BESTEMD-nieuwsbrief ontvangen. De afmelding wordt nog verwerkt.'
    };
    const recipientHtml='<p>Beste '+esc(fields.name||'lezer')+',</p><p>'+esc(messageByType[type])+'</p><p>Referentie: '+esc(id)+'</p><p>Met vriendelijke groet,<br>BESTEMD<br><a href="mailto:info@mijnbestemd.nl">info@mijnbestemd.nl</a></p>';
    let customerConfirmationAccepted=false;
    try{
      const customerResponse=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          from:env.RESEND_FROM||'BESTEMD <website@mijnbestemd.nl>',
          to:[fields.email],reply_to:'info@mijnbestemd.nl',
          subject:'BESTEMD | Ontvangstbevestiging | '+id.slice(0,8),
          html:recipientHtml,
          tags:[{name:'source',value:'website'},{name:'kind',value:'confirmation'}]
        })
      });
      customerConfirmationAccepted=customerResponse.ok;
    }catch{
      customerConfirmationAccepted=false;
    }
    return json({ok:true,reference:id,confirmationAccepted:customerConfirmationAccepted,notice:type.startsWith('newsletter')?'Je verzoek is ontvangen. De wijziging wordt nog verwerkt.':type==='book'?'Aanvraag ontvangen. Je hebt nog niet betaald en de bestelling is nog niet bevestigd.':'Bedankt! We nemen contact met je op.'},200,origin);
  }
};