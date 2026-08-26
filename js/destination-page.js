/* Nature Tours destination detail renderer - universal resolver */
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
                if (Array.isArray(loaded)) return loaded;
            }
        } catch (error) {
            console.warn("DestinationEngine failed; using direct catalogue fallback.", error);
        }

        try {
            const response = await fetch("data/destinations.json?fallback=place-images-4");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Destination catalogue failed:", error);
            return [];
        }
    }

    function findDestination(destinations, requested) {
        const key = String(requested || "").trim().toLowerCase();
        const slug = key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return destinations.find(d => String(d.id || "").toLowerCase() === key)
            || destinations.find(d => String(d.name || "").toLowerCase() === key)
            || destinations.find(d => Array.isArray(d.destinationAliases) && d.destinationAliases.some(alias => String(alias).toLowerCase() === key))
            || destinations.find(d => String(d.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug)
            || null;
    }

    async function resolveWorldwide(requested) {
        if (!window.DestinationEngine || typeof window.DestinationEngine.resolveWorldwide !== "function") return null;
        try {
            return await window.DestinationEngine.resolveWorldwide(requested);
        } catch (error) {
            console.warn("Worldwide destination resolver failed:", error);
            return null;
        }
    }

    function imageQueries(destination) {
        const name = String(destination.name || "").trim();
        const region = String(destination.region || destination.state || "").trim();
        const country = String(destination.country || "").trim();
        const tags = Array.isArray(destination.tags) ? destination.tags.map(String) : [];
        const queries = Array.isArray(destination.imageSearchTerms) ? [...destination.imageSearchTerms] : [`${name}, ${region}, ${country}`, `${name} tourist attraction`, `${name} ${country}`];
        if (tags.includes("beaches") || tags.includes("beach") || tags.includes("coastal")) queries.unshift(`${name} beach ${country}`);
        if (tags.includes("fort") || tags.includes("heritage") || tags.includes("history")) queries.unshift(`${name} heritage ${country}`);
        if (tags.includes("wildlife") || tags.includes("national-park")) queries.unshift(`${name} national park ${country}`);
        if (tags.includes("mountains") || tags.includes("himalaya")) queries.unshift(`${name} mountains ${country}`);
        if (["alibaug", "alibag", "alibagh"].includes(name.toLowerCase())) queries.unshift("Varsoli Beach Alibaug", "Alibaug Beach Maharashtra", "Kolaba Fort Alibaug");
        return [...new Set(queries)];
    }

    async function findPlaceImage(destination) {
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
                    return { url: info.thumburl || info.url, source: "Wikimedia Commons", title: candidate.title };
                }
            } catch (error) { console.warn("Place image search failed:", error); }
        }
        return null;
    }

    function render(container, destination) {
        const name = destination.name || "Destination";
        const country = destination.country || "";
        const description = destination.description || `Explore ${name}${country ? `, ${country}` : ""} with Nature Tours, including local attractions, hotels and personalised travel planning.`;
        const details = [["Region", destination.region], ["Airport", destination.airport], ["Currency", destination.currency], ["Language", destination.language], ["Timezone", destination.timezone], ["Best Season", destination.bestSeason]];
        const tags = Array.isArray(destination.tags) ? destination.tags : [];
        container.innerHTML = `<section class="destination-hero"><div class="destination-banner"><div class="destination-image-loading">Finding a real ${esc(name)} photograph…</div></div><div class="destination-info"><h1>${esc(name)}</h1><p class="destination-location">🌍 ${esc(country)}${destination.continent ? ` • ${esc(destination.continent)}` : ""}</p><p class="destination-description">${esc(description)}</p><div class="destination-details">${details.map(([label, value]) => `<p><strong>${esc(label)}:</strong> ${esc(value || "-")}</p>`).join("")}</div>${tags.length ? `<div class="destination-tags">${tags.map(tag => `<span class="destination-tag">${esc(tag)}</span>`).join("")}</div>` : ""}</div></section>`;
        document.title = `${name} Travel Guide | Nature Tours`;
        window.dispatchEvent(new CustomEvent("natureToursDestinationReady", { detail: destination }));
        return true;
    }

    async function addVerifiedImage(container, destination) {
        const result = await findPlaceImage(destination);
        const banner = container.querySelector(".destination-banner");
        if (!banner) return;
        if (result?.url) banner.innerHTML = `<img src="${esc(result.url)}" alt="${esc(destination.name)}" class="destination-banner-image"><small class="destination-image-credit">${esc(result.source)} · ${esc(result.title.replace(/^File:/i, ""))}</small>`;
        else banner.innerHTML = `<div class="destination-image-unavailable"><strong>Real destination photograph unavailable</strong><span>We won't substitute a random beach, mountain or foreign location.</span></div>`;
    }

    async function init() {
        const container = document.getElementById("destination-page");
        if (!container) return;
        const requested = getRequestedDestination();
        if (!requested) { container.innerHTML = '<div class="glance-card"><h2>Destination not specified</h2><p>Please select a destination first.</p></div>'; return; }

        // IMPORTANT: resolve through the universal engine first. The old page only
        // searched the loaded catalogue, which made worldwide/Nominatim destinations
        // impossible even though DestinationEngine could resolve them.
        let destination = null;
        try {
            if (window.DestinationEngine && typeof window.DestinationEngine.find === "function") {
                destination = await window.DestinationEngine.find(requested);
            }
        } catch (error) {
            console.warn("Universal destination lookup failed:", error);
        }

        if (!destination) {
            const destinations = await loadDestinations();
            destination = findDestination(destinations, requested);
        }

        if (!destination) {
            destination = await resolveWorldwide(requested);
        }

        if (!destination) {
            container.innerHTML = `<div class="glance-card"><h2>Destination not found</h2><p>We could not resolve “${esc(requested)}” right now.</p><p>Please check the spelling and try again.</p><p><a href="domestic.html">← Back to Destination Explorer</a></p></div>`;
            return;
        }

        render(container, destination);
        await addVerifiedImage(container, destination);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();