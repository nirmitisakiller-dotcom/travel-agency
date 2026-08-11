// ==========================================
// Nature Tours Hotels
// Version 3.0
// ==========================================

"use strict";

// ------------------------------------------
// Configuration
// ------------------------------------------

const HotelApp = {

    hotels: [],

    destination: null,

    loading: false,

    container: null,

    wrapper: null,

    apiBase: window.API_BASE || "",

    whatsappNumber: "919999999999"

};

// ------------------------------------------
// DOM Helpers
// ------------------------------------------

function $(id) {

    return document.getElementById(id);

}

// ------------------------------------------
// Image Helper
// ------------------------------------------

function getHotelImage(id) {

    if (
        window.ImageService &&
        typeof window.ImageService.getHotelImage === "function"
    ) {

        return window.ImageService.getHotelImage(id);

    }

    return `assets/hotels/${id}.jpg`;

}

// ------------------------------------------
// Utility
// ------------------------------------------

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

// ------------------------------------------
// Loading
// ------------------------------------------

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

// ------------------------------------------
// Error
// ------------------------------------------

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

// ------------------------------------------
// Empty
// ------------------------------------------

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

// ------------------------------------------
// Destination
// ------------------------------------------

function getDestinationFromURL() {

    const params = new URLSearchParams(window.location.search);

    return (
        params.get("q") ||
        params.get("destination") ||
        localStorage.getItem("natureToursDestination") ||
        ""
    );

}

// ------------------------------------------
// Load Hotel Data
// ------------------------------------------

async function loadHotels() {

    const response = await fetch("data/hotels.json");

    if (!response.ok) {

        throw new Error("Unable to load hotel database.");

    }

    HotelApp.hotels = await response.json();

    return HotelApp.hotels;

}

// ------------------------------------------
// Filter Hotels
// ------------------------------------------

function getHotelsForDestination(destinationName) {

    if (!destinationName) return [];

    const search = destinationName.trim().toLowerCase();

    return HotelApp.hotels.filter(hotel => {

        const destinationId =
            String(hotel.destinationId || "").toLowerCase();

        const hotelName =
            String(hotel.name || "").toLowerCase();

        return (
            destinationId === search ||
            hotelName.includes(search)
        );

    });

}

// ------------------------------------------
// Stars
// ------------------------------------------

function renderStars(rating = 0) {

    let stars = "";

    const numericRating = Number(rating) || 0;

    for (let i = 1; i <= 5; i++) {

        stars += i <= numericRating ? "★" : "☆";

    }

    return stars;

}

// ------------------------------------------
// Google Maps
// ------------------------------------------

function getGoogleMapsLink(hotel) {

    const query = encodeURIComponent(
        `${hotel.name || ""} ${hotel.address || ""}`
    );

    return `https://www.google.com/maps/search/?api=1&query=${query}`;

}

// ------------------------------------------
// WhatsApp
// ------------------------------------------

function getWhatsAppLink(hotel) {

    const text = encodeURIComponent(
`Hello Nature Tours,

I'm interested in booking:

🏨 ${hotel.name || ""}

📍 ${hotel.address || ""}

Could you please provide more information?`
    );

    return `https://wa.me/${HotelApp.whatsappNumber}?text=${text}`;

}

// ------------------------------------------
// Hotel Card
// ------------------------------------------

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

                <h2>
                    ${escapeHtml(hotel.name || "Unnamed Hotel")}
                </h2>

                <div class="hotel-rating">

                    ${renderStars(hotel.rating)}

                    <span>
                        ${escapeHtml(String(hotel.rating || "N/A"))}/5
                    </span>

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
                        .map(
                            amenity =>
                                `<span>${escapeHtml(amenity)}</span>`
                        )
                        .join("")}

                </div>

                <div class="hotel-buttons">

                    <a
                        class="hotel-btn"
                        href="${hotel.bookingUrl || "#"}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Book Now
                    </a>

                    <a
                        class="hotel-btn"
                        href="${getGoogleMapsLink(hotel)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Google Maps
                    </a>

                    <a
                        class="hotel-btn"
                        href="${getWhatsAppLink(hotel)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        WhatsApp
                    </a>

                </div>

            </div>

        </div>

    `;

}

// ------------------------------------------
// Render Hotels
// ------------------------------------------

function renderHotels(hotels) {

    HotelApp.loading = false;

    if (!HotelApp.container) return;

    if (!hotels.length) {

        showEmpty(
            "No hotels available for this destination."
        );

        return;

    }

    HotelApp.container.innerHTML =
        hotels.map(createHotelCard).join("");

    const counter = $("hotel-results-counter");

    if (counter) {

        counter.textContent =
            `Showing ${hotels.length} verified hotel option${hotels.length === 1 ? "" : "s"}`;

    }

}

// ------------------------------------------
// Initialize
// ------------------------------------------

async function initializeHotels() {

    // --------------------------------------
    // Find the correct HTML container
    // --------------------------------------

    HotelApp.container =
        $("hotel-cards-target-grid") ||

        $("hotel-results") ||

        $("hotels-container") ||

        $("hotels") ||

        document.querySelector(".hotel-results");

    // --------------------------------------
    // Find wrapper
    // --------------------------------------

    HotelApp.wrapper =
        $("active-hotels-section-wrapper");

    // --------------------------------------
    // If this page has no hotel container,
    // simply do nothing.
    // --------------------------------------

    if (!HotelApp.container) {

        console.log(
            "Hotels: no hotel container on this page."
        );

        return;

    }

    // --------------------------------------
    // Get destination
    // --------------------------------------

    HotelApp.destination =
        getDestinationFromURL();

    if (!HotelApp.destination) {

        console.log(
            "Hotels: no destination selected."
        );

        return;

    }

    // --------------------------------------
    // Show loading
    // --------------------------------------

    if (HotelApp.wrapper) {

        HotelApp.wrapper.style.display = "block";

    }

    showLoading();

    // --------------------------------------
    // Load data
    // --------------------------------------

    try {

        await loadHotels();

        const hotels =
            getHotelsForDestination(
                HotelApp.destination
            );

        renderHotels(hotels);

    }

    catch (error) {

        console.error(
            "Hotels loading error:",
            error
        );

        showError(
            error.message ||
            "Unable to load hotels."
        );

    }

}

// ------------------------------------------
// Start
// ------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    initializeHotels
);
