/* ==========================================
   Nature Tours - Universal Itinerary Engine
   One data-driven file for ALL destinations.
   ========================================== */
"use strict";

(function () {
    const PLANS = [
        { days: 2, nights: 1, title: "Quick Escape", factor: 1.00 },
        { days: 3, nights: 2, title: "Short Discovery", factor: 1.45 },
        { days: 5, nights: 4, title: "Complete Experience", factor: 2.15 },
        { days: 7, nights: 6, title: "Relaxed Explorer", factor: 2.85 }
    ];

    const ACTIVITIES = {
        beach: ["Sunrise or beach walk", "Main beach and coastal sightseeing", "Sunset by the sea and local dinner"],
        nightlife: ["Destination orientation", "Popular market and local neighbourhood", "Nightlife and evening entertainment"],
        mountains: ["Scenic mountain viewpoint", "Valley and mountain sightseeing", "Sunset viewpoint and local dinner"],
        adventure: ["Adventure briefing and easy warm-up", "Main outdoor adventure experience", "Relaxed evening after the activity"],
        heritage: ["Historic landmark orientation", "Major heritage site and museum", "Heritage quarter evening walk"],
        history: ["Old-town and historic centre", "Major monument and museum circuit", "Evening heritage walk"],
        culture: ["Local culture introduction", "Market, crafts and cultural district", "Traditional food experience"],
        wildlife: ["Nature orientation", "Wildlife excursion or safari", "Nature photography and relaxed evening"],
        safari: ["Safari briefing", "Main safari experience", "Forest-edge evening"],
        temples: ["Temple circuit", "Major temple and cultural landmark", "Evening ceremony or heritage walk"],
        spiritual: ["Spiritual landmark visit", "Pilgrimage and riverside circuit", "Evening prayer or ceremony"],
        yoga: ["Morning yoga and wellness", "Ashram/wellness experience", "Quiet evening by the river"],
        rafting: ["River orientation", "White-water rafting experience", "Riverside relaxation"],
        lake: ["Lakeside viewpoint", "Boat ride and lake circuit", "Sunset by the lake"],
        coffee: ["Coffee estate introduction", "Estate walk and tasting", "Plantation sunset"],
        wine: ["Vineyard orientation", "Winery tour and tasting", "Wine-country dinner"],
        city: ["City orientation", "Major city attractions and shopping", "City-light evening"],
        shopping: ["Local market orientation", "Shopping and neighbourhood exploration", "Evening market stroll"],
        food: ["Local breakfast and food walk", "Signature local food experience", "Dinner at a recommended restaurant"],
        trekking: ["Trek briefing and acclimatisation", "Main trek/day hike", "Recovery and scenic evening"],
        roadtrip: ["Scenic road journey", "Main road-trip excursion", "Sunset viewpoint stop"],
        honeymoon: ["Couple's scenic experience", "Private sightseeing and leisure", "Romantic sunset dinner"],
        family: ["Easy family-friendly orientation", "Main family sightseeing", "Relaxed evening activity"]
    };

    const FALLBACK = [
        "Arrive, check in and get oriented with the destination",
        "Explore the destination's principal sights and local experiences",
        "Enjoy a relaxed evening with local food and free time"
    ];

    const esc = value => String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;").replace(/'/g, "&#039;");

    function destinationId() {
        const p = new URLSearchParams(window.location.search);
        return (p.get("id") || p.get("destination") || p.get("name") || "").trim().toLowerCase();
    }

    async function loadDestination() {
        const id = destinationId();
        if (!id) return null;
        const response = await fetch(`data/destinations.json?itinerary=${Date.now()}`);
        if (!response.ok) throw new Error(`Destination data HTTP ${response.status}`);
        const list = await response.json();
        return list.find(d => String(d.id || "").toLowerCase() === id || String(d.name || "").toLowerCase() === id) || null;
    }

    function activitiesFor(destination) {
        const tags = Array.isArray(destination.tags) ? destination.tags.map(t => String(t).toLowerCase()) : [];
        return tags.reduce((found, tag) => found || ACTIVITIES[tag], null) || FALLBACK;
    }

    function dayPlan(destination, count) {
        const a = activitiesFor(destination);
        const name = destination.name || "the destination";
        const airport = destination.airport || "the nearest airport";
        return Array.from({ length: count }, (_, i) => {
            const day = i + 1;
            if (day === 1) return {
                day,
                morning: `Arrival via ${airport}, transfer and hotel check-in`,
                afternoon: a[0],
                evening: a[2]
            };
            if (day === count) return {
                day,
                morning: `Breakfast and final ${name} highlights`,
                afternoon: a[1],
                evening: "Departure transfer / onward journey"
            };
            return {
                day,
                morning: a[(day - 1) % 3],
                afternoon: a[day % 3],
                evening: a[(day + 1) % 3]
            };
        });
    }

    function price(destination, plan) {
        const tags = Array.isArray(destination.tags) ? destination.tags.map(t => String(t).toLowerCase()) : [];
        let base = 5500;
        if (tags.includes("honeymoon")) base += 2000;
        if (tags.includes("adventure") || tags.includes("safari") || tags.includes("rafting")) base += 1500;
        return Math.round((base * plan.factor) / 100) * 100;
    }

    function cartAdd(destination, plan) {
        const item = {
            type: "itinerary",
            id: `${destination.id}-${plan.days}d-${plan.nights}n`,
            destinationId: destination.id,
            destination: destination.name,
            duration: `${plan.days} Days / ${plan.nights} Night${plan.nights > 1 ? "s" : ""}`,
            title: plan.title,
            estimatedPrice: price(destination, plan),
            addedAt: new Date().toISOString()
        };
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem("natureToursPlanCart") || "[]"); } catch (_) {}
        if (!Array.isArray(cart)) cart = [];
        if (!cart.some(x => x.id === item.id)) cart.push(item);
        localStorage.setItem("natureToursPlanCart", JSON.stringify(cart));
        document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated"));
        return item;
    }

    function renderDestinationItineraries(destination) {
        let host = document.getElementById("destination-itineraries");
        if (!host) {
            host = document.createElement("section");
            host.id = "destination-itineraries";
            host.style.cssText = "max-width:1200px;margin:40px auto;padding:0 20px;";
            const anchor = document.getElementById("destination-page");
            if (anchor && anchor.parentElement) anchor.parentElement.appendChild(host);
            else document.body.appendChild(host);
        }

        host.innerHTML = `
            <div style="margin-bottom:24px">
                <div style="font-weight:800;color:#0f766e;letter-spacing:.08em;font-size:12px">PLAN YOUR STAY</div>
                <h2 style="margin:6px 0">Itineraries for ${esc(destination.name)}</h2>
                <p style="color:#64748b;margin:0">Choose a trip length and customise the plan for your travel dates.</p>
            </div>
            <div class="universal-itinerary-grid">
                ${PLANS.map((plan, index) => {
                    const days = dayPlan(destination, plan.days);
                    const estimated = price(destination, plan);
                    return `
                    <article class="universal-itinerary-card">
                        <span class="universal-itinerary-badge">${plan.days}D / ${plan.nights}N</span>
                        <h3>${esc(plan.title)}</h3>
                        <div class="universal-itinerary-days">
                            ${days.map(d => `<div class="universal-itinerary-day"><strong>Day ${d.day}</strong><p><b>Morning:</b> ${esc(d.morning)}</p><p><b>Afternoon:</b> ${esc(d.afternoon)}</p><p><b>Evening:</b> ${esc(d.evening)}</p></div>`).join("")}
                        </div>
                        <p><b>Estimated starting price:</b> ₹${estimated.toLocaleString("en-IN")} / person</p>
                        <button type="button" class="universal-itinerary-add" data-plan-index="${index}">Add itinerary to Plan Cart</button>
                    </article>`;
                }).join("")}
            </div>
        `;

        if (!document.getElementById("universal-itinerary-style")) {
            const style = document.createElement("style");
            style.id = "universal-itinerary-style";
            style.textContent = `
                .universal-itinerary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}
                .universal-itinerary-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:22px;box-shadow:0 8px 24px rgba(15,23,42,.07)}
                .universal-itinerary-badge{display:inline-block;background:#ecfdf5;color:#047857;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800}
                .universal-itinerary-card h3{margin:10px 0 14px}.universal-itinerary-day{border-top:1px solid #eef2f7;padding:11px 0}.universal-itinerary-day:first-child{border-top:0}.universal-itinerary-day p{margin:5px 0;color:#475569;font-size:13px;line-height:1.45}.universal-itinerary-day strong{color:#0f766e}
                .universal-itinerary-add{width:100%;border:0;border-radius:10px;padding:12px;background:#0f766e;color:#fff;font-weight:800;cursor:pointer}.universal-itinerary-add.added{background:#166534}
                @media(max-width:700px){.universal-itinerary-grid{grid-template-columns:1fr}}
            `;
            document.head.appendChild(style);
        }

        host.querySelectorAll(".universal-itinerary-add").forEach(button => button.addEventListener("click", () => {
            const plan = PLANS[Number(button.dataset.planIndex)];
            cartAdd(destination, plan);
            button.textContent = "Added to Plan Cart ✓";
            button.classList.add("added");
        }));
    }

    async function initDestinationPage() {
        const destinationPage = document.getElementById("destination-page");
        if (!destinationPage) return;
        try {
            const destination = await loadDestination();
            if (destination) renderDestinationItineraries(destination);
        } catch (error) {
            console.error("Universal itinerary engine failed:", error);
        }
    }

    /* Keep the existing international itinerary page working. */
    function renderInternationalGrid() {
        const grid = document.getElementById("itinerary-grid");
        if (!grid || window.location.pathname.includes("destination.html")) return;
        if (typeof window.INTERNATIONAL_ITINERARIES === "undefined") return;
    }

    window.NatureToursItineraries = { renderDestinationItineraries };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDestinationPage, { once: true });
    else initDestinationPage();
})();
