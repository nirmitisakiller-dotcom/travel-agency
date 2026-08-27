/* Nature Tours — Phase 1 destination cleanup
 * Keeps destination.html on one cart/runtime even if an older cached script
 * or legacy planner injects its own cart after page load.
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
    const buttons = [...document.querySelectorAll('#nt-destination-cart')];
    buttons.slice(1).forEach((el) => el.remove());
    const panels = [...document.querySelectorAll('#nt-destination-cart-panel')];
    panels.slice(1).forEach((el) => el.remove());

    const sections = [...document.querySelectorAll('.nt-destination-section')];
    const seen = new Set();
    sections.forEach((section) => {
      const heading = section.querySelector('h2')?.textContent?.trim() || section.className;
      if (seen.has(heading)) section.remove();
      else seen.add(heading);
    });
  }

  function clean() {
    removeLegacyCarts();
    dedupeDestinationRuntimeUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clean, { once: true });
  } else {
    clean();
  }

  const observer = new MutationObserver(() => clean());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
