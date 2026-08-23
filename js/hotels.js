/*
 * Nature Tours — Live Hotel Discovery
 * One source of truth for destination hotel rendering.
 * Hotels are discovered from OpenStreetMap and photographs from Wikimedia Commons.
 * No fabricated hotel names and no repeated photographs.
 */
"use strict";

const HotelApp = {
    destination: null,
    hotels: [],
    photoUrls: new Set(),
    whatsappNumber: "919822339466"
};

const hotelEscape = value => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function getDestinationKey() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("id") || params.get("destination") || params.get("name") || "").trim();
}

async function getDestination() {
    const key = getDestinationKey();
    if (!key) return null;

    try {
        const response = await fetch("data/destinations.json?hotels=1");
        const list = await response.json();
        if (!Array.isArray(list)) return null;
        const lower = key.toLowerCase();
        return list.find(item => String(item.id || "").toLowerCase() === lower)
            || list.find(item => String(item.name || "").toLowerCase() === lower)
            || null;
    } catch (_) {
        return null;
    }
}

async function geocodeDestination(destination) {
    const query = encodeURIComponent(`${destination.name}, ${destination.country || "India"}`);
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`,
        { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Location service unavailable.");
    const data = await response.json();
    if (!data.length) throw new Error("Destination location could not be found.");
    return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

async function findOpenStreetMapHotels({ lat, lon }) {
    const query = `[out:json][timeout:25];(
        nwr["tourism"="hotel"](around:18000,${lat},${lon});
        nwr["tourism"="resort"](around:18000,${lat},${lon});
    );out center tags;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: query
    });
    if (!response.ok) throw new Error("Hotel discovery service unavailable.");
    const data = await response.json();

    const seen = new Set();
    return (data.elements || [])
        .map(item => {
            const tags = item.tags || {};
            const name = String(tags.name || "").trim();
            const latValue = item.lat ?? item.center?.lat;
            const lonValue = item.lon ?? item.center?.lon;
            return {
                id: `osm-${item.type}-${item.id}`,
                osmId: item.id,
                name,
                lat: Number(latValue),
                lon: Number(lonValue),
                address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", "),
                website: tags.website || tags["contact:website"] || "",
                phone: tags.phone || tags["contact:phone"] || "",
                stars: Number(tags.stars || 0),
                type: tags.tourism || "hotel"
            };
        })
        .filter(item => item.name && Number.isFinite(item.lat) && Number.isFinite(item.lon))
        .filter(item => {
            const key = item.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, 12);
}

async function findWikimediaPhoto(hotel, destination) {
    const queries = [
        `${hotel.name} ${destination.name}`,
        hotel.name
    ];

    for (const query of queries) {
        try {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;
            const response = await fetch(url);
            if (!response.ok) continue;
            const data = await response.json();
            const pages = Object.values(data.query?.pages || {});
            for (const page of pages) {
                const image = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url;
                if (image && !HotelApp.photoUrls.has(image)) {
                    HotelApp.photoUrls.add(image);
                    return image;
                }
            }
        } catch (_) {
            // Continue without a photograph; never substitute another hotel's image.
        }
    }
    return "";
}

function hotelMapsLink(hotel) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.lat},${hotel.lon}`)}`;
}

function hotelWhatsApp(hotel, destination) {
    const text = encodeURIComponent(
        `Hello Nature Tours,\n\nI would like to enquire about:\n\n🏨 ${hotel.name}\n📍 ${destination.name}\n\nPlease check availability, room options and current price.\n\nThank you.`
    );
    return `https://wa.me/${HotelApp.whatsappNumber}?text=${text}`;
}

function addToPlanCart(hotel, destination, button) {
    let items = [];
    try { items = JSON.parse(localStorage.getItem("natureToursPlanCart") || "[]"); } catch (_) {}
    if (!Array.isArray(items)) items = [];

    const id = `hotel-${hotel.osmId}`;
    if (!items.some(item => item.id === id)) {
        items.push({
            id,
            type: "hotel",
            destination: destination.name,
            hotel: hotel.name,
            address: hotel.address || "",
            mapsUrl: hotelMapsLink(hotel)
        });
        localStorage.setItem("natureToursPlanCart", JSON.stringify(items));
        document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated"));
        button.textContent = "✓ Added to Plan";
    } else {
        button.textContent = "✓ Already Added";
    }
}

