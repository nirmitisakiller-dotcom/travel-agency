"use strict";

(function () {
  const FALLBACK_IMAGES = {
    "Netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=240&q=80"
  };

  function esc(v = "") {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function destinationImage(d) {
    return d.image || FALLBACK_IMAGES[d.name] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=240&q=80";
  }

  async function getCatalogue() {
    try {
      if (window.DestinationEngine) return await window.DestinationEngine.load();
    } catch (_) {}
    return [];
  }

  function render() {
    const box = document.getElementById("plan-destination-results");
    const input = document.getElementById("plan-destination-search");
    if (!box || !input || !Array.isArray(window.PlanCartDestinationCatalogue)) return;

    const q = input.value.trim().toLowerCase();
    const selected = new Set((window.NatureToursPlanCart?.read?.() || []).map(x => x.id));
    const fields = d => [d.name, d.country, d.continent, d.region, d.state, ...(d.tags || [])].filter(Boolean).join(" ").toLowerCase();
    const matches = window.PlanCartDestinationCatalogue.filter(d => !q || fields(d).includes(q)).slice(0, 20);

    box.innerHTML = matches.length ? matches.map(d => {
      const id = `destination-${String(d.id || d.name).trim().toLowerCase()}`;
      const added = selected.has(id);
      return `<button type="button" class="plan-destination-result plan-destination-result-with-image ${added ? "is-added" : ""}" data-enhanced-destination="${esc(d.id || d.name)}">
        <img class="plan-destination-result-image" src="${esc(destinationImage(d))}" alt="${esc(d.name)}" loading="lazy" onerror="this.style.display='none'">
        <span class="plan-destination-result-text"><strong>${esc(d.name)}</strong><small>${esc(d.country || "")} · ${esc(d.region || d.state || d.continent || "")}</small></span>
        <span class="plan-destination-result-action">${added ? "✓ Added" : "+ Add"}</span>
      </button>`;
    }).join("") : `<div class="plan-destination-no-results">No destination found for <strong>${esc(input.value)}</strong>.<br><small>Try a country, city or region name.</small></div>`;

    box.querySelectorAll("[data-enhanced-destination]").forEach(btn => btn.addEventListener("click", () => {
      const d = window.PlanCartDestinationCatalogue.find(x => String(x.id || x.name) === String(btn.dataset.enhancedDestination));
      if (!d || !window.NatureToursPlanCart?.add) return;
      window.NatureToursPlanCart.add({
        id: `destination-${String(d.id || d.name).trim().toLowerCase()}`,
        type: "destination",
        destination: d.name || "Destination",
        country: d.country || "",
        duration: d.duration || "Custom plan",
        style: d.style || "Custom itinerary",
        image: destinationImage(d)
      });
      document.dispatchEvent(new Event("natureToursPlanCartUpdated"));
      render();
      if (typeof window.NatureToursPlanCart.render === "function") window.NatureToursPlanCart.render();
    }));
  }

  async function init() {
    const catalogue = await getCatalogue();
    if (!Array.isArray(catalogue)) return;
    window.PlanCartDestinationCatalogue = catalogue;
    const input = document.getElementById("plan-destination-search");
    if (!input || input.dataset.enhancedBound) return;
    input.dataset.enhancedBound = "true";
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    render();

    const observer = new MutationObserver(() => {
      const current = document.getElementById("plan-destination-search");
      if (current && !current.dataset.enhancedBound) init();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initDomesticDestinationLinks() {
    if (!/\/domestic\.html$/i.test(location.pathname)) return;
    const apply = () => {
      document.querySelectorAll("#india-grid .india-card").forEach(card => {
        if (card.dataset.detailLinked) return;
        const rawId = card.dataset.id || card.querySelector(".india-add")?.dataset.id;
        if (!rawId) return;
        const id = encodeURIComponent(rawId);
        const title = card.querySelector("h3");
        const media = card.querySelector(".india-card-media");
        const makeLink = (node, className) => {
          if (!node || node.closest("a")) return;
          const a = document.createElement("a");
          a.href = `destination.html?id=${id}`;
          a.className = className;
          a.setAttribute("aria-label", `View ${title?.textContent?.trim() || "destination"} details`);
          a.style.color = "inherit";
          a.style.textDecoration = "none";
          node.parentNode.insertBefore(a, node);
          a.appendChild(node);
        };
        makeLink(media, "destination-card-image-link");
        makeLink(title, "destination-card-title-link");
        if (title) title.style.cursor = "pointer";
        card.dataset.detailLinked = "true";
      });
    };
    apply();
    const observer = new MutationObserver(apply);
    const grid = document.getElementById("india-grid");
    if (grid) observer.observe(grid, { childList: true, subtree: true });
  }

  function injectStyle() {
    if (document.getElementById("plan-cart-search-enhancement-style")) return;
    const style = document.createElement("style");
    style.id = "plan-cart-search-enhancement-style";
    style.textContent = `
      .plan-destination-results{display:flex;flex-direction:column;gap:8px;max-height:390px;overflow:auto;padding:6px 2px}
      .plan-destination-result-with-image{display:grid!important;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;gap:12px;text-align:left;min-height:72px;padding:7px!important;overflow:hidden}
      .plan-destination-result-image{width:64px;height:58px;object-fit:cover;border-radius:10px;background:#e8edf2;display:block}
      .plan-destination-result-with-image .plan-destination-result-text{min-width:0;display:flex;flex-direction:column;gap:4px}
      .plan-destination-result-with-image .plan-destination-result-text strong{font-size:14px}
      .plan-destination-result-with-image .plan-destination-result-text small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .plan-destination-result-action{white-space:nowrap;font-weight:800}
      .plan-destination-no-results{padding:20px;text-align:center;border:1px dashed rgba(100,116,139,.25);border-radius:12px}
      .destination-card-image-link{display:block;height:100%}.destination-card-title-link{display:block}
    `;
    document.head.appendChild(style);
  }

  function boot() {
    injectStyle();
    init();
    initDomesticDestinationLinks();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
