/* Nature Tours destination detail renderer - place-specific image version */
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
            const response = await fetch("data/destinations.json?fallback=place-images-2");
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

    function imageQueries(destination) {
        const name = String(destination.name || "").trim();
        const region = String(destination.region || destination.state || "").trim();
        const tags = Array.isArray(destination.tags) ? destination.tags.map(String) : [];
        const queries = [`${name}, ${region}`, `${name} tourist attraction`, `${name} India`];

        // Prefer an actual attraction type when the catalogue tells us the destination's character.
        if (tags.includes("beaches") || tags.includes("beach") || tags.includes("coastal")) {
            queries.unshift(`${name} beach India`);
        }
        if (tags.includes("fort") || tags.includes("heritage") || tags.includes("history")) {
            queries.unshift(`${name} fort India`);
        }
        if (tags.includes("wildlife") || tags.includes("national-park")) {
            queries.unshift(`${name} national park India`);
        }
        if (tags.includes("mountains") || tags.includes("himalaya")) {
            queries.unshift(`${name} mountains India`);
        }
        if (name.toLowerCase() === "alibaug" || name.toLowerCase() === "alibag") {
            queries.unshift("Varsoli Beach Alibaug", "Alibaug Beach Maharashtra", "Kolaba Fort Alibaug");
        }
        return [...new Set(queries)];
    }

    async function findPlaceImage(destination) {
        // Wikimedia Commons is used so the site does not blindly hotlink random Google images.
        for (const query of imageQueries(destination)) {
            try {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json&origin=*`;
                const response = await fetch(url);
                if (!response.ok) continue;
                const data = await response.json();
                const pages = Object.values(data.query?.pages || {});
                const candidate = pages.find(page => {
                    const title = String(page.title || "").toLowerCase();
                    const info = page.imageinfo?.[0];
                    const imageUrl = info?.thumburl || info?.url;
                    return imageUrl && !/flag|logo|map|icon|coat.?of.?arms|symbol/i.test(title);
                });
                if (candidate) {
                    const info = candidate.imageinfo[0];
                    return {
                        url: info.thumburl || info.url,
                        source: "Wikimedia Commons",
                        title: candidate.title
                    };
                }
            } catch (error) {
                console.warn("Place image search failed:", error);
            }
        }
        return null;
    }

    function render(container, destination) {
        const name = destination.name || "Destination";
        const country = destination.country || "India";
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

        // Render metadata only from the currently selected destination object.
        container.innerHTML = `
            <section class="destination-hero">
                <div class="destination-banner">
                    <div class="destination-image-loading">Finding a real ${esc(name)} photograph…</div>
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

    async function addVerifiedImage(container, destination) {
        const result = await findPlaceImage(destination);
        const banner = container.querySelector(".destination-banner");
        if (!banner) return;

        if (result?.url) {
            banner.innerHTML = `
                <img src="${esc(result.url)}" alt="${esc(destination.name)}" class="destination-banner-image">
                <small class="destination-image-credit">${esc(result.source)} · ${esc(result.title.replace(/^File:/i, ""))}</small>
            `;
        } else {
            banner.innerHTML = `
                <div class="destination-image-unavailable">
                    <strong>Real destination photograph unavailable</strong>
                    <span>We won't substitute a random beach, mountain or foreign location.</span>
                </div>
            `;
        }
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
        await addVerifiedImage(container, destination);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
