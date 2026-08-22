// ==========================================
// Nature Tours Plan Cart
// Global destination picker + enquiry cart
// ==========================================

"use strict";

const PLAN_CART_KEY = "natureToursPlanCart";
const PLAN_CART_WHATSAPP = "919822339466";

function planCartRead() {
    try { const value = JSON.parse(localStorage.getItem(PLAN_CART_KEY) || "[]"); return Array.isArray(value) ? value : []; } catch (_) { return []; }
}
function planCartWrite(items) { localStorage.setItem(PLAN_CART_KEY, JSON.stringify(items)); document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated")); }
function planCartAdd(item) { if (!item?.id || !item?.destination) return false; const existing = planCartRead(); if (existing.some(x => x.id === item.id)) return false; existing.push(item); planCartWrite(existing); return true; }
function planCartEscape(value = "") { return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function planCartCount() { return planCartRead().length; }

function destinationToCartItem(d) {
    if (!d) return null;
    const id = String(d.id || d.name || "destination").trim().toLowerCase();
    return { id:`destination-${id}`, destination:d.name || d.destination || "Destination", country:d.country || "", duration:d.duration || "Custom plan", style:d.style || "Custom itinerary", url:d.id ? `destination.html?id=${encodeURIComponent(d.id)}` : "" };
}

async function loadPlanDestinations() {
    let destinations = [];
    try { if (window.DestinationEngine) destinations = await window.DestinationEngine.load(); } catch (_) {}
    try {
        const dynamic = JSON.parse(localStorage.getItem("natureToursDynamicDestination") || "null");
        if (dynamic?.name && !destinations.some(d => String(d.id) === String(dynamic.id))) destinations = destinations.concat(dynamic);
    } catch (_) {}
    return Array.isArray(destinations) ? destinations : [];
}

function ensurePlanCartStyles() {
    if (document.querySelector('link[data-nature-plan-cart-css]')) return;
    const link=document.createElement("link"); link.rel="stylesheet"; link.href="css/plan-cart.css?v=4"; link.dataset.naturePlanCartCss="true"; document.head.appendChild(link);
}

function ensurePlanCartMarkup() {
    if (document.getElementById("plan-cart-panel")) return;
    const button=document.createElement("button"); button.id="open-plan-cart"; button.className="plan-cart-open-btn"; button.type="button"; button.innerHTML='🧳 My Plan Cart <span class="plan-cart-badge" data-plan-cart-count hidden>0</span>'; document.body.appendChild(button);
    const panel=document.createElement("div"); panel.id="plan-cart-panel"; panel.className="plan-cart-panel"; panel.setAttribute("aria-hidden","true");
    panel.innerHTML=`<div id="plan-cart-backdrop" class="plan-cart-backdrop"></div><aside class="plan-cart-drawer" aria-label="My travel plan cart">
      <div class="plan-cart-head"><div><span class="sub-badge">Build Your Trip</span><h2>My Plan Cart</h2><p class="plan-cart-subtitle">Search and add destinations to your trip.</p></div><button id="close-plan-cart" class="plan-cart-close" type="button" aria-label="Close plan cart">×</button></div>
      <div class="plan-destination-picker"><label for="plan-destination-search">Destination</label><div class="plan-destination-search-wrap"><span class="plan-destination-search-icon">⌕</span><input id="plan-destination-search" type="search" autocomplete="off" placeholder="Search Paris, Bali, Ladakh..." aria-label="Search destinations"></div><div id="plan-destination-results" class="plan-destination-results" role="listbox" aria-label="Destination suggestions"></div></div>
      <div class="plan-cart-section-title"><span>Your selected destinations</span><strong data-plan-cart-count>0</strong></div><div id="plan-cart-empty" class="plan-cart-empty">Your plan is empty. Search above or use <b>Add to Plan</b> on any destination card.</div><div id="plan-cart-list"></div>
      <form id="plan-cart-enquiry-form" class="plan-cart-form"><div class="plan-cart-form-title">Tell us about your trip</div><div><label for="plan-cart-dates">Travel dates</label><input id="plan-cart-dates" name="travelDates" type="text" placeholder="e.g. 12–18 December 2026"></div><div class="plan-cart-form-row"><div><label for="plan-cart-travellers">Travellers</label><input id="plan-cart-travellers" name="travellers" type="text" placeholder="2 adults"></div><div><label for="plan-cart-budget">Budget</label><input id="plan-cart-budget" name="budget" type="text" placeholder="₹2–3 lakh"></div></div><div><label for="plan-cart-notes">Special requirements</label><textarea id="plan-cart-notes" name="notes" rows="3" placeholder="Hotels, flights, honeymoon, food, accessibility, etc."></textarea></div><button class="plan-cart-submit" type="submit">Send Complete Enquiry on WhatsApp</button><p class="plan-cart-note">No online payment or automatic booking. This is an enquiry basket.</p></form>
    </aside>`;
    document.body.appendChild(panel);
}

let planDestinationCatalogue=[];

function updatePlanCartButtons() {
    const count=planCartCount();
    document.querySelectorAll("[data-plan-cart-count]").forEach(el=>{el.textContent=String(count); if(el.classList.contains("plan-cart-badge")) el.hidden=count===0;});
}

function renderPlanCart() {
    const list=document.getElementById("plan-cart-list"), empty=document.getElementById("plan-cart-empty"); if(!list||!empty)return;
    const items=planCartRead(); empty.hidden=items.length>0;
    list.innerHTML=items.map(item=>`<article class="plan-cart-item"><div class="plan-cart-item-info"><span class="plan-cart-pin">📍</span><div><h3>${planCartEscape(item.destination)}</h3><p>${planCartEscape(item.country||"")} · ${planCartEscape(item.duration||"Custom plan")}</p></div></div><button type="button" class="plan-cart-remove" data-remove-plan="${planCartEscape(item.id)}">Remove</button></article>`).join("");
    list.querySelectorAll("[data-remove-plan]").forEach(b=>b.addEventListener("click",()=>{planCartWrite(planCartRead().filter(x=>x.id!==b.dataset.removePlan));renderPlanCart();renderDestinationResults();}));
    updatePlanCartButtons();
}

function renderDestinationResults() {
    const box=document.getElementById("plan-destination-results"); if(!box)return;
    const query=(document.getElementById("plan-destination-search")?.value||"").trim().toLowerCase();
    const selected=new Set(planCartRead().map(x=>x.id));
    let matches=planDestinationCatalogue.filter(d=>[d.name,d.country,d.continent,d.region,...(d.tags||[])].filter(Boolean).join(" ").toLowerCase().includes(query));
    matches=matches.slice(0,query?12:8);
    if(!matches.length){box.innerHTML='<div class="plan-destination-no-results">No catalogue match. If you reached a destination through search, open that destination page and use <b>Add to Plan</b>.</div>';return;}
    box.innerHTML=matches.map(d=>{const item=destinationToCartItem(d),added=selected.has(item.id);return `<button type="button" class="plan-destination-result ${added?"is-added":""}" data-pick-destination="${planCartEscape(d.id||d.name)}"><span class="plan-destination-result-icon">${d.type==="domestic"?"🇮🇳":"🌍"}</span><span class="plan-destination-result-text"><strong>${planCartEscape(d.name)}</strong><small>${planCartEscape(d.country||"")} · ${planCartEscape(d.region||d.continent||"")}</small></span><span class="plan-destination-result-action">${added?"✓ Added":"+ Add"}</span></button>`;}).join("");
    box.querySelectorAll("[data-pick-destination]").forEach(b=>b.addEventListener("click",()=>{const d=planDestinationCatalogue.find(x=>String(x.id||x.name)===String(b.dataset.pickDestination));if(!d)return;planCartAdd(destinationToCartItem(d));renderPlanCart();renderDestinationResults();}));
}

async function initializeDestinationPicker(){planDestinationCatalogue=await loadPlanDestinations();renderDestinationResults();const input=document.getElementById("plan-destination-search");if(input&&!input.dataset.bound){input.addEventListener("input",renderDestinationResults);input.dataset.bound="true";}}

function ensureCardButtonStyles(){if(document.getElementById("nature-plan-card-button-style"))return;const style=document.createElement("style");style.id="nature-plan-card-button-style";style.textContent=`.nature-plan-card-action{margin-top:12px;width:100%;border:0;border-radius:9px;padding:9px 12px;background:#168bd3;color:#fff;font-weight:800;font-size:12px;cursor:pointer}.nature-plan-card-action:hover{filter:brightness(.96)}.nature-plan-card-action.is-added{background:#0f9d58}.nature-current-destination-action{margin:18px 0 6px!important;display:inline-flex!important;width:auto!important}`;document.head.appendChild(style);}
function cardPlanData(card){const heading=card.querySelector("h3,h4,h2"),image=card.querySelector("img");if(!heading||!image)return null;const destination=heading.textContent.trim();if(!destination||/nature tours|wild safaris|honeymoon packages|medical tourism/i.test(destination))return null;const id=`card-${window.location.pathname}-${destination.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;return{id,destination,country:"",duration:"Custom plan",style:"Custom itinerary"};}
function addPlanButtonToCard(card){if(card.querySelector(".nature-plan-card-action")||card.querySelector(".itinerary-secondary"))return;const item=cardPlanData(card);if(!item)return;const button=document.createElement("button");button.type="button";button.className="nature-plan-card-action";button.textContent=planCartRead().some(x=>x.id===item.id)?"✓ Added to Plan":"🧳 Add to Plan";if(planCartRead().some(x=>x.id===item.id))button.classList.add("is-added");button.addEventListener("click",()=>{const added=planCartAdd(item);button.textContent=added?"✓ Added to Plan":"✓ Already Added";button.classList.add("is-added");openPlanCart();});(card.querySelector(".card-meta")||card).appendChild(button);}
function enhancePlanCards(){ensureCardButtonStyles();document.querySelectorAll(".glance-card").forEach(addPlanButtonToCard);}

async function addCurrentDestinationButton(){const host=document.getElementById("destination-page");if(!host||host.querySelector(".nature-current-destination-action"))return;let destination=null;try{const params=new URLSearchParams(location.search),id=params.get("id")||localStorage.getItem("natureToursDestination");if(window.DestinationEngine){const all=await window.DestinationEngine.load();destination=all.find(d=>String(d.id)===String(id));}if(!destination)destination=JSON.parse(localStorage.getItem("natureToursDynamicDestination")||"null");}catch(_){}if(!destination)return;const item=destinationToCartItem(destination),button=document.createElement("button");button.type="button";button.className="nature-plan-card-action nature-current-destination-action";const sync=()=>{const added=planCartRead().some(x=>x.id===item.id);button.textContent=added?"✓ Added to My Plan":"🧳 Add to My Plan";button.classList.toggle("is-added",added);};sync();button.addEventListener("click",()=>{planCartAdd(item);sync();openPlanCart();});const heading=host.querySelector("h1,h2,h3");(heading?.parentElement||host).appendChild(button);}

function buildWhatsAppLink(items,form){const destinationList=items.map(i=>`• ${i.destination}${i.country?`, ${i.country}`:""} — ${i.duration||"Custom plan"}`).join("%0A");const dates=encodeURIComponent(form?.travelDates?.value?.trim()||"Not specified"),travellers=encodeURIComponent(form?.travellers?.value?.trim()||"Not specified"),budget=encodeURIComponent(form?.budget?.value?.trim()||"Not specified"),notes=encodeURIComponent(form?.notes?.value?.trim()||"None");return `https://wa.me/${PLAN_CART_WHATSAPP}?text=Hello%20Nature%20Tours,%0A%0AI%20would%20like%20to%20discuss%20these%20travel%20plans:%0A%0A${destinationList}%0A%0ATravel%20dates:%20${dates}%0ATravellers:%20${travellers}%0ABudget:%20${budget}%0ASpecial%20requirements:%20${notes}%0A%0APlease%20contact%20me%20with%20a%20customised%20plan%20and%20quotation.%0A%0AThank%20you.`;}

function openPlanCart(){const panel=document.getElementById("plan-cart-panel");if(!panel)return;panel.classList.add("is-open");panel.setAttribute("aria-hidden","false");renderPlanCart();renderDestinationResults();setTimeout(()=>document.getElementById("plan-destination-search")?.focus(),120);}
function closePlanCart(){const panel=document.getElementById("plan-cart-panel");if(!panel)return;panel.classList.remove("is-open");panel.setAttribute("aria-hidden","true");}

function initializePlanCart(){ensurePlanCartStyles();ensurePlanCartMarkup();ensureCardButtonStyles();enhancePlanCards();initializeDestinationPicker();addCurrentDestinationButton();const openButton=document.getElementById("open-plan-cart"),closeButton=document.getElementById("close-plan-cart"),backdrop=document.getElementById("plan-cart-backdrop"),form=document.getElementById("plan-cart-enquiry-form");if(openButton&&!openButton.dataset.planCartBound){openButton.addEventListener("click",openPlanCart);openButton.dataset.planCartBound="true";}if(closeButton&&!closeButton.dataset.planCartBound){closeButton.addEventListener("click",closePlanCart);closeButton.dataset.planCartBound="true";}if(backdrop&&!backdrop.dataset.planCartBound){backdrop.addEventListener("click",closePlanCart);backdrop.dataset.planCartBound="true";}if(form&&!form.dataset.planCartBound){form.addEventListener("submit",e=>{e.preventDefault();const items=planCartRead();if(!items.length){alert("Please add at least one destination to your plan first.");return;}window.open(buildWhatsAppLink(items,form),"_blank","noopener,noreferrer");});form.dataset.planCartBound="true";}if(!document.body.dataset.planCartKeyBound){document.addEventListener("keydown",e=>{if(e.key==="Escape")closePlanCart();});document.addEventListener("natureToursPlanCartUpdated",()=>{updatePlanCartButtons();renderPlanCart();renderDestinationResults();enhancePlanCards();});window.addEventListener("storage",e=>{if(e.key===PLAN_CART_KEY){updatePlanCartButtons();renderPlanCart();renderDestinationResults();}});document.body.dataset.planCartKeyBound="true";}if(!document.body.dataset.planCartObserverBound){const observer=new MutationObserver(()=>{enhancePlanCards();addCurrentDestinationButton();});observer.observe(document.body,{childList:true,subtree:true});document.body.dataset.planCartObserverBound="true";}updatePlanCartButtons();renderPlanCart();}

window.NatureToursPlanCart={read:planCartRead,write:planCartWrite,add:planCartAdd,count:planCartCount,open:openPlanCart,close:closePlanCart,render:renderPlanCart};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializePlanCart,{once:true});else initializePlanCart();
