// ==========================================
// Nature Tours Destination Page
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    // -----------------------------
    // Load Data
    // -----------------------------

    await window.DestinationEngine.load();

    const hotelResponse =
        await fetch("data/hotels.json");

    const hotels =
        await hotelResponse.json();

    const attractionResponse =
        await fetch("data/attractions.json");

    const attractions =
        await attractionResponse.json();

    const destinations =
        window.DestinationEngine.destinations;

    // -----------------------------
    // Read URL
    // -----------------------------

    const params =
        new URLSearchParams(window.location.search);

    const id =
        params.get("id");

    // -----------------------------
    // Find Destination
    // -----------------------------

    const destination =
        destinations.find(d => d.id === id);

    const container =
        document.getElementById("destination-page");

    if (!container) {

        console.error("destination-page element not found.");

        return;

    }

    if (!destination) {

        container.innerHTML = `

            <div class="glance-card">

                <h2>Destination not found</h2>

                <p>The requested destination does not exist.</p>

            </div>

        `;

        return;

    }

    // Next section goes here...
    // -----------------------------
    // Destination Hero
    // -----------------------------

    container.innerHTML = `

    <section class="destination-hero">

        <div class="destination-banner">

            <img
                src="https://placehold.co/1200x500?text=${encodeURIComponent(destination.name)}"
                alt="${destination.name}"
                class="destination-banner-image">

        </div>

        <div class="destination-info">

            <h1>${destination.name}</h1>

            <p class="destination-location">

                🌍 ${destination.country} • ${destination.continent}

            </p>

            <div class="destination-details">

                <p><strong>Region:</strong> ${destination.region || "-"}</p>

                <p><strong>Airport:</strong> ${destination.airport || "-"}</p>

                <p><strong>Currency:</strong> ${destination.currency || "-"}</p>

                <p><strong>Language:</strong> ${destination.language || "-"}</p>

                <p><strong>Timezone:</strong> ${destination.timezone || "-"}</p>

                <p><strong>Best Season:</strong> ${destination.bestSeason || "-"}</p>

            </div>

            <div class="destination-tags">

                ${(destination.tags || []).map(tag => `

                    <span class="destination-tag">

                        ${tag}

                    </span>

                `).join("")}

            </div>

        </div>

    </section>

    `;
