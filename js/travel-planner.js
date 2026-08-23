/* Nature Tours — live hotel + itinerary layer
 * Active destination-page planner.
 * Hotels are discovered from OpenStreetMap; photos come only from Wikimedia Commons.
 * No invented hotel names, no stock hotel photos, and no repeated photo URL on a page.
 */
(function () {
  'use strict';

  const WA = '919822339466';
  const cache = new Map();
  const usedImages = new Set();
  const esc = v => String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;').replace(/'/g, '&#039;');

  async function json(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }

  async function geocode(destination) {
    const key = 'geo:' + destination.id;
    if (cache.has(key)) return cache.get(key);
    const q = encodeURIComponent([destination.name, destination.region, destination.country || 'India'].filter(Boolean).join(', '));
    try {
      const data = await json('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + q, { headers: { Accept: 'application/json' } });
      const point = data?.[0] ? { lat: +data[0].lat, lon: +data[0].lon } : null;
      cache.set(key, point);
      return point;
    } catch (_) {
      cache.set(key, null);
      return null;
    }
  }

  async function hotelsFromOSM(destination) {
    const key = 'hotels:' + destination.id;
    if (cache.has(key)) return cache.get(key);
    const point = await geocode(destination);
    if (!point) return [];

    const query = `[out:json][timeout:30];(nwr["tourism"="hotel"](around:18000,${point.lat},${point.lon});nwr["tourism"="resort"](around:18000,${point.lat},${point.lon}););out center tags;`;
    try {
      const data = await json('https://overpass-api.de/api/interpreter', {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: query
      });
      const result = [], seen = new Set();
      (data.elements || []).forEach(item => {
        const tags = item.tags || {};
        const name = String(tags.name || '').trim();
        if (!name) return;
        const nameKey = name.toLowerCase();
        if (seen.has(nameKey)) return;
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;
        if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return;
        seen.add(nameKey);
        result.push({
          id: `osm-${item.type}-${item.id}`,
          name,
          lat: Number(lat),
          lon: Number(lon),
          address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'] || destination.name].filter(Boolean).join(', '),
          stars: tags.stars || tags['hotel:stars'] || '',
          website: tags.website || tags['contact:website'] || '',
          type: tags.tourism || 'hotel'
        });
      });
      const trimmed = result.slice(0, 8);
      cache.set(key, trimmed);
      return trimmed;
    } catch (_) {
      cache.set(key, []);
      return [];
    }
  }

  async function commonsPhoto(hotel, destination) {
    const terms = [`${hotel.name} ${destination.name}`, hotel.name];
    for (const term of terms) {
      try {
        const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
          encodeURIComponent(term) + '&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*';
        const data = await json(url);
        const pages = Object.values(data.query?.pages || {});
        for (const page of pages) {
          const title = String(page.title || '').toLowerCase();
          if (!/hotel|resort|lodge|inn|palace|villa/.test(title)) continue;
          const source = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || '';
          if (source && !usedImages.has(source)) {
            usedImages.add(source);
            return source;
          }
        }
      } catch (_) {}
    }
    return '';
  }

  async function enrichHotels(destination, hotels) {
    usedImages.clear();
    const enriched = [];
    for (const hotel of hotels) {
      enriched.push({ ...hotel, image: await commonsPhoto(hotel, destination) });
    }
    return enriched;
  }

  function destinationHighlights(destination) {
    const tags = Array.isArray(destination.tags) ? destination.tags.filter(Boolean) : [];
    return [...new Set([...tags, 'Local sightseeing', 'Scenic viewpoints', 'Local cuisine', 'Cultural experience', 'Leisure time'])].slice(0, 8);
  }

  function makePlans(destination) {
    const highlights = destinationHighlights(destination);
    const specs = [[2, 1, 'Quick Escape'], [3, 2, 'Short Discovery'], [5, 4, 'Complete Experience'], [7, 6, 'Relaxed Explorer']];
    return specs.map(([days, nights, style]) => ({
      id: `${destination.id}-${days}d`, days, nights, style,
      name: destination.name,
      duration: `${days} Days / ${nights} Nights`,
      schedule: Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        if (day === 1) return { day, morning: 'Arrival and local orientation', afternoon: `Check in and explore ${highlights[0]}`, evening: `Relax and experience ${highlights[1] || 'local highlights'}` };
        if (day === days) return { day, morning: `Breakfast and ${highlights[(index + 1) % highlights.length]}`, afternoon: 'Leisure, shopping or local experience', evening: 'Departure' };
        return { day, morning: `Explore ${highlights[index % highlights.length]}`, afternoon: `Sightseeing: ${highlights[(index + 1) % highlights.length]}`, evening: `Local experience: ${highlights[(index + 2) % highlights.length]}` };
      })
    }));
  }

  function addCart(item) {
    try {
      if (typeof window.planCartAdd === 'function') return !!window.planCartAdd(item);
      const key = 'natureToursPlanCart';
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      if (items.some(x => x.id === item.id)) return false;
      items.push(item);
      localStorage.setItem(key, JSON.stringify(items));
      document.dispatchEvent(new CustomEvent('natureToursPlanCartUpdated'));
      return true;
    } catch (_) { return false; }
  }

  function hotelCard(hotel, destination) {
    const photo = hotel.image
      ? `<img class="live-hotel-photo" src="${esc(hotel.image)}" alt="${esc(hotel.name)}" loading="lazy">`
      : `<div class="live-hotel-no-photo"><strong>Photo unavailable</strong><span>No verified hotel photograph found</span></div>`;
    const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + (hotel.address || destination.name))}`;
    const wa = `https://wa.me/${WA}?text=${encodeURIComponent(`Hello Nature Tours, I would like to enquire about ${hotel.name} in ${destination.name}.`)}`;
    const card = document.createElement('article');
    card.className = 'live-hotel-card';
    card.innerHTML = `${photo}<div class="live-hotel-body"><div class="live-hotel-source">✓ Real listing · OpenStreetMap</div><h3>${esc(hotel.name)}</h3>${hotel.stars ? `<p>⭐ ${esc(hotel.stars)} star</p>` : ''}<p class="live-hotel-address">${esc(hotel.address || destination.name)}</p><div class="live-hotel-actions"><a href="${esc(map)}" target="_blank" rel="noopener noreferrer">Maps</a>${hotel.website ? `<a href="${esc(hotel.website)}" target="_blank" rel="noopener noreferrer">Website</a>` : ''}<a href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Enquire</a><button type="button">+ Add hotel</button></div></div>`;
    card.querySelector('button').onclick = () => {
      const ok = addCart({ id: `hotel-${hotel.id}`, sourceId: hotel.id, type: 'hotel', destination: destination.name, country: destination.country || 'India', hotel: hotel.name, address: hotel.address || '', image: hotel.image || '', website: hotel.website || '' });
      const button = card.querySelector('button');
      button.textContent = ok ? '✓ Added' : '✓ Already Added';
      button.disabled = true;
    };
    return card;
  }

  function renderHotels(destination, hotels) {
    const page = document.getElementById('destination-page');
    if (!page) return;
    page.querySelector('.live-hotels')?.remove();
    const section = document.createElement('section');
    section.className = 'live-hotels';
    section.innerHTML = `<div class="planner-heading"><span>🏨 Stay</span><h2>Real Hotels in ${esc(destination.name)}</h2><p>Live hotel listings from OpenStreetMap. Photographs are shown only when a matching Wikimedia Commons image is available.</p></div><div class="live-hotel-grid"></div>`;
    const grid = section.querySelector('.live-hotel-grid');
    hotels.forEach(hotel => grid.appendChild(hotelCard(hotel, destination)));
    if (!hotels.length) grid.innerHTML = '<div class="planner-empty">No verified hotel listings were returned for this destination right now.</div>';
    page.appendChild(section);
  }

  function renderPlans(destination, hotels) {
    const page = document.getElementById('destination-page');
    if (!page) return;
    page.querySelector('.live-itineraries')?.remove();
    const section = document.createElement('section');
    section.className = 'live-itineraries';
    section.innerHTML = `<div class="planner-heading"><span>🗓️ Plan your trip</span><h2>Itineraries for ${esc(destination.name)}</h2><p>Choose a duration and connect a verified hotel to your plan.</p></div><div class="live-itinerary-grid"></div>`;
    const grid = section.querySelector('.live-itinerary-grid');
    makePlans(destination).forEach(plan => {
      const card = document.createElement('article');
      card.className = 'live-itinerary-card';
      const options = hotels.map((hotel, index) => `<option value="${index}">${esc(hotel.name)}</option>`).join('');
      card.innerHTML = `<div class="live-plan-badge">${esc(plan.style)}</div><h3>${esc(plan.duration)}</h3><label>Hotel for this plan<select>${options || '<option value="">Hotel selection unavailable</option>'}</select></label><div class="live-schedule">${plan.schedule.map(day => `<div class="live-day"><strong>Day ${day.day}</strong><p><b>Morning:</b> ${esc(day.morning)}</p><p><b>Afternoon:</b> ${esc(day.afternoon)}</p><p><b>Evening:</b> ${esc(day.evening)}</p></div>`).join('')}</div><button class="live-plan-add" type="button">+ Add itinerary to Plan Cart</button>`;
      card.querySelector('button').onclick = () => {
        const hotel = hotels[Number(card.querySelector('select').value)] || null;
        const ok = addCart({ id: `itinerary-${plan.id}`, sourceId: plan.id, type: 'itinerary', destination: plan.name, country: destination.country || 'India', duration: plan.duration, style: plan.style, schedule: plan.schedule, hotel: hotel ? { id: hotel.id, name: hotel.name, image: hotel.image || '', address: hotel.address || '' } : null });
        card.querySelector('button').textContent = ok ? '✓ Added to Plan Cart' : '✓ Already Added';
      };
      grid.appendChild(card);
    });
    page.appendChild(section);
  }

  async function init() {
    const page = document.getElementById('destination-page');
    if (!page || !window.DestinationEngine) return;
    try {
      const requested = new URLSearchParams(location.search).get('id') || new URLSearchParams(location.search).get('destination') || '';
      const destination = await window.DestinationEngine.find(requested);
      if (!destination) return;
      const hotels = await hotelsFromOSM(destination);
      const enriched = await enrichHotels(destination, hotels);
      renderHotels(destination, enriched);
      renderPlans(destination, enriched);
    } catch (error) {
      console.warn('Live travel planner failed', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1300));
})();
