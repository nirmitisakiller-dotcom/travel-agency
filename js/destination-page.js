// ==========================================
// Nature Tours Destination Page
// ==========================================

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("destination-page");

    if (!container) {
        console.error("destination-page element not found.");
        return;
    }

    try {

        // --------------------------------------
        // Load Destination Data
        // --------------------------------------

        await window.DestinationEngine.load();

        const [hotelResponse, attractionResponse] = await Promise.all([
            fetch("data/hotels.json"),
            fetch("data/attractions.json")
        ]);

        if (!hotelResponse.ok) {
            throw new Error("Unable to load hotel database.");
        }

        if (!attractionResponse.ok) {
            throw new Error("Unable to load attraction database.");
        }

        const hotels = await hotelResponse.json();
        const attractions = await attractionResponse.json();

        // --------------------------------------
        // Read URL
        // --------------------------------------

        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        // --------------------------------------
        // Find Destination
        // --------------------------------------

        const destination =
            window.DestinationEngine.destinations.find(
                d => d.id === id
            );

        if (!destination) {

            container.innerHTML = `
                <div class="glance-card">
                    <h2>Destination not found</h2>
                    <p>The requested destination does not exist.</p>
                </div>
            `;

            return;
        }

        // --------------------------------------
        // Destination Hero
        // --------------------------------------

        container.innerHTML = `

            <section class="destination-hero">

                <div class="destination-banner">

                    <img
                        src="${ImageService.getDestinationImage(destination.id)}"
                        alt="${destination.name}"
                        class="destination-banner-image"
                        onerror="this.onerror=null;this.src='https://placehold.co/1200x600?text=Destination';"
                    >

                </div>

                <div class="destination-info">

                    <h1>${destination.name}</h1>

                    <p class="destination-location">
                        🌍 ${destination.country} • ${destination.continent}
                    </p>

                    <div class="destination-details">

                        <p>
                            <strong>Region:</strong>
                            ${destination.region || "-"}
                        </p>

                        <p>
                            <strong>Airport:</strong>
                            ${destination.airport || "-"}
                        </p>

                        <p>
                            <strong>Currency:</strong>
                            ${destination.currency || "-"}
                        </p>

                        <p>
                            <strong>Language:</strong>
                            ${destination.language || "-"}
                        </p>

                        <p>
                            <strong>Timezone:</strong>
                            ${destination.timezone || "-"}
                        </p>

                        <p>
                            <strong>Best Season:</strong>
                            ${destination.bestSeason || "-"}
                        </p>

                    </div>

                    <div class="destination-tags">

                        ${(destination.tags || [])
                            .map(tag => `
                                <span class="destination-tag">
                                    ${tag}
                                </span>
                            `)
                            .join("")}

                    </div>

                </div>

            </section>
        `;


        // --------------------------------------
        // Hotels
        // --------------------------------------

        const destinationHotels =
            hotels.filter(hotel =>
                hotel.destinationId === destination.id
            );

        if (destinationHotels.length > 0) {

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

                        <img
                            class="hotel-photo"
                            src="${ImageService.getHotelImage(hotel.id)}"
                            alt="${hotel.name}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='https://placehold.co/800x500?text=Hotel';"
                        >

                        <div class="hotel-content">

                            <h3>${hotel.name}</h3>

                            <p>
                                ⭐ ${hotel.rating} Stars
                            </p>

                            <p class="hotel-price">
                                ₹${Number(hotel.price || 0).toLocaleString("en-IN")}
                                / night
                            </p>

                            <p>
                                ${hotel.address || ""}
                            </p>

                            <div class="hotel-amenities">

                                ${(hotel.amenities || [])
                                    .map(amenity => `
                                        <span>${amenity}</span>
                                    `)
                                    .join("")}

                            </div>

                            ${
                                hotel.bookingUrl
                                    ? `
                                        <a
                                            href="${hotel.bookingUrl}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="hotel-btn">
                                            Book Now
                                        </a>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            });

            container.innerHTML += `

                    </div>

                </section>

            `;

        }


        // --------------------------------------
        // Attractions
        // --------------------------------------

        const destinationAttractions =
            attractions.filter(attraction =>
                attraction.destinationId === destination.id
            );

        if (destinationAttractions.length > 0) {

            container.innerHTML += `

                <section class="attraction-section">

                    <h2 class="hotel-section-title">
                        Top Attractions
                    </h2>

                    <div class="hotel-grid">

            `;

            destinationAttractions.forEach(attraction => {

                container.innerHTML += `

                    <div class="hotel-card">

                        <img
                            class="hotel-photo"
                            src="${ImageService.getAttractionImage(attraction.id)}"
                            alt="${attraction.name}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='https://placehold.co/800x500?text=Attraction';"
                        >

                        <div class="hotel-content">

                            <h3>${attraction.name}</h3>

                            <p>
                                ⭐ ${attraction.rating || "-"}
                            </p>

                            <p>
                                📍 ${attraction.type || "-"}
                            </p>

                            <p>
                                ${attraction.description || ""}
                            </p>

                            ${
                                attraction.price
                                    ? `
                                        <p class="hotel-price">
                                            ${attraction.price}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            });

            container.innerHTML += `

                    </div>

                </section>

            `;

        }

        console.log(
            "Destination page loaded:",
            destination.name
        );

    } catch (error) {

        console.error("Destination page error:", error);

        container.innerHTML = `

            <div class="glance-card">

                <h2>Unable to load destination</h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});
