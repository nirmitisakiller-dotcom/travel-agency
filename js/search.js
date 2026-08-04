// ==========================================
// Nature Tours Search
// ==========================================

window.Search = {

    async init() {

        const form = document.getElementById("header-search-form");
        const input = document.getElementById("search-input");

        if (!form || !input) {
            console.warn("Search form not found.");
            return;
        }

        await window.DestinationEngine.load();

        // -----------------------------
        // Autocomplete
        // -----------------------------

        const datalist = document.createElement("datalist");
        datalist.id = "destination-list";

        window.DestinationEngine.destinations.forEach(destination => {

            const option = document.createElement("option");
            option.value = destination.name;
            datalist.appendChild(option);

        });

        document.body.appendChild(datalist);
        input.setAttribute("list", "destination-list");

        // -----------------------------
        // Search Submit
        // -----------------------------

        form.addEventListener("submit", async function (e) {

            e.preventDefault();

            const query = input.value.trim();

            if (!query) {
                alert("Please enter a destination.");
                input.focus();
                return;
            }

            try {

                const destination =
                    await window.DestinationEngine.find(query);

                if (!destination) {
                    alert("Destination not found.");
                    return;
                }

                localStorage.setItem(
                    "natureToursDestination",
                    destination.id
                );

                window.location.href =
                    "destination.html?id=" +
                    encodeURIComponent(destination.id);

            } catch (err) {

                console.error(err);
                alert("Search failed.");

            }

        });

        console.log("Search initialized.");

    }

};
