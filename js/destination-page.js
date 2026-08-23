/* Nature Tours destination detail renderer - stable version */
(function () {
    "use strict";

    const esc = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    function getRequestedDestination() {
        const params = new URLSearchParams(window.location.search);
        return (params.get("id") || params.get("destination") || params.get("name") || "").trim();
    }

    async function loadDestinations() {
        try {
            if (window.DestinationEngine && typeof window.DestinationEngine.load === "function") {
                const loaded = await window.DestinationEngine.load();
                if (Array.isArray(loaded) && loaded.length) return loaded;
            }
        } catch (error) {
            console.warn("DestinationEngine failed; using direct catalogue fallback.", error);
        }

        try {
            const response = await fetch("data/destinations.json?fallback=1");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Destination catalogue failed:", error);
            return [];
        }
    }

    function findDestination(destinations, requested) {
        const key = requested.toLowerCase();
        return destinations.find(d => String(d.id || "").toLowerCase() === key)
            || destinations.find(d => String(d.name || "").toLowerCase() === key)
            || destinations.find(d => String(d.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-") === key)
            || null;
    }

    function render(container, destination) {
        const name = destination.name || "Destination";
        const country = destination.country || "India";
        const image = destination.image || "assets/ladakh.jpg";
        const description = destination.description || `Explore ${name} with Nature Tours, including local attractions, hotels and personalised travel planning.`;
        const details = [
            ["Region", destination.region],
            ["Airport", destination.airport],
            ["Currency", destination.currency],
            ["Language", destination.language],
            ["Timezone", destination.timezone],
            ["Best Season", destination.bestSeason]
        ];
        const tags = Array.isArray(destination.tags) ? destination.tags : [];

        container.innerHTML = `
            <section class="destination-hero">
                <div class="destination-banner">
                    <img src="${esc(image)}" alt="${esc(name)}" class="destination-banner-image"
                         onerror="this.onerror=null;this.src='assets/ladakh.jpg';">
                </div>
                <div class="destination-info">
                    <h1>${esc(name)}</h1>
                    <p class="destination-location">🌍 ${esc(country)}${destination.continent ? ` • ${esc(destination.continent)}` : ""}</p>
                    <p class="destination-description">${esc(description)}</p>
                    <div class="destination-details">
                        ${details.map(([label, value]) => `<p><strong>${esc(label)}:</strong> ${esc(value || "-")}</p>`).join("")}
                    </div>
                    ${tags.length ? `<div class="destination-tags">${tags.map(tag => `<span class="destination-tag">${esc(tag)}</span>`).join("")}</div>` : ""}
                </div>
            </section>
        `;

        document.title = `${name} Travel Guide | Nature Tours`;
        return true;
    }

    async function init() {
        const container = document.getElementById("destination-page");
        if (!container) return;

        const requested = getRequestedDestination();
        if (!requested) {
            container.innerHTML = '<div class="glance-card"><h2>Destination not specified</h2><p>Please select a destination first.</p></div>';
            return;
        }

        const destinations = await loadDestinations();
        const destination = findDestination(destinations, requested);

        if (!destination) {
            container.innerHTML = `<div class="glance-card"><h2>Destination not found</h2><p>We could not find “${esc(requested)}” in the destination catalogue.</p><p><a href="domestic.html">← Back to Domestic Explorer</a></p></div>`;
            return;
        }

        render(container, destination);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
