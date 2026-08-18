// ==========================================
// Nature Tours SEO Metadata Enhancer
// ==========================================

"use strict";

(function () {
    const SITE = "https://nirmitisakiller-dotcom.github.io/travel-agency/";

    function setMeta(name, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("name", name);
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
    }

    function setProperty(property, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("property", property);
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
    }

    function setCanonical(url) {
        let tag = document.querySelector('link[rel="canonical"]');
        if (!tag) {
            tag = document.createElement("link");
            tag.setAttribute("rel", "canonical");
            document.head.appendChild(tag);
        }
        tag.setAttribute("href", url);
    }

    function apply(destination) {
        if (!destination) return;

        const name = destination.name || "Destination";
        const country = destination.country || "";
        const description = destination.description ||
            `Explore ${name}${country ? `, ${country}` : ""} with Nature Tours. Discover travel ideas, attractions, hotels and personalised trip planning.`;
        const title = `${name}${country ? `, ${country}` : ""} Travel Guide | Nature Tours`;
        const id = destination.id || "";
        const canonical = id
            ? `${SITE}destination.html?id=${encodeURIComponent(id)}`
            : `${SITE}destination.html`;

        document.title = title;
        setMeta("description", description.slice(0, 160));
        setMeta("robots", "index,follow,max-image-preview:large");
        setCanonical(canonical);

        setProperty("og:type", "website");
        setProperty("og:title", title);
        setProperty("og:description", description.slice(0, 200));
        setProperty("og:url", canonical);
        setProperty("og:site_name", "Nature Tours");
        setProperty("og:image", destination.image || `${SITE}logo.png`);

        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", title);
        setMeta("twitter:description", description.slice(0, 200));
        setMeta("twitter:image", destination.image || `${SITE}logo.png`);
    }

    function applyStatic() {
        const path = window.location.pathname.split("/").pop() || "index.html";
        const values = {
            "index.html": {
                title: "Nature Tours | Custom Travel Experiences & Holiday Planning",
                description: "Nature Tours creates customised domestic and international trips, hotel enquiries, destination ideas and personalised travel planning."
            },
            "domestic.html": {
                title: "Domestic Tour Packages in India | Nature Tours",
                description: "Explore custom India travel itineraries including Ladakh, Spiti, Hampi and Chhattisgarh with Nature Tours."
            },
            "international.html": {
                title: "International Tour Packages & Destinations | Nature Tours",
                description: "Discover international travel ideas, destinations and hotel options with Nature Tours, including Paris, Bali, Maldives, Singapore and Tokyo."
            },
            "continent.html": {
                title: "Explore Travel Destinations by Continent | Nature Tours",
                description: "Browse Nature Tours destinations by continent and discover travel ideas around the world."
            }
        };

        const current = values[path];
        if (!current) return;

        document.title = current.title;
        setMeta("description", current.description);
        setMeta("robots", "index,follow,max-image-preview:large");
        setCanonical(`${SITE}${path === "index.html" ? "" : path}`);
        setProperty("og:type", "website");
        setProperty("og:title", current.title);
        setProperty("og:description", current.description);
        setProperty("og:site_name", "Nature Tours");
        setProperty("og:url", `${SITE}${path === "index.html" ? "" : path}`);
        setProperty("og:image", `${SITE}logo.png`);
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", current.title);
        setMeta("twitter:description", current.description);
        setMeta("twitter:image", `${SITE}logo.png`);
    }

    document.addEventListener("DOMContentLoaded", () => {
        applyStatic();

        const dynamic = document.getElementById("destination-page");
        if (!dynamic) return;

        const tryDynamic = () => {
            try {
                const saved = localStorage.getItem("natureToursDynamicDestination");
                if (!saved) return;
                const data = JSON.parse(saved);
                if (data && data.dynamic) apply(data);
            } catch (_) {}
        };

        tryDynamic();
        setTimeout(tryDynamic, 700);
        setTimeout(tryDynamic, 1800);
    });
})();
