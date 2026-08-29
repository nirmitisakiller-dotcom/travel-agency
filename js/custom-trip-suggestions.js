"use strict";

(function(){
  const activityMap={
    adventure:["Scenic adventure","Outdoor experience","Nature excursion"],
    beach:["Beach time","Coastal sightseeing","Sunset experience"],
    coastal:["Coastal sightseeing","Beach time","Local seafood experience"],
    mountains:["Mountain viewpoint","Nature walk","Scenic excursion"],
    nature:["Nature exploration","Wildlife/nature experience","Scenic walk"],
    heritage:["Heritage sightseeing","Historic landmark visit","Local culture experience"],
    history:["Historic sightseeing","Museum/heritage visit","Local culture experience"],
    culture:["Cultural sightseeing","Local market visit","Regional food experience"],
    food:["Local food experience","Food market visit","Regional cuisine tasting"],
    sightseeing:["City sightseeing","Local highlights","Leisure exploration"]
  };
  function esc(v=""){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}
  function suggestionsFor(d){const tags=Array.isArray(d?.tags)?d.tags.map(x=>String(x).toLowerCase()):[];const out=[];tags.forEach(t=>(activityMap[t]||[]).forEach(x=>{if(!out.includes(x))out.push(x)}));if(!out.length)out.push("Local sightseeing","Flexible exploration","Local food experience");return out.slice(0,4)}
  function distribute(total,count){const n=Math.max(1,count);if(total<n)return Array.from({length:n},()=>1);const base=Math.floor(total/n),extra=total%n;return Array.from({length:n},(_,i)=>base+(i<extra?1:0))}
  async function generate(){const form=document.getElementById("custom-trip-form"),route=[...document.querySelectorAll("#route-stops .route-stop-input")].map(x=>x.value.trim()).filter(Boolean),start=form?.elements.startDate?.value,end=form?.elements.endDate?.value;if(!route.length)return;const a=start&&end?Math.round((new Date(`${end}T00:00:00`)-new Date(`${start}T00:00:00`))/86400000)+1:null;const days=Number.isFinite(a)&&a>0?a:route.length;const shares=distribute(days,route.length);const rows=[];if(window.DestinationEngine){await window.DestinationEngine.load()}for(let i=0;i<route.length;i++){let d=null;try{d=window.DestinationEngine?await window.DestinationEngine.find(route[i]):null}catch(_){}rows.push({city:route[i],days:shares[i],suggestions:suggestionsFor(d)})}let panel=document.getElementById("route-itinerary-suggestions");if(!panel){panel=document.createElement("section");panel.id="route-itinerary-suggestions";panel.className="route-itinerary-suggestions";document.querySelector(".custom-trip-route")?.after(panel)}panel.innerHTML=`<div class="route-itinerary-head"><div><span class="custom-trip-label">Smart route guide</span><h2>Suggested itinerary</h2><p>Starting points based on your route and destination tags. You can adjust the trip later.</p></div><span class="route-itinerary-total">${days} days</span></div><div class="route-itinerary-list">${rows.map((r,i)=>`<article class="route-itinerary-card"><div class="route-itinerary-number">${i+1}</div><div><strong>${esc(r.city)}</strong><span>${r.days} ${r.days===1?"day":"days"}</span><ul>${r.suggestions.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div></article>`).join("")}</div>`;form.dataset.routeSuggestions=JSON.stringify(rows);return rows}
  document.addEventListener("DOMContentLoaded",()=>{const form=document.getElementById("custom-trip-form");if(!form)return;const trigger=()=>generate();document.getElementById("add-route-stop")?.addEventListener("click",()=>setTimeout(trigger,0));form.elements.startDate?.addEventListener("change",trigger);form.elements.endDate?.addEventListener("change",trigger);document.getElementById("route-stops")?.addEventListener("input",()=>{clearTimeout(window.__routeSuggestTimer);window.__routeSuggestTimer=setTimeout(trigger,220)});form.addEventListener("submit",()=>{try{const rows=JSON.parse(form.dataset.routeSuggestions||"[]");const cart=JSON.parse(localStorage.getItem("natureToursPlanCart")||"[]");const item=cart[cart.length-1];if(item?.customTrip){item.customTrip.itinerarySuggestions=rows;cart[cart.length-1]=item;localStorage.setItem("natureToursPlanCart",JSON.stringify(cart))}}catch(_){} });trigger()});
})();
