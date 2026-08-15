// ==========================================
// Nature Tours Destination Page
// ==========================================

"use strict";

function escapeDestinationHtml(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getDestinationHotelBookingLink(hotel) {
    const configuredUrl = String(hotel?.bookingUrl || "").trim();

    if (configuredUrl && configuredUrl !== "#") {
        return configuredUrl;
    }

    const searchText = `${hotel?.name || "Hotel"} ${hotel?.address || ""}`.trim();

    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchText)}`;
}

function getDestinationMapsLink(hotel) {
    const query = encodeURIComponent(
        `${hotel?.name || ""} ${hotel?.address || ""}`
    );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getDestinationWhatsAppLink(hotel) {
    const text = encodeURIComponent(
`Hello Nature Tours,

I'm interested in booking:

🏨 ${hotel?.name || ""}

📍 ${hotel?.address || ""}

Could you please provide more information?`
    );

    return `https://wa.me/919999999999?text=${text}`;
}

document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("destination-page");

    if (!container) {
        console.error("destination-page element not found.");
        return;
    }

    try {

        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

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
        // Resolve destination
        // --------------------------------------

        let destination = null;

        try {
            await window.DestinationEngine.load();
            destination = window.DestinationEngine.destinations.find(
                d => String(d.id) === String(id)
            );
        } catch (error) {
            console.warn("Could not load normal destinations:", error);
        }

        if (!destination) {
            const saved = localStorage.getItem(
                "natureToursDynamicDestination"
            );

            if (saved) {
                try {
                    const dynamicDestination = JSON.parse(saved);
                    if (
                        dynamicDestination &&
                        String(dynamicDestination.id) === String(id)
                    ) {
                        destination = dynamicDestination;
                    }
                } catch (error) {
                    console.warn("Invalid saved destination:", error);
                }
            }
        }

        if (!destination) {
            container.innerHTML = `
                <div class="glance-card">
                    <h2>Destination not found</h2>
                    <p>The requested destination could not be loaded.</p>
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
            const [hotelResponse, attractionResponse] = await Promise.all([
                fetch("data/hotels.json"),
                fetch("data/attractions.json")
            ]);

            if (hotelResponse.ok) {
                hotels = await hotelResponse.json();
            }

            if (attractionResponse.ok) {
                attractions = await attractionResponse.json();
            }
        } catch (error) {
            console.warn("Hotels/attractions could not be loaded:", error);
        }

        // --------------------------------------
        // Destination image
        // --------------------------------------

        let destinationImage = "";

        if (destination.image) {
            destinationImage = destination.image;
        } else if (
            window.ImageService &&
            typeof ImageService.getDestinationImage === "function"
        ) {
            destinationImage = ImageService.getDestinationImage(destination.id);
        }

        // --------------------------------------
        // Hero
        // --------------------------------------

        container.innerHTML = `
            <section class="destination-hero">

                <div class="destination-banner">
                    <img
                        src="${escapeDestinationHtml(destinationImage)}"
                        alt="${escapeDestinationHtml(destination.name || "Destination") }"
                        class="destination-banner-image"
                        onerror="
                            this.onerror=null;
                            this.src='https://placehold.co/1200x600?text=Destination';
                        "
                    >
                </div>

                <div class="destination-info">

                    <h1>${escapeDestinationHtml(destination.name || "-")}</h1>

                    <p class="destination-location">
                        🌍 ${escapeDestinationHtml(destination.country || "-")}
                        ${destination.continent
                            ? ` • ${escapeDestinationHtml(destination.continent)}`
                            : ""}
                    </p>

                    ${destination.description
                        ? `
                            <p class="destination-description">
                                ${escapeDestinationHtml(destination.description)}
                            </p>
                        `
                        : ""
                    }

                    <div class="destination-details">
                        <p><strong>Region:</strong> ${escapeDestinationHtml(destination.region || "-")}</p>
                        <p><strong>Airport:</strong> ${escapeDestinationHtml(destination.airport || "-")}</p>
                        <p><strong>Currency:</strong> ${escapeDestinationHtml(destination.currency || "-")}</p>
                        <p><strong>Language:</strong> ${escapeDestinationHtml(destination.language || "-")}</p>
                        <p><strong>Timezone:</strong> ${escapeDestinationHtml(destination.timezone || "-")}</p>
                        <p><strong>Best Season:</strong> ${escapeDestinationHtml(destination.bestSeason || "-")}</p>
                    </div>

                    ${Array.isArray(destination.tags) && destination.tags.length
                        ? `
                            <div class="destination-tags">
                                ${destination.tags
                                    .map(tag => `
                                        <span class="destination-tag">
                                            ${escapeDestinationHtml(tag)}
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
        // Coordinates
        // --------------------------------------

        if (
            destination.latitude !== undefined ||
            destination.longitude !== undefined
        ) {
            container.innerHTML += `
                <section class="destination-coordinates">
                    <h2>Location</h2>
                    <p>
                        📍 ${destination.latitude ?? "-"}, ${destination.longitude ?? "-"}
                    </p>
                </section>
            `;
        }

        // --------------------------------------
        // Hotels
        // --------------------------------------

        const destinationHotels = hotels.filter(
            hotel => hotel.destinationId === destination.id
        );

        if (destinationHotels.length > 0) {

            container.innerHTML += `
                <section class="hotel-section">
                    <h2 class="hotel-section-title">Recommended Hotels</h2>
                    <div class="hotel-grid">
            `;

            destinationHotels.forEach(hotel => {

                const hotelImage =
                    window.ImageService &&
                    typeof ImageService.getHotelImage === "function"
                        ? ImageService.getHotelImage(hotel.id)
                        : hotel.image || `assets/hotels/${hotel.id}.jpg`;

                const bookingLink = getDestinationHotelBookingLink(hotel);
                const mapsLink = getDestinationMapsLink(hotel);
                const whatsappLink = getDestinationWhatsAppLink(hotel);

                container.innerHTML += `
                    <div class="hotel-card">

                        <img
                            class="hotel-photo"
                            src="${escapeDestinationHtml(hotelImage)}"
                            alt="${escapeDestinationHtml(hotel.name || "Hotel") }"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://placehold.co/800x500?text=Hotel';
                            "
                        >

                        <div class="hotel-content">

                            <h3>${escapeDestinationHtml(hotel.name || "-")}</h3>

                            <p>⭐ ${escapeDestinationHtml(hotel.rating || "-")} Stars</p>

                            <p class="hotel-price">
                                ₹${Number(hotel.price || 0).toLocaleString("en-IN")}
                                / night
                            </p>

                            <p>${escapeDestinationHtml(hotel.address || "")}</p>

                            <div class="hotel-amenities">
                                ${(hotel.amenities || [])
                                    .map(amenity => `
                                        <span>${escapeDestinationHtml(amenity)}</span>
                                    `)
                                    .join("")}
                            </div>

                            <div class="hotel-buttons">

                                <a
                                    href="${escapeDestinationHtml(bookingLink)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hotel-btn"
                                >
                                    Find &amp; Book
                                </a>

                                <a
                                    href="${escapeDestinationHtml(mapsLink)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hotel-btn"
                                >
                                    Google Maps
                                </a>

                                <a
                                    href="${escapeDestinationHtml(whatsappLink)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hotel-btn"
                                >
                                    WhatsApp
                                </a>

                            </div>

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

        const destinationAttractions = attractions.filter(
            attraction => attraction.destinationId === destination.id
        );

        if (destinationAttractions.length > 0) {

            container.innerHTML += `
                <section class="attraction-section">
                    <h2 class="hotel-section-title">Top Attractions</h2>
                    <div class="hotel-grid">
            `;

            destinationAttractions.forEach(attraction => {

                const attractionImage =
                    window.ImageService &&
                    typeof ImageService.getAttractionImage === "function"
                        ? ImageService.getAttractionImage(attraction.id)
                        : attraction.image || `assets/attractions/${attraction.id}.jpg`;

                container.innerHTML += `
                    <div class="hotel-card">

                        <img
                            class="hotel-photo"
                            src="${escapeDestinationHtml(attractionImage)}"
                            alt="${escapeDestinationHtml(attraction.name || "Attraction") }"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://placehold.co/800x500?text=Attraction';
                            "
                        >

                        <div class="hotel-content">
                            <h3>${escapeDestinationHtml(attraction.name || "-")}</h3>
                            <p>⭐ ${escapeDestinationHtml(attraction.rating || "-")}</p>
                            <p>📍 ${escapeDestinationHtml(attraction.type || "-")}</p>
                            <p>${escapeDestinationHtml(attraction.description || "")}</p>

                            ${attraction.price
                                ? `
                                    <p class="hotel-price">
                                        ${escapeDestinationHtml(attraction.price)}
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

        console.log("Destination page loaded:", destination.name);

    } catch (error) {

        console.error("Destination page error:", error);

        container.innerHTML = `
            <div class="glance-card">
                <h2>Unable to load destination</h2>
                <p>${escapeDestinationHtml(error.message)}</p>
            </div>
        `;
    }
});
