/* Nature Tours — stable destination runtime v3
 * Single renderer + single cart. No dependency on legacy planner/cart scripts.
 */
(function () {
  'use strict';
  if (window.__NatureToursDestinationRuntimeV3) return;
  window.__NatureToursDestinationRuntimeV3 = true;

  const CART_KEY = 'natureToursPlanCart';
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  const read = () => { try { const x=JSON.parse(localStorage.getItem(CART_KEY)||'[]'); return Array.isArray(x)?x:[]; } catch(e){return [];} };
  const write = items => { localStorage.setItem(CART_KEY, JSON.stringify(items)); syncCart(); window.dispatchEvent(new Event('natureToursCartChanged')); };
  const add = item => { const a=read(); if(a.some(x=>x.id===item.id)) return false; a.push(item); write(a); return true; };

  function removeOldUI(){
    document.querySelectorAll('#nt-destination-cart,#nt-destination-cart-panel').forEach(x=>x.remove());
    document.querySelectorAll('.nt-destination-section').forEach(x=>x.remove());
    document.querySelectorAll('[data-nt-runtime-cart]').forEach(x=>x.remove());
  }

  function syncCart(){
    const b=document.getElementById('nt-destination-cart'); const p=document.getElementById('nt-destination-cart-panel');
    if(!b||!p)return;
    const items=read(); b.textContent='🛒 Plan Cart ('+items.length+')';
    const list=p.querySelector('.nt-cart-list');
    list.innerHTML=items.length?items.map(x=>`<div class="nt-cart-item"><button type="button" data-remove="${esc(x.id)}">×</button><strong>${esc(x.destination||'Trip')}</strong><br><small>${x.type==='hotel'?'🏨 '+esc(x.hotel||'Hotel'): '🗓️ '+esc(x.duration||'Itinerary')}</small></div>`).join(''):'<p>Your Plan Cart is empty.</p>';
    list.querySelectorAll('[data-remove]').forEach(x=>x.onclick=()=>write(read().filter(i=>i.id!==x.dataset.remove)));
  }

  function cartUI(){
    // Never create a second instance.
    if(document.getElementById('nt-destination-cart')) return;
    const s=document.createElement('style'); s.dataset.ntRuntimeCart='1'; s.textContent='.nt-destination-cart{position:fixed;right:20px;bottom:20px;z-index:99999;border:0;border-radius:999px;padding:13px 18px;background:#111;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 8px 28px #0003}.nt-destination-cart-panel{position:fixed;right:20px;bottom:76px;width:min(390px,calc(100vw - 40px));max-height:70vh;overflow:auto;background:#fff;color:#111;z-index:100000;border-radius:18px;box-shadow:0 15px 50px #0003;padding:18px;display:none}.nt-destination-cart-panel.open{display:block}.nt-cart-item{padding:10px 0;border-bottom:1px solid #ddd}.nt-cart-item button{float:right;border:0;background:none;font-size:18px;cursor:pointer}.nt-card-btn{width:100%;border:0;border-radius:10px;padding:12px;background:#0f766e;color:#fff;font-weight:800;cursor:pointer;margin-top:10px}.nt-card-btn.added{background:#166534}.nt-destination-section{margin:34px 0}.nt-hotel-grid,.nt-itinerary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.nt-hotel-card,.nt-itinerary-card{border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#fff;box-shadow:0 6px 20px rgba(15,23,42,.06)}.nt-hotel-card img{width:100%;height:210px;object-fit:cover;border-radius:12px}@media(max-width:700px){.nt-hotel-grid,.nt-itinerary-grid{grid-template-columns:1fr}}'; document.head.appendChild(s);
    const b=document.createElement('button'); b.id='nt-destination-cart'; b.className='nt-destination-cart'; b.type='button'; b.dataset.ntRuntimeCart='1'; b.textContent='🛒 Plan Cart (0)';
    const p=document.createElement('aside'); p.id='nt-destination-cart-panel'; p.className='nt-destination-cart-panel'; p.dataset.ntRuntimeCart='1'; p.innerHTML='<h2>My Plan Cart</h2><div class="nt-cart-list"></div><button type="button" class="nt-card-btn" data-enquire>Proceed to Enquiry</button>';
    document.body.append(b,p); b.onclick=()=>p.classList.toggle('open'); p.querySelector('[data-enquire]').onclick=()=>{if(!read().length){alert('Your Plan Cart is empty.');return;}location.href='enquiry.html';}; syncCart();
  }

  async function geocode(d){
    if(Number.isFinite(+d.latitude)&&Number.isFinite(+d.longitude))return{lat:+d.latitude,lon:+d.longitude};
    try{const q=encodeURIComponent(`${d.name}, ${d.region||''}, ${d.country||''}`);const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+q,{headers:{Accept:'application/json'}});const a=await r.json();if(a[0])return{lat:+a[0].lat,lon:+a[0].lon};}catch(e){} return null;
  }
  async function hotels(d){
    const p=await geocode(d); if(!p)return[];
    const q=`[out:json][timeout:20];nwr["tourism"~"^(hotel|resort|guest_house|hostel|motel|camp_site|chalet)$"](around:50000,${p.lat},${p.lon});out center tags;`;
    for(const ep of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){
      try{const r=await fetch(ep+'?data='+encodeURIComponent(q),{headers:{Accept:'application/json'}});if(!r.ok)continue;const data=await r.json(),seen=new Set(),out=[];for(const i of data.elements||[]){const t=i.tags||{},name=String(t.name||'').trim(),k=name.toLowerCase();if(!name||seen.has(k))continue;const lat=i.lat??i.center?.lat,lon=i.lon??i.center?.lon;if(!Number.isFinite(+lat)||!Number.isFinite(+lon))continue;seen.add(k);out.push({id:`osm-${i.type}-${i.id}`,name,lat:+lat,lon:+lon,address:[t['addr:street'],t['addr:city']||t['addr:town']||t['addr:village']||d.name].filter(Boolean).join(', '),stars:t.stars||t['hotel:stars']||'',website:t.website||''});}if(out.length)return out.slice(0,10);}catch(e){}
    } return[];
  }
  function tags(d){return [...new Set([...(Array.isArray(d.tags)?d.tags:[]),'Local sightseeing','Scenic viewpoints','Local cuisine','Cultural experience','Leisure time'])].slice(0,8);}
  function plans(d){const h=tags(d),spec=[[2,1,'Quick Escape'],[3,2,'Short Discovery'],[5,4,'Complete Experience'],[7,6,'Relaxed Explorer']];return spec.map(([days,nights,style])=>({id:`${d.id}-${days}d`,days,nights,style,duration:`${days} Days / ${nights} Nights`,schedule:Array.from({length:days},(_,i)=>i===0?`Arrival, check-in and ${h[0]}.`:i===days-1?`Breakfast, ${h[(i+1)%h.length]} and departure.`:`Explore ${h[i%h.length]}, ${h[(i+1)%h.length]} and enjoy local experiences.`)}));}
  function renderPlans(page,d){const s=document.createElement('section');s.className='nt-destination-section nt-itineraries-section';s.innerHTML=`<h2>🗓️ Itineraries for ${esc(d.name)}</h2><p>Choose a trip length and add it to your Plan Cart.</p><div class="nt-itinerary-grid"></div>`;const g=s.querySelector('.nt-itinerary-grid');plans(d).forEach(p=>{const c=document.createElement('article');c.className='nt-itinerary-card';c.innerHTML=`<small>${esc(p.style)}</small><h3>${esc(p.duration)}</h3><ol>${p.schedule.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><button class="nt-card-btn" type="button">+ Add itinerary to Plan Cart</button>`;c.querySelector('button').onclick=e=>{const ok=add({id:`itinerary-${p.id}`,type:'itinerary',destination:d.name,country:d.country||'',duration:p.duration,style:p.style,days:p.schedule});e.currentTarget.textContent=ok?'✓ Added to Plan Cart':'✓ Already Added';e.currentTarget.classList.add('added');};g.appendChild(c);});page.appendChild(s);}
  function renderHotels(page,d,hs){const s=document.createElement('section');s.className='nt-destination-section nt-hotels-section';s.innerHTML=`<h2>🏨 Real Hotels & Stays in ${esc(d.name)}</h2><p>Live accommodation listings where available.</p><div class="nt-hotel-grid"></div>`;const g=s.querySelector('.nt-hotel-grid');if(!hs.length){g.innerHTML='<div class="nt-hotel-card"><strong>Live hotel listings unavailable right now.</strong><p>We do not invent accommodation.</p></div>';}else hs.forEach(h=>{const c=document.createElement('article');c.className='nt-hotel-card';c.innerHTML=`<h3>${esc(h.name)}</h3><p>${h.stars?'⭐ '+esc(h.stars)+' stars':''}</p><p>${esc(h.address||d.name)}</p><button class="nt-card-btn" type="button">+ Add hotel to Plan Cart</button>`;c.querySelector('button').onclick=e=>{const ok=add({id:`hotel-${h.id}`,type:'hotel',destination:d.name,country:d.country||'',hotel:h.name,address:h.address||'',website:h.website||''});e.currentTarget.textContent=ok?'✓ Added to Plan Cart':'✓ Already Added';e.currentTarget.classList.add('added');};g.appendChild(c);});page.appendChild(s);}
  async function init(){const page=document.getElementById('destination-page');if(!page||!window.DestinationEngine)return;removeOldUI();cartUI();const u=new URLSearchParams(location.search),q=u.get('id')||u.get('destination')||u.get('name')||'';if(!q)return;const d=await window.DestinationEngine.find(q);if(!d)return;renderPlans(page,d);const hs=await hotels(d);renderHotels(page,d,hs);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
