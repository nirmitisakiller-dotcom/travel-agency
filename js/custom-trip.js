"use strict";

const CUSTOM_TRIP_CART_KEY = "natureToursPlanCart";

function readCustomTripCart(){try{const value=JSON.parse(localStorage.getItem(CUSTOM_TRIP_CART_KEY)||"[]");return Array.isArray(value)?value:[]}catch(_){return[]}}
function writeCustomTripCart(items){localStorage.setItem(CUSTOM_TRIP_CART_KEY,JSON.stringify(items));document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated"))}
function escapeCustomTrip(value=""){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}
function formatDateRange(start,end){if(!start&&!end)return "Dates to be confirmed";if(start&&end)return `${start} → ${end}`;return start?`From ${start}`:`Until ${end}`}
function numberValue(form,name){return Math.max(0,Number(form.elements[name]?.value||0))}
function loadDestinationEngine(){return new Promise(resolve=>{if(window.DestinationEngine)return resolve(true);const s=document.createElement("script");s.src="js/destinations.js?v=4";s.onload=()=>resolve(!!window.DestinationEngine);s.onerror=()=>resolve(false);document.head.appendChild(s)})}
function destinationSummary(d){if(!d)return "";return [d.name,d.country,d.region||d.state].filter(Boolean).join(" · ")}
function renderDestinationSuggestions(list,box,input){if(!box)return;const items=(Array.isArray(list)?list:[]).slice(0,8);box.innerHTML=items.length?items.map((d,i)=>`<button type="button" class="custom-trip-destination-option" data-destination-index="${i}"><strong>${escapeCustomTrip(d.name)}</strong><small>${escapeCustomTrip(destinationSummary(d))}</small></button>`).join(""):"<div class=\"custom-trip-destination-empty\">No catalogue match. You can still enter a custom destination.</div>";items.forEach((d,i)=>{box.querySelector(`[data-destination-index="${i}"]`)?.addEventListener("click",()=>{input.value=d.name;input.dataset.destinationId=String(d.id||"");input.dataset.destinationName=d.name;input.dataset.destinationCountry=d.country||"";input.dataset.destinationRegion=d.region||d.state||"";box.hidden=true;input.dispatchEvent(new Event("change",{bubbles:true}))})})}
function setupDestinationPicker(form){const input=form.elements.destination;if(!input)return;let box=document.getElementById("custom-trip-destination-suggestions");if(!box){box=document.createElement("div");box.id="custom-trip-destination-suggestions";box.className="custom-trip-destination-suggestions";input.parentElement.appendChild(box)}let timer=0;const search=async()=>{const q=input.value.trim();if(!q){box.hidden=true;return}await loadDestinationEngine();if(!window.DestinationEngine){box.hidden=true;return}const results=await window.DestinationEngine.search(q);renderDestinationSuggestions(results,box,input);box.hidden=false};input.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(search,180)});input.addEventListener("focus",()=>{if(input.value.trim())search()});document.addEventListener("click",e=>{if(!input.parentElement.contains(e.target))box.hidden=true})}
function createRouteStop(value="",onChange=()=>{}){const row=document.createElement("div");row.className="custom-trip-route-stop";row.innerHTML=`<span class="route-stop-number"></span><input type="text" class="route-stop-input" placeholder="City or destination" value=""><button type="button" class="route-remove" aria-label="Remove city">Remove</button>`;const input=row.querySelector("input");input.value=value;input.addEventListener("input",onChange);row.querySelector(".route-remove").addEventListener("click",()=>{row.remove();onChange();refreshRouteNumbers()});return row}
function refreshRouteNumbers(){document.querySelectorAll("#route-stops .custom-trip-route-stop").forEach((row,i)=>{row.querySelector(".route-stop-number").textContent=String(i+1);row.querySelector(".route-remove").disabled=document.querySelectorAll("#route-stops .custom-trip-route-stop").length<=1})}
function setupRouteBuilder(){const box=document.getElementById("route-stops"),add=document.getElementById("add-route-stop");if(!box||!add)return;const sync=()=>refreshRouteNumbers();box.appendChild(createRouteStop(document.getElementById("trip-destination")?.value||"",sync));add.addEventListener("click",()=>{box.appendChild(createRouteStop("",sync));refreshRouteNumbers();box.lastElementChild.querySelector("input")?.focus()});refreshRouteNumbers()}
function getRouteStops(){return [...document.querySelectorAll("#route-stops .route-stop-input")].map(x=>x.value.trim()).filter(Boolean)}
function renderReview(data){const box=document.getElementById("custom-trip-review"),content=document.getElementById("custom-trip-review-content");if(!box||!content)return;const people=[`${data.adults} adult${data.adults===1?"":"s"}`,data.kids?`${data.kids} kid${data.kids===1?"":"s"}`:"",data.babies?`${data.babies} bab${data.babies===1?"y":"ies"}`:"",data.seniors?`${data.seniors} senior citizen${data.seniors===1?"":"s"}`:""].filter(Boolean).join(", ");const route=data.route.length?data.route.join(" → "):data.destination;content.innerHTML=`<div class="review-row"><strong>Route</strong><span>${escapeCustomTrip(route)}</span></div><div class="review-row"><strong>Dates</strong><span>${escapeCustomTrip(data.dates)}</span></div><div class="review-row"><strong>Travellers</strong><span>${escapeCustomTrip(people)}</span></div><div class="review-row"><strong>Budget</strong><span>${escapeCustomTrip(data.budget||"Not specified")}</span></div><div class="review-row"><strong>Preferences</strong><span>${escapeCustomTrip(data.preferences.length?data.preferences.join(", "):"Open to suggestions")}</span></div>${data.notes?`<div class="review-notes"><strong>Notes</strong><p>${escapeCustomTrip(data.notes)}</p></div>`:""}`;box.hidden=false}

