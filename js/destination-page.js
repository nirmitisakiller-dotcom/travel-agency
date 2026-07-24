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

if (destinationHotels.length) {

    container.innerHTML += `

    <section class="hotel-section">

        <h2 class="hotel-section-title">

            Recommended Hotels

        </h2>

        <div class="hotel-grid">

    `;

    destinationHotels.forEach(hotel => {

        container.innerHTML += `

        <div class="hotel-card">

            <div class="hotel-image">

                🏨

            </div>

            <div class="hotel-content">

                <h3>${hotel.name}</h3>

                <p>⭐ ${hotel.rating} Stars</p>

                <p class="hotel-price">

                    ₹${hotel.price.toLocaleString()} / night

                </p>

                <p>

                    📍 ${hotel.address}

                </p>

                <a
                    href="${hotel.bookingUrl}"
                    target="_blank"
                    class="hotel-btn">

                    View Details

                </a>

            </div>

        </div>

        `;

    });

    container.innerHTML += `

        </div>

    </section>

    `;

}
