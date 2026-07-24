// ==========================================
// Nature Tours Destination Page
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await window.DestinationEngine.load();

    const destinations =
        window.DestinationEngine.destinations;

    const params =
        new URLSearchParams(window.location.search);

    const id =
        params.get("id");

    const destination =
        destinations.find(d => d.id === id);

    const container =
        document.getElementById("destination-page");

    if (!destination) {

        container.innerHTML =
            "<h2>Destination not found.</h2>";

        return;

    }

    container.innerHTML = `

        <h1>${destination.name}</h1>

        <p><strong>Country:</strong> ${destination.country}</p>

        <p><strong>Region:</strong> ${destination.region || destination.state || "-"}</p>

        <p><strong>Airport:</strong> ${destination.airport || "-"}</p>

        <p><strong>Currency:</strong> ${destination.currency || "-"}</p>

        <p><strong>Language:</strong> ${destination.language || "-"}</p>

        <p><strong>Timezone:</strong> ${destination.timezone || "-"}</p>

        <p><strong>Best Season:</strong> ${destination.bestSeason || "-"}</p>

    `;

});