document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("custom-trip-form");if(!form)return;
 const start=form.elements.startDate,end=form.elements.endDate;
 setupDestinationPicker(form);setupRouteBuilder();
 form.elements.destination?.addEventListener("change",()=>{const first=document.querySelector("#route-stops .route-stop-input");if(first&&!first.value)first.value=form.elements.destination.value});
 start?.addEventListener("change",()=>{if(start.value)end.min=start.value});
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const destination=String(form.elements.destination.value||"").trim();
  const route=getRouteStops();
  if(!destination){form.elements.destination.focus();return}
  if(route.length&&route[0].toLowerCase()!==destination.toLowerCase())route.unshift(destination);
  if(start.value&&end.value&&end.value<start.value){end.setCustomValidity("End date must be on or after the start date.");end.reportValidity();return}
  end.setCustomValidity("");
  const data={destination,destinationId:form.elements.destination.dataset.destinationId||"",destinationMeta:[form.elements.destination.dataset.destinationCountry,form.elements.destination.dataset.destinationRegion].filter(Boolean).join(" · "),route,dates:formatDateRange(start.value,end.value),startDate:start.value||"",endDate:end.value||"",adults:numberValue(form,"adults"),kids:numberValue(form,"kids"),babies:numberValue(form,"babies"),seniors:numberValue(form,"seniors"),budget:String(form.elements.budget.value||"").trim(),preferences:[...form.querySelectorAll('input[name="preferences"]:checked')].map(x=>x.value),notes:String(form.elements.notes.value||"").trim()};
  const id=`custom-trip-${Date.now()}`;
  const item={id,type:"custom-trip",destination,country:form.elements.destination.dataset.destinationCountry||"",duration:data.dates,style:"Custom trip",customTrip:data,createdAt:new Date().toISOString()};
  const cart=readCustomTripCart();cart.push(item);writeCustomTripCart(cart);
  renderReview(data);
  form.querySelector(".custom-trip-primary").textContent="✓ Added to My Plan Cart";
  form.querySelector(".custom-trip-primary").disabled=true;
  const notice=document.createElement("div");notice.className="custom-trip-success";notice.innerHTML=`<strong>Your custom trip is ready.</strong><span>It has been added to My Plan Cart.</span><a href="index.html#plan-cart-panel">Open My Plan Cart →</a>`;form.querySelector(".custom-trip-actions")?.before(notice);
 });
});
