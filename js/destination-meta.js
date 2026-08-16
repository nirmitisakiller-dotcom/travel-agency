// ==========================================
// Nature Tours Dynamic Destination Metadata
// ==========================================

"use strict";

(function () {

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getDestinationData() {

        const saved = localStorage.getItem(
            "natureToursDynamicDestination"
        );

        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data && typeof data === "object") {
                    return data;
                }
            } catch (_) {}
        }

        return null;
    }

    function formatPopulation(population) {

        const value = Number(population || 0);

        if (!value) {
            return "Not available";
        }

        return value.toLocaleString("en-IN");
    }

    function buildMetadata(destination) {

        if (!destination) return null;

        const details = document.querySelector(
            "#destination-page .destination-details"
        );

        if (!details) return null;

        // Prevent duplicate rendering.
        if (details.dataset.richMetadata === "true") {
            return true;
        }

        const items = [
            ["Region", destination.region],
            [
                "Airport",
                destination.airport
                    ? String(destination.airport).split(",")[0]
                    : "Not available"
            ],
            [
                "Currency",
                destination.currencyName
                    ? `${destination.currencyName}${destination.currencySymbol ? ` (${destination.currencySymbol})` : ""}`
                    : destination.currency || "Not available"
            ],
            [
                "Language",
                destination.language || "Not available"
            ],
            [
                "Timezone",
                destination.timezone || "Not available"
            ],
            [
                "Capital",
                destination.capital || "Not available"
            ],
            [
                "Continent",
                destination.continent || "Not available"
            ],
            [
                "Population",
                formatPopulation(destination.population)
            ]
        ];

        const existingText = details.textContent.toLowerCase();
        const needsReplacement =
            existingText.includes("airport:") ||
            existingText.includes("currency:");

        if (needsReplacement) {
            details.innerHTML = items.map(([label, value]) => `
                <p>
                    <strong>${escapeHtml(label)}:</strong>
                    ${escapeHtml(value || "Not available")}
                </p>
            `).join("");
        }

        details.dataset.richMetadata = "true";

        // Add a compact source note for dynamically discovered data.
        if (!document.querySelector("#destination-page .destination-data-note")) {
            const note = document.createElement("p");
            note.className = "destination-data-note";
            note.textContent = "Destination information is provided from live location and reference data.";
            note.style.cssText = "margin-top:12px;font-size:12px;opacity:.7;";
            details.parentElement?.appendChild(note);
        }

        return true;
    }

    function resolveStaticDestination() {

        try {
            if (
                window.DestinationEngine &&
                Array.isArray(window.DestinationEngine.destinations)
            ) {
                const id = new URLSearchParams(window.location.search).get("id");
                return window.DestinationEngine.destinations.find(
                    item => String(item.id) === String(id)
                ) || null;
            }
        } catch (_) {}

        return null;
    }

    function enhance() {

        const dynamic = getDestinationData();
        const destination = dynamic || resolveStaticDestination();

        if (!destination) return false;

        return buildMetadata(destination);
    }

    document.addEventListener("DOMContentLoaded", () => {

        const container = document.getElementById("destination-page");

        if (!container) return;

        const observer = new MutationObserver(() => {

            if (enhance()) {
                observer.disconnect();
            }

        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        // Also try after the destination engine finishes its async work.
        setTimeout(enhance, 500);
        setTimeout(enhance, 1500);
        setTimeout(enhance, 3000);

    });

})();
