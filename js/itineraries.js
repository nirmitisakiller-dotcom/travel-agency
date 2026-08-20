// ==========================================
// Nature Tours International Itineraries
// ==========================================

"use strict";

const INTERNATIONAL_ITINERARIES = [
    {
        id: "paris-5-day-classic",
        destination: "Paris",
        country: "France",
        duration: "5 Days / 4 Nights",
        style: "Classic Europe",
        budget: "Custom quote",
        image: "assets/paris.jpg",
        highlights: ["Eiffel Tower", "Louvre Museum", "Seine cruise", "Versailles", "Montmartre"],
        days: [
            "Arrival, hotel check-in and evening Seine-side orientation.",
            "Eiffel Tower, Trocadéro and a relaxed Paris city circuit.",
            "Louvre Museum, historic centre and Seine cruise.",
            "Versailles day excursion followed by Montmartre and Sacré-Cœur.",
            "Free morning for shopping or cafés, then departure."
        ]
    },
    {
        id: "maldives-4-day-escape",
        destination: "Maldives",
        country: "Maldives",
        duration: "4 Days / 3 Nights",
        style: "Beach Escape",
        budget: "Custom quote",
        image: "assets/maldives.jpg",
        highlights: ["Resort stay", "Lagoon time", "Island excursion", "Sunset experience", "Leisure"],
        days: [
            "Airport transfer, resort check-in and sunset leisure.",
            "Full resort day with lagoon activities and optional water sports.",
            "Island or reef excursion with an optional sunset experience.",
            "Breakfast, relaxed morning and transfer for departure."
        ]
    },
    {
        id: "tokyo-6-day-discovery",
        destination: "Tokyo",
        country: "Japan",
        duration: "6 Days / 5 Nights",
        style: "City Discovery",
        budget: "Custom quote",
        image: "assets/tokyo.jpg",
        highlights: ["Shibuya", "Asakusa", "Tokyo Skytree", "Meiji Shrine", "Day excursion"],
        days: [
            "Arrival, hotel check-in and evening walk around Shibuya.",
            "Meiji Shrine, Harajuku and Omotesando.",
            "Asakusa, Senso-ji, Tokyo Skytree and riverside sights.",
            "Central Tokyo exploration with shopping and food experiences.",
            "Flexible day for a customised excursion or nearby destination.",
            "Breakfast, last-minute shopping and departure."
        ]
    },
    {
        id: "singapore-4-day-city",
        destination: "Singapore",
        country: "Singapore",
        duration: "4 Days / 3 Nights",
        style: "Family & City",
        budget: "Custom quote",
        image: "assets/singapore.jpg",
        highlights: ["Marina Bay", "Gardens by the Bay", "Sentosa", "Little India", "Night views"],
        days: [
            "Arrival, hotel check-in and Marina Bay evening circuit.",
            "Gardens by the Bay, Merlion area and city highlights.",
            "Sentosa day with flexible attractions and leisure time.",
            "Little India or shopping time, then departure."
        ]
    },
    {
        id: "bali-5-day-island",
        destination: "Bali",
        country: "Indonesia",
        duration: "5 Days / 4 Nights",
        style: "Island Escape",
        budget: "Custom quote",
        image: "assets/bali.jpg",
        highlights: ["Ubud", "Temples", "Rice terraces", "Beach time", "Sunset"],
        days: [
            "Arrival and transfer to hotel with relaxed evening.",
            "Ubud, rice terraces, local arts and cultural sights.",
            "Temple circuit and scenic island viewpoints.",
            "Beach leisure with optional water activities or sunset experience.",
            "Breakfast, free time and departure."
        ]
    },
    {
        id: "bhutan-6-day-culture",
        destination: "Bhutan",
        country: "Bhutan",
        duration: "6 Days / 5 Nights",
        style: "Culture & Mountains",
        budget: "Custom quote",
        image: "assets/bhutan.jpg",
        highlights: ["Thimphu", "Punakha", "Paro", "Monasteries", "Mountain views"],
        days: [
            "Arrival in Paro and transfer to Thimphu.",
            "Thimphu cultural sightseeing and local markets.",
            "Scenic drive to Punakha and valley exploration.",
            "Return toward Paro with monastery and heritage stops.",
            "Paro sightseeing and optional hike or leisure day.",
            "Breakfast and departure."
        ]
    }
];

function itineraryWhatsAppLink(plan) {
    const message = encodeURIComponent(
`Hello Nature Tours,

I am interested in this sample itinerary:

🌍 Destination: ${plan.destination}, ${plan.country}
🗓️ Duration: ${plan.duration}
🎒 Style: ${plan.style}

Please send me the customised version for my travel dates, budget and number of travellers.

Thank you.`
    );

    return `https://wa.me/919822339466?text=${message}`;
}

function itinerarySafe(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderItineraries() {
    const grid = document.getElementById("itinerary-grid");
    if (!grid) return;

    const plans = [...INTERNATIONAL_ITINERARIES];

    grid.innerHTML = plans.map(plan => `
        <article class="itinerary-card">
            <div class="itinerary-image-wrap">
                <img src="${itinerarySafe(plan.image)}" alt="${itinerarySafe(plan.destination)} sample itinerary" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/1000x650?text=${encodeURIComponent(plan.destination)}';">
                <span class="itinerary-duration">${itinerarySafe(plan.duration)}</span>
            </div>
            <div class="itinerary-content">
                <div class="itinerary-topline">
                    <span class="itinerary-style">${itinerarySafe(plan.style)}</span>
                    <span class="itinerary-price">${itinerarySafe(plan.budget)}</span>
                </div>
                <h3>${itinerarySafe(plan.destination)}, ${itinerarySafe(plan.country)}</h3>
                <div class="itinerary-highlights">
                    ${plan.highlights.map(item => `<span>✓ ${itinerarySafe(item)}</span>`).join("")}
                </div>
                <details class="itinerary-details">
                    <summary>View day-by-day plan</summary>
                    <ol>
                        ${plan.days.map((day, index) => `<li><strong>Day ${index + 1}:</strong> ${itinerarySafe(day)}</li>`).join("")}
                    </ol>
                </details>
                <div class="itinerary-actions">
                    <a class="itinerary-primary" href="${itineraryWhatsAppLink(plan)}" target="_blank" rel="noopener noreferrer">Get This Plan</a>
                    <button class="itinerary-secondary" type="button" data-itinerary-id="${itinerarySafe(plan.id)}">Add to Plan</button>
                </div>
            </div>
        </article>
    `).join("");

    grid.querySelectorAll(".itinerary-secondary").forEach(button => {
        button.addEventListener("click", () => {
            const plan = INTERNATIONAL_ITINERARIES.find(item => item.id === button.dataset.itineraryId);
            if (!plan) return;

            const existing = JSON.parse(localStorage.getItem("natureToursPlanCart") || "[]");
            if (!existing.some(item => item.id === plan.id)) {
                existing.push({ id: plan.id, destination: plan.destination, country: plan.country, duration: plan.duration, style: plan.style });
                localStorage.setItem("natureToursPlanCart", JSON.stringify(existing));
                button.textContent = "✓ Added to Plan";
            } else {
                button.textContent = "✓ Already Added";
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", renderItineraries);
