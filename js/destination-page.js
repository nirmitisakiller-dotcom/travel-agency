document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("destination-page");
    if (!container) return;

    const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    if (!id) {
        container.innerHTML = '<div class="glance-card"><h2>Destination not specified</h2><p>Please select a destination first.</p></div>';
        return;
    }

    try {
        await window.DestinationEngine.load();
        const destinations = window.DestinationEngine.destinations || [];
        const destination = destinations.find(d => String(d.id) === String(id));

        if (!destination) {
            container.innerHTML = '<div class="glance-card"><h2>Destination not found</h2><p>The requested destination could not be loaded.</p></div>';
            return;
        }

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
                <div class="destination-banner"><img src="${esc(image)}" alt="${esc(name)}" class="destination-banner-image"></div>
                <div class="destination-info">
                    <h1>${esc(name)}</h1>
                    <p class="destination-location">🌍 ${esc(country)}${destination.continent ? ` • ${esc(destination.continent)}` : ""}</p>
                    <p class="destination-description">${esc(description)}</p>
                    <div class="destination-details">
                        ${details.map(([label,value]) => `<p><strong>${esc(label)}:</strong> ${esc(value || "-")}</p>`).join("")}
                    </div>
                    ${tags.length ? `<div class="destination-tags">${tags.map(tag => `<span class="destination-tag">${esc(tag)}</span>`).join("")}</div>` : ""}
                </div>
            </section>
        `;

        // Hotels are intentionally left for the next single-task update.
        // This commit only fixes the blank destination information renderer.
    } catch (error) {
        console.error("Destination page failed:", error);
        container.innerHTML = '<div class="glance-card"><h2>Unable to load destination</h2><p>Please refresh and try again.</p></div>';
    }
});
