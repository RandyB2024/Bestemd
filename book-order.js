'use strict';
// Book variant selection and visible estimate. No payment is collected.
// Keep the choice in the existing 'message' field, which the current
// /api/website/intake book schema already persists and emails.
(()=>{
const form=document.querySelector('form[data-type="book"]');
if(!form)return;
const variants={paperback:{label:'Paperback',price:23.99,shipping:'Verzendkosten worden apart bevestigd.'},
ebook:{label:'E-book',price:13.99,shipping:'Digitaal exemplaar; geen verzending.'},
bundle:{label:'Paperback + e-book',price:37.98,shipping:'Gratis verzending.'}};
const format=form.querySelectorAll('input[name="book_format"]');
const amount=form.querySelector('input[name="quantity"]');
const customerNote=form.querySelector('[name="customer_note"]');
const payload=form.querySelector('input[name="message"]');
const price=document.querySelector('[data-book-total]');
const shipping=document.querySelector('[data-book-shipping]');
const euro=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);
function update(){
 const variant=form.querySelector('input[name="book_format"]:checked')?.value||'paperback',v=variants[variant];
 const qty=Math.max(1,Math.min(20,Number.parseInt(amount?.value||'1',10)||1));
 const note=(customerNote?.value||'').trim();
 // Backend limits message to 2000 characters. Limit note field accordingly.
 payload.value='Uitvoering: '+v.label+' | Aantal: '+qty+' | Prijs per stuk: '+euro(v.price)+' | Totaal excl. eventuele verzendkosten: '+euro(v.price*qty)+(note?'\nOpmerking: '+note:'');
 if(price)price.textContent=euro(v.price*qty);
 if(shipping)shipping.textContent=v.shipping;
}
format.forEach(x=>x.addEventListener('change',update));
amount?.addEventListener('input',update);
customerNote?.addEventListener('input',update);
form.addEventListener('submit',update,{capture:true});
form.addEventListener('reset',()=>setTimeout(update,0));
update();
})();
