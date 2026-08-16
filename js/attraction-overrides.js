// ==========================================
// Nature Tours Attraction Overrides
// ==========================================

"use strict";

(function () {

    const MUMBAI_ATTRACTIONS = [
        {
            name: "Gateway of India",
            type: "Landmark",
            description: "Mumbai's iconic waterfront monument overlooking the Arabian Sea."
        },
        {
            name: "Marine Drive",
            type: "Scenic",
            description: "Famous seaside boulevard known for its bay views and evening skyline."
        },
        {
            name: "Chhatrapati Shivaji Maharaj Terminus",
            type: "Heritage",
            description: "UNESCO-listed historic railway terminus and one of Mumbai's architectural landmarks."
        },
        {
            name: "Elephanta Caves",
            type: "Heritage",
            description: "Rock-cut cave complex on Elephanta Island featuring historic sculptures and temples."
        },
        {
            name: "Sanjay Gandhi National Park",
            type: "Nature",
            description: "Large protected green space in Mumbai with forests, wildlife and Kanheri Caves."
        }
    ];

    function apply() {

        const destinationId =
            new URLSearchParams(window.location.search).get("id");

        if (String(destinationId).toLowerCase() !== "mumbai") {
            return true;
        }

        const section =
            document.querySelector("#destination-page .attraction-section");

        if (!section) {
            return false;
        }

        const cards = section.querySelectorAll(".hotel-card");

        if (!cards.length) {
            return false;
        }

        cards.forEach((card, index) => {

            const attraction = MUMBAI_ATTRACTIONS[index];
            if (!attraction) return;

            const title = card.querySelector("h3");
            const type = card.querySelector("p:nth-of-type(2)");
            const description = card.querySelector("p:nth-of-type(3)");
            const image = card.querySelector("img");

            if (title) title.textContent = attraction.name;
            if (type) type.textContent = `📍 ${attraction.type}`;
            if (description) description.textContent = attraction.description;

            if (image) {
                image.alt = `${attraction.name} attraction in Mumbai`;

                image.addEventListener("error", () => {
                    image.onerror = null;
                    image.src = "assets/destinations/mumbai.jpg";
                }, { once: true });
            }
        });

        return true;
    }

    document.addEventListener("DOMContentLoaded", () => {

        const container = document.getElementById("destination-page");
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (apply()) observer.disconnect();
        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        setTimeout(apply, 500);
        setTimeout(apply, 1500);
        setTimeout(apply, 3000);
    });

})();
