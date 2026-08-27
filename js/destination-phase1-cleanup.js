/* Nature Tours — Phase 1 destination/cart cleanup
 * Keeps destination.html on one destination runtime and one cart without
 * fighting the runtime or creating a MutationObserver feedback loop.
 */
(function () {
  'use strict';
  if (window.__NatureToursPhase1Cleanup) return;
  window.__NatureToursPhase1Cleanup = true;

  const LEGACY_CART_SELECTORS = [
    '#nt-cart',
    '.nt-cart-panel',
    '.nt-plan-cart',
    '[data-nt-cart]',
    '[data-legacy-cart]'
  ];

  function removeLegacyCarts() {
    for (const selector of LEGACY_CART_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.matches('#nt-destination-cart, #nt-destination-cart-panel')) el.remove();
      });
    }
  }

  function dedupeDestinationRuntimeUI() {
    [...document.querySelectorAll('#nt-destination-cart')].slice(1).forEach((el) => el.remove());
    [...document.querySelectorAll('#nt-destination-cart-panel')].slice(1).forEach((el) => el.remove());
  }

  function clean() {
    removeLegacyCarts();
    dedupeDestinationRuntimeUI();
  }

  let scheduled = false;
  let observer;
  function scheduleClean() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (!document.documentElement) return;
      observer?.disconnect();
      try { clean(); } finally {
        observer?.observe(document.documentElement, { childList: true, subtree: true });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean, { once: true });
  else clean();

  observer = new MutationObserver(scheduleClean);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Alibaug currently has no deterministic hotel rows in data/hotels.json.
  // If the live map providers are unavailable, keep the destination usable
  // with a small curated fallback rather than showing an empty hotel section.
  const ALIBAUG = /^(alibaug|alibag|alibagh)$/i;
  const ALIBAUG_HOTELS = [
    { name: 'Radisson Blu Resort & Spa, Alibaug', address: 'Alibaug, Maharashtra, India', stars: 5, website: 'https://www.radissonhotels.com/en-us/hotels/radisson-blu-resort-alibaug' },
    { name: 'U Tropicana Alibaug', address: 'Alibaug, Maharashtra, India', stars: 4, website: 'https://utropicana.com/' },
    { name: 'The Fern Silvanus Resort Alibaug', address: 'Alibaug, Maharashtra, India', stars: 4, website: 'https://www.fernhotels.com/' }
  ];

  function addAlibaugFallback() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || params.get('destination') || params.get('name') || '';
    if (!ALIBAUG.test(id)) return;
    if (document.querySelector('.nt-hotels-section .nt-hotel-grid .nt-card-btn')) return;
    const section = document.querySelector('.nt-hotels-section');
    if (!section) return;
    const grid = section.querySelector('.nt-hotel-grid');
    if (!grid) return;
    grid.innerHTML = ALIBAUG_HOTELS.map((h, i) => `
      <article class="nt-hotel-card">
        <h3>${h.name}</h3>
        <p>⭐ ${h.stars} stars · Curated hotel option</p>
        <p>${h.address}</p>
        <p><a href="${h.website}" target="_blank" rel="noopener">Hotel website</a></p>
        <button class="nt-card-btn" type="button" data-alibaug-hotel="${i}">+ Add hotel to Plan Cart</button>
      </article>`).join('');
    grid.querySelectorAll('[data-alibaug-hotel]').forEach(btn => btn.onclick = () => {
      const h = ALIBAUG_HOTELS[Number(btn.dataset.alibaugHotel)];
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem('natureToursPlanCart') || '[]'); } catch (_) {}
      if (!Array.isArray(cart)) cart = [];
      const item = { id: `hotel-alibaug-${Number(btn.dataset.alibaugHotel)}`, type: 'hotel', destination: 'Alibaug', country: 'India', hotel: h.name, address: h.address, website: h.website };
      if (!cart.some(x => x.id === item.id)) {
        cart.push(item);
        localStorage.setItem('natureToursPlanCart', JSON.stringify(cart));
        window.dispatchEvent(new Event('natureToursCartChanged'));
        document.dispatchEvent(new CustomEvent('natureToursPlanCartUpdated'));
        btn.textContent = '✓ Added to Plan Cart';
      } else btn.textContent = '✓ Already Added';
      btn.classList.add('added');
    });
  }

  const hotelObserver = new MutationObserver(addAlibaugFallback);
  hotelObserver.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(addAlibaugFallback, 1000);
  setTimeout(addAlibaugFallback, 5000);
  setTimeout(addAlibaugFallback, 10000);
})();
