// ==========================================
// Nature Tours Destination Page
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await window.DestinationEngine.load();
const hotelResponse =
    await fetch("data/hotels.json");

const hotels =
    await hotelResponse.json();
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
const destinationHotels =
    hotels.filter(hotel =>
        hotel.destinationId === destination.id
    );

container.innerHTML += `

    <hr>

    <h2>Hotels</h2>

`;

destinationHotels.forEach(hotel => {

    container.innerHTML += `

        <div class="glance-card">

            <div class="card-meta">

                <h3>${hotel.name}</h3>

                <p>⭐ ${hotel.rating} Stars</p>

                <p>💰 ₹${hotel.price.toLocaleString()} / night</p>

                <p>📍 ${hotel.address}</p>

            </div>

        </div>

    `;

});
});
