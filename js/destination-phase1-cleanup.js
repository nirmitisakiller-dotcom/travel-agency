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
        if (!el.matches('#nt-destination-cart, #nt-destination-cart-panel')) {
          el.remove();
        }
      });
    }
  }

  function dedupeDestinationRuntimeUI() {
    const buttons = [...document.querySelectorAll('#nt-destination-cart')];
    buttons.slice(1).forEach((el) => el.remove());

    const panels = [...document.querySelectorAll('#nt-destination-cart-panel')];
    panels.slice(1).forEach((el) => el.remove());
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

      // Disconnect while modifying the DOM so our own removals cannot trigger
      // another cleanup pass indefinitely.
      observer?.disconnect();
      try {
        clean();
      } finally {
        observer?.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clean, { once: true });
  } else {
    clean();
  }

  observer = new MutationObserver(scheduleClean);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
