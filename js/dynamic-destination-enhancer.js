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

    function renderDetails(destination) {
        const details = document.querySelector("#destination-page .destination-details");
        if (!details) return;

        const currency = destination.currencyName
            ? `${destination.currencyName}${destination.currencySymbol ? ` (${destination.currencySymbol})` : ""}`
            : destination.currency || "Not available";

        const items = [
            ["Region", destination.region || "Not available"],
            ["Airport", destination.airport ? String(destination.airport).split(",")[0] : "Not available"],
            ["Currency", currency],
            ["Language", destination.language || "Not available"],
            ["Timezone", destination.timezone || "Not available"],
            ["Capital", destination.capital || "Not available"],
            ["Continent", destination.continent || "Not available"],
            ["Population", Number(destination.population || 0).toLocaleString("en-IN") || "Not available"]
        ];

        details.innerHTML = items.map(([label, value]) => `
            <p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>
        `).join("");
    }

    function renderAttractions(destination) {
        const existing = document.querySelector("#destination-page .dynamic-attraction-section");
        if (existing) return;

        const attractions = Array.isArray(destination.dynamicAttractions)
            ? destination.dynamicAttractions
            : [];

        if (!attractions.length) return;

        const section = document.createElement("section");
        section.className = "attraction-section dynamic-attraction-section";
        section.innerHTML = `
            <h2 class="hotel-section-title">Top Attractions</h2>
            <div class="hotel-grid">
                ${attractions.map(item => `
                    <div class="hotel-card">
                        <img
                            class="hotel-photo"
                            src="${escapeHtml(item.image || destination.image || "https://placehold.co/800x500?text=Attraction")}" 
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
                `).join("")}
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

    function enhance() {
        const destination = getDynamicDestination();
        if (!destination) return false;

        renderDetails(destination);
        renderAttractions(destination);
        renderStayEnquiry(destination);

        const note = document.querySelector("#destination-page .dynamic-destination-note");
        if (!note) {
            const p = document.createElement("p");
            p.className = "dynamic-destination-note";
            p.textContent = "Destination information and attractions are dynamically discovered from live reference data.";
            p.style.cssText = "margin:12px 0 0;font-size:12px;opacity:.7;";
            document.getElementById("destination-page")?.appendChild(p);
        }

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
