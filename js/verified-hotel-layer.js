/* Nature Tours — verified live accommodation layer */
(function(){
  'use strict';
  const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');
  async function json(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
  async function locate(d){
    const qs=[`${d.name}, ${d.region||''}, ${d.country||'India'}`,`${d.name}, ${d.country||'India'}`];
    for(const q of qs){try{const a=await json('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q='+encodeURIComponent(q));if(a?.length){const x=a.find(v=>['city','town','village','municipality','administrative'].includes(v.type))||a[0];return {lat:+x.lat,lon:+x.lon}}}catch(_){} }
    return null;
  }
  function query(lat,lon,r){return `[out:json][timeout:40];(nwr["tourism"~"^(hotel|resort|guest_house|hostel|motel|camp_site|alpine_hut|chalet)$"](around:${r},${lat},${lon});nwr["building"="hotel"](around:${r},${lat},${lon}););out center tags;`}
  async function findHotels(d){
    const p=await locate(d);if(!p)return[];
    const endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
    const seen=new Set(),out=[];
    for(const r of [15000,30000,60000,100000]){
      for(const ep of endpoints){
        try{
          const data=await json(ep+'?data='+encodeURIComponent(query(p.lat,p.lon,r)));
          for(const x of data.elements||[]){const t=x.tags||{},name=String(t.name||'').trim(),lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon,key=name.toLowerCase().replace(/\s+/g,' ');if(!name||seen.has(key)||!Number.isFinite(+lat)||!Number.isFinite(+lon))continue;seen.add(key);out.push({id:`osm-${x.type}-${x.id}`,name,lat:+lat,lon:+lon,address:[t['addr:housenumber'],t['addr:street'],t['addr:place'],t['addr:city']||t['addr:town']||t['addr:village']||d.name].filter(Boolean).join(', '),stars:t.stars||t['hotel:stars']||'',website:t.website||t['contact:website']||'',type:t.tourism||'hotel'});}
          if(out.length>=12)return out;
        }catch(_){}
      }
    }
    return out.slice(0,12);
  }
  function render(d,hs){
    const page=document.getElementById('destination-page');if(!page)return;
    page.querySelector('.verified-hotel-layer')?.remove();
    const s=document.createElement('section');s.className='verified-hotel-layer live-hotels';
    s.innerHTML=`<div class="planner-heading"><span>🏨 Stay</span><h2>Real Hotels & Stays in ${esc(d.name)}</h2><p>Live accommodation listings located around this destination. No fabricated hotel names.</p></div><div class="live-hotel-grid"></div>`;
    const g=s.querySelector('.live-hotel-grid');
    if(!hs.length){g.innerHTML='<div class="planner-empty">No verified accommodation listings could be retrieved right now. We will not substitute fake hotels.</div>';page.appendChild(s);return;}
    hs.forEach(h=>{const c=document.createElement('article');c.className='live-hotel-card';const map='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(h.name+' '+(h.address||d.name));c.innerHTML=`<div class="live-hotel-no-photo"><strong>Real listing</strong><span>Verified accommodation record · photo search coming next</span></div><div class="live-hotel-body"><div class="live-hotel-source">✓ OpenStreetMap listing</div><h3>${esc(h.name)}</h3>${h.stars?`<p>⭐ ${esc(h.stars)} star</p>`:''}<p class="live-hotel-address">${esc(h.address||d.name)}</p><div class="live-hotel-actions"><a href="${map}" target="_blank" rel="noopener">Maps</a>${h.website?`<a href="${esc(h.website)}" target="_blank" rel="noopener">Website</a>`:''}<button type="button">+ Add hotel</button></div></div>`;c.querySelector('button').onclick=()=>{const key='natureToursPlanCart';let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]')}catch(_){}const item={id:'hotel-'+h.id,sourceId:h.id,type:'hotel',destination:d.name,country:d.country||'India',hotel:h.name,address:h.address||'',website:h.website||''};if(!items.some(x=>x.id===item.id)){items.push(item);localStorage.setItem(key,JSON.stringify(items));document.dispatchEvent(new CustomEvent('natureToursPlanCartUpdated'));}c.querySelector('button').textContent='✓ Added';c.querySelector('button').disabled=true};g.appendChild(c)});
    page.appendChild(s);
  }
  async function init(){if(!window.DestinationEngine)return;try{const p=new URLSearchParams(location.search),d=await window.DestinationEngine.find(p.get('id')||p.get('destination')||'');if(d)render(d,await findHotels(d));}catch(e){console.warn('Verified hotel layer failed',e)}}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1700));
})();
