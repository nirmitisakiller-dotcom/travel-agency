// ==========================================
// Nature Tours Autocomplete Engine
// ==========================================

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const input = document.getElementById("search-input");
    const box = document.getElementById("search-suggestions");

    if (!input || !box) return;

    try {
        await window.DestinationEngine.load();
    } catch (error) {
        console.warn("Autocomplete: local destination database unavailable.", error);
    }

    const destinations =
        Array.isArray(window.DestinationEngine?.destinations)
            ? window.DestinationEngine.destinations
            : [];

    function hideBox() {
        box.style.display = "none";
        box.innerHTML = "";
    }

    function openDestination(destination) {
        if (!destination) return;

        if (destination.id) {
            localStorage.setItem("natureToursDestination", destination.id);
            localStorage.removeItem("natureToursDynamicDestination");
            window.location.href =
                "destination.html?id=" + encodeURIComponent(destination.id);
            return;
        }

        window.location.href =
            "destination.html?q=" + encodeURIComponent(destination.name || "");
    }

    function createRow(item) {
        const row = document.createElement("div");
        row.className = "search-item";

        const title = document.createElement("div");
        title.className = "search-title";
        title.textContent = `📍 ${item.name || "Destination"}`;

        const subtitle = document.createElement("div");
        subtitle.className = "search-subtitle";
        subtitle.textContent = [item.continent, item.country]
            .filter(Boolean)
            .join(" → ");

        row.appendChild(title);
        row.appendChild(subtitle);

        row.addEventListener("mousedown", event => event.preventDefault());
        row.addEventListener("click", () => {
            input.value = item.name || "";
            hideBox();
            openDestination(item);
        });

        return row;
    }

    function showLocalResults(search) {
        if (search.length < 1) {
            hideBox();
            return false;
        }

        const matches = destinations
            .filter(item => {
                const name = String(item.name || "").toLowerCase();
                const country = String(item.country || "").toLowerCase();
                const region = String(item.region || "").toLowerCase();

                return name.includes(search) ||
                    country.includes(search) ||
                    region.includes(search);
            })
            .slice(0, 8);

        box.innerHTML = "";

        if (!matches.length) {
            hideBox();
            return false;
        }

        matches.forEach(item => box.appendChild(createRow(item)));
        box.style.display = "block";
        return true;
    }

    async function searchDynamic(search) {
        try {
            if (!window.API?.url || !window.API?.key) return;

            const functionUrl =
                `${window.API.url.replace("/rest/v1", "")}/functions/v1/search-destination`;

            const response = await fetch(
                `${functionUrl}?q=${encodeURIComponent(search)}`,
                {
                    method: "GET",
                    headers: {
                        apikey: window.API.key,
                        Authorization: `Bearer ${window.API.key}`
                    }
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            if (input.value.trim().toLowerCase() !== search) return;

            const results = Array.isArray(data.results)
                ? data.results.slice(0, 5)
                : [];

            if (!results.length) return;

            box.innerHTML = "";

            results.forEach(result => {
                box.appendChild(createRow({
                    id: result.id,
                    name: result.name,
                    country: result.country,
                    continent: result.continent
                }));
            });

            box.style.display = "block";
        } catch (error) {
            console.warn("Autocomplete dynamic search failed.", error);
        }
    }

    let dynamicTimer = null;

    input.addEventListener("input", () => {
        const search = input.value.trim().toLowerCase();

        if (dynamicTimer) {
            clearTimeout(dynamicTimer);
            dynamicTimer = null;
        }

        // Local matches are instant, so "pa" immediately suggests Paris.
        const hasLocal = showLocalResults(search);

        if (!hasLocal && search.length >= 2) {
            dynamicTimer = setTimeout(() => searchDynamic(search), 250);
        }
    });

    document.addEventListener("click", event => {
        if (!box.contains(event.target) && event.target !== input) {
            hideBox();
        }
    });

});
