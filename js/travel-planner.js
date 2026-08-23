/* Nature Tours live hotel + itinerary layer
 * Hotels: OpenStreetMap/Overpass real hotel POIs.
 * Hotel photos: Wikimedia Commons only when a matching hotel photo exists.
 * No generated/stock hotel images and no repeated photo URL on a page.
 */
(function(){
  'use strict';
  const WA='919822339466';
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  const cache=new Map();
  const usedImages=new Set();
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  async function json(url,options){
    const r=await fetch(url,options);
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }
  async function geocode(d){
    const key='geo:'+d.id;
    if(cache.has(key)) return cache.get(key);
    const q=encodeURIComponent([d.name,d.state,d.country||'India'].filter(Boolean).join(', '));
    try{
      const a=await json('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+q,{headers:{Accept:'application/json'}});
      const p=a&&a[0]?{lat:+a[0].lat,lon:+a[0].lon}:null;
      cache.set(key,p); return p;
    }catch(e){cache.set(key,null);return null}
  }
  async function hotelsFromOSM(d){
    const key='hotels:'+d.id;
    if(cache.has(key)) return cache.get(key);
    const p=await geocode(d);
    if(!p){cache.set(key,[]);return []}
    const q=`[out:json][timeout:25];(nwr["tourism"="hotel"](around:18000,${p.lat},${p.lon});nwr["tourism"="hostel"](around:12000,${p.lat},${p.lon}););out center tags;`;
    try{
      const data=await json('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain'},body:q});
      const out=[],seen=new Set();
      (data.elements||[]).forEach(x=>{
        const name=x.tags&&x.tags.name;
        if(!name)return;
        const k=name.trim().toLowerCase();
        if(seen.has(k))return; seen.add(k);
        const lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon;
        out.push({id:`osm-${x.type}-${x.id}`,name,lat,lon,address:[x.tags['addr:housenumber'],x.tags['addr:street'],x.tags['addr:city']||d.name].filter(Boolean).join(', '),stars:x.tags.stars||x.tags['hotel:stars']||'',website:x.tags.website||'',source:'OpenStreetMap'});
      });
      const result=out.slice(0,8);cache.set(key,result);return result;
    }catch(e){cache.set(key,[]);return []}
  }
  async function commonsPhoto(h,d){
    const terms=[`${h.name} ${d.name} hotel`,h.name+' hotel'];
    for(const term of terms){
      try{
        const u='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(term)+'&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*';
        const j=await json(u);
        const pages=Object.values(j.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
        for(const p of pages){
          const title=String(p.title||'').toLowerCase();
          if(!/hotel|resort|lodge|inn|hostel|residence|palace/.test(title))continue;
          const src=p.imageinfo?.[0]?.thumburl||p.imageinfo?.[0]?.url||'';
          if(src&&!usedImages.has(src)){usedImages.add(src);return src}
        }
      }catch(e){}
      await sleep(80);
    }
    return '';
  }
  async function enrichHotels(d,hotels){
    const result=[];
    for(const h of hotels){
      const image=await commonsPhoto(h,d);
      result.push({...h,image});
      if(result.length>=6)break;
    }
    return result;
  }
  function destinationHighlights(d){
    const tags=Array.isArray(d.tags)?d.tags.filter(Boolean):[];
    const fallback=['Local sightseeing','Scenic viewpoints','Local cuisine','Cultural experience','Leisure time'];
    return [...new Set([...tags,...fallback])].slice(0,8);
  }
  function makePlans(d){
    const h=destinationHighlights(d),name=d.name;
    const specs=[
      [2,1,'Quick Escape'],[3,2,'Short Discovery'],[5,4,'Complete Experience'],[7,6,'Relaxed Explorer']
    ];
    return specs.map(([days,nights,style])=>({id:`${d.id}-${days}d`,days,nights,style,name,duration:`${days} Days / ${nights} Nights`,schedule:Array.from({length:days},(_,i)=>{
      if(i===0)return {day:1,morning:'Arrival and local orientation',afternoon:`Check in and explore ${h[0]}`,evening:`Relax and experience ${h[1]||'local highlights'}`};
      if(i===days-1)return {day:days,morning:`Breakfast and ${h[(i+1)%h.length]}`,afternoon:'Leisure / shopping / local experience',evening:'Departure'};
      return {day:i+1,morning:`Explore ${h[(i)%h.length]}`,afternoon:`Sightseeing: ${h[(i+1)%h.length]}`,evening:`Local experience: ${h[(i+2)%h.length]}`};
    })}));
  }
  function addCart(item){
    try{
      if(typeof window.planCartAdd==='function')return !!window.planCartAdd(item);
      const k='natureToursPlanCart',a=JSON.parse(localStorage.getItem(k)||'[]');
      if(a.some(x=>x.id===item.id))return false;a.push(item);localStorage.setItem(k,JSON.stringify(a));document.dispatchEvent(new CustomEvent('natureToursPlanCartUpdated'));return true;
    }catch(e){return false}
  }
  function hotelCard(h,d){
    const photo=h.image?`<img class="live-hotel-photo" src="${esc(h.image)}" alt="${esc(h.name)} hotel" loading="lazy">`:`<div class="live-hotel-no-photo"><strong>Photo unavailable</strong><span>Real hotel listing</span></div>`;
    const map=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name+' '+(h.address||d.name))}`;
    const wa=`https://wa.me/${WA}?text=${encodeURIComponent(`Hello Nature Tours, I would like to enquire about ${h.name} in ${d.name}.`)}`;
    const card=document.createElement('article');card.className='live-hotel-card';card.innerHTML=`${photo}<div class="live-hotel-body"><div class="live-hotel-source">✓ Real listing · OpenStreetMap</div><h3>${esc(h.name)}</h3>${h.stars?`<p>⭐ ${esc(h.stars)} star</p>`:''}<p class="live-hotel-address">${esc(h.address||d.name)}</p><div class="live-hotel-actions"><a href="${esc(map)}" target="_blank" rel="noopener">Maps</a><a href="${esc(wa)}" target="_blank" rel="noopener">Enquire</a><button type="button">+ Add hotel</button></div></div>`;
    card.querySelector('button').onclick=()=>{const ok=addCart({id:`hotel-${h.id}`,sourceId:h.id,type:'hotel',destination:d.name,country:d.country||'India',hotel:h.name,address:h.address||'',image:h.image||'',website:h.website||''});const b=card.querySelector('button');b.textContent=ok?'✓ Added':'✓ Already Added';b.disabled=true};
    return card;
  }
  function renderHotels(d,hotels){
    const page=document.getElementById('destination-page');if(!page)return;
    const old=page.querySelector('.live-hotels');if(old)old.remove();
    const s=document.createElement('section');s.className='live-hotels';s.innerHTML=`<div class="planner-heading"><span>🏨 Stay</span><h2>Real Hotels in ${esc(d.name)}</h2><p>Live hotel listings from OpenStreetMap. Hotel photos are shown only when a matching Wikimedia Commons photo is available — no stock or repeated hotel images.</p></div><div class="live-hotel-grid"></div>`;
    const grid=s.querySelector('.live-hotel-grid');hotels.forEach(h=>grid.appendChild(hotelCard(h,d)));
    if(!hotels.length)grid.innerHTML='<div class="planner-empty">No hotel POIs were returned for this destination right now. Try again later.</div>';
    page.appendChild(s);
  }
  function renderPlans(d,hotels){
    const page=document.getElementById('destination-page');if(!page)return;
    const old=page.querySelector('.live-itineraries');if(old)old.remove();
    const plans=makePlans(d),s=document.createElement('section');s.className='live-itineraries';
    s.innerHTML=`<div class="planner-heading"><span>🗓️ Plan your trip</span><h2>Itineraries for ${esc(d.name)}</h2><p>Pick a trip length, connect a hotel, and add the complete plan to your Plan Cart.</p></div><div class="live-itinerary-grid"></div>`;
    const grid=s.querySelector('.live-itinerary-grid');
    plans.forEach(p=>{const c=document.createElement('article');c.className='live-itinerary-card';const options=hotels.map((h,i)=>`<option value="${i}">${esc(h.name)}</option>`).join('');c.innerHTML=`<div class="live-plan-badge">${esc(p.style)}</div><h3>${esc(p.duration)}</h3><label>Hotel for this plan<select>${options||'<option value="">Hotel selection unavailable</option>'}</select></label><div class="live-schedule">${p.schedule.map(x=>`<div class="live-day"><strong>Day ${x.day}</strong><p><b>Morning:</b> ${esc(x.morning)}</p><p><b>Afternoon:</b> ${esc(x.afternoon)}</p><p><b>Evening:</b> ${esc(x.evening)}</p></div>`).join('')}</div><button class="live-plan-add" type="button">+ Add itinerary to Plan Cart</button>`;
      c.querySelector('button').onclick=()=>{const idx=Number(c.querySelector('select').value);const h=hotels[idx]||null;const ok=addCart({id:`itinerary-${p.id}`,sourceId:p.id,type:'itinerary',destination:p.name,country:d.country||'India',duration:p.duration,style:p.style,schedule:p.schedule,hotel:h?{id:h.id,name:h.name,image:h.image||'',address:h.address||''}:null,image:d.image||''});const b=c.querySelector('button');b.textContent=ok?'✓ Added to Plan Cart':'✓ Already Added';b.classList.toggle('added',true)};
      grid.appendChild(c);
    });page.appendChild(s);
  }
  async function init(){
    const page=document.getElementById('destination-page');if(!page||!window.DestinationEngine)return;
    try{const d=await window.DestinationEngine.find(new URLSearchParams(location.search).get('id')||'');if(!d)return;
      const hotels=await hotelsFromOSM(d);const enriched=await enrichHotels(d,hotels);renderHotels(d,enriched);renderPlans(d,enriched);
    }catch(e){console.warn('Live travel planner failed',e)}
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1300));
})();
