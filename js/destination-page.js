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

<div class="destination-hero">

    <div class="destination-info">

        <h1>${destination.name}</h1>

        <p>🌍 ${destination.country}</p>

        <p>📍 ${destination.region || destination.state || "-"}</p>

        <p>✈️ ${destination.airport || "-"}</p>

        <p>💰 ${destination.currency || "-"}</p>

        <p>🗣 ${destination.language || "-"}</p>

        <p>🕒 ${destination.timezone || "-"}</p>

        <p>🌸 Best Season: ${destination.bestSeason || "-"}</p>

    </div>

</div>

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
