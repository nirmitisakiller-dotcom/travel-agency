"use strict";

const CUSTOM_TRIP_CART_KEY = "natureToursPlanCart";

function readCustomTripCart(){try{const value=JSON.parse(localStorage.getItem(CUSTOM_TRIP_CART_KEY)||"[]");return Array.isArray(value)?value:[]}catch(_){return[]}}
function writeCustomTripCart(items){localStorage.setItem(CUSTOM_TRIP_CART_KEY,JSON.stringify(items));document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated"))}
function escapeCustomTrip(value=""){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}
function formatDateRange(start,end){if(!start&&!end)return "Dates to be confirmed";if(start&&end)return `${start} → ${end}`;return start?`From ${start}`:`Until ${end}`}
function numberValue(form,name){return Math.max(0,Number(form.elements[name]?.value||0))}
function renderReview(data){const box=document.getElementById("custom-trip-review"),content=document.getElementById("custom-trip-review-content");if(!box||!content)return;const people=[`${data.adults} adult${data.adults===1?"":"s"}`,data.kids?`${data.kids} kid${data.kids===1?"":"s"}`:"",data.babies?`${data.babies} bab${data.babies===1?"y":"ies"}`:"",data.seniors?`${data.seniors} senior citizen${data.seniors===1?"":"s"}`:""].filter(Boolean).join(", ");content.innerHTML=`<div class="review-row"><strong>Destination</strong><span>${escapeCustomTrip(data.destination)}</span></div><div class="review-row"><strong>Dates</strong><span>${escapeCustomTrip(data.dates)}</span></div><div class="review-row"><strong>Travellers</strong><span>${escapeCustomTrip(people)}</span></div><div class="review-row"><strong>Budget</strong><span>${escapeCustomTrip(data.budget||"Not specified")}</span></div><div class="review-row"><strong>Preferences</strong><span>${escapeCustomTrip(data.preferences.length?data.preferences.join(", "):"Open to suggestions")}</span></div>${data.notes?`<div class="review-notes"><strong>Notes</strong><p>${escapeCustomTrip(data.notes)}</p></div>`:""}`;box.hidden=false}

document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("custom-trip-form");if(!form)return;
 const start=form.elements.startDate,end=form.elements.endDate;
 start?.addEventListener("change",()=>{if(start.value)end.min=start.value});
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const destination=String(form.elements.destination.value||"").trim();
  if(!destination){form.elements.destination.focus();return}
  if(start.value&&end.value&&end.value<start.value){end.setCustomValidity("End date must be on or after the start date.");end.reportValidity();return}
  end.setCustomValidity("");
  const data={destination,dates:formatDateRange(start.value,end.value),startDate:start.value||"",endDate:end.value||"",adults:numberValue(form,"adults"),kids:numberValue(form,"kids"),babies:numberValue(form,"babies"),seniors:numberValue(form,"seniors"),budget:String(form.elements.budget.value||"").trim(),preferences:[...form.querySelectorAll('input[name="preferences"]:checked')].map(x=>x.value),notes:String(form.elements.notes.value||"").trim()};
  const id=`custom-trip-${Date.now()}`;
  const item={id,type:"custom-trip",destination,country:"",duration:data.dates,style:"Custom trip",customTrip:data,createdAt:new Date().toISOString()};
  const cart=readCustomTripCart();cart.push(item);writeCustomTripCart(cart);
  renderReview(data);
  form.querySelector(".custom-trip-primary").textContent="✓ Added to My Plan Cart";
  form.querySelector(".custom-trip-primary").disabled=true;
  const notice=document.createElement("div");notice.className="custom-trip-success";notice.innerHTML=`<strong>Your custom trip is ready.</strong><span>It has been added to My Plan Cart.</span><a href="index.html#plan-cart-panel">Open My Plan Cart →</a>`;form.querySelector(".custom-trip-actions")?.before(notice);
 });
});
