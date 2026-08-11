// ==========================================
// Nature Tours Destination Page
// ==========================================

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const container =
        document.getElementById("destination-page");

    if (!container) {
        console.error("destination-page element not found.");
        return;
    }

    try {

        // --------------------------------------
        // Read URL
        // --------------------------------------

        const params =
            new URLSearchParams(window.location.search);

        const id =
            params.get("id");

        if (!id) {

            container.innerHTML = `
                <div class="glance-card">
                    <h2>Destination not specified</h2>
                    <p>Please search for a destination first.</p>
                </div>
            `;

            return;
        }

        // --------------------------------------
        // Load normal database destinations
        // --------------------------------------

        let destination = null;

        try {

            await window.DestinationEngine.load();

            destination =
                window.DestinationEngine.destinations.find(
                    d => String(d.id) === String(id)
                );

        } catch (error) {

            console.warn(
                "Could not load normal destinations:",
                error
            );

        }

        // --------------------------------------
        // Check dynamically discovered destination
        // --------------------------------------

        if (!destination) {

            const saved =
                localStorage.getItem(
                    "natureToursDynamicDestination"
                );

            if (saved) {

                try {

                    const dynamicDestination =
                        JSON.parse(saved);

                    if (
                        dynamicDestination &&
                        String(dynamicDestination.id) ===
                            String(id)
                    ) {

                        destination =
                            dynamicDestination;

                    }

                } catch (error) {

                    console.warn(
                        "Invalid saved destination:",
                        error
                    );

                }

            }

        }

        // --------------------------------------
        // Destination not found
        // --------------------------------------

        if (!destination) {

            container.innerHTML = `
                <div class="glance-card">
                    <h2>Destination not found</h2>
                    <p>
                        The requested destination could not be loaded.
                    </p>
                </div>
            `;

            return;
        }

        // --------------------------------------
        // Load hotels and attractions
        // --------------------------------------

        let hotels = [];
        let attractions = [];

        try {

            const [
                hotelResponse,
                attractionResponse
            ] = await Promise.all([
                fetch("data/hotels.json"),
                fetch("data/attractions.json")
            ]);

            if (hotelResponse.ok) {
                hotels =
                    await hotelResponse.json();
            }

            if (attractionResponse.ok) {
                attractions =
                    await attractionResponse.json();
            }

        } catch (error) {

            console.warn(
                "Hotels/attractions could not be loaded:",
                error
            );

        }

        // --------------------------------------
        // Destination image
        // --------------------------------------

        let destinationImage = "";

        if (
            destination.image &&
            typeof destination.image === "string"
        ) {

            destinationImage =
                destination.image;

        } else if (
            window.ImageService &&
            typeof ImageService.getDestinationImage ===
                "function"
        ) {

            destinationImage =
                ImageService.getDestinationImage(
                    destination.id
                );

        }

        // --------------------------------------
        // Hero
        // --------------------------------------

        container.innerHTML = `

            <section class="destination-hero">

                <div class="destination-banner">

                    <img
                        src="${destinationImage}"
                        alt="${destination.name || "Destination"}"
                        class="destination-banner-image"
                        onerror="
                            this.onerror=null;
                            this.src='https://placehold.co/1200x600?text=Destination';
                        "
                    >

                </div>

                <div class="destination-info">

                    <h1>
                        ${destination.name || "-"}
                    </h1>

                    <p class="destination-location">

                        🌍
                        ${destination.country || "-"}
                        ${destination.continent
                            ? ` • ${destination.continent}`
                            : ""}

                    </p>

                    ${
                        destination.description
                            ? `
                                <p class="destination-description">
                                    ${destination.description}
                                </p>
                            `
                            : ""
                    }

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

                    ${
                        Array.isArray(destination.tags) &&
                        destination.tags.length
                            ? `
                                <div class="destination-tags">

                                    ${destination.tags
                                        .map(tag => `
                                            <span class="destination-tag">
                                                ${tag}
                                            </span>
                                        `)
                                        .join("")}

                                </div>
                            `
                            : ""
                    }

                </div>

            </section>

        `;

        // --------------------------------------
        // Dynamic destination details
        // --------------------------------------

        if (
            destination.latitude !== undefined ||
            destination.longitude !== undefined
        ) {

            container.innerHTML += `

                <section class="destination-coordinates">

                    <h2>Location</h2>

                    <p>
                        📍
                        ${destination.latitude ?? "-"},
                        ${destination.longitude ?? "-"}
                    </p>

                </section>

            `;

        }

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

                const hotelImage =
                    window.ImageService &&
                    typeof ImageService.getHotelImage ===
                        "function"
                        ? ImageService.getHotelImage(hotel.id)
                        : "";

                container.innerHTML += `

                    <div class="hotel-card">

                        <img
                            class="hotel-photo"
                            src="${hotelImage}"
                            alt="${hotel.name || "Hotel"}"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://placehold.co/800x500?text=Hotel';
                            "
                        >

                        <div class="hotel-content">

                            <h3>
                                ${hotel.name || "-"}
                            </h3>

                            <p>
                                ⭐ ${hotel.rating || "-"} Stars
                            </p>

                            <p class="hotel-price">
                                ₹${Number(
                                    hotel.price || 0
                                ).toLocaleString("en-IN")}
                                / night
                            </p>

                            <p>
                                ${hotel.address || ""}
                            </p>

                            <div class="hotel-amenities">

                                ${(hotel.amenities || [])
                                    .map(amenity => `
                                        <span>
                                            ${amenity}
                                        </span>
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
                                            class="hotel-btn"
                                        >
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

                const attractionImage =
                    window.ImageService &&
                    typeof ImageService.getAttractionImage ===
                        "function"
                        ? ImageService.getAttractionImage(
                            attraction.id
                        )
                        : "";

                container.innerHTML += `

                    <div class="hotel-card">

                        <img
                            class="hotel-photo"
                            src="${attractionImage}"
                            alt="${attraction.name || "Attraction"}"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://placehold.co/800x500?text=Attraction';
                            "
                        >

                        <div class="hotel-content">

                            <h3>
                                ${attraction.name || "-"}
                            </h3>

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

        // --------------------------------------
        // Clean up dynamic destination storage
        // --------------------------------------

        if (
            destination.id &&
            localStorage.getItem(
                "natureToursDestination"
            ) === destination.id
        ) {

            // Keep it available while the page is open.
            // It can be replaced by the next search.

        }

        console.log(
            "Destination page loaded:",
            destination.name
        );

    } catch (error) {

        console.error(
            "Destination page error:",
            error
        );

        container.innerHTML = `

            <div class="glance-card">

                <h2>
                    Unable to load destination
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});
