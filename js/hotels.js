// ==========================================
// Nature Tours Hotels
// Version 2.0
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

    apiBase: window.API_BASE || "",

    whatsappNumber: "919999999999"

};

// ------------------------------------------
// DOM Helpers
// ------------------------------------------

function $(id) {

    return document.getElementById(id);

}

function createElement(tag, className = "") {

    const element = document.createElement(tag);

    if (className) {

        element.className = className;

    }

    return element;

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
// Utility Functions
// ------------------------------------------

function formatPrice(price) {

    if (!price) return "Price unavailable";

    return "₹" + Number(price).toLocaleString("en-IN");

}

function escapeHtml(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
// ------------------------------------------
// Loading UI
// ------------------------------------------

function showLoading(message = "Searching hotels...") {

    if (!HotelApp.container) return;

    HotelApp.loading = true;

    HotelApp.container.innerHTML = `
        <div class="loading-section">

            <div class="loading-spinner"></div>

            <h2>${message}</h2>

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

// ------------------------------------------
// Destination Helpers
// ------------------------------------------

function getDestinationFromURL() {

    const params = new URLSearchParams(window.location.search);

    return (
        params.get("q") ||
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

    const search = destinationName.toLowerCase();

    return HotelApp.hotels.filter(hotel =>

        hotel.destinationId.toLowerCase() === search ||

        hotel.name.toLowerCase().includes(search)

    );

}
// ------------------------------------------
// Star Rating
// ------------------------------------------

function renderStars(rating = 0) {

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        stars += i <= rating ? "★" : "☆";

    }

    return stars;

}

// ------------------------------------------
// Google Maps
// ------------------------------------------

function getGoogleMapsLink(hotel) {

    const query = encodeURIComponent(

        `${hotel.name} ${hotel.address}`

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

🏨 ${hotel.name}

📍 ${hotel.address}

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

            alt="${escapeHtml(hotel.name)}"

            loading="lazy"

            onerror="this.src='https://placehold.co/600x400?text=Hotel';"

        >

        <div class="hotel-content">

            <h2>

                ${escapeHtml(hotel.name)}

            </h2>

            <div class="hotel-rating">

                ${renderStars(hotel.rating)}

                <span>

                    ${hotel.rating}/5

                </span>

            </div>

            <p class="hotel-address">

                📍 ${escapeHtml(hotel.address)}

            </p>

            <p class="hotel-price">

                ${formatPrice(hotel.price)}

                <small>/ night</small>

            </p>

            <div class="hotel-amenities">

                ${

                    (hotel.amenities || [])

                        .map(a => `<span>${escapeHtml(a)}</span>`)

                        .join("")

                }

            </div>

            <div class="hotel-buttons">

                <a

                    class="hotel-btn"

                    href="${hotel.bookingUrl || "#"}"

                    target="_blank"

                >

                    Book Now

                </a>

                <a

                    class="hotel-btn"

                    href="${getGoogleMapsLink(hotel)}"

                    target="_blank"

                >

                    Google Maps

                </a>

                <a

                    class="hotel-btn"

                    href="${getWhatsAppLink(hotel)}"

                    target="_blank"

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

        showEmpty("No hotels available for this destination.");

        return;

    }

    HotelApp.container.innerHTML = `

        <section class="hotel-results">

            <h1 class="hotel-page-title">

                Hotels in ${escapeHtml(HotelApp.destination)}

            </h1>

            <div class="hotel-grid">

                ${hotels.map(createHotelCard).join("")}

            </div>

        </section>

    `;

}

// ------------------------------------------
// Main Loader
// ------------------------------------------

async function initializeHotels() {

    HotelApp.container =

        document.getElementById("hotel-results") ||

        document.getElementById("hotels-container") ||

        document.getElementById("hotels") ||

        document.querySelector(".hotel-results") ||

        document.querySelector("main");

    if (!HotelApp.container) {

        console.error("Hotel container not found.");

        return;

    }

    HotelApp.destination = getDestinationFromURL();

    if (!HotelApp.destination) {

        showError("No destination selected.");

        return;

    }

    showLoading();

    try {

        await loadHotels();

        const hotels = getHotelsForDestination(

            HotelApp.destination

        );

        renderHotels(hotels);

    }

    catch (error) {

        console.error(error);

        showError(error.message);

    }

}

// ------------------------------------------
// Start Application
// ------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    initializeHotels

);
