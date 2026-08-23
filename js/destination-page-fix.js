/* Nature Tours destination detail safety/fallback layer */
(function () {
  "use strict";
  const WA = "919822339466";

  const esc = (v) => String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");

  function slug(v) {
    return String(v || "destination").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function hash(v) {
    let h = 0;
    for (let i = 0; i < String(v).length; i++) h = ((h << 5) - h + String(v).charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function hotelImage(hotel, destination, index) {
    const existing = hotel && hotel.image ? hotel.image : "";
    const key = `${hotel?.id || hotel?.name || "hotel"}-${destination?.id || "destination"}-${index}`;
    // Use the catalogue image only when it is genuinely hotel-specific.
    if (existing && !existing.includes("destinations/") && !existing.includes("destination")) return existing;
    return `https://loremflickr.com/900/600/hotel,resort,${encodeURIComponent(destination.name || "travel")}?lock=${hash(key)}`;
  }

  function enquiry(hotel, destination) {
    const text = encodeURIComponent(`Hello Nature Tours,\n\nI would like to enquire about:\n🏨 ${hotel.name}\n📍 ${destination.name}, ${destination.country || "India"}\n💰 ₹${Number(hotel.price || 0).toLocaleString("en-IN")} per night\n\nPlease share availability and booking details.`);
    return `https://wa.me/${WA}?text=${text}`;
  }

  async function getDestination() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id || !window.DestinationEngine) return null;
    try { await window.DestinationEngine.load(); } catch (_) {}
    return (window.DestinationEngine.destinations || []).find(d => String(d.id) === String(id)) || null;
  }

  async function getHotels(destination) {
    let hotels = [];
    try {
      const r = await fetch("data/hotels.json");
      if (r.ok) hotels = await r.json();
    } catch (_) {}
    return hotels.filter(h => String(h.destinationId) === String(destination.id));
  }

  function ensureDestinationHeader(destination) {
    const page = document.getElementById("destination-page");
    if (!page) return;
    const h1 = page.querySelector(".destination-info h1");
    if (h1 && h1.textContent.trim() && h1.textContent.trim() !== "-") return;

    const oldHero = page.querySelector(".destination-hero");
    if (oldHero) oldHero.remove();

    const image = destination.image || `assets/destinations/${slug(destination.id)}.jpg`;
    const tags = Array.isArray(destination.tags) ? destination.tags : [];
    const details = [
      ["Region", destination.region], ["Airport", destination.airport],
      ["Currency", destination.currency], ["Language", destination.language],
      ["Timezone", destination.timezone], ["Best Season", destination.bestSeason]
    ].filter(x => x[1]);

    const hero = document.createElement("section");
    hero.className = "destination-hero";
    hero.innerHTML = `
      <div class="destination-banner"><img src="${esc(image)}" alt="${esc(destination.name)}" class="destination-banner-image"></div>
      <div class="destination-info">
        <h1>${esc(destination.name)}</h1>
        <p class="destination-location">🌍 ${esc(destination.country || "India")} ${destination.continent ? `• ${esc(destination.continent)}` : ""}</p>
        <p class="destination-description">${esc(destination.description || `Explore ${destination.name}, including its major sights, local experiences, hotels and travel options.`)}</p>
        <div class="destination-details">${details.map(([a,b]) => `<p><strong>${esc(a)}:</strong> ${esc(b)}</p>`).join("")}</div>
        <div class="destination-tags">${tags.map(t => `<span class="destination-tag">${esc(t)}</span>`).join("")}</div>
      </div>`;
    page.prepend(hero);
  }

  function renderHotels(destination, hotels) {
    const page = document.getElementById("destination-page");
    if (!page) return;

    page.querySelectorAll(".hotel-section:not(.dynamic-stay-enquiry)").forEach(el => el.remove());

    const base = hotels.length ? hotels : [
      { id: `${destination.id}-heritage`, name: `${destination.name} Heritage Hotel`, rating: 4, price: 4500, address: `${destination.name}, ${destination.region || destination.country || "India"}`, amenities: ["Free WiFi", "Breakfast", "Restaurant"] },
      { id: `${destination.id}-grand`, name: `${destination.name} Grand Resort`, rating: 4, price: 6500, address: `${destination.name}, ${destination.region || destination.country || "India"}`, amenities: ["Swimming Pool", "Breakfast", "Parking"] },
      { id: `${destination.id}-view`, name: `${destination.name} View Retreat`, rating: 4, price: 5200, address: `${destination.name}, ${destination.region || destination.country || "India"}`, amenities: ["Free WiFi", "Restaurant", "Room Service"] },
      { id: `${destination.id}-comfort`, name: `${destination.name} Comfort Stay`, rating: 3, price: 3200, address: `${destination.name}, ${destination.region || destination.country || "India"}`, amenities: ["Free WiFi", "Breakfast", "Parking"] },
      { id: `${destination.id}-premium`, name: `${destination.name} Premium Resort`, rating: 5, price: 9000, address: `${destination.name}, ${destination.region || destination.country || "India"}`, amenities: ["Spa", "Swimming Pool", "Restaurant"] }
    ];

    const section = document.createElement("section");
    section.className = "hotel-section destination-hotels-fixed";
    section.innerHTML = `<h2 class="hotel-section-title">Recommended Hotels in ${esc(destination.name)}</h2><div class="hotel-grid"></div>`;
    const grid = section.querySelector(".hotel-grid");
    const used = new Set();

    base.slice(0, 5).forEach((hotel, i) => {
      let image = hotelImage(hotel, destination, i);
      if (used.has(image)) image = `https://loremflickr.com/900/600/hotel,resort,${encodeURIComponent(destination.name)}?lock=${hash((hotel.id || hotel.name) + "-unique")}`;
      used.add(image);
      const card = document.createElement("article");
      card.className = "hotel-card";
      card.innerHTML = `
        <img class="hotel-photo" src="${esc(image)}" alt="${esc(hotel.name)}" loading="lazy">
        <div class="hotel-content">
          <h3>${esc(hotel.name)}</h3>
          <p>⭐ ${esc(hotel.rating || 4)} Stars</p>
          <p class="hotel-price">₹${Number(hotel.price || 0).toLocaleString("en-IN")} / night</p>
          <p>${esc(hotel.address || `${destination.name}, ${destination.country || "India"}`)}</p>
          <div class="hotel-amenities">${(hotel.amenities || ["Free WiFi", "Breakfast"]).map(a => `<span>${esc(a)}</span>`).join("")}</div>
          <div class="hotel-buttons">
            <a class="hotel-btn" target="_blank" rel="noopener noreferrer" href="${esc(enquiry(hotel, destination))}">Send Enquiry</a>
            <a class="hotel-btn" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((hotel.name || "") + " " + (hotel.address || destination.name))}">Google Maps</a>
          </div>
        </div>`;
      grid.appendChild(card);
    });
    page.appendChild(section);
  }

  async function repair() {
    const destination = await getDestination();
    if (!destination) return;
    ensureDestinationHeader(destination);
    const hotels = await getHotels(destination);
    renderHotels(destination, hotels);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(repair, 700);
    setTimeout(repair, 1800);
    setTimeout(repair, 3500);
  });
})();
