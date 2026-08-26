/* Nature Tours — isolated destination runtime
 * One destination renderer: hero + live hotels + generated itineraries + one Plan Cart.
 * Intentionally does not load or depend on the legacy planner/cart renderers.
 */
(function () {
  'use strict';
  if (window.__NatureToursDestinationRuntime) return;
  window.__NatureToursDestinationRuntime = true;

  const CART_KEY = 'natureToursPlanCart';
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  const json = async (url, options) => { const r = await fetch(url, options); if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); };
  const cartRead = () => { try { const v = JSON.parse(localStorage.getItem(CART_KEY)||'[]'); return Array.isArray(v)?v:[]; } catch (_) { return []; } };
  const cartWrite = items => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCart(); };
  const cartAdd = item => { const a=cartRead(); if(a.some(x=>x.id===item.id)) return false; a.push(item); cartWrite(a); return true; };

  function updateCart(){
    const btn=document.getElementById('nt-destination-cart');
    const panel=document.getElementById('nt-destination-cart-panel');
    if(!btn||!panel)return;
    const items=cartRead(); btn.textContent='🛒 Plan Cart ('+items.length+')';
    const list=panel.querySelector('.nt-cart-list');
    list.innerHTML=items.length?items.map(x=>`<div class="nt-cart-item"><button data-remove-cart="${esc(x.id)}">×</button><strong>${esc(x.destination||'Trip')}</strong><br><small>${x.type==='hotel'?'🏨 '+esc(x.hotel||'Hotel'):esc(x.duration||'Itinerary')}</small></div>`).join(''):'<p>Your Plan Cart is empty.</p>';
    list.querySelectorAll('[data-remove-cart]').forEach(b=>b.onclick=()=>cartWrite(cartRead().filter(x=>x.id!==b.dataset.removeCart)));
  }

  function cartUI(){
    if(document.getElementById('nt-destination-cart')) return;
    const style=document.createElement('style');
    style.textContent='.nt-destination-cart{position:fixed;right:20px;bottom:20px;z-index:99999;border:0;border-radius:999px;padding:13px 18px;background:#111;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 8px 28px #0003}.nt-destination-cart-panel{position:fixed;right:20px;bottom:76px;width:min(390px,calc(100vw - 40px));max-height:70vh;overflow:auto;background:#fff;color:#111;z-index:100000;border-radius:18px;box-shadow:0 15px 50px #0003;padding:18px;display:none}.nt-destination-cart-panel.open{display:block}.nt-cart-item{padding:10px 0;border-bottom:1px solid #ddd}.nt-cart-item button{float:right;border:0;background:none;font-size:18px;cursor:pointer}.nt-destination-section{margin:34px 0}.nt-destination-section h2{margin-bottom:8px}.nt-hotel-grid,.nt-itinerary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.nt-hotel-card,.nt-itinerary-card{border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#fff;box-shadow:0 6px 20px rgba(15,23,42,.06)}.nt-hotel-card img{width:100%;height:210px;object-fit:cover;border-radius:12px}.nt-card-btn{width:100%;border:0;border-radius:10px;padding:12px;background:#0f766e;color:#fff;font-weight:800;cursor:pointer;margin-top:10px}.nt-card-btn.added{background:#166534}.nt-itinerary-card ol{padding-left:20px}.nt-itinerary-card li{margin:7px 0;line-height:1.4}@media(max-width:700px){.nt-hotel-grid,.nt-itinerary-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
    const b=document.createElement('button'); b.id='nt-destination-cart'; b.className='nt-destination-cart'; b.type='button'; b.textContent='🛒 Plan Cart (0)';
    const p=document.createElement('aside'); p.id='nt-destination-cart-panel'; p.className='nt-destination-cart-panel'; p.innerHTML='<h2>My Plan Cart</h2><div class="nt-cart-list"></div><button class="nt-card-btn" data-enquire>Proceed to Enquiry</button>';
    document.body.append(b,p); b.onclick=()=>p.classList.toggle('open'); p.querySelector('[data-enquire]').onclick=()=>{ if(!cartRead().length){alert('Your Plan Cart is empty.');return;} location.href='enquiry.html'; }; updateCart();
  }

  async function geocode(d){
    if(Number.isFinite(Number(d.latitude))&&Number.isFinite(Number(d.longitude))) return {lat:Number(d.latitude),lon:Number(d.longitude)};
    const q=encodeURIComponent(`${d.name}, ${d.region||''}, ${d.country||''}`.replace(/,\s*,/g,','));
    try { const rows=await json('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q='+q,{headers:{Accept:'application/json'}}); if(rows?.length)return {lat:+rows[0].lat,lon:+rows[0].lon}; } catch(_){ }
    return null;
  }
  function overpassQuery(lat,lon,radius){return `[out:json][timeout:35];nwr["tourism"~"^(hotel|resort|guest_house|hostel|motel|camp_site|chalet)$"](around:${radius},${lat},${lon});out center tags;`;}
  async function hotels(d){
    const p=await geocode(d); if(!p)return [];
    const eps=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter'];
    for(const radius of [20000,50000,80000]) for(const ep of eps){
      try { const data=await json(ep+'?data='+encodeURIComponent(overpassQuery(p.lat,p.lon,radius)),{headers:{Accept:'application/json'}}); const seen=new Set(),out=[];
        for(const i of data.elements||[]){const t=i.tags||{},name=String(t.name||'').trim(),k=name.toLowerCase(); if(!name||seen.has(k))continue; const lat=i.lat??i.center?.lat,lon=i.lon??i.center?.lon;if(!Number.isFinite(+lat)||!Number.isFinite(+lon))continue;seen.add(k);out.push({id:`osm-${i.type}-${i.id}`,name,lat:+lat,lon:+lon,address:[t['addr:street'],t['addr:city']||t['addr:town']||t['addr:village']||d.name].filter(Boolean).join(', '),stars:t.stars||t['hotel:stars']||'',website:t.website||''});}
        if(out.length)return out.slice(0,10);
      } catch(_){ }
    }
    return [];
  }
  async function photo(h,d){
    for(const q of [`${h.name} ${d.name}`,h.name]) try { const u='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*'; const data=await json(u); for(const x of Object.values(data.query?.pages||{})){const s=x.imageinfo?.[0]?.thumburl||x.imageinfo?.[0]?.url||'';if(s&&!/flag|logo|map|icon/i.test(x.title||''))return s;} } catch(_){ }
    return '';
  }
  function tags(d){return [...new Set([...(Array.isArray(d.tags)?d.tags:[]),'Local sightseeing','Scenic viewpoints','Local cuisine','Cultural experience','Leisure time'])].slice(0,8);}
  function plans(d){
    const h=tags(d), specs=[[2,1,'Quick Escape'],[3,2,'Short Discovery'],[5,4,'Complete Experience'],[7,6,'Relaxed Explorer']];
    return specs.map(([days,nights,style])=>({id:`${d.id}-${days}d`,days,nights,style,duration:`${days} Days / ${nights} Nights`,schedule:Array.from({length:days},(_,i)=>{if(i===0)return`Arrival, check-in and ${h[0]}.`;if(i===days-1)return`Breakfast, ${h[(i+1)%h.length]} and departure.`;return`Explore ${h[i%h.length]}, ${h[(i+1)%h.length]} and enjoy local experiences.`})}));
  }
  function renderHotels(page,d,hs){
    page.querySelectorAll('.nt-hotels-section').forEach(x=>x.remove()); const s=document.createElement('section');s.className='nt-destination-section nt-hotels-section';s.innerHTML=`<h2>🏨 Real Hotels & Stays in ${esc(d.name)}</h2><p>Live accommodation listings where available.</p><div class="nt-hotel-grid"></div>`;const g=s.querySelector('.nt-hotel-grid');
    if(!hs.length){g.innerHTML='<div class="nt-hotel-card"><strong>Live hotel listings unavailable right now.</strong><p>Try again shortly; we do not invent accommodation.</p></div>';} else hs.forEach(h=>{const c=document.createElement('article');c.className='nt-hotel-card';c.innerHTML=`${h.image?`<img src="${esc(h.image)}" alt="${esc(h.name)}" loading="lazy">`:''}<h3>${esc(h.name)}</h3><p>${h.stars?'⭐ '+esc(h.stars)+' stars':''}</p><p>${esc(h.address||d.name)}</p><button class="nt-card-btn">+ Add hotel to Plan Cart</button>`;const b=c.querySelector('button');b.onclick=()=>{const ok=cartAdd({id:`hotel-${h.id}`,type:'hotel',destination:d.name,country:d.country||'',hotel:h.name,image:h.image||'',address:h.address||''});b.textContent=ok?'✓ Added to Plan Cart':'✓ Already Added';b.classList.add('added');};g.appendChild(c);});page.appendChild(s);
  }
  function renderPlans(page,d){
    page.querySelectorAll('.nt-itineraries-section').forEach(x=>x.remove());const s=document.createElement('section');s.className='nt-destination-section nt-itineraries-section';s.innerHTML=`<h2>🗓️ Itineraries for ${esc(d.name)}</h2><p>Choose a trip length and add the plan to your cart.</p><div class="nt-itinerary-grid"></div>`;const g=s.querySelector('.nt-itinerary-grid');
    plans(d).forEach(p=>{const c=document.createElement('article');c.className='nt-itinerary-card';c.innerHTML=`<small>${esc(p.style)}</small><h3>${esc(p.duration)}</h3><ol>${p.schedule.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><button class="nt-card-btn">+ Add itinerary to Plan Cart</button>`;const b=c.querySelector('button');b.onclick=()=>{const ok=cartAdd({id:`itinerary-${p.id}`,type:'itinerary',destination:d.name,country:d.country||'',duration:p.duration,style:p.style,days:p.schedule});b.textContent=ok?'✓ Added to Plan Cart':'✓ Already Added';b.classList.add('added');};g.appendChild(c);});page.appendChild(s);
  }
  async function init(){
    const page=document.getElementById('destination-page'); if(!page||!window.DestinationEngine)return;
    const q=new URLSearchParams(location.search).get('id')||new URLSearchParams(location.search).get('destination')||new URLSearchParams(location.search).get('name')||''; if(!q)return;
    const d=await window.DestinationEngine.find(q); if(!d)return;
    cartUI(); renderPlans(page,d);
    const hs=await hotels(d); const enriched=[]; for(const h of hs){h.image=await photo(h,d);enriched.push(h);} renderHotels(page,d,enriched); updateCart();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true}); else init();
})();
