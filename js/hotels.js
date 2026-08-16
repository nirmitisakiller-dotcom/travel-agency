// ==========================================
// Nature Tours Hotels
// Version 4.0
// ==========================================

"use strict";

const HotelApp = {
    hotels: [],
    destination: null,
    loading: false,
    container: null,
    wrapper: null,
    whatsappNumber: "919822339466"
};

function $(id) {
    return document.getElementById(id);
}

function getHotelImage(id) {
    if (
        window.ImageService &&
        typeof window.ImageService.getHotelImage === "function"
    ) {
        return window.ImageService.getHotelImage(id);
    }
    return `assets/hotels/${id}.jpg`;
}

function formatPrice(price) {
    if (price === undefined || price === null || price === "") {
        return "Price unavailable";
    }
    return "₹" + Number(price).toLocaleString("en-IN");
}

function escapeHtml(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showLoading(message = "Searching hotels...") {
    if (!HotelApp.container) return;
    HotelApp.loading = true;
    HotelApp.container.innerHTML = `
        <div class="loading-section">
            <div class="loading-spinner"></div>
            <h2>${escapeHtml(message)}</h2>
            <p>Please wait while we find the best hotels.</p>
        </div>
    `;
}

function showError(message) {
    if (!HotelApp.container) return;
    HotelApp.loading = false;
    HotelApp.container.innerHTML = `
        <div class="error-section">
            <h2>Oops!</h2>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function showEmpty(message = "No hotels found.") {
    if (!HotelApp.container) return;
    HotelApp.loading = false;
    HotelApp.container.innerHTML = `
        <div class="empty-section">
            <h2>No Results</h2>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function getDestinationFromURL() {
    const params = new URLSearchParams(window.location.search);
    return (
        params.get("q") ||
        params.get("destination") ||
        localStorage.getItem("natureToursDestination") ||
        ""
    );
}

async function loadHotels() {
    const response = await fetch("data/hotels.json");
    if (!response.ok) {
        throw new Error("Unable to load hotel database.");
    }
    HotelApp.hotels = await response.json();
    return HotelApp.hotels;
}

function getHotelsForDestination(destinationName) {
    if (!destinationName) return [];
    const search = destinationName.trim().toLowerCase();

    return HotelApp.hotels.filter(hotel => {
        const destinationId = String(hotel.destinationId || "").toLowerCase();
        const hotelName = String(hotel.name || "").toLowerCase();
        return (
            destinationId === search ||
            hotelName.includes(search)
        );
    });
}

function renderStars(rating = 0) {
    let stars = "";
    const numericRating = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
        stars += i <= numericRating ? "★" : "☆";
    }
    return stars;
}

function getGoogleMapsLink(hotel) {
    const query = encodeURIComponent(
        `${hotel.name || ""} ${hotel.address || ""}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getClientWhatsAppLink(hotel) {
    const message = encodeURIComponent(
`Hello Nature Tours,

I would like to enquire about this hotel:

🏨 Hotel: ${hotel.name || ""}
📍 Location: ${hotel.address || ""}
⭐ Rating: ${hotel.rating || "N/A"}/5
💰 Listed price: ${formatPrice(hotel.price)} per night

Please contact me regarding availability and booking.

Thank you.`
    );

    return `https://wa.me/${HotelApp.whatsappNumber}?text=${message}`;
}

function createHotelCard(hotel) {
    return `
        <div class="hotel-card">
            <img
                class="hotel-photo"
                src="${getHotelImage(hotel.id)}"
                alt="${escapeHtml(hotel.name || "Hotel")}"
                loading="lazy"
                onerror="this.src='https://placehold.co/600x400?text=Hotel';"
            >

            <div class="hotel-content">
                <h2>${escapeHtml(hotel.name || "Unnamed Hotel")}</h2>

                <div class="hotel-rating">
                    ${renderStars(hotel.rating)}
                    <span>${escapeHtml(String(hotel.rating || "N/A"))}/5</span>
                </div>

                <p class="hotel-address">
                    📍 ${escapeHtml(hotel.address || "Address unavailable")}
                </p>

                <p class="hotel-price">
                    ${formatPrice(hotel.price)}
                    <small>/ night</small>
                </p>

                <div class="hotel-amenities">
                    ${(hotel.amenities || [])
                        .map(amenity => `<span>${escapeHtml(amenity)}</span>`)
                        .join("")}
                </div>

                <div class="hotel-buttons">
                    <a
                        class="hotel-btn"
                        href="${getClientWhatsAppLink(hotel)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Send Enquiry
                    </a>

                    <a
                        class="hotel-btn"
                        href="${getGoogleMapsLink(hotel)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Google Maps
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderHotels(hotels) {
    HotelApp.loading = false;
    if (!HotelApp.container) return;

    if (!hotels.length) {
        showEmpty("No hotels available for this destination.");
        return;
    }

    HotelApp.container.innerHTML = hotels.map(createHotelCard).join("");

    const counter = $("hotel-results-counter");
    if (counter) {
        counter.textContent =
            `Showing ${hotels.length} hotel option${hotels.length === 1 ? "" : "s"}`;
    }
}

async function initializeHotels() {
    HotelApp.container =
        $("hotel-cards-target-grid") ||
        $("hotel-results") ||
        $("hotels-container") ||
        $("hotels") ||
        document.querySelector(".hotel-results");

    HotelApp.wrapper = $("active-hotels-section-wrapper");

    if (!HotelApp.container) {
        console.log("Hotels: no hotel container on this page.");
        return;
    }

    HotelApp.destination = getDestinationFromURL();

    if (!HotelApp.destination) {
        console.log("Hotels: no destination selected.");
        return;
    }

    if (HotelApp.wrapper) {
        HotelApp.wrapper.style.display = "block";
    }

    showLoading();

    try {
        await loadHotels();
        const hotels = getHotelsForDestination(HotelApp.destination);
        renderHotels(hotels);
    } catch (error) {
        console.error("Hotels loading error:", error);
        showError(error.message || "Unable to load hotels.");
    }
}

document.addEventListener("DOMContentLoaded", initializeHotels);
