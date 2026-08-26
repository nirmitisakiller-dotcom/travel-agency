/* Nature Tours — destination cart single-instance guard
 * Destination pages must have exactly one Plan Cart. This removes the legacy
 * travel-planner cart if it is injected by a cached/secondary script and keeps
 * the current destination cart as the sole UI.
 */
(function () {
  'use strict';

  const KEEP = 'nt-destination-cart';
  const selectors = [
    '#nt-cart',
    '.nt-cart-btn',
    '.nt-cart-panel'
  ];

  function removeLegacy() {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.id === KEEP) return;
        el.remove();
      });
    });

    // Defensive cleanup for a legacy cart button that has lost its old class/id.
    document.querySelectorAll('button').forEach(button => {
      if (button.id === KEEP) return;
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!text.includes('plan cart')) return;
      if (button.closest('#nt-destination-cart-panel')) return;
      button.remove();
    });
  }

  function start() {
    removeLegacy();
    const observer = new MutationObserver(() => removeLegacy());
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(removeLegacy, 1000);
    setTimeout(removeLegacy, 3000);
    setTimeout(removeLegacy, 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
