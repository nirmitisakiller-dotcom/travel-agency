// ==========================================
// Nature Tours Search
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("header-search-form");
    const input = document.getElementById("search-input");

    if (!form || !input) return;

    // Load destination database once
    await window.DestinationEngine.load();

    // --------------------------------------
    // Search
    // --------------------------------------

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const query = input.value.trim();

        if (!query) {

            alert("Please enter a destination.");
            input.focus();
            return;

        }

        localStorage.setItem(
            "natureToursDestination",
            query
        );

        const match = await window.DestinationEngine.find(query);

        if (!match) {

            alert("Destination not found.");
            return;

        }

        // Open destination page directly
        window.location.href =
            "destination.html?id=" +
            encodeURIComponent(match.id);

    });

    // --------------------------------------
    // Simple Autocomplete
    // --------------------------------------

    const datalist = document.createElement("datalist");
    datalist.id = "destination-list";

    window.DestinationEngine.destinations.forEach(destination => {

        const option = document.createElement("option");
        option.value = destination.name;
        datalist.appendChild(option);

    });

    document.body.appendChild(datalist);

    input.setAttribute("list", "destination-list");

});
