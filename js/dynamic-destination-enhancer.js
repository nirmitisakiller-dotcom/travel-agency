// ==========================================
// Nature Tours Dynamic Destination Enhancer
// ==========================================

"use strict";

const DYNAMIC_CLIENT_WHATSAPP = "919822339466";

(function () {
    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getDynamicDestination() {
        try {
            const saved = localStorage.getItem("natureToursDynamicDestination");
            if (!saved) return null;
            const data = JSON.parse(saved);
            return data && data.dynamic ? data : null;
        } catch (_) {
            return null;
        }
    }

    function getEnquiryLink(destination) {
        const message = encodeURIComponent(
`Hello Nature Tours,

I would like to enquire about a trip to:

🌍 Destination: ${destination.name || ""}
📍 Country: ${destination.country || ""}

Please help me with available hotels, packages, prices and travel options.

Thank you.`
        );

        return `https://wa.me/${DYNAMIC_CLIENT_WHATSAPP}?text=${message}`;
    }

    function firstUseful(...values) {
        return values.find(value => {
            if (value === null || value === undefined) return false;
            return String(value).trim() !== "";
        }) || "";
    }

    function renderDetails(destination) {
        const details = document.querySelector("#destination-page .destination-details");
        if (!details) return;

        const currency = destination.currencyName
            ? `${destination.currencyName}${destination.currencySymbol ? ` (${destination.currencySymbol})` : ""}`
            : firstUseful(destination.currency, "Not available");

        const population = Number(destination.population || 0);

        const items = [
            ["Country", firstUseful(destination.country, "Not available")],
            ["Region", firstUseful(destination.region, "Not available")],
            ["Capital", firstUseful(destination.capital, "Not available")],
            ["Continent", firstUseful(destination.continent, "Not available")],
            ["Airport", destination.airport ? String(destination.airport).split(",")[0] : "Not available"],
            ["Currency", currency],
            ["Language", firstUseful(destination.language, Array.isArray(destination.languages) ? destination.languages.join(", ") : "", "Not available")],
            ["Timezone", firstUseful(destination.timezone, Array.isArray(destination.timezones) ? destination.timezones[0] : "", "Not available")]
        ];

        if (population > 0) {
            items.push(["Population", population.toLocaleString("en-IN")]);
        }

        details.innerHTML = items.map(([label, value]) => `
            <p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>
        `).join("");
    }

    function renderAttractions(destination) {
        const existing = document.querySelector("#destination-page .dynamic-attraction-section");
        if (existing) return;

        const rawAttractions = Array.isArray(destination.dynamicAttractions)
            ? destination.dynamicAttractions
            : [];

        const seen = new Set();
        const attractions = rawAttractions.filter(item => {
            const key = String(item?.name || "").trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 5);

        if (!attractions.length) {
            const page = document.getElementById("destination-page");
            if (page && !page.querySelector(".dynamic-attraction-empty")) {
                const section = document.createElement("section");
                section.className = "attraction-section dynamic-attraction-empty";
                section.innerHTML = `
                    <h2 class="hotel-section-title">Top Attractions</h2>
                    <div class="glance-card" style="text-align:center;">
                        <p>Attraction information is being prepared for this destination.</p>
                    </div>
                `;
                page.appendChild(section);
            }
            return;
        }

        const section = document.createElement("section");
        section.className = "attraction-section dynamic-attraction-section";
        section.innerHTML = `
            <h2 class="hotel-section-title">Top Attractions</h2>
            <div class="hotel-grid">
                ${attractions.map(item => {
                    const image = firstUseful(
                        item.image,
                        destination.image,
                        "https://placehold.co/800x500?text=Attraction"
                    );

                    return `
                    <div class="hotel-card">
                        <img
                            class="hotel-photo"
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(item.name || "Attraction")}" 
                            loading="lazy"
                            onerror="this.onerror=null;this.src='https://placehold.co/800x500?text=Attraction';"
                        >
                        <div class="hotel-content">
                            <h3>${escapeHtml(item.name || "Attraction")}</h3>
                            <p>📍 ${escapeHtml(item.type || "Attraction")}</p>
                            <p>${escapeHtml(item.description || "Explore this destination highlight.")}</p>
                            ${item.price ? `<p class="hotel-price">${escapeHtml(item.price)}</p>` : ""}
                        </div>
                    </div>
                    `;
                }).join("")}
            </div>
        `;

        const page = document.getElementById("destination-page");
        if (page) page.appendChild(section);
    }

    function renderStayEnquiry(destination) {
        if (document.querySelector("#destination-page .dynamic-stay-enquiry")) return;

        const section = document.createElement("section");
        section.className = "hotel-section dynamic-stay-enquiry";
        section.innerHTML = `
            <div class="glance-card" style="text-align:center;">
                <h2>Plan Your Stay in ${escapeHtml(destination.name || "this destination")}</h2>
                <p>Tell our travel team where you want to stay and we'll help you find suitable hotels and options.</p>
                <a
                    class="hotel-btn"
                    href="${escapeHtml(getEnquiryLink(destination))}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Send Hotel Enquiry
                </a>
            </div>
        `;

        const page = document.getElementById("destination-page");
        if (page) page.appendChild(section);
    }

    function renderDynamicNote(destination) {
        const page = document.getElementById("destination-page");
        if (!page || page.querySelector(".dynamic-destination-note")) return;

        const note = document.createElement("p");
        note.className = "dynamic-destination-note";
        note.textContent = destination.engineVersion
            ? `Dynamic destination data • Engine ${destination.engineVersion}`
            : "Destination information and attractions are dynamically discovered from live reference data.";
        note.style.cssText = "margin:12px 0 0;font-size:12px;opacity:.7;text-align:center;";
        page.appendChild(note);
    }

    function enhance() {
        const destination = getDynamicDestination();
        if (!destination) return false;

        renderDetails(destination);
        renderAttractions(destination);
        renderStayEnquiry(destination);
        renderDynamicNote(destination);

        return true;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById("destination-page");
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (enhance()) observer.disconnect();
        });

        observer.observe(container, { childList: true, subtree: true });
        setTimeout(enhance, 500);
        setTimeout(enhance, 1500);
        setTimeout(enhance, 3000);
    });
})();
