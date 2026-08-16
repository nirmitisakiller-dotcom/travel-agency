// ==========================================
// Nature Tours Destination Page
// ==========================================

"use strict";

const CLIENT_WHATSAPP = "919822339466";

function escapeDestinationHtml(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getHotelEnquiryLink(hotel, destination) {
    const message = encodeURIComponent(
`Hello Nature Tours,

I would like to enquire about this hotel:

🏨 Hotel: ${hotel?.name || ""}
📍 Location: ${hotel?.address || destination?.name || ""}
⭐ Rating: ${hotel?.rating || "N/A"}/5
💰 Listed price: ₹${Number(hotel?.price || 0).toLocaleString("en-IN")} per night

Please contact me regarding availability and booking.

Thank you.`
    );

    return `https://wa.me/${CLIENT_WHATSAPP}?text=${message}`;
}

function getDestinationMapsLink(hotel) {
    const query = encodeURIComponent(
        `${hotel?.name || ""} ${hotel?.address || ""}`
    );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// ------------------------------------------
// Curated attraction names
// ------------------------------------------

const CURATED_ATTRACTIONS = {
    paris: [
        { name: "Eiffel Tower", type: "Landmark", rating: 4.9, price: "₹2,500", description: "Iconic Paris landmark with panoramic views across the city.", image: "assets/attractions/eiffel.jpg" },
        { name: "Louvre Museum", type: "Museum", rating: 4.8, price: "₹1,800", description: "World-famous museum home to an extraordinary collection of art and antiquities.", image: "assets/attractions/louvre.jpg" },
        { name: "Jardin du Luxembourg", type: "Garden", rating: 4.7, price: "Free", description: "Elegant Parisian gardens with fountains, promenades and quiet green spaces.", image: "assets/attractions/gardens.jpg" },
        { name: "Montmartre & Sacré-Cœur", type: "Historic", rating: 4.8, price: "Free", description: "Historic hilltop district known for art, views and the Basilica of Sacré-Cœur.", image: "assets/attractions/louvre.jpg" },
        { name: "Seine River Cruise", type: "Scenic", rating: 4.8, price: "₹1,500", description: "See Paris landmarks from the Seine on a relaxing sightseeing cruise.", image: "assets/attractions/eiffel.jpg" }
    ],
    tokyo: [
        { name: "Senso-ji Temple", type: "Temple", rating: 4.8, price: "Free", description: "Tokyo's famous historic Buddhist temple in Asakusa.", image: "assets/attractions/tokyo-sensoji.jpg" },
        { name: "Shibuya Crossing", type: "Landmark", rating: 4.8, price: "Free", description: "One of the world's best-known pedestrian crossings in the heart of Tokyo.", image: "assets/attractions/tokyo-shibuya.jpg" },
        { name: "Tokyo Skytree", type: "Observation", rating: 4.7, price: "₹1,900", description: "Towering observation deck with sweeping views over Tokyo.", image: "assets/attractions/tokyo-skytree.jpg" },
        { name: "Meiji Shrine", type: "Shrine", rating: 4.8, price: "Free", description: "Peaceful Shinto shrine surrounded by a forested area near Harajuku.", image: "assets/attractions/tokyo-meiji.jpg" },
        { name: "teamLab Borderless", type: "Immersive Art", rating: 4.8, price: "₹2,800", description: "Large-scale immersive digital art experience in Tokyo.", image: "assets/attractions/tokyo-teamlab.jpg" }
    ],
    bali: [
        { name: "Ubud Rice Terraces", type: "Nature", rating: 4.8, price: "₹500", description: "Lush terraced landscapes around Ubud showcasing Bali's farming heritage.", image: "assets/attractions/ubud.jpg" },
        { name: "Tanah Lot Temple", type: "Temple", rating: 4.8, price: "₹600", description: "Scenic sea temple perched on a rocky coastal outcrop.", image: "assets/attractions/ubud.jpg" },
        { name: "Uluwatu Temple", type: "Temple", rating: 4.9, price: "₹700", description: "Clifftop Balinese temple overlooking the Indian Ocean.", image: "assets/attractions/ubud.jpg" },
        { name: "Tegallalang Village", type: "Cultural", rating: 4.7, price: "₹400", description: "Beautiful rice terraces, crafts and village scenery north of Ubud.", image: "assets/attractions/ubud.jpg" },
        { name: "Nusa Penida Day Trip", type: "Island", rating: 4.8, price: "₹2,500", description: "Explore dramatic coastlines, viewpoints and beaches on Nusa Penida.", image: "assets/attractions/ubud.jpg" }
    ],
    singapore: [
        { name: "Gardens by the Bay", type: "Nature", rating: 4.8, price: "₹1,200", description: "Futuristic gardens famous for Supertrees, conservatories and waterfront views.", image: "assets/attractions/gardens.jpg" },
        { name: "Marina Bay Sands SkyPark", type: "Observation", rating: 4.7, price: "₹2,000", description: "Observation deck overlooking Singapore's skyline and Marina Bay.", image: "assets/attractions/gardens.jpg" },
        { name: "Sentosa Island", type: "Island", rating: 4.7, price: "₹1,500", description: "Resort island packed with beaches, attractions and entertainment.", image: "assets/attractions/sentosa.jpg" },
        { name: "Merlion Park", type: "Landmark", rating: 4.6, price: "Free", description: "Waterfront home of Singapore's iconic Merlion statue.", image: "assets/attractions/sentosa.jpg" },
        { name: "Singapore Zoo", type: "Wildlife", rating: 4.8, price: "₹2,000", description: "Major wildlife park known for immersive habitats and animal encounters.", image: "assets/attractions/sentosa.jpg" }
    ],
    maldives: [
        { name: "Malé Old Friday Mosque", type: "Historic", rating: 4.5, price: "Free", description: "Historic mosque and one of the best-known landmarks in Malé.", image: "assets/destinations/maldives.jpg" },
        { name: "Hulhumalé Beach", type: "Beach", rating: 4.6, price: "Free", description: "Popular urban beach with calm waters and sunset views.", image: "assets/destinations/maldives.jpg" },
        { name: "National Museum of Maldives", type: "Museum", rating: 4.4, price: "₹400", description: "Museum showcasing the history and cultural heritage of the Maldives.", image: "assets/destinations/maldives.jpg" },
        { name: "Manta Ray Snorkeling", type: "Marine Life", rating: 4.9, price: "₹4,500", description: "Guided snorkeling experience focused on Maldives marine life.", image: "assets/destinations/maldives.jpg" },
        { name: "Island Sunset Cruise", type: "Scenic", rating: 4.8, price: "₹2,500", description: "Relaxing cruise through tropical waters around the islands.", image: "assets/destinations/maldives.jpg" }
    ],
    leh: [
        { name: "Leh Palace", type: "Historic", rating: 4.6, price: "₹300", description: "Historic royal palace overlooking Leh town and the surrounding mountains.", image: "assets/destinations/leh.jpg" },
        { name: "Shanti Stupa", type: "Landmark", rating: 4.8, price: "Free", description: "White-domed Buddhist stupa with sweeping views over Leh.", image: "assets/destinations/leh.jpg" },
        { name: "Thiksey Monastery", type: "Monastery", rating: 4.8, price: "₹50", description: "Striking hilltop monastery known for its architecture and Buddhist art.", image: "assets/destinations/leh.jpg" },
        { name: "Khardung La", type: "Mountain Pass", rating: 4.7, price: "Free", description: "High-altitude mountain pass and classic Ladakh road-trip stop.", image: "assets/destinations/leh.jpg" },
        { name: "Pangong Lake", type: "Lake", rating: 4.9, price: "₹500", description: "High-altitude lake famous for dramatic blue water and mountain scenery.", image: "assets/destinations/leh.jpg" }
    ],
    ladakh: [
        { name: "Pangong Lake", type: "Lake", rating: 4.9, price: "₹500", description: "Spectacular high-altitude lake stretching between India and Tibet.", image: "assets/destinations/ladakh.jpg" },
        { name: "Nubra Valley", type: "Valley", rating: 4.9, price: "₹1,000", description: "Mountain valley known for monasteries, dunes and Himalayan landscapes.", image: "assets/destinations/ladakh.jpg" },
        { name: "Khardung La", type: "Mountain Pass", rating: 4.7, price: "Free", description: "Legendary high-altitude pass on the road from Leh toward Nubra.", image: "assets/destinations/ladakh.jpg" },
        { name: "Magnetic Hill", type: "Scenic", rating: 4.5, price: "Free", description: "Popular roadside attraction surrounded by the barren mountains of Ladakh.", image: "assets/destinations/ladakh.jpg" },
        { name: "Thiksey Monastery", type: "Monastery", rating: 4.8, price: "₹50", description: "Large hilltop monastery with traditional Ladakhi architecture.", image: "assets/destinations/ladakh.jpg" }
    ],
    spiti: [
        { name: "Key Monastery", type: "Monastery", rating: 4.9, price: "Free", description: "Spiti Valley's iconic hilltop monastery overlooking Kaza.", image: "assets/destinations/spiti.jpg" },
        { name: "Chandratal Lake", type: "Lake", rating: 4.9, price: "Free", description: "High-altitude crescent-shaped lake surrounded by Himalayan peaks.", image: "assets/destinations/spiti.jpg" },
        { name: "Tabo Monastery", type: "Monastery", rating: 4.8, price: "₹200", description: "Ancient monastery complex known for murals and Buddhist heritage.", image: "assets/destinations/spiti.jpg" },
        { name: "Kibber Village", type: "Village", rating: 4.7, price: "Free", description: "High-altitude village offering sweeping landscapes and traditional Spitian culture.", image: "assets/destinations/spiti.jpg" },
        { name: "Dhankar Monastery", type: "Monastery", rating: 4.8, price: "Free", description: "Dramatic monastery perched high above the Spiti River valley.", image: "assets/destinations/spiti.jpg" }
    ],
    hampi: [
        { name: "Virupaksha Temple", type: "Temple", rating: 4.9, price: "Free", description: "Historic temple complex and one of Hampi's most important landmarks.", image: "assets/destinations/hampi.jpg" },
        { name: "Vijaya Vittala Temple", type: "Historic", rating: 4.9, price: "₹40", description: "Famous for its stone chariot and remarkable musical pillars.", image: "assets/destinations/hampi.jpg" },
        { name: "Lotus Mahal", type: "Palace", rating: 4.7, price: "₹40", description: "Elegant palace structure set among the royal enclosures of Hampi.", image: "assets/destinations/hampi.jpg" },
        { name: "Hampi Bazaar", type: "Historic", rating: 4.6, price: "Free", description: "Historic market street lined with the remains of Vijayanagara-era buildings.", image: "assets/destinations/hampi.jpg" },
        { name: "Matanga Hill", type: "Viewpoint", rating: 4.8, price: "Free", description: "Excellent sunrise and sunset viewpoint over Hampi's boulder-strewn landscape.", image: "assets/destinations/hampi.jpg" }
    ],
    chhattisgarh: [
        { name: "Chitrakote Waterfalls", type: "Waterfall", rating: 4.8, price: "Free", description: "Large horseshoe-shaped waterfall on the Indravati River.", image: "assets/destinations/chhattisgarh.jpg" },
        { name: "Tirathgarh Waterfalls", type: "Waterfall", rating: 4.7, price: "Free", description: "Multi-tiered waterfall surrounded by forest in Bastar.", image: "assets/destinations/chhattisgarh.jpg" },
        { name: "Kanger Valley National Park", type: "Wildlife", rating: 4.8, price: "₹200", description: "Dense forest landscape with caves, wildlife and waterfalls.", image: "assets/destinations/chhattisgarh.jpg" },
        { name: "Kutumsar Caves", type: "Cave", rating: 4.6, price: "₹100", description: "Famous limestone cave system inside Kanger Valley.", image: "assets/destinations/chhattisgarh.jpg" },
        { name: "Bastar Tribal Village Tour", type: "Cultural", rating: 4.7, price: "₹1,000", description: "Cultural experience focused on traditional Bastar crafts and village life.", image: "assets/destinations/chhattisgarh.jpg" }
    ],
    nashik: [
        { name: "Sula Vineyards", type: "Vineyard", rating: 4.7, price: "₹600", description: "Popular vineyard destination with tours, tastings and hill views.", image: "assets/destinations/nashik.jpg" },
        { name: "Trimbakeshwar Temple", type: "Temple", rating: 4.8, price: "Free", description: "Important Shiva temple near the origin region of the Godavari River.", image: "assets/destinations/nashik.jpg" },
        { name: "Pandavleni Caves", type: "Cave", rating: 4.6, price: "₹20", description: "Historic rock-cut Buddhist caves overlooking Nashik.", image: "assets/destinations/nashik.jpg" },
        { name: "Godavari Ghat", type: "Historic", rating: 4.6, price: "Free", description: "Riverside ghats and spiritual center in the heart of Nashik.", image: "assets/destinations/nashik.jpg" },
        { name: "Anjaneri Hills", type: "Nature", rating: 4.7, price: "Free", description: "Scenic hills and trekking area associated with the Ramayana tradition.", image: "assets/destinations/nashik.jpg" }
    ],
    jalgaon: [
        { name: "Ajanta Caves", type: "Heritage", rating: 4.9, price: "₹40", description: "World-famous rock-cut Buddhist caves with ancient murals and sculptures.", image: "assets/destinations/jalgaon.jpg" },
        { name: "Patnadevi Temple", type: "Temple", rating: 4.5, price: "Free", description: "Historic temple site surrounded by the natural landscape near Jalgaon.", image: "assets/destinations/jalgaon.jpg" },
        { name: "Mehrun Lake", type: "Nature", rating: 4.4, price: "Free", description: "Popular local lake and green space inside Jalgaon.", image: "assets/destinations/jalgaon.jpg" },
        { name: "Gandhi Research Foundation", type: "Museum", rating: 4.6, price: "Free", description: "Museum and research center dedicated to the life and ideas of Mahatma Gandhi.", image: "assets/destinations/jalgaon.jpg" },
        { name: "Jalgaon City Heritage Walk", type: "Sightseeing", rating: 4.3, price: "₹300", description: "Local guided walk covering notable city landmarks and cultural sites.", image: "assets/destinations/jalgaon.jpg" }
    ]
};

function getCuratedAttraction(attraction, destination, index) {
    const key = String(destination?.id || "").toLowerCase();
    const curated = CURATED_ATTRACTIONS[key]?.[index];

    if (!curated) {
        return attraction;
    }

    return {
        ...attraction,
        ...curated,
        id: attraction.id
    };
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

        let destinationImage = "";

        if (destination.image) {
            destinationImage = destination.image;
        } else if (
            window.ImageService &&
            typeof ImageService.getDestinationImage === "function"
        ) {
            destinationImage = ImageService.getDestinationImage(destination.id);
        }

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

                const enquiryLink = getHotelEnquiryLink(hotel, destination);
                const mapsLink = getDestinationMapsLink(hotel);

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
                                    href="${escapeDestinationHtml(enquiryLink)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hotel-btn"
                                >
                                    Send Enquiry
                                </a>

                                <a
                                    href="${escapeDestinationHtml(mapsLink)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="hotel-btn"
                                >
                                    Google Maps
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

        const destinationAttractions = attractions.filter(
            attraction => attraction.destinationId === destination.id
        );

        if (destinationAttractions.length > 0) {
            container.innerHTML += `
                <section class="attraction-section">
                    <h2 class="hotel-section-title">Top Attractions</h2>
                    <div class="hotel-grid">
            `;

            destinationAttractions.forEach((attraction, index) => {
                const displayAttraction = getCuratedAttraction(
                    attraction,
                    destination,
                    index
                );

                const attractionImage =
                    displayAttraction.image ||
                    (window.ImageService &&
                    typeof ImageService.getAttractionImage === "function"
                        ? ImageService.getAttractionImage(displayAttraction.id)
                        : `assets/attractions/${displayAttraction.id}.jpg`);

                container.innerHTML += `
                    <div class="hotel-card">
                        <img
                            class="hotel-photo"
                            src="${escapeDestinationHtml(attractionImage)}"
                            alt="${escapeDestinationHtml(displayAttraction.name || "Attraction") }"
                            loading="lazy"
                            onerror="
                                this.onerror=null;
                                this.src='https://placehold.co/800x500?text=Attraction';
                            "
                        >

                        <div class="hotel-content">
                            <h3>${escapeDestinationHtml(displayAttraction.name || "-")}</h3>
                            <p>⭐ ${escapeDestinationHtml(displayAttraction.rating || "-")}</p>
                            <p>📍 ${escapeDestinationHtml(displayAttraction.type || "-")}</p>
                            <p>${escapeDestinationHtml(displayAttraction.description || "")}</p>

                            ${displayAttraction.price
                                ? `
                                    <p class="hotel-price">
                                        ${escapeDestinationHtml(displayAttraction.price)}
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
