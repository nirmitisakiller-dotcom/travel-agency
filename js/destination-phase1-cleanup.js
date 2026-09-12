/* Nature Tours — Phase 1 destination/cart cleanup
 * Keeps destination.html on one destination runtime and one cart without
 * fighting the runtime or creating a MutationObserver feedback loop.
 *
 * Hotel recommendations are rendered only by destination-runtime-v3.js from
 * live OpenStreetMap accommodation data. No curated or fabricated fallback
 * hotel catalogue is injected here.
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
})();
