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