function renderHotelCard(hotel, destination, index) {
    const photo = hotel.photo;
    return `
        <article class="hotel-card live-hotel-card">
            <div class="hotel-photo-wrap">
                ${photo
                    ? `<img class="hotel-photo" src="${hotelEscape(photo)}" alt="${hotelEscape(hotel.name)}" loading="lazy">`
                    : `<div class="hotel-photo hotel-photo-unavailable"><span>📷</span><small>Photo unavailable</small></div>`}
                <span class="hotel-live-badge">Verified listing</span>
            </div>
            <div class="hotel-content">
                <h3>${hotelEscape(hotel.name)}</h3>
                <p class="hotel-address">📍 ${hotelEscape(hotel.address || destination.name)}</p>
                ${hotel.stars ? `<div class="hotel-rating">${"★".repeat(Math.min(5, hotel.stars))}${"☆".repeat(Math.max(0, 5 - hotel.stars))} <span>${hotel.stars}/5</span></div>` : ""}
                <p class="hotel-source">OpenStreetMap listing${hotel.type === "resort" ? " • Resort" : " • Hotel"}</p>
                <div class="hotel-buttons">
                    <a class="hotel-btn" href="${hotelEscape(hotelMapsLink(hotel))}" target="_blank" rel="noopener noreferrer">Google Maps</a>
                    ${hotel.website ? `<a class="hotel-btn" href="${hotelEscape(hotel.website)}" target="_blank" rel="noopener noreferrer">Hotel Website</a>` : ""}
                    <a class="hotel-btn" href="${hotelEscape(hotelWhatsApp(hotel, destination))}" target="_blank" rel="noopener noreferrer">Enquire</a>
                    <button class="hotel-btn hotel-plan-btn" type="button" data-hotel-index="${index}">Add to Plan</button>
                </div>
            </div>
        </article>
    `;
}

function renderHotels(destination, hotels) {
    const page = document.getElementById("destination-page");
    if (!page) return;

    const old = page.querySelector(".live-hotels-section");
    if (old) old.remove();

    const section = document.createElement("section");
    section.className = "hotel-section live-hotels-section";
    section.innerHTML = `
        <div class="hotel-section-heading">
            <h2>Hotels in ${hotelEscape(destination.name)}</h2>
            <p>Real hotel and resort listings discovered for this destination. Photographs are shown only when a matching Wikimedia Commons image is available.</p>
        </div>
        <div class="hotel-grid live-hotel-grid">
            ${hotels.length ? hotels.map((hotel, index) => renderHotelCard(hotel, destination, index)).join("") : `
                <div class="glance-card" style="grid-column:1/-1;text-align:center;">
                    <h3>No verified hotel listings found</h3>
                    <p>We won't invent a hotel or reuse an unrelated photograph. Please try again later.</p>
                </div>
            `}
        </div>
    `;

    page.appendChild(section);

    section.querySelectorAll(".hotel-plan-btn").forEach(button => {
        button.addEventListener("click", () => {
            const hotel = HotelApp.hotels[Number(button.dataset.hotelIndex)];
            if (hotel) addToPlanCart(hotel, destination, button);
        });
    });
}

async function initializeLiveHotels() {
    if (!document.getElementById("destination-page")) return;
    const destination = await getDestination();
    if (!destination) return;
    HotelApp.destination = destination;

    const page = document.getElementById("destination-page");
    const loading = document.createElement("section");
    loading.className = "hotel-section live-hotels-section";
    loading.innerHTML = `<div class="glance-card" style="text-align:center;"><h2>Finding real hotels in ${hotelEscape(destination.name)}...</h2><p>Checking live accommodation listings.</p></div>`;
    page.appendChild(loading);

    try {
        const coords = await geocodeDestination(destination);
        const hotels = await findOpenStreetMapHotels(coords);
        HotelApp.hotels = hotels;
        HotelApp.photoUrls.clear();

        for (const hotel of hotels) {
            hotel.photo = await findWikimediaPhoto(hotel, destination);
        }

        renderHotels(destination, hotels);
    } catch (error) {
        console.error("Live hotel discovery failed:", error);
        renderHotels(destination, []);
    }
}

document.addEventListener("DOMContentLoaded", initializeLiveHotels, { once: true });
